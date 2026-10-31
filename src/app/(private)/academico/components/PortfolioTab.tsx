'use client'
import clsx from 'clsx'
import { useState } from 'react'
import { LuAward, LuExternalLink, LuTrash2 } from 'react-icons/lu'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { CHAVES } from '@/services/academico/chaves'
import { useSincronizado } from '@/hooks/useSincronizado'
import { Card, Explicacao } from './Comuns'

type TipoItem =
  | 'PROJETO'
  | 'CERTIFICADO'
  | 'MONITORIA'
  | 'COMPLEMENTAR'
  | 'OUTRO'

interface ItemPortfolio {
  id: string
  tipo: TipoItem
  titulo: string
  descricao: string
  // YYYY-MM-DD
  data: string
  horas: number | null
  link: string | null
}

const TIPOS: Record<TipoItem, string> = {
  PROJETO: 'Projeto',
  CERTIFICADO: 'Certificado',
  MONITORIA: 'Monitoria',
  COMPLEMENTAR: 'Atividade complementar',
  OUTRO: 'Outro'
}

const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

// Só aceita links web; evita esquemas como javascript: em href.
const linkValido = (texto: string) => {
  try {
    const { protocol } = new URL(texto)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

const PortfolioTab: React.FC = () => {
  const [itens, setItens] = useSincronizado<ItemPortfolio[]>(
    CHAVES.portfolio,
    []
  )
  const [tipo, setTipo] = useState<TipoItem>('PROJETO')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [horas, setHoras] = useState('')
  const [link, setLink] = useState('')
  const [filtro, setFiltro] = useState<TipoItem | 'TODOS'>('TODOS')

  const linkOk = link.trim() === '' || linkValido(link.trim())
  const valido = titulo.trim() !== '' && data !== '' && linkOk

  const adicionar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    setItens((l) => [
      {
        id: crypto.randomUUID(),
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data,
        horas: horas === '' ? null : Math.max(0, Number(horas)),
        link: link.trim() || null
      },
      ...l
    ])
    setTitulo('')
    setDescricao('')
    setHoras('')
    setLink('')
  }

  const visiveis = itens
    .filter((i) => filtro === 'TODOS' || i.tipo === filtro)
    .sort((a, b) => b.data.localeCompare(a.data))
  const horasComplementares = itens
    .filter((i) => i.tipo === 'COMPLEMENTAR')
    .reduce((s, i) => s + (i.horas ?? 0), 0)

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-base font-bold tracking-tight">Novo registro</h3>
        <form onSubmit={adicionar} className="grid gap-2 md:grid-cols-6">
          <select
            aria-label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoItem)}
            className={clsx(campo, 'md:col-span-2')}
          >
            {Object.entries(TIPOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            aria-label="Título"
            placeholder="Título"
            value={titulo}
            maxLength={120}
            onChange={(e) => setTitulo(e.target.value)}
            className={clsx(campo, 'md:col-span-4')}
          />
          <input
            aria-label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          />
          <input
            aria-label="Carga horária"
            type="number"
            min={0}
            step={0.5}
            placeholder="Horas (opcional)"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          />
          <input
            aria-label="Link"
            placeholder="Link (repositório, certificado...)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={clsx(campo, 'md:col-span-2')}
          />
          <textarea
            aria-label="Descrição"
            placeholder="Descrição (opcional)"
            value={descricao}
            maxLength={500}
            rows={2}
            onChange={(e) => setDescricao(e.target.value)}
            className={clsx(campo, 'md:col-span-6')}
          />
          {!linkOk && (
            <p role="alert" className="text-sm text-red-600 md:col-span-6">
              O link precisa começar com http:// ou https://.
            </p>
          )}
          <button
            type="submit"
            disabled={!valido}
            className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 md:col-span-6 md:w-fit"
          >
            Adicionar
          </button>
        </form>
      </Card>

      {itens.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {(['TODOS', ...Object.keys(TIPOS)] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filtro === k}
                  onClick={() => setFiltro(k as TipoItem | 'TODOS')}
                  className={clsx(
                    'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                    filtro === k
                      ? 'bg-black text-white ring-black'
                      : 'bg-white text-gray-600 ring-gray-300 hover:bg-gray-50'
                  )}
                >
                  {k === 'TODOS' ? 'Todos' : TIPOS[k as TipoItem]}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Atividades complementares: <strong>{horasComplementares}h</strong>{' '}
              registradas
            </p>
          </div>
          <Explicacao titulo="Sobre as horas complementares">
            <p>
              É a soma das horas dos registros do tipo &quot;Atividade
              complementar&quot;. A matriz de CC 2024.1 lista o componente
              CCP0001 (Atividades Complementares) com 64h; quais atividades são
              aceitas e quantas horas valem é definido pelo PPC e pela
              coordenação. Este total é só um controle seu, não uma validação.
            </p>
          </Explicacao>
        </Card>
      )}

      {itens.length === 0 ? (
        <EstadoVazio
          icon={<LuAward />}
          titulo="Portfólio vazio"
          descricao="Registre projetos, certificados, monitorias e atividades complementares para ter tudo num só lugar."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visiveis.map((i) => (
            <Card key={i.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400">
                    {TIPOS[i.tipo]} · {i.data.split('-').reverse().join('/')}
                    {i.horas !== null && ` · ${i.horas}h`}
                  </p>
                  <h4 className="font-bold leading-tight">{i.titulo}</h4>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${i.titulo}`}
                  onClick={() =>
                    setItens((l) => l.filter((x) => x.id !== i.id))
                  }
                  className="cursor-pointer text-gray-400 hover:text-red-600"
                >
                  <LuTrash2 />
                </button>
              </div>
              {i.descricao && (
                <p className="text-sm whitespace-pre-line text-gray-600">
                  {i.descricao}
                </p>
              )}
              {i.link && (
                <a
                  href={i.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-xor-navy hover:underline"
                >
                  Abrir link <LuExternalLink />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PortfolioTab
