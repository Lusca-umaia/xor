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

export default Skeleton
