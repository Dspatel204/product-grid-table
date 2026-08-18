import { Star, Pencil, Trash2, DollarSign, Percent, Tag, Package, X, Check } from "lucide-react";
import type { Product, EditState, ValidationErrors, ColumnKey } from "../types";
import { validateField } from "../utils/validation";

interface GridCardProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  edits: Record<number, EditState>;
  errors: Record<number, ValidationErrors>;
  onCellChange: (id: number, field: keyof EditState, value: any, error: string | null) => void;
  onSaveRow: (id: number) => void;
  onDeleteRow: (id: number) => void;
  onEditRow: (id: number) => void;
  onCancelEdit: (id: number) => void;
  savingRows: Record<number, boolean>;
  visibleColumns: ColumnKey[];
  isEditing: boolean;
}

const EDITABLE_FIELDS: ColumnKey[] = ["price", "stock", "rating", "brand", "title", "category"];

function GridCard({
  product,
  isSelected,
  onToggleSelect,
  edits,
  errors,
  onCellChange,
  onSaveRow,
  onDeleteRow,
  onEditRow,
  onCancelEdit,
  savingRows,
  visibleColumns,
  isEditing,
}: GridCardProps) {
  const rowEdits = edits[product.id] || {};
  const isDirty = Object.keys(rowEdits).length > 0;
  const rowErrors = errors[product.id] || {};
  const hasError = Object.values(rowErrors).some((e) => !!e);
  const isSaving = savingRows[product.id];

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = product.price - (product.price * product.discountPercentage) / 100;
  const stockLow = product.stock < 10;
  const inStock = product.availabilityStatus === "In Stock" || product.stock > 0;

  const renderEditableField = (field: ColumnKey, label: string, type = "text") => {
    if (!visibleColumns.includes(field) || !EDITABLE_FIELDS.includes(field)) return null;
    const editField = field as keyof EditState;
    const val = rowEdits[editField] !== undefined ? rowEdits[editField] : product[editField];
    const err = rowErrors[editField];

    const icon = field === "price" ? <DollarSign className="h-3.5 w-3.5 text-gray-400" /> :
      field === "rating" ? <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> :
      field === "stock" ? <Package className="h-3.5 w-3.5 text-gray-400" /> :
      <Tag className="h-3.5 w-3.5 text-gray-400" />;

    if (isEditing && field === "title") {
      return (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
            {label}
          </label>
          <textarea
            value={val ?? ""}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white resize-none"
            rows={2}
            onChange={(e) => {
              const v = e.target.value;
              const errorMsg = validateField(editField, v);
              onCellChange(product.id, editField, v, errorMsg);
            }}
          />
          {err && <span className="text-[10px] text-red-500 dark:text-red-400">{err}</span>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {label}
        </label>
        <div className="relative flex items-center">
          {isEditing && <span className="absolute left-2.5 flex items-center pointer-events-none">{icon}</span>}
          <input
            type={type}
            value={val ?? ""}
            className={`w-full rounded-lg border border-gray-200 ${isEditing && icon ? "pl-8" : "pl-2.5"} pr-2.5 py-1.5 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white`}
            onChange={(e) => {
              const v = type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value;
              const errorMsg = validateField(editField, v);
              onCellChange(product.id, editField, v, errorMsg);
            }}
          />
        </div>
        {err && <span className="text-[10px] text-red-500 dark:text-red-400">{err}</span>}
      </div>
    );
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
        isSelected
          ? "border-blue-400 ring-2 ring-blue-500/20 shadow-lg dark:border-blue-600 dark:bg-slate-800"
          : "border-gray-200 hover:shadow-xl hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-xl"
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img
          src={product.thumbnail || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <button
            onClick={() => onToggleSelect(product.id)}
            className={`flex h-5 w-5 items-center-center justify-center rounded-md border-2 backdrop-blur-sm transition-all duration-200 ${
              isSelected
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-white/70 bg-white/20 hover:border-blue-400 hover:bg-blue-500/30"
            }`}
          >
            {isSelected && <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </button>
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
        </div>
        {!inStock && (
          <div className="absolute right-3 top-3">
            <span className="rounded-lg bg-gray-900 px-2 py-1 text-xs font-bold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {product.brand && visibleColumns.includes("brand") && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                  {product.brand}
                </span>
              )}
              {product.category && visibleColumns.includes("category") && (
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  {product.category}
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="mt-1">
                {renderEditableField("title", "Title", "text")}
              </div>
            ) : (
              <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white leading-tight" title={product.title}>
                {product.title}
              </h3>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="mb-3 flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300 dark:text-slate-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-0.5">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="mb-3 grid grid-cols-2 gap-2">
          {isEditing ? (
            <>
              {renderEditableField("price", "Price", "number")}
              {renderEditableField("stock", "Stock", "number")}
              {renderEditableField("rating", "Rating", "number")}
              {renderEditableField("brand", "Brand", "text")}
              {renderEditableField("category", "Category", "text")}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">Price</label>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">Stock</label>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.stock}</span>
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 dark:bg-slate-700">
              <Percent className="h-3 w-3 text-gray-500" />
              <span className="font-semibold text-gray-700 dark:text-slate-200">{product.discountPercentage}%</span>
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
              stockLow
                ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                : "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
            }`}>
              <Package className="h-3 w-3" />
              {stockLow ? "Low Stock" : "In Stock"}
            </span>
          </div>
        )}

        {isEditing && (
          <div className="mb-3">
            {renderEditableField("discountPercentage", "Discount %", "number")}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              {discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through dark:text-slate-500">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${
              stockLow
                ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                : "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
            }`}>
              <Package className="h-3 w-3" />
              {stockLow ? "Low Stock" : "In Stock"}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">
              ({product.stock})
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => onSaveRow(product.id)}
                disabled={!isDirty || hasError || isSaving}
                title="Save changes"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? (
                  <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </button>
              <button
                onClick={() => onCancelEdit(product.id)}
                title="Cancel"
                className="rounded-xl border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditRow(product.id)}
                title="Edit product"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => onDeleteRow(product.id)}
                title="Delete"
                className="rounded-xl border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800/50 dark:hover:bg-red-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface GridViewProps {
  products: Product[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  edits: Record<number, EditState>;
  errors: Record<number, ValidationErrors>;
  onCellChange: (id: number, field: keyof EditState, value: any, error: string | null) => void;
  onSaveRow: (id: number) => void;
  onDeleteRow: (id: number) => void;
  onEditRow: (id: number) => void;
  onCancelEdit: (id: number) => void;
  savingRows: Record<number, boolean>;
  visibleColumns: ColumnKey[];
  editingId: number | null;
}

export function GridView({
  products,
  selectedIds,
  onToggleSelect,
  edits,
  errors,
  onCellChange,
  onSaveRow,
  onDeleteRow,
  onEditRow,
  onCancelEdit,
  savingRows,
  visibleColumns,
  editingId,
}: GridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, idx) => (
        <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
          <GridCard
            product={product}
            isSelected={selectedIds.has(product.id)}
            onToggleSelect={onToggleSelect}
            edits={edits}
            errors={errors}
            onCellChange={onCellChange}
            onSaveRow={onSaveRow}
            onDeleteRow={onDeleteRow}
            onEditRow={onEditRow}
            onCancelEdit={onCancelEdit}
            savingRows={savingRows}
            visibleColumns={visibleColumns}
            isEditing={editingId === product.id}
          />
        </div>
      ))}
    </div>
  );
}