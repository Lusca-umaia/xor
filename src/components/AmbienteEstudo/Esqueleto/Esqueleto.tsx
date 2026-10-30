import clsx from 'clsx'

export default function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx('animate-pulse rounded-lg bg-gray-200/80', className)}
    />
  )
}

export function EsqueletoCards({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Carregando"
    >
      {Array.from({ length: quantidade }, (_, indice) => (
        <div
          key={indice}
          className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5"
        >
          <Esqueleto className="h-5 w-2/3" />
          <Esqueleto className="h-4 w-full" />
          <Esqueleto className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
