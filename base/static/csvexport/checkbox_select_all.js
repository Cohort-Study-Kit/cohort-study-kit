/**
 * Checkbox Select All Functionality for Django Admin CSV Export
 *
 * This script adds "Select All" functionality to checkbox groups in the CSV export form.
 * It only runs on the CSV export page and is scoped to avoid conflicts with other admin pages.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Only run on CSV export page - check for specific form elements
  const csvExportForm = document.querySelector(
    'form:has(input[name="csvexport"])',
  )
  if (!csvExportForm) {
    return // Not on CSV export page
  }

  // Find all select all checkboxes within the CSV export form
  const selectAllCheckboxes = csvExportForm.querySelectorAll(
    '[id$="_select_all"]',
  )

  if (selectAllCheckboxes.length === 0) {
    return
  }

  selectAllCheckboxes.forEach(function (selectAllCheckbox) {
    // Get the container ID by removing "_select_all" from the checkbox ID
    const containerId = selectAllCheckbox.id.replace("_select_all", "")
    const checkboxContainer = document.getElementById(containerId)

    if (!checkboxContainer) {
      console.warn("Checkbox container not found for:", containerId)
      return
    }

    // Find all checkboxes within the container (excluding the select all checkbox itself)
    const checkboxes = checkboxContainer.querySelectorAll(
      'input[type="checkbox"]:not([id$="_select_all"])',
    )

    if (checkboxes.length === 0) {
      console.warn("No checkboxes found in container:", containerId)
      return
    }

    // Function to update the select all checkbox state
    function updateSelectAllState() {
      const checkedCount = Array.from(checkboxes).filter(
        (cb) => cb.checked,
      ).length
      const totalCount = checkboxes.length

      if (checkedCount === 0) {
        selectAllCheckbox.checked = false
        selectAllCheckbox.indeterminate = false
      } else if (checkedCount === totalCount) {
        selectAllCheckbox.checked = true
        selectAllCheckbox.indeterminate = false
      } else {
        selectAllCheckbox.checked = false
        selectAllCheckbox.indeterminate = true
      }
    }

    // Function to handle select all checkbox click
    function handleSelectAllClick() {
      const shouldCheck =
        selectAllCheckbox.checked || selectAllCheckbox.indeterminate
      checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldCheck
      })
      // Clear indeterminate state when explicitly setting all
      selectAllCheckbox.indeterminate = false
    }

    // Add event listeners
    selectAllCheckbox.addEventListener("click", handleSelectAllClick)

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateSelectAllState)
    })

    // Initialize the select all state
    updateSelectAllState()
  })

  // Add visual enhancements specific to CSV export page
  const style = document.createElement("style")
  style.textContent = `
        /* These styles only apply to the CSV export page */
        form:has(input[name="csvexport"]) [id$="_select_all"] {
            transition: all 0.2s ease;
        }

        form:has(input[name="csvexport"]) [id$="_select_all"]:indeterminate {
            background-color: #ffc107;
            border-color: #ffc107;
        }

        form:has(input[name="csvexport"]) .checkbox-group label {
            transition: background-color 0.2s ease;
            padding: 4px 8px;
            border-radius: 3px;
        }

        form:has(input[name="csvexport"]) .checkbox-group label:hover {
            background-color: #f8f9fa;
        }
    `
  document.head.appendChild(style)
})
