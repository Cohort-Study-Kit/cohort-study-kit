import { DiffDOM } from "diff-dom"

import { formTemplate } from "./templates.js"
import { postJson } from "../tools/index.js"
import { evaluateCode } from "./tools.js"
import { WCDateInput } from "./webcomponents"
import { getJson } from "../tools/index.js"

export class ExaminationForm {
  init() {
    this.dd = new DiffDOM({ maxChildCount: false })
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
    window.customElements.define("date-input", WCDateInput)
    this.rendering = false
    this.handlingChange = false
  }

  whenReady() {
    this.form = window.form
    this.formOptions = window.formOptions
    this.hasDataSchema = Boolean(this.formOptions.data_schema.properties)
    this.formOptions.warnings = []
    this.examination = window.examination
    if (this.hasDataSchema) {
      // prefill data with empty values
      this.examination.data = Object.fromEntries(
        Object.entries(this.formOptions.data_schema.properties).map(
          ([key, schema]) => {
            const value = this.examination.data[key]
            if (schema.type === "array") {
              return [key, value || []]
            }
            if (schema.type === "string") {
              return [key, value || ""]
            }
            return [key, value || null]
          },
        ),
      )
    } else {
      this.examination.column_data = Object.fromEntries(
        Object.keys(this.formOptions.columns).map((key) => [
          key,
          this.examination.column_data[key] || "",
        ]),
      )
    }
    this.shrinkGrid()
    this.render()
    this.bind()
  }

  shrinkGrid() {
    if (this.form.elements?.length) {
      const lastRow = Math.max(
        ...this.form.elements.map(
          (element) =>
            element.outer_coordinates.y + element.outer_coordinates.height,
        ),
      )
      const styleElement = document.createElement("style")
      styleElement.innerHTML = `.grid-content {grid-template-rows: repeat(${lastRow}, 7px);}\n`
      document.head.appendChild(styleElement)
    }
  }

  checkWarnings() {
    if (!this.form.warnings) {
      return
    }
    this.formOptions.warnings = this.form.warnings.filter((warning) =>
      evaluateCode(
        this.examination.data,
        this.examination.column_data,
        this.formOptions.external_values,
        warning.variables,
        warning.test,
      ),
    )
  }

  render() {
    if (this.rendering) {
      // already rendering, don't rerender
      return
    }
    this.rendering = true
    this.checkWarnings()
    const newSurveyForm = document.createElement("div")
    newSurveyForm.id = "survey-form-wrapper"
    newSurveyForm.innerHTML = formTemplate(
      this.form,
      this.examination,
      this.formOptions,
    )
    const surveyForm = document.querySelector("div#survey-form-wrapper")
    const diff = this.dd.diff(surveyForm, newSurveyForm)
    this.dd.apply(surveyForm, diff)
    this.rendering = false
  }

  bind() {
    if (this.examination.lock_status > 0) {
      // Disable all inputs
      document
        .querySelectorAll("input, select, textarea, button")
        .forEach((el) => el.setAttribute("disabled", "disabled"))
      return
    }
    const surveyForm = document.querySelector("#survey-form-wrapper")

    surveyForm.addEventListener("change", (event) => this.change(event))
    // We also capture input events to get changes from text input immediately
    surveyForm.addEventListener("input", (event) => this.change(event))

    surveyForm.addEventListener("click", (event) => this.click(event))

    // Save on enter
    document.addEventListener("keyup", (event) => {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault()
        this.submit()
      }
    })
  }

  click(event) {
    if (event.target.closest("button.json-schema-array-add-item")) {
      const type = event.target.dataset.type
      const path = event.target.dataset.path?.trim()
      const pathParts = path.split(" ")

      let schema = this.formOptions.data_schema
      let destination = this.examination.data
      pathParts.forEach((pathPart) => {
        schema = isNaN(pathPart) ? schema.properties[pathPart] : schema.items
        const pathSelector = isNaN(pathPart) ? pathPart : parseInt(pathPart)
        if (!destination[pathSelector]) {
          destination[pathSelector] =
            schema.type === "array" ? [] : schema.type === "object" ? {} : ""
        }
        destination = destination[pathSelector]
      })
      if (type === "array") {
        destination.push([])
      } else if (type === "object") {
        if (schema.items.type === "object" && schema.items.properties) {
          const newObject = Object.fromEntries(
            Object.keys(schema.items.properties).map((key) => [key, null]),
          )
          destination.push(newObject)
        } else {
          destination.push({})
        }
      } else {
        destination.push("")
      }
      this.render()
    } else if (event.target.closest("button.json-schema-array-remove-item")) {
      const path = event.target.dataset.path?.trim()
      const pathParts = path.split(" ")
      const itemNumber = parseInt(pathParts.pop())
      let destination = this.examination.data
      pathParts.forEach((pathPart) => {
        const pathSelector = isNaN(pathPart) ? pathPart : parseInt(pathPart)
        destination = destination[pathSelector]
      })
      destination.splice(itemNumber, 1)
      this.render()
    } else if (event.target.closest("button.submit-form")) {
      event.preventDefault()
      if (
        !this.examination.exceptional_values &&
        this.formOptions.warnings.length
      ) {
        return
      }
      this.submit()
    }
  }

  change(event) {
    if (this.handlingChange) {
      // already handling a change, don't rerender
      return
    }
    if (event.target.nodeName === "DATE-INPUT" && event.type === "input") {
      // Don't rerender while picking a date
      return
    }
    this.handlingChange = true
    const column = event.target.dataset.column
    const path = event.target.dataset.path?.trim()

    if (column) {
      // If the target is a checkbox, return 1 if it is checked, 0 otherwise
      // If the target is not a checkbox, return the value
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
            ? "1"
            : "0"
          : event.target.value
      this.examination.column_data[column] = value
    }
    if (path) {
      // If the target is a checkbox, return 1 if it is checked, 0 otherwise
      // If the target is not a checkbox, return the value
      let value =
        event.target.type === "checkbox"
          ? event.target.checked
            ? true
            : false
          : event.target.value
      const pathParts = path.split(" ")
      const name = pathParts.pop()
      let destination = this.examination.data
      let schema = this.formOptions.data_schema
      pathParts.forEach((pathPart) => {
        schema = isNaN(pathPart) ? schema.properties[pathPart] : schema.items
        const pathSelector = isNaN(pathPart) ? pathPart : parseInt(pathPart)
        if (!destination[pathSelector]) {
          destination[pathSelector] =
            schema.type === "array" ? [] : schema.type === "object" ? {} : ""
        }
        destination = destination[pathSelector]
      })
      schema = isNaN(name) ? schema.properties[name] : schema.items
      if (schema.type === "integer") {
        value = parseInt(value)
      } else if (schema.type === "number") {
        value = parseFloat(value)
      }
      if (["integer", "number"].includes(schema.type)) {
        if ("minimum" in schema && value < schema.minimum) {
          value = null
        }
        if ("maximum" in schema && value > schema.maximum) {
          value = null
        }
      }
      destination[name] = value
    } else if (
      Object.prototype.hasOwnProperty.call(this.examination, event.target.name)
    ) {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      this.examination[event.target.name] = value
      if (event.target.name === "startdate" && value) {
        // startdate has changed. If finishdate is set and before startdate, set finishdate to startdate
        if (
          this.examination.finishdate &&
          this.examination.finishdate < this.examination.startdate
        ) {
          this.examination.finishdate = this.examination.startdate
        }
        // potentially update external values for new startdate
        if (
          Object.keys(this.formOptions.external_values).filter(
            (externalValue) => !externalValue.startsWith("column$"),
          ).length
        ) {
          getJson(`/api/external_values/${this.examination.id}/${value}/`).then(
            ({ json }) => {
              this.formOptions.external_values = json
              this.render()
            },
          )
          event.preventDefault()
          this.handlingChange = false
          return // don't rerender yet
        }
      } else if (event.target.name === "finishdate" && value) {
        // finishdate has changed. If startdate is set and after finishdate, set startdate to finishdate
        if (
          this.examination.startdate &&
          this.examination.startdate > this.examination.finishdate
        ) {
          this.examination.startdate = this.examination.finishdate
        }
      }
    }
    event.preventDefault()
    this.render()
    this.handlingChange = false
  }

  submit() {
    return postJson(`/api/save_examination/`, {
      examination: this.examination,
    }).then(() => {
      if ("referrer" in document) {
        // preferred as it will refresh the page
        window.location = document.referrer
      } else {
        window.history.back()
      }
    })
  }
}
