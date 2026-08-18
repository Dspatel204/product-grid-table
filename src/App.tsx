import { useState, useEffect, useRef, useCallback } from "react";
import { useProductFetch } from "./hooks/useProductFetch";
import { VirtualizedGrid } from "./components/VirtualizedGrid";
import { GridView } from "./components/GridView";
import { Toolbar } from "./components/Toolbar";
import { FilterChips } from "./components/FilterChips";
import { StatusBar } from "./components/StatusBar";
import { ColumnToggle } from "./components/ColumnToggle";
import { BulkActions } from "./components/BulkActions";
import { EmptyState } from "./components/EmptyState";
import { ALL_COLUMNS } from "./components/ColumnToggle";
import type { EditState, ValidationErrors, ViewMode, ColumnKey } from "./types";
import { COL_WIDTHS, getTableMinWidth } from "./types";
import { Sun, Moon, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";


function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="h-48 w-full bg-gray-200 dark:bg-slate-700" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-slate-700" />
          <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-slate-700" />
        </div>
        <div className="mb-2 h-4 w-3/4 rounded-md bg-gray-200 dark:bg-slate-700" />
        <div className="mb-3 h-3 w-1/2 rounded-md bg-gray-200 dark:bg-slate-700" />
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="h-8 rounded-lg bg-gray-200 dark:bg-slate-700" />
          <div className="h-8 rounded-lg bg-gray-200 dark:bg-slate-700" />
          <div className="h-8 rounded-lg bg-gray-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 rounded-md bg-gray-200 dark:bg-slate-700" />
          <div className="h-6 w-16 rounded-md bg-gray-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [skip, setSkip] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([...ALL_COLUMNS.map((c) => c.key)]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [edits, setEdits] = useState<Record<number, EditState>>({});
  const [errors, setErrors] = useState<Record<number, ValidationErrors>>({});
  const [savingRows, setSavingRows] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, loading, error, fetchProducts, setData } = useProductFetch();

  const previousStateRef = useRef({
    debouncedQuery,
    sortBy,
    order,
    skip,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const hasUnsavedEdits = Object.keys(edits).length > 0;

    if (hasUnsavedEdits) {
      const confirmDiscard = window.confirm(
        "You have unsaved edits! Discard changes and load new results?",
      );
      if (!confirmDiscard) {
        setQuery(previousStateRef.current.debouncedQuery);
        setDebouncedQuery(previousStateRef.current.debouncedQuery);
        setSortBy(previousStateRef.current.sortBy);
        setOrder(previousStateRef.current.order);
        setSkip(previousStateRef.current.skip);
        return;
      } else {
        setEdits({});
        setErrors({});
        setSelectedIds(new Set());
      }
    }

    previousStateRef.current = {
      debouncedQuery,
      sortBy,
      order,
      skip,
    };

    fetchProducts({
      query: debouncedQuery,
      sortBy,
      order,
      category: "",
      skip,
      limit: 12,
    });
  }, [debouncedQuery, sortBy, order, skip, fetchProducts]);

  useEffect(() => {
    setSelectedIds(new Set());
    setEditingId(null);
  }, [data?.products]);

  const handleCellChange = (
    id: number,
    field: keyof EditState,
    value: any,
    errorMsg: string | null,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setErrors((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: errorMsg || undefined },
    }));
  };

  const handleSaveRow = async (id: number) => {
    const rowEdits = edits[id];
    if (!rowEdits || Object.keys(rowEdits).length === 0) return;

    setSavingRows((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`https://dummyjson.com/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowEdits),
      });
      if (!response.ok) throw new Error("Failed to save");
      const updatedProduct = await response.json();

      if (data) {
        setData({
          ...data,
          products: data.products.map((p) =>
            p.id === id ? { ...p, ...updatedProduct } : p,
          ),
        });
      }

      setEdits((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setErrors((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err) {
      alert(`Failed to save product ${id}`);
    } finally {
      setSavingRows((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveAll = async () => {
    const dirtyIds = Object.keys(edits).map(Number);
    for (const id of dirtyIds) {
      const rowErrors = errors[id] || {};
      const hasError = Object.values(rowErrors).some((e) => !!e);
      if (!hasError) {
        await handleSaveRow(id);
      }
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handleDeleteRow = (id: number) => {
    if (!confirm("Delete this product?")) return;
    if (data) {
      setData({
        ...data,
        products: data.products.filter((p) => p.id !== id),
        total: data.total - 1,
      });
    }
    setEdits((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setErrors((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected products?`)) return;
    if (data) {
      setData({
        ...data,
        products: data.products.filter((p) => !selectedIds.has(p.id)),
        total: data.total - selectedIds.size,
      });
    }
    setEdits((prev) => {
      const n = { ...prev };
      selectedIds.forEach((id) => delete n[id]);
      return n;
    });
    setErrors((prev) => {
      const n = { ...prev };
      selectedIds.forEach((id) => delete n[id]);
      return n;
    });
    setSelectedIds(new Set());
  }, [selectedIds, data]);

  const handleClearSelection = () => setSelectedIds(new Set());

  const handleEditRow = (id: number) => {
    setEditingId(id);
  };

  const handleCancelEdit = (id: number) => {
    setEditingId(null);
    setEdits((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setErrors((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const handleExport = () => {
    if (!data) return;
    const visibleProducts = data.products;

    const headers = ["ID", "Title", "Description", "Price", "Discount %", "Rating", "Stock", "Category", "Brand", "Availability"];
    const rows = visibleProducts.map((p) => [
      p.id, p.title, p.description, p.price, p.discountPercentage, p.rating, p.stock, p.category, p.brand || "", p.availabilityStatus || "In Stock"
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setQuery("");
    setDebouncedQuery("");
    setSortBy("title");
    setOrder("asc");
    setSkip(0);
    setEdits({});
    setErrors({});
    setSelectedIds(new Set());
  };

  const handleToggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedIds(new Set());
  };

  const dirtyCount = Object.keys(edits).length;

  return (
    <div className="min-h-screen bg-gray-50/90 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                ProductHub
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">Sales & Inventory Management</p>
            </div>
          </div>
          <button
            onClick={() => setDark((prev) => !prev)}
            className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Toolbar
              query={query}
              onQueryChange={setQuery}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              order={order}
              onOrderChange={setOrder}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onReset={handleReset}
              onExport={handleExport}
              totalItems={data?.total ?? 0}
              dirtyCount={dirtyCount}
              onSaveAll={handleSaveAll}
            >
              <ColumnToggle visibleColumns={visibleColumns} onToggleColumn={handleToggleColumn} />
            </Toolbar>

            <div className="mt-3">
              <FilterChips
                query={query}
                sortBy={sortBy}
                order={order}
                onClearQuery={() => setQuery("")}
                onClearSort={() => { setSortBy("title"); setOrder("asc"); }}
                onClearAll={handleReset}
              />
            </div>
          </div>

          {error && (
            <div className="animate-slide-in rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            </div>
          )}

          {loading || !data ? (
            <div className="space-y-4">
              <StatusBar total={0} showing={{ start: 0, end: 0 }} selectedCount={0} loading />
              {viewMode === "table" ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex flex-col" style={{ minWidth: getTableMinWidth(visibleColumns) }}>
                    <div className="flex items-center border-b border-gray-200 bg-gray-50/95 dark:border-slate-700 dark:bg-slate-800" style={{ height: "44px" }}>
                      <div className="w-11 flex-shrink-0" />
                      {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                        <div key={col.key} className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${COL_WIDTHS[col.key]} dark:text-slate-400`}>
                          {col.label}
                        </div>
                      ))}
                      <div className="w-[72px] flex-shrink-0 px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-400">Actions</div>
                    </div>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex items-center border-b border-gray-100 bg-white dark:bg-slate-900" style={{ height: 56 }}>
                        <div className="w-11 flex-shrink-0" />
                        {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                          <div key={col.key} className={`px-3 py-3 ${COL_WIDTHS[col.key]}`}>
                            <div className="h-4 w-full rounded-md skeleton-shimmer" style={{ maxWidth: col.key === "title" ? "70%" : "100px" }} />
                          </div>
                        ))}
                        <div className="w-[72px] flex-shrink-0 px-3">
                          <div className="h-8 w-16 rounded-lg skeleton-shimmer mx-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}
            </div>
          ) : data.products.length > 0 ? (
            <div className="space-y-4">
              <StatusBar
                total={data.total}
                showing={{ start: skip + 1, end: Math.min(skip + 12, data.total) }}
                selectedCount={selectedIds.size}
                loading={loading}
              />
              {viewMode === "table" ? (
                <VirtualizedGrid
                  products={data.products}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  edits={edits}
                  errors={errors}
                  visibleColumns={visibleColumns}
                  onCellChange={handleCellChange}
                  onSaveRow={handleSaveRow}
                  onDeleteRow={handleDeleteRow}
                  onEditRow={handleEditRow}
                  onCancelEdit={handleCancelEdit}
                  savingRows={savingRows}
                  editingId={editingId}
                />
              ) : (
                <GridView
                  products={data.products}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  edits={edits}
                  errors={errors}
                  visibleColumns={visibleColumns}
                  onCellChange={handleCellChange}
                  onSaveRow={handleSaveRow}
                  onDeleteRow={handleDeleteRow}
                  onEditRow={handleEditRow}
                  onCancelEdit={handleCancelEdit}
                  savingRows={savingRows}
                  editingId={editingId}
                />
              )}
            </div>
          ) : (
            <EmptyState hasFilters={!!query || sortBy !== "title"} loading={false} />
          )}

          {data && data.total > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <button
                  disabled={skip === 0}
                  onClick={() => setSkip((prev) => Math.max(0, prev - 12))}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  disabled={skip + 12 >= data.total}
                  onClick={() => setSkip((prev) => prev + 12)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">
                  Page {Math.floor(skip / 12) + 1} of {Math.max(1, Math.ceil(data.total / 12))}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  Showing {skip + 1} - {Math.min(skip + 12, data.total)} of {data.total}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <BulkActions
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        savingCount={Object.values(savingRows).filter(Boolean).length}
      />
    </div>
  );
}

export default App;
