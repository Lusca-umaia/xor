'use client'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { LuBookOpen, LuExternalLink } from 'react-icons/lu'
import type { DisciplinaCurriculo } from '@/@types/Academico'
import { LIVROS_ABERTOS, type TipoLicenca } from '@/services/mocks/livros'
import { Card, Explicacao } from '../../academico/components/Comuns'

interface Props {
  // Disciplinas em andamento do aluno, para destacar livros relacionados.
  ativas: DisciplinaCurriculo[]
}

const ROTULO_LICENCA: Record<TipoLicenca, { texto: string; classe: string }> = {
  ABERTA: {
    texto: 'Licença aberta',
    classe: 'bg-green-100 text-green-800'
  },
  RESTRITA: {
    texto: 'Gratuito, uso restrito',
    classe: 'bg-amber-100 text-amber-800'
  },
  GRATUITA: {
    texto: 'Gratuito, sem licença aberta',
    classe: 'bg-gray-100 text-gray-700'
  },
  NAO_VERIFICADA: {
    texto: 'Licença não verificada',
    classe: 'bg-red-100 text-red-800'
  }
}

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '')

const LivrosTab: React.FC<Props> = ({ ativas }) => {
  const [busca, setBusca] = useState('')
  const [soMinhas, setSoMinhas] = useState(false)
  const [soAbertos, setSoAbertos] = useState(false)
  const codigos = useMemo(() => new Set(ativas.map((d) => d.codigo)), [ativas])

  const livros = LIVROS_ABERTOS.filter((l) => {
    const termo = busca.trim().toLowerCase()
    const casa =
      !termo ||
      `${l.titulo} ${l.autores} ${l.area}`.toLowerCase().includes(termo)
    const minha = l.disciplinas.some((c) => codigos.has(c))
    return (
      casa &&
      (!soMinhas || minha) &&
      (!soAbertos || l.licenca.tipo === 'ABERTA')
    )
  })
  const abertos = LIVROS_ABERTOS.filter((l) => l.licenca.tipo === 'ABERTA')

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-base font-bold tracking-tight">
          Livros de acesso livre
        </h3>
        <p className="text-sm text-gray-600">
          Obras para ler de graça, com link para o site oficial do autor ou da
          instituição. O XOR não hospeda nem copia os livros: cada botão leva à
          fonte original.{' '}
          <strong>
            Gratuito não é o mesmo que aberto: só {abertos.length} de{' '}
            {LIVROS_ABERTOS.length} têm licença aberta confirmada.
          </strong>{' '}
          O selo de cada livro mostra o que a página oficial declarava.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            aria-label="Buscar livro"
            placeholder="Buscar por título, autor ou área"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full max-w-sm rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={soMinhas}
              onChange={(e) => setSoMinhas(e.target.checked)}
              className="size-4 accent-black"
            />
            Só das minhas disciplinas do semestre
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={soAbertos}
              onChange={(e) => setSoAbertos(e.target.checked)}
              className="size-4 accent-black"
            />
            Só com licença aberta
          </label>
        </div>
        <Explicacao titulo="O que significa cada selo?">
          <p>
            <strong>Licença aberta:</strong> licença como CC BY ou CC BY-SA, que
            permite reutilizar citando a autoria.
          </p>
          <p>
            <strong>Gratuito, uso restrito:</strong> licença com limites (por
            exemplo, sem uso comercial ou sem derivações).
          </p>
          <p>
            <strong>Gratuito, sem licença aberta:</strong> dá para ler de graça,
            mas a página não declara licença que permita reutilizar.
          </p>
          <p>
            <strong>Licença não verificada:</strong> não consegui confirmar.
            Veja os termos no site antes de copiar ou compartilhar.
          </p>
          <p>
            Seleção inicial feita pelo app, com links e licenças conferidos em
            29/10/2026. Os livros estão em inglês.
          </p>
        </Explicacao>
      </Card>

      {livros.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhum livro encontrado com esses filtros.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {livros.map((l) => {
            const minhas = l.disciplinas.filter((c) => codigos.has(c))
            const selo = ROTULO_LICENCA[l.licenca.tipo]
            return (
              <Card key={l.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-xor-navy/5 text-xl text-xor-navy">
                    <LuBookOpen />
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold leading-tight">{l.titulo}</h4>
                    <p className="text-xs text-gray-500">{l.autores}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                  <span
                    className={clsx('rounded-full px-2 py-0.5', selo.classe)}
                  >
                    {selo.texto}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                    {l.area}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                    {l.idioma}
                  </span>
                  {minhas.length > 0 && (
                    <span className="rounded-full bg-lime-100 px-2 py-0.5 text-lime-800">
                      Do seu semestre: {minhas.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{l.licenca.texto}</p>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex w-fit items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                >
                  Abrir em {host(l.url)} <LuExternalLink />
                </a>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LivrosTab
