'use client'
import clsx from 'clsx'
import { Dispatch, SetStateAction } from 'react'
import type { Evento, Limites } from '@/@types/Academico'
import type { CargaSemana } from '@/utils/academico'
import { HORAS_REVISAO, INTERVALOS_REVISAO } from '@/utils/academico'
import { Card, Explicacao } from '../../academico/components/Comuns'

interface Props {
  carga: CargaSemana
  limites: Limites
  setLimites: Dispatch<SetStateAction<Limites>>
  revisoes: Evento[]
  onAdicionar: (evento: Evento) => void
}

const campo = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

const PainelSemana: React.FC<Props> = ({
  carga,
  limites,
  setLimites,
  revisoes,
  onAdicionar
}) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card>
      <h3 className="text-base font-bold tracking-tight">
        Carga da semana: {carga.horas}h · {carga.itens} entregas/provas
      </h3>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <label className="flex items-center gap-2">
          Limite de horas
          <input
            type="number"
            min={1}
            value={limites.horas}
            onChange={(e) =>
              setLimites((l) => ({
                ...l,
                horas: Math.max(1, Number(e.target.value))
              }))
            }
            className={clsx(campo, 'w-20')}
          />
        </label>
        <label className="flex items-center gap-2">
          Limite de entregas/provas
          <input
            type="number"
            min={1}
            value={limites.itens}
            onChange={(e) =>
              setLimites((l) => ({
                ...l,
                itens: Math.max(1, Number(e.target.value))
              }))
            }
            className={clsx(campo, 'w-20')}
          />
        </label>
      </div>
      <Explicacao titulo="Por que esta semana é (ou não) crítica?">
        <p>
          Horas = Σ horas das atividades pendentes com prazo na semana + Σ horas
          de dedicação dos eventos da semana. Itens = atividades pendentes +
          provas.
        </p>
        <p>
          Fica crítica se as horas passam do limite ou se os itens chegam ao
          limite. Os limites iniciais ({limites.horas}h e {limites.itens} itens)
          são uma <strong>heurística do app, sem validação científica</strong>;
          ajuste ao seu ritmo.
        </p>
      </Explicacao>
    </Card>

    <Card>
      <h3 className="text-base font-bold tracking-tight">
        Revisão espaçada sugerida
      </h3>
      {revisoes.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma sugestão pendente. Cadastre uma prova futura para receber
          revisões.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {revisoes.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <span>
                {r.data.split('-').reverse().slice(0, 2).join('/')} · {r.inicio}{' '}
                · {r.titulo}
              </span>
              <button
                type="button"
                onClick={() => onAdicionar(r)}
                className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-xor-navy ring-1 ring-inset ring-xor-navy/30 hover:bg-gray-50"
              >
                Adicionar
              </button>
            </li>
          ))}
        </ul>
      )}
      <Explicacao>
        <p>
          Para cada prova futura, o app sugere revisões{' '}
          {INTERVALOS_REVISAO.join(', ')} dias antes, de {HORAS_REVISAO}h cada.
          É uma regra fixa inspirada em revisão espaçada, sem personalização nem
          comprovação de eficácia.
        </p>
      </Explicacao>
    </Card>
  </div>
)

export default PainelSemana
