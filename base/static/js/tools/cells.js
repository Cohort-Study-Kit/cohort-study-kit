// Helper functions for cell formatting.
import { renderDate } from "./date"

// We use this dateCell function rather than Simple DataTables built-in date function
// because a lot of entries have an empty date. That throws off the normal sorting
// mechanism.
export const dateCell = (data) => {
  const date = data ? renderDate(data) : ""
  return {
    text: date,
    data,
    order: data?.length ? data : "1600‑01‑01",
  }
}
