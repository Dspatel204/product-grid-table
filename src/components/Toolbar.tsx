import { Search, ArrowUpDown, Download, RotateCcw, Grid2x2, Table2 } from "lucide-react";
import type { ViewMode } from "../types";

interface ToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  order: "asc" | "desc";
  onOrderChange: (value: "asc" | "desc") => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onReset: () => void;
  onExport: () => void;
  totalItems: number;
  dirtyCount: number;
  onSaveAll: () => void;
  children?: React.ReactNode;
}

export function Toolbar({
  query,
  onQueryChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  viewMode,
  onViewModeChange,
  onReset,
  onExport,
  totalItems,
  dirtyCount,
  onSaveAll,
  children,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search products by name, brand, or category..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2.5 text-sm text-gray-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="discountPercentage">Discount</option>
              <option value="rating">Rating</option>
              <option value="stock">Stock</option>
            </select>
            <svg className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={order}
              onChange={(e) => onOrderChange(e.target.value as "asc" | "desc")}
              className="appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm text-gray-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <svg className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button
            onClick={onExport}
            disabled={totalItems === 0}
            title="Export to CSV"
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={onReset}
            title="Reset all filters"
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => onViewModeChange("table")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Table2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
          </div>

          {dirtyCount > 0 && (
            <button
              onClick={onSaveAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save {dirtyCount} Change{dirtyCount > 1 ? "s" : ""}
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
