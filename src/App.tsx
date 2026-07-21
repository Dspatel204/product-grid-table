import { useState, useEffect, useRef } from "react";
import { useProductFetch } from "./hooks/useProductFetch";
import { VirtualizedGrid } from "./components/VirtualizedGrid";
import type { EditState, ValidationErrors } from "./types";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-16 bg-gray-200 rounded-md" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-48 bg-gray-200 rounded-md" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-20 bg-gray-200 rounded-md" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-20 bg-gray-200 rounded-md" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-16 bg-gray-200 rounded-md" />
      </td>
      <td className="px-4 py-3 border-b border-border">
        <div className="h-8 w-28 bg-gray-200 rounded-md" />
      </td>
    </tr>
  );
}

export default function App() {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Searchable & Editable Product Grid
        </h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="stock">Stock</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          <div className="rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger shadow-sm">
            Error: {error}
          </div>
        )}

        {loading || !data ? (
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
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
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
            No products found.
          </div>
        )}

        {data && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((prev) => Math.max(0, prev - 20))}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={skip + 20 >= data.total}
                onClick={() => setSkip((prev) => prev + 20)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <span className="text-sm text-muted">
              Showing {skip + 1} - {skip + data.products.length} of {data.total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
