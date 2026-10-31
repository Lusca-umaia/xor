import clsx from 'clsx'

interface SkeletonProps {
  className?: string
}

// Bloco cinza pulsante usado enquanto os dados carregam.
const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    aria-hidden="true"
    className={clsx('animate-pulse rounded-md bg-gray-200', className)}
  />
)

export const SkeletonCard: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={clsx(
      'bg-white border border-gray-100 rounded-2xl shadow-md p-4 space-y-4',
      className
    )}
  >
    <div className="flex items-center gap-2">
      <Skeleton className="size-6 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
)

// Grade de cards em carregamento, para listas.
export function SkeletonCards({ quantidade = 3 }: { quantidade?: number }) {
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
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
