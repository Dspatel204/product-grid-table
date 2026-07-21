import type { EditState } from "../types";

export const validateField = (
  field: keyof EditState,
  value: any,
): string | null => {
  if (value === undefined || value === null || value === "") return "Required";

  switch (field) {
    case "title":
      const str = String(value);
      if (str.trim() !== str) return "No leading/trailing spaces";
      if (str.length < 3 || str.length > 100) return "Length must be 3 to 100";
      break;
    case "price":
      const numPrice = Number(value);
      if (isNaN(numPrice) || numPrice <= 0 || numPrice > 999999)
        return "Must be > 0 and <= 999999";
      if (!/^\d+(\.\d{1,2})?$/.test(String(value)))
        return "Max 2 decimal places";
      break;
    case "stock":
      const numStock = Number(value);
      if (
        isNaN(numStock) ||
        !Number.isInteger(numStock) ||
        numStock < 0 ||
        numStock > 100000
      ) {
        return "Must be an integer between 0 and 100000";
      }
      break;
    case "rating":
      const numRating = Number(value);
      if (isNaN(numRating) || numRating < 0 || numRating > 5)
        return "Must be between 0 and 5";
      if (!/^\d+(\.\d{1})?$/.test(String(value))) return "Max 1 decimal place";
      break;
  }
  return null;
};
