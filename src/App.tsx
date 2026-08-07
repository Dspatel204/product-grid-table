import { useState, useEffect, useRef } from "react";
import { useProductFetch } from "./hooks/useProductFetch";
import { VirtualizedGrid } from "./components/VirtualizedGrid";
import type { EditState, ValidationErrors } from "./types";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-16 rounded-md skeleton-shimmer" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-48 rounded-md skeleton-shimmer" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-20 rounded-md skeleton-shimmer" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-20 rounded-md skeleton-shimmer" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-16 rounded-md skeleton-shimmer" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-28 rounded-md skeleton-shimmer" />
      </td>
    </tr>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [category, setCategory] = useState("");
  const [skip, setSkip] = useState(0);

  const [edits, setEdits] = useState<Record<number, EditState>>({});
  const [errors, setErrors] = useState<Record<number, ValidationErrors>>({});
  const [savingRows, setSavingRows] = useState<Record<number, boolean>>({});

  const { data, loading, error, fetchProducts, setData } = useProductFetch();

  const previousStateRef = useRef({
    debouncedQuery,
    sortBy,
    order,
    category,
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
        setCategory(previousStateRef.current.category);
        setSkip(previousStateRef.current.skip);
        return;
      } else {
        setEdits({});
        setErrors({});
      }
    }

    previousStateRef.current = {
      debouncedQuery,
      sortBy,
      order,
      category,
      skip,
    };

    fetchProducts({
      query: debouncedQuery,
      sortBy,
      order,
      category,
      skip,
      limit: 10,
    });
  }, [debouncedQuery, sortBy, order, category, skip, fetchProducts]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Searchable & Editable Product Grid
          </h2>
          <button
            onClick={() => setDark((prev) => !prev)}
            className="rounded-lg border border-border bg-surface p-2 shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? (
              <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="stock">Stock</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <button
            onClick={handleSaveAll}
            disabled={Object.keys(edits).length === 0}
            className="ml-auto rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-success-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save All Changed
          </button>
        </div>

        {error && (
          <div className="animate-slide-in rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger shadow-sm dark:bg-red-950/40">
            Error: {error}
          </div>
        )}

        {loading || !data ? (
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col className="w-24" />
                <col />
                <col className="w-28" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-36" />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="h-[44px] bg-gray-100 border-b-2 border-border dark:bg-slate-700 dark:border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-slate-300">Actions</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-slate-300">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-slate-300">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-slate-300">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-slate-300">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-slate-300">Category</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : data.products.length > 0 ? (
          <VirtualizedGrid
            products={data.products}
            edits={edits}
            errors={errors}
            onCellChange={handleCellChange}
            onSaveRow={handleSaveRow}
            savingRows={savingRows}
          />
        ) : (
          <div className="animate-fade-in rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            No products found.
          </div>
        )}

        {data && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((prev) => Math.max(0, prev - 10))}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <button
                disabled={skip + 10 >= data.total}
                onClick={() => setSkip((prev) => prev + 10)}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Next
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted dark:text-slate-400">
                Page {Math.floor(skip / 10) + 1} of {Math.max(1, Math.ceil(data.total / 10))}
              </span>
              <span className="text-xs text-muted/70 dark:text-slate-500">
                Showing {skip + 1} - {Math.min(skip + 10, data.total)} of {data.total}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
