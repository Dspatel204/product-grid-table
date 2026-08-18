import React, { useRef, useState, useEffect } from "react";
import { Check, Pencil, Trash2, DollarSign, Percent, Star, Package, Tag, Warehouse, X } from "lucide-react";
import type { Product, EditState, ValidationErrors, ColumnKey } from "../types";
import { validateField } from "../utils/validation";

interface GridProps {
  products: Product[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  edits: Record<number, EditState>;
  errors: Record<number, ValidationErrors>;
  visibleColumns: ColumnKey[];
  onCellChange: (
    id: number,
    field: keyof EditState,
    value: any,
    error: string | null,
  ) => void;
  onSaveRow: (id: number) => void;
  onDeleteRow: (id: number) => void;
  onEditRow: (id: number) => void;
  onCancelEdit: (id: number) => void;
  savingRows: Record<number, boolean>;
  editingId: number | null;
}

const COL_WIDTHS: Record<ColumnKey, string> = {
  title: "min-w-0 flex-1",
  price: "w-28",
  discountPercentage: "w-24",
  rating: "w-20",
  stock: "w-20",
  availabilityStatus: "w-32",
  brand: "w-28",
  category: "w-28",
};

const HEADERS = ["Title", "Price", "Discount", "Rating", "Stock", "Availability", "Brand", "Category"] as const;
const FIELD_KEYS: ColumnKey[] = ["title", "price", "discountPercentage", "rating", "stock", "availabilityStatus", "brand", "category"];

export const VirtualizedGrid: React.FC<GridProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  edits,
  errors,
  visibleColumns,
  onCellChange,
  onSaveRow,
  onDeleteRow,
  onEditRow,
  onCancelEdit,
  savingRows,
  editingId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 56;
  const viewportHeight = 420;

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

  const visibleHeaders = HEADERS.filter((_, i) => visibleColumns.includes(FIELD_KEYS[i]));

  const getIcon = (field: ColumnKey) => {
    switch (field) {
      case "price":
        return <DollarSign className="h-3.5 w-3.5 text-gray-400" />;
      case "discountPercentage":
        return <Percent className="h-3.5 w-3.5 text-gray-400" />;
      case "rating":
        return <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />;
      case "stock":
        return <Package className="h-3.5 w-3.5 text-gray-400" />;
      case "availabilityStatus":
        return <Warehouse className="h-3.5 w-3.5 text-gray-400" />;
      case "brand":
        return <Tag className="h-3.5 w-3.5 text-gray-400" />;
      default:
        return null;
    }
  };

  const renderCell = (product: Product, field: ColumnKey, type = "text") => {
    const editField = field as keyof EditState;
    const rowEdits = edits[product.id] || {};
    const rowErrors = errors[product.id] || {};
    const val = rowEdits[editField] !== undefined ? rowEdits[editField] : product[editField];
    const err = rowErrors[editField];
    const isEditing = editingId === product.id;
    const isEditable = true;

    if (field === "availabilityStatus") {
      const stockLow = product.stock < 10;
      if (!isEditing) {
        return (
          <div className={`px-3 py-1.5 ${COL_WIDTHS[field]}`}>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ${
              stockLow
                ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                : "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
            }`}>
              {stockLow ? "Low Stock" : "In Stock"}
            </span>
          </div>
        );
      }
    }

    if (!isEditing || !isEditable) {
      if (field === "title") {
        return (
          <div className={`px-3 py-1.5 ${COL_WIDTHS[field]}`}>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate block" title={String(val)}>
              {val !== undefined && val !== null ? String(val) : "-"}
            </span>
          </div>
        );
      }
      if (field === "brand" || field === "category") {
        return (
          <div className={`px-3 py-1.5 ${COL_WIDTHS[field]}`}>
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:bg-slate-700 dark:text-slate-300">
              {val !== undefined && val !== null ? String(val) : "-"}
            </span>
          </div>
        );
      }
      return (
        <div className={`px-3 py-1.5 ${COL_WIDTHS[field]}`}>
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate block">
            {val !== undefined && val !== null ? String(val) : "-"}
          </span>
        </div>
      );
    }

    const icon = getIcon(field);

    if (field === "title") {
      return (
        <div className={`px-3 py-1.5 ${COL_WIDTHS[field]}`}>
          <div className="relative">
            <textarea
              value={val ?? ""}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 resize-none"
              rows={2}
              onChange={(e) => {
                const v = e.target.value;
                const errorMsg = validateField(editField, v);
                onCellChange(product.id, editField, v, errorMsg);
              }}
            />
            {err && (
              <div className="mt-0.5 text-[10px] text-red-500 dark:text-red-400 animate-slide-in">
                {err}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`px-3 py-1.5 ${COL_WIDTHS[field]}`}>
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-2.5 flex items-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            type={type}
            value={val ?? ""}
            className={`w-full rounded-lg border border-gray-200 ${icon ? "pl-8" : "pl-2.5"} pr-2.5 py-1.5 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400`}
            onChange={(e) => {
              const v = type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value;
              const errorMsg = validateField(editField, v);
              onCellChange(product.id, editField, v, errorMsg);
            }}
          />
          {field === "discountPercentage" && (
            <span className="absolute right-2.5 text-xs text-gray-400 pointer-events-none">%</span>
          )}
        </div>
        {err && (
          <div className="mt-0.5 text-[10px] text-red-500 dark:text-red-400 animate-slide-in">
            {err}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
      <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md border-b border-gray-200 dark:bg-slate-800/95 dark:border-slate-700">
        <div className="flex items-center min-w-[960px]" style={{ height: "44px" }}>
          <div className="w-11 flex-shrink-0 flex items-center justify-center">
            <input
              type="checkbox"
              checked={visibleProducts.length > 0 && visibleProducts.every((p) => selectedIds.has(p.id))}
              onChange={(e) => {
                const checked = e.target.checked;
                visibleProducts.forEach((p) => {
                  if (checked) {
                    if (!selectedIds.has(p.id)) onToggleSelect(p.id);
                  } else {
                    if (selectedIds.has(p.id)) onToggleSelect(p.id);
                  }
                });
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
            />
          </div>
          {visibleHeaders.map((header, idx) => (
            <div
              key={header}
              className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${COL_WIDTHS[FIELD_KEYS[idx]]} dark:text-slate-400`}
            >
              {header}
            </div>
          ))}
          <div className="w-[72px] flex-shrink-0 px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-400">
            Actions
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          className="overflow-y-auto dark:bg-slate-900/50"
          style={{ height: viewportHeight - 44 }}
        >
          <div className="relative w-full" style={{ height: totalHeight }}>
            <div className="absolute left-0 right-0 min-w-[960px]" style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleProducts.map((product, idx) => {
                const rowEdits = edits[product.id] || {};
                const rowErrors = errors[product.id] || {};
                const isDirty = Object.keys(rowEdits).length > 0;
                const hasError = Object.values(rowErrors).some((e) => !!e);
                const isSaving = savingRows[product.id];
                const isEditing = editingId === product.id;

                return (
                  <div
                    key={product.id}
                    className={`flex items-center border-b border-gray-100 transition-colors duration-150 animate-fade-in ${
                      isDirty
                        ? "bg-amber-50/60 dark:bg-amber-950/15"
                        : selectedIds.has(product.id)
                          ? "bg-blue-50/50 dark:bg-blue-950/15"
                          : "bg-white hover:bg-gray-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                    } ${isEditing ? "ring-2 ring-blue-500/20" : ""}`}
                    style={{ height: isEditing ? "auto" : rowHeight, minHeight: rowHeight, animationDelay: `${idx * 15}ms` }}
                  >
                    <div className="w-11 flex-shrink-0 flex items-center justify-center">
                      <button
                        onClick={() => onToggleSelect(product.id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all duration-200 ${
                          selectedIds.has(product.id)
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500"
                        }`}
                      >
                        {selectedIds.has(product.id) && <Check className="h-2.5 w-2.5" />}
                      </button>
                    </div>
                    {FIELD_KEYS.filter((k) => visibleColumns.includes(k)).map((field) =>
                      renderCell(product, field, field === "price" || field === "discountPercentage" || field === "rating" || field === "stock" ? "number" : "text")
                    )}
                    <div className="w-[72px] flex-shrink-0 px-3 flex justify-end gap-0.5">
                      {isEditing ? (
                        <>
                          <button
                            disabled={!isDirty || hasError || isSaving}
                            onClick={() => onSaveRow(product.id)}
                            title="Save changes"
                            className="rounded-lg p-1.5 text-blue-600 transition-all duration-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-blue-950/50"
                          >
                            {isSaving ? (
                              <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => onCancelEdit(product.id)}
                            title="Cancel"
                            className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEditRow(product.id)}
                            title="Edit row"
                            className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRow(product.id)}
                            title="Delete"
                            className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};