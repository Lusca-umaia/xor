import clsx from 'clsx'
import { LuGlobe, LuSparkles } from 'react-icons/lu'

interface SeloIAProps {
  texto?: string
  /** "fora": a resposta não veio dos materiais do aluno. */
  variante?: 'padrao' | 'fora'
  className?: string
}

/** Rótulo de transparência exibido em todo conteúdo gerado por IA. */
export default function SeloIA({
  texto,
  variante = 'padrao',
  className
}: SeloIAProps) {
  const fora = variante === 'fora'
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        fora
          ? 'bg-amber-50 text-amber-800 ring-amber-200'
          : 'bg-xor-lime/15 text-xor-navy ring-xor-lime/60',
        className
      )}
    >
      {fora ? <LuGlobe aria-hidden /> : <LuSparkles aria-hidden />}
      {texto ??
        (fora
          ? 'Fora dos seus materiais: confira em outra fonte'
          : 'Gerado por IA: confira as fontes')}
    </span>
  )
}

export const MODO_DEMONSTRACAO =
  process.env.NEXT_PUBLIC_AMBIENTE_MOCK !== 'false'

/** Avisa que o conteúdo vem do mock enquanto o back não está integrado. */
export function SeloDemonstracao({ className }: { className?: string }) {
  if (!MODO_DEMONSTRACAO) return null
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white',
        className
      )}
      title="Os dados ficam só neste navegador e o conteúdo gerado é de demonstração, até a integração com o servidor."
    >
      Dados de demonstração
    </span>
  )
}
