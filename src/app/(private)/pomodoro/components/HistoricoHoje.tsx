import { LuCircleCheck, LuHistory, LuTrash2 } from 'react-icons/lu'
import type { SessaoFoco } from '@/@types/Pomodoro'
import { formatarDuracao } from '../consts'

interface HistoricoHojeProps {
  sessoes: SessaoFoco[]
  nomeDisciplina: (id: number | null) => string
  onExcluir: (id: number) => void
  excluindo: boolean
}

const formatarHora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

const HistoricoHoje: React.FC<HistoricoHojeProps> = ({
  sessoes,
  nomeDisciplina,
  onExcluir,
  excluindo
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 max-md:p-4 space-y-4">
    <span className="flex items-center gap-2 text-base font-bold tracking-tight">
      <LuHistory className="text-xor-navy" />
      Sessões de hoje
    </span>

    {sessoes.length === 0 ? (
      <p className="text-sm text-gray-500">
        Nenhum pomodoro hoje ainda. O primeiro é o mais difícil, depois flui.
      </p>
    ) : (
      <ul className="divide-y divide-gray-100">
        {sessoes.map((sessao) => (
          <li key={sessao.id} className="group flex items-start gap-3 py-2.5">
            <LuCircleCheck className="mt-0.5 shrink-0 text-lg text-emerald-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {sessao.tarefa ?? 'Sessão de foco'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {formatarHora(sessao.iniciadaEm)} ·{' '}
                {formatarDuracao(sessao.duracaoSegundos)} ·{' '}
                {nomeDisciplina(sessao.disciplinaId)}
              </p>
            </div>
            <button
              type="button"
              disabled={excluindo}
              onClick={() => {
                if (window.confirm('Remover esta sessão do histórico?')) {
                  onExcluir(sessao.id)
                }
              }}
              className="shrink-0 cursor-pointer rounded-md p-1 text-gray-400 opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-gray-100 hover:text-red-600 disabled:opacity-40 max-md:opacity-100"
              aria-label="Remover sessão"
            >
              <LuTrash2 />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)

export default HistoricoHoje
