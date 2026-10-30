'use client'
import { useMemo, useState } from 'react'
import { LuBookOpen, LuExternalLink } from 'react-icons/lu'
import type { DisciplinaCurriculo } from '@/@types/Academico'
import { LIVROS_ABERTOS } from '@/services/mocks/livros'
import { Card } from '../../academico/components/Comuns'

interface Props {
  // Disciplinas em andamento do aluno, para destacar livros relacionados.
  ativas: DisciplinaCurriculo[]
}

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '')

const LivrosTab: React.FC<Props> = ({ ativas }) => {
  const [busca, setBusca] = useState('')
  const [soMinhas, setSoMinhas] = useState(false)
  const codigos = useMemo(() => new Set(ativas.map((d) => d.codigo)), [ativas])

  const livros = LIVROS_ABERTOS.filter((l) => {
    const termo = busca.trim().toLowerCase()
    const casa =
      !termo ||
      `${l.titulo} ${l.autores} ${l.area}`.toLowerCase().includes(termo)
    const minha = l.disciplinas.some((c) => codigos.has(c))
    return casa && (!soMinhas || minha)
  })

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-base font-bold tracking-tight">Livros abertos</h3>
        <p className="text-sm text-gray-600">
          Obras de acesso gratuito, com link para o site oficial do autor ou da
          instituição. O XOR não hospeda nem copia os livros: cada botão leva à
          fonte original. Os termos de uso e a licença valem os do site oficial.
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
        </div>
        <p className="text-xs text-gray-500">
          Seleção inicial feita pelo app, com links conferidos em 29/10/2026. Os
          livros estão em inglês.
        </p>
      </Card>

      {livros.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhum livro encontrado com esses filtros.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {livros.map((l) => {
            const minhas = l.disciplinas.filter((c) => codigos.has(c))
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
