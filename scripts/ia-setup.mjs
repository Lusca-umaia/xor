#!/usr/bin/env node
// Prepara a IA local do Ambiente de Estudo em qualquer máquina.
//
//   npm run ia:setup              baixa os modelos, cria o xor-estudo e testa
//   npm run ia:setup -- --leve    modelo menor (máquina sem GPU ou com pouca memória)
//   npm run ia:setup -- --modelo=qwen3:8b   outro modelo base do Ollama
//   npm run ia:verificar          só confere, sem baixar nada
//
// Fala com o Ollama pela API HTTP (não depende do comando `ollama` no PATH).
// Lê LM_STUDIO_URL, LM_STUDIO_MODEL e EMBEDDING_MODEL do .env.local.

import { existsSync, readFileSync } from 'node:fs'
import { platform } from 'node:os'

// ---------- Configuração ----------

const MODELOS_BASE = {
  padrao: 'qwen3:4b-instruct-2507-q4_K_M', // ~2,5 GB; GPU com 4 GB ou mais
  leve: 'qwen2.5:1.5b' // ~1 GB; roda razoável só na CPU
}
const PARAMETROS = { num_ctx: 8192, temperature: 0.4 }
const DIMENSOES_EMBEDDING = 768

function lerEnv() {
  const env = {}
  for (const arquivo of ['.env', '.env.local']) {
    if (!existsSync(arquivo)) continue
    for (const linha of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
      const achado = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (achado) env[achado[1]] = achado[2].replace(/^["']|["']$/g, '')
    }
  }
  return { ...env, ...process.env }
}

const args = process.argv.slice(2)
const soVerificar = args.includes('--verificar')
const leve = args.includes('--leve')
const modeloBaseArg = args.find((a) => a.startsWith('--modelo='))?.split('=')[1]

const env = lerEnv()
const urlIa = (env.LM_STUDIO_URL || 'http://localhost:11434/v1').replace(
  /\/$/,
  ''
)
const urlOllama = urlIa.replace(/\/v1$/, '')
const modelo = env.LM_STUDIO_MODEL || 'xor-estudo'
const modeloEmbedding = env.EMBEDDING_MODEL || 'nomic-embed-text-v2-moe'
const modeloBase =
  modeloBaseArg || (leve ? MODELOS_BASE.leve : MODELOS_BASE.padrao)

// ---------- Saída ----------

const cor = (codigo) => (texto) =>
  process.stdout.isTTY ? `\x1b[${codigo}m${texto}\x1b[0m` : texto
const verde = cor(32)
const vermelho = cor(31)
const amarelo = cor(33)
const negrito = cor(1)
const ok = (msg) => console.log(`${verde('✔')} ${msg}`)
const falha = (msg) => console.log(`${vermelho('✖')} ${msg}`)
const aviso = (msg) => console.log(`${amarelo('!')} ${msg}`)
const passo = (msg) => console.log(`\n${negrito(msg)}`)

async function pedir(caminho, corpo, base = urlOllama) {
  const resposta = await fetch(base + caminho, {
    method: corpo ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(30 * 60_000)
  })
  if (!resposta.ok)
    throw new Error(
      `${caminho} respondeu ${resposta.status}: ${await resposta.text()}`
    )
  return resposta
}

// Lê respostas em linhas JSON (pull e create do Ollama) mostrando o progresso.
async function acompanhar(resposta, rotulo) {
  const leitor = resposta.body.getReader()
  const decodificador = new TextDecoder()
  let pendente = ''
  let ultimo = ''
  for (;;) {
    const { done, value } = await leitor.read()
    if (done) break
    pendente += decodificador.decode(value, { stream: true })
    const linhas = pendente.split('\n')
    pendente = linhas.pop() ?? ''
    for (const linha of linhas) {
      if (!linha.trim()) continue
      const evento = JSON.parse(linha)
      if (evento.error) throw new Error(evento.error)
      const pct =
        evento.total && evento.completed
          ? ` ${Math.floor((evento.completed / evento.total) * 100)}%`
          : ''
      const texto = `  ${rotulo}: ${evento.status ?? ''}${pct}`
      if (texto !== ultimo && process.stdout.isTTY) {
        process.stdout.write(`\r${texto.padEnd(70).slice(0, 70)}`)
        ultimo = texto
      }
    }
  }
  if (process.stdout.isTTY) process.stdout.write('\r'.padEnd(72) + '\r')
}

const instalados = async () =>
  ((await (await pedir('/api/tags')).json()).models ?? []).map((m) => m.name)

const temModelo = (lista, nome) =>
  lista.some((n) => n === nome || n === `${nome}:latest`)

async function baixar(nome) {
  if (temModelo(await instalados(), nome))
    return ok(`${nome} já está instalado`)
  console.log(`  Baixando ${nome} (só na primeira vez; pode demorar)...`)
  await acompanhar(
    await pedir('/api/pull', { model: nome, stream: true }),
    nome
  )
  ok(`${nome} baixado`)
}

function comoInstalarOllama() {
  const so = platform()
  console.log(
    '\n  Instale o Ollama e abra-o (ele fica rodando em segundo plano):'
  )
  if (so === 'win32')
    console.log(
      '    winget install Ollama.Ollama   (ou baixe em https://ollama.com/download)'
    )
  else if (so === 'darwin')
    console.log(
      '    brew install ollama && ollama serve   (ou baixe em https://ollama.com/download)'
    )
  else console.log('    curl -fsSL https://ollama.com/install.sh | sh')
  console.log(
    '  Ou, com Docker:  docker compose -f docker-compose.ia.yml up -d'
  )
  console.log('  Depois rode de novo:  npm run ia:setup')
}

// ---------- Testes ----------

async function testarChat() {
  const inicio = Date.now()
  const resposta = await pedir(
    '/chat/completions',
    {
      model: modelo,
      temperature: 0,
      messages: [
        { role: 'system', content: 'Responda somente com o JSON pedido.' },
        {
          role: 'user',
          content: 'Quanto é 2 + 3? Responda no campo "resultado".'
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'teste',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['resultado'],
            properties: { resultado: { type: 'integer' } }
          }
        }
      }
    },
    urlIa
  )
  const corpo = await resposta.json()
  const dados = JSON.parse(corpo.choices[0].message.content)
  if (dados.resultado !== 5)
    throw new Error(`resposta inesperada: ${JSON.stringify(dados)}`)
  return ((Date.now() - inicio) / 1000).toFixed(1)
}

async function testarEmbeddings() {
  const resposta = await pedir(
    '/embeddings',
    { model: modeloEmbedding, input: ['search_query: teste'] },
    urlIa
  )
  const vetor = (await resposta.json()).data?.[0]?.embedding ?? []
  if (vetor.length !== DIMENSOES_EMBEDDING)
    throw new Error(
      `o vetor tem ${vetor.length} dimensões; o banco espera ${DIMENSOES_EMBEDDING}`
    )
}

// ---------- Execução ----------

async function main() {
  console.log(
    negrito(soVerificar ? 'Verificando a IA local' : 'Preparando a IA local')
  )
  console.log(`  Servidor: ${urlIa}`)
  console.log(`  Modelo:   ${modelo}   Embeddings: ${modeloEmbedding}`)

  passo('1. Servidor')
  let ehOllama = true
  try {
    const { version } = await (await pedir('/api/version')).json()
    ok(`Ollama ${version} respondendo`)
  } catch {
    // Pode ser outro servidor compatível com a OpenAI (ex.: LM Studio).
    try {
      await pedir('/models', undefined, urlIa)
      ehOllama = false
      aviso(
        'O servidor responde, mas não é o Ollama: os modelos precisam ser carregados nele à mão.'
      )
    } catch {
      falha(`Nada respondendo em ${urlIa}`)
      comoInstalarOllama()
      process.exitCode = 1
      return
    }
  }

  if (ehOllama && !soVerificar) {
    passo('2. Modelos')
    await baixar(modeloBase)
    await baixar(modeloEmbedding)

    passo(`3. Criando o modelo ${modelo}`)
    await acompanhar(
      await pedir('/api/create', {
        model: modelo,
        from: modeloBase,
        parameters: PARAMETROS,
        stream: true
      }),
      modelo
    )
    ok(
      `${modelo} criado a partir de ${modeloBase} (contexto de ${PARAMETROS.num_ctx} tokens)`
    )
  } else if (ehOllama) {
    passo('2. Modelos')
    const lista = await instalados()
    for (const nome of [modelo, modeloEmbedding]) {
      if (temModelo(lista, nome)) ok(`${nome} instalado`)
      else falha(`${nome} não está instalado (rode npm run ia:setup)`)
    }
  }

  passo(soVerificar ? '3. Testes' : '4. Testes')
  let tudoCerto = true
  try {
    console.log(
      '  Testando o chat (a primeira chamada carrega o modelo na memória)...'
    )
    const segundos = await testarChat()
    ok(`Chat com saída em JSON funcionando (${segundos}s)`)
  } catch (erro) {
    tudoCerto = false
    falha(`Chat: ${erro.message}`)
  }
  try {
    await testarEmbeddings()
    ok(`Embeddings com ${DIMENSOES_EMBEDDING} dimensões (busca semântica)`)
  } catch (erro) {
    aviso(`Embeddings: ${erro.message}`)
    aviso(
      'Sem eles o app continua funcionando, mas a busca nos materiais usa só palavras.'
    )
  }

  if (!tudoCerto) {
    console.log(
      `\n${vermelho('A IA ainda não está pronta.')} Veja as mensagens acima.`
    )
    process.exitCode = 1
    return
  }

  console.log(`\n${verde('Tudo pronto.')} Confira o .env.local:`)
  console.log(`  LM_STUDIO_URL=${urlIa}`)
  console.log(`  LM_STUDIO_MODEL=${modelo}`)
  console.log(`  EMBEDDING_MODEL=${modeloEmbedding}`)
  console.log(
    'Se o servidor do Next já estava rodando, reinicie-o (npm run dev).'
  )
}

// exitCode em vez de process.exit(): no Windows, sair com requisições ainda
// abertas derruba o Node com um "Assertion failed" do libuv.
main().catch((erro) => {
  falha(erro.message)
  process.exitCode = 1
})
