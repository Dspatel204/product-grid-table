import { X } from "lucide-react";

interface FilterChipsProps {
  query: string;
  sortBy: string;
  order: "asc" | "desc";
  onClearQuery: () => void;
  onClearSort: () => void;
  onClearAll: () => void;
}

export function FilterChips({
  query,
  sortBy,
  order,
  onClearQuery,
  onClearSort,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = query || sortBy !== "title" || order !== "asc";
  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 animate-fade-in">
      <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Active filters:</span>
      {query && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
          Search: "{query}"
          <button onClick={onClearQuery} className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 p-0.5 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {sortBy !== "title" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50">
          Sort: {sortBy} ({order})
          <button onClick={onClearSort} className="rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 p-0.5 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      >
        Clear all
      </button>
    </div>
  );
}
