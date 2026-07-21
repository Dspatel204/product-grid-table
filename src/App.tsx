import { useState, useEffect, useRef } from "react";
import { useProductFetch } from "./hooks/useProductFetch";
import { VirtualizedGrid } from "./components/VirtualizedGrid";
import type { EditState, ValidationErrors } from "./types";

export default function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [category, setCategory] = useState("");
  const [skip, setSkip] = useState(0);

  // Unsaved Edits State
  const [edits, setEdits] = useState<Record<number, EditState>>({});
  const [errors, setErrors] = useState<Record<number, ValidationErrors>>({});
  const [savingRows, setSavingRows] = useState<Record<number, boolean>>({});

  const { data, loading, error, fetchProducts, setData } = useProductFetch();

  // For rolling back inputs if user cancels the grid update
  const previousStateRef = useRef({
    debouncedQuery,
    sortBy,
    order,
    category,
    skip,
  });

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Intercept changes and check for unsaved edits
  useEffect(() => {
    const hasUnsavedEdits = Object.keys(edits).length > 0;

    if (hasUnsavedEdits) {
      const confirmDiscard = window.confirm(
        "You have unsaved edits! Discard changes and load new results?",
      );
      if (!confirmDiscard) {
        // Rollback current state to match the loaded data state
        setQuery(previousStateRef.current.debouncedQuery);
        setDebouncedQuery(previousStateRef.current.debouncedQuery);
        setSortBy(previousStateRef.current.sortBy);
        setOrder(previousStateRef.current.order);
        setCategory(previousStateRef.current.category);
        setSkip(previousStateRef.current.skip);
        return;
      } else {
        // Clear edits if user proceeds
        setEdits({});
        setErrors({});
      }
    }

    // Update previous valid state reference
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
      limit: 20,
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

      // Optimistic layout update with response payload
      if (data) {
        setData({
          ...data,
          products: data.products.map((p) =>
            p.id === id ? { ...p, ...updatedProduct } : p,
          ),
        });
      }

      // Clear edit status for this row
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
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Searchable & Editable Product Grid</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="title">Title</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="stock">Stock</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          style={{ padding: "8px" }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button
          className="save-all-btn"
          onClick={handleSaveAll}
          disabled={Object.keys(edits).length === 0}
          style={{
            marginLeft: "auto",
            background: "green",
            color: "white",
            padding: "10px",
          }}
        >
          Save All Changed
        </button>
      </div>

      {loading && <p>Loading remote records...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {data && data.products.length > 0 ? (
        <VirtualizedGrid
          products={data.products}
          edits={edits}
          errors={errors}
          onCellChange={handleCellChange}
          onSaveRow={handleSaveRow}
          savingRows={savingRows}
        />
      ) : (
        !loading && <p>No products found.</p>
      )}

      {data && (
        <div style={{ marginTop: "10px" }}>
          <button
            disabled={skip === 0}
            onClick={() => setSkip((prev) => Math.max(0, prev - 20))}
          >
            Prev
          </button>
          <span style={{ margin: "0 10px" }}>
            Showing {skip + 1} - {skip + data.products.length} of {data.total}
          </span>
          <button
            disabled={skip + 20 >= data.total}
            onClick={() => setSkip((prev) => prev + 20)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
