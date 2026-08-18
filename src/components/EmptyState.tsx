import { SearchX, PackageOpen } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  loading: boolean;
}

export function EmptyState({ hasFilters, loading }: EmptyStateProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="mb-4 rounded-2xl bg-gray-50 p-4 dark:bg-slate-800">
        {hasFilters ? (
          <SearchX className="h-10 w-10 text-gray-400 dark:text-slate-500" />
        ) : (
          <PackageOpen className="h-10 w-10 text-gray-400 dark:text-slate-500" />
        )}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {hasFilters ? "No products found" : "No products available"}
      </h3>
      <p className="max-w-sm text-sm text-gray-500 dark:text-slate-400">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "There are no products to display at the moment."}
      </p>
    </div>
  );
}
