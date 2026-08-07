import React, { useRef, useState, useEffect } from "react";
import type { Product, EditState, ValidationErrors } from "../types";
import { validateField } from "../utils/validation";

interface GridProps {
  products: Product[];
  edits: Record<number, EditState>;
  errors: Record<number, ValidationErrors>;
  onCellChange: (
    id: number,
    field: keyof EditState,
    value: any,
    error: string | null,
  ) => void;
  onSaveRow: (id: number) => void;
  savingRows: Record<number, boolean>;
}

const COL_WIDTHS = ["w-24", "min-w-0 flex-1", "w-28", "w-24", "w-24", "w-36"];

const HEADERS = [
  "Actions",
  "Title",
  "Price",
  "Stock",
  "Rating",
  "Category",
] as const;

export const VirtualizedGrid: React.FC<GridProps> = ({
  products,
  edits,
  errors,
  onCellChange,
  onSaveRow,
  savingRows,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 56;
  const viewportHeight = 400;

  useEffect(() => {
    const handleScroll = (e: Event) => {
      setScrollTop((e.target as HTMLDivElement).scrollTop);
    };
    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const totalHeight = products.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endIndex = Math.min(
    products.length - 1,
    Math.floor((scrollTop + viewportHeight) / rowHeight) + 2,
  );

  const visibleProducts = products.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * rowHeight;

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-gray-100/95 backdrop-blur-md border-b-2 border-border dark:bg-slate-800/95 dark:border-slate-700">
        <div className="flex items-center" style={{ height: "44px" }}>
          {HEADERS.map((header, idx) => (
            <div
              key={header}
              className={`px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${COL_WIDTHS[idx]} dark:text-slate-300`}
            >
              {header}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <div
        ref={containerRef}
        className="overflow-y-auto dark:bg-slate-900"
        style={{ height: viewportHeight - 44 }}
      >
        <div className="relative w-full" style={{ height: totalHeight }}>
          <div
            className="absolute left-0 right-0"
            style={{ transform: `translateY(${offsetY}px)` }}
          >
            {visibleProducts.map((product, idx) => {
              const rowEdits = edits[product.id] || {};
              const rowErrors = errors[product.id] || {};
              const isDirty = Object.keys(rowEdits).length > 0;
              const hasError = Object.values(rowErrors).some((e) => !!e);

              const renderCell = (field: keyof EditState, type = "text") => {
                const val =
                  rowEdits[field] !== undefined
                    ? rowEdits[field]
                    : product[field];
                const err = rowErrors[field];
                return (
                  <div className={`px-4 py-2 border-b border-border ${COL_WIDTHS[field === "title" ? 1 : field === "price" ? 2 : field === "stock" ? 3 : field === "rating" ? 4 : field === "category" ? 5 : 0]}`} style={{ padding: "8px" }}>
                    <input
                      type={type}
                      value={val}
                      className={`w-full rounded-md border px-2.5 py-1.5 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        err
                          ? "border-danger focus:border-danger focus:ring-danger/20"
                          : "border-gray-300 focus:border-primary focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                      }`}
                      onChange={(e) => {
                        const v =
                          type === "number"
                            ? e.target.value === ""
                              ? ""
                              : Number(e.target.value)
                            : e.target.value;
                        const errorMsg = validateField(field, v);
                        onCellChange(product.id, field, v, errorMsg);
                      }}
                    />
                    {err && (
                      <div className="absolute -bottom-0.5 left-0 text-[10px] text-danger animate-slide-in">
                        {err}
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div
                  key={product.id}
                  className={`flex items-center animate-fade-in transition-colors duration-200 ${
                    isDirty
                      ? "bg-dirty"
                      : "bg-surface hover:bg-blue-50/60 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                  style={{
                    height: rowHeight,
                    animationDelay: `${idx * 30}ms`,
                  }}
                >
                  <div className={`px-4 py-2 border-b border-border ${COL_WIDTHS[0]}`} style={{ padding: "8px" }}>
                    <button
                      disabled={
                        !isDirty || hasError || savingRows[product.id]
                      }
                      onClick={() => onSaveRow(product.id)}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none"
                    >
                      {savingRows[product.id] ? (
                        <span className="inline-flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving
                        </span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                  {renderCell("title", "string")}
                  {renderCell("price", "number")}
                  {renderCell("stock", "number")}
                  {renderCell("rating", "number")}
                  {renderCell("category", "string")}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
