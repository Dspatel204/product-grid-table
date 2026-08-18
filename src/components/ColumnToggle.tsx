import type { ColumnKey } from "../types";

export const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "price", label: "Price" },
  { key: "discountPercentage", label: "Discount" },
  { key: "rating", label: "Rating" },
  { key: "stock", label: "Stock" },
  { key: "availabilityStatus", label: "Availability" },
  { key: "brand", label: "Brand" },
  { key: "category", label: "Category" },
];

interface ColumnToggleProps {
  visibleColumns: ColumnKey[];
  onToggleColumn: (key: ColumnKey) => void;
}

export function ColumnToggle({ visibleColumns, onToggleColumn }: ColumnToggleProps) {
  return (
    <div className="relative">
      <div className="group relative">
        <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800">
          {ALL_COLUMNS.map((col) => (
            <label
              key={col.key}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => onToggleColumn(col.key)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
              />
              {col.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
