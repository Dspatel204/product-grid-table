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
  const rowHeight = 60;
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
    <div
      ref={containerRef}
      className="h-[400px] overflow-y-auto rounded-xl border border-border bg-surface shadow-sm"
      style={{ height: viewportHeight }}
    >
      <div className="relative w-full" style={{ height: totalHeight }}>
        <div
          className="absolute left-0 right-0"
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          <table className="w-full border-collapse bg-surface">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-border" style={{ height: "40px" }}>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => {
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
                    <td className="relative px-4 py-3 border-b border-border" style={{ padding: "8px" }}>
                      <input
                        type={type}
                        value={val}
                        className={`w-[90%] rounded-md border px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                          err
                            ? "border-danger focus:border-danger focus:ring-danger/20"
                            : "border-gray-300 focus:border-primary focus:ring-primary/20"
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
                        <div className="absolute bottom-0 left-0 text-[10px] text-danger">
                          {err}
                        </div>
                      )}
                    </td>
                  );
                };

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      isDirty ? "bg-dirty" : "bg-surface hover:bg-gray-50"
                    }`}
                    style={{ height: rowHeight }}
                  >
                    <td className="px-4 py-3 border-b border-border" style={{ padding: "8px" }}>
                      <button
                        disabled={
                          !isDirty || hasError || savingRows[product.id]
                        }
                        onClick={() => onSaveRow(product.id)}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingRows[product.id] ? "Saving..." : "Save"}
                      </button>
                    </td>
                    {renderCell("title", "string")}
                    {renderCell("price", "number")}
                    {renderCell("stock", "number")}
                    {renderCell("rating", "number")}
                    {renderCell("category", "string")}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
