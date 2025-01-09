import { get, getJson } from "../tools"
import Choices from "choices.js"

export class MedicationView {
  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.copsacId = document.body.dataset.copsac
    this.addDurationInput()
    this.bind()
    const params = new URLSearchParams(location.search)
    window.history.replaceState(
      {},
      document.title,
      `${window.location.origin}${window.location.pathname}`,
    )
    const atc = params.get("atc")
    if (atc) {
      this.prefillForm(atc)
    }
    const vaccine = params.get("vaccine")
    if (vaccine) {
      this.prefillVaccineForm()
    }
  }

  bind() {
    const atcCodeSelector = document.querySelector("select[name=atc_code]")
    this.choice = new Choices(atcCodeSelector, {
      allowHTML: false,
      searchPlaceholderValue: "Search for ATC code",
      searchResultLimit: 60,
      searchFloor: 2,
      noChoicesText: "",
    })
    atcCodeSelector.addEventListener("search", async (event) => {
      const data = await this.lookUp(event.detail.value)
      this.choice.setChoices(data, "value", "label", true)
    })
    const deleteButton = document.querySelector("#delete")
    if (deleteButton) {
      const id = deleteButton.dataset.id
      deleteButton.addEventListener("click", () => {
        if (confirm(`Do you really want to delete this medication?`)) {
          return get(`/api/medication/delete/${this.copsacId}/${id}/`).then(
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
    return getJson(`/api/atc_code/search/${encodeURIComponent(term)}/`).then(
      ({ json }) =>
        json.atc_codes.map((atcCode) => ({
          value: atcCode[0],
          label: `${atcCode[1]} ${atcCode[2]}`,
        })),
    )
  }

  prefillForm(atc) {
    if (atc.substring(0, 3) === "J07") {
      // prefix J07 means "vaccine"
      this.prefillVaccineForm(false)
    }
    this.lookUp(atc).then((data) => {
      if (!data.length) {
        return
      }
      this.choice.setChoices(data, "value", "label", true)
      const preselected = data.find((item) => item.label.split(" ")[0] === atc)
      if (preselected) {
        this.choice.setChoiceByValue(preselected.value)
      }
    })
  }

  prefillVaccineForm(fillATC = true) {
    //document.querySelector("#duration").value = "1" TODO: make duration reappear.
    document.querySelector("#id_route").value = "Intramuscular"
    document.querySelector("#id_frequency").value = "1"
    document.querySelector("#id_dose").value = "1"
    document.querySelector("#id_unit").value = "U"

    if (fillATC) {
      this.lookUp("J07").then((data) => {
        if (!data.length) {
          return
        }
        this.choice.setChoices(data, "value", "label", true)
      })
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
      const duration = durationInput.value
      if (!duration) {
        return
      }
      const startDate = startDateInput.value
      if (!startDate) {
        endDateInput.value = ""
        return
      }
      const endDate = this.calculateEndDate(startDate, parseInt(duration))
      endDateInput.value = endDate
      //endDateInput.onchange()
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
