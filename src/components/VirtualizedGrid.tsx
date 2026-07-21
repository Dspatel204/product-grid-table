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
      style={{
        height: viewportHeight,
        overflowY: "auto",
        position: "relative",
        border: "1px solid #ccc",
      }}
    >
      <div style={{ height: totalHeight, width: "100%", position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            left: 0,
            right: 0,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f5f5f5",
                  borderBottom: "2px solid #ddd",
                  height: "40px",
                }}
              >
                <th>Actions</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Category</th>
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
                    <td
                      style={{
                        padding: "8px",
                        borderBottom: "1px solid #ddd",
                        position: "relative",
                      }}
                    >
                      <input
                        type={type}
                        value={val}
                        style={{
                          border: err ? "1px solid red" : "1px solid #ccc",
                          width: "90%",
                          padding: "4px",
                        }}
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
                        <div
                          style={{
                            color: "red",
                            fontSize: "10px",
                            position: "absolute",
                            bottom: -2,
                          }}
                        >
                          {err}
                        </div>
                      )}
                    </td>
                  );
                };

                return (
                  <tr
                    key={product.id}
                    style={{
                      height: rowHeight,
                      background: isDirty ? "#fffde7" : "transparent",
                    }}
                  >
                    <td
                      style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                    >
                      <button
                        disabled={
                          !isDirty || hasError || savingRows[product.id]
                        }
                        onClick={() => onSaveRow(product.id)}
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
