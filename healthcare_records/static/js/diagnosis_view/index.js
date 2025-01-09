import { get, getJson } from "../tools"
import Choices from "choices.js"

export class DiagnosisView {
  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.copsacId = document.body.dataset.copsac
    this.addDurationInput()
    this.bind()
  }

  bind() {
    document
      .querySelector("#id_adverse_event")
      .addEventListener("click", () => this.setAdverseEvent())
    this.setAdverseEvent()
    const icdCodeSelector = document.querySelector("select[name=icd_code]")
    const choice = new Choices(icdCodeSelector, {
      allowHTML: false,
      searchPlaceholderValue: "Search for ICD code",
      searchResultLimit: 60,
      searchFloor: 2,
      noChoicesText: "",
    })
    icdCodeSelector.addEventListener("search", async (event) => {
      const data = await this.lookUp(event.detail.value)
      choice.setChoices(data, "value", "label", true)
    })
    const deleteButton = document.querySelector("#delete")
    if (deleteButton) {
      const id = deleteButton.dataset.id
      deleteButton.addEventListener("click", () => {
        if (confirm(`Do you really want to delete this diagnosis?`)) {
          return get(`/api/diagnosis/delete/${this.copsacId}/${id}/`).then(
            ({ status, redirected }) => {
              if (status === 200 && !redirected) {
                if ("referrer" in document) {
                  // preferred as it will refresh the page
                  window.location = document.referrer
                } else {
                  window.history.back()
                }
              }
            },
          )
        }
      })
    }
  }

  lookUp(term) {
    return getJson(`/api/icd_code/search/${encodeURIComponent(term)}/`).then(
      ({ json }) =>
        json.icd_codes.map((icdCode) => ({
          value: icdCode[0],
          label: `${icdCode[1]} ${icdCode[2]}`,
        })),
    )
  }

  setAdverseEvent() {
    const checkBox = document.getElementById("id_adverse_event")
    const intensity = document.getElementById("id_intensity")
    const action = document.getElementById("id_action")
    const causalityDVitamin = document.getElementById("id_causality_dvitamin")
    const causalityH1n1 = document.getElementById("id_causality_h1n1")
    const causalityAntibiotics = document.getElementById(
      "id_causality_antibiotics",
    )

    if (checkBox.checked == true) {
      intensity.disabled = false
      action.disabled = false
      causalityDVitamin.disabled = false
      causalityH1n1.disabled = false
      causalityAntibiotics.disabled = false
    } else {
      intensity.disabled = true
      intensity.value = ""
      action.disabled = true
      action.value = ""
      causalityDVitamin.disabled = true
      causalityDVitamin.value = ""
      causalityH1n1.disabled = true
      causalityH1n1.value = ""
      causalityAntibiotics.disabled = true
      causalityAntibiotics.value = ""
    }
  }

  addDurationInput() {
    const endDateSection = document.getElementById("div_id_end_date")
    endDateSection.insertAdjacentHTML(
      "afterend",
      `<div id="div_id_duration" class="mb-3">
        <label for="id_duration" class="form-label">Duration</label>
        <input type="number" name="duration" id="id_duration" class="form-control" placeholder="Specify duration">
      </div>`,
    )
    const durationInput = document.getElementById("id_duration")
    const endDateInput = document.querySelector("input[name=end_date]")
    const startDateInput = document.querySelector("input[name=start_date]")
    if (endDateInput.value && startDateInput.value) {
      const duration = this.calculateDuration(
        startDateInput.value,
        endDateInput.value,
      )
      durationInput.value = duration
    }
    endDateInput.addEventListener("change", () => {
      const startDate = startDateInput.value
      if (!startDate) {
        return
      }
      const endDate = endDateInput.value
      if (!endDate) {
        durationInput.value = ""
        return
      }
      if (startDate > endDate) {
        startDateInput.value = endDate
        durationInput.value = 1
        startDateInput.dispatchEvent(
          new CustomEvent("change", { bubbles: true }),
        )
        return
      }
      const duration = this.calculateDuration(startDate, endDate)
      durationInput.value = duration
    })
    durationInput.addEventListener("change", () => {
      const startDate = startDateInput.value
      if (!startDate) {
        return
      }
      const duration = durationInput.value
      if (!duration) {
        endDateInput.value = ""
        return
      }
      const endDate = this.calculateEndDate(startDate, parseInt(duration))
      endDateInput.value = endDate
      endDateInput.dispatchEvent(new CustomEvent("change", { bubbles: true }))
    })
    startDateInput.addEventListener("change", () => {
      let endDate = endDateInput.value

      if (endDate && startDate > endDate) {
        endDateInput.value = startDate
        durationInput.value = 1
        endDateInput.dispatchEvent(new CustomEvent("change", { bubbles: true }))
        return
      }

      const duration = durationInput.value
      if (!duration) {
        return
      }
      const startDate = startDateInput.value
      if (!startDate) {
        endDateInput.value = ""
        return
      }
      endDate = this.calculateEndDate(startDate, parseInt(duration))
      endDateInput.value = endDate
      endDateInput.dispatchEvent(new CustomEvent("change", { bubbles: true }))
    })
  }

  calculateDuration(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  calculateEndDate(startDate, duration) {
    const start = new Date(startDate)
    const end = new Date(startDate)
    end.setDate(start.getDate() + duration - 1)
    return end.toISOString().split("T")[0]
  }
}
