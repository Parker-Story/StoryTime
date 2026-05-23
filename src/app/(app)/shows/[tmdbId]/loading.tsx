import { Skeleton } from '@/components/ui/skeleton'

export default function ShowLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 sm:h-64 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div className="space-y-4">
          <Skeleton className="aspect-[2/3] w-full max-w-[200px] rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )
}
