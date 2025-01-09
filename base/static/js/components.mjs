import flatpickr from "flatpickr"

import { parseDate } from "./tools/index.js"

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input[type=date]").forEach((el) => {
    el.dataset.date = el.value
    const fEl = flatpickr(el, {
      altFormat: "d-m-Y",
      altInput: true,
      allowInput: true,
      parseDate,
      onClose: function (_selectedDates, dateStr) {
        if (!dateStr) {
          dateStr = ""
          fEl.input.value = dateStr
          fEl.altInput.value = dateStr
        }
        el.dataset.date = dateStr
      },
      errorHandler: function (_error) {},
    })
    if (el.hasAttribute("id")) {
      const id = el.id
      el.removeAttribute("id")
      fEl.altInput.id = id
      fEl.altInput.setAttribute("autocomplete", "off")
    }
    el.addEventListener("change", () => {
      if (el.value === el.dataset.date) {
        return
      }
      el.dataset.date = el.value
      fEl.setDate(el.value, true, "Y-m-d")
    })
  })
})
