import provinces from "provinces"

import { countryList, postCodes, get } from "../tools"

export class EducationalInstitutionView {
  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.copsacId = document.body.dataset.copsac
    this.populateCountrySelector()
    this.populateProvinceSelector()
    this.setForeignAddress()
    this.setCity()
    this.bind()
  }

  bind() {
    document.querySelector("#id_country").addEventListener("change", () => {
      this.populateProvinceSelector()
      this.setForeignAddress()
      this.setCity()
    })
    document.querySelector("#id_postcode").addEventListener("input", () => {
      this.setCity()
    })
    const deleteButton = document.querySelector("#delete")
    if (deleteButton) {
      const id = deleteButton.dataset.id
      deleteButton.addEventListener("click", () => {
        if (
          confirm(`Do you really want to delete this educational institution?`)
        ) {
          return get(
            `/api/educational_institution/delete/${this.copsacId}/${id}/`,
          ).then(({ status, redirected }) => {
            if (status === 200 && !redirected) {
              if ("referrer" in document) {
                // preferred as it will refresh the page
                window.location = document.referrer
              } else {
                window.history.back()
              }
            }
          })
        }
      })
    }
  }

  populateProvinceSelector() {
    const currentCountry = document.querySelector("#id_country").value || "DK"
    const provinceInput = document.querySelector("#id_province")
    const currentProvince = provinceInput.value
    const provinceSelector = document.createElement("select")
    provinceSelector.id = "id_province"
    provinceSelector.name = "province"
    provinceSelector.className = "form-control"
    provinceInput.parentNode.replaceChild(provinceSelector, provinceInput)
    const countryProvinces =
      currentCountry === "DK"
        ? []
        : provinces.filter((province) => province.country === currentCountry)
    provinceSelector.innerHTML = countryProvinces
      .map(
        (province) =>
          `<option value="${province.name}"${
            province.name === currentProvince ? " selected" : ""
          }>${province.name}</option>`,
      )
      .join("")
    const provinceGroup = document.querySelector("#div_id_province")
    if (countryProvinces.length) {
      provinceGroup.style.display = ""
    } else {
      provinceGroup.style.display = "none"
    }
  }

  populateCountrySelector() {
    const countryInput = document.querySelector("#id_country")
    const currentCountry = countryInput.value || "DK"
    const countrySelector = document.createElement("select")
    countrySelector.id = "id_country"
    countrySelector.name = "country"
    countrySelector.className = "form-control"
    countryInput.parentNode.replaceChild(countrySelector, countryInput)
    countrySelector.innerHTML = countryList
      .map(
        ([countryCode, countryName]) =>
          `<option value="${countryCode}"${
            countryCode === currentCountry ? " selected" : ""
          }>${countryName}</option>`,
      )
      .join("")
  }

  setForeignAddress() {
    const countrySelector = document.querySelector("#id_country")
    const currentCountry = countrySelector.value || "DK"
    const cityInput = document.querySelector("#id_city")
    if (currentCountry === "DK") {
      cityInput.setAttribute("readonly", true)
    } else {
      cityInput.removeAttribute("readonly")
    }
  }

  setCity() {
    const countrySelector = document.querySelector("#id_country")
    const currentCountry = countrySelector.value || "DK"
    if (currentCountry !== "DK") {
      return
    }
    const postCodeInput = document.querySelector("#id_postcode")
    const currentPostCode = parseInt(postCodeInput.value)
    const cityInput = document.querySelector("#id_city")
    const currentCity = postCodes[currentPostCode] || ""
    cityInput.value = currentCity
  }
}
