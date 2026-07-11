import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-64 bg-gray-200" />
      
      {/* Badge Skeleton */}
      <div className="absolute top-2 left-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton className="h-4 w-20 bg-gray-200" />
        
        {/* Title */}
        <Skeleton className="h-5 w-full bg-gray-200" />
        <Skeleton className="h-5 w-3/4 bg-gray-200" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 bg-gray-200" />
          <Skeleton className="h-4 w-12 bg-gray-200" />
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 bg-gray-200" />
          <Skeleton className="h-5 w-20 bg-gray-200 line-through" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
