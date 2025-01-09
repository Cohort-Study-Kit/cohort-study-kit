(() => { // webpackBootstrap
var __webpack_modules__ = ({
"./js/dataset/default.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DEFAULT_CONTENT: function() { return DEFAULT_CONTENT; }
});
const DEFAULT_CONTENT = {
  html: {
    html: "",
  },
  label: {
    text: "",
    tag: null,
    border_left: false,
    border_right: false,
    border_top: false,
    border_bottom: false,
    background: false,
  },
  input_question: {
    text: "",
    hide_text: false,
    input_type: "text_input",
    placement: "below",
    placeholder: "",
    column: false,
    caption: "",
    default_value: "",
  },
  data_question: {
    property: false,
  },
  single_column_question: {
    text: "",
    hide_text: false,
    placement: "below",
    options: [],
    options_orientation: "horizontal",
    input_type: "radio-buttons",
    column: false,
    caption: "",
  },
  multi_column_question: {
    text: "",
    hide_text: false,
    placement: "below",
    options: [],
    options_orientation: "horizontal",
  },
  show_value: {
    source: "",
    variables: [],
    text: "",
    hide_text: false,
  },
}


}),
"./js/dataset/form.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ExaminationForm: function() { return ExaminationForm; }
});
/* harmony import */var diff_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! diff-dom */ "./node_modules/.pnpm/diff-dom@5.1.4/node_modules/diff-dom/dist/module.js");
/* harmony import */var _templates_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./templates.js */ "./js/dataset/templates.js");
/* harmony import */var _tools_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tools/index.js */ "./js/tools/index.js");
/* harmony import */var _tools_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tools.js */ "./js/dataset/tools.js");
/* harmony import */var _webcomponents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./webcomponents */ "./js/dataset/webcomponents.js");








class ExaminationForm {
  init() {
    this.dd = new diff_dom__WEBPACK_IMPORTED_MODULE_0__.DiffDOM({ maxChildCount: false })
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
    window.customElements.define("date-input", _webcomponents__WEBPACK_IMPORTED_MODULE_4__.WCDateInput)
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
      (0,_tools_js__WEBPACK_IMPORTED_MODULE_3__.evaluateCode)(
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
    newSurveyForm.innerHTML = (0,_templates_js__WEBPACK_IMPORTED_MODULE_1__.formTemplate)(
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
          (0,_tools_index_js__WEBPACK_IMPORTED_MODULE_2__.getJson)(`/api/external_values/${this.examination.id}/${value}/`).then(
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
    return (0,_tools_index_js__WEBPACK_IMPORTED_MODULE_2__.postJson)(`/api/save_examination/`, {
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


}),
"./js/dataset/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DatasetFormWidget: function() { return /* reexport safe */ _widget__WEBPACK_IMPORTED_MODULE_1__.DatasetFormWidget; },
  ExaminationForm: function() { return /* reexport safe */ _form__WEBPACK_IMPORTED_MODULE_0__.ExaminationForm; }
});
/* harmony import */var _form__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./form */ "./js/dataset/form.js");
/* harmony import */var _widget__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./widget */ "./js/dataset/widget.js");




}),
"./js/dataset/templates.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  editFormTemplate: function() { return editFormTemplate; },
  formTemplate: function() { return formTemplate; },
  gridTemplate: function() { return gridTemplate; },
  menuItems: function() { return menuItems; }
});
/* harmony import */var he__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! he */ "./node_modules/.pnpm/he@1.2.0/node_modules/he/he.js");
/* harmony import */var he__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(he__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _tools__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tools */ "./js/dataset/tools.js");




const editFormTemplate = (value, options) => {
  if (!value.elements || !value.elements.length) {
    return `<ul class="form-menu">
      <li>
        <button class="addlink add-element">Add Element</button>
      </li>
      <li>
        <button class="upload-json">Upload</button>
      </li>
    </ul><h1>No form</h1>`
  }
  return `<div class="col grid"${
    options.scale
      ? ` style="transform: scale(${options.scale}); margin-bottom: ${
          (options.scale - 1) * 719
        }px; margin-right: ${(options.scale - 1) * 1238}px;"`
      : ""
  }>
    <div class="d-flex justify-content-center">
      <div class="grid-content edit-grid">${gridTemplate(
        value,
        options,
        false,
      )}</div>
    </div>
    <div class="grid-handle-bar"></div>
  </div>
  <ul class="form-menu">
    <li>
      <button class="show-content">
        ${options.showContent ? "Hide content" : "Show content"}
      </button>
    </li>
    <li>
      <button class="addlink add-element">Add Element</button>
    </li>
    <li>
      <button class="add-warning">Add warning</button>
    </li>
    <li>
      <button class="add-external-value">Add external value</button>
    </li>
    <li>
      <button class="download-json">Download</button>
    </li>
    <li>
      <button class="upload-json">Upload</button>
    </li>
  </ul>
  <div class="col bg-light p-0 sidebar">
    <h3>Elements in form <button class="show-elements-list">+</button></h3>
    ${
      options.showElementsList
        ? `<ul class="elements">
      ${value.elements
        .map((element) => elementListTemplate(element, options))
        .join("")}
      </ul>`
        : ""
    }
    <h3>Warnings <button class="show-warnings-list">+</button></h3>
    ${
      options.showWarningsList
        ? `<ul class="warnings">
        ${
          (value.warnings || [])
            .map(
              (warning) =>
                `<li class="${
                  options.selectedWarning === warning
                    ? "selected-warning selected-item"
                    : "unselected-item"
                }">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(warning.text)}</li>`,
            )
            .join("") || "<li><i>No warning messages</i></li>"
        }
      </ul>`
        : ""
    }
    <h3>External values <button class="show-external-values-list">+</button></h3>
    ${
      options.showExternalValuesList
        ? `<ul class="external-values">
        ${
          (value.external_values || [])
            .map(
              (externalValue) =>
                `<li class="${
                  options.selectedExternalValue === externalValue
                    ? "selected-external-value selected-item"
                    : "unselected-item"
                }">${(0,_tools__WEBPACK_IMPORTED_MODULE_1__.renderExternalValueName)(externalValue)}</li>`,
            )
            .join("") || "<li><i>No external values</i></li>"
        }
      </ul>`
        : ""
    }
  </div>
  ${
    options.selectedElement
      ? `<div class="selected-element-properties properties-form">${elementPropertiesFormTemplate(
          options.selectedElement,
          value,
          options,
        )}</div>`
      : options.selectedWarning
        ? `<div class="selected-warning-properties properties-form">${warningPropertiesFormTemplate(
            options.selectedWarning,
            value,
            options,
          )}</div>`
        : options.selectedExternalValue
          ? `<div class="selected-external-value-properties properties-form">${externalValuePropertiesFormTemplate(
              options.selectedExternalValue,
              options,
            )}</div>`
          : ""
  }
`
}

const formTemplate = (form, maindataVisit, formOptions) =>
  `<div class="row mb-2">
    <label for="id_startdate" class="col-1 text-end p-0">Start Date*</label>
    <div class="col-2">
        <date-input name="startdate" value="${
          maindataVisit.startdate || ""
        }" tabindex="1"></date-input>
    </div>
    ${
      formOptions.use_finishdate
        ? `<label for="id_finishdate" class="col-1 text-end p-0">End Date</label>
      <div class="col-2">
          <date-input name="finishdate" value="${
            maindataVisit.finishdate || ""
          }" tabindex="1"></date-input>
      </div>`
        : ""
    }
    <label for="id_status" class="col-1 text-end p-0">Status</label>
    <div class="col-2">
        <select name="status" class="form-select" tabindex="3" id="id_status">
            ${[
              ["none", ""],
              ["completed", "Completed"],
              ["planned", "Planned"],
              ["incomplete", "Incomplete"],
              ["not_applicable", "Not applicable"],
              ["ongoing", "Ongoing"],
              ["not_done", "Not done"],
              ["unavailable", "Unavailable"],
              ["defective", "Defective"],
            ]
              .filter((option) => formOptions.status_choices[option[0]])
              .map(
                (option) =>
                  `<option value="${option[0]}"${
                    maindataVisit.status === option[0] ? " selected" : ""
                  }>${option[1]}</option>`,
              )}
        </select>
    </div>
</div>
${
  form.elements && form.elements.length
    ? `<div id="grid"><div class="grid-content">${gridTemplate(
        form,
        {
          showContent: true,
          readOnly: true,
          rowHeight: 7,
          columnWidth: 12,
          warnings: formOptions.warnings || [],
          externalValues: formOptions.external_values || [],
          data_schema: formOptions.data_schema || {},
        },
        maindataVisit,
      )}</div></div>`
    : formOptions.data_schema.properties
      ? renderJsonSchemaForm(
          "",
          "",
          maindataVisit.data,
          formOptions.data_schema,
        )
      : Object.entries(maindataVisit.column_data)
          .map(
            ([column, value]) =>
              `<div class="p-3 h-100 d-inline-block w-50">
        <div class="d-flex justify-content-between">
            <label for="column-${column}" class="form-label">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              formOptions.columns[column].title,
            )}</label>
            <input type="text" id="column-${column}" name="${column}" data-column="${column}" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              value,
            )}">
        </div>
    </div>`,
          )
          .join("")
}
<hr>
<div class="row mb-2">
    <div class="col-4">
        <label for="id_comments" class="form-label">Comment</label>
        <textarea name="comments" cols="40" rows="3" class="form-control" maxlength="1000" id="id_comments" spellcheck="false">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
          maindataVisit.comments,
        )}</textarea>
    </div>
</div>
<span class="me-5 form-check">
    <label for="id_exceptional_values" class="form-label">Contains exceptional values?</label>
    <input type="checkbox" name="exceptional_values" class="form-check-input" id="id_exceptional_values"${
      maindataVisit.exceptional_values ? " checked" : ""
    }>
</span>
${
  formOptions.warnings && formOptions.warnings.length
    ? `<div class="warnings"><h5>Warnings</h5><ul>
    ${formOptions.warnings
      .map((warning) => `<li>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(warning.text)}</li>`)
      .join("")}
  </ul></div>`
    : ""
}
<div class="row justify-content-between">
    <div class="col">
        <button class="btn btn-success submit-form" type="submit" ${
          formOptions.warnings &&
          formOptions.warnings.length &&
          !maindataVisit.exceptional_values
            ? "disabled"
            : ""
        }>
            Save (Enter)
        </button>
    </div>
    <div class="col d-flex justify-content-end">
        <a class="btn btn-danger"
           href="javascript:history.back()"
           type="submit">
            Back
        </a>
    </div>
</div>`

const gridTemplate = (value, options, maindataVisit) =>
  value.elements
    .map((element) => elementTemplate(element, options, maindataVisit))
    .join("")

const elementTemplate = (element, options, maindataVisit) => {
  return `<div class="grid-item outer main" style="
    grid-column: ${element.outer_coordinates.x} / span ${
      element.outer_coordinates.width
    };
    grid-row: ${element.outer_coordinates.y} / span ${
      element.outer_coordinates.height
    };
    z-index: 5;
    ${
      maindataVisit &&
      element.conditions.length &&
      !(0,_tools__WEBPACK_IMPORTED_MODULE_1__.evaluateConditions)(
        maindataVisit.data,
        maindataVisit.column_data,
        options.externalValues,
        element.conditions,
      )
        ? "display: none;"
        : ""
    }
  ">
    <div class="${element.background ? "card " : ""}h-100 overflow-hidden ${
      element.content.border_left ? "border-start " : ""
    }${element.content.border_right ? "border-end " : ""}${
      element.content.border_top ? "border-top " : ""
    }${element.content.border_bottom ? "border-bottom " : ""} rounded-0">
        <div class="card-body p-0 overflow-hidden" ${
          options.readOnly ? "" : 'role="button"'
        }>
            <div class="h-100 w-100 overflow-hidden" style="display: grid; grid-template-rows: repeat(${
              element.outer_coordinates.height
            }, ${options.rowHeight}px); grid-template-columns: repeat(${
              element.outer_coordinates.width
            }, ${options.columnWidth}px);${
              options.readOnly ? "" : " grid-gap: 1px;"
            }">
                <div class="grid-item overflow-hidden ${
                  options.showContent ? "" : "p-1"
                } ${
                  options.selectedElement === element
                    ? "selected-element selected-item"
                    : "unselected-item"
                }" style="
                  grid-column: ${element.inner_coordinates.x} / span ${
                    element.inner_coordinates.width
                  };
                  grid-row: ${element.inner_coordinates.y} / span ${
                    element.inner_coordinates.height
                  };
                  z-index: 5;
                ">
                  ${
                    options.showContent
                      ? renderContentObject(
                          element.content,
                          maindataVisit,
                          options,
                        )
                      : `${he__WEBPACK_IMPORTED_MODULE_0___default().encode(element.label)}
                    <span class="badge rounded-pill bg-light text-black">Main</span>`
                  }
                </div>
                ${element.sub_elements
                  .map((subElement) => {
                    return `<div class="grid-item outer sub ${
                      options.showContent ? "" : "p-1 border"
                    } ${
                      options.selectedElement === subElement
                        ? "selected-element selected-item"
                        : "unselected-item"
                    }"
                    ${options.readOnly ? "" : 'role="button"'}
                    style="
                      grid-column: ${subElement.outer_coordinates.x} / span ${
                        subElement.outer_coordinates.width
                      };
                      grid-row: ${subElement.outer_coordinates.y} / span ${
                        subElement.outer_coordinates.height
                      };
                      z-index: 5;
                      ${
                        maindataVisit &&
                        subElement.conditions.length &&
                        !(0,_tools__WEBPACK_IMPORTED_MODULE_1__.evaluateConditions)(
                          maindataVisit.data,
                          maindataVisit.column_data,
                          options.externalValues,
                          subElement.conditions,
                        )
                          ? "display: none;"
                          : ""
                      }
                    ">
                    ${
                      options.showContent
                        ? renderContentObject(
                            subElement.content,
                            maindataVisit,
                            options,
                          )
                        : `${he__WEBPACK_IMPORTED_MODULE_0___default().encode(subElement.label)}
                      <span class="badge rounded-pill bg-light text-black">Sub</span>`
                    }
                  </div>`
                  })
                  .join("")}
      </div>
    </div>
  </div>
</div>`
}

const elementListTemplate = (element, options) => {
  return `<li class="item main ${
    options.selectedElement === element
      ? "selected-element selected-item"
      : "unselected-item"
  }">
    ${displayType[element.content.type]}: ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(element.label)}
    ${
      element.sub_elements.length
        ? `<ul class="elements">${element.sub_elements
            .map((subElement) => {
              return `<li class="item sub ${
                options.selectedElement === subElement
                  ? "selected-element selected-item"
                  : "unselected-item"
              }">${displayType[subElement.content.type]}: ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                subElement.label,
              )}</li>`
            })
            .join("")}</ul>`
        : ""
    }
  </li>`
}

const renderJsonSchemaForm = (
  path, // path to the property
  name, // name of the property
  value, // value of the property
  schema,
  required = false,
) => {
  let returnString = ""
  switch (schema.type) {
    case "object":
      returnString += `<div class="json-schema-object">`
      Object.entries(schema.properties).forEach(([key, property]) => {
        returnString += `<div class="p-2 d-flex justify-content-between">
            ${renderJsonSchemaForm(
              `${path} ${key}`,
              key,
              value[key],
              property,
              schema.required?.includes(key),
            )}
        </div>`
      })
      returnString += `</div>`
      break
    case "array":
      returnString += `<div class="json-schema-array">`
      if (value) {
        value.forEach((item, index) => {
          returnString += `<div class="border border-secondary mb-1 json-schema-array-item">
            ${renderJsonSchemaForm(
              `${path} ${index}`,
              `${name}-${index}`,
              item,
              schema.items,
            )}
            <button class="btn btn-danger btn-sm m-1 json-schema-array-remove-item" data-path="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              path,
            )} ${index}">Remove ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(schema.title || name)}</button>
          </div>`
        })
      }
      returnString += `<button class="btn btn-primary btn-sm json-schema-array-add-item" data-path="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        path,
      )}" data-type="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(schema.items.type)}">Add ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        schema.title || name,
      )}</button>`
      returnString += `</div>`
      break
    case "string":
      returnString += `<label for="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        path.replaceAll(" ", "-"),
      )}" class="form-label ${required ? "requiredField" : ""}">
        ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(schema.title || name)} ${
          required ? `<span class="asteriskField">*</span>` : ""
        }
        </label>
        ${
          schema.choices
            ? `<div class="col-auto"><select class="select form-select form-control" data-path="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                path,
              )}" id="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(path.replaceAll(" ", "-"))}">
            <option value="">---------</option>
            ${schema.choices.map(
              (choice) =>
                `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(choice)}" ${
                  value === choice ? "selected" : ""
                }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(choice)}</option>`,
            )}
          </select></div>`
            : `<div class="col-auto"><input type="text" id="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                path.replaceAll(" ", "-"),
              )}" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                value || "",
              )}" class="form-control vTextField form-control" data-path="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                path,
              )}"></div>`
        }`
      break
    case "number":
    case "integer":
      returnString += `<label for="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        path.replaceAll(" ", "-"),
      )}" class="form-label ${required ? "requiredField" : ""}">
        ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(schema.title || name)} ${
          required ? `<span class="asteriskField">*</span>` : ""
        }
      </label>
      <div class="col-auto">
        <input type="number" id="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
          path.replaceAll(" ", "-"),
        )}" value="${
          value || ""
        }" class="form-control vTextField" data-path="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(path)}"
        ${"minimum" in schema ? `min="${schema.minimum}"` : ""}
        ${"maximum" in schema ? `max="${schema.maximum}"` : ""}
        ${
          schema.multipleOf
            ? `step="${schema.multipleOf}"`
            : `step="${schema.type === "number" ? "0.001" : "1"}"`
        }
        >
      </div>`
      break
    case "boolean":
      returnString += `<label for="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        path.replaceAll(" ", "-"),
      )}" class="form-label ${required ? "requiredField" : ""}">
        ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(schema.title || name)} ${
          required ? `<span class="asteriskField">*</span>` : ""
        }
      </label>
      <div class="col-auto"><input type="checkbox" class="form-check-input" id="question-${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        path.replaceAll(" ", "-"),
      )}" ${value ? "checked" : ""} data-path="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(path)}"></div>`
      break
    default:
      returnString += ""
      break
  }
  return returnString
}

const renderContentObject = (
  contentObject,
  maindataVisit = false,
  renderOptions,
) => {
  let returnString
  switch (contentObject.type) {
    case "html":
      returnString = contentObject.html.replaceAll("\\/", "/")
      break
    case "label":
      returnString = contentObject.text
        ? contentObject.tag
          ? `<${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.tag)}>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              contentObject.text,
            )}</${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.tag)}>`
          : he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.text)
        : ""
      break
    case "input_question": {
      let value, warning

      if (maindataVisit) {
        value = maindataVisit.column_data[contentObject.column]
        warning = renderOptions.warnings.find((warning) =>
          warning.variables.includes(contentObject.column),
        )
      }
      if (!value) {
        value = contentObject.default_value || ""
      }
      returnString = `<div class="p-2 h-100${warning ? " warning" : ""}">${
        contentObject.input_type === "text_input"
          ? `<div class="${
              contentObject.placement === "right_of"
                ? "d-flex justify-content-between"
                : ""
            }">
            ${
              contentObject.hide_text || !contentObject.text
                ? ""
                : `<label class="form-label text-wrap"
                     title="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.caption)}"
                     for="question-${contentObject.column}">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                       contentObject.text,
                     )}</label>`
            }
            <div class="col-auto">
              <div class="input-group"
                ${
                  contentObject.width > 0
                    ? `style="width: ${contentObject.width}px;"`
                    : ""
                }>
                <input class="form-control"
                  id="question-${contentObject.column}"
                  placeholder="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.placeholder)}"
                  name="question-${contentObject.column}"
                  data-column="${contentObject.column}"
                  tabindex="${
                    contentObject.tabindex > 0
                      ? contentObject.tabindex + 3
                      : contentObject.tabindex
                  }"
                  type="text"
                  value="${value}"
                  ${maindataVisit?.readonly ? "disabled" : ""}>
              </div>
            </div>
          </div>`
          : `<div class="h-100 d-flex flex-column">
            ${
              contentObject.hide_text || !contentObject.text
                ? ""
                : `<label class="form-label" for="question-${
                    contentObject.column
                  }">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.text)}</label>`
            }
            <textarea class="form-control flex-grow-1 "
              id="question-${contentObject.column}"
              name="question-${contentObject.column}"
              data-column="${contentObject.column}"
              tabindex="${
                contentObject.tabindex > 0
                  ? contentObject.tabindex + 3
                  : contentObject.tabindex
              }"
              ${maindataVisit?.readonly ? "disabled" : ""}>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                value,
              )}</textarea>
          </div>`
      }</div>`
      break
    }
    case "data_question": {
      let value, warning
      if (maindataVisit) {
        value = maindataVisit.data[contentObject.property]
        warning = renderOptions.warnings.find((warning) =>
          warning.variables.includes(contentObject.property),
        )
      }
      returnString = `<div class="p-2 h-100${
        warning ? " warning" : ""
      } overflow-auto d-flex justify-content-between">
            ${renderJsonSchemaForm(
              contentObject.property,
              contentObject.property,
              value,
              renderOptions.data_schema.properties[contentObject.property],
            )}
        </div>`
      break
    }
    case "single_column_question": {
      let warning
      if (maindataVisit) {
        const value = maindataVisit.column_data[contentObject.column]
        warning = renderOptions.warnings.find((warning) =>
          warning.variables.includes(contentObject.column),
        )
        contentObject.options.forEach((option) => {
          if (option.db_value === value) {
            option.checked = true
          } else {
            option.checked = false
          }
        })
      } else {
        // For previewing
        contentObject.options.forEach((option) => {
          option.checked = false
        })
      }
      returnString = `<div class="p-2${warning ? " warning" : ""}">
      ${
        contentObject.input_type === "radio-buttons"
          ? `${
              contentObject.hide_text || !contentObject.text
                ? ""
                : `<label class="form-label d-block" title="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                    contentObject.caption,
                  )}">
              ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.text)}
          </label>`
            }

        ${contentObject.options
          .map(
            (option) =>
              `<div class="form-check${
                contentObject.options_orientation === "horizontal"
                  ? " form-check-inline"
                  : ""
              }">
              <label>
                  <input class="form-check-input"
                         name="question-${contentObject.column}"
                         data-column="${contentObject.column}"
                         tabindex="${
                           contentObject.tabindex > 0
                             ? contentObject.tabindex + 3
                             : contentObject.tabindex
                         }"
                         type="radio"
                         value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(option.db_value)}"
                         ${option.checked ? "checked" : ""}
                         ${maindataVisit?.readonly ? "disabled" : ""}
                  >
                  ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(option.text)}
              </label>
          </div>`,
          )
          .join("")}`
          : `<div class="${
              contentObject.placement === "right_of"
                ? "d-flex justify-content-between"
                : ""
            }">
          ${
            contentObject.hide_text || !contentObject.text
              ? ""
              : `<label class="form-label text-wrap" for="question-${
                  contentObject.column
                }" title="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.caption)}">
                ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.text)}
            </label>`
          }
          <div class="col-auto">
            <div class="input-group"
              ${
                contentObject.width > 0
                  ? `style="width: ${contentObject.width}px;"`
                  : ""
              }
            >
              <select class="form-select"
                id="question-${contentObject.column}"
                name="question-${contentObject.column}"
                data-column="${contentObject.column}"
                tabindex="${
                  contentObject.tabindex > 0
                    ? contentObject.tabindex + 3
                    : contentObject.tabindex
                }"
                ${
                  contentObject.width > 0
                    ? `style="width: ${contentObject.width}px;"`
                    : ""
                }
                ${maindataVisit?.readonly ? "disabled" : ""}>
                <option value=''></option>
                ${contentObject.options
                  .map(
                    (option) =>
                      `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(option.db_value)}"
                            ${option.checked ? "selected" : ""}>${
                              option.text
                            }</option>`,
                  )
                  .join("")}
              </select>
            </div>
          </div>
        </div>`
      }
      </div>`
      break
    }
    case "multi_column_question": {
      const options = contentObject.options
      let warning
      options.forEach((option) => {
        if (renderOptions.warnings && !warning) {
          warning = renderOptions.warnings.find((warning) =>
            warning.variables.includes(option.column),
          )
        }
        if (maindataVisit && maindataVisit.column_data[option.column] === "1") {
          option.checked = true
        } else {
          option.checked = false
        }
      })
      returnString = `<div class="${warning ? "warning " : ""}p-2">
          ${
            contentObject.hide_text || !contentObject.text
              ? ""
              : `<p class="form-label">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.text)}</p>`
          }
          ${options
            .map(
              (option) =>
                `<div class="form-check${
                  contentObject.options_orientation === "horizontal"
                    ? " form-check-inline"
                    : ""
                }">
                  <label>
                      <input class="form-check-input"
                             id="option-${option.column}"
                             name="question-${contentObject.column}"
                             data-column="${option.column}"
                             tabindex="${
                               contentObject.tabindex > 0
                                 ? contentObject.tabindex + 3
                                 : contentObject.tabindex
                             }"
                             type="checkbox"
                             value="${option.column}"
                             ${option.checked ? "checked" : ""}
                             ${maindataVisit.readonly ? "disabled" : ""}
                        >
                        ${option.text}
                    </label>
              </div>`,
            )
            .join("")}
        </div>`
      break
    }
    case "show_value": {
      let value = ""
      if (maindataVisit) {
        value = (0,_tools__WEBPACK_IMPORTED_MODULE_1__.evaluateCode)(
          maindataVisit.data,
          maindataVisit.column_data,
          renderOptions.externalValues,
          contentObject.variables,
          contentObject.source,
        )
      }
      returnString = `<p class="m-2">
        ${
          contentObject.hide_text || !contentObject.text
            ? ""
            : `<strong>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(contentObject.text)}</strong>: `
        }
        ${he__WEBPACK_IMPORTED_MODULE_0___default().encode(String(value))}
      </p>`
      break
    }
    default:
      returnString = ""
      break
  }
  return returnString
}

const displayType = {
  html: "HTML",
  label: "Label",
  input_question: "Input Question",
  data_question: "Data Question",
  single_column_question: "Single Column Question",
  multi_column_question: "Multiple Column Question",
  show_value: "Show Value",
}

const warningPropertiesFormTemplate = (warning, value, options) => {
  const availableVariables = (0,_tools__WEBPACK_IMPORTED_MODULE_1__.getAvailableVariableNames)(
    options.data_schema.properties,
    options.columns,
    value.external_values,
  )
  const warningTestSize = (0,_tools__WEBPACK_IMPORTED_MODULE_1__.getTextWidthAndHeight)(warning.test)
  return `<h1>Warning</h1>
  <div class="mb-3 warning-properties">
    <label class="form-label requiredField">
      Message <span class="asteriskField">*</span>
      <input type="text" name="text" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        warning.text,
      )}" class="label vTextField">
    </label>
  </div>
  <div class="mb-3 warning-properties">
    <label class="form-label requiredField">
      Test <span class="asteriskField">*</span>
      <textarea type="text" name="test" rows="${
        warningTestSize.height
      }" cols="${warningTestSize.width}" class="label user-code ${
        (0,_tools__WEBPACK_IMPORTED_MODULE_1__.checkUserCode)(
          options.data_schema.properties,
          options.columns,
          value.external_values,
          warning.test,
        )
          ? "valid"
          : "invalid"
      }">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(warning.test)}</textarea>
    </label>
    <p><i>Available variables: ${availableVariables.join(", ")}</i></p>
  </div>
  <div class="submit-row">
    <button class="button btn-danger delete-selected-warning">
      Delete
    </button>
  </div>`
}

const externalValuePropertiesFormTemplate = (externalValue, options) => {
  const type = externalValue.type
  let template = `<h1>External value</h1>
    <div class="mb-3 external-value-properties">
        <label class="form-label requiredField">
          Type <span class="asteriskField">*</span>
          <select name="value-type" class="select form-select">
            <option value="">---------</option>
            ${["column", "property", "diagnose", "medication"]
              .map(
                (valueType) =>
                  `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(valueType)}" ${
                    type === valueType ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(valueType)}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>`
  if (type === "column") {
    const dataset = externalValue.dataset || ""
    const column = externalValue.column || ""
    const datasetOptions = [
      ...new Set(
        options.external_columns.map(
          (externalColumn) => externalColumn.dataset,
        ),
      ),
    ]
    const columnOptions = options.external_columns
      .filter((externalColumn) => externalColumn.dataset === dataset)
      .map((externalColumn) => externalColumn.column)
    template += `<div class="mb-3 external-value-properties">
        <label class="form-label requiredField">
          Dataset <span class="asteriskField">*</span>
          <select name="value-dataset" class="select form-select">
            <option value="">---------</option>
            ${datasetOptions
              .map(
                (datasetOption) =>
                  `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(datasetOption)}" ${
                    dataset === datasetOption ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(datasetOption)}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>
      <div class="mb-3 external-value-properties">
        <label class="form-label requiredField">
          Column <span class="asteriskField">*</span>
          <select name="value-column" class="select form-select">
            <option value="">---------</option>
            ${columnOptions
              .map(
                (columnOption) =>
                  `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(columnOption)}" ${
                    column === columnOption ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(columnOption)}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>`
  } else if (type === "property") {
    const dataset = externalValue.dataset || ""
    const property = externalValue.property || ""
    const datasetOptions = options.external_properties.map(
      (externalProperty) => externalProperty.dataset,
    )
    const propertyOptions = (
      options.external_properties.find(
        (externalProperty) => externalProperty.dataset === dataset,
      ) || { properties: [] }
    ).properties
    template += `<div class="mb-3 external-value-properties">
        <label class="form-label requiredField">
          Dataset <span class="asteriskField">*</span>
          <select name="value-dataset" class="select form-select">
            <option value="">---------</option>
            ${datasetOptions
              .map(
                (datasetOption) =>
                  `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(datasetOption)}" ${
                    dataset === datasetOption ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(datasetOption)}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>
      <div class="mb-3 external-value-properties">
        <label class="form-label requiredField">
          Property <span class="asteriskField">*</span>
          <select name="value-property" class="select form-select">
            <option value="">---------</option>
            ${propertyOptions
              .map(
                (propertyOption) =>
                  `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(propertyOption)}" ${
                    property === propertyOption ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(propertyOption)}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>`
  } else {
    const code = externalValue.code || ""
    template += `<div class="mb-3 warning-properties">
      <label class="form-label requiredField">
        Code <span class="asteriskField">*</span>
        <input type="text" name="value-code" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
          code,
        )}" class="label vTextField">
      </label>
    </div>`
  }
  template += `<div class="submit-row">
      <button class="button btn-danger delete-selected-external-value">
        Delete
      </button>
    </div>`
  return template
}

const elementPropertiesFormTemplate = (element, value, options) => {
  const availableVariables = (0,_tools__WEBPACK_IMPORTED_MODULE_1__.getAvailableVariableNames)(
    options.data_schema.properties,
    options.columns,
    value.external_values,
  )
  let returnString = `<h1>${displayType[element.content.type]}</h1>
  <div id="div_id_label" class="mb-3">
    <label class="form-label requiredField">
      Label <span class="asteriskField">*</span>
      <input type="text" name="label" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
        element.label,
      )}" maxlength="255" class="label vTextField">
    </label>
  </div>`
  switch (element.content.type) {
    case "html":
      returnString += `<div id="div_id_html" class="mb-3">
        <label class="form-label requiredField">
          HTML <span class="asteriskField">*</span>
          <textarea name="html" cols="40" rows="10" class="html vTextField">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
            element.content.html.replaceAll("\\/", "/"),
          )}</textarea>
        </label>
      </div>`
      break
    case "label":
      returnString += `<div class="mb-3">
        <label class="form-label requiredField"> Text <span class="asteriskField">*</span>
          <textarea name="text" cols="40" rows="10" class="textarea form-control" spellcheck="true">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
            element.content.text,
          )}</textarea>
        </label>
      </div>
      <div class="mb-3">
        <div class="mb-3">
          <label class="form-check-label">
            <input type="checkbox" name="background" class="background checkboxinputt" ${
              element.content.background ? "checked" : ""
            }>
            Background
          </label>
        </div>
      </div>
      <div class="mb-3">
        <div class="mb-3">
          <label class="form-check-label">
            <input type="checkbox" name="border_left" class="border_left checkboxinput" ${
              element.content.border_left ? "checked" : ""
            }>
            Border left
          </label>
        </div>
      </div>
      <div class="mb-3">
        <div class="mb-3">
          <label class="form-check-label">
            <input type="checkbox" name="border_right" class="border_right checkboxinput" ${
              element.content.border_right ? "checked" : ""
            }>
            Border right
          </label>
        </div>
      </div>
      <div class="mb-3">
        <div class="mb-3">
          <label class="form-check-label">
            <input type="checkbox" name="border_top" class="border_top checkboxinput" ${
              element.content.border_top ? "checked" : ""
            }>
            Border top
          </label>
        </div>
      </div>
      <div class="mb-3">
        <div class="mb-3">
          <label class="form-check-label">
            <input type="checkbox" name="border_bottom" class="border_bottom checkboxinput" ${
              element.content.border_bottom ? "checked" : ""
            }>
            Border bottom
          </label>
        </div>
      </div>
      <div class="mb-3">
        <label for="id_tag" class="form-label">
          Tag
          <select name="tag" class="select form-select">
            <option value="">---------</option>
            <option value="h1" ${
              element.content.tag === "h1" ? "selected" : ""
            }>H1</option>
            <option value="h2" ${
              element.content.tag === "h2" ? "selected" : ""
            }>H2</option>
            <option value="h3" ${
              element.content.tag === "h3" ? "selected" : ""
            }>H3</option>
            <option value="h4" ${
              element.content.tag === "h4" ? "selected" : ""
            }>H4</option>
            <option value="h5" ${
              element.content.tag === "h5" ? "selected" : ""
            }>H5</option>
            <option value="h6" ${
              element.content.tag === "h6" ? "selected" : ""
            }>H6</option>
            <option value="strong" ${
              element.content.tag === "strong" ? "selected" : ""
            }>Strong</option>
          </select>
        </label>
      </div>`
      break
    case "input_question": {
      returnString += `<div class="mb-3">
          <label class="form-label requiredField">
            Text <span class="asteriskField">*</span>
            <input type="text" name="text" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              element.content.text,
            )}" maxlength="255" class="text vTextField">
          </label>
        </div>
        <div class="mb-3">
          <div class="mb-3">
            <label class="form-check-label">
              <input type="checkbox" name="hide_text" class="hide_text" ${
                element.content.hide_text ? "checked" : ""
              }>
              Hide text
            </label>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label requiredField"> Column <span class="asteriskField">*</span>
            <select name="column" class="select form-select">
              <option value="">------------</option>
              ${options.columns
                .map((column) => {
                  return `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(String(column[0]))}" ${
                    column[0] === element.content.column ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(column[1])}</option>`
                })
                .join("")}
            </select>
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label">
            Caption
            <input type="text" name="caption" class="caption vTextField" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              element.content.caption,
            )}">
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label requiredField"> Input type <span class="asteriskField">*</span>
            <select name="input_type" class="select form-select">
              <option value="text_input" ${
                element.content.input_type === "text_input" ? "selected" : ""
              }>Text input</option>
              <option value="textarea" ${
                element.content.input_type === "textarea" ? "selected" : ""
              }>Textarea</option>
            </select>
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label requiredField"> Placement <span class="asteriskField">*</span>
            <select name="placement" class="select form-select">
              <option value="below" ${
                element.content.placement === "below" ? "selected" : ""
              }>Below</option>
              <option value="right_of" ${
                element.content.placement === "right_of" ? "selected" : ""
              }>Right of</option>
            </select>
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label requiredField">
            Width <span class="asteriskField">*</span>
            <input type="number" name="width" value="${
              element.content.width
            }" class="width vTextField" title="The size of the element in number of columns. 0 equals automatic sizing.">
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label requiredField">
            Tabindex <span class="asteriskField">*</span>
            <input type="number" name="tabindex" value="${
              element.content.tabindex
            }" class="tabindex vTextField">
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label">
            Placeholder
            <input type="text" name="placeholder" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              element.content.placeholder || "",
            )}" maxlength="255" class="placeholder vTextField">
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label">
            Default value
            <input type="text" name="default_value" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
              element.content.default_value,
            )}" maxlength="255" class="default_value vTextField">
          </label>
        </div>`
      break
    }
    case "data_question": {
      returnString += `<div class="mb-3">
          <label class="form-label requiredField"> Property <span class="asteriskField">*</span>
            <select name="property" class="select form-select">
              <option value="">------------</option>
              ${Object.keys(options.data_schema.properties)
                .map((property) => {
                  return `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(property)}" ${
                    property === element.content.property ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(property)}</option>`
                })
                .join("")}
            </select>
          </label>
        </div>`
      break
    }
    case "single_column_question": {
      returnString += `<div class="flex-container">
        <label>
          Text*:
          <input type="text" name="text" class="text vTextField" maxlength="1000" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
            element.content.text,
          )}">
        </label>
      </div>
      <div class="flex-container">
        <label>
          Hide text:
          <input type="checkbox" name="hide_text" class="hide_text" ${
            element.content.hide_text ? "checked" : ""
          }>
        </label>
      </div>
      <div class="flex-container">
        <label>
          Column*:
          <select class="column" name="column">
            <option value="">------------</option>
            ${options.columns
              .map(
                (column) =>
                  `<option value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(String(column[0]))}" ${
                    column[0] === element.content.column ? "selected" : ""
                  }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(column[1])}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>
      <div class="flex-container">
        <label>
          Caption:
          <input type="text" name="caption" class="caption vTextField" maxlength="1000" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
            element.content.caption,
          )}">
        </label>
      </div>
      <div class="flex-container">
        <label>
          Input type*:
          <select class="input_type" name="input_type">
            <option value="">------------</option>
            <option value="radio-buttons" ${
              element.content.input_type === "radio-buttons" ? "selected" : ""
            }>Radio buttons</option>
            <option value="select" ${
              element.content.input_type === "select" ? "selected" : ""
            }>Select</option>
          </select>
        </label>
      </div>
      <div class="flex-container">
        <label>Placement*:
          <select class="placement" name="placement">
            <option value="">------------</option>
            <option value="below" ${
              element.content.placement === "below" ? "selected" : ""
            }>Below</option>
            <option value="right_of" ${
              element.content.placement === "right_of" ? "selected" : ""
            }>Right of</option>
          </select>
        </label>
      </div>
      <div class="flex-container">
        <label>
          Width*:
          <input type="number" name="width" class="width vTextField" value="${
            element.content.width
          }" title="The size of the element in number of columns. 0 equals automatic sizing.">
        </label>
      </div>
      <div class="flex-container">
        <label>
          Tab index*:
          <input type="number" name="tabindex" class="tabindex vTextField" value="${
            element.content.tabindex
          }">
        </label>

      </div>
      <div class="flex-container">
        <label>
          Options orientation*:
          <select class="options_orientation" name="options_orientation">
            <option value="">------------</option>
            <option value="vertical" ${
              element.content.options_orientation === "vertical"
                ? "selected"
                : ""
            }>Vertical</option>
            <option value="horizontal" ${
              element.content.options_orientation === "horizontal"
                ? "selected"
                : ""
            }>Horizontal</option>
          </select>
        </label>
      </div>
      <div id="options-wrapper">
        <div id="options">
          ${element.content.options.map(
            (option) =>
              `<div class="option-form-wrapper">
              <div class="d-flex">
                <div>
                  <button class="btn btn-sm btn-light option-sort-up" type="button">↑</button>
                </div>
                <div>
                  <button class="btn btn-sm btn-light option-sort-down" type="button">↓</button>
                </div>
                <div class="mb-3">
                  <label class="form-label requiredField">
                    Choice<span class="asteriskField">*</span>
                    <input type="text" name="option-text" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                      option.text,
                    )}" class="vTextField">
                  </label>
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    Value
                    <input type="text" name="option-db_value" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                      option.db_value,
                    )}" class="vTextField">
                  </label>
                </div>
                <div class="d-flex align-items-center">
                  <button class="inline-deletelink option-delete" type="button">x</button>
                </div>
              </div>
            </div>`,
          )}
        </div>
        <p class="text-muted text-center">
          <small>Minimum of two options required.</small>
        </p>
        <button class="button btn-primary option-db_value-add">
          + Add option
        </button>
      </div>`
      break
    }
    case "multi_column_question": {
      returnString += `<div class="flex-container">
        <label>
          Text*:
          <input type="text" name="text" class="text vTextField" maxlength="1000" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
            element.content.text,
          )}">
        </label>
      </div>
      <div class="flex-container">
        <label>
          Hide text:
          <input type="checkbox" name="hide_text" class="hide_text" ${
            element.content.hide_text ? "checked" : ""
          }>
        </label>
      </div>
      <div class="flex-container">
        <label>
          Tab index*:
          <input type="number" name="tabindex" class="tabindex vTextField" value="${
            element.content.tabindex
          }">
        </label>

      </div>
      <div class="flex-container">
        <label>
          Options orientation*:
          <select class="options_orientation" name="options_orientation">
            <option value="">------------</option>
            <option value="vertical" ${
              element.content.options_orientation === "vertical"
                ? "selected"
                : ""
            }>Vertical</option>
            <option value="horizontal" ${
              element.content.options_orientation === "horizontal"
                ? "selected"
                : ""
            }>Horizontal</option>
          </select>
        </label>
      </div>
      <div id="options-wrapper">
        <div id="options">
          ${element.content.options.map(
            (option) =>
              `<div class="option-form-wrapper">
              <div class="d-flex">
                <div>
                  <button class="btn btn-sm btn-light option-sort-up" type="button">↑</button>
                </div>
                <div>
                  <button class="btn btn-sm btn-light option-sort-down" type="button">↓</button>
                </div>
                <div class="mb-3">
                  <label class="form-label requiredField">
                    Choice<span class="asteriskField">*</span>
                    <input type="text" name="option-text" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
                      option.text,
                    )}" class="vTextField">
                  </label>
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    Column
                    <select class="column" name="option-column">
                      <option value="">------------</option>
                      ${options.columns
                        .map(
                          (column) =>
                            `<option value="${option.column}" ${
                              column[0] === option.column ? "selected" : ""
                            }>${he__WEBPACK_IMPORTED_MODULE_0___default().encode(column[1])}</option>`,
                        )
                        .join("")}
                    </select>
                  </label>
                </div>
                <div class="d-flex align-items-center">
                  <button class="inline-deletelink option-delete" type="button">x</button>
                </div>
              </div>
            </div>`,
          )}
        </div>
        <p class="text-muted text-center">
          <small>Minimum of two options required.</small>
        </p>
        <button class="button btn-primary option-column-add">
          + Add option
        </button>
      </div>`
      break
    }
    case "show_value": {
      const contentSourceSize = (0,_tools__WEBPACK_IMPORTED_MODULE_1__.getTextWidthAndHeight)(element.content.source)
      returnString += `<div class="mb-3">
        <label class="form-label requiredField">
          Text <span class="asteriskField">*</span>
          <input type="text" name="text" value="${he__WEBPACK_IMPORTED_MODULE_0___default().encode(
            element.content.text || "",
          )}" maxlength="255" class="text vTextField">
        </label>
      </div>
      <div class="mb-3">
        <div class="mb-3">
          <label class="form-check-label">
            <input type="checkbox" name="hide_text" class="hide_text" ${
              element.content.hide_text ? "checked" : ""
            }>
            Hide text
          </label>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label requiredField">
          Source <span class="asteriskField">*</span>
          <textarea type="text" name="source" rows="${
            contentSourceSize.height
          }" cols="${contentSourceSize.width}" class="source user-code ${
            (0,_tools__WEBPACK_IMPORTED_MODULE_1__.checkUserCode)(
              options.data_schema.properties,
              options.columns,
              value.external_values,
              element.content.source,
            )
              ? "valid"
              : "invalid"
          }">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(element.content.source)}</textarea>
        </label>
        <p><i>Available variables: ${availableVariables.join(", ")}</i></p>
      </div>`
      break
    }
    default:
      break
  }
  returnString += `
  <div class="coordinates" class="w-100 d-flex justify-content-center gap-3">
    <div class="d-flex flex-column"> Outer coordinates: <div class="d-flex flex-column">
        <div class="d-flex">
          <div> X: <input class="vTextField" type="number" name="outer_coordinates-x" autocomplete="off" value="${
            element.outer_coordinates.x
          }">
          </div>
          <div> Y: <input class="vTextField" type="number" name="outer_coordinates-y" autocomplete="off" value="${
            element.outer_coordinates.y
          }">
          </div>
        </div>
        <div class="d-flex">
          <div> Width: <input class="vTextField"  type="number" name="outer_coordinates-width" autocomplete="off" value="${
            element.outer_coordinates.width
          }">
          </div>
          <div> Height: <input class="vTextField" type="number" name="outer_coordinates-height" autocomplete="off" value="${
            element.outer_coordinates.height
          }">
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex flex-column"> Inner coordinates: <div class="d-flex flex-column">
        <div class="d-flex">
          <div> X: <input class="vTextField" type="number" name="inner_coordinates-x" autocomplete="off" value="${
            element.inner_coordinates.x
          }">
          </div>
          <div> Y: <input class="vTextField" type="number" name="inner_coordinates-y" autocomplete="off" value="${
            element.inner_coordinates.y
          }">
          </div>
        </div>
        <div class="d-flex">
          <div> Width: <input class="vTextField" type="number" name="inner_coordinates-width" autocomplete="off" value="${
            element.inner_coordinates.width
          }">
          </div>
          <div> Height: <input class="vTextField" type="number" name="inner_coordinates-height" autocomplete="off" value="${
            element.inner_coordinates.height
          }">
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="conditions-wrapper">
    <h2>Conditions</h2>
    <div id="conditions">
      ${element.conditions
        .map((condition) => {
          const conditionCodeSize = (0,_tools__WEBPACK_IMPORTED_MODULE_1__.getTextWidthAndHeight)(condition.code)
          return `<div class="condition-form-wrapper">
          <div class="d-flex">
            <div class="mb-3">
              <label class="form-label">
                Condition
                <textarea type="text" name="condition-code" rows="${
                  conditionCodeSize.height
                }" cols="${conditionCodeSize.width}" class="code user-code ${
                  (0,_tools__WEBPACK_IMPORTED_MODULE_1__.checkUserCode)(
                    options.data_schema.properties,
                    options.columns,
                    value.external_values,
                    condition.code,
                  )
                    ? "valid"
                    : "invalid"
                }">${he__WEBPACK_IMPORTED_MODULE_0___default().encode(condition.code)}</textarea>
              </label>
            </div>
            <div class="d-flex align-items-center">
              <button class="inline-deletelink condition-delete" type="button">x</button>
            </div>
          </div>
        </div>`
        })
        .join("")}
      <p><i>Available variables: ${availableVariables.join(", ")}</i></p>
      </div>
      <button class="button btn-primary condition-add">
        + Add condition
      </button>
    </div>
    <div class="submit-row">
      <button class="button btn-danger delete-selected-element">
        Delete
      </button>
    </div>
  </div>`
  return returnString
}

const menuItems = (datasetForm) => {
  const menuItems = [
    {
      label: "Label",
      callback: (_event) => {
        datasetForm.addElement("label")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    },
    {
      label: "HTML",
      callback: (_event) => {
        datasetForm.addElement("html")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    },
    {
      label: "Show Value",
      callback: (_event) => {
        datasetForm.addElement("show_value")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    },
  ]
  if (datasetForm.hasDataSchema) {
    menuItems.push({
      label: "Question",
      callback: (_event) => {
        datasetForm.addElement("data_question")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    })
  } else {
    menuItems.push({
      label: "Input Question",
      callback: (_event) => {
        datasetForm.addElement("input_question")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    })
    menuItems.push({
      label: "Single Column Question",
      callback: (_event) => {
        datasetForm.addElement("single_column_question")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    })
    menuItems.push({
      label: "Multiple Column Question",
      callback: (_event) => {
        datasetForm.addElement("multi_column_question")
        datasetForm.render()
        datasetForm.options.onChange()
      },
    })
  }
  return menuItems
}


}),
"./js/dataset/tools.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  checkUserCode: function() { return checkUserCode; },
  countPreviousSiblings: function() { return countPreviousSiblings; },
  evaluateCode: function() { return evaluateCode; },
  evaluateConditions: function() { return evaluateConditions; },
  findCodeVariables: function() { return findCodeVariables; },
  formatDate: function() { return formatDate; },
  getAvailableVariableNames: function() { return getAvailableVariableNames; },
  getTextWidthAndHeight: function() { return getTextWidthAndHeight; },
  renderExternalValueName: function() { return renderExternalValueName; },
  validateJavascript: function() { return validateJavascript; }
});
/* harmony import */var acorn__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! acorn */ "./node_modules/.pnpm/acorn@8.12.0/node_modules/acorn/dist/acorn.mjs");
/* harmony import */var estree_walker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! estree-walker */ "./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/index.js");
/* harmony import */var he__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! he */ "./node_modules/.pnpm/he@1.2.0/node_modules/he/he.js");
/* harmony import */var he__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(he__WEBPACK_IMPORTED_MODULE_2__);
//import { parse } from "@babel/parser"




const BUILTINS = {
  Math: [
    "abs",
    "acos",
    "acosh",
    "asin",
    "asinh",
    "atan",
    "atanh",
    "atan2",
    "ceil",
    "cbrt",
    "expm1",
    "clz32",
    "cos",
    "cosh",
    "exp",
    "floor",
    "fround",
    "log",
    "log1p",
    "log10",
    "log2",
    "max",
    "min",
    "pow",
    "random",
    "round",
    "sign",
    "sin",
    "sinh",
    "sqrt",
    "tan",
    "tanh",
    "trunc",
  ],
  Number: [
    "isFinite",
    "isInteger",
    "isSafeInteger",
    "parseFloat",
    "parseInt",
    "EPSILON",
    "MAX_SAFE_INTEGER",
    "MAX_VALUE",
    "MIN_SAFE_INTEGER",
    "MIN_VALUE",
    "NEGATIVE_INFINITY",
    "NaN",
    "POSITIVE_INFINITY",
    "prototype",
  ],
  String: ["fromCharCode", "fromCodePoint", "raw"],
  Array: ["from", "isArray", "of"],
  Object: [
    "assign",
    "create",
    "defineProperties",
    "defineProperty",
    "entries",
    "freeze",
    "getOwnPropertyDescriptor",
    "getOwnPropertyDescriptors",
    "getOwnPropertyNames",
    "getOwnPropertySymbols",
    "getPrototypeOf",
    "is",
    "isExtensible",
    "isFrozen",
    "isSealed",
    "keys",
    "preventExtensions",
    "seal",
    "setPrototypeOf",
    "values",
  ],
  parseInt: true,
  isNaN: true,
  parseFloat: true,
}

const countPreviousSiblings = (element) => {
  let count = 0
  while (element.previousElementSibling) {
    count++
    element = element.previousElementSibling
  }
  return count
}

const getAvailableVariableNames = (
  properties,
  columns,
  externalValues,
) => {
  if (properties && Object.keys(properties).length) {
    // Use data schema
    return Object.keys(properties)
      .concat(
        externalValues.map((externalValue) =>
          renderExternalValueName(externalValue),
        ),
      )
      .toSorted()
  } else {
    // Use columns
    return columns
      .map((column) => column[0])
      .concat(
        externalValues.map((externalValue) =>
          renderExternalValueName(externalValue),
        ),
      )
      .toSorted()
  }
}

const evaluateConditions = (
  propertyData,
  columnData,
  externalValues,
  conditions,
) => {
  return conditions
    .map((condition) => {
      return evaluateCode(
        propertyData,
        columnData,
        externalValues,
        condition.variables,
        condition.code,
      )
    })
    .every((result) => result)
}

const formatDate = (date) => {
  if (!date) {
    return " "
  }
  return `${date.slice(8, 10)}-${date.slice(5, 7)}-${date.slice(0, 4)}`
}

const checkUserCode = (
  properties,
  columns,
  externalValues,
  userCode,
) => {
  const availableVariables = getAvailableVariableNames(
    properties,
    columns,
    externalValues,
  )

  const javaScriptAnalysis = validateJavascript(userCode, availableVariables)

  if (!javaScriptAnalysis.validSyntax) {
    console.warn(
      "Syntax error in user code.: ",
      javaScriptAnalysis.errorMessage,
    )
    return false
  }

  if (javaScriptAnalysis.undeclaredVariables.length) {
    console.warn(
      "Undeclared variables in user code: ",
      javaScriptAnalysis.undeclaredVariables,
    )
    return false
  }

  return true
}

const validateJavascript = (code, declaredVariables) => {
  // Level 1: Check for basic syntax errors
  try {
    new Function(code) // Attempt to create a function from the code
  } catch (error) {
    return { validSyntax: false, errorMessage: error.message }
  }

  // Level 2: Check for undeclared variables
  const undeclaredVariables = []
  const functionScopes = []
  let currentScope = declaredVariables.slice()

  // Parse the code using an AST parser
  const ast = (0,acorn__WEBPACK_IMPORTED_MODULE_0__.parse)(code, { ecmaVersion: 2023 })

  function traverseAST(node) {
    ;(0,estree_walker__WEBPACK_IMPORTED_MODULE_1__.walk)(node, {
      enter(node) {
        switch (node.type) {
          case "VariableDeclaration": {
            const name = node.declarations[0].id.name
            // Check if already declared in current or outer scopes
            if (currentScope.includes(name)) {
              console.warn(`Variable '${name}' is declared multiple times.`)
            } else {
              currentScope.push(name)
            }
            break
          }
          case "ArrowFunctionExpression":
          case "FunctionDeclaration": {
            functionScopes.push(currentScope)
            currentScope = node.params
              .filter((node) => node.type === "Identifier")
              .map((node) => node.name)
            traverseAST(node.body)
            currentScope = functionScopes.pop()
            this.skip()
            break
          }
          case "MemberExpression":
            {
              const { object, property } = node
              if (
                object.type === "Identifier" &&
                property.type === "Identifier"
              ) {
                const { name: objectName } = object
                const { name: propertyName } = property
                if (
                  !(
                    Object.keys(BUILTINS).includes(objectName) &&
                    BUILTINS[objectName].includes(propertyName)
                  ) &&
                  !currentScope.includes(objectName) &&
                  functionScopes.every((scope) => !scope.includes(objectName))
                  // TODO: check if property name exists in object
                ) {
                  console.warn(
                    `Variable '${objectName}.${propertyName}' is not declared.`,
                  )
                  undeclaredVariables.push(`${objectName}.${propertyName}`)
                }
                traverseAST(node.arguments)
                this.skip()
              }
            }
            break
          case "Identifier": {
            const { name } = node
            if (
              !Object.keys(BUILTINS).includes(name) &&
              !currentScope.includes(name) &&
              functionScopes.every((scope) => !scope.includes(name))
            ) {
              console.warn(`Variable '${name}' is not declared.`)
              undeclaredVariables.push(name)
            }
            break
          }
          default:
            break
        }
      },
    })
  }

  traverseAST(ast)

  return {
    validSyntax: true,
    undeclaredVariables,
  }
}

const findCodeVariables = (userCode) => {
  let ast
  try {
    ast = (0,acorn__WEBPACK_IMPORTED_MODULE_0__.parse)(userCode, { ecmaVersion: 2023 })
  } catch (e) {
    return []
  }
  const variables = [],
    localVariables = []

  function traverseAST(node) {
    ;(0,estree_walker__WEBPACK_IMPORTED_MODULE_1__.walk)(node, {
      enter(node) {
        switch (node.type) {
          case "VariableDeclaration": {
            const name = node.declarations[0].id.name
            // Check if already declared in current or outer scopes
            if (localVariables.includes(name)) {
              console.warn(`Variable '${name}' is declared multiple times.`)
            } else {
              localVariables.push(name)
            }
            break
          }
          case "ArrowFunctionExpression":
          case "FunctionDeclaration": {
            this.skip()
            break
          }
          case "MemberExpression":
            {
              const { object, property } = node
              if (
                object.type === "Identifier" &&
                property.type === "Identifier"
              ) {
                const { name: objectName } = object
                const { name: propertyName } = property
                if (
                  !(
                    Object.keys(BUILTINS).includes(objectName) &&
                    BUILTINS[objectName].includes(propertyName)
                  ) &&
                  !localVariables.includes(objectName)
                  // TODO: check if property name exists in object
                ) {
                  variables.push(objectName)
                }
                traverseAST(node.arguments)
                this.skip()
              }
            }
            break
          case "Identifier": {
            const { name } = node
            if (
              !Object.keys(BUILTINS).includes(name) &&
              !localVariables.includes(name) &&
              !variables.includes(name)
            ) {
              variables.push(name)
            }
            break
          }
          default:
            break
        }
      },
    })
  }

  traverseAST(ast)
  return variables
}

const evaluateCode = (
  propertyData,
  columnData,
  externalValues,
  variables,
  userCode,
) => {
  let notFoundVariables = false
  const variableInitiationCode = variables
    .map((variable) => {
      let value = ""
      if (variable.includes("$")) {
        if (!Object.prototype.hasOwnProperty.call(externalValues, variable)) {
          notFoundVariables = true
          return ""
        }
        value = externalValues[variable]
        if (variable.startsWith("column$")) {
          value = isNaN(value)
            ? `"${value}"`
            : value.length
              ? parseFloat(value)
              : String(Boolean(value))
        } else if (typeof value === "string") {
          value = `"${value}"`
        }
      } else {
        if (Object.prototype.hasOwnProperty.call(propertyData, variable)) {
          value = JSON.stringify(propertyData[variable])
        } else if (Object.prototype.hasOwnProperty.call(columnData, variable)) {
          value = columnData[variable]
          value = isNaN(value)
            ? `"${value}"`
            : value.length
              ? parseFloat(value)
              : String(Boolean(value))
        } else {
          notFoundVariables = true
          return ""
        }
      }
      return `const ${variable} = ${value};`
    })
    .join("")
  if (notFoundVariables) {
    // Not all variables are actually present. We skip the test.
    return NaN
  }
  return eval(variableInitiationCode + userCode)
}

const renderExternalValueName = (externalValue) => {
  if (externalValue.type === "column") {
    return `column$${he__WEBPACK_IMPORTED_MODULE_2___default().encode(externalValue.dataset || "")}$${he__WEBPACK_IMPORTED_MODULE_2___default().encode(
      externalValue.column || "",
    )}`
  } else if (externalValue.type === "property") {
    return `property$${he__WEBPACK_IMPORTED_MODULE_2___default().encode(externalValue.dataset || "")}$${he__WEBPACK_IMPORTED_MODULE_2___default().encode(
      externalValue.property || "",
    )}`
  } else {
    return `${externalValue.type}$${he__WEBPACK_IMPORTED_MODULE_2___default().encode(externalValue.code || "")}`
  }
}

const getTextWidthAndHeight = (text) => {
  const lines = text.split("\n")
  const numberOfLines = lines.length
  const maxLineLength = Math.max(...lines.map((line) => line.length))
  return {
    width: maxLineLength,
    height: numberOfLines,
  }
}


}),
"./js/dataset/webcomponents.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  WCDateInput: function() { return WCDateInput; }
});
/* harmony import */var _tools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools */ "./js/tools/index.js");


/**
 * Based on https://github.com/annoyingmouse/wc-date-input/blob/main/wc-date-input.js
 * Copyright (c) 2023 Dominic Myers (MIT)
 * Based on: https://design-system.service.gov.uk/components/date-input/
 */
class WCDateInput extends HTMLElement {
  #day = 0
  #month = 0
  #year = 0
  #dayText = "Day"
  #monthText = "Month"
  #yearText = "Year"

  static get observedAttributes() {
    return [
      "value",
      "min",
      "max",
      "disabled",
      "readonly",
      "required",
      "data-day-text",
      "data-month-text",
      "data-year-text",
      "data-error-text",
    ]
  }

  static formAssociated = true

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.shadow = this.attachShadow({
      mode: "open",
      delegatesFocus: true,
    })
    this.shadow.innerHTML = `${this.css}${this.html}`
    this.pattern = new RegExp(
      "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
    )
    this.warnedMin = false
    this.warnedMax = false
    this.disabled = false
    this.dayInput = this.shadow.querySelector("#day")
    this.monthInput = this.shadow.querySelector("#month")
    this.yearInput = this.shadow.querySelector("#year")
    this.errorTextElements = this.shadow.querySelectorAll(
      ".can-have-user-error",
    )
    this.errorMessageElement = this.shadow.querySelector("#error-message")
    this.forDay = this.shadow.querySelector('label[for="day"]')
    this.forMonth = this.shadow.querySelector('label[for="month"]')
    this.forYear = this.shadow.querySelector('label[for="year"]')
  }

  connectedCallback() {
    this.dayInput.addEventListener("blur", () => {
      this.updateDayValue()
    })
    this.dayInput.addEventListener("focus", () => {
      this.dayInput.select()
    })
    this.dayInput.addEventListener("beforeinput", (event) => {
      this.onBeforeinput(event, "day")
    })
    this.dayInput.addEventListener("input", (event) => {
      this.onInput(event, "day")
    })
    this.monthInput.addEventListener("blur", () => {
      this.updateMonthValue()
    })
    this.monthInput.addEventListener("focus", () => {
      this.monthInput.select()
    })
    this.monthInput.addEventListener("beforeinput", (event) => {
      this.onBeforeinput(event, "month")
    })
    this.monthInput.addEventListener("input", (event) => {
      this.onInput(event, "month")
    })
    this.yearInput.addEventListener("blur", () => {
      this.updateYearValue()
    })
    this.yearInput.addEventListener("focus", () => {
      this.yearInput.select()
    })
    this.yearInput.addEventListener("beforeinput", (event) => {
      this.onBeforeinput(event, "year")
    })
    this.yearInput.addEventListener("input", (event) => {
      this.onInput(event, "year")
    })
    this.updateInputs()
  }

  onBeforeinput(event, inputFieldName) {
    if (!event.data) {
      return
    }
    if (!/^\d+$/.test(event.data)) {
      // non-numeric
      event.preventDefault()
      if (event.inputType === "insertText") {
        if (inputFieldName === "day") {
          this.monthInput.focus()
        } else if (inputFieldName === "month") {
          this.yearInput.focus()
        }
      } else if (event.inputType === "insertFromPaste") {
        const date = (0,_tools__WEBPACK_IMPORTED_MODULE_0__.parseDate)(event.data)
        if (date) {
          this.value = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 10)
        }
      }
    }
  }

  onInput(event, inputFieldName) {
    // check for too large number
    if (inputFieldName === "day" && this.dayInput.value.length > 2) {
      this.dayInput.value = this.dayInput.value.slice(0, 2)
    } else if (inputFieldName === "month" && this.monthInput.value.length > 2) {
      this.monthInput.value = this.monthInput.value.slice(0, 2)
    } else if (inputFieldName === "year" && this.yearInput.value.length > 4) {
      this.yearInput.value = this.yearInput.value.slice(0, 2)
    }
  }

  updateInputs() {
    this.dayInput.value = `${this.#day ? this.#day : ""}`
    this.monthInput.value = `${this.#month ? this.#month : ""}`
    this.yearInput.value = `${this.#year ? this.#year : ""}`
    if (this.#day) {
      this.updateDayValue()
    }
    if (this.#month) {
      this.updateMonthValue()
    }
    if (this.#year) {
      this.updateYearValue()
    }
  }

  get css() {
    return `
      <style>
        .date-input {
          font-family: arial, sans-serif;
          position: relative;
        }
        .date-input:after {
          content: "";
          display: block;
          clear: both;
        }
        .date-input.user-error::before {
          content: "";
          left: -15px;
          width: 5px;
          height: 100%;
          opacity: 1;
          background: #D4352C;
          position: absolute;
        }
        .form-group-holder {
          display: grid;
          grid-template-columns: 2.75em 2.75em 4em;
          gap: 0% 1em;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group:after {
          content: "";
          display: block;
          clear: both;
        }
        label {
          display: block;
          font-weight: normal;
          font-size: .85em;
          line-height: 2em;
          margin-bottom: .2em;
          text-size-adjust: 100%;
          font-smoothing: antialiased;
        }
        label.user-error {
          color: #D4352C;
        }
        input {
          height: 2em;
          margin-top: 0;
          line-height: 1em;
          border: 1px solid #ced4da;
          padding-left: .5em;
          border-radius: 0.25rem;
        }
        input.user-error {
          border-color: #D4352C;
        }
        input.error {
          border-color: #D4352C;
        }
        input:focus {
          box-shadow: 0 0 0 .25rem rgba(255,50,50,.75);
        }
        span.can-have-user-error {
          display: none;
        }
        span.can-have-user-error.user-error {
          display: block;
          color: #D4352C;
          font-size: .85em;
          margin-top: .5em;
        }
      </style>
    `
  }

  get html() {
    return `
      <div class="date-input can-have-user-error${
        this.errorText ? " user-error" : ""
      }">
        <div class="form-group-holder">
          <div class="form-group">
            <label for="day"
                   class="can-have-user-error${
                     this.errorText ? " user-error" : ""
                   }">
              ${this.dayText}
            </label>
            <input id="day"
                   class="can-have-user-error${
                     this.errorText ? " user-error" : ""
                   }"
                   name="day"
                   type="text"
                   min="1"
                   max="31"
                   pattern="^((0?[1-9])|([12][0-9])|(3[01]))$"
                   ${this.disabled ? "disabled" : ""}
                   ${this.readonly ? "readonly" : ""}
                   value="${this.#day ? this.#day : ""}"
                   inputmode="numeric"
                   data-form-type="date,day"
                   tabindex="0" />
          </div>
          <div class="form-group">
            <label for="month"
                   class="can-have-user-error${
                     this.errorText ? " user-error" : ""
                   }">
              ${this.monthText}
            </label>
            <input id="month"
                   class="can-have-user-error${
                     this.errorText ? " user-error" : ""
                   }"
                   name="month"
                   type="text"
                   min="1"
                   max="12"
                   pattern="^((0[1-9])|(1[0-2]))$"
                   ${this.disabled ? "disabled" : ""}
                   ${this.readonly ? "readonly" : ""}
                   value="${this.#month ? this.#month : ""}"
                   inputmode="numeric"
                   data-form-type="date,month"
                   tabindex="0" />
          </div>
          <div class="form-group year-input">
            <label for="year"
                   class="can-have-user-error${
                     this.errorText ? " user-error" : ""
                   }">
              ${this.yearText}
            </label>
            <input id="year"
                   class="can-have-user-error${
                     this.errorText ? " user-error" : ""
                   }"
                   name="year"
                   type="text"
                   pattern="^\\d{4}$"
                   ${this.disabled ? "disabled" : ""}
                   ${this.readonly ? "readonly" : ""}
                   value="${this.#year ? this.#year : ""}"
                   inputmode="numeric"
                   data-form-type="date,year"
                   tabindex="0" />
          </div>
        </div>
        <span class="can-have-user-error${this.errorText ? " user-error" : ""}">
          <strong id="error-message">${this.errorText}</strong>
        </span>
      </div>
    `
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "required":
        if (oldValue !== newValue) {
          this.required = newValue !== null
        }
        break
      case "disabled":
        if (oldValue !== newValue) {
          this.disabled = newValue !== null
        }
        break
      case "readonly":
        if (oldValue !== newValue) {
          this.readonly = newValue !== null
        }
        break
      case "value":
        if (oldValue !== newValue) {
          this.value = newValue
          this.populateDate()
        }
        break
      case "min":
        if (oldValue !== newValue) {
          this.min = newValue !== null ? newValue : null
          if (this.min) {
            if (new Date(this.value).getTime() <= this.min.getTime()) {
              this.value = ""
              this.#day = 0
              this.#month = 0
              this.#year = 0
              this.populateDate()
            }
          }
        }
        break
      case "max":
        if (oldValue !== newValue) {
          this.max = newValue !== null ? newValue : null
          if (this.max) {
            if (new Date(this.value).getTime() >= this.max.getTime()) {
              this.value = ""
              this.#day = 0
              this.#month = 0
              this.#year = 0
              this.populateDate()
            }
          }
        }
        break
      case "data-day-text":
        if (oldValue !== newValue) {
          this.forDay.innerText = this.dayText
        }
        break
      case "data-month-text":
        if (oldValue !== newValue) {
          this.forMonth.innerText = this.monthText
        }
        break
      case "data-year-text":
        if (oldValue !== newValue) {
          this.forYear.innerText = this.yearText
        }
        break
      case "data-error-text":
        if (oldValue !== newValue) {
          if (newValue) {
            this.errorTextElements.forEach((element) => {
              element.classList.add("user-error")
              this.errorMessageElement.innerText = newValue
            })
          } else {
            this.errorTextElements.forEach((element) => {
              element.classList.remove("user-error")
              this.errorMessageElement.innerText = ""
            })
          }
        }
    }
  }

  isLeapYear(year) {
    if (!year) return false
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  createDateString() {
    if (this.#year && this.#month && this.#day) {
      return `${this.#year.toString().padStart(4, "0")}-${this.#month
        .toString()
        .padStart(2, "0")}-${this.#day.toString().padStart(2, "0")}`
    } else {
      return ""
    }
  }

  updateDay(value) {
    if (!value) {
      this.#day = 0
      this.dayInput.value = ""
    } else {
      this.#day = value
      this.dayInput.value = `${value}`
      this.dayInput.classList.remove("error")
    }
  }

  updateMonth(value) {
    if (!value) {
      this.#month = 0
      this.monthInput.value = ""
    } else {
      this.#month = value
      this.monthInput.value = `${value}`
      this.monthInput.classList.remove("error")
    }
  }

  updateYear(value) {
    if (!value) {
      this.#year = 0
      this.yearInput.value = ""
    } else {
      if (value < 30) {
        value = 2000 + value
      } else if (value < 100) {
        value = 1900 + value
      }
      this.#year = value
      this.yearInput.value = `${value}`
      this.yearInput.classList.remove("error")
    }
  }

  updateDate() {
    if (
      this.#day &&
      this.#month &&
      this.#year &&
      this.checkDateIsValid(this.createDateString())
    ) {
      this.value = this.createDateString()
    } else {
      this.value = ""
    }
  }

  checkDay(value) {
    if (value > 31 || value < 1) {
      return false
    }
    if (this.min && this.#year && this.#month) {
      if (
        this.#year === this.min.getFullYear() &&
        this.#month === this.min.getMonth() + 1
      ) {
        if (value < this.min.getDate()) {
          return false
        }
      }
    }
    if (this.max && this.#year && this.#month) {
      if (
        this.#year === this.max.getFullYear() &&
        this.#month === this.max.getMonth() + 1
      ) {
        if (value > this.max.getDate()) {
          return false
        }
      }
    }
    if (this.#month) {
      if (this.#month === 2) {
        if (this.#year) {
          if (value > 29 && this.isLeapYear(this.#year)) {
            return false
          } else if (value > 28 && !this.isLeapYear(this.#year)) {
            return false
          } else {
            return true
          }
        } else {
          if (value > 29) {
            return false
          } else {
            return true
          }
        }
      } else if (
        this.#month === 4 ||
        this.#month === 6 ||
        this.#month === 9 ||
        this.#month === 11
      ) {
        if (value > 30) {
          return false
        } else {
          return true
        }
      } else {
        if (value > 31) {
          return false
        } else {
          return true
        }
      }
    } else {
      return true
    }
  }

  checkMonth(value) {
    if (value > 12 || value < 1) {
      return false
    }
    if (this.min) {
      if (this.#year) {
        if (this.#year === this.min.getFullYear()) {
          if (value < this.min.getMonth() + 1) {
            return false
          }
        }
      }
      if (this.#year && this.#day) {
        if (
          this.#year === this.min.getFullYear() &&
          value === this.min.getMonth() + 1
        ) {
          if (this.#day < this.min.getDate()) {
            return false
          }
        }
      }
    }
    if (this.max) {
      if (this.#year) {
        if (this.#year === this.max.getFullYear()) {
          if (value > this.max.getMonth() + 1) {
            return false
          }
        }
      }
      if (this.#year && this.#day) {
        if (
          this.#year === this.max.getFullYear() &&
          value === this.max.getMonth() + 1
        ) {
          if (this.#day > this.max.getDate()) {
            return false
          }
        }
      }
    }
    if (this.#day) {
      if (value === 2) {
        if (this.#year) {
          if (this.#day > 29 && this.isLeapYear(this.#year)) {
            return false
          } else if (this.#day > 28 && !this.isLeapYear(this.#year)) {
            return false
          } else {
            return true
          }
        } else {
          if (this.#day > 29) {
            return false
          } else {
            return true
          }
        }
      } else if (value === 4 || value === 6 || value === 9 || value === 11) {
        if (this.#day > 30) {
          return false
        } else {
          return true
        }
      } else {
        if (this.#day > 31) {
          return false
        } else {
          return true
        }
      }
    } else {
      return true
    }
  }

  checkYear(value) {
    if (value > 2100 || value < 1 || (value > 99 && value < 1900)) {
      return false
    }
    if (this.min) {
      if (value < this.min.getFullYear()) {
        return false
      }
      if (this.#month && value === this.min.getFullYear()) {
        if (this.#month < this.min.getMonth() + 1) {
          return false
        }
      }
      if (this.#day && value === this.min.getFullYear()) {
        if (this.#month === this.min.getMonth() + 1) {
          if (this.#day < this.min.getDate()) {
            return false
          }
        }
      }
    }
    if (this.max) {
      if (value > this.max.getFullYear()) {
        return false
      }
      if (this.#month && value === this.max.getFullYear()) {
        if (this.#month > this.max.getMonth() + 1) {
          return false
        }
      }
      if (this.#day && value === this.max.getFullYear()) {
        if (this.#month === this.max.getMonth() + 1) {
          if (this.#day > this.max.getDate()) {
            return false
          }
        }
      }
    }
    if (this.#month === 2 && this.#day > 0) {
      if (this.#day > 29 && this.isLeapYear(value)) {
        return false
      } else if (this.#day > 28 && !this.isLeapYear(value)) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  updateDayValue() {
    const day = Number(this.dayInput.value)
    if (!isNaN(day) && this.checkDay(day)) {
      this.updateDay(day)
    } else {
      this.updateDay(0)
    }
    this.updateDate()
  }

  updateMonthValue() {
    const month = Number(this.monthInput.value)
    if (!isNaN(month) && this.checkMonth(month)) {
      this.updateMonth(month)
    } else {
      this.updateMonth(0)
    }
    this.updateDate()
  }

  updateYearValue() {
    const year = Number(this.yearInput.value)
    if (!isNaN(year) && this.checkYear(year)) {
      this.updateYear(year)
    } else {
      this.updateYear(0)
    }
    this.updateDate()
  }

  checkDateIsValid(dateString) {
    if (!this.pattern.test(dateString)) {
      return false
    } else {
      const [year, month, day] = dateString.split("-")
      const date = new Date(dateString)
      return (
        date.getDate() === Number(day) &&
        date.getMonth() + 1 === Number(month) &&
        date.getFullYear() === Number(year)
      )
    }
  }

  populateDate() {
    if (
      this.hasAttribute("value") &&
      this.pattern.test(this.getAttribute("value"))
    ) {
      if (this.checkDateIsValid(this.getAttribute("value"))) {
        const [year, month, day] = this.getAttribute("value").split("-")
        this.#day = Number(day)
        this.#month = Number(month)
        this.#year = Number(year)
      } else {
        console.warn(
          `Supplied value (${this.getAttribute(
            "value",
          )}) is not a valid date (YYYY-MM-DD), ignoring...`,
        )
        this.#day = this.#day ? this.#day : 0
        this.#month = this.#month ? this.#month : 0
        this.#year = this.#year ? this.#year : 0
      }
    } else {
      this.#day = this.#day ? this.#day : 0
      this.#month = this.#month ? this.#month : 0
      this.#year = this.#year ? this.#year : 0
    }
    this.dayInput.value = `${this.#day ? this.#day : ""}`
    this.monthInput.value = `${this.#month ? this.#month : ""}`
    this.yearInput.value = `${this.#year ? this.#year : ""}`
    return this.createDateString()
  }

  /**
   * Gets the value attribute, or null if it is not valid or not set
   * @param {string|null} value
   * @returns {Date}
   */
  get value() {
    return this.populateDate()
  }

  set value(newValue) {
    if (this.getAttribute("value") !== newValue) {
      this.setAttribute("value", newValue)
      this.internals.setFormValue(newValue, this.value)
      if (!newValue && this.required) {
        const errorWarning = this.dataset.valueMissing ?? "Please enter a date."
        this.internals.setValidity(
          { valueMissing: true },
          errorWarning,
          !this.#day
            ? this.dayInput
            : !this.#month
              ? this.monthInput
              : this.yearInput,
        )
        if (!this.#day) {
          this.dayInput.classList.add("error")
        }
        if (!this.#month) {
          this.monthInput.classList.add("error")
        }
        if (!this.#year) {
          this.yearInput.classList.add("error")
        }
      } else {
        this.internals.setValidity({})
      }
      this.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      )
    }
  }

  /**
   * Gets the min attribute, or null if it is not valid or not set
   * @param {string|null} min
   * @returns {Date|null}
   */
  get min() {
    if (
      this.hasAttribute("min") &&
      this.pattern.test(this.getAttribute("min"))
    ) {
      if (this.checkDateIsValid(this.getAttribute("min"))) {
        return new Date(this.getAttribute("min"))
      } else {
        if (!this.warnedMin) {
          console.warn(
            `Supplied min date (${this.getAttribute(
              "min",
            )}) is not a valid date (YYYY-MM-DD), ignoring...`,
          )
          this.warnedMin = true
        }
        return null
      }
    } else {
      return null
    }
  }

  set min(value) {
    this.setAttribute("min", value)
  }

  /**
   * Gets the max attribute, or null if it is not valid or not set
   * @param {string|null} max
   * @returns {Date|null}
   */
  get max() {
    if (
      this.hasAttribute("max") &&
      this.pattern.test(this.getAttribute("max"))
    ) {
      if (this.checkDateIsValid(this.getAttribute("max"))) {
        return new Date(this.getAttribute("max"))
      } else {
        if (!this.warnedMax) {
          console.warn(
            `Supplied max date (${this.getAttribute(
              "max",
            )}) is not a valid date (YYYY-MM-DD), ignoring...`,
          )
          this.warnedMax = true
        }
        return null
      }
    } else {
      return null
    }
  }

  set max(value) {
    this.setAttribute("max", value)
  }

  get dayText() {
    return this.dataset.dayText ?? this.#dayText
  }

  get monthText() {
    return this.dataset.monthText ?? this.#monthText
  }

  get yearText() {
    return this.dataset.yearText ?? this.#yearText
  }

  get errorText() {
    return this.dataset.errorText ?? null
  }

  get required() {
    return this.hasAttribute("required")
  }

  set required(value) {
    if (value === "true" || value === true) {
      this.setAttribute("required", "true")
    }
    if (value === "false" || value === false) {
      this.removeAttribute("required")
    }
  }

  get readonly() {
    return this.hasAttribute("readonly")
  }

  set readonly(value) {
    if (value === "true" || value === true) {
      this.setAttribute("readonly", "true")
    }
    if (value === "false" || value === false) {
      this.removeAttribute("readonly")
    }
  }

  get disabled() {
    return this.hasAttribute("disabled")
  }

  set disabled(value) {
    if (value === "true" || value === true) {
      this.setAttribute("disabled", "true")
    }
    if (value === "false" || value === false) {
      this.removeAttribute("disabled")
    }
  }

  get form() {
    return this.internals.form
  }

  get name() {
    return this.getAttribute("name")
  }

  set name(value) {
    this.setAttribute("name", value)
  }

  get validity() {
    return this.internals.validity
  }

  get validationMessage() {
    return this.internals.validationMessage
  }

  get willValidate() {
    return this.internals.willValidate
  }

  checkValidity() {
    return this.internals.checkValidity()
  }

  reportValidity() {
    return this.internals.reportValidity()
  }
}


}),
"./js/dataset/widget.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DatasetFormWidget: function() { return DatasetFormWidget; }
});
/* harmony import */var diff_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! diff-dom */ "./node_modules/.pnpm/diff-dom@5.1.4/node_modules/diff-dom/dist/module.js");
/* harmony import */var _templates__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./templates */ "./js/dataset/templates.js");
/* harmony import */var _tools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tools */ "./js/dataset/tools.js");
/* harmony import */var _tools__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../tools */ "./js/tools/index.js");
/* harmony import */var _default__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./default */ "./js/dataset/default.js");







class DatasetFormWidget {
  constructor(container, options) {
    this.container = container
    this.options = options
    this.hasDataSchema = Boolean(options.data_schema.properties)
    this.value = null
    this.selectedElement = null
    this.selectedWarning = null
    this.selectedExternalValue = null
    this.dragging = false
    this.dd = new diff_dom__WEBPACK_IMPORTED_MODULE_0__.DiffDOM()
    this.bind()
  }

  bind() {
    this.container.addEventListener("click", (event) => this.click(event))
    this.container.addEventListener("change", (event) => this.change(event))
    // We also capture input events to get changes from text input immediately
    this.container.addEventListener("input", (event) => this.change(event))
  }

  setupDragAndDrop() {
    const gridElement = this.container.querySelector(".grid")

    let elementDOM, element
    let initialX, initialY
    let gridColumnStart, gridRowStart
    let outerHeight, outerWidth
    let gridUnitWidth, gridUnitHeight

    gridElement.addEventListener("mousedown", (event) => {
      if (elementDOM) {
        // Already dragging other element
        return
      }
      elementDOM = event.target.closest("div.grid-item.outer")
      if (!elementDOM) {
        return
      }
      initialX = event.clientX
      initialY = event.clientY
      this.dragging = false

      gridUnitWidth =
        (gridElement.offsetWidth * (this.options.scale || 1)) / 100
      gridUnitHeight =
        (gridElement.offsetHeight * (this.options.scale || 1)) / 100
      element =
        this.value.elements[
          (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
            event.target.closest("div.grid-item.outer.main,li.item.main"),
          )
        ]

      if (elementDOM.matches("div.grid-item.outer.sub,li.item.sub")) {
        outerHeight = element.inner_coordinates.height
        outerWidth = element.inner_coordinates.width
        element =
          element.sub_elements[
            (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(elementDOM) - 1 // -1 to subtract main item
          ]
      } else {
        outerHeight = 100
        outerWidth = 100
      }
      gridColumnStart = element.outer_coordinates.x
      gridRowStart = element.outer_coordinates.y
    })

    gridElement.addEventListener("mousemove", (event) => {
      if (!elementDOM) {
        return
      }
      const columnOffset = parseInt((event.clientX - initialX) / gridUnitWidth)
      const rowOffset = parseInt((event.clientY - initialY) / gridUnitHeight)
      const newGridColumnStart = Math.min(
        Math.max(gridColumnStart + columnOffset, 1),
        outerWidth - element.outer_coordinates.width + 1,
      )
      const newGridRowStart = Math.min(
        Math.max(gridRowStart + rowOffset, 1),
        outerHeight - element.outer_coordinates.height + 1,
      )
      if (
        element.outer_coordinates.y !== newGridRowStart ||
        element.outer_coordinates.x !== newGridColumnStart
      ) {
        this.dragging = true
      }
      if (!this.dragging) {
        return
      }
      elementDOM.style.gridColumnStart = newGridColumnStart
      elementDOM.style.gridRowStart = newGridRowStart
      element.outer_coordinates.y = newGridRowStart
      element.outer_coordinates.x = newGridColumnStart
    })
    gridElement.addEventListener("mouseup", (event) => {
      if (!elementDOM || !this.dragging) {
        if (elementDOM) {
          elementDOM = null
        }
        return
      }
      event.preventDefault()
      event.stopImmediatePropagation()
      elementDOM = null
      this.options.onChange()
    })
  }

  setupHandleBar() {
    const gridElement = this.container.querySelector(".grid")
    const handleBar = this.container.querySelector(".grid-handle-bar")
    let isResizing = false

    const originalWidth = gridElement.offsetWidth * (this.options.scale || 1)
    const originalHeight = gridElement.offsetHeight * (this.options.scale || 1)

    handleBar.addEventListener("mousedown", (e) => {
      isResizing = true
      const prevX = e.clientX
      const prevY = e.clientY
      const currentWidth = originalWidth * (this.options.scale || 1)
      const currentHeight = originalHeight * (this.options.scale || 1)

      const resizeGrid = (e) => {
        e.stopImmediatePropagation()
        e.preventDefault()
        if (!isResizing) return

        const newWidth = currentWidth + (e.clientX - prevX)
        const newHeight = currentHeight + (e.clientY - prevY)

        // Prevent the element from becoming too small
        if (newWidth >= 100 && newHeight >= 100) {
          const scaleW = newWidth / originalWidth
          const scaleH = newHeight / originalHeight
          this.options.scale = Math.min(scaleW, scaleH, 1)
          gridElement.style.transform = `scale(${this.options.scale})`
          gridElement.style.marginBottom = `${(this.options.scale - 1) * 719}px`
          gridElement.style.marginRight = `${(this.options.scale - 1) * 1238}px`
        }
      }

      const stopResizing = () => {
        isResizing = false
        document.removeEventListener("mousemove", resizeGrid)
        document.removeEventListener("mouseup", stopResizing)
      }
      document.addEventListener("mousemove", resizeGrid)
      document.addEventListener("mouseup", stopResizing)
    })
  }

  click(event) {
    if (this.dragging) {
      // ignore click if happens after dragging
      this.dragging = false
      return
    }
    // Find the element that was clicked by walking the DOM.
    const elementDOM = event.target.closest("div.grid-item.outer,li.item")
    if (elementDOM) {
      this.selectedWarning = null
      this.selectedExternalValue = null
      let element =
        this.value.elements[
          (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
            event.target.closest("div.grid-item.outer.main,li.item.main"),
          )
        ]
      if (elementDOM.matches("div.grid-item.outer.sub")) {
        element =
          element.sub_elements[
            (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(elementDOM) - 1 // -1 to subtract main item
          ]
      } else if (elementDOM.matches("li.item.sub")) {
        element = element.sub_elements[(0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(elementDOM)]
      }
      if (this.selectedElement === element) {
        this.selectedElement = null
      } else {
        this.selectedElement = element
      }
      this.render()
    } else if (event.target.closest("button.show-content")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showContent = !this.options.showContent
      this.render()
    } else if (event.target.closest("button.show-elements-list")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showElementsList = !this.options.showElementsList
      this.render()
    } else if (event.target.closest("button.show-warnings-list")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showWarningsList = !this.options.showWarningsList
      this.render()
    } else if (event.target.closest("button.show-external-values-list")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showExternalValuesList = !this.options.showExternalValuesList
      this.render()
    } else if (event.target.closest("button.download-json")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.downloadJSON()
    } else if (event.target.closest("button.upload-json")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.uploadJSON()
    } else if (event.target.closest("div.selected-element-properties")) {
      if (event.target.closest("button.option-sort-up")) {
        event.preventDefault()
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.option-form-wrapper"),
        )
        const options = this.selectedElement.content.options
        if (!position) {
          return // first item. ignore
        }
        const temp = options[position]
        options[position] = options[position - 1]
        options[position - 1] = temp
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-sort-down")) {
        event.preventDefault()
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.option-form-wrapper"),
        )
        const options = this.selectedElement.content.options
        if (position === options.length - 1) {
          return // last position
        }
        const temp = options[position]
        options[position] = options[position + 1]
        options[position + 1] = temp
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-delete")) {
        event.preventDefault()
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.option-form-wrapper"),
        )
        const options = this.selectedElement.content.options
        options.splice(position, 1)
        while (options.length < 2) {
          // There always have to be at least two
          options.push({ text: "", db_value: "" })
        }
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.condition-delete")) {
        event.preventDefault()
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.condition-form-wrapper"),
        )
        this.selectedElement.conditions.splice(position, 1)
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-db_value-add")) {
        event.preventDefault()
        this.selectedElement.content.options.push({ text: "", db_value: "" })
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-column-add")) {
        event.preventDefault()
        this.selectedElement.content.options.push({ text: "", column: "" })
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.condition-add")) {
        event.preventDefault()
        this.selectedElement.conditions.push({
          code: "",
          variables: [],
        })
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.delete-selected-element")) {
        event.preventDefault()
        this.value.elements = this.value.elements.filter(
          (element) => element !== this.selectedElement,
        )
        this.value.elements.forEach((element) => {
          element.sub_elements = element.sub_elements.filter(
            (element) => element !== this.selectedElement,
          )
        })
        this.selectedElement = null
        this.options.onChange()
        this.render()
      } else if (event.target.closest("input.checkboxinput")) {
        const property = event.target.getAttribute("name")
        this.selectedElement.content[property] = event.target.checked
        this.options.onChange()
        this.render()
      }
    } else if (event.target.closest("button.add-warning")) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.options.showWarningsList = true
      this.selectedWarning = { text: "", test: "", variables: [] }
      this.value.warnings.push(this.selectedWarning)
      this.selectedElement = null
      this.selectedExternalValue = null
      this.render()
    } else if (event.target.closest("ul.warnings li")) {
      event.preventDefault()
      const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
        event.target.closest("ul.warnings li"),
      )
      this.selectedWarning = this.value.warnings[position]
      this.selectedElement = null
      this.selectedExternalValue = null
      this.render()
    } else if (event.target.closest("button.delete-selected-warning")) {
      event.preventDefault()
      this.value.warnings = this.value.warnings.filter(
        (element) => element !== this.selectedWarning,
      )
      this.selectedWarning = null
      this.options.onChange()
      this.render()
    } else if (event.target.closest("button.add-external-value")) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.options.showExternalValuesList = true
      this.selectedExternalValue = {
        type: "column",
      }
      this.value.external_values.push(this.selectedExternalValue)
      this.selectedElement = null
      this.selectedWarning = null
      this.render()
    } else if (event.target.closest("ul.external-values li")) {
      event.preventDefault()
      const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
        event.target.closest("ul.external-values li"),
      )
      this.selectedExternalValue = this.value.external_values[position]
      this.selectedElement = null
      this.selectedWarning = null
      this.render()
    } else if (event.target.closest("button.delete-selected-external-value")) {
      event.preventDefault()
      this.value.external_values = this.value.external_values.filter(
        (element) => element !== this.selectedExternalValue,
      )
      this.selectedExternalValue = null
      this.options.onChange()
      this.render()
    }
  }

  change(event) {
    if (event.target.closest("div.selected-element-properties")) {
      const contentObject = this.selectedElement.content
      const name = event.target.name
      if (!name) {
        return
      }
      if (name === "option-text") {
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.option-form-wrapper"),
        )
        contentObject.options[position].text = event.target.value
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "option-db_value") {
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.option-form-wrapper"),
        )
        contentObject.options[position].db_value = event.target.value
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "option-column") {
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.option-form-wrapper"),
        )
        contentObject.options[position].column = parseInt(event.target.value)
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "condition-code") {
        const position = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.countPreviousSiblings)(
          event.target.closest("div.condition-form-wrapper"),
        )
        const condition = this.selectedElement.conditions[position]
        condition.code = event.target.value
        condition.variables = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.findCodeVariables)(event.target.value)
        this.options.onChange()
        this.render()
      } else if (
        [
          "caption",
          "input_type",
          "placement",
          "options_orientation",
          "placeholder",
          "default_value",
          "text",
          "column",
          "property",
          "tag",
        ].includes(name)
      ) {
        contentObject[name] = event.target.value
        this.options.onChange()
        this.renderGridContent()
      } else if (["width", "tabindex"].includes(name)) {
        contentObject[name] = parseInt(event.target.value)
        this.options.onChange()
        this.renderGridContent()
      } else if (
        [
          "hide_text",
          "background",
          "border_left",
          "border_right",
          "border_top",
          "border_bottom",
        ].includes(name)
      ) {
        contentObject[name] = event.target.checked
        this.options.onChange()
        this.renderGridContent()
      } else if (
        [
          "outer_coordinates-x",
          "outer_coordinates-y",
          "outer_coordinates-width",
          "outer_coordinates-height",
        ].includes(name)
      ) {
        this.selectedElement.outer_coordinates[name.split("-")[1]] = parseInt(
          event.target.value,
        )
        this.options.onChange()
        this.renderGridContent()
      } else if (
        [
          "inner_coordinates-x",
          "inner_coordinates-y",
          "inner_coordinates-width",
          "inner_coordinates-height",
        ].includes(name)
      ) {
        this.selectedElement.inner_coordinates[name.split("-")[1]] = parseInt(
          event.target.value,
        )
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "label") {
        this.selectedElement.label = event.target.value
      } else if (name === "source") {
        contentObject.source = event.target.value
        contentObject.variables = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.findCodeVariables)(event.target.value)
        this.options.onChange()
        this.render()
      } else if (name === "html") {
        contentObject.html = event.target.value.replaceAll("/", "\\/")
        this.options.onChange()
        this.renderGridContent()
      }
    } else if (event.target.closest("div.selected-warning-properties")) {
      const name = event.target.name
      if (!name) {
        return
      }
      if (name === "test") {
        this.selectedWarning.test = event.target.value
        this.selectedWarning.variables = (0,_tools__WEBPACK_IMPORTED_MODULE_2__.findCodeVariables)(event.target.value)
      } else if (name === "text") {
        this.selectedWarning.text = event.target.value
      }
      this.options.onChange()
      this.render()
    } else if (event.target.closest("div.selected-external-value-properties")) {
      const name = event.target.name
      if (!name) {
        return
      }
      if (name === "value-dataset") {
        this.selectedExternalValue.dataset = event.target.value
      } else if (name === "value-column") {
        this.selectedExternalValue.column = event.target.value
      } else if (name === "value-property") {
        this.selectedExternalValue.property = event.target.value
      } else if (name === "value-type") {
        this.selectedExternalValue.type = event.target.value
        delete this.selectedExternalValue.dataset
        delete this.selectedExternalValue.column
        delete this.selectedExternalValue.property
        delete this.selectedExternalValue.code
      } else if (name === "value-code") {
        this.selectedExternalValue.code = event.target.value
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase()
      }
      this.options.onChange()
      this.render()
    }
  }

  set(value) {
    this.value = value
    this.selectedElement = null
    this.selectedWarning = null
    this.selectedExternalValue = null
    if (!this.value.elements) {
      this.value.elements = []
    }
    if (!this.value.warnings) {
      this.value.warnings = []
    }
    if (!this.value.external_values) {
      this.value.external_values = []
    }
    this.render()
  }

  render() {
    const newContainer = document.createElement("div")
    newContainer.id = this.container.id
    newContainer.style = this.container.style
    newContainer.innerHTML = (0,_templates__WEBPACK_IMPORTED_MODULE_1__.editFormTemplate)(
      this.value,
      Object.assign(
        {
          selectedElement: this.selectedElement,
          selectedWarning: this.selectedWarning,
          selectedExternalValue: this.selectedExternalValue,
          hasDataSchema: this.hasDataSchema,
        },
        this.options,
      ),
    )
    const diff = this.dd.diff(this.container, newContainer)
    this.dd.apply(this.container, diff)
    new _tools__WEBPACK_IMPORTED_MODULE_3__.ContextMenu(
      this.container.querySelector("button.add-element"),
      (0,_templates__WEBPACK_IMPORTED_MODULE_1__.menuItems)(this),
      {
        openEvent: "onclick",
      },
    )
    if (!this.value.elements.length) {
      return
    }
    this.setupHandleBar()
    this.setupDragAndDrop()
  }

  renderGridContent() {
    this.container.querySelector("div.grid-content").innerHTML = (0,_templates__WEBPACK_IMPORTED_MODULE_1__.gridTemplate)(
      this.value,
      Object.assign({ selectedElement: this.selectedElement }, this.options),
    )
  }

  get() {
    return this.value
  }

  addElement(type) {
    const container =
      this.selectedElement && this.selectedElement.sub_elements
        ? this.selectedElement.sub_elements
        : this.value.elements
    container.push({
      label: "",
      outer_coordinates: {
        y: 1,
        height: 10,
        x: 1,
        width: 20,
      },
      inner_coordinates: {
        y: 1,
        height: 10,
        x: 1,
        width: 20,
      },
      content: Object.assign(
        {
          type: type,
          tabindex: 0,
          width: 0,
        },
        _default__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_CONTENT[type],
      ),
      sub_elements: [],
      background: true,
      border: null,
      conditions: [],
    })
  }

  downloadJSON() {
    const jsonData = JSON.stringify(this.get())
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = this.options.dataset_name
      ? `${this.options.dataset_name}.form.json`
      : "form.json"
    a.style.display = "none"

    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  uploadJSON() {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".json"
    document.body.appendChild(fileInput)

    fileInput.onchange = (_event) => {
      const file = fileInput.files[0]

      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result
          this.set(JSON.parse(content))
          document.body.removeChild(fileInput)
          this.options.onChange()
        }
        reader.readAsText(file)
      } else {
        alert("Please select a JSON file to upload.")
        document.body.removeChild(fileInput)
      }
    }

    fileInput.click()
  }
}


}),
"./js/tools/autocomplete.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  autocomplete: function() { return autocomplete; }
});
const autocomplete = (
  element,
  choices,
  { minInput = 2, maxChoices = false, ignoreCase = true } = {},
) => {
  const choicesElement = document.createElement("ul")
  choicesElement.classList.add("autocomplete-choices")

  choicesElement.style.display = "none"
  const containerElement = document.createElement("div")
  element.parentElement.insertBefore(containerElement, element)
  containerElement.appendChild(element)
  containerElement.appendChild(choicesElement)

  const bootstrapClass = Array.from(element.classList).find((className) =>
    className.startsWith("col-"),
  )

  if (bootstrapClass) {
    element.classList.remove(bootstrapClass)
    containerElement.classList.add(bootstrapClass)
    containerElement.style.padding = 0
  }

  element.addEventListener("input", (event) => {
    choicesElement.innerHTML = ""
    const query = element.value.trim()
    if (query.length >= minInput && event.isTrusted) {
      // choices can either be a list of choices or a then-able function that returns options
      const optionsPromise =
        typeof choices === "function"
          ? choices(query)
          : Promise.resolve(
              choices.filter((choice) =>
                ignoreCase
                  ? choice.toLowerCase().includes(query.toLowerCase())
                  : choice.includes(query),
              ),
            )
      optionsPromise.then((options) => {
        if (maxChoices) {
          options = options.slice(0, maxChoices)
        }
        if (options.length > 0) {
          choicesElement.innerHTML = options
            .map((choice) => `<li>${choice}</li>`)
            .join("")
          choicesElement.style.display = "block"
        } else {
          choicesElement.style.display = "none"
        }
      })
    } else {
      choicesElement.style.display = "none"
    }
  })

  choicesElement.addEventListener("click", (event) => {
    const el = event.target.closest("li")
    if (!el) {
      return
    }
    element.value = el.innerText

    element.dispatchEvent(new Event("input", { bubbles: true }))
  })
}


}),
"./js/tools/cells.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  dateCell: function() { return dateCell; }
});
/* harmony import */var _date__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./date */ "./js/tools/date.js");
// Helper functions for cell formatting.


// We use this dateCell function rather than Simple DataTables built-in date function
// because a lot of entries have an empty date. That throws off the normal sorting
// mechanism.
const dateCell = (data) => {
  const date = data ? (0,_date__WEBPACK_IMPORTED_MODULE_0__.renderDate)(data) : ""
  return {
    text: date,
    data,
    order: data?.length ? data : "1600‑01‑01",
  }
}


}),
"./js/tools/contextmenu.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ContextMenu: function() { return ContextMenu; }
});
// source: https://github.com/lekoala/pure-context-menu/blob/master/pure-context-menu.js
// License: MIT

// Addition:
// global 'show' option to prevent showing based on event.
// openEvent option

let globalListenerSet = false
let baseOptions = {
  contextMenuClass: "pure-context-menu",
  dropdownClass: "dropdown-menu",
  dividerClass: "dropdown-divider",
  itemClass: "dropdown-item",
  zIndex: "9999",
  preventCloseOnClick: false,
  show: (_event) => true,
  openEvent: "oncontextmenu",
}

/**
 * Easily manage context menus
 * Works out of the box with bootstrap css
 */
class ContextMenu {
  _el
  _items
  _options
  _currentEvent

  /**
   * @param {HTMLElement} el
   * @param {object} items
   * @param {object} opts
   */
  constructor(el, items, opts) {
    this._items = items
    this._el = el

    this._options = Object.assign({}, baseOptions, opts)

    // bind the menu
    if (this._options.openEvent) {
      el[this._options.openEvent] = this.onShowMenu
    }

    // close if the user clicks outside of the menu
    if (!globalListenerSet) {
      document.addEventListener("click", this._onDocumentClick)
      globalListenerSet = true
    }
  }

  /**
   * @param {object} opts
   */
  static updateDefaultOptions(opts) {
    baseOptions = Object.assign(baseOptions, opts)
  }

  /**
   * @returns {object}
   */
  static getDefaultOptions() {
    return baseOptions
  }

  /**
   * Create the menu
   * @returns {HTMLElement}
   */
  _buildContextMenu = () => {
    const contextMenu = document.createElement("ul")
    contextMenu.style.minWidth = "120px"
    contextMenu.style.maxWidth = "240px"
    contextMenu.style.display = "block"
    contextMenu.classList.add(this._options.contextMenuClass)
    contextMenu.classList.add(this._options.dropdownClass)

    for (const item of this._items) {
      const child = document.createElement("li")
      if (item === "-") {
        const divider = document.createElement("hr")
        divider.classList.add(this._options.dividerClass)
        child.appendChild(divider)
      } else {
        const link = document.createElement("a")
        link.innerText = item.label
        link.style.cursor = "pointer"
        link.style.whiteSpace = "normal"
        link.classList.add(this._options.itemClass)
        child.appendChild(link)
      }

      contextMenu.appendChild(child)
    }
    return contextMenu
  }

  /**
   * Normalize the context menu position so that it won't get out of bounds
   * @param {number} mouseX
   * @param {number} mouseY
   * @param {HTMLElement} contextMenu
   */
  _normalizePosition = (mouseX, mouseY, contextMenu) => {
    const scope = this._el
    const contextStyles = window.getComputedStyle(contextMenu)
    // clientWidth exclude borders and we add 1px for good measure
    const offset = parseInt(contextStyles.borderWidth) + 1

    // compute what is the mouse position relative to the container element (scope)
    const bounds = scope.getBoundingClientRect()

    let scopeX = mouseX
    let scopeY = mouseY

    if (!["BODY", "HTML"].includes(scope.tagName)) {
      scopeX -= bounds.left
      scopeY -= bounds.top
    }

    const menuWidth = parseInt(contextStyles.width)

    // check if the element will go out of bounds
    const outOfBoundsOnX = scopeX + menuWidth > scope.clientWidth
    const outOfBoundsOnY =
      scopeY + contextMenu.clientHeight > scope.clientHeight

    let normalizedX = mouseX
    let normalizedY = mouseY

    // normalize on X
    if (outOfBoundsOnX) {
      normalizedX = scope.clientWidth - menuWidth - offset
      if (!["BODY", "HTML"].includes(scope.tagName)) {
        normalizedX += bounds.left
      }
    }

    // normalize on Y
    if (outOfBoundsOnY) {
      normalizedY = scope.clientHeight - contextMenu.clientHeight - offset
      if (!["BODY", "HTML"].includes(scope.tagName)) {
        normalizedY += bounds.top
      }
    }

    return { normalizedX, normalizedY }
  }

  _removeExistingContextMenu = () => {
    document.querySelector(`.${this._options.contextMenuClass}`)?.remove()
  }

  _bindCallbacks = (contextMenu) => {
    this._items.forEach((menuItem, index) => {
      if (menuItem === "-") {
        return
      }

      const htmlEl = contextMenu.children[index]

      htmlEl.onclick = () => {
        menuItem.callback(this._currentEvent)

        // do not close the menu if set
        const preventCloseOnClick =
          menuItem.preventCloseOnClick ??
          this._options.preventCloseOnClick ??
          false
        if (!preventCloseOnClick) {
          this._removeExistingContextMenu()
        }
      }
    })
  }

  /**
   * @param {MouseEvent} event
   */
  onShowMenu = (event) => {
    if (!this._options.show(event)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()

    // Store event for callbacks
    this._currentEvent = event

    // the current context menu should disappear when a new one is displayed
    this._removeExistingContextMenu()

    // build and show on ui
    const contextMenu = this._buildContextMenu()
    document.querySelector("body").append(contextMenu)

    // set the position already so that width can be computed
    contextMenu.style.position = "fixed"
    contextMenu.style.zIndex = this._options.zIndex

    // adjust the position according to mouse position
    const { clientX: mouseX, clientY: mouseY } = event
    const { normalizedX, normalizedY } = this._normalizePosition(
      mouseX,
      mouseY,
      contextMenu,
    )
    contextMenu.style.top = `${normalizedY}px`
    contextMenu.style.left = `${normalizedX}px`

    // disable context menu for it
    contextMenu.oncontextmenu = (e) => e.preventDefault()

    // bind the callbacks on each option
    this._bindCallbacks(contextMenu)
  }

  /**
   * Used to determine if the user has clicked outside of the context menu and if so to close it
   * @param {MouseEvent} event
   */
  _onDocumentClick = (event) => {
    const clickedTarget = event.target
    if (clickedTarget.closest(`.${this._options.contextMenuClass}`)) {
      return
    }
    this._removeExistingContextMenu()
  }

  /**
   * Remove all the event listeners that were registered for this feature
   */
  off() {
    this._removeExistingContextMenu()
    document.removeEventListener("click", this._onDocumentClick)
    globalListenerSet = false
    this._el[this._options.openEvent] = null
  }
}


}),
"./js/tools/countries.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  countryList: function() { return countryList; }
});
/* harmony import */var countries_list__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! countries-list */ "./node_modules/.pnpm/countries-list@3.1.1/node_modules/countries-list/mjs/index.js");


const countryList = [
  ["DK", "Denmark"],
  ["SE", "Sweden"],
  ["DE", "Germany"],
  ["NO", "Norway"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
].concat(
  Object.entries(countries_list__WEBPACK_IMPORTED_MODULE_0__.countries)
    .map(([countryCode, countryInfo]) => [countryCode, countryInfo.name])
    .sort((a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)),
)


}),
"./js/tools/date.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  parseDate: function() { return parseDate; },
  renderDate: function() { return renderDate; }
});
function renderDate(dateString) {
  // We are here translating date strings in ISO 8601 (2022-07-13)
  // into preferred Danish format (13-07-2022).
  if (!dateString.length) {
    return ""
  }
  return `${dateString.slice(8, 10)}‑${dateString.slice(
    5,
    7,
  )}‑${dateString.slice(0, 4)}`
}

function parseDate(dateString = "", format = null) {
  if (
    format === "Y-m-d" ||
    (format === null &&
      parseInt(dateString.slice(0, 4)) < 2100 &&
      parseInt(dateString.slice(5, 7)) < 13 &&
      parseInt(dateString.slice(8, 10)) < 32)
  ) {
    return new Date(
      `${dateString.slice(0, 4)}-${dateString.slice(5, 7)}-${dateString.slice(
        8,
        10,
      )}`,
    )
  } else if (dateString.length < 4) {
    // The dateString is too short. We'll use an obviously incorrect date.
    return undefined
  } else {
    // format is dd-mm-YYYY or d-m-YY or similar.

    // We will look for a non-numeric character at index 1.
    // Else we will assume the first two characters are the day.
    const daySplitIndex = /[0-9]/.test(dateString[1]) ? 2 : 1
    const day = parseInt(
      dateString.substr(0, daySplitIndex).replace(/[^\d]/g, "") || 1,
    )
    dateString = dateString.slice(daySplitIndex).replace(/^[^\d]/g, "")
    if (dateString.length < 3 || day < 1 || day > 31) {
      // The dateStringing is too short or day is incorrect. We'll use an obviously incorrect date.
      return undefined
    }

    // We will look for a non-numeric character at index 1.
    // Else we will assume that the first two characters are the month.
    const monthSplitIndex = /[0-9]/.test(dateString[1]) ? 2 : 1
    const month = parseInt(
      dateString.substr(0, monthSplitIndex).replace(/[^\d]/g, "") || 1,
    )
    let year = parseInt(dateString.slice(monthSplitIndex).replace(/[^\d]/g, ""))
    if (year < 100) {
      const currentYear = new Date().getFullYear() - 2000
      if (year < currentYear + 2) {
        year += 2000
      } else {
        year += 1900
      }
    }
    if (year < 1900 || year > 2100 || month < 1 || month > 12) {
      // The dateString is too short or month/year is incorrect. We'll use an obviously incorrect date.
      return undefined
    }
    const returnDate = new Date(`${year}-${month}-${day}`)
    if (
      returnDate.getFullYear() === year &&
      returnDate.getMonth() + 1 === month &&
      returnDate.getDate() === day
    ) {
      return returnDate
    } else {
      // Something about the date wasn't right
      return undefined
    }
  }
}


}),
"./js/tools/dk_postcodes.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  postCodes: function() { return postCodes; }
});
// Extracted from:
// https://github.com/justinelliotmeyers/DANMARK_DAGI_2022/blob/main/Postnummerinddeling.zip
// by pasting into JavaScript console and running:
// const postCodes = {}
// postnummerdata.features.forEach(omrade => postCodes[omrade.properties.postnummer] = omrade.properties.navn)
// JSON.stringify(postCodes)
const postCodes = {
  1050: "København K",
  1051: "København K",
  1052: "København K",
  1053: "København K",
  1054: "København K",
  1055: "København K",
  1056: "København K",
  1057: "København K",
  1058: "København K",
  1059: "København K",
  1060: "København K",
  1061: "København K",
  1062: "København K",
  1063: "København K",
  1064: "København K",
  1065: "København K",
  1066: "København K",
  1067: "København K",
  1068: "København K",
  1069: "København K",
  1070: "København K",
  1071: "København K",
  1072: "København K",
  1073: "København K",
  1074: "København K",
  1100: "København K",
  1101: "København K",
  1102: "København K",
  1103: "København K",
  1104: "København K",
  1105: "København K",
  1106: "København K",
  1107: "København K",
  1110: "København K",
  1111: "København K",
  1112: "København K",
  1113: "København K",
  1114: "København K",
  1115: "København K",
  1116: "København K",
  1117: "København K",
  1118: "København K",
  1119: "København K",
  1120: "København K",
  1121: "København K",
  1122: "København K",
  1123: "København K",
  1124: "København K",
  1125: "København K",
  1126: "København K",
  1127: "København K",
  1128: "København K",
  1129: "København K",
  1130: "København K",
  1131: "København K",
  1150: "København K",
  1151: "København K",
  1152: "København K",
  1153: "København K",
  1154: "København K",
  1155: "København K",
  1156: "København K",
  1157: "København K",
  1158: "København K",
  1159: "København K",
  1160: "København K",
  1161: "København K",
  1162: "København K",
  1164: "København K",
  1165: "København K",
  1166: "København K",
  1167: "København K",
  1168: "København K",
  1169: "København K",
  1170: "København K",
  1171: "København K",
  1172: "København K",
  1173: "København K",
  1174: "København K",
  1175: "København K",
  1200: "København K",
  1201: "København K",
  1202: "København K",
  1203: "København K",
  1204: "København K",
  1205: "København K",
  1206: "København K",
  1207: "København K",
  1208: "København K",
  1209: "København K",
  1210: "København K",
  1211: "København K",
  1212: "København K",
  1213: "København K",
  1214: "København K",
  1215: "København K",
  1216: "København K",
  1218: "København K",
  1219: "København K",
  1220: "København K",
  1221: "København K",
  1250: "København K",
  1251: "København K",
  1252: "København K",
  1253: "København K",
  1254: "København K",
  1255: "København K",
  1256: "København K",
  1257: "København K",
  1259: "København K",
  1260: "København K",
  1261: "København K",
  1263: "København K",
  1264: "København K",
  1265: "København K",
  1266: "København K",
  1267: "København K",
  1268: "København K",
  1270: "København K",
  1271: "København K",
  1300: "København K",
  1301: "København K",
  1302: "København K",
  1303: "København K",
  1304: "København K",
  1306: "København K",
  1307: "København K",
  1308: "København K",
  1309: "København K",
  1310: "København K",
  1311: "København K",
  1312: "København K",
  1313: "København K",
  1314: "København K",
  1315: "København K",
  1316: "København K",
  1317: "København K",
  1318: "København K",
  1319: "København K",
  1320: "København K",
  1321: "København K",
  1322: "København K",
  1323: "København K",
  1324: "København K",
  1325: "København K",
  1326: "København K",
  1327: "København K",
  1328: "København K",
  1329: "København K",
  1350: "København K",
  1352: "København K",
  1353: "København K",
  1354: "København K",
  1355: "København K",
  1356: "København K",
  1357: "København K",
  1358: "København K",
  1359: "København K",
  1360: "København K",
  1361: "København K",
  1362: "København K",
  1363: "København K",
  1364: "København K",
  1365: "København K",
  1366: "København K",
  1367: "København K",
  1368: "København K",
  1369: "København K",
  1370: "København K",
  1371: "København K",
  1400: "København K",
  1401: "København K",
  1402: "København K",
  1403: "København K",
  1406: "København K",
  1407: "København K",
  1408: "København K",
  1409: "København K",
  1410: "København K",
  1411: "København K",
  1412: "København K",
  1413: "København K",
  1414: "København K",
  1415: "København K",
  1416: "København K",
  1417: "København K",
  1418: "København K",
  1419: "København K",
  1420: "København K",
  1421: "København K",
  1422: "København K",
  1423: "København K",
  1424: "København K",
  1425: "København K",
  1426: "København K",
  1427: "København K",
  1428: "København K",
  1429: "København K",
  1430: "København K",
  1432: "København K",
  1433: "København K",
  1434: "København K",
  1435: "København K",
  1436: "København K",
  1437: "København K",
  1438: "København K",
  1439: "København K",
  1440: "København K",
  1441: "København K",
  1450: "København K",
  1451: "København K",
  1452: "København K",
  1453: "København K",
  1454: "København K",
  1455: "København K",
  1456: "København K",
  1457: "København K",
  1458: "København K",
  1459: "København K",
  1460: "København K",
  1461: "København K",
  1462: "København K",
  1463: "København K",
  1464: "København K",
  1465: "København K",
  1466: "København K",
  1467: "København K",
  1468: "København K",
  1470: "København K",
  1471: "København K",
  1472: "København K",
  1473: "København K",
  1550: "København V",
  1551: "København V",
  1552: "København V",
  1553: "København V",
  1554: "København V",
  1555: "København V",
  1556: "København V",
  1557: "København V",
  1558: "København V",
  1559: "København V",
  1560: "København V",
  1561: "København V",
  1562: "København V",
  1563: "København V",
  1564: "København V",
  1567: "København V",
  1568: "København V",
  1569: "København V",
  1570: "København V",
  1571: "København V",
  1572: "København V",
  1573: "København V",
  1574: "København V",
  1575: "København V",
  1576: "København V",
  1577: "København V",
  1600: "København V",
  1601: "København V",
  1602: "København V",
  1603: "København V",
  1604: "København V",
  1605: "København V",
  1606: "København V",
  1607: "København V",
  1608: "København V",
  1609: "København V",
  1610: "København V",
  1611: "København V",
  1612: "København V",
  1613: "København V",
  1614: "København V",
  1615: "København V",
  1616: "København V",
  1617: "København V",
  1618: "København V",
  1619: "København V",
  1620: "København V",
  1621: "København V",
  1622: "København V",
  1623: "København V",
  1624: "København V",
  1631: "København V",
  1632: "København V",
  1633: "København V",
  1634: "København V",
  1635: "København V",
  1650: "København V",
  1651: "København V",
  1652: "København V",
  1653: "København V",
  1654: "København V",
  1655: "København V",
  1656: "København V",
  1657: "København V",
  1658: "København V",
  1659: "København V",
  1660: "København V",
  1661: "København V",
  1662: "København V",
  1663: "København V",
  1664: "København V",
  1665: "København V",
  1666: "København V",
  1667: "København V",
  1668: "København V",
  1669: "København V",
  1670: "København V",
  1671: "København V",
  1672: "København V",
  1673: "København V",
  1674: "København V",
  1675: "København V",
  1676: "København V",
  1677: "København V",
  1699: "København V",
  1700: "København V",
  1701: "København V",
  1702: "København V",
  1703: "København V",
  1704: "København V",
  1705: "København V",
  1706: "København V",
  1707: "København V",
  1708: "København V",
  1709: "København V",
  1710: "København V",
  1711: "København V",
  1712: "København V",
  1714: "København V",
  1715: "København V",
  1716: "København V",
  1717: "København V",
  1718: "København V",
  1719: "København V",
  1720: "København V",
  1721: "København V",
  1722: "København V",
  1723: "København V",
  1724: "København V",
  1725: "København V",
  1726: "København V",
  1727: "København V",
  1728: "København V",
  1729: "København V",
  1730: "København V",
  1731: "København V",
  1732: "København V",
  1733: "København V",
  1734: "København V",
  1735: "København V",
  1736: "København V",
  1737: "København V",
  1738: "København V",
  1739: "København V",
  1749: "København V",
  1750: "København V",
  1751: "København V",
  1752: "København V",
  1753: "København V",
  1754: "København V",
  1755: "København V",
  1756: "København V",
  1757: "København V",
  1758: "København V",
  1759: "København V",
  1760: "København V",
  1761: "København V",
  1762: "København V",
  1763: "København V",
  1764: "København V",
  1765: "København V",
  1766: "København V",
  1770: "København V",
  1771: "København V",
  1772: "København V",
  1773: "København V",
  1774: "København V",
  1775: "København V",
  1777: "København V",
  1799: "København V",
  1800: "Frederiksberg C",
  1801: "Frederiksberg C",
  1802: "Frederiksberg C",
  1803: "Frederiksberg C",
  1804: "Frederiksberg C",
  1805: "Frederiksberg C",
  1806: "Frederiksberg C",
  1807: "Frederiksberg C",
  1808: "Frederiksberg C",
  1809: "Frederiksberg C",
  1810: "Frederiksberg C",
  1811: "Frederiksberg C",
  1812: "Frederiksberg C",
  1813: "Frederiksberg C",
  1814: "Frederiksberg C",
  1815: "Frederiksberg C",
  1816: "Frederiksberg C",
  1817: "Frederiksberg C",
  1818: "Frederiksberg C",
  1819: "Frederiksberg C",
  1820: "Frederiksberg C",
  1822: "Frederiksberg C",
  1823: "Frederiksberg C",
  1824: "Frederiksberg C",
  1825: "Frederiksberg C",
  1826: "Frederiksberg C",
  1827: "Frederiksberg C",
  1828: "Frederiksberg C",
  1829: "Frederiksberg C",
  1850: "Frederiksberg C",
  1851: "Frederiksberg C",
  1852: "Frederiksberg C",
  1853: "Frederiksberg C",
  1854: "Frederiksberg C",
  1855: "Frederiksberg C",
  1856: "Frederiksberg C",
  1857: "Frederiksberg C",
  1860: "Frederiksberg C",
  1861: "Frederiksberg C",
  1862: "Frederiksberg C",
  1863: "Frederiksberg C",
  1864: "Frederiksberg C",
  1865: "Frederiksberg C",
  1866: "Frederiksberg C",
  1867: "Frederiksberg C",
  1868: "Frederiksberg C",
  1870: "Frederiksberg C",
  1871: "Frederiksberg C",
  1872: "Frederiksberg C",
  1873: "Frederiksberg C",
  1874: "Frederiksberg C",
  1875: "Frederiksberg C",
  1876: "Frederiksberg C",
  1877: "Frederiksberg C",
  1878: "Frederiksberg C",
  1879: "Frederiksberg C",
  1900: "Frederiksberg C",
  1901: "Frederiksberg C",
  1902: "Frederiksberg C",
  1903: "Frederiksberg C",
  1904: "Frederiksberg C",
  1905: "Frederiksberg C",
  1906: "Frederiksberg C",
  1908: "Frederiksberg C",
  1909: "Frederiksberg C",
  1910: "Frederiksberg C",
  1911: "Frederiksberg C",
  1912: "Frederiksberg C",
  1913: "Frederiksberg C",
  1914: "Frederiksberg C",
  1915: "Frederiksberg C",
  1916: "Frederiksberg C",
  1917: "Frederiksberg C",
  1920: "Frederiksberg C",
  1921: "Frederiksberg C",
  1922: "Frederiksberg C",
  1923: "Frederiksberg C",
  1924: "Frederiksberg C",
  1925: "Frederiksberg C",
  1926: "Frederiksberg C",
  1927: "Frederiksberg C",
  1928: "Frederiksberg C",
  1950: "Frederiksberg C",
  1951: "Frederiksberg C",
  1952: "Frederiksberg C",
  1953: "Frederiksberg C",
  1954: "Frederiksberg C",
  1955: "Frederiksberg C",
  1956: "Frederiksberg C",
  1957: "Frederiksberg C",
  1958: "Frederiksberg C",
  1959: "Frederiksberg C",
  1960: "Frederiksberg C",
  1961: "Frederiksberg C",
  1962: "Frederiksberg C",
  1963: "Frederiksberg C",
  1964: "Frederiksberg C",
  1965: "Frederiksberg C",
  1966: "Frederiksberg C",
  1967: "Frederiksberg C",
  1970: "Frederiksberg C",
  1971: "Frederiksberg C",
  1972: "Frederiksberg C",
  1973: "Frederiksberg C",
  1974: "Frederiksberg C",
  2000: "Frederiksberg",
  2100: "København Ø",
  2150: "Nordhavn",
  2200: "København N",
  2300: "København S",
  2400: "København NV",
  2450: "København SV",
  2500: "Valby",
  2600: "Glostrup",
  2605: "Brøndby",
  2610: "Rødovre",
  2620: "Albertslund",
  2625: "Vallensbæk",
  2630: "Taastrup",
  2635: "Ishøj",
  2640: "Hedehusene",
  2650: "Hvidovre",
  2660: "Brøndby Strand",
  2665: "Vallensbæk Strand",
  2670: "Greve",
  2680: "Solrød Strand",
  2690: "Karlslunde",
  2700: "Brønshøj",
  2720: "Vanløse",
  2730: "Herlev",
  2740: "Skovlunde",
  2750: "Ballerup",
  2760: "Måløv",
  2765: "Smørum",
  2770: "Kastrup",
  2791: "Dragør",
  2800: "Kongens Lyngby",
  2820: "Gentofte",
  2830: "Virum",
  2840: "Holte",
  2850: "Nærum",
  2860: "Søborg",
  2870: "Dyssegård",
  2880: "Bagsværd",
  2900: "Hellerup",
  2920: "Charlottenlund",
  2930: "Klampenborg",
  2942: "Skodsborg",
  2950: "Vedbæk",
  2960: "Rungsted Kyst",
  2970: "Hørsholm",
  2980: "Kokkedal",
  2990: "Nivå",
  3000: "Helsingør",
  3050: "Humlebæk",
  3060: "Espergærde",
  3070: "Snekkersten",
  3080: "Tikøb",
  3100: "Hornbæk",
  3120: "Dronningmølle",
  3140: "Ålsgårde",
  3150: "Hellebæk",
  3200: "Helsinge",
  3210: "Vejby",
  3220: "Tisvildeleje",
  3230: "Græsted",
  3250: "Gilleleje",
  3300: "Frederiksværk",
  3310: "Ølsted",
  3320: "Skævinge",
  3330: "Gørløse",
  3360: "Liseleje",
  3370: "Melby",
  3390: "Hundested",
  3400: "Hillerød",
  3450: "Allerød",
  3460: "Birkerød",
  3480: "Fredensborg",
  3490: "Kvistgård",
  3500: "Værløse",
  3520: "Farum",
  3540: "Lynge",
  3550: "Slangerup",
  3600: "Frederikssund",
  3630: "Jægerspris",
  3650: "Ølstykke",
  3660: "Stenløse",
  3670: "Veksø Sjælland",
  3700: "Rønne",
  3720: "Aakirkeby",
  3730: "Nexø",
  3740: "Svaneke",
  3751: "Østermarie",
  3760: "Gudhjem",
  3770: "Allinge",
  3782: "Klemensker",
  3790: "Hasle",
  4000: "Roskilde",
  4030: "Tune",
  4040: "Jyllinge",
  4050: "Skibby",
  4060: "Kirke Såby",
  4070: "Kirke Hyllinge",
  4100: "Ringsted",
  4130: "Viby Sjælland",
  4140: "Borup",
  4160: "Herlufmagle",
  4171: "Glumsø",
  4173: "Fjenneslev",
  4174: "Jystrup Midtsj",
  4180: "Sorø",
  4190: "Munke Bjergby",
  4200: "Slagelse",
  4220: "Korsør",
  4230: "Skælskør",
  4241: "Vemmelev",
  4242: "Boeslunde",
  4243: "Rude",
  4244: "Agersø",
  4245: "Omø",
  4250: "Fuglebjerg",
  4261: "Dalmose",
  4262: "Sandved",
  4270: "Høng",
  4281: "Gørlev",
  4291: "Ruds Vedby",
  4293: "Dianalund",
  4295: "Stenlille",
  4296: "Nyrup",
  4300: "Holbæk",
  4305: "Orø",
  4320: "Lejre",
  4330: "Hvalsø",
  4340: "Tølløse",
  4350: "Ugerløse",
  4360: "Kirke Eskilstrup",
  4370: "Store Merløse",
  4390: "Vipperød",
  4400: "Kalundborg",
  4420: "Regstrup",
  4440: "Mørkøv",
  4450: "Jyderup",
  4460: "Snertinge",
  4470: "Svebølle",
  4480: "Store Fuglede",
  4490: "Jerslev Sjælland",
  4500: "Nykøbing Sj",
  4520: "Svinninge",
  4532: "Gislinge",
  4534: "Hørve",
  4540: "Fårevejle",
  4550: "Asnæs",
  4560: "Vig",
  4571: "Grevinge",
  4572: "Nørre Asmindrup",
  4573: "Højby",
  4581: "Rørvig",
  4583: "Sjællands Odde",
  4591: "Føllenslev",
  4592: "Sejerø",
  4593: "Eskebjerg",
  4600: "Køge",
  4621: "Gadstrup",
  4622: "Havdrup",
  4623: "Lille Skensved",
  4632: "Bjæverskov",
  4640: "Faxe",
  4652: "Hårlev",
  4653: "Karise",
  4654: "Faxe Ladeplads",
  4660: "Store Heddinge",
  4671: "Strøby",
  4672: "Klippinge",
  4673: "Rødvig Stevns",
  4681: "Herfølge",
  4682: "Tureby",
  4683: "Rønnede",
  4684: "Holmegaard",
  4690: "Haslev",
  4700: "Næstved",
  4720: "Præstø",
  4733: "Tappernøje",
  4735: "Mern",
  4736: "Karrebæksminde",
  4750: "Lundby",
  4760: "Vordingborg",
  4771: "Kalvehave",
  4772: "Langebæk",
  4773: "Stensved",
  4780: "Stege",
  4791: "Borre",
  4792: "Askeby",
  4793: "Bogø By",
  4800: "Nykøbing F",
  4840: "Nørre Alslev",
  4850: "Stubbekøbing",
  4862: "Guldborg",
  4863: "Eskilstrup",
  4871: "Horbelev",
  4872: "Idestrup",
  4873: "Væggerløse",
  4874: "Gedser",
  4880: "Nysted",
  4891: "Toreby L",
  4892: "Kettinge",
  4894: "Øster Ulslev",
  4895: "Errindlev",
  4900: "Nakskov",
  4912: "Harpelunde",
  4913: "Horslunde",
  4920: "Søllested",
  4930: "Maribo",
  4941: "Bandholm",
  4942: "Askø",
  4943: "Torrig L",
  4944: "Fejø",
  4945: "Femø",
  4951: "Nørreballe",
  4952: "Stokkemarke",
  4953: "Vesterborg",
  4960: "Holeby",
  4970: "Rødby",
  4983: "Dannemare",
  4990: "Sakskøbing",
  5000: "Odense C",
  5200: "Odense V",
  5210: "Odense NV",
  5220: "Odense SØ",
  5230: "Odense M",
  5240: "Odense NØ",
  5250: "Odense SV",
  5260: "Odense S",
  5270: "Odense N",
  5290: "Marslev",
  5300: "Kerteminde",
  5320: "Agedrup",
  5330: "Munkebo",
  5350: "Rynkeby",
  5370: "Mesinge",
  5380: "Dalby",
  5390: "Martofte",
  5400: "Bogense",
  5450: "Otterup",
  5462: "Morud",
  5463: "Harndrup",
  5464: "Brenderup Fyn",
  5466: "Asperup",
  5471: "Søndersø",
  5474: "Veflinge",
  5485: "Skamby",
  5491: "Blommenslyst",
  5492: "Vissenbjerg",
  5500: "Middelfart",
  5540: "Ullerslev",
  5550: "Langeskov",
  5560: "Aarup",
  5580: "Nørre Aaby",
  5591: "Gelsted",
  5592: "Ejby",
  5600: "Faaborg",
  5601: "Lyø",
  5602: "Avernakø",
  5603: "Bjørnø",
  5610: "Assens",
  5620: "Glamsbjerg",
  5631: "Ebberup",
  5642: "Millinge",
  5672: "Broby",
  5683: "Haarby",
  5690: "Tommerup",
  5700: "Svendborg",
  5750: "Ringe",
  5762: "Vester Skerninge",
  5771: "Stenstrup",
  5772: "Kværndrup",
  5792: "Årslev",
  5800: "Nyborg",
  5853: "Ørbæk",
  5854: "Gislev",
  5856: "Ryslinge",
  5863: "Ferritslev Fyn",
  5871: "Frørup",
  5874: "Hesselager",
  5881: "Skårup Fyn",
  5882: "Vejstrup",
  5883: "Oure",
  5884: "Gudme",
  5892: "Gudbjerg Sydfyn",
  5900: "Rudkøbing",
  5932: "Humble",
  5935: "Bagenkop",
  5943: "Strynø",
  5953: "Tranekær",
  5960: "Marstal",
  5965: "Birkholm",
  5970: "Ærøskøbing",
  5985: "Søby Ærø",
  6000: "Kolding",
  6040: "Egtved",
  6051: "Almind",
  6052: "Viuf",
  6064: "Jordrup",
  6070: "Christiansfeld",
  6091: "Bjert",
  6092: "Sønder Stenderup",
  6093: "Sjølund",
  6094: "Hejls",
  6100: "Haderslev",
  6200: "Aabenraa",
  6210: "Barsø",
  6230: "Rødekro",
  6240: "Løgumkloster",
  6261: "Bredebro",
  6270: "Tønder",
  6280: "Højer",
  6300: "Gråsten",
  6310: "Broager",
  6320: "Egernsund",
  6330: "Padborg",
  6340: "Kruså",
  6360: "Tinglev",
  6372: "Bylderup-Bov",
  6392: "Bolderslev",
  6400: "Sønderborg",
  6430: "Nordborg",
  6440: "Augustenborg",
  6470: "Sydals",
  6500: "Vojens",
  6510: "Gram",
  6520: "Toftlund",
  6534: "Agerskov",
  6535: "Branderup J",
  6541: "Bevtoft",
  6560: "Sommersted",
  6580: "Vamdrup",
  6600: "Vejen",
  6621: "Gesten",
  6622: "Bække",
  6623: "Vorbasse",
  6630: "Rødding",
  6640: "Lunderskov",
  6650: "Brørup",
  6660: "Lintrup",
  6670: "Holsted",
  6682: "Hovborg",
  6683: "Føvling",
  6690: "Gørding",
  6700: "Esbjerg",
  6705: "Esbjerg Ø",
  6710: "Esbjerg V",
  6715: "Esbjerg N",
  6720: "Fanø",
  6731: "Tjæreborg",
  6740: "Bramming",
  6752: "Glejbjerg",
  6753: "Agerbæk",
  6760: "Ribe",
  6771: "Gredstedbro",
  6780: "Skærbæk",
  6792: "Rømø",
  6800: "Varde",
  6818: "Årre",
  6823: "Ansager",
  6830: "Nørre Nebel",
  6840: "Oksbøl",
  6851: "Janderup Vestj",
  6852: "Billum",
  6853: "Vejers Strand",
  6854: "Henne",
  6855: "Outrup",
  6857: "Blåvand",
  6862: "Tistrup",
  6870: "Ølgod",
  6880: "Tarm",
  6893: "Hemmet",
  6900: "Skjern",
  6920: "Videbæk",
  6933: "Kibæk",
  6940: "Lem St",
  6950: "Ringkøbing",
  6960: "Hvide Sande",
  6971: "Spjald",
  6973: "Ørnhøj",
  6980: "Tim",
  6990: "Ulfborg",
  7000: "Fredericia",
  7080: "Børkop",
  7100: "Vejle",
  7120: "Vejle Øst",
  7130: "Juelsminde",
  7140: "Stouby",
  7150: "Barrit",
  7160: "Tørring",
  7171: "Uldum",
  7173: "Vonge",
  7182: "Bredsten",
  7183: "Randbøl",
  7184: "Vandel",
  7190: "Billund",
  7200: "Grindsted",
  7250: "Hejnsvig",
  7260: "Sønder Omme",
  7270: "Stakroge",
  7280: "Sønder Felding",
  7300: "Jelling",
  7321: "Gadbjerg",
  7323: "Give",
  7330: "Brande",
  7361: "Ejstrupholm",
  7362: "Hampen",
  7400: "Herning",
  7430: "Ikast",
  7441: "Bording",
  7442: "Engesvang",
  7451: "Sunds",
  7470: "Karup J",
  7480: "Vildbjerg",
  7490: "Aulum",
  7500: "Holstebro",
  7540: "Haderup",
  7550: "Sørvad",
  7560: "Hjerm",
  7570: "Vemb",
  7600: "Struer",
  7620: "Lemvig",
  7650: "Bøvlingbjerg",
  7660: "Bækmarksbro",
  7673: "Harboøre",
  7680: "Thyborøn",
  7700: "Thisted",
  7730: "Hanstholm",
  7741: "Frøstrup",
  7742: "Vesløs",
  7752: "Snedsted",
  7755: "Bedsted Thy",
  7760: "Hurup Thy",
  7770: "Vestervig",
  7790: "Thyholm",
  7800: "Skive",
  7830: "Vinderup",
  7840: "Højslev",
  7850: "Stoholm Jyll",
  7860: "Spøttrup",
  7870: "Roslev",
  7884: "Fur",
  7900: "Nykøbing M",
  7950: "Erslev",
  7960: "Karby",
  7970: "Redsted M",
  7980: "Vils",
  7990: "Øster Assels",
  8000: "Aarhus C",
  8200: "Aarhus N",
  8210: "Aarhus V",
  8220: "Brabrand",
  8230: "Åbyhøj",
  8240: "Risskov",
  8250: "Egå",
  8260: "Viby J",
  8270: "Højbjerg",
  8300: "Odder",
  8305: "Samsø",
  8310: "Tranbjerg J",
  8320: "Mårslet",
  8330: "Beder",
  8340: "Malling",
  8350: "Hundslund",
  8355: "Solbjerg",
  8361: "Hasselager",
  8362: "Hørning",
  8370: "Hadsten",
  8380: "Trige",
  8381: "Tilst",
  8382: "Hinnerup",
  8400: "Ebeltoft",
  8410: "Rønde",
  8420: "Knebel",
  8444: "Balle",
  8450: "Hammel",
  8462: "Harlev J",
  8464: "Galten",
  8471: "Sabro",
  8472: "Sporup",
  8500: "Grenaa",
  8520: "Lystrup",
  8530: "Hjortshøj",
  8541: "Skødstrup",
  8543: "Hornslet",
  8544: "Mørke",
  8550: "Ryomgård",
  8560: "Kolind",
  8570: "Trustrup",
  8581: "Nimtofte",
  8585: "Glesborg",
  8586: "Ørum Djurs",
  8592: "Anholt",
  8600: "Silkeborg",
  8620: "Kjellerup",
  8632: "Lemming",
  8641: "Sorring",
  8643: "Ans By",
  8653: "Them",
  8654: "Bryrup",
  8660: "Skanderborg",
  8670: "Låsby",
  8680: "Ry",
  8700: "Horsens",
  8721: "Daugård",
  8722: "Hedensted",
  8723: "Løsning",
  8732: "Hovedgård",
  8740: "Brædstrup",
  8751: "Gedved",
  8752: "Østbirk",
  8762: "Flemming",
  8763: "Rask Mølle",
  8765: "Klovborg",
  8766: "Nørre Snede",
  8781: "Stenderup",
  8783: "Hornsyld",
  8789: "Endelave",
  8799: "Tunø",
  8800: "Viborg",
  8830: "Tjele",
  8831: "Løgstrup",
  8832: "Skals",
  8840: "Rødkærsbro",
  8850: "Bjerringbro",
  8860: "Ulstrup",
  8870: "Langå",
  8881: "Thorsø",
  8882: "Fårvang",
  8883: "Gjern",
  8900: "Randers C",
  8920: "Randers NV",
  8930: "Randers NØ",
  8940: "Randers SV",
  8950: "Ørsted",
  8960: "Randers SØ",
  8961: "Allingåbro",
  8963: "Auning",
  8970: "Havndal",
  8981: "Spentrup",
  8983: "Gjerlev J",
  8990: "Fårup",
  9000: "Aalborg",
  9200: "Aalborg SV",
  9210: "Aalborg SØ",
  9220: "Aalborg Øst",
  9230: "Svenstrup J",
  9240: "Nibe",
  9260: "Gistrup",
  9270: "Klarup",
  9280: "Storvorde",
  9293: "Kongerslev",
  9300: "Sæby",
  9310: "Vodskov",
  9320: "Hjallerup",
  9330: "Dronninglund",
  9340: "Asaa",
  9352: "Dybvad",
  9362: "Gandrup",
  9370: "Hals",
  9380: "Vestbjerg",
  9381: "Sulsted",
  9382: "Tylstrup",
  9400: "Nørresundby",
  9430: "Vadum",
  9440: "Aabybro",
  9460: "Brovst",
  9480: "Løkken",
  9490: "Pandrup",
  9492: "Blokhus",
  9493: "Saltum",
  9500: "Hobro",
  9510: "Arden",
  9520: "Skørping",
  9530: "Støvring",
  9541: "Suldrup",
  9550: "Mariager",
  9560: "Hadsund",
  9574: "Bælum",
  9575: "Terndrup",
  9600: "Aars",
  9610: "Nørager",
  9620: "Aalestrup",
  9631: "Gedsted",
  9632: "Møldrup",
  9640: "Farsø",
  9670: "Løgstør",
  9681: "Ranum",
  9690: "Fjerritslev",
  9700: "Brønderslev",
  9740: "Jerslev J",
  9750: "Østervrå",
  9760: "Vrå",
  9800: "Hjørring",
  9830: "Tårs",
  9850: "Hirtshals",
  9870: "Sindal",
  9881: "Bindslev",
  9900: "Frederikshavn",
  9940: "Læsø",
  9970: "Strandby",
  9981: "Jerup",
  9982: "Ålbæk",
  9990: "Skagen",
}


}),
"./js/tools/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ContextMenu: function() { return /* reexport safe */ _contextmenu__WEBPACK_IMPORTED_MODULE_7__.ContextMenu; },
  autocomplete: function() { return /* reexport safe */ _autocomplete__WEBPACK_IMPORTED_MODULE_0__.autocomplete; },
  countryList: function() { return /* reexport safe */ _countries__WEBPACK_IMPORTED_MODULE_6__.countryList; },
  dateCell: function() { return /* reexport safe */ _cells__WEBPACK_IMPORTED_MODULE_4__.dateCell; },
  escapeText: function() { return /* reexport safe */ _text__WEBPACK_IMPORTED_MODULE_2__.escapeText; },
  get: function() { return /* reexport safe */ _request__WEBPACK_IMPORTED_MODULE_1__.get; },
  getJson: function() { return /* reexport safe */ _request__WEBPACK_IMPORTED_MODULE_1__.getJson; },
  parseDate: function() { return /* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.parseDate; },
  post: function() { return /* reexport safe */ _request__WEBPACK_IMPORTED_MODULE_1__.post; },
  postCodes: function() { return /* reexport safe */ _dk_postcodes__WEBPACK_IMPORTED_MODULE_5__.postCodes; },
  postJson: function() { return /* reexport safe */ _request__WEBPACK_IMPORTED_MODULE_1__.postJson; },
  renderDate: function() { return /* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.renderDate; }
});
/* harmony import */var _autocomplete__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./autocomplete */ "./js/tools/autocomplete.js");
/* harmony import */var _request__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./request */ "./js/tools/request.js");
/* harmony import */var _text__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./text */ "./js/tools/text.js");
/* harmony import */var _date__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./date */ "./js/tools/date.js");
/* harmony import */var _cells__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cells */ "./js/tools/cells.js");
/* harmony import */var _dk_postcodes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./dk_postcodes */ "./js/tools/dk_postcodes.js");
/* harmony import */var _countries__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./countries */ "./js/tools/countries.js");
/* harmony import */var _contextmenu__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./contextmenu */ "./js/tools/contextmenu.js");










}),
"./js/tools/request.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  get: function() { return get; },
  getCookie: function() { return getCookie; },
  getJson: function() { return getJson; },
  post: function() { return post; },
  postBare: function() { return postBare; },
  postJson: function() { return postJson; }
});
// From https://github.com/fiduswriter/fiduswriter/blob/main/fiduswriter/base/static/js/modules/common/network.js
const getCookie = function (name) {
  if (!document.cookie || document.cookie === "") {
    return null
  }
  const cookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => {
      if (cookie.substring(0, name.length + 1) == name + "=") {
        return true
      } else {
        return false
      }
    })
  if (cookie) {
    return decodeURIComponent(cookie.substring(name.length + 1))
  }
  return null
}

const deleteCookie = function (name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}

const getCsrfToken = function () {
  return getCookie("csrftoken")
}

/* from https://www.tjvantoll.com/2015/09/13/fetch-and-errors/ */
const handleFetchErrors = function (response) {
  if (!response.ok) {
    throw response
  }
  return response
}

// We don't use django messages in the frontend. The only messages that are recording
//  are "user logged in" and "user logged out". The admin interface does use messages.
// To prevent it from displaying lots of old login/logout messages, we delete the
// messages after each post/get.
const removeDjangoMessages = function (response) {
  deleteCookie("messages")
  return response
}

const get = function (url, params = {}, csrfToken = false) {
  if (!csrfToken) {
    csrfToken = getCsrfToken() // Won't work in web worker.
  }
  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&")
  if (queryString.length) {
    url = `${url}?${queryString}`
  }
  return fetch(url, {
    method: "GET",
    headers: {
      "X-CSRFToken": csrfToken,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    credentials: "include",
  })
    .then(removeDjangoMessages)
    .then(handleFetchErrors)
}

const getJson = function (url, params = {}, csrfToken = false) {
  return get(url, params, csrfToken).then((response) =>
    response.json().then((json) => ({ json, status: response.status })),
  )
}

const postBare = function (url, params = {}, csrfToken = false) {
  if (!csrfToken) {
    csrfToken = getCsrfToken() // Won't work in web worker.
  }
  const body = new FormData()
  body.append("csrfmiddlewaretoken", csrfToken)
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (typeof value === "object" && value.file && value.filename) {
      body.append(key, value.file, value.filename)
    } else if (Array.isArray(value)) {
      value.forEach((item) => body.append(`${key}[]`, item))
    } else if (
      typeof value === "object" &&
      (value.constructor === undefined || value.constructor.name !== "File")
    ) {
      body.append(key, JSON.stringify(value))
    } else {
      body.append(key, value)
    }
  })

  return fetch(url, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    credentials: "include",
    body,
  })
}

const post = function (url, params = {}, csrfToken = false) {
  return postBare(url, params, csrfToken)
    .then(removeDjangoMessages)
    .then(handleFetchErrors)
}

// post and then return json and status
const postJson = function (url, params = {}, csrfToken = false) {
  return post(url, params, csrfToken).then((response) =>
    response.json().then((json) => ({ json, status: response.status })),
  )
}


}),
"./js/tools/text.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  escapeText: function() { return escapeText; }
});
// From https://github.com/fiduswriter/fiduswriter/blob/main/fiduswriter/base/static/js/modules/common/basic.js

const escapeText = function (text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}


}),
"./node_modules/.pnpm/diff-dom@5.1.4/node_modules/diff-dom/dist/module.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DiffDOM: function() { return DiffDOM; },
  TraceLogger: function() { return TraceLogger; },
  nodeToObj: function() { return nodeToObj; },
  stringToObj: function() { return stringToObj; }
});
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        var arguments$1 = arguments;

        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments$1[i];
            for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; } }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) { for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) { ar = Array.prototype.slice.call(from, 0, i); }
            ar[i] = from[i];
        }
    } }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var Diff = /** @class */ (function () {
    function Diff(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        Object.entries(options).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            return (_this[key] = value);
        });
    }
    Diff.prototype.toString = function () {
        return JSON.stringify(this);
    };
    Diff.prototype.setValue = function (aKey, aValue) {
        this[aKey] = aValue;
        return this;
    };
    return Diff;
}());
function checkElementType(element) {
    var arguments$1 = arguments;

    var elementTypeNames = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        elementTypeNames[_i - 1] = arguments$1[_i];
    }
    if (typeof element === "undefined" || element === null) {
        return false;
    }
    return elementTypeNames.some(function (elementTypeName) {
        var _a, _b;
        // We need to check if the specified type is defined
        // because otherwise instanceof throws an exception.
        return typeof ((_b = (_a = element === null || element === void 0 ? void 0 : element.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b[elementTypeName]) ===
            "function" &&
            element instanceof
                element.ownerDocument.defaultView[elementTypeName];
    });
}

function objToNode(objNode, insideSvg, options) {
    var node;
    if (objNode.nodeName === "#text") {
        node = options.document.createTextNode(objNode.data);
    }
    else if (objNode.nodeName === "#comment") {
        node = options.document.createComment(objNode.data);
    }
    else {
        if (insideSvg) {
            node = options.document.createElementNS("http://www.w3.org/2000/svg", objNode.nodeName);
            if (objNode.nodeName === "foreignObject") {
                insideSvg = false;
            }
        }
        else if (objNode.nodeName.toLowerCase() === "svg") {
            node = options.document.createElementNS("http://www.w3.org/2000/svg", "svg");
            insideSvg = true;
        }
        else {
            node = options.document.createElement(objNode.nodeName);
        }
        if (objNode.attributes) {
            Object.entries(objNode.attributes).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                return node.setAttribute(key, value);
            });
        }
        if (objNode.childNodes) {
            node = node;
            objNode.childNodes.forEach(function (childNode) {
                return node.appendChild(objToNode(childNode, insideSvg, options));
            });
        }
        if (options.valueDiffing) {
            if (objNode.value &&
                checkElementType(node, "HTMLButtonElement", "HTMLDataElement", "HTMLInputElement", "HTMLLIElement", "HTMLMeterElement", "HTMLOptionElement", "HTMLProgressElement", "HTMLParamElement")) {
                node.value = objNode.value;
            }
            if (objNode.checked && checkElementType(node, "HTMLInputElement")) {
                node.checked = objNode.checked;
            }
            if (objNode.selected &&
                checkElementType(node, "HTMLOptionElement")) {
                node.selected = objNode.selected;
            }
        }
    }
    return node;
}

// ===== Apply a diff =====
var getFromRoute = function (node, route) {
    route = route.slice();
    while (route.length > 0) {
        var c = route.splice(0, 1)[0];
        node = node.childNodes[c];
    }
    return node;
};
function applyDiff(tree, diff, options) {
    var action = diff[options._const.action];
    var route = diff[options._const.route];
    var node;
    if (![options._const.addElement, options._const.addTextElement].includes(action)) {
        // For adding nodes, we calculate the route later on. It's different because it includes the position of the newly added item.
        node = getFromRoute(tree, route);
    }
    var newNode;
    var reference;
    var nodeArray;
    // pre-diff hook
    var info = {
        diff: diff,
        node: node
    };
    if (options.preDiffApply(info)) {
        return true;
    }
    switch (action) {
        case options._const.addAttribute:
            if (!node || !checkElementType(node, "Element")) {
                return false;
            }
            node.setAttribute(diff[options._const.name], diff[options._const.value]);
            break;
        case options._const.modifyAttribute:
            if (!node || !checkElementType(node, "Element")) {
                return false;
            }
            node.setAttribute(diff[options._const.name], diff[options._const.newValue]);
            if (checkElementType(node, "HTMLInputElement") &&
                diff[options._const.name] === "value") {
                node.value = diff[options._const.newValue];
            }
            break;
        case options._const.removeAttribute:
            if (!node || !checkElementType(node, "Element")) {
                return false;
            }
            node.removeAttribute(diff[options._const.name]);
            break;
        case options._const.modifyTextElement:
            if (!node || !checkElementType(node, "Text")) {
                return false;
            }
            options.textDiff(node, node.data, diff[options._const.oldValue], diff[options._const.newValue]);
            if (checkElementType(node.parentNode, "HTMLTextAreaElement")) {
                node.parentNode.value = diff[options._const.newValue];
            }
            break;
        case options._const.modifyValue:
            if (!node || typeof node.value === "undefined") {
                return false;
            }
            node.value = diff[options._const.newValue];
            break;
        case options._const.modifyComment:
            if (!node || !checkElementType(node, "Comment")) {
                return false;
            }
            options.textDiff(node, node.data, diff[options._const.oldValue], diff[options._const.newValue]);
            break;
        case options._const.modifyChecked:
            if (!node || typeof node.checked === "undefined") {
                return false;
            }
            node.checked = diff[options._const.newValue];
            break;
        case options._const.modifySelected:
            if (!node || typeof node.selected === "undefined") {
                return false;
            }
            node.selected = diff[options._const.newValue];
            break;
        case options._const.replaceElement: {
            var insideSvg = diff[options._const.newValue].nodeName.toLowerCase() === "svg" ||
                node.parentNode.namespaceURI === "http://www.w3.org/2000/svg";
            node.parentNode.replaceChild(objToNode(diff[options._const.newValue], insideSvg, options), node);
            break;
        }
        case options._const.relocateGroup:
            nodeArray = __spreadArray([], new Array(diff[options._const.groupLength]), true).map(function () {
                return node.removeChild(node.childNodes[diff[options._const.from]]);
            });
            nodeArray.forEach(function (childNode, index) {
                if (index === 0) {
                    reference =
                        node.childNodes[diff[options._const.to]];
                }
                node.insertBefore(childNode, reference || null);
            });
            break;
        case options._const.removeElement:
            node.parentNode.removeChild(node);
            break;
        case options._const.addElement: {
            var parentRoute = route.slice();
            var c = parentRoute.splice(parentRoute.length - 1, 1)[0];
            node = getFromRoute(tree, parentRoute);
            if (!checkElementType(node, "Element")) {
                return false;
            }
            node.insertBefore(objToNode(diff[options._const.element], node.namespaceURI === "http://www.w3.org/2000/svg", options), node.childNodes[c] || null);
            break;
        }
        case options._const.removeTextElement: {
            if (!node || node.nodeType !== 3) {
                return false;
            }
            var parentNode = node.parentNode;
            parentNode.removeChild(node);
            if (checkElementType(parentNode, "HTMLTextAreaElement")) {
                parentNode.value = "";
            }
            break;
        }
        case options._const.addTextElement: {
            var parentRoute = route.slice();
            var c = parentRoute.splice(parentRoute.length - 1, 1)[0];
            newNode = options.document.createTextNode(diff[options._const.value]);
            node = getFromRoute(tree, parentRoute);
            if (!node.childNodes) {
                return false;
            }
            node.insertBefore(newNode, node.childNodes[c] || null);
            if (checkElementType(node.parentNode, "HTMLTextAreaElement")) {
                node.parentNode.value = diff[options._const.value];
            }
            break;
        }
        default:
            console.log("unknown action");
    }
    // if a new node was created, we might be interested in its
    // post diff hook
    options.postDiffApply({
        diff: info.diff,
        node: info.node,
        newNode: newNode
    });
    return true;
}
function applyDOM(tree, diffs, options) {
    return diffs.every(function (diff) {
        return applyDiff(tree, diff, options);
    });
}

// ===== Undo a diff =====
function swap(obj, p1, p2) {
    var tmp = obj[p1];
    obj[p1] = obj[p2];
    obj[p2] = tmp;
}
function undoDiff(tree, diff, options) {
    switch (diff[options._const.action]) {
        case options._const.addAttribute:
            diff[options._const.action] = options._const.removeAttribute;
            applyDiff(tree, diff, options);
            break;
        case options._const.modifyAttribute:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.removeAttribute:
            diff[options._const.action] = options._const.addAttribute;
            applyDiff(tree, diff, options);
            break;
        case options._const.modifyTextElement:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.modifyValue:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.modifyComment:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.modifyChecked:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.modifySelected:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.replaceElement:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break;
        case options._const.relocateGroup:
            swap(diff, options._const.from, options._const.to);
            applyDiff(tree, diff, options);
            break;
        case options._const.removeElement:
            diff[options._const.action] = options._const.addElement;
            applyDiff(tree, diff, options);
            break;
        case options._const.addElement:
            diff[options._const.action] = options._const.removeElement;
            applyDiff(tree, diff, options);
            break;
        case options._const.removeTextElement:
            diff[options._const.action] = options._const.addTextElement;
            applyDiff(tree, diff, options);
            break;
        case options._const.addTextElement:
            diff[options._const.action] = options._const.removeTextElement;
            applyDiff(tree, diff, options);
            break;
        default:
            console.log("unknown action");
    }
}
function undoDOM(tree, diffs, options) {
    diffs = diffs.slice();
    diffs.reverse();
    diffs.forEach(function (diff) {
        undoDiff(tree, diff, options);
    });
}

var elementDescriptors = function (el) {
    var output = [];
    output.push(el.nodeName);
    if (el.nodeName !== "#text" && el.nodeName !== "#comment") {
        el = el;
        if (el.attributes) {
            if (el.attributes["class"]) {
                output.push("".concat(el.nodeName, ".").concat(el.attributes["class"].replace(/ /g, ".")));
            }
            if (el.attributes.id) {
                output.push("".concat(el.nodeName, "#").concat(el.attributes.id));
            }
        }
    }
    return output;
};
var findUniqueDescriptors = function (li) {
    var uniqueDescriptors = {};
    var duplicateDescriptors = {};
    li.forEach(function (node) {
        elementDescriptors(node).forEach(function (descriptor) {
            var inUnique = descriptor in uniqueDescriptors;
            var inDupes = descriptor in duplicateDescriptors;
            if (!inUnique && !inDupes) {
                uniqueDescriptors[descriptor] = true;
            }
            else if (inUnique) {
                delete uniqueDescriptors[descriptor];
                duplicateDescriptors[descriptor] = true;
            }
        });
    });
    return uniqueDescriptors;
};
var uniqueInBoth = function (l1, l2) {
    var l1Unique = findUniqueDescriptors(l1);
    var l2Unique = findUniqueDescriptors(l2);
    var inBoth = {};
    Object.keys(l1Unique).forEach(function (key) {
        if (l2Unique[key]) {
            inBoth[key] = true;
        }
    });
    return inBoth;
};
var removeDone = function (tree) {
    delete tree.outerDone;
    delete tree.innerDone;
    delete tree.valueDone;
    if (tree.childNodes) {
        return tree.childNodes.every(removeDone);
    }
    else {
        return true;
    }
};
var cleanNode = function (diffNode) {
    if (Object.prototype.hasOwnProperty.call(diffNode, "data")) {
        var textNode = {
            nodeName: diffNode.nodeName === "#text" ? "#text" : "#comment",
            data: diffNode.data
        };
        return textNode;
    }
    else {
        var elementNode = {
            nodeName: diffNode.nodeName
        };
        diffNode = diffNode;
        if (Object.prototype.hasOwnProperty.call(diffNode, "attributes")) {
            elementNode.attributes = __assign({}, diffNode.attributes);
        }
        if (Object.prototype.hasOwnProperty.call(diffNode, "checked")) {
            elementNode.checked = diffNode.checked;
        }
        if (Object.prototype.hasOwnProperty.call(diffNode, "value")) {
            elementNode.value = diffNode.value;
        }
        if (Object.prototype.hasOwnProperty.call(diffNode, "selected")) {
            elementNode.selected = diffNode.selected;
        }
        if (Object.prototype.hasOwnProperty.call(diffNode, "childNodes")) {
            elementNode.childNodes = diffNode.childNodes.map(function (diffChildNode) {
                return cleanNode(diffChildNode);
            });
        }
        return elementNode;
    }
};
var isEqual = function (e1, e2) {
    if (!["nodeName", "value", "checked", "selected", "data"].every(function (element) {
        if (e1[element] !== e2[element]) {
            return false;
        }
        return true;
    })) {
        return false;
    }
    if (Object.prototype.hasOwnProperty.call(e1, "data")) {
        // Comment or Text
        return true;
    }
    e1 = e1;
    e2 = e2;
    if (Boolean(e1.attributes) !== Boolean(e2.attributes)) {
        return false;
    }
    if (Boolean(e1.childNodes) !== Boolean(e2.childNodes)) {
        return false;
    }
    if (e1.attributes) {
        var e1Attributes = Object.keys(e1.attributes);
        var e2Attributes = Object.keys(e2.attributes);
        if (e1Attributes.length !== e2Attributes.length) {
            return false;
        }
        if (!e1Attributes.every(function (attribute) {
            if (e1.attributes[attribute] !==
                e2.attributes[attribute]) {
                return false;
            }
            return true;
        })) {
            return false;
        }
    }
    if (e1.childNodes) {
        if (e1.childNodes.length !== e2.childNodes.length) {
            return false;
        }
        if (!e1.childNodes.every(function (childNode, index) {
            return isEqual(childNode, e2.childNodes[index]);
        })) {
            return false;
        }
    }
    return true;
};
var roughlyEqual = function (e1, e2, uniqueDescriptors, sameSiblings, preventRecursion) {
    if (preventRecursion === void 0) { preventRecursion = false; }
    if (!e1 || !e2) {
        return false;
    }
    if (e1.nodeName !== e2.nodeName) {
        return false;
    }
    if (["#text", "#comment"].includes(e1.nodeName)) {
        // Note that we initially don't care what the text content of a node is,
        // the mere fact that it's the same tag and "has text" means it's roughly
        // equal, and then we can find out the true text difference later.
        return preventRecursion
            ? true
            : e1.data === e2.data;
    }
    e1 = e1;
    e2 = e2;
    if (e1.nodeName in uniqueDescriptors) {
        return true;
    }
    if (e1.attributes && e2.attributes) {
        if (e1.attributes.id) {
            if (e1.attributes.id !== e2.attributes.id) {
                return false;
            }
            else {
                var idDescriptor = "".concat(e1.nodeName, "#").concat(e1.attributes.id);
                if (idDescriptor in uniqueDescriptors) {
                    return true;
                }
            }
        }
        if (e1.attributes["class"] &&
            e1.attributes["class"] === e2.attributes["class"]) {
            var classDescriptor = "".concat(e1.nodeName, ".").concat(e1.attributes["class"].replace(/ /g, "."));
            if (classDescriptor in uniqueDescriptors) {
                return true;
            }
        }
    }
    if (sameSiblings) {
        return true;
    }
    var nodeList1 = e1.childNodes ? e1.childNodes.slice().reverse() : [];
    var nodeList2 = e2.childNodes ? e2.childNodes.slice().reverse() : [];
    if (nodeList1.length !== nodeList2.length) {
        return false;
    }
    if (preventRecursion) {
        return nodeList1.every(function (element, index) {
            return element.nodeName === nodeList2[index].nodeName;
        });
    }
    else {
        // note: we only allow one level of recursion at any depth. If 'preventRecursion'
        // was not set, we must explicitly force it to true for child iterations.
        var childUniqueDescriptors_1 = uniqueInBoth(nodeList1, nodeList2);
        return nodeList1.every(function (element, index) {
            return roughlyEqual(element, nodeList2[index], childUniqueDescriptors_1, true, true);
        });
    }
};
/**
 * based on https://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Longest_common_substring#JavaScript
 */
var findCommonSubsets = function (c1, c2, marked1, marked2) {
    var lcsSize = 0;
    var index = [];
    var c1Length = c1.length;
    var c2Length = c2.length;
    var // set up the matching table
    matches = __spreadArray([], new Array(c1Length + 1), true).map(function () { return []; });
    var uniqueDescriptors = uniqueInBoth(c1, c2);
    var // If all of the elements are the same tag, id and class, then we can
    // consider them roughly the same even if they have a different number of
    // children. This will reduce removing and re-adding similar elements.
    subsetsSame = c1Length === c2Length;
    if (subsetsSame) {
        c1.some(function (element, i) {
            var c1Desc = elementDescriptors(element);
            var c2Desc = elementDescriptors(c2[i]);
            if (c1Desc.length !== c2Desc.length) {
                subsetsSame = false;
                return true;
            }
            c1Desc.some(function (description, i) {
                if (description !== c2Desc[i]) {
                    subsetsSame = false;
                    return true;
                }
            });
            if (!subsetsSame) {
                return true;
            }
        });
    }
    // fill the matches with distance values
    for (var c1Index = 0; c1Index < c1Length; c1Index++) {
        var c1Element = c1[c1Index];
        for (var c2Index = 0; c2Index < c2Length; c2Index++) {
            var c2Element = c2[c2Index];
            if (!marked1[c1Index] &&
                !marked2[c2Index] &&
                roughlyEqual(c1Element, c2Element, uniqueDescriptors, subsetsSame)) {
                matches[c1Index + 1][c2Index + 1] = matches[c1Index][c2Index]
                    ? matches[c1Index][c2Index] + 1
                    : 1;
                if (matches[c1Index + 1][c2Index + 1] >= lcsSize) {
                    lcsSize = matches[c1Index + 1][c2Index + 1];
                    index = [c1Index + 1, c2Index + 1];
                }
            }
            else {
                matches[c1Index + 1][c2Index + 1] = 0;
            }
        }
    }
    if (lcsSize === 0) {
        return false;
    }
    return {
        oldValue: index[0] - lcsSize,
        newValue: index[1] - lcsSize,
        length: lcsSize
    };
};
var makeBooleanArray = function (n, v) {
    return __spreadArray([], new Array(n), true).map(function () { return v; });
};
/**
 * Generate arrays that indicate which node belongs to which subset,
 * or whether it's actually an orphan node, existing in only one
 * of the two trees, rather than somewhere in both.
 *
 * So if t1 = <img><canvas><br>, t2 = <canvas><br><img>.
 * The longest subset is "<canvas><br>" (length 2), so it will group 0.
 * The second longest is "<img>" (length 1), so it will be group 1.
 * gaps1 will therefore be [1,0,0] and gaps2 [0,0,1].
 *
 * If an element is not part of any group, it will stay being 'true', which
 * is the initial value. For example:
 * t1 = <img><p></p><br><canvas>, t2 = <b></b><br><canvas><img>
 *
 * The "<p></p>" and "<b></b>" do only show up in one of the two and will
 * therefore be marked by "true". The remaining parts are parts of the
 * groups 0 and 1:
 * gaps1 = [1, true, 0, 0], gaps2 = [true, 0, 0, 1]
 *
 */
var getGapInformation = function (t1, t2, stable) {
    var gaps1 = t1.childNodes
        ? makeBooleanArray(t1.childNodes.length, true)
        : [];
    var gaps2 = t2.childNodes
        ? makeBooleanArray(t2.childNodes.length, true)
        : [];
    var group = 0;
    // give elements from the same subset the same group number
    stable.forEach(function (subset) {
        var endOld = subset.oldValue + subset.length;
        var endNew = subset.newValue + subset.length;
        for (var j = subset.oldValue; j < endOld; j += 1) {
            gaps1[j] = group;
        }
        for (var j = subset.newValue; j < endNew; j += 1) {
            gaps2[j] = group;
        }
        group += 1;
    });
    return {
        gaps1: gaps1,
        gaps2: gaps2
    };
};
/**
 * Find all matching subsets, based on immediate child differences only.
 */
var markBoth = function (marked1, marked2, subset, i) {
    marked1[subset.oldValue + i] = true;
    marked2[subset.newValue + i] = true;
};
var markSubTrees = function (oldTree, newTree) {
    // note: the child lists are views, and so update as we update old/newTree
    var oldChildren = oldTree.childNodes ? oldTree.childNodes : [];
    var newChildren = newTree.childNodes ? newTree.childNodes : [];
    var marked1 = makeBooleanArray(oldChildren.length, false);
    var marked2 = makeBooleanArray(newChildren.length, false);
    var subsets = [];
    var returnIndex = function () {
        return arguments[1];
    };
    var foundAllSubsets = false;
    var _loop_1 = function () {
        var subset = findCommonSubsets(oldChildren, newChildren, marked1, marked2);
        if (subset) {
            subsets.push(subset);
            var subsetArray = __spreadArray([], new Array(subset.length), true).map(returnIndex);
            subsetArray.forEach(function (item) {
                return markBoth(marked1, marked2, subset, item);
            });
        }
        else {
            foundAllSubsets = true;
        }
    };
    while (!foundAllSubsets) {
        _loop_1();
    }
    oldTree.subsets = subsets;
    oldTree.subsetsAge = 100;
    return subsets;
};
var DiffTracker = /** @class */ (function () {
    function DiffTracker() {
        this.list = [];
    }
    DiffTracker.prototype.add = function (diffs) {
        var _a;
        (_a = this.list).push.apply(_a, diffs);
    };
    DiffTracker.prototype.forEach = function (fn) {
        this.list.forEach(function (li) { return fn(li); });
    };
    return DiffTracker;
}());

// ===== Apply a virtual diff =====
function getFromVirtualRoute(tree, route) {
    var node = tree;
    var parentNode;
    var nodeIndex;
    route = route.slice();
    while (route.length > 0) {
        nodeIndex = route.splice(0, 1)[0];
        parentNode = node;
        node = node.childNodes ? node.childNodes[nodeIndex] : undefined;
    }
    return {
        node: node,
        parentNode: parentNode,
        nodeIndex: nodeIndex
    };
}
function applyVirtualDiff(tree, diff, options) {
    var _a;
    var node, parentNode, nodeIndex;
    if (![options._const.addElement, options._const.addTextElement].includes(diff[options._const.action])) {
        // For adding nodes, we calculate the route later on. It's different because it includes the position of the newly added item.
        var routeInfo = getFromVirtualRoute(tree, diff[options._const.route]);
        node = routeInfo.node;
        parentNode = routeInfo.parentNode;
        nodeIndex = routeInfo.nodeIndex;
    }
    var newSubsets = [];
    // pre-diff hook
    var info = {
        diff: diff,
        node: node
    };
    if (options.preVirtualDiffApply(info)) {
        return true;
    }
    var newNode;
    var nodeArray;
    var route;
    switch (diff[options._const.action]) {
        case options._const.addAttribute:
            if (!node.attributes) {
                node.attributes = {};
            }
            node.attributes[diff[options._const.name]] =
                diff[options._const.value];
            if (diff[options._const.name] === "checked") {
                node.checked = true;
            }
            else if (diff[options._const.name] === "selected") {
                node.selected = true;
            }
            else if (node.nodeName === "INPUT" &&
                diff[options._const.name] === "value") {
                node.value = diff[options._const.value];
            }
            break;
        case options._const.modifyAttribute:
            node.attributes[diff[options._const.name]] =
                diff[options._const.newValue];
            break;
        case options._const.removeAttribute:
            delete node.attributes[diff[options._const.name]];
            if (Object.keys(node.attributes).length === 0) {
                delete node.attributes;
            }
            if (diff[options._const.name] === "checked") {
                node.checked = false;
            }
            else if (diff[options._const.name] === "selected") {
                delete node.selected;
            }
            else if (node.nodeName === "INPUT" &&
                diff[options._const.name] === "value") {
                delete node.value;
            }
            break;
        case options._const.modifyTextElement:
            node.data = diff[options._const.newValue];
            if (parentNode.nodeName === "TEXTAREA") {
                parentNode.value = diff[options._const.newValue];
            }
            break;
        case options._const.modifyValue:
            node.value = diff[options._const.newValue];
            break;
        case options._const.modifyComment:
            node.data = diff[options._const.newValue];
            break;
        case options._const.modifyChecked:
            node.checked = diff[options._const.newValue];
            break;
        case options._const.modifySelected:
            node.selected = diff[options._const.newValue];
            break;
        case options._const.replaceElement:
            newNode = cleanNode(diff[options._const.newValue]);
            parentNode.childNodes[nodeIndex] = newNode;
            break;
        case options._const.relocateGroup:
            nodeArray = node.childNodes
                .splice(diff[options._const.from], diff[options._const.groupLength])
                .reverse();
            nodeArray.forEach(function (movedNode) {
                return node.childNodes.splice(diff[options._const.to], 0, movedNode);
            });
            if (node.subsets) {
                node.subsets.forEach(function (map) {
                    if (diff[options._const.from] < diff[options._const.to] &&
                        map.oldValue <= diff[options._const.to] &&
                        map.oldValue > diff[options._const.from]) {
                        map.oldValue -= diff[options._const.groupLength];
                        var splitLength = map.oldValue + map.length - diff[options._const.to];
                        if (splitLength > 0) {
                            // new insertion splits map.
                            newSubsets.push({
                                oldValue: diff[options._const.to] +
                                    diff[options._const.groupLength],
                                newValue: map.newValue + map.length - splitLength,
                                length: splitLength
                            });
                            map.length -= splitLength;
                        }
                    }
                    else if (diff[options._const.from] > diff[options._const.to] &&
                        map.oldValue > diff[options._const.to] &&
                        map.oldValue < diff[options._const.from]) {
                        map.oldValue += diff[options._const.groupLength];
                        var splitLength = map.oldValue + map.length - diff[options._const.to];
                        if (splitLength > 0) {
                            // new insertion splits map.
                            newSubsets.push({
                                oldValue: diff[options._const.to] +
                                    diff[options._const.groupLength],
                                newValue: map.newValue + map.length - splitLength,
                                length: splitLength
                            });
                            map.length -= splitLength;
                        }
                    }
                    else if (map.oldValue === diff[options._const.from]) {
                        map.oldValue = diff[options._const.to];
                    }
                });
            }
            break;
        case options._const.removeElement:
            parentNode.childNodes.splice(nodeIndex, 1);
            if (parentNode.subsets) {
                parentNode.subsets.forEach(function (map) {
                    if (map.oldValue > nodeIndex) {
                        map.oldValue -= 1;
                    }
                    else if (map.oldValue === nodeIndex) {
                        map["delete"] = true;
                    }
                    else if (map.oldValue < nodeIndex &&
                        map.oldValue + map.length > nodeIndex) {
                        if (map.oldValue + map.length - 1 === nodeIndex) {
                            map.length--;
                        }
                        else {
                            newSubsets.push({
                                newValue: map.newValue + nodeIndex - map.oldValue,
                                oldValue: nodeIndex,
                                length: map.length - nodeIndex + map.oldValue - 1
                            });
                            map.length = nodeIndex - map.oldValue;
                        }
                    }
                });
            }
            node = parentNode;
            break;
        case options._const.addElement: {
            route = diff[options._const.route].slice();
            var c_1 = route.splice(route.length - 1, 1)[0];
            node = (_a = getFromVirtualRoute(tree, route)) === null || _a === void 0 ? void 0 : _a.node;
            newNode = cleanNode(diff[options._const.element]);
            if (!node.childNodes) {
                node.childNodes = [];
            }
            if (c_1 >= node.childNodes.length) {
                node.childNodes.push(newNode);
            }
            else {
                node.childNodes.splice(c_1, 0, newNode);
            }
            if (node.subsets) {
                node.subsets.forEach(function (map) {
                    if (map.oldValue >= c_1) {
                        map.oldValue += 1;
                    }
                    else if (map.oldValue < c_1 &&
                        map.oldValue + map.length > c_1) {
                        var splitLength = map.oldValue + map.length - c_1;
                        newSubsets.push({
                            newValue: map.newValue + map.length - splitLength,
                            oldValue: c_1 + 1,
                            length: splitLength
                        });
                        map.length -= splitLength;
                    }
                });
            }
            break;
        }
        case options._const.removeTextElement:
            parentNode.childNodes.splice(nodeIndex, 1);
            if (parentNode.nodeName === "TEXTAREA") {
                delete parentNode.value;
            }
            if (parentNode.subsets) {
                parentNode.subsets.forEach(function (map) {
                    if (map.oldValue > nodeIndex) {
                        map.oldValue -= 1;
                    }
                    else if (map.oldValue === nodeIndex) {
                        map["delete"] = true;
                    }
                    else if (map.oldValue < nodeIndex &&
                        map.oldValue + map.length > nodeIndex) {
                        if (map.oldValue + map.length - 1 === nodeIndex) {
                            map.length--;
                        }
                        else {
                            newSubsets.push({
                                newValue: map.newValue + nodeIndex - map.oldValue,
                                oldValue: nodeIndex,
                                length: map.length - nodeIndex + map.oldValue - 1
                            });
                            map.length = nodeIndex - map.oldValue;
                        }
                    }
                });
            }
            node = parentNode;
            break;
        case options._const.addTextElement: {
            route = diff[options._const.route].slice();
            var c_2 = route.splice(route.length - 1, 1)[0];
            newNode = {
                nodeName: "#text",
                data: diff[options._const.value]
            };
            node = getFromVirtualRoute(tree, route).node;
            if (!node.childNodes) {
                node.childNodes = [];
            }
            if (c_2 >= node.childNodes.length) {
                node.childNodes.push(newNode);
            }
            else {
                node.childNodes.splice(c_2, 0, newNode);
            }
            if (node.nodeName === "TEXTAREA") {
                node.value = diff[options._const.newValue];
            }
            if (node.subsets) {
                node.subsets.forEach(function (map) {
                    if (map.oldValue >= c_2) {
                        map.oldValue += 1;
                    }
                    if (map.oldValue < c_2 && map.oldValue + map.length > c_2) {
                        var splitLength = map.oldValue + map.length - c_2;
                        newSubsets.push({
                            newValue: map.newValue + map.length - splitLength,
                            oldValue: c_2 + 1,
                            length: splitLength
                        });
                        map.length -= splitLength;
                    }
                });
            }
            break;
        }
        default:
            console.log("unknown action");
    }
    if (node.subsets) {
        node.subsets = node.subsets.filter(function (map) { return !map["delete"] && map.oldValue !== map.newValue; });
        if (newSubsets.length) {
            node.subsets = node.subsets.concat(newSubsets);
        }
    }
    options.postVirtualDiffApply({
        node: info.node,
        diff: info.diff,
        newNode: newNode
    });
    return;
}
function applyVirtual(tree, diffs, options) {
    diffs.forEach(function (diff) {
        applyVirtualDiff(tree, diff, options);
    });
    return true;
}

function nodeToObj(aNode, options) {
    if (options === void 0) { options = { valueDiffing: true }; }
    var objNode = {
        nodeName: aNode.nodeName
    };
    if (checkElementType(aNode, "Text", "Comment")) {
        objNode.data = aNode.data;
    }
    else {
        if (aNode.attributes && aNode.attributes.length > 0) {
            objNode.attributes = {};
            var nodeArray = Array.prototype.slice.call(aNode.attributes);
            nodeArray.forEach(function (attribute) {
                return (objNode.attributes[attribute.name] = attribute.value);
            });
        }
        if (aNode.childNodes && aNode.childNodes.length > 0) {
            objNode.childNodes = [];
            var nodeArray = Array.prototype.slice.call(aNode.childNodes);
            nodeArray.forEach(function (childNode) {
                return objNode.childNodes.push(nodeToObj(childNode, options));
            });
        }
        if (options.valueDiffing) {
            if (checkElementType(aNode, "HTMLTextAreaElement")) {
                objNode.value = aNode.value;
            }
            if (checkElementType(aNode, "HTMLInputElement") &&
                ["radio", "checkbox"].includes(aNode.type.toLowerCase()) &&
                aNode.checked !== undefined) {
                objNode.checked = aNode.checked;
            }
            else if (checkElementType(aNode, "HTMLButtonElement", "HTMLDataElement", "HTMLInputElement", "HTMLLIElement", "HTMLMeterElement", "HTMLOptionElement", "HTMLProgressElement", "HTMLParamElement")) {
                objNode.value = aNode.value;
            }
            if (checkElementType(aNode, "HTMLOptionElement")) {
                objNode.selected = aNode.selected;
            }
        }
    }
    return objNode;
}

// from html-parse-stringify (MIT)
var tagRE = /<\s*\/*[a-zA-Z:_][a-zA-Z0-9:_\-.]*\s*(?:"[^"]*"['"]*|'[^']*'['"]*|[^'"/>])*\/*\s*>|<!--(?:.|\n|\r)*?-->/g;
var attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;
function unescape(string) {
    return string
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}
// create optimized lookup object for
// void elements as listed here:
// https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
var lookup = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    menuItem: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
};
var parseTag = function (tag, caseSensitive) {
    var res = {
        nodeName: "",
        attributes: {}
    };
    var voidElement = false;
    var type = "tag";
    var tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
    if (tagMatch) {
        res.nodeName =
            caseSensitive || tagMatch[1] === "svg"
                ? tagMatch[1]
                : tagMatch[1].toUpperCase();
        if (lookup[tagMatch[1]] || tag.charAt(tag.length - 2) === "/") {
            voidElement = true;
        }
        // handle comment tag
        if (res.nodeName.startsWith("!--")) {
            var endIndex = tag.indexOf("-->");
            return {
                type: "comment",
                node: {
                    nodeName: "#comment",
                    data: endIndex !== -1 ? tag.slice(4, endIndex) : ""
                },
                voidElement: voidElement
            };
        }
    }
    var reg = new RegExp(attrRE);
    var result = null;
    var done = false;
    while (!done) {
        result = reg.exec(tag);
        if (result === null) {
            done = true;
        }
        else if (result[0].trim()) {
            if (result[1]) {
                var attr = result[1].trim();
                var arr = [attr, ""];
                if (attr.indexOf("=") > -1)
                    { arr = attr.split("="); }
                res.attributes[arr[0]] = arr[1];
                reg.lastIndex--;
            }
            else if (result[2])
                { res.attributes[result[2]] = result[3]
                    .trim()
                    .substring(1, result[3].length - 1); }
        }
    }
    return {
        type: type,
        node: res,
        voidElement: voidElement
    };
};
var stringToObj = function (html, options) {
    if (options === void 0) { options = {
        valueDiffing: true,
        caseSensitive: false
    }; }
    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var inComponent = false, insideSvg = false;
    // handle text at top level
    if (html.indexOf("<") !== 0) {
        var end = html.indexOf("<");
        result.push({
            nodeName: "#text",
            data: end === -1 ? html : html.substring(0, end)
        });
    }
    html.replace(tagRE, function (tag, index) {
        var isOpen = tag.charAt(1) !== "/";
        var isComment = tag.startsWith("<!--");
        var start = index + tag.length;
        var nextChar = html.charAt(start);
        if (isComment) {
            var comment = parseTag(tag, options.caseSensitive).node;
            // if we're at root, push new base node
            if (level < 0) {
                result.push(comment);
                return "";
            }
            var parent_1 = arr[level];
            if (parent_1 && comment.nodeName) {
                if (!parent_1.node.childNodes) {
                    parent_1.node.childNodes = [];
                }
                parent_1.node.childNodes.push(comment);
            }
            return "";
        }
        if (isOpen) {
            current = parseTag(tag, options.caseSensitive || insideSvg);
            if (current.node.nodeName === "svg") {
                insideSvg = true;
            }
            level++;
            if (!current.voidElement &&
                !inComponent &&
                nextChar &&
                nextChar !== "<") {
                if (!current.node.childNodes) {
                    current.node.childNodes = [];
                }
                var data = unescape(html.slice(start, html.indexOf("<", start)));
                current.node.childNodes.push({
                    nodeName: "#text",
                    data: data
                });
                if (options.valueDiffing &&
                    current.node.nodeName === "TEXTAREA") {
                    current.node.value = data;
                }
            }
            // if we're at root, push new base node
            if (level === 0 && current.node.nodeName) {
                result.push(current.node);
            }
            var parent_2 = arr[level - 1];
            if (parent_2 && current.node.nodeName) {
                if (!parent_2.node.childNodes) {
                    parent_2.node.childNodes = [];
                }
                parent_2.node.childNodes.push(current.node);
            }
            arr[level] = current;
        }
        if (!isOpen || current.voidElement) {
            if (level > -1 &&
                (current.voidElement ||
                    (options.caseSensitive &&
                        current.node.nodeName === tag.slice(2, -1)) ||
                    (!options.caseSensitive &&
                        current.node.nodeName.toUpperCase() ===
                            tag.slice(2, -1).toUpperCase()))) {
                level--;
                // move current up a level to match the end tag
                if (level > -1) {
                    if (current.node.nodeName === "svg") {
                        insideSvg = false;
                    }
                    current = arr[level];
                }
            }
            if (nextChar !== "<" && nextChar) {
                // trailing text node
                // if we're at the root, push a base text node. otherwise add as
                // a child to the current node.
                var childNodes = level === -1 ? result : arr[level].node.childNodes || [];
                // calculate correct end of the data slice in case there's
                // no tag after the text node.
                var end = html.indexOf("<", start);
                var data = unescape(html.slice(start, end === -1 ? undefined : end));
                childNodes.push({
                    nodeName: "#text",
                    data: data
                });
            }
        }
        return "";
    });
    return result[0];
};

// ===== Create a diff =====
var DiffFinder = /** @class */ (function () {
    function DiffFinder(t1Node, t2Node, options) {
        this.options = options;
        this.t1 = (typeof Element !== "undefined" &&
            checkElementType(t1Node, "Element")
            ? nodeToObj(t1Node, this.options)
            : typeof t1Node === "string"
                ? stringToObj(t1Node, this.options)
                : JSON.parse(JSON.stringify(t1Node)));
        this.t2 = (typeof Element !== "undefined" &&
            checkElementType(t2Node, "Element")
            ? nodeToObj(t2Node, this.options)
            : typeof t2Node === "string"
                ? stringToObj(t2Node, this.options)
                : JSON.parse(JSON.stringify(t2Node)));
        this.diffcount = 0;
        this.foundAll = false;
        if (this.debug) {
            this.t1Orig =
                typeof Element !== "undefined" &&
                    checkElementType(t1Node, "Element")
                    ? nodeToObj(t1Node, this.options)
                    : typeof t1Node === "string"
                        ? stringToObj(t1Node, this.options)
                        : JSON.parse(JSON.stringify(t1Node));
            this.t2Orig =
                typeof Element !== "undefined" &&
                    checkElementType(t2Node, "Element")
                    ? nodeToObj(t2Node, this.options)
                    : typeof t2Node === "string"
                        ? stringToObj(t2Node, this.options)
                        : JSON.parse(JSON.stringify(t2Node));
        }
        this.tracker = new DiffTracker();
    }
    DiffFinder.prototype.init = function () {
        return this.findDiffs(this.t1, this.t2);
    };
    DiffFinder.prototype.findDiffs = function (t1, t2) {
        var diffs;
        do {
            if (this.options.debug) {
                this.diffcount += 1;
                if (this.diffcount > this.options.diffcap) {
                    throw new Error("surpassed diffcap:".concat(JSON.stringify(this.t1Orig), " -> ").concat(JSON.stringify(this.t2Orig)));
                }
            }
            diffs = this.findNextDiff(t1, t2, []);
            if (diffs.length === 0) {
                // Last check if the elements really are the same now.
                // If not, remove all info about being done and start over.
                // Sometimes a node can be marked as done, but the creation of subsequent diffs means that it has to be changed again.
                if (!isEqual(t1, t2)) {
                    if (this.foundAll) {
                        console.error("Could not find remaining diffs!");
                    }
                    else {
                        this.foundAll = true;
                        removeDone(t1);
                        diffs = this.findNextDiff(t1, t2, []);
                    }
                }
            }
            if (diffs.length > 0) {
                this.foundAll = false;
                this.tracker.add(diffs);
                applyVirtual(t1, diffs, this.options);
            }
        } while (diffs.length > 0);
        return this.tracker.list;
    };
    DiffFinder.prototype.findNextDiff = function (t1, t2, route) {
        var diffs;
        var fdiffs;
        if (this.options.maxDepth && route.length > this.options.maxDepth) {
            return [];
        }
        // outer differences?
        if (!t1.outerDone) {
            diffs = this.findOuterDiff(t1, t2, route);
            if (this.options.filterOuterDiff) {
                fdiffs = this.options.filterOuterDiff(t1, t2, diffs);
                if (fdiffs)
                    { diffs = fdiffs; }
            }
            if (diffs.length > 0) {
                t1.outerDone = true;
                return diffs;
            }
            else {
                t1.outerDone = true;
            }
        }
        if (Object.prototype.hasOwnProperty.call(t1, "data")) {
            // Comment or Text
            return [];
        }
        t1 = t1;
        t2 = t2;
        // inner differences?
        if (!t1.innerDone) {
            diffs = this.findInnerDiff(t1, t2, route);
            if (diffs.length > 0) {
                return diffs;
            }
            else {
                t1.innerDone = true;
            }
        }
        if (this.options.valueDiffing && !t1.valueDone) {
            // value differences?
            diffs = this.findValueDiff(t1, t2, route);
            if (diffs.length > 0) {
                t1.valueDone = true;
                return diffs;
            }
            else {
                t1.valueDone = true;
            }
        }
        // no differences
        return [];
    };
    DiffFinder.prototype.findOuterDiff = function (t1, t2, route) {
        var diffs = [];
        var attr;
        var attr1;
        var attr2;
        var attrLength;
        var pos;
        var i;
        if (t1.nodeName !== t2.nodeName) {
            if (!route.length) {
                throw new Error("Top level nodes have to be of the same kind.");
            }
            return [
                new Diff()
                    .setValue(this.options._const.action, this.options._const.replaceElement)
                    .setValue(this.options._const.oldValue, cleanNode(t1))
                    .setValue(this.options._const.newValue, cleanNode(t2))
                    .setValue(this.options._const.route, route) ];
        }
        if (route.length &&
            this.options.diffcap <
                Math.abs((t1.childNodes || []).length - (t2.childNodes || []).length)) {
            return [
                new Diff()
                    .setValue(this.options._const.action, this.options._const.replaceElement)
                    .setValue(this.options._const.oldValue, cleanNode(t1))
                    .setValue(this.options._const.newValue, cleanNode(t2))
                    .setValue(this.options._const.route, route) ];
        }
        if (Object.prototype.hasOwnProperty.call(t1, "data") &&
            t1.data !== t2.data) {
            // Comment or text node.
            if (t1.nodeName === "#text") {
                return [
                    new Diff()
                        .setValue(this.options._const.action, this.options._const.modifyTextElement)
                        .setValue(this.options._const.route, route)
                        .setValue(this.options._const.oldValue, t1.data)
                        .setValue(this.options._const.newValue, t2.data) ];
            }
            else {
                return [
                    new Diff()
                        .setValue(this.options._const.action, this.options._const.modifyComment)
                        .setValue(this.options._const.route, route)
                        .setValue(this.options._const.oldValue, t1.data)
                        .setValue(this.options._const.newValue, t2.data) ];
            }
        }
        t1 = t1;
        t2 = t2;
        attr1 = t1.attributes ? Object.keys(t1.attributes).sort() : [];
        attr2 = t2.attributes ? Object.keys(t2.attributes).sort() : [];
        attrLength = attr1.length;
        for (i = 0; i < attrLength; i++) {
            attr = attr1[i];
            pos = attr2.indexOf(attr);
            if (pos === -1) {
                diffs.push(new Diff()
                    .setValue(this.options._const.action, this.options._const.removeAttribute)
                    .setValue(this.options._const.route, route)
                    .setValue(this.options._const.name, attr)
                    .setValue(this.options._const.value, t1.attributes[attr]));
            }
            else {
                attr2.splice(pos, 1);
                if (t1.attributes[attr] !== t2.attributes[attr]) {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.modifyAttribute)
                        .setValue(this.options._const.route, route)
                        .setValue(this.options._const.name, attr)
                        .setValue(this.options._const.oldValue, t1.attributes[attr])
                        .setValue(this.options._const.newValue, t2.attributes[attr]));
                }
            }
        }
        attrLength = attr2.length;
        for (i = 0; i < attrLength; i++) {
            attr = attr2[i];
            diffs.push(new Diff()
                .setValue(this.options._const.action, this.options._const.addAttribute)
                .setValue(this.options._const.route, route)
                .setValue(this.options._const.name, attr)
                .setValue(this.options._const.value, t2.attributes[attr]));
        }
        return diffs;
    };
    DiffFinder.prototype.findInnerDiff = function (t1, t2, route) {
        var t1ChildNodes = t1.childNodes ? t1.childNodes.slice() : [];
        var t2ChildNodes = t2.childNodes ? t2.childNodes.slice() : [];
        var last = Math.max(t1ChildNodes.length, t2ChildNodes.length);
        var childNodesLengthDifference = Math.abs(t1ChildNodes.length - t2ChildNodes.length);
        var diffs = [];
        var index = 0;
        if (!this.options.maxChildCount || last < this.options.maxChildCount) {
            var cachedSubtrees = Boolean(t1.subsets && t1.subsetsAge--);
            var subtrees = cachedSubtrees
                ? t1.subsets
                : t1.childNodes && t2.childNodes
                    ? markSubTrees(t1, t2)
                    : [];
            if (subtrees.length > 0) {
                /* One or more groups have been identified among the childnodes of t1
                 * and t2.
                 */
                diffs = this.attemptGroupRelocation(t1, t2, subtrees, route, cachedSubtrees);
                if (diffs.length > 0) {
                    return diffs;
                }
            }
        }
        /* 0 or 1 groups of similar child nodes have been found
         * for t1 and t2. 1 If there is 1, it could be a sign that the
         * contents are the same. When the number of groups is below 2,
         * t1 and t2 are made to have the same length and each of the
         * pairs of child nodes are diffed.
         */
        for (var i = 0; i < last; i += 1) {
            var e1 = t1ChildNodes[i];
            var e2 = t2ChildNodes[i];
            if (childNodesLengthDifference) {
                /* t1 and t2 have different amounts of childNodes. Add
                 * and remove as necessary to obtain the same length */
                if (e1 && !e2) {
                    if (e1.nodeName === "#text") {
                        diffs.push(new Diff()
                            .setValue(this.options._const.action, this.options._const.removeTextElement)
                            .setValue(this.options._const.route, route.concat(index))
                            .setValue(this.options._const.value, e1.data));
                        index -= 1;
                    }
                    else {
                        diffs.push(new Diff()
                            .setValue(this.options._const.action, this.options._const.removeElement)
                            .setValue(this.options._const.route, route.concat(index))
                            .setValue(this.options._const.element, cleanNode(e1)));
                        index -= 1;
                    }
                }
                else if (e2 && !e1) {
                    if (e2.nodeName === "#text") {
                        diffs.push(new Diff()
                            .setValue(this.options._const.action, this.options._const.addTextElement)
                            .setValue(this.options._const.route, route.concat(index))
                            .setValue(this.options._const.value, e2.data));
                    }
                    else {
                        diffs.push(new Diff()
                            .setValue(this.options._const.action, this.options._const.addElement)
                            .setValue(this.options._const.route, route.concat(index))
                            .setValue(this.options._const.element, cleanNode(e2)));
                    }
                }
            }
            /* We are now guaranteed that childNodes e1 and e2 exist,
             * and that they can be diffed.
             */
            /* Diffs in child nodes should not affect the parent node,
             * so we let these diffs be submitted together with other
             * diffs.
             */
            if (e1 && e2) {
                if (!this.options.maxChildCount ||
                    last < this.options.maxChildCount) {
                    diffs = diffs.concat(this.findNextDiff(e1, e2, route.concat(index)));
                }
                else if (!isEqual(e1, e2)) {
                    if (t1ChildNodes.length > t2ChildNodes.length) {
                        if (e1.nodeName === "#text") {
                            diffs.push(new Diff()
                                .setValue(this.options._const.action, this.options._const.removeTextElement)
                                .setValue(this.options._const.route, route.concat(index))
                                .setValue(this.options._const.value, e1.data));
                        }
                        else {
                            diffs.push(new Diff()
                                .setValue(this.options._const.action, this.options._const.removeElement)
                                .setValue(this.options._const.element, cleanNode(e1))
                                .setValue(this.options._const.route, route.concat(index)));
                        }
                        t1ChildNodes.splice(i, 1);
                        i -= 1;
                        index -= 1;
                        childNodesLengthDifference -= 1;
                    }
                    else if (t1ChildNodes.length < t2ChildNodes.length) {
                        diffs = diffs.concat([
                            new Diff()
                                .setValue(this.options._const.action, this.options._const.addElement)
                                .setValue(this.options._const.element, cleanNode(e2))
                                .setValue(this.options._const.route, route.concat(index)) ]);
                        t1ChildNodes.splice(i, 0, cleanNode(e2));
                        childNodesLengthDifference -= 1;
                    }
                    else {
                        diffs = diffs.concat([
                            new Diff()
                                .setValue(this.options._const.action, this.options._const.replaceElement)
                                .setValue(this.options._const.oldValue, cleanNode(e1))
                                .setValue(this.options._const.newValue, cleanNode(e2))
                                .setValue(this.options._const.route, route.concat(index)) ]);
                    }
                }
            }
            index += 1;
        }
        t1.innerDone = true;
        return diffs;
    };
    DiffFinder.prototype.attemptGroupRelocation = function (t1, t2, subtrees, route, cachedSubtrees) {
        /* Either t1.childNodes and t2.childNodes have the same length, or
         * there are at least two groups of similar elements can be found.
         * attempts are made at equalizing t1 with t2. First all initial
         * elements with no group affiliation (gaps=true) are removed (if
         * only in t1) or added (if only in t2). Then the creation of a group
         * relocation diff is attempted.
         */
        var gapInformation = getGapInformation(t1, t2, subtrees);
        var gaps1 = gapInformation.gaps1;
        var gaps2 = gapInformation.gaps2;
        var t1ChildNodes = t1.childNodes.slice();
        var t2ChildNodes = t2.childNodes.slice();
        var shortest = Math.min(gaps1.length, gaps2.length);
        var destinationDifferent;
        var toGroup;
        var group;
        var node;
        var similarNode;
        var diffs = [];
        for (var index2 = 0, index1 = 0; index2 < shortest; index1 += 1, index2 += 1) {
            if (cachedSubtrees &&
                (gaps1[index2] === true || gaps2[index2] === true)) ;
            else if (gaps1[index1] === true) {
                node = t1ChildNodes[index1];
                if (node.nodeName === "#text") {
                    if (t2ChildNodes[index2].nodeName === "#text") {
                        if (node.data !==
                            t2ChildNodes[index2].data) {
                            // Check whether a text node with the same value follows later on.
                            var testI = index1;
                            while (t1ChildNodes.length > testI + 1 &&
                                t1ChildNodes[testI + 1].nodeName === "#text") {
                                testI += 1;
                                if (t2ChildNodes[index2]
                                    .data ===
                                    t1ChildNodes[testI]
                                        .data) {
                                    similarNode = true;
                                    break;
                                }
                            }
                            if (!similarNode) {
                                diffs.push(new Diff()
                                    .setValue(this.options._const.action, this.options._const
                                    .modifyTextElement)
                                    .setValue(this.options._const.route, route.concat(index1))
                                    .setValue(this.options._const.oldValue, node.data)
                                    .setValue(this.options._const.newValue, t2ChildNodes[index2].data));
                            }
                        }
                    }
                    else {
                        diffs.push(new Diff()
                            .setValue(this.options._const.action, this.options._const.removeTextElement)
                            .setValue(this.options._const.route, route.concat(index1))
                            .setValue(this.options._const.value, node.data));
                        gaps1.splice(index1, 1);
                        t1ChildNodes.splice(index1, 1);
                        shortest = Math.min(gaps1.length, gaps2.length);
                        index1 -= 1;
                        index2 -= 1;
                    }
                }
                else if (gaps2[index2] === true) {
                    // both gaps1[index1] and gaps2[index2]  are true.
                    // We replace one element with another.
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.replaceElement)
                        .setValue(this.options._const.oldValue, cleanNode(node))
                        .setValue(this.options._const.newValue, cleanNode(t2ChildNodes[index2]))
                        .setValue(this.options._const.route, route.concat(index1)));
                    // t1ChildNodes at position index1 is not up-to-date, but that does not matter as
                    // index1 will increase +1
                }
                else {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.removeElement)
                        .setValue(this.options._const.route, route.concat(index1))
                        .setValue(this.options._const.element, cleanNode(node)));
                    gaps1.splice(index1, 1);
                    t1ChildNodes.splice(index1, 1);
                    shortest = Math.min(gaps1.length, gaps2.length);
                    index1 -= 1;
                    index2 -= 1;
                }
            }
            else if (gaps2[index2] === true) {
                node = t2ChildNodes[index2];
                if (node.nodeName === "#text") {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.addTextElement)
                        .setValue(this.options._const.route, route.concat(index1))
                        .setValue(this.options._const.value, node.data));
                    gaps1.splice(index1, 0, true);
                    t1ChildNodes.splice(index1, 0, {
                        nodeName: "#text",
                        data: node.data
                    });
                    shortest = Math.min(gaps1.length, gaps2.length);
                    //index1 += 1
                }
                else {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.addElement)
                        .setValue(this.options._const.route, route.concat(index1))
                        .setValue(this.options._const.element, cleanNode(node)));
                    gaps1.splice(index1, 0, true);
                    t1ChildNodes.splice(index1, 0, cleanNode(node));
                    shortest = Math.min(gaps1.length, gaps2.length);
                    //index1 += 1
                }
            }
            else if (gaps1[index1] !== gaps2[index2]) {
                if (diffs.length > 0) {
                    return diffs;
                }
                // group relocation
                group = subtrees[gaps1[index1]];
                toGroup = Math.min(group.newValue, t1ChildNodes.length - group.length);
                if (toGroup !== group.oldValue && toGroup > -1) {
                    // Check whether destination nodes are different than originating ones.
                    destinationDifferent = false;
                    for (var j = 0; j < group.length; j += 1) {
                        if (!roughlyEqual(t1ChildNodes[toGroup + j], t1ChildNodes[group.oldValue + j], {}, false, true)) {
                            destinationDifferent = true;
                        }
                    }
                    if (destinationDifferent) {
                        return [
                            new Diff()
                                .setValue(this.options._const.action, this.options._const.relocateGroup)
                                .setValue(this.options._const.groupLength, group.length)
                                .setValue(this.options._const.from, group.oldValue)
                                .setValue(this.options._const.to, toGroup)
                                .setValue(this.options._const.route, route) ];
                    }
                }
            }
        }
        return diffs;
    };
    DiffFinder.prototype.findValueDiff = function (t1, t2, route) {
        // Differences of value. Only useful if the value/selection/checked value
        // differs from what is represented in the DOM. For example in the case
        // of filled out forms, etc.
        var diffs = [];
        if (t1.selected !== t2.selected) {
            diffs.push(new Diff()
                .setValue(this.options._const.action, this.options._const.modifySelected)
                .setValue(this.options._const.oldValue, t1.selected)
                .setValue(this.options._const.newValue, t2.selected)
                .setValue(this.options._const.route, route));
        }
        if ((t1.value || t2.value) &&
            t1.value !== t2.value &&
            t1.nodeName !== "OPTION") {
            diffs.push(new Diff()
                .setValue(this.options._const.action, this.options._const.modifyValue)
                .setValue(this.options._const.oldValue, t1.value || "")
                .setValue(this.options._const.newValue, t2.value || "")
                .setValue(this.options._const.route, route));
        }
        if (t1.checked !== t2.checked) {
            diffs.push(new Diff()
                .setValue(this.options._const.action, this.options._const.modifyChecked)
                .setValue(this.options._const.oldValue, t1.checked)
                .setValue(this.options._const.newValue, t2.checked)
                .setValue(this.options._const.route, route));
        }
        return diffs;
    };
    return DiffFinder;
}());

var DEFAULT_OPTIONS = {
    debug: false,
    diffcap: 10,
    maxDepth: false,
    maxChildCount: 50,
    valueDiffing: true,
    // syntax: textDiff: function (node, currentValue, expectedValue, newValue)
    textDiff: function (node, currentValue, expectedValue, newValue) {
        node.data = newValue;
        return;
    },
    // empty functions were benchmarked as running faster than both
    // `f && f()` and `if (f) { f(); }`
    preVirtualDiffApply: function () { },
    postVirtualDiffApply: function () { },
    preDiffApply: function () { },
    postDiffApply: function () { },
    filterOuterDiff: null,
    compress: false,
    _const: false,
    document: typeof window !== "undefined" && window.document
        ? window.document
        : false,
    components: []
};
var DiffDOM = /** @class */ (function () {
    function DiffDOM(options) {
        if (options === void 0) { options = {}; }
        // IE11 doesn't have Object.assign and buble doesn't translate object spreaders
        // by default, so this is the safest way of doing it currently.
        Object.entries(DEFAULT_OPTIONS).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (!Object.prototype.hasOwnProperty.call(options, key)) {
                options[key] = value;
            }
        });
        if (!options._const) {
            var varNames = [
                "addAttribute",
                "modifyAttribute",
                "removeAttribute",
                "modifyTextElement",
                "relocateGroup",
                "removeElement",
                "addElement",
                "removeTextElement",
                "addTextElement",
                "replaceElement",
                "modifyValue",
                "modifyChecked",
                "modifySelected",
                "modifyComment",
                "action",
                "route",
                "oldValue",
                "newValue",
                "element",
                "group",
                "groupLength",
                "from",
                "to",
                "name",
                "value",
                "data",
                "attributes",
                "nodeName",
                "childNodes",
                "checked",
                "selected" ];
            var constNames_1 = {};
            if (options.compress) {
                varNames.forEach(function (varName, index) { return (constNames_1[varName] = index); });
            }
            else {
                varNames.forEach(function (varName) { return (constNames_1[varName] = varName); });
            }
            options._const = constNames_1;
        }
        this.options = options;
    }
    DiffDOM.prototype.apply = function (tree, diffs) {
        return applyDOM(tree, diffs, this.options);
    };
    DiffDOM.prototype.undo = function (tree, diffs) {
        return undoDOM(tree, diffs, this.options);
    };
    DiffDOM.prototype.diff = function (t1Node, t2Node) {
        var finder = new DiffFinder(t1Node, t2Node, this.options);
        return finder.init();
    };
    return DiffDOM;
}());

/**
 * Use TraceLogger to figure out function calls inside
 * JS objects by wrapping an object with a TraceLogger
 * instance.
 *
 * Pretty-prints the call trace (using unicode box code)
 * when tracelogger.toString() is called.
 */
/**
 * Wrap an object by calling new TraceLogger(obj)
 *
 * If you're familiar with Python decorators, this
 * does roughly the same thing, adding pre/post
 * call hook logging calls so that you can see
 * what's going on.
 */
var TraceLogger = /** @class */ (function () {
    function TraceLogger(obj) {
        if (obj === void 0) { obj = {}; }
        var _this = this;
        this.pad = "│   ";
        this.padding = "";
        this.tick = 1;
        this.messages = [];
        var wrapkey = function (obj, key) {
            // trace this function
            var oldfn = obj[key];
            obj[key] = function () {
                var arguments$1 = arguments;

                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments$1[_i];
                }
                _this.fin(key, Array.prototype.slice.call(args));
                var result = oldfn.apply(obj, args);
                _this.fout(key, result);
                return result;
            };
        };
        // can't use Object.keys for prototype walking
        for (var key in obj) {
            if (typeof obj[key] === "function") {
                wrapkey(obj, key);
            }
        }
        this.log("┌ TRACELOG START");
    }
    // called when entering a function
    TraceLogger.prototype.fin = function (fn, args) {
        this.padding += this.pad;
        this.log("\u251C\u2500> entering ".concat(fn), args);
    };
    // called when exiting a function
    TraceLogger.prototype.fout = function (fn, result) {
        this.log("│<──┘ generated return value", result);
        this.padding = this.padding.substring(0, this.padding.length - this.pad.length);
    };
    // log message formatting
    TraceLogger.prototype.format = function (s, tick) {
        var nf = function (t) {
            var tStr = "".concat(t);
            while (tStr.length < 4) {
                tStr = "0".concat(t);
            }
            return tStr;
        };
        return "".concat(nf(tick), "> ").concat(this.padding).concat(s);
    };
    // log a trace message
    TraceLogger.prototype.log = function () {
        var arguments$1 = arguments;

        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments$1[_i];
        }
        var stringCollapse = function (v) {
            if (!v) {
                return "<falsey>";
            }
            if (typeof v === "string") {
                return v;
            }
            if (checkElementType(v, "HTMLElement")) {
                return v.outerHTML || "<empty>";
            }
            if (v instanceof Array) {
                return "[".concat(v.map(stringCollapse).join(","), "]");
            }
            return v.toString() || v.valueOf() || "<unknown>";
        };
        var s = args.map(stringCollapse).join(", ");
        this.messages.push(this.format(s, this.tick++));
    };
    // turn the log into a structured string with
    // unicode box codes to make it a sensible trace.
    TraceLogger.prototype.toString = function () {
        var cap = "×   ";
        var terminator = "└───";
        while (terminator.length <= this.padding.length + this.pad.length) {
            terminator += cap;
        }
        var _ = this.padding;
        this.padding = "";
        terminator = this.format(terminator, this.tick);
        this.padding = _;
        return "".concat(this.messages.join("\n"), "\n").concat(terminator);
    };
    return TraceLogger;
}());


//# sourceMappingURL=module.js.map


}),
"./node_modules/.pnpm/he@1.2.0/node_modules/he/he.js": (function (module, exports, __webpack_require__) {
/* module decorator */ module = __webpack_require__.nmd(module);
/*! https://mths.be/he v1.2.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports =  true && exports;

	// Detect free variable `module`.
	var freeModule =  true && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xAD':'shy','\u200C':'zwnj','\u200D':'zwj','\u200E':'lrm','\u2063':'ic','\u2062':'it','\u2061':'af','\u200F':'rlm','\u200B':'ZeroWidthSpace','\u2060':'NoBreak','\u0311':'DownBreve','\u20DB':'tdot','\u20DC':'DotDot','\t':'Tab','\n':'NewLine','\u2008':'puncsp','\u205F':'MediumSpace','\u2009':'thinsp','\u200A':'hairsp','\u2004':'emsp13','\u2002':'ensp','\u2005':'emsp14','\u2003':'emsp','\u2007':'numsp','\xA0':'nbsp','\u205F\u200A':'ThickSpace','\u203E':'oline','_':'lowbar','\u2010':'dash','\u2013':'ndash','\u2014':'mdash','\u2015':'horbar',',':'comma',';':'semi','\u204F':'bsemi',':':'colon','\u2A74':'Colone','!':'excl','\xA1':'iexcl','?':'quest','\xBF':'iquest','.':'period','\u2025':'nldr','\u2026':'mldr','\xB7':'middot','\'':'apos','\u2018':'lsquo','\u2019':'rsquo','\u201A':'sbquo','\u2039':'lsaquo','\u203A':'rsaquo','"':'quot','\u201C':'ldquo','\u201D':'rdquo','\u201E':'bdquo','\xAB':'laquo','\xBB':'raquo','(':'lpar',')':'rpar','[':'lsqb',']':'rsqb','{':'lcub','}':'rcub','\u2308':'lceil','\u2309':'rceil','\u230A':'lfloor','\u230B':'rfloor','\u2985':'lopar','\u2986':'ropar','\u298B':'lbrke','\u298C':'rbrke','\u298D':'lbrkslu','\u298E':'rbrksld','\u298F':'lbrksld','\u2990':'rbrkslu','\u2991':'langd','\u2992':'rangd','\u2993':'lparlt','\u2994':'rpargt','\u2995':'gtlPar','\u2996':'ltrPar','\u27E6':'lobrk','\u27E7':'robrk','\u27E8':'lang','\u27E9':'rang','\u27EA':'Lang','\u27EB':'Rang','\u27EC':'loang','\u27ED':'roang','\u2772':'lbbrk','\u2773':'rbbrk','\u2016':'Vert','\xA7':'sect','\xB6':'para','@':'commat','*':'ast','/':'sol','undefined':null,'&':'amp','#':'num','%':'percnt','\u2030':'permil','\u2031':'pertenk','\u2020':'dagger','\u2021':'Dagger','\u2022':'bull','\u2043':'hybull','\u2032':'prime','\u2033':'Prime','\u2034':'tprime','\u2057':'qprime','\u2035':'bprime','\u2041':'caret','`':'grave','\xB4':'acute','\u02DC':'tilde','^':'Hat','\xAF':'macr','\u02D8':'breve','\u02D9':'dot','\xA8':'die','\u02DA':'ring','\u02DD':'dblac','\xB8':'cedil','\u02DB':'ogon','\u02C6':'circ','\u02C7':'caron','\xB0':'deg','\xA9':'copy','\xAE':'reg','\u2117':'copysr','\u2118':'wp','\u211E':'rx','\u2127':'mho','\u2129':'iiota','\u2190':'larr','\u219A':'nlarr','\u2192':'rarr','\u219B':'nrarr','\u2191':'uarr','\u2193':'darr','\u2194':'harr','\u21AE':'nharr','\u2195':'varr','\u2196':'nwarr','\u2197':'nearr','\u2198':'searr','\u2199':'swarr','\u219D':'rarrw','\u219D\u0338':'nrarrw','\u219E':'Larr','\u219F':'Uarr','\u21A0':'Rarr','\u21A1':'Darr','\u21A2':'larrtl','\u21A3':'rarrtl','\u21A4':'mapstoleft','\u21A5':'mapstoup','\u21A6':'map','\u21A7':'mapstodown','\u21A9':'larrhk','\u21AA':'rarrhk','\u21AB':'larrlp','\u21AC':'rarrlp','\u21AD':'harrw','\u21B0':'lsh','\u21B1':'rsh','\u21B2':'ldsh','\u21B3':'rdsh','\u21B5':'crarr','\u21B6':'cularr','\u21B7':'curarr','\u21BA':'olarr','\u21BB':'orarr','\u21BC':'lharu','\u21BD':'lhard','\u21BE':'uharr','\u21BF':'uharl','\u21C0':'rharu','\u21C1':'rhard','\u21C2':'dharr','\u21C3':'dharl','\u21C4':'rlarr','\u21C5':'udarr','\u21C6':'lrarr','\u21C7':'llarr','\u21C8':'uuarr','\u21C9':'rrarr','\u21CA':'ddarr','\u21CB':'lrhar','\u21CC':'rlhar','\u21D0':'lArr','\u21CD':'nlArr','\u21D1':'uArr','\u21D2':'rArr','\u21CF':'nrArr','\u21D3':'dArr','\u21D4':'iff','\u21CE':'nhArr','\u21D5':'vArr','\u21D6':'nwArr','\u21D7':'neArr','\u21D8':'seArr','\u21D9':'swArr','\u21DA':'lAarr','\u21DB':'rAarr','\u21DD':'zigrarr','\u21E4':'larrb','\u21E5':'rarrb','\u21F5':'duarr','\u21FD':'loarr','\u21FE':'roarr','\u21FF':'hoarr','\u2200':'forall','\u2201':'comp','\u2202':'part','\u2202\u0338':'npart','\u2203':'exist','\u2204':'nexist','\u2205':'empty','\u2207':'Del','\u2208':'in','\u2209':'notin','\u220B':'ni','\u220C':'notni','\u03F6':'bepsi','\u220F':'prod','\u2210':'coprod','\u2211':'sum','+':'plus','\xB1':'pm','\xF7':'div','\xD7':'times','<':'lt','\u226E':'nlt','<\u20D2':'nvlt','=':'equals','\u2260':'ne','=\u20E5':'bne','\u2A75':'Equal','>':'gt','\u226F':'ngt','>\u20D2':'nvgt','\xAC':'not','|':'vert','\xA6':'brvbar','\u2212':'minus','\u2213':'mp','\u2214':'plusdo','\u2044':'frasl','\u2216':'setmn','\u2217':'lowast','\u2218':'compfn','\u221A':'Sqrt','\u221D':'prop','\u221E':'infin','\u221F':'angrt','\u2220':'ang','\u2220\u20D2':'nang','\u2221':'angmsd','\u2222':'angsph','\u2223':'mid','\u2224':'nmid','\u2225':'par','\u2226':'npar','\u2227':'and','\u2228':'or','\u2229':'cap','\u2229\uFE00':'caps','\u222A':'cup','\u222A\uFE00':'cups','\u222B':'int','\u222C':'Int','\u222D':'tint','\u2A0C':'qint','\u222E':'oint','\u222F':'Conint','\u2230':'Cconint','\u2231':'cwint','\u2232':'cwconint','\u2233':'awconint','\u2234':'there4','\u2235':'becaus','\u2236':'ratio','\u2237':'Colon','\u2238':'minusd','\u223A':'mDDot','\u223B':'homtht','\u223C':'sim','\u2241':'nsim','\u223C\u20D2':'nvsim','\u223D':'bsim','\u223D\u0331':'race','\u223E':'ac','\u223E\u0333':'acE','\u223F':'acd','\u2240':'wr','\u2242':'esim','\u2242\u0338':'nesim','\u2243':'sime','\u2244':'nsime','\u2245':'cong','\u2247':'ncong','\u2246':'simne','\u2248':'ap','\u2249':'nap','\u224A':'ape','\u224B':'apid','\u224B\u0338':'napid','\u224C':'bcong','\u224D':'CupCap','\u226D':'NotCupCap','\u224D\u20D2':'nvap','\u224E':'bump','\u224E\u0338':'nbump','\u224F':'bumpe','\u224F\u0338':'nbumpe','\u2250':'doteq','\u2250\u0338':'nedot','\u2251':'eDot','\u2252':'efDot','\u2253':'erDot','\u2254':'colone','\u2255':'ecolon','\u2256':'ecir','\u2257':'cire','\u2259':'wedgeq','\u225A':'veeeq','\u225C':'trie','\u225F':'equest','\u2261':'equiv','\u2262':'nequiv','\u2261\u20E5':'bnequiv','\u2264':'le','\u2270':'nle','\u2264\u20D2':'nvle','\u2265':'ge','\u2271':'nge','\u2265\u20D2':'nvge','\u2266':'lE','\u2266\u0338':'nlE','\u2267':'gE','\u2267\u0338':'ngE','\u2268\uFE00':'lvnE','\u2268':'lnE','\u2269':'gnE','\u2269\uFE00':'gvnE','\u226A':'ll','\u226A\u0338':'nLtv','\u226A\u20D2':'nLt','\u226B':'gg','\u226B\u0338':'nGtv','\u226B\u20D2':'nGt','\u226C':'twixt','\u2272':'lsim','\u2274':'nlsim','\u2273':'gsim','\u2275':'ngsim','\u2276':'lg','\u2278':'ntlg','\u2277':'gl','\u2279':'ntgl','\u227A':'pr','\u2280':'npr','\u227B':'sc','\u2281':'nsc','\u227C':'prcue','\u22E0':'nprcue','\u227D':'sccue','\u22E1':'nsccue','\u227E':'prsim','\u227F':'scsim','\u227F\u0338':'NotSucceedsTilde','\u2282':'sub','\u2284':'nsub','\u2282\u20D2':'vnsub','\u2283':'sup','\u2285':'nsup','\u2283\u20D2':'vnsup','\u2286':'sube','\u2288':'nsube','\u2287':'supe','\u2289':'nsupe','\u228A\uFE00':'vsubne','\u228A':'subne','\u228B\uFE00':'vsupne','\u228B':'supne','\u228D':'cupdot','\u228E':'uplus','\u228F':'sqsub','\u228F\u0338':'NotSquareSubset','\u2290':'sqsup','\u2290\u0338':'NotSquareSuperset','\u2291':'sqsube','\u22E2':'nsqsube','\u2292':'sqsupe','\u22E3':'nsqsupe','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u2295':'oplus','\u2296':'ominus','\u2297':'otimes','\u2298':'osol','\u2299':'odot','\u229A':'ocir','\u229B':'oast','\u229D':'odash','\u229E':'plusb','\u229F':'minusb','\u22A0':'timesb','\u22A1':'sdotb','\u22A2':'vdash','\u22AC':'nvdash','\u22A3':'dashv','\u22A4':'top','\u22A5':'bot','\u22A7':'models','\u22A8':'vDash','\u22AD':'nvDash','\u22A9':'Vdash','\u22AE':'nVdash','\u22AA':'Vvdash','\u22AB':'VDash','\u22AF':'nVDash','\u22B0':'prurel','\u22B2':'vltri','\u22EA':'nltri','\u22B3':'vrtri','\u22EB':'nrtri','\u22B4':'ltrie','\u22EC':'nltrie','\u22B4\u20D2':'nvltrie','\u22B5':'rtrie','\u22ED':'nrtrie','\u22B5\u20D2':'nvrtrie','\u22B6':'origof','\u22B7':'imof','\u22B8':'mumap','\u22B9':'hercon','\u22BA':'intcal','\u22BB':'veebar','\u22BD':'barvee','\u22BE':'angrtvb','\u22BF':'lrtri','\u22C0':'Wedge','\u22C1':'Vee','\u22C2':'xcap','\u22C3':'xcup','\u22C4':'diam','\u22C5':'sdot','\u22C6':'Star','\u22C7':'divonx','\u22C8':'bowtie','\u22C9':'ltimes','\u22CA':'rtimes','\u22CB':'lthree','\u22CC':'rthree','\u22CD':'bsime','\u22CE':'cuvee','\u22CF':'cuwed','\u22D0':'Sub','\u22D1':'Sup','\u22D2':'Cap','\u22D3':'Cup','\u22D4':'fork','\u22D5':'epar','\u22D6':'ltdot','\u22D7':'gtdot','\u22D8':'Ll','\u22D8\u0338':'nLl','\u22D9':'Gg','\u22D9\u0338':'nGg','\u22DA\uFE00':'lesg','\u22DA':'leg','\u22DB':'gel','\u22DB\uFE00':'gesl','\u22DE':'cuepr','\u22DF':'cuesc','\u22E6':'lnsim','\u22E7':'gnsim','\u22E8':'prnsim','\u22E9':'scnsim','\u22EE':'vellip','\u22EF':'ctdot','\u22F0':'utdot','\u22F1':'dtdot','\u22F2':'disin','\u22F3':'isinsv','\u22F4':'isins','\u22F5':'isindot','\u22F5\u0338':'notindot','\u22F6':'notinvc','\u22F7':'notinvb','\u22F9':'isinE','\u22F9\u0338':'notinE','\u22FA':'nisd','\u22FB':'xnis','\u22FC':'nis','\u22FD':'notnivc','\u22FE':'notnivb','\u2305':'barwed','\u2306':'Barwed','\u230C':'drcrop','\u230D':'dlcrop','\u230E':'urcrop','\u230F':'ulcrop','\u2310':'bnot','\u2312':'profline','\u2313':'profsurf','\u2315':'telrec','\u2316':'target','\u231C':'ulcorn','\u231D':'urcorn','\u231E':'dlcorn','\u231F':'drcorn','\u2322':'frown','\u2323':'smile','\u232D':'cylcty','\u232E':'profalar','\u2336':'topbot','\u233D':'ovbar','\u233F':'solbar','\u237C':'angzarr','\u23B0':'lmoust','\u23B1':'rmoust','\u23B4':'tbrk','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u23DC':'OverParenthesis','\u23DD':'UnderParenthesis','\u23DE':'OverBrace','\u23DF':'UnderBrace','\u23E2':'trpezium','\u23E7':'elinters','\u2423':'blank','\u2500':'boxh','\u2502':'boxv','\u250C':'boxdr','\u2510':'boxdl','\u2514':'boxur','\u2518':'boxul','\u251C':'boxvr','\u2524':'boxvl','\u252C':'boxhd','\u2534':'boxhu','\u253C':'boxvh','\u2550':'boxH','\u2551':'boxV','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2580':'uhblk','\u2584':'lhblk','\u2588':'block','\u2591':'blk14','\u2592':'blk12','\u2593':'blk34','\u25A1':'squ','\u25AA':'squf','\u25AB':'EmptyVerySmallSquare','\u25AD':'rect','\u25AE':'marker','\u25B1':'fltns','\u25B3':'xutri','\u25B4':'utrif','\u25B5':'utri','\u25B8':'rtrif','\u25B9':'rtri','\u25BD':'xdtri','\u25BE':'dtrif','\u25BF':'dtri','\u25C2':'ltrif','\u25C3':'ltri','\u25CA':'loz','\u25CB':'cir','\u25EC':'tridot','\u25EF':'xcirc','\u25F8':'ultri','\u25F9':'urtri','\u25FA':'lltri','\u25FB':'EmptySmallSquare','\u25FC':'FilledSmallSquare','\u2605':'starf','\u2606':'star','\u260E':'phone','\u2640':'female','\u2642':'male','\u2660':'spades','\u2663':'clubs','\u2665':'hearts','\u2666':'diams','\u266A':'sung','\u2713':'check','\u2717':'cross','\u2720':'malt','\u2736':'sext','\u2758':'VerticalSeparator','\u27C8':'bsolhsub','\u27C9':'suphsol','\u27F5':'xlarr','\u27F6':'xrarr','\u27F7':'xharr','\u27F8':'xlArr','\u27F9':'xrArr','\u27FA':'xhArr','\u27FC':'xmap','\u27FF':'dzigrarr','\u2902':'nvlArr','\u2903':'nvrArr','\u2904':'nvHarr','\u2905':'Map','\u290C':'lbarr','\u290D':'rbarr','\u290E':'lBarr','\u290F':'rBarr','\u2910':'RBarr','\u2911':'DDotrahd','\u2912':'UpArrowBar','\u2913':'DownArrowBar','\u2916':'Rarrtl','\u2919':'latail','\u291A':'ratail','\u291B':'lAtail','\u291C':'rAtail','\u291D':'larrfs','\u291E':'rarrfs','\u291F':'larrbfs','\u2920':'rarrbfs','\u2923':'nwarhk','\u2924':'nearhk','\u2925':'searhk','\u2926':'swarhk','\u2927':'nwnear','\u2928':'toea','\u2929':'tosa','\u292A':'swnwar','\u2933':'rarrc','\u2933\u0338':'nrarrc','\u2935':'cudarrr','\u2936':'ldca','\u2937':'rdca','\u2938':'cudarrl','\u2939':'larrpl','\u293C':'curarrm','\u293D':'cularrp','\u2945':'rarrpl','\u2948':'harrcir','\u2949':'Uarrocir','\u294A':'lurdshar','\u294B':'ldrushar','\u294E':'LeftRightVector','\u294F':'RightUpDownVector','\u2950':'DownLeftRightVector','\u2951':'LeftUpDownVector','\u2952':'LeftVectorBar','\u2953':'RightVectorBar','\u2954':'RightUpVectorBar','\u2955':'RightDownVectorBar','\u2956':'DownLeftVectorBar','\u2957':'DownRightVectorBar','\u2958':'LeftUpVectorBar','\u2959':'LeftDownVectorBar','\u295A':'LeftTeeVector','\u295B':'RightTeeVector','\u295C':'RightUpTeeVector','\u295D':'RightDownTeeVector','\u295E':'DownLeftTeeVector','\u295F':'DownRightTeeVector','\u2960':'LeftUpTeeVector','\u2961':'LeftDownTeeVector','\u2962':'lHar','\u2963':'uHar','\u2964':'rHar','\u2965':'dHar','\u2966':'luruhar','\u2967':'ldrdhar','\u2968':'ruluhar','\u2969':'rdldhar','\u296A':'lharul','\u296B':'llhard','\u296C':'rharul','\u296D':'lrhard','\u296E':'udhar','\u296F':'duhar','\u2970':'RoundImplies','\u2971':'erarr','\u2972':'simrarr','\u2973':'larrsim','\u2974':'rarrsim','\u2975':'rarrap','\u2976':'ltlarr','\u2978':'gtrarr','\u2979':'subrarr','\u297B':'suplarr','\u297C':'lfisht','\u297D':'rfisht','\u297E':'ufisht','\u297F':'dfisht','\u299A':'vzigzag','\u299C':'vangrt','\u299D':'angrtvbd','\u29A4':'ange','\u29A5':'range','\u29A6':'dwangle','\u29A7':'uwangle','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u29B0':'bemptyv','\u29B1':'demptyv','\u29B2':'cemptyv','\u29B3':'raemptyv','\u29B4':'laemptyv','\u29B5':'ohbar','\u29B6':'omid','\u29B7':'opar','\u29B9':'operp','\u29BB':'olcross','\u29BC':'odsold','\u29BE':'olcir','\u29BF':'ofcir','\u29C0':'olt','\u29C1':'ogt','\u29C2':'cirscir','\u29C3':'cirE','\u29C4':'solb','\u29C5':'bsolb','\u29C9':'boxbox','\u29CD':'trisb','\u29CE':'rtriltri','\u29CF':'LeftTriangleBar','\u29CF\u0338':'NotLeftTriangleBar','\u29D0':'RightTriangleBar','\u29D0\u0338':'NotRightTriangleBar','\u29DC':'iinfin','\u29DD':'infintie','\u29DE':'nvinfin','\u29E3':'eparsl','\u29E4':'smeparsl','\u29E5':'eqvparsl','\u29EB':'lozf','\u29F4':'RuleDelayed','\u29F6':'dsol','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A04':'xuplus','\u2A06':'xsqcup','\u2A0D':'fpartint','\u2A10':'cirfnint','\u2A11':'awint','\u2A12':'rppolint','\u2A13':'scpolint','\u2A14':'npolint','\u2A15':'pointint','\u2A16':'quatint','\u2A17':'intlarhk','\u2A22':'pluscir','\u2A23':'plusacir','\u2A24':'simplus','\u2A25':'plusdu','\u2A26':'plussim','\u2A27':'plustwo','\u2A29':'mcomma','\u2A2A':'minusdu','\u2A2D':'loplus','\u2A2E':'roplus','\u2A2F':'Cross','\u2A30':'timesd','\u2A31':'timesbar','\u2A33':'smashp','\u2A34':'lotimes','\u2A35':'rotimes','\u2A36':'otimesas','\u2A37':'Otimes','\u2A38':'odiv','\u2A39':'triplus','\u2A3A':'triminus','\u2A3B':'tritime','\u2A3C':'iprod','\u2A3F':'amalg','\u2A40':'capdot','\u2A42':'ncup','\u2A43':'ncap','\u2A44':'capand','\u2A45':'cupor','\u2A46':'cupcap','\u2A47':'capcup','\u2A48':'cupbrcap','\u2A49':'capbrcup','\u2A4A':'cupcup','\u2A4B':'capcap','\u2A4C':'ccups','\u2A4D':'ccaps','\u2A50':'ccupssm','\u2A53':'And','\u2A54':'Or','\u2A55':'andand','\u2A56':'oror','\u2A57':'orslope','\u2A58':'andslope','\u2A5A':'andv','\u2A5B':'orv','\u2A5C':'andd','\u2A5D':'ord','\u2A5F':'wedbar','\u2A66':'sdote','\u2A6A':'simdot','\u2A6D':'congdot','\u2A6D\u0338':'ncongdot','\u2A6E':'easter','\u2A6F':'apacir','\u2A70':'apE','\u2A70\u0338':'napE','\u2A71':'eplus','\u2A72':'pluse','\u2A73':'Esim','\u2A77':'eDDot','\u2A78':'equivDD','\u2A79':'ltcir','\u2A7A':'gtcir','\u2A7B':'ltquest','\u2A7C':'gtquest','\u2A7D':'les','\u2A7D\u0338':'nles','\u2A7E':'ges','\u2A7E\u0338':'nges','\u2A7F':'lesdot','\u2A80':'gesdot','\u2A81':'lesdoto','\u2A82':'gesdoto','\u2A83':'lesdotor','\u2A84':'gesdotol','\u2A85':'lap','\u2A86':'gap','\u2A87':'lne','\u2A88':'gne','\u2A89':'lnap','\u2A8A':'gnap','\u2A8B':'lEg','\u2A8C':'gEl','\u2A8D':'lsime','\u2A8E':'gsime','\u2A8F':'lsimg','\u2A90':'gsiml','\u2A91':'lgE','\u2A92':'glE','\u2A93':'lesges','\u2A94':'gesles','\u2A95':'els','\u2A96':'egs','\u2A97':'elsdot','\u2A98':'egsdot','\u2A99':'el','\u2A9A':'eg','\u2A9D':'siml','\u2A9E':'simg','\u2A9F':'simlE','\u2AA0':'simgE','\u2AA1':'LessLess','\u2AA1\u0338':'NotNestedLessLess','\u2AA2':'GreaterGreater','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA4':'glj','\u2AA5':'gla','\u2AA6':'ltcc','\u2AA7':'gtcc','\u2AA8':'lescc','\u2AA9':'gescc','\u2AAA':'smt','\u2AAB':'lat','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u2AAD':'late','\u2AAD\uFE00':'lates','\u2AAE':'bumpE','\u2AAF':'pre','\u2AAF\u0338':'npre','\u2AB0':'sce','\u2AB0\u0338':'nsce','\u2AB3':'prE','\u2AB4':'scE','\u2AB5':'prnE','\u2AB6':'scnE','\u2AB7':'prap','\u2AB8':'scap','\u2AB9':'prnap','\u2ABA':'scnap','\u2ABB':'Pr','\u2ABC':'Sc','\u2ABD':'subdot','\u2ABE':'supdot','\u2ABF':'subplus','\u2AC0':'supplus','\u2AC1':'submult','\u2AC2':'supmult','\u2AC3':'subedot','\u2AC4':'supedot','\u2AC5':'subE','\u2AC5\u0338':'nsubE','\u2AC6':'supE','\u2AC6\u0338':'nsupE','\u2AC7':'subsim','\u2AC8':'supsim','\u2ACB\uFE00':'vsubnE','\u2ACB':'subnE','\u2ACC\uFE00':'vsupnE','\u2ACC':'supnE','\u2ACF':'csub','\u2AD0':'csup','\u2AD1':'csube','\u2AD2':'csupe','\u2AD3':'subsup','\u2AD4':'supsub','\u2AD5':'subsub','\u2AD6':'supsup','\u2AD7':'suphsub','\u2AD8':'supdsub','\u2AD9':'forkv','\u2ADA':'topfork','\u2ADB':'mlcp','\u2AE4':'Dashv','\u2AE6':'Vdashl','\u2AE7':'Barv','\u2AE8':'vBar','\u2AE9':'vBarv','\u2AEB':'Vbar','\u2AEC':'Not','\u2AED':'bNot','\u2AEE':'rnmid','\u2AEF':'cirmid','\u2AF0':'midcir','\u2AF1':'topcir','\u2AF2':'nhpar','\u2AF3':'parsim','\u2AFD':'parsl','\u2AFD\u20E5':'nparsl','\u266D':'flat','\u266E':'natur','\u266F':'sharp','\xA4':'curren','\xA2':'cent','$':'dollar','\xA3':'pound','\xA5':'yen','\u20AC':'euro','\xB9':'sup1','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\xB2':'sup2','\u2154':'frac23','\u2156':'frac25','\xB3':'sup3','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\uD835\uDCB6':'ascr','\uD835\uDD52':'aopf','\uD835\uDD1E':'afr','\uD835\uDD38':'Aopf','\uD835\uDD04':'Afr','\uD835\uDC9C':'Ascr','\xAA':'ordf','\xE1':'aacute','\xC1':'Aacute','\xE0':'agrave','\xC0':'Agrave','\u0103':'abreve','\u0102':'Abreve','\xE2':'acirc','\xC2':'Acirc','\xE5':'aring','\xC5':'angst','\xE4':'auml','\xC4':'Auml','\xE3':'atilde','\xC3':'Atilde','\u0105':'aogon','\u0104':'Aogon','\u0101':'amacr','\u0100':'Amacr','\xE6':'aelig','\xC6':'AElig','\uD835\uDCB7':'bscr','\uD835\uDD53':'bopf','\uD835\uDD1F':'bfr','\uD835\uDD39':'Bopf','\u212C':'Bscr','\uD835\uDD05':'Bfr','\uD835\uDD20':'cfr','\uD835\uDCB8':'cscr','\uD835\uDD54':'copf','\u212D':'Cfr','\uD835\uDC9E':'Cscr','\u2102':'Copf','\u0107':'cacute','\u0106':'Cacute','\u0109':'ccirc','\u0108':'Ccirc','\u010D':'ccaron','\u010C':'Ccaron','\u010B':'cdot','\u010A':'Cdot','\xE7':'ccedil','\xC7':'Ccedil','\u2105':'incare','\uD835\uDD21':'dfr','\u2146':'dd','\uD835\uDD55':'dopf','\uD835\uDCB9':'dscr','\uD835\uDC9F':'Dscr','\uD835\uDD07':'Dfr','\u2145':'DD','\uD835\uDD3B':'Dopf','\u010F':'dcaron','\u010E':'Dcaron','\u0111':'dstrok','\u0110':'Dstrok','\xF0':'eth','\xD0':'ETH','\u2147':'ee','\u212F':'escr','\uD835\uDD22':'efr','\uD835\uDD56':'eopf','\u2130':'Escr','\uD835\uDD08':'Efr','\uD835\uDD3C':'Eopf','\xE9':'eacute','\xC9':'Eacute','\xE8':'egrave','\xC8':'Egrave','\xEA':'ecirc','\xCA':'Ecirc','\u011B':'ecaron','\u011A':'Ecaron','\xEB':'euml','\xCB':'Euml','\u0117':'edot','\u0116':'Edot','\u0119':'eogon','\u0118':'Eogon','\u0113':'emacr','\u0112':'Emacr','\uD835\uDD23':'ffr','\uD835\uDD57':'fopf','\uD835\uDCBB':'fscr','\uD835\uDD09':'Ffr','\uD835\uDD3D':'Fopf','\u2131':'Fscr','\uFB00':'fflig','\uFB03':'ffilig','\uFB04':'ffllig','\uFB01':'filig','fj':'fjlig','\uFB02':'fllig','\u0192':'fnof','\u210A':'gscr','\uD835\uDD58':'gopf','\uD835\uDD24':'gfr','\uD835\uDCA2':'Gscr','\uD835\uDD3E':'Gopf','\uD835\uDD0A':'Gfr','\u01F5':'gacute','\u011F':'gbreve','\u011E':'Gbreve','\u011D':'gcirc','\u011C':'Gcirc','\u0121':'gdot','\u0120':'Gdot','\u0122':'Gcedil','\uD835\uDD25':'hfr','\u210E':'planckh','\uD835\uDCBD':'hscr','\uD835\uDD59':'hopf','\u210B':'Hscr','\u210C':'Hfr','\u210D':'Hopf','\u0125':'hcirc','\u0124':'Hcirc','\u210F':'hbar','\u0127':'hstrok','\u0126':'Hstrok','\uD835\uDD5A':'iopf','\uD835\uDD26':'ifr','\uD835\uDCBE':'iscr','\u2148':'ii','\uD835\uDD40':'Iopf','\u2110':'Iscr','\u2111':'Im','\xED':'iacute','\xCD':'Iacute','\xEC':'igrave','\xCC':'Igrave','\xEE':'icirc','\xCE':'Icirc','\xEF':'iuml','\xCF':'Iuml','\u0129':'itilde','\u0128':'Itilde','\u0130':'Idot','\u012F':'iogon','\u012E':'Iogon','\u012B':'imacr','\u012A':'Imacr','\u0133':'ijlig','\u0132':'IJlig','\u0131':'imath','\uD835\uDCBF':'jscr','\uD835\uDD5B':'jopf','\uD835\uDD27':'jfr','\uD835\uDCA5':'Jscr','\uD835\uDD0D':'Jfr','\uD835\uDD41':'Jopf','\u0135':'jcirc','\u0134':'Jcirc','\u0237':'jmath','\uD835\uDD5C':'kopf','\uD835\uDCC0':'kscr','\uD835\uDD28':'kfr','\uD835\uDCA6':'Kscr','\uD835\uDD42':'Kopf','\uD835\uDD0E':'Kfr','\u0137':'kcedil','\u0136':'Kcedil','\uD835\uDD29':'lfr','\uD835\uDCC1':'lscr','\u2113':'ell','\uD835\uDD5D':'lopf','\u2112':'Lscr','\uD835\uDD0F':'Lfr','\uD835\uDD43':'Lopf','\u013A':'lacute','\u0139':'Lacute','\u013E':'lcaron','\u013D':'Lcaron','\u013C':'lcedil','\u013B':'Lcedil','\u0142':'lstrok','\u0141':'Lstrok','\u0140':'lmidot','\u013F':'Lmidot','\uD835\uDD2A':'mfr','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\uD835\uDD10':'Mfr','\uD835\uDD44':'Mopf','\u2133':'Mscr','\uD835\uDD2B':'nfr','\uD835\uDD5F':'nopf','\uD835\uDCC3':'nscr','\u2115':'Nopf','\uD835\uDCA9':'Nscr','\uD835\uDD11':'Nfr','\u0144':'nacute','\u0143':'Nacute','\u0148':'ncaron','\u0147':'Ncaron','\xF1':'ntilde','\xD1':'Ntilde','\u0146':'ncedil','\u0145':'Ncedil','\u2116':'numero','\u014B':'eng','\u014A':'ENG','\uD835\uDD60':'oopf','\uD835\uDD2C':'ofr','\u2134':'oscr','\uD835\uDCAA':'Oscr','\uD835\uDD12':'Ofr','\uD835\uDD46':'Oopf','\xBA':'ordm','\xF3':'oacute','\xD3':'Oacute','\xF2':'ograve','\xD2':'Ograve','\xF4':'ocirc','\xD4':'Ocirc','\xF6':'ouml','\xD6':'Ouml','\u0151':'odblac','\u0150':'Odblac','\xF5':'otilde','\xD5':'Otilde','\xF8':'oslash','\xD8':'Oslash','\u014D':'omacr','\u014C':'Omacr','\u0153':'oelig','\u0152':'OElig','\uD835\uDD2D':'pfr','\uD835\uDCC5':'pscr','\uD835\uDD61':'popf','\u2119':'Popf','\uD835\uDD13':'Pfr','\uD835\uDCAB':'Pscr','\uD835\uDD62':'qopf','\uD835\uDD2E':'qfr','\uD835\uDCC6':'qscr','\uD835\uDCAC':'Qscr','\uD835\uDD14':'Qfr','\u211A':'Qopf','\u0138':'kgreen','\uD835\uDD2F':'rfr','\uD835\uDD63':'ropf','\uD835\uDCC7':'rscr','\u211B':'Rscr','\u211C':'Re','\u211D':'Ropf','\u0155':'racute','\u0154':'Racute','\u0159':'rcaron','\u0158':'Rcaron','\u0157':'rcedil','\u0156':'Rcedil','\uD835\uDD64':'sopf','\uD835\uDCC8':'sscr','\uD835\uDD30':'sfr','\uD835\uDD4A':'Sopf','\uD835\uDD16':'Sfr','\uD835\uDCAE':'Sscr','\u24C8':'oS','\u015B':'sacute','\u015A':'Sacute','\u015D':'scirc','\u015C':'Scirc','\u0161':'scaron','\u0160':'Scaron','\u015F':'scedil','\u015E':'Scedil','\xDF':'szlig','\uD835\uDD31':'tfr','\uD835\uDCC9':'tscr','\uD835\uDD65':'topf','\uD835\uDCAF':'Tscr','\uD835\uDD17':'Tfr','\uD835\uDD4B':'Topf','\u0165':'tcaron','\u0164':'Tcaron','\u0163':'tcedil','\u0162':'Tcedil','\u2122':'trade','\u0167':'tstrok','\u0166':'Tstrok','\uD835\uDCCA':'uscr','\uD835\uDD66':'uopf','\uD835\uDD32':'ufr','\uD835\uDD4C':'Uopf','\uD835\uDD18':'Ufr','\uD835\uDCB0':'Uscr','\xFA':'uacute','\xDA':'Uacute','\xF9':'ugrave','\xD9':'Ugrave','\u016D':'ubreve','\u016C':'Ubreve','\xFB':'ucirc','\xDB':'Ucirc','\u016F':'uring','\u016E':'Uring','\xFC':'uuml','\xDC':'Uuml','\u0171':'udblac','\u0170':'Udblac','\u0169':'utilde','\u0168':'Utilde','\u0173':'uogon','\u0172':'Uogon','\u016B':'umacr','\u016A':'Umacr','\uD835\uDD33':'vfr','\uD835\uDD67':'vopf','\uD835\uDCCB':'vscr','\uD835\uDD19':'Vfr','\uD835\uDD4D':'Vopf','\uD835\uDCB1':'Vscr','\uD835\uDD68':'wopf','\uD835\uDCCC':'wscr','\uD835\uDD34':'wfr','\uD835\uDCB2':'Wscr','\uD835\uDD4E':'Wopf','\uD835\uDD1A':'Wfr','\u0175':'wcirc','\u0174':'Wcirc','\uD835\uDD35':'xfr','\uD835\uDCCD':'xscr','\uD835\uDD69':'xopf','\uD835\uDD4F':'Xopf','\uD835\uDD1B':'Xfr','\uD835\uDCB3':'Xscr','\uD835\uDD36':'yfr','\uD835\uDCCE':'yscr','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDD1C':'Yfr','\uD835\uDD50':'Yopf','\xFD':'yacute','\xDD':'Yacute','\u0177':'ycirc','\u0176':'Ycirc','\xFF':'yuml','\u0178':'Yuml','\uD835\uDCCF':'zscr','\uD835\uDD37':'zfr','\uD835\uDD6B':'zopf','\u2128':'Zfr','\u2124':'Zopf','\uD835\uDCB5':'Zscr','\u017A':'zacute','\u0179':'Zacute','\u017E':'zcaron','\u017D':'Zcaron','\u017C':'zdot','\u017B':'Zdot','\u01B5':'imped','\xFE':'thorn','\xDE':'THORN','\u0149':'napos','\u03B1':'alpha','\u0391':'Alpha','\u03B2':'beta','\u0392':'Beta','\u03B3':'gamma','\u0393':'Gamma','\u03B4':'delta','\u0394':'Delta','\u03B5':'epsi','\u03F5':'epsiv','\u0395':'Epsilon','\u03DD':'gammad','\u03DC':'Gammad','\u03B6':'zeta','\u0396':'Zeta','\u03B7':'eta','\u0397':'Eta','\u03B8':'theta','\u03D1':'thetav','\u0398':'Theta','\u03B9':'iota','\u0399':'Iota','\u03BA':'kappa','\u03F0':'kappav','\u039A':'Kappa','\u03BB':'lambda','\u039B':'Lambda','\u03BC':'mu','\xB5':'micro','\u039C':'Mu','\u03BD':'nu','\u039D':'Nu','\u03BE':'xi','\u039E':'Xi','\u03BF':'omicron','\u039F':'Omicron','\u03C0':'pi','\u03D6':'piv','\u03A0':'Pi','\u03C1':'rho','\u03F1':'rhov','\u03A1':'Rho','\u03C3':'sigma','\u03A3':'Sigma','\u03C2':'sigmaf','\u03C4':'tau','\u03A4':'Tau','\u03C5':'upsi','\u03A5':'Upsilon','\u03D2':'Upsi','\u03C6':'phi','\u03D5':'phiv','\u03A6':'Phi','\u03C7':'chi','\u03A7':'Chi','\u03C8':'psi','\u03A8':'Psi','\u03C9':'omega','\u03A9':'ohm','\u0430':'acy','\u0410':'Acy','\u0431':'bcy','\u0411':'Bcy','\u0432':'vcy','\u0412':'Vcy','\u0433':'gcy','\u0413':'Gcy','\u0453':'gjcy','\u0403':'GJcy','\u0434':'dcy','\u0414':'Dcy','\u0452':'djcy','\u0402':'DJcy','\u0435':'iecy','\u0415':'IEcy','\u0451':'iocy','\u0401':'IOcy','\u0454':'jukcy','\u0404':'Jukcy','\u0436':'zhcy','\u0416':'ZHcy','\u0437':'zcy','\u0417':'Zcy','\u0455':'dscy','\u0405':'DScy','\u0438':'icy','\u0418':'Icy','\u0456':'iukcy','\u0406':'Iukcy','\u0457':'yicy','\u0407':'YIcy','\u0439':'jcy','\u0419':'Jcy','\u0458':'jsercy','\u0408':'Jsercy','\u043A':'kcy','\u041A':'Kcy','\u045C':'kjcy','\u040C':'KJcy','\u043B':'lcy','\u041B':'Lcy','\u0459':'ljcy','\u0409':'LJcy','\u043C':'mcy','\u041C':'Mcy','\u043D':'ncy','\u041D':'Ncy','\u045A':'njcy','\u040A':'NJcy','\u043E':'ocy','\u041E':'Ocy','\u043F':'pcy','\u041F':'Pcy','\u0440':'rcy','\u0420':'Rcy','\u0441':'scy','\u0421':'Scy','\u0442':'tcy','\u0422':'Tcy','\u045B':'tshcy','\u040B':'TSHcy','\u0443':'ucy','\u0423':'Ucy','\u045E':'ubrcy','\u040E':'Ubrcy','\u0444':'fcy','\u0424':'Fcy','\u0445':'khcy','\u0425':'KHcy','\u0446':'tscy','\u0426':'TScy','\u0447':'chcy','\u0427':'CHcy','\u045F':'dzcy','\u040F':'DZcy','\u0448':'shcy','\u0428':'SHcy','\u0449':'shchcy','\u0429':'SHCHcy','\u044A':'hardcy','\u042A':'HARDcy','\u044B':'ycy','\u042B':'Ycy','\u044C':'softcy','\u042C':'SOFTcy','\u044D':'ecy','\u042D':'Ecy','\u044E':'yucy','\u042E':'YUcy','\u044F':'yacy','\u042F':'YAcy','\u2135':'aleph','\u2136':'beth','\u2137':'gimel','\u2138':'daleth'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
	var decodeMap = {'aacute':'\xE1','Aacute':'\xC1','abreve':'\u0103','Abreve':'\u0102','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','acy':'\u0430','Acy':'\u0410','aelig':'\xE6','AElig':'\xC6','af':'\u2061','afr':'\uD835\uDD1E','Afr':'\uD835\uDD04','agrave':'\xE0','Agrave':'\xC0','alefsym':'\u2135','aleph':'\u2135','alpha':'\u03B1','Alpha':'\u0391','amacr':'\u0101','Amacr':'\u0100','amalg':'\u2A3F','amp':'&','AMP':'&','and':'\u2227','And':'\u2A53','andand':'\u2A55','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsd':'\u2221','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','aogon':'\u0105','Aogon':'\u0104','aopf':'\uD835\uDD52','Aopf':'\uD835\uDD38','ap':'\u2248','apacir':'\u2A6F','ape':'\u224A','apE':'\u2A70','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','aring':'\xE5','Aring':'\xC5','ascr':'\uD835\uDCB6','Ascr':'\uD835\uDC9C','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','bcy':'\u0431','Bcy':'\u0411','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','beta':'\u03B2','Beta':'\u0392','beth':'\u2136','between':'\u226C','bfr':'\uD835\uDD1F','Bfr':'\uD835\uDD05','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bnot':'\u2310','bNot':'\u2AED','bopf':'\uD835\uDD53','Bopf':'\uD835\uDD39','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxhD':'\u2565','boxHd':'\u2564','boxHD':'\u2566','boxhu':'\u2534','boxhU':'\u2568','boxHu':'\u2567','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsol':'\\','bsolb':'\u29C5','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpe':'\u224F','bumpE':'\u2AAE','bumpeq':'\u224F','Bumpeq':'\u224E','cacute':'\u0107','Cacute':'\u0106','cap':'\u2229','Cap':'\u22D2','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','ccaron':'\u010D','Ccaron':'\u010C','ccedil':'\xE7','Ccedil':'\xC7','ccirc':'\u0109','Ccirc':'\u0108','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','cdot':'\u010B','Cdot':'\u010A','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','chcy':'\u0447','CHcy':'\u0427','check':'\u2713','checkmark':'\u2713','chi':'\u03C7','Chi':'\u03A7','cir':'\u25CB','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cire':'\u2257','cirE':'\u29C3','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','colone':'\u2254','Colone':'\u2A74','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','cscr':'\uD835\uDCB8','Cscr':'\uD835\uDC9E','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cup':'\u222A','Cup':'\u22D3','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','dArr':'\u21D3','Darr':'\u21A1','dash':'\u2010','dashv':'\u22A3','Dashv':'\u2AE4','dbkarow':'\u290F','dblac':'\u02DD','dcaron':'\u010F','Dcaron':'\u010E','dcy':'\u0434','Dcy':'\u0414','dd':'\u2146','DD':'\u2145','ddagger':'\u2021','ddarr':'\u21CA','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','delta':'\u03B4','Delta':'\u0394','demptyv':'\u29B1','dfisht':'\u297F','dfr':'\uD835\uDD21','Dfr':'\uD835\uDD07','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','djcy':'\u0452','DJcy':'\u0402','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','dopf':'\uD835\uDD55','Dopf':'\uD835\uDD3B','dot':'\u02D9','Dot':'\xA8','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','downarrow':'\u2193','Downarrow':'\u21D3','DownArrow':'\u2193','DownArrowBar':'\u2913','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVector':'\u21BD','DownLeftVectorBar':'\u2956','DownRightTeeVector':'\u295F','DownRightVector':'\u21C1','DownRightVectorBar':'\u2957','DownTee':'\u22A4','DownTeeArrow':'\u21A7','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','dscr':'\uD835\uDCB9','Dscr':'\uD835\uDC9F','dscy':'\u0455','DScy':'\u0405','dsol':'\u29F6','dstrok':'\u0111','Dstrok':'\u0110','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','dzcy':'\u045F','DZcy':'\u040F','dzigrarr':'\u27FF','eacute':'\xE9','Eacute':'\xC9','easter':'\u2A6E','ecaron':'\u011B','Ecaron':'\u011A','ecir':'\u2256','ecirc':'\xEA','Ecirc':'\xCA','ecolon':'\u2255','ecy':'\u044D','Ecy':'\u042D','eDDot':'\u2A77','edot':'\u0117','eDot':'\u2251','Edot':'\u0116','ee':'\u2147','efDot':'\u2252','efr':'\uD835\uDD22','Efr':'\uD835\uDD08','eg':'\u2A9A','egrave':'\xE8','Egrave':'\xC8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','emacr':'\u0113','Emacr':'\u0112','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp':'\u2003','emsp13':'\u2004','emsp14':'\u2005','eng':'\u014B','ENG':'\u014A','ensp':'\u2002','eogon':'\u0119','Eogon':'\u0118','eopf':'\uD835\uDD56','Eopf':'\uD835\uDD3C','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','epsilon':'\u03B5','Epsilon':'\u0395','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','esim':'\u2242','Esim':'\u2A73','eta':'\u03B7','Eta':'\u0397','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','fcy':'\u0444','Fcy':'\u0424','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','ffr':'\uD835\uDD23','Ffr':'\uD835\uDD09','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','fopf':'\uD835\uDD57','Fopf':'\uD835\uDD3D','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','gamma':'\u03B3','Gamma':'\u0393','gammad':'\u03DD','Gammad':'\u03DC','gap':'\u2A86','gbreve':'\u011F','Gbreve':'\u011E','Gcedil':'\u0122','gcirc':'\u011D','Gcirc':'\u011C','gcy':'\u0433','Gcy':'\u0413','gdot':'\u0121','Gdot':'\u0120','ge':'\u2265','gE':'\u2267','gel':'\u22DB','gEl':'\u2A8C','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','ges':'\u2A7E','gescc':'\u2AA9','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','gfr':'\uD835\uDD24','Gfr':'\uD835\uDD0A','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','gjcy':'\u0453','GJcy':'\u0403','gl':'\u2277','gla':'\u2AA5','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','gopf':'\uD835\uDD58','Gopf':'\uD835\uDD3E','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','gscr':'\u210A','Gscr':'\uD835\uDCA2','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gt':'>','Gt':'\u226B','GT':'>','gtcc':'\u2AA7','gtcir':'\u2A7A','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','hardcy':'\u044A','HARDcy':'\u042A','harr':'\u2194','hArr':'\u21D4','harrcir':'\u2948','harrw':'\u21AD','Hat':'^','hbar':'\u210F','hcirc':'\u0125','Hcirc':'\u0124','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','hstrok':'\u0127','Hstrok':'\u0126','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','iacute':'\xED','Iacute':'\xCD','ic':'\u2063','icirc':'\xEE','Icirc':'\xCE','icy':'\u0438','Icy':'\u0418','Idot':'\u0130','iecy':'\u0435','IEcy':'\u0415','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','igrave':'\xEC','Igrave':'\xCC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','ijlig':'\u0133','IJlig':'\u0132','Im':'\u2111','imacr':'\u012B','Imacr':'\u012A','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','in':'\u2208','incare':'\u2105','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','int':'\u222B','Int':'\u222C','intcal':'\u22BA','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','iocy':'\u0451','IOcy':'\u0401','iogon':'\u012F','Iogon':'\u012E','iopf':'\uD835\uDD5A','Iopf':'\uD835\uDD40','iota':'\u03B9','Iota':'\u0399','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','itilde':'\u0129','Itilde':'\u0128','iukcy':'\u0456','Iukcy':'\u0406','iuml':'\xEF','Iuml':'\xCF','jcirc':'\u0135','Jcirc':'\u0134','jcy':'\u0439','Jcy':'\u0419','jfr':'\uD835\uDD27','Jfr':'\uD835\uDD0D','jmath':'\u0237','jopf':'\uD835\uDD5B','Jopf':'\uD835\uDD41','jscr':'\uD835\uDCBF','Jscr':'\uD835\uDCA5','jsercy':'\u0458','Jsercy':'\u0408','jukcy':'\u0454','Jukcy':'\u0404','kappa':'\u03BA','Kappa':'\u039A','kappav':'\u03F0','kcedil':'\u0137','Kcedil':'\u0136','kcy':'\u043A','Kcy':'\u041A','kfr':'\uD835\uDD28','Kfr':'\uD835\uDD0E','kgreen':'\u0138','khcy':'\u0445','KHcy':'\u0425','kjcy':'\u045C','KJcy':'\u040C','kopf':'\uD835\uDD5C','Kopf':'\uD835\uDD42','kscr':'\uD835\uDCC0','Kscr':'\uD835\uDCA6','lAarr':'\u21DA','lacute':'\u013A','Lacute':'\u0139','laemptyv':'\u29B4','lagran':'\u2112','lambda':'\u03BB','Lambda':'\u039B','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larr':'\u2190','lArr':'\u21D0','Larr':'\u219E','larrb':'\u21E4','larrbfs':'\u291F','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','lat':'\u2AAB','latail':'\u2919','lAtail':'\u291B','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','lcaron':'\u013E','Lcaron':'\u013D','lcedil':'\u013C','Lcedil':'\u013B','lceil':'\u2308','lcub':'{','lcy':'\u043B','Lcy':'\u041B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','leftarrow':'\u2190','Leftarrow':'\u21D0','LeftArrow':'\u2190','LeftArrowBar':'\u21E4','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVector':'\u21C3','LeftDownVectorBar':'\u2959','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','Leftrightarrow':'\u21D4','LeftRightArrow':'\u2194','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTee':'\u22A3','LeftTeeArrow':'\u21A4','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangle':'\u22B2','LeftTriangleBar':'\u29CF','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVector':'\u21BF','LeftUpVectorBar':'\u2958','LeftVector':'\u21BC','LeftVectorBar':'\u2952','leg':'\u22DA','lEg':'\u2A8B','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','les':'\u2A7D','lescc':'\u2AA8','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','lfr':'\uD835\uDD29','Lfr':'\uD835\uDD0F','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','ljcy':'\u0459','LJcy':'\u0409','ll':'\u226A','Ll':'\u22D8','llarr':'\u21C7','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','lmidot':'\u0140','Lmidot':'\u013F','lmoust':'\u23B0','lmoustache':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','Longleftarrow':'\u27F8','LongLeftArrow':'\u27F5','longleftrightarrow':'\u27F7','Longleftrightarrow':'\u27FA','LongLeftRightArrow':'\u27F7','longmapsto':'\u27FC','longrightarrow':'\u27F6','Longrightarrow':'\u27F9','LongRightArrow':'\u27F6','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','lopf':'\uD835\uDD5D','Lopf':'\uD835\uDD43','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','lstrok':'\u0142','Lstrok':'\u0141','lt':'<','Lt':'\u226A','LT':'<','ltcc':'\u2AA6','ltcir':'\u2A79','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','map':'\u21A6','Map':'\u2905','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','mcy':'\u043C','Mcy':'\u041C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','mfr':'\uD835\uDD2A','Mfr':'\uD835\uDD10','mho':'\u2127','micro':'\xB5','mid':'\u2223','midast':'*','midcir':'\u2AF0','middot':'\xB7','minus':'\u2212','minusb':'\u229F','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','mopf':'\uD835\uDD5E','Mopf':'\uD835\uDD44','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','mu':'\u03BC','Mu':'\u039C','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','nacute':'\u0144','Nacute':'\u0143','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natur':'\u266E','natural':'\u266E','naturals':'\u2115','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','ncaron':'\u0148','Ncaron':'\u0147','ncedil':'\u0146','Ncedil':'\u0145','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','ncy':'\u043D','Ncy':'\u041D','ndash':'\u2013','ne':'\u2260','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','nfr':'\uD835\uDD2B','Nfr':'\uD835\uDD11','nge':'\u2271','ngE':'\u2267\u0338','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','ngt':'\u226F','nGt':'\u226B\u20D2','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','njcy':'\u045A','NJcy':'\u040A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nle':'\u2270','nlE':'\u2266\u0338','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nlt':'\u226E','nLt':'\u226A\u20D2','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','not':'\xAC','Not':'\u2AEC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangle':'\u22EA','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangle':'\u22EB','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','npar':'\u2226','nparallel':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','npre':'\u2AAF\u0338','nprec':'\u2280','npreceq':'\u2AAF\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrc':'\u2933\u0338','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','nscr':'\uD835\uDCC3','Nscr':'\uD835\uDCA9','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsube':'\u2288','nsubE':'\u2AC5\u0338','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupe':'\u2289','nsupE':'\u2AC6\u0338','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','ntilde':'\xF1','Ntilde':'\xD1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','nu':'\u03BD','Nu':'\u039D','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','oacute':'\xF3','Oacute':'\xD3','oast':'\u229B','ocir':'\u229A','ocirc':'\xF4','Ocirc':'\xD4','ocy':'\u043E','Ocy':'\u041E','odash':'\u229D','odblac':'\u0151','Odblac':'\u0150','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','oelig':'\u0153','OElig':'\u0152','ofcir':'\u29BF','ofr':'\uD835\uDD2C','Ofr':'\uD835\uDD12','ogon':'\u02DB','ograve':'\xF2','Ograve':'\xD2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','omacr':'\u014D','Omacr':'\u014C','omega':'\u03C9','Omega':'\u03A9','omicron':'\u03BF','Omicron':'\u039F','omid':'\u29B6','ominus':'\u2296','oopf':'\uD835\uDD60','Oopf':'\uD835\uDD46','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','or':'\u2228','Or':'\u2A54','orarr':'\u21BB','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','oscr':'\u2134','Oscr':'\uD835\uDCAA','oslash':'\xF8','Oslash':'\xD8','osol':'\u2298','otilde':'\xF5','Otilde':'\xD5','otimes':'\u2297','Otimes':'\u2A37','otimesas':'\u2A36','ouml':'\xF6','Ouml':'\xD6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','par':'\u2225','para':'\xB6','parallel':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','pcy':'\u043F','Pcy':'\u041F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','pfr':'\uD835\uDD2D','Pfr':'\uD835\uDD13','phi':'\u03C6','Phi':'\u03A6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','pi':'\u03C0','Pi':'\u03A0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plus':'+','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','pr':'\u227A','Pr':'\u2ABB','prap':'\u2AB7','prcue':'\u227C','pre':'\u2AAF','prE':'\u2AB3','prec':'\u227A','precapprox':'\u2AB7','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportion':'\u2237','Proportional':'\u221D','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','pscr':'\uD835\uDCC5','Pscr':'\uD835\uDCAB','psi':'\u03C8','Psi':'\u03A8','puncsp':'\u2008','qfr':'\uD835\uDD2E','Qfr':'\uD835\uDD14','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','qscr':'\uD835\uDCC6','Qscr':'\uD835\uDCAC','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','racute':'\u0155','Racute':'\u0154','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarr':'\u2192','rArr':'\u21D2','Rarr':'\u21A0','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','rarrtl':'\u21A3','Rarrtl':'\u2916','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','rcaron':'\u0159','Rcaron':'\u0158','rcedil':'\u0157','Rcedil':'\u0156','rceil':'\u2309','rcub':'}','rcy':'\u0440','Rcy':'\u0420','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','Re':'\u211C','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','rho':'\u03C1','Rho':'\u03A1','rhov':'\u03F1','RightAngleBracket':'\u27E9','rightarrow':'\u2192','Rightarrow':'\u21D2','RightArrow':'\u2192','RightArrowBar':'\u21E5','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVector':'\u21C2','RightDownVectorBar':'\u2955','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTee':'\u22A2','RightTeeArrow':'\u21A6','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangle':'\u22B3','RightTriangleBar':'\u29D0','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVector':'\u21BE','RightUpVectorBar':'\u2954','RightVector':'\u21C0','RightVectorBar':'\u2953','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoust':'\u23B1','rmoustache':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','sacute':'\u015B','Sacute':'\u015A','sbquo':'\u201A','sc':'\u227B','Sc':'\u2ABC','scap':'\u2AB8','scaron':'\u0161','Scaron':'\u0160','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','scedil':'\u015F','Scedil':'\u015E','scirc':'\u015D','Scirc':'\u015C','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','scy':'\u0441','Scy':'\u0421','sdot':'\u22C5','sdotb':'\u22A1','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','sfr':'\uD835\uDD30','Sfr':'\uD835\uDD16','sfrown':'\u2322','sharp':'\u266F','shchcy':'\u0449','SHCHcy':'\u0429','shcy':'\u0448','SHcy':'\u0428','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','sigma':'\u03C3','Sigma':'\u03A3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','softcy':'\u044C','SOFTcy':'\u042C','sol':'/','solb':'\u29C4','solbar':'\u233F','sopf':'\uD835\uDD64','Sopf':'\uD835\uDD4A','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','squ':'\u25A1','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squf':'\u25AA','srarr':'\u2192','sscr':'\uD835\uDCC8','Sscr':'\uD835\uDCAE','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','star':'\u2606','Star':'\u22C6','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','sube':'\u2286','subE':'\u2AC5','subedot':'\u2AC3','submult':'\u2AC1','subne':'\u228A','subnE':'\u2ACB','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succ':'\u227B','succapprox':'\u2AB8','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup':'\u2283','Sup':'\u22D1','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','supdot':'\u2ABE','supdsub':'\u2AD8','supe':'\u2287','supE':'\u2AC6','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supne':'\u228B','supnE':'\u2ACC','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','tau':'\u03C4','Tau':'\u03A4','tbrk':'\u23B4','tcaron':'\u0165','Tcaron':'\u0164','tcedil':'\u0163','Tcedil':'\u0162','tcy':'\u0442','Tcy':'\u0422','tdot':'\u20DB','telrec':'\u2315','tfr':'\uD835\uDD31','Tfr':'\uD835\uDD17','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','theta':'\u03B8','Theta':'\u0398','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','thinsp':'\u2009','ThinSpace':'\u2009','thkap':'\u2248','thksim':'\u223C','thorn':'\xFE','THORN':'\xDE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','times':'\xD7','timesb':'\u22A0','timesbar':'\u2A31','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','top':'\u22A4','topbot':'\u2336','topcir':'\u2AF1','topf':'\uD835\uDD65','Topf':'\uD835\uDD4B','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','tscr':'\uD835\uDCC9','Tscr':'\uD835\uDCAF','tscy':'\u0446','TScy':'\u0426','tshcy':'\u045B','TSHcy':'\u040B','tstrok':'\u0167','Tstrok':'\u0166','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','uacute':'\xFA','Uacute':'\xDA','uarr':'\u2191','uArr':'\u21D1','Uarr':'\u219F','Uarrocir':'\u2949','ubrcy':'\u045E','Ubrcy':'\u040E','ubreve':'\u016D','Ubreve':'\u016C','ucirc':'\xFB','Ucirc':'\xDB','ucy':'\u0443','Ucy':'\u0423','udarr':'\u21C5','udblac':'\u0171','Udblac':'\u0170','udhar':'\u296E','ufisht':'\u297E','ufr':'\uD835\uDD32','Ufr':'\uD835\uDD18','ugrave':'\xF9','Ugrave':'\xD9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','umacr':'\u016B','Umacr':'\u016A','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','uogon':'\u0173','Uogon':'\u0172','uopf':'\uD835\uDD66','Uopf':'\uD835\uDD4C','uparrow':'\u2191','Uparrow':'\u21D1','UpArrow':'\u2191','UpArrowBar':'\u2912','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','Updownarrow':'\u21D5','UpDownArrow':'\u2195','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','upsilon':'\u03C5','Upsilon':'\u03A5','UpTee':'\u22A5','UpTeeArrow':'\u21A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','uring':'\u016F','Uring':'\u016E','urtri':'\u25F9','uscr':'\uD835\uDCCA','Uscr':'\uD835\uDCB0','utdot':'\u22F0','utilde':'\u0169','Utilde':'\u0168','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','uuml':'\xFC','Uuml':'\xDC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','vcy':'\u0432','Vcy':'\u0412','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','vee':'\u2228','Vee':'\u22C1','veebar':'\u22BB','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','vfr':'\uD835\uDD33','Vfr':'\uD835\uDD19','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','vopf':'\uD835\uDD67','Vopf':'\uD835\uDD4D','vprop':'\u221D','vrtri':'\u22B3','vscr':'\uD835\uDCCB','Vscr':'\uD835\uDCB1','vsubne':'\u228A\uFE00','vsubnE':'\u2ACB\uFE00','vsupne':'\u228B\uFE00','vsupnE':'\u2ACC\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','wcirc':'\u0175','Wcirc':'\u0174','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','wfr':'\uD835\uDD34','Wfr':'\uD835\uDD1A','wopf':'\uD835\uDD68','Wopf':'\uD835\uDD4E','wp':'\u2118','wr':'\u2240','wreath':'\u2240','wscr':'\uD835\uDCCC','Wscr':'\uD835\uDCB2','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','xfr':'\uD835\uDD35','Xfr':'\uD835\uDD1B','xharr':'\u27F7','xhArr':'\u27FA','xi':'\u03BE','Xi':'\u039E','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','xopf':'\uD835\uDD69','Xopf':'\uD835\uDD4F','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','xscr':'\uD835\uDCCD','Xscr':'\uD835\uDCB3','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','yacute':'\xFD','Yacute':'\xDD','yacy':'\u044F','YAcy':'\u042F','ycirc':'\u0177','Ycirc':'\u0176','ycy':'\u044B','Ycy':'\u042B','yen':'\xA5','yfr':'\uD835\uDD36','Yfr':'\uD835\uDD1C','yicy':'\u0457','YIcy':'\u0407','yopf':'\uD835\uDD6A','Yopf':'\uD835\uDD50','yscr':'\uD835\uDCCE','Yscr':'\uD835\uDCB4','yucy':'\u044E','YUcy':'\u042E','yuml':'\xFF','Yuml':'\u0178','zacute':'\u017A','Zacute':'\u0179','zcaron':'\u017E','Zcaron':'\u017D','zcy':'\u0437','Zcy':'\u0417','zdot':'\u017C','Zdot':'\u017B','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','zeta':'\u03B6','Zeta':'\u0396','zfr':'\uD835\uDD37','Zfr':'\u2128','zhcy':'\u0436','ZHcy':'\u0416','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','zscr':'\uD835\uDCCF','Zscr':'\uD835\uDCB5','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'aacute':'\xE1','Aacute':'\xC1','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','aelig':'\xE6','AElig':'\xC6','agrave':'\xE0','Agrave':'\xC0','amp':'&','AMP':'&','aring':'\xE5','Aring':'\xC5','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','brvbar':'\xA6','ccedil':'\xE7','Ccedil':'\xC7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','eacute':'\xE9','Eacute':'\xC9','ecirc':'\xEA','Ecirc':'\xCA','egrave':'\xE8','Egrave':'\xC8','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','iacute':'\xED','Iacute':'\xCD','icirc':'\xEE','Icirc':'\xCE','iexcl':'\xA1','igrave':'\xEC','Igrave':'\xCC','iquest':'\xBF','iuml':'\xEF','Iuml':'\xCF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','ntilde':'\xF1','Ntilde':'\xD1','oacute':'\xF3','Oacute':'\xD3','ocirc':'\xF4','Ocirc':'\xD4','ograve':'\xF2','Ograve':'\xD2','ordf':'\xAA','ordm':'\xBA','oslash':'\xF8','Oslash':'\xD8','otilde':'\xF5','Otilde':'\xD5','ouml':'\xF6','Ouml':'\xD6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','thorn':'\xFE','THORN':'\xDE','times':'\xD7','uacute':'\xFA','Uacute':'\xDA','ucirc':'\xFB','Ucirc':'\xDB','ugrave':'\xF9','Ugrave':'\xD9','uml':'\xA8','uuml':'\xFC','Uuml':'\xDC','yacute':'\xFD','Yacute':'\xDD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see https://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(codePoint) {
		return '&#x' + codePoint.toString(16).toUpperCase() + ';';
	};

	var decEscape = function(codePoint) {
		return '&#' + codePoint + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		var allowUnsafeSymbols = options.allowUnsafeSymbols;
		var escapeCodePoint = options.decimal ? decEscape : hexEscape;

		var escapeBmpSymbol = function(symbol) {
			return escapeCodePoint(symbol.charCodeAt(0));
		};

		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return escapeBmpSymbol(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			if (!allowUnsafeSymbols) {
				string = string.replace(regexEscape, function(string) {
					return '&' + encodeMap[string] + ';'; // no need to check `has()` here
				});
			}
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else if (!allowUnsafeSymbols) {
			// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
			// using named character references.
			string = string.replace(regexEscape, escapeBmpSymbol);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return escapeCodePoint(codePoint);
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, escapeBmpSymbol);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false,
		'decimal' : false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
			var codePoint;
			var semicolon;
			var decDigits;
			var hexDigits;
			var reference;
			var next;

			if ($1) {
				reference = $1;
				// Note: there is no need to check `has(decodeMap, reference)`.
				return decodeMap[reference];
			}

			if ($2) {
				// Decode named character references without trailing `;`, e.g. `&amp`.
				// This is only a parse error if it gets converted to `&`, or if it is
				// followed by `=` in an attribute context.
				reference = $2;
				next = $3;
				if (next && options.isAttributeValue) {
					if (strict && next == '=') {
						parseError('`&` did not start a character reference');
					}
					return $0;
				} else {
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					// Note: there is no need to check `has(decodeMapLegacy, reference)`.
					return decodeMapLegacy[reference] + (next || '');
				}
			}

			if ($4) {
				// Decode decimal escapes, e.g. `&#119558;`.
				decDigits = $4;
				semicolon = $5;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(decDigits, 10);
				return codePointToSymbol(codePoint, strict);
			}

			if ($6) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $6;
				semicolon = $7;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}

			// If we’re still here, `if ($7)` is implied; it’s an ambiguous
			// ampersand for sure. https://mths.be/notes/ambiguous-ampersands
			if (strict) {
				parseError(
					'named character reference was not terminated by a semicolon'
				);
			}
			return $0;
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '1.2.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return he;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = he;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.he = he;
	}

}(this));


}),
"./node_modules/.pnpm/acorn@8.12.0/node_modules/acorn/dist/acorn.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Node: function() { return Node; },
  Parser: function() { return Parser; },
  Position: function() { return Position; },
  SourceLocation: function() { return SourceLocation; },
  TokContext: function() { return TokContext; },
  Token: function() { return Token; },
  TokenType: function() { return TokenType; },
  defaultOptions: function() { return defaultOptions; },
  getLineInfo: function() { return getLineInfo; },
  isIdentifierChar: function() { return isIdentifierChar; },
  isIdentifierStart: function() { return isIdentifierStart; },
  isNewLine: function() { return isNewLine; },
  keywordTypes: function() { return keywords; },
  lineBreak: function() { return lineBreak; },
  lineBreakG: function() { return lineBreakG; },
  nonASCIIwhitespace: function() { return nonASCIIwhitespace; },
  parse: function() { return parse; },
  parseExpressionAt: function() { return parseExpressionAt; },
  tokContexts: function() { return types; },
  tokTypes: function() { return types$1; },
  tokenizer: function() { return tokenizer; },
  version: function() { return version; }
});
// This file was generated. Do not modify manually!
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 81, 2, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 9, 5351, 0, 7, 14, 13835, 9, 87, 9, 39, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4706, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 983, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

// This file was generated. Do not modify manually!
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 68, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 4026, 582, 8634, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 757, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];

// This file was generated. Do not modify manually!
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0898-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

// This file was generated. Do not modify manually!
var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ca\ua7d0\ua7d1\ua7d3\ua7d5-\ua7d9\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range.

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};

var keywordRelationalOperator = /^in(stanceof)?$/;

// ## Character categories

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) { return false }
    pos += set[i + 1];
    if (pos >= code) { return true }
  }
  return false
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) { return code === 36 }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) { return code === 36 }
  if (code < 58) { return true }
  if (code < 65) { return false }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

// Map keyword names to token types.

var keywords = {};

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name;
  return keywords[name] = new TokenType(name, options)
}

var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),
  coalesce: binop("??", 1),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
};

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

function nextLineBreak(code, from, end) {
  if ( end === void 0 ) end = code.length;

  for (var i = from; i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next))
      { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
  }
  return -1
}

var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;

var hasOwn = Object.hasOwn || (function (obj, propName) { return (
  hasOwnProperty.call(obj, propName)
); });

var isArray = Array.isArray || (function (obj) { return (
  toString.call(obj) === "[object Array]"
); });

var regexpCache = Object.create(null);

function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
}

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) { return String.fromCharCode(code) }
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) { this.source = p.sourceFile; }
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    var nextBreak = nextLineBreak(input, cur, offset);
    if (nextBreak < 0) { return new Position(line, offset - cur) }
    ++line;
    cur = nextBreak;
  }
}

// A second argument must be given to configure the parser process.
// These options are recognized (only `ecmaVersion` is required):

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  // (the latest version the library supports). This influences
  // support for strict mode, the set of reserved words, and support
  // for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called when
  // a semicolon is automatically inserted. It will be passed the
  // position of the inserted semicolon as an offset, and if
  // `locations` is enabled, it is given the location as a `{line,
  // column}` object as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: null,
  // When enabled, super identifiers are not constrained to
  // appearing in methods and do not raise an error when they appear elsewhere.
  allowSuperOutsideMethod: null,
  // When enabled, hashbang directive in the beginning of file is
  // allowed and treated as a line comment. Enabled by default when
  // `ecmaVersion` >= 2023.
  allowHashBang: false,
  // By default, the parser will verify that private properties are
  // only used in places where they are valid and have been declared.
  // Set this to false to turn such checks off.
  checkPrivateFields: true,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  // When this option has an array as value, objects representing the
  // comments are pushed to it.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
};

// Interpret and default an options object

var warnedAboutEcmaVersion = false;

function getOptions(opts) {
  var options = {};

  for (var opt in defaultOptions)
    { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }

  if (options.allowReserved == null)
    { options.allowReserved = options.ecmaVersion < 5; }

  if (!opts || opts.allowHashBang == null)
    { options.allowHashBang = options.ecmaVersion >= 14; }

  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function (token) { return tokens.push(token); };
  }
  if (isArray(options.onComment))
    { options.onComment = pushComment(options, options.onComment); }

  return options
}

function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations)
      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
    if (options.ranges)
      { comment.range = [start, end]; }
    array.push(comment);
  }
}

// Each scope gets a bitset that may contain these flags
var
    SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128,
    SCOPE_CLASS_STATIC_BLOCK = 256,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
}

// Used in checkLVal* and declareName to determine the type of a binding
var
    BIND_NONE = 0, // Not a binding
    BIND_VAR = 1, // Var-style binding
    BIND_LEXICAL = 2, // Let- or const-style binding
    BIND_FUNCTION = 3, // Function declaration
    BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
    BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") { reserved += " await"; }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false;

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = types$1.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition();

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;

  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  // Labels in scope.
  this.labels = [];
  // Thus-far undefined exports.
  this.undefinedExports = Object.create(null);

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
    { this.skipLineComment(2); }

  // Scope tracking for duplicate variable names (see scope.js)
  this.scopeStack = [];
  this.enterScope(SCOPE_TOP);

  // For RegExp validation
  this.regexpState = null;

  // The stack of private names.
  // Each element has two properties: 'declared' and 'used'.
  // When it exited from the outermost class definition, all used private names must be declared.
  this.privateNameStack = [];
};

var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node)
};

prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 && !this.currentVarScope().inClassFieldInit };

prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 && !this.currentVarScope().inClassFieldInit };

prototypeAccessors.canAwait.get = function () {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var scope = this.scopeStack[i];
    if (scope.inClassFieldInit || scope.flags & SCOPE_CLASS_STATIC_BLOCK) { return false }
    if (scope.flags & SCOPE_FUNCTION) { return (scope.flags & SCOPE_ASYNC) > 0 }
  }
  return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
};

prototypeAccessors.allowSuper.get = function () {
  var ref = this.currentThisScope();
    var flags = ref.flags;
    var inClassFieldInit = ref.inClassFieldInit;
  return (flags & SCOPE_SUPER) > 0 || inClassFieldInit || this.options.allowSuperOutsideMethod
};

prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

prototypeAccessors.allowNewDotTarget.get = function () {
  var ref = this.currentThisScope();
    var flags = ref.flags;
    var inClassFieldInit = ref.inClassFieldInit;
  return (flags & (SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK)) > 0 || inClassFieldInit
};

prototypeAccessors.inClassStaticBlock.get = function () {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
};

Parser.extend = function extend () {
    var plugins = [], len = arguments.length;
    while ( len-- ) plugins[ len ] = arguments[ len ];

  var cls = this;
  for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
  return cls
};

Parser.parse = function parse (input, options) {
  return new this(options, input).parse()
};

Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression()
};

Parser.tokenizer = function tokenizer (input, options) {
  return new this(options, input)
};

Object.defineProperties( Parser.prototype, prototypeAccessors );

var pp$9 = Parser.prototype;

// ## Parser utilities

var literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/s;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) { return false }
  for (;;) {
    // Try to find string literal.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) { return false }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" ||
        (lineBreak.test(spaceAfter[0]) &&
         !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
    }
    start += match[0].length;

    // Skip semicolon, if any.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";")
      { start++; }
  }
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

// Tests whether parsed token is a contextual keyword.

pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc
};

// Consumes contextual keyword if possible.

pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) { return false }
  this.next();
  return true
};

// Asserts that following token is given contextual keyword.

pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) { this.unexpected(); }
};

// Test whether a semicolon can be inserted at the current position.

pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof ||
    this.type === types$1.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
    return true
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
};

pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma)
      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
    if (!notNext)
      { this.next(); }
    return true
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

var DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign =
  this.trailingComma =
  this.parenthesizedAssign =
  this.parenthesizedBind =
  this.doubleProto =
    -1;
};

pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) { return }
  if (refDestructuringErrors.trailingComma > -1)
    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
};

pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) { return false }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  if (shorthandAssign >= 0)
    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  if (doubleProto >= 0)
    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
};

pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  if (this.awaitPos)
    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
};

pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    { return this.isSimpleAssignTarget(expr.expression) }
  return expr.type === "Identifier" || expr.type === "MemberExpression"
};

var pp$8 = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$8.parseTopLevel = function(node) {
  var exports = Object.create(null);
  if (!node.body) { node.body = []; }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports);
    node.body.push(stmt);
  }
  if (this.inModule)
    { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
      {
        var name = list[i];

        this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
      } }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType;
  return this.finishNode(node, "Program")
};

var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  // For ambiguous cases, determine if a LexicalDeclaration (or only a
  // Statement) is allowed here. If context is not empty then only a Statement
  // is allowed. However, `let [` is an explicit negative lookahead for
  // ExpressionStatement, so special-case it first.
  if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
  if (context) { return false }

  if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
    if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) { return true }
  }
  return false
};

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 === this.input.length ||
     !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$8.parseStatement = function(context, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;

  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case types$1._debugger: return this.parseDebuggerStatement(node)
  case types$1._do: return this.parseDoStatement(node)
  case types$1._for: return this.parseForStatement(node)
  case types$1._function:
    // Function as sole body of either an if statement or a labeled statement
    // works, but not when it is part of a labeled statement that is the sole
    // body of an if statement.
    if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
    return this.parseFunctionStatement(node, false, !context)
  case types$1._class:
    if (context) { this.unexpected(); }
    return this.parseClass(node, true)
  case types$1._if: return this.parseIfStatement(node)
  case types$1._return: return this.parseReturnStatement(node)
  case types$1._switch: return this.parseSwitchStatement(node)
  case types$1._throw: return this.parseThrowStatement(node)
  case types$1._try: return this.parseTryStatement(node)
  case types$1._const: case types$1._var:
    kind = kind || this.value;
    if (context && kind !== "var") { this.unexpected(); }
    return this.parseVarStatement(node, kind)
  case types$1._while: return this.parseWhileStatement(node)
  case types$1._with: return this.parseWithStatement(node)
  case types$1.braceL: return this.parseBlock(true, node)
  case types$1.semi: return this.parseEmptyStatement(node)
  case types$1._export:
  case types$1._import:
    if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
      skipWhiteSpace.lastIndex = this.pos;
      var skip = skipWhiteSpace.exec(this.input);
      var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
      if (nextCh === 40 || nextCh === 46) // '(' or '.'
        { return this.parseExpressionStatement(node, this.parseExpression()) }
    }

    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
      if (!this.inModule)
        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
    }
    return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (context) { this.unexpected(); }
      this.next();
      return this.parseFunctionStatement(node, true, !context)
    }

    var maybeName = this.value, expr = this.parseExpression();
    if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
      { return this.parseLabeledStatement(node, maybeName, expr, context) }
    else { return this.parseExpressionStatement(node, expr) }
  }
};

pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
  else if (this.type !== types$1.name) { this.unexpected(); }
  else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
      if (node.label && isBreak) { break }
    }
  }
  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
};

pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement")
};

pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6)
    { this.eat(types$1.semi); }
  else
    { this.semicolon(); }
  return this.finishNode(node, "DoWhileStatement")
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, null)
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types$1._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      return this.parseForIn(node, init$1)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init$1)
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors;
  var initPos = this.start;
  var init = awaitAt > -1
    ? this.parseExprSubscripts(refDestructuringErrors, "await")
    : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
      if (this.type === types$1._in) { this.unexpected(awaitAt); }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
      else if (this.options.ecmaVersion >= 9) { node.await = false; }
    }
    if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
};

pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement")
};

pp$8.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    { this.raise(this.start, "'return' outside of function"); }
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
  else { node.argument = this.parseExpression(); this.semicolon(); }
  return this.finishNode(node, "ReturnStatement")
};

pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(0);

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;
  for (var sawDefault = false; this.type !== types$1.braceR;) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) { this.finishNode(cur, "SwitchCase"); }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) { this.unexpected(); }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) { this.finishNode(cur, "SwitchCase"); }
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement")
};

pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement")
};

// Reused empty array added for node fields that are always empty.

var empty$1 = [];

pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);

  return param
};

pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) { this.unexpected(); }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer)
    { this.raise(node.start, "Missing catch or finally clause"); }
  return this.finishNode(node, "TryStatement")
};

pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration")
};

pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement")
};

pp$8.parseWithStatement = function(node) {
  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement")
};

pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement")
};

pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
    {
    var label = list[i$1];

    if (label.name === maybeName)
      { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  } }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this.labels[i];
    if (label$1.statementStart === node.start) {
      // Update information about previous labels on this node
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else { break }
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement")
};

pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement")
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
  if ( node === void 0 ) node = this.startNode();

  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) { this.enterScope(0); }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) { this.strict = false; }
  this.next();
  if (createNewLexicalScope) { this.exitScope(); }
  return this.finishNode(node, "BlockStatement")
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement")
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();

  if (
    init.type === "VariableDeclaration" &&
    init.declarations[0].init != null &&
    (
      !isForIn ||
      this.options.ecmaVersion < 8 ||
      this.strict ||
      init.kind !== "var" ||
      init.declarations[0].id.type !== "Identifier"
    )
  ) {
    this.raise(
      init.start,
      ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
    );
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
};

// Parse a list of variable declarations.

pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
      this.unexpected();
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) { break }
  }
  return node
};

pp$8.parseVarId = function(decl, kind) {
  decl.id = this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};

var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

// Parse a function declaration or literal (depending on the
// `statement & FUNC_STATEMENT`).

// Remove `allowExpressionBody` for 7.0.0, as it is only called with false
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
      { this.unexpected(); }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  if (statement & FUNC_STATEMENT) {
    node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT))
      // If it is a regular function declaration in sloppy mode, then it is
      // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
      // mode depends on properties of the current scope (see
      // treatFunctionsAsVar).
      { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
  }

  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));

  if (!(statement & FUNC_STATEMENT))
    { node.id = this.type === types$1.name ? this.parseIdent() : null; }

  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
};

pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$8.parseClass = function(node, isStatement) {
  this.next();

  // ecma-262 14.6 Class Definitions
  // A class definition is always strict mode code.
  var oldStrict = this.strict;
  this.strict = true;

  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) { return null }

  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;

  if (this.eatContextual("static")) {
    // Parse static init block
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }

  // Parse element name
  if (keyName) {
    // 'async', 'get', 'set', or 'static' were not a keyword contextually.
    // The last token is any of those. Make it the element name.
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }

  // Parse element value
  if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
    if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }

  return node
};

pp$8.isClassElementNameStart = function() {
  return (
    this.type === types$1.name ||
    this.type === types$1.privateId ||
    this.type === types$1.num ||
    this.type === types$1.string ||
    this.type === types$1.bracketL ||
    this.type.keyword
  )
};

pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};

pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  // Check key and flags
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }

  // Parse value
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

  // Check value
  if (method.kind === "get" && value.params.length !== 0)
    { this.raiseRecoverable(value.start, "getter should have no params"); }
  if (method.kind === "set" && value.params.length !== 1)
    { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
  if (method.kind === "set" && value.params[0].type === "RestElement")
    { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

  return this.finishNode(method, "MethodDefinition")
};

pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }

  if (this.eat(types$1.eq)) {
    // To raise SyntaxError if 'arguments' exists in the initializer.
    var scope = this.currentThisScope();
    var inClassFieldInit = scope.inClassFieldInit;
    scope.inClassFieldInit = true;
    field.value = this.parseMaybeAssign();
    scope.inClassFieldInit = inClassFieldInit;
  } else {
    field.value = null;
  }
  this.semicolon();

  return this.finishNode(field, "PropertyDefinition")
};

pp$8.parseClassStaticBlock = function(node) {
  node.body = [];

  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;

  return this.finishNode(node, "StaticBlock")
};

pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement)
      { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
  } else {
    if (isStatement === true)
      { this.unexpected(); }
    node.id = null;
  }
};

pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};

pp$8.enterClassBody = function() {
  var element = {declared: Object.create(null), used: []};
  this.privateNameStack.push(element);
  return element.declared
};

pp$8.exitClassBody = function() {
  var ref = this.privateNameStack.pop();
  var declared = ref.declared;
  var used = ref.used;
  if (!this.options.checkPrivateFields) { return }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i = 0; i < used.length; ++i) {
    var id = used[i];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
      }
    }
  }
};

function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];

  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }

  // `class { get #a(){}; static set #a(_){} }` is also conflict.
  if (
    curr === "iget" && next === "iset" ||
    curr === "iset" && next === "iget" ||
    curr === "sget" && next === "sset" ||
    curr === "sset" && next === "sget"
  ) {
    privateNameMap[name] = "true";
    return false
  } else if (!curr) {
    privateNameMap[name] = next;
    return false
  } else {
    return true
  }
}

function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (
    key.type === "Identifier" && key.name === name ||
    key.type === "Literal" && key.value === name
  )
}

// Parses module export declaration.

pp$8.parseExportAllDeclaration = function(node, exports) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) { this.unexpected(); }
  node.source = this.parseExprAtom();
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration")
};

pp$8.parseExport = function(node, exports) {
  this.next();
  // export * from '...'
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports)
  }
  if (this.eat(types$1._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration")
      { this.checkVariableExport(exports, node.declaration.declarations); }
    else
      { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
    node.specifiers = [];
    node.source = null;
  } else { // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
    } else {
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        // check for keywords used as local names
        var spec = list[i];

        this.checkUnreserved(spec.local);
        // check if export is defined
        this.checkLocalExport(spec.local);

        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null)
};

pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) { this.next(); }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID")
  } else {
    var declaration = this.parseMaybeAssign();
    this.semicolon();
    return declaration
  }
};

pp$8.checkExport = function(exports, name, pos) {
  if (!exports) { return }
  if (typeof name !== "string")
    { name = name.type === "Identifier" ? name.name : name.value; }
  if (hasOwn(exports, name))
    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  exports[name] = true;
};

pp$8.checkPatternExport = function(exports, pat) {
  var type = pat.type;
  if (type === "Identifier")
    { this.checkExport(exports, pat, pat.start); }
  else if (type === "ObjectPattern")
    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
      {
        var prop = list[i];

        this.checkPatternExport(exports, prop);
      } }
  else if (type === "ArrayPattern")
    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];

        if (elt) { this.checkPatternExport(exports, elt); }
    } }
  else if (type === "Property")
    { this.checkPatternExport(exports, pat.value); }
  else if (type === "AssignmentPattern")
    { this.checkPatternExport(exports, pat.left); }
  else if (type === "RestElement")
    { this.checkPatternExport(exports, pat.argument); }
};

pp$8.checkVariableExport = function(exports, decls) {
  if (!exports) { return }
  for (var i = 0, list = decls; i < list.length; i += 1)
    {
    var decl = list[i];

    this.checkPatternExport(exports, decl.id);
  }
};

pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
};

// Parses a comma-separated list of module exports.

pp$8.parseExportSpecifier = function(exports) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();

  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(
    exports,
    node.exported,
    node.exported.start
  );

  return this.finishNode(node, "ExportSpecifier")
};

pp$8.parseExportSpecifiers = function(exports) {
  var nodes = [], first = true;
  // export { x, y as z } [from '...']
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    nodes.push(this.parseExportSpecifier(exports));
  }
  return nodes
};

// Parses import declaration.

pp$8.parseImport = function(node) {
  this.next();

  // import '...'
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

// Parses a comma-separated list of module imports.

pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();

  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);

  return this.finishNode(node, "ImportSpecifier")
};

pp$8.parseImportDefaultSpecifier = function() {
  // import defaultObj, { x, y as z } from '...'
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier")
};

pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier")
};

pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) { return nodes }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    nodes.push(this.parseImportSpecifier());
  }
  return nodes
};

pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral
  }
  return this.parseIdent(true)
};

// Set `ExpressionStatement#directive` property for directive prologues.
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return (
    this.options.ecmaVersion >= 5 &&
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
};

var pp$7 = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
      if (this.inAsync && node.name === "await")
        { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
      break

    case "ObjectPattern":
    case "ArrayPattern":
    case "AssignmentPattern":
    case "RestElement":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.toAssignable(prop, isBinding);
        // Early error:
        //   AssignmentRestProperty[Yield, Await] :
        //     `...` DestructuringAssignmentTarget[Yield, Await]
        //
        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
        if (
          prop.type === "RestElement" &&
          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
        ) {
          this.raise(prop.argument.start, "Unexpected token");
        }
      }
      break

    case "Property":
      // AssignmentProperty has type === "Property"
      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
      this.toAssignable(node.value, isBinding);
      break

    case "ArrayExpression":
      node.type = "ArrayPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      this.toAssignableList(node.elements, isBinding);
      break

    case "SpreadElement":
      node.type = "RestElement";
      this.toAssignable(node.argument, isBinding);
      if (node.argument.type === "AssignmentPattern")
        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
      break

    case "AssignmentExpression":
      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
      node.type = "AssignmentPattern";
      delete node.operator;
      this.toAssignable(node.left, isBinding);
      break

    case "ParenthesizedExpression":
      this.toAssignable(node.expression, isBinding, refDestructuringErrors);
      break

    case "ChainExpression":
      this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (!isBinding) { break }

    default:
      this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  return node
};

// Convert list of expression atoms to binding list.

pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) { this.toAssignable(elt, isBinding); }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      { this.unexpected(last.argument.start); }
  }
  return exprList
};

// Parses spread element.

pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement")
};

pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
    { this.unexpected(); }

  node.argument = this.parseBindingAtom();

  return this.finishNode(node, "RestElement")
};

// Parses lvalue (assignable) atom.

pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
    case types$1.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(types$1.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case types$1.braceL:
      return this.parseObj(true)
    }
  }
  return this.parseIdent()
};

pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) { first = false; }
    else { this.expect(types$1.comma); }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
      this.expect(close);
      break
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts
};

pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem
};

pp$7.parseBindingListItem = function(param) {
  return param
};

// Parses assignment pattern around given atom if possible.

pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern")
};

// The following three functions all verify that a node is an lvalue —
// something that can be bound, or assigned to. In order to do so, they perform
// a variety of checks:
//
// - Check that none of the bound/assigned-to identifiers are reserved words.
// - Record name declarations for bindings in the appropriate scope.
// - Check duplicate argument names, if checkClashes is set.
//
// If a complex binding pattern is encountered (e.g., object and array
// destructuring), the entire pattern is recursively checked.
//
// There are three versions of checkLVal*() appropriate for different
// circumstances:
//
// - checkLValSimple() shall be used if the syntactic construct supports
//   nothing other than identifiers and member expressions. Parenthesized
//   expressions are also correctly handled. This is generally appropriate for
//   constructs for which the spec says
//
//   > It is a Syntax Error if AssignmentTargetType of [the production] is not
//   > simple.
//
//   It is also appropriate for checking if an identifier is valid and not
//   defined elsewhere, like import declarations or function/class identifiers.
//
//   Examples where this is used include:
//     a += …;
//     import a from '…';
//   where a is the node to be checked.
//
// - checkLValPattern() shall be used if the syntactic construct supports
//   anything checkLValSimple() supports, as well as object and array
//   destructuring patterns. This is generally appropriate for constructs for
//   which the spec says
//
//   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
//   > an ArrayLiteral and AssignmentTargetType of [the production] is not
//   > simple.
//
//   Examples where this is used include:
//     (a = …);
//     const a = …;
//     try { … } catch (a) { … }
//   where a is the node to be checked.
//
// - checkLValInnerPattern() shall be used if the syntactic construct supports
//   anything checkLValPattern() supports, as well as default assignment
//   patterns, rest elements, and other constructs that may appear within an
//   object or array destructuring pattern.
//
//   As a special case, function parameters also use checkLValInnerPattern(),
//   as they also support defaults and rest constructs.
//
// These functions deliberately support both assignment and binding constructs,
// as the logic for both is exceedingly similar. If the node is the target of
// an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
// should be set to the appropriate BIND_* constant, like BIND_VAR or
// BIND_LEXICAL.
//
// If the function is called with a non-BIND_NONE bindingType, then
// additionally a checkClashes object may be specified to allow checking for
// duplicate argument names. checkClashes is ignored if the provided construct
// is an assignment (i.e., bindingType is BIND_NONE).

pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  var isBind = bindingType !== BIND_NONE;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
    if (isBind) {
      if (bindingType === BIND_LEXICAL && expr.name === "let")
        { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
      if (checkClashes) {
        if (hasOwn(checkClashes, expr.name))
          { this.raiseRecoverable(expr.start, "Argument name clash"); }
        checkClashes[expr.name] = true;
      }
      if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
    }
    break

  case "ChainExpression":
    this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
    break

  case "MemberExpression":
    if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
    break

  case "ParenthesizedExpression":
    if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
    return this.checkLValSimple(expr.expression, bindingType, checkClashes)

  default:
    this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};

pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  switch (expr.type) {
  case "ObjectPattern":
    for (var i = 0, list = expr.properties; i < list.length; i += 1) {
      var prop = list[i];

    this.checkLValInnerPattern(prop, bindingType, checkClashes);
    }
    break

  case "ArrayPattern":
    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
      var elem = list$1[i$1];

    if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
    }
    break

  default:
    this.checkLValSimple(expr, bindingType, checkClashes);
  }
};

pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  switch (expr.type) {
  case "Property":
    // AssignmentProperty has type === "Property"
    this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
    break

  case "AssignmentPattern":
    this.checkLValPattern(expr.left, bindingType, checkClashes);
    break

  case "RestElement":
    this.checkLValPattern(expr.argument, bindingType, checkClashes);
    break

  default:
    this.checkLValPattern(expr, bindingType, checkClashes);
  }
};

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design


var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};

var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};

var pp$6 = Parser.prototype;

pp$6.initialContext = function() {
  return [types.b_stat]
};

pp$6.curContext = function() {
  return this.context[this.context.length - 1]
};

pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat)
    { return true }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
    { return !parent.isExpr }

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
    { return true }
  if (prevType === types$1.braceL)
    { return parent === types.b_stat }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
    { return false }
  return !this.exprAllowed
};

pp$6.inGeneratorContext = function() {
  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function")
      { return context.generator }
  }
  return false
};

pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot)
    { this.exprAllowed = false; }
  else if (update = type.updateContext)
    { update.call(this, prevType); }
  else
    { this.exprAllowed = type.beforeExpr; }
};

// Used to handle edge cases when token context could not be inferred correctly during tokenization phase

pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};

// Token-specific context update code

types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};

types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};

types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};

types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};

types$1.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
};

types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else &&
      !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
      !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
      !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
    { this.context.push(types.f_expr); }
  else
    { this.context.push(types.f_stat); }
  this.exprAllowed = false;
};

types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") { this.context.pop(); }
  this.exprAllowed = true;
};

types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl)
    { this.context.pop(); }
  else
    { this.context.push(types.q_tmpl); }
  this.exprAllowed = false;
};

types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr)
      { this.context[index] = types.f_expr_gen; }
    else
      { this.context[index] = types.f_gen; }
  }
  this.exprAllowed = true;
};

types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed ||
        this.value === "yield" && this.inGeneratorContext())
      { allowed = true; }
  }
  this.exprAllowed = allowed;
};

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


var pp$5 = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    { return }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    { return }
  var key = prop.key;
  var name;
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition)
      { this.raiseRecoverable(key.start, "Redefinition of property"); }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
  if (this.type === types$1.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) { return this.parseYield(forInit) }
    // The tokenizer will assume an expression is allowed after
    // `yield`, but this isn't that kind of yield
    else { this.exprAllowed = false; }
  }

  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }

  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq)
      { left = this.toAssignable(left, false, refDestructuringErrors); }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }
    if (refDestructuringErrors.shorthandAssign >= left.start)
      { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
    if (this.type === types$1.eq)
      { this.checkLValPattern(left); }
    else
      { this.checkLValSimple(left); }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  }
  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  return left
};

// Parse a ternary conditional (`?:`) operator.

pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  if (this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

// Start the precedence parser.

pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
        // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
    }
  }
  return left
};

pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
};

// Parse unary operators, both prefix and postfix.

pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) { this.checkLValSimple(node.argument); }
    else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
    else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
      { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
    else { sawUnary = true; }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
    expr = this.parsePrivateIdent();
    // only could be private fields in 'in', such as #x in obj
    if (this.type !== types$1._in) { this.unexpected(); }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }

  if (!incDec && this.eat(types$1.starstar)) {
    if (sawUnary)
      { this.unexpected(this.lastTokStart); }
    else
      { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
  } else {
    return expr
  }
};

function isLocalVariableAccess(node) {
  return (
    node.type === "Identifier" ||
    node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
  )
}

function isPrivateFieldAccess(node) {
  return (
    node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
    node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
    node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
  )
}

// Parse call, dot, and `[]`-subscript expressions.

pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
    { return expr }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
    if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
  }
  return result
};

pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
      this.potentialArrowAt === base.start;
  var optionalChained = false;

  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

    if (element.optional) { optionalChained = true; }
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element
    }

    base = element;
  }
};

pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow)
};

pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
};

pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

  var computed = this.eat(types$1.bracketL);
  if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0)
        { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({isTagged: true});
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  // If a division operator appears in an expression position, the
  // tokenizer got confused, and we force it to read a regexp instead.
  if (this.type === types$1.slash) { this.readRegexp(); }

  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
  case types$1._super:
    if (!this.allowSuper)
      { this.raise(this.start, "'super' keyword outside a method"); }
    node = this.startNode();
    this.next();
    if (this.type === types$1.parenL && !this.allowDirectSuper)
      { this.raise(node.start, "super() call outside constructor of a subclass"); }
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super ( Arguments )
    if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
      { this.unexpected(); }
    return this.finishNode(node, "Super")

  case types$1._this:
    node = this.startNode();
    this.next();
    return this.finishNode(node, "ThisExpression")

  case types$1.name:
    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
    var id = this.parseIdent(false);
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
      this.overrideContext(types.f_expr);
      return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
    }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(types$1.arrow))
        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
          (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
        id = this.parseIdent(false);
        if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
          { this.unexpected(); }
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
      }
    }
    return id

  case types$1.regexp:
    var value = this.value;
    node = this.parseLiteral(value.value);
    node.regex = {pattern: value.pattern, flags: value.flags};
    return node

  case types$1.num: case types$1.string:
    return this.parseLiteral(this.value)

  case types$1._null: case types$1._true: case types$1._false:
    node = this.startNode();
    node.value = this.type === types$1._null ? null : this.type === types$1._true;
    node.raw = this.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types$1.parenL:
    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        { refDestructuringErrors.parenthesizedAssign = start; }
      if (refDestructuringErrors.parenthesizedBind < 0)
        { refDestructuringErrors.parenthesizedBind = start; }
    }
    return expr

  case types$1.bracketL:
    node = this.startNode();
    this.next();
    node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
    return this.finishNode(node, "ArrayExpression")

  case types$1.braceL:
    this.overrideContext(types.b_expr);
    return this.parseObj(false, refDestructuringErrors)

  case types$1._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, 0)

  case types$1._class:
    return this.parseClass(this.startNode(), false)

  case types$1._new:
    return this.parseNew()

  case types$1.backQuote:
    return this.parseTemplate()

  case types$1._import:
    if (this.options.ecmaVersion >= 11) {
      return this.parseExprImport(forNew)
    } else {
      return this.unexpected()
    }

  default:
    return this.parseExprAtomDefault()
  }
};

pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};

pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();

  // Consume `import` as an identifier for `import.meta`.
  // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
  if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
  this.next();

  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node)
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node)
  } else {
    this.unexpected();
  }
};

pp$5.parseDynamicImport = function(node) {
  this.next(); // skip `(`

  // Parse node.source.
  node.source = this.parseMaybeAssign();

  // Verify ending.
  if (!this.eat(types$1.parenR)) {
    var errorPos = this.start;
    if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
      this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
    } else {
      this.unexpected(errorPos);
    }
  }

  return this.finishNode(node, "ImportExpression")
};

pp$5.parseImportMeta = function(node) {
  this.next(); // skip `.`

  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);

  if (node.property.name !== "meta")
    { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
  if (containsEsc)
    { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
    { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

  return this.finishNode(node, "MetaProperty")
};

pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1).replace(/_/g, ""); }
  this.next();
  return this.finishNode(node, "Literal")
};

pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val
};

pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon()
};

pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    // Do not save awaitIdentPos to allow checking awaits nested in parameters
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(
            this.start,
            "Comma is not permitted after the rest element"
          );
        }
        break
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);

    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
    }

    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
    if (spreadStart) { this.unexpected(spreadStart); }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
};

pp$5.parseParenItem = function(item) {
  return item
};

pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty = [];

pp$5.parseNew = function() {
  if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
    if (!this.allowNewDotTarget)
      { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
  else { node.arguments = empty; }
  return this.finishNode(node, "NewExpression")
};

// Parse template expression.

pp$5.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;

  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, "\n"),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

pp$5.parseTemplate = function(ref) {
  if ( ref === void 0 ) ref = {};
  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({isTagged: isTagged});
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral")
};

pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

// Parse an object literal or binding pattern.

pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
};

pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement")
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern)
      { isGenerator = this.eat(types$1.star); }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property")
};

pp$5.parseGetterSetter = function(prop) {
  prop.kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get")
      { this.raiseRecoverable(start, "getter should have no params"); }
    else
      { this.raiseRecoverable(start, "setter should have exactly one param"); }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
      { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
  }
};

pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon)
    { this.unexpected(); }

  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) { this.unexpected(); }
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) { this.unexpected(); }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) { this.unexpected(); }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos)
      { this.awaitIdentPos = startPos; }
    prop.kind = "init";
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        { refDestructuringErrors.shorthandAssign = this.start; }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.shorthand = true;
  } else { this.unexpected(); }
};

pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
};

// Initialize empty function node.

pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
  if (this.options.ecmaVersion >= 8) { node.async = false; }
};

// Parse object or class method.

pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression")
};

// Parse arrow function expression with given parameters.

pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;

  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression")
};

// Parse function body and check parameters.

pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) { this.strict = true; }

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
    node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};

pp$5.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1)
    {
    var param = list[i];

    if (param.type !== "Identifier") { return false
  } }
  return true
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = Object.create(null);
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) { break }
    } else { first = false; }

    var elt = (void 0);
    if (allowEmpty && this.type === types$1.comma)
      { elt = null; }
    else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
        { refDestructuringErrors.trailingComma = this.start; }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts
};

pp$5.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;

  if (this.inGenerator && name === "yield")
    { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
  if (this.inAsync && name === "await")
    { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
  if (this.currentThisScope().inClassFieldInit && name === "arguments")
    { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
    { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
  if (this.keywords.test(name))
    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") !== -1) { return }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  }
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos)
      { this.awaitIdentPos = node.start; }
  }
  return node
};

pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
      (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node
};

pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");

  // For validating existence
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }

  return node
};

// Parses yield expression inside generator.

pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) { this.yieldPos = this.start; }

  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression")
};

pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) { this.awaitPos = this.start; }

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression")
};

var pp$4 = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  throw err
};

pp$4.raiseRecoverable = pp$4.raise;

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
};

var pp$3 = Parser.prototype;

var Scope = function Scope(flags) {
  this.flags = flags;
  // A list of var-declared names in the current lexical scope
  this.var = [];
  // A list of lexically-declared names in the current lexical scope
  this.lexical = [];
  // A list of lexically-declared FunctionDeclaration names in the current lexical scope
  this.functions = [];
  // A switch to disallow the identifier reference 'arguments'
  this.inClassFieldInit = false;
};

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};

pp$3.exitScope = function() {
  this.scopeStack.pop();
};

// The spec says:
// > At the top level of a function, or script, function declarations are
// > treated like var declarations rather than like lexical declarations.
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
};

pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && (scope.flags & SCOPE_TOP))
      { delete this.undefinedExports[name]; }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar)
      { redeclared = scope$2.lexical.indexOf(name) > -1; }
    else
      { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
    scope$2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
      var scope$3 = this.scopeStack[i];
      if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
          !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break
      }
      scope$3.var.push(name);
      if (this.inModule && (scope$3.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
      if (scope$3.flags & SCOPE_VAR) { break }
    }
  }
  if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
};

pp$3.checkLocalExport = function(id) {
  // scope.functions must be empty as Module code is always strict.
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};

pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1]
};

pp$3.currentVarScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & SCOPE_VAR) { return scope }
  }
};

// Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
pp$3.currentThisScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
  }
};

var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations)
    { this.loc = new SourceLocation(parser, loc); }
  if (parser.options.directSourceFile)
    { this.sourceFile = parser.options.directSourceFile; }
  if (parser.options.ranges)
    { this.range = [pos, 0]; }
};

// Start an AST node, attaching a start offset.

var pp$2 = Parser.prototype;

pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc)
};

pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations)
    { node.loc.end = loc; }
  if (this.options.ranges)
    { node.range[1] = pos; }
  return node
}

pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
};

// Finish node at given position

pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
};

pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) { newNode[prop] = node[prop]; }
  return newNode
};

// This file contains Unicode properties extracted from the ECMAScript specification.
// The lists are extracted like so:
// $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

// #table-binary-unicode-properties
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;

var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};

// #table-binary-unicode-properties-of-strings
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};

// #table-unicode-general-category-values
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

// #table-unicode-script-values
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " Hrkt Katakana_Or_Hiragana Kawi Nag_Mundari Nagm Unknown Zzzz";

var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};

var data = {};
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;

  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}

for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  var ecmaVersion = list[i];

  buildUnicodeData(ecmaVersion);
}

var pp$1 = Parser.prototype;

// Track disjunction structure to determine whether a duplicate
// capture group name is allowed because it is in a separate branch.
var BranchID = function BranchID(parent, base) {
  // Parent disjunction branch
  this.parent = parent;
  // Identifies this set of sibling branches
  this.base = base || this;
};

BranchID.prototype.separatedFrom = function separatedFrom (alt) {
  // A branch is separate from another branch if they or any of
  // their parents are siblings in a given disjunction
  for (var self = this; self; self = self.parent) {
    for (var other = alt; other; other = other.parent) {
      if (self.base === other.base && self !== other) { return true }
    }
  }
  return false
};

BranchID.prototype.sibling = function sibling () {
  return new BranchID(this.parent, this.base)
};

var RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
};

RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
};

RegExpValidationState.prototype.raise = function raise (message) {
  this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
};

// If u flag is given, this returns the code point at the index (it combines a surrogate pair).
// Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
RegExpValidationState.prototype.at = function at (i, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1
  }
  var c = s.charCodeAt(i);
  if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
    return c
  }
  var next = s.charCodeAt(i + 1);
  return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
};

RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l
  }
  var c = s.charCodeAt(i), next;
  if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
      (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
    return i + 1
  }
  return i + 2
};

RegExpValidationState.prototype.current = function current (forceU) {
    if ( forceU === void 0 ) forceU = false;

  return this.at(this.pos, forceU)
};

RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
    if ( forceU === void 0 ) forceU = false;

  return this.at(this.nextIndex(this.pos, forceU), forceU)
};

RegExpValidationState.prototype.advance = function advance (forceU) {
    if ( forceU === void 0 ) forceU = false;

  this.pos = this.nextIndex(this.pos, forceU);
};

RegExpValidationState.prototype.eat = function eat (ch, forceU) {
    if ( forceU === void 0 ) forceU = false;

  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true
  }
  return false
};

RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var pos = this.pos;
  for (var i = 0, list = chs; i < list.length; i += 1) {
    var ch = list[i];

      var current = this.at(pos, forceU);
    if (current === -1 || current !== ch) {
      return false
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true
};

/**
 * Validate the flags part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;

  var u = false;
  var v = false;

  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") { u = true; }
    if (flag === "v") { v = true; }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};

function hasProp(obj) {
  for (var _ in obj) { return true }
  return false
}

/**
 * Validate the pattern part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);

  // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
  // parsing contains a |GroupName|, reparse with the goal symbol
  // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
  // exception if _P_ did not conform to the grammar, if any elements of _P_
  // were not matched by the parse, or if any Early Error conditions exist.
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;

  this.regexp_disjunction(state);

  if (state.pos !== state.source.length) {
    // Make the same messages as V8.
    if (state.eat(0x29 /* ) */)) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];

    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
  this.regexp_alternative(state);
  while (state.eat(0x7C /* | */)) {
    if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) { state.branchID = state.branchID.parent; }

  // Make the same message as V8.
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(0x7B /* { */)) {
    state.raise("Lone quantifier brackets");
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    // Handle `QuantifiableAssertion Quantifier` alternative.
    // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
    // is a QuantifiableAssertion.
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      // Make the same message as V8.
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true
  }

  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;

  // ^, $
  if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
    return true
  }

  // \b \B
  if (state.eat(0x5C /* \ */)) {
    if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
      return true
    }
    state.pos = start;
  }

  // Lookahead / Lookbehind
  if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(0x3C /* < */);
    }
    if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
      this.regexp_disjunction(state);
      if (!state.eat(0x29 /* ) */)) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true
    }
  }

  state.pos = start;
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
pp$1.regexp_eatQuantifier = function(state, noError) {
  if ( noError === void 0 ) noError = false;

  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(0x3F /* ? */);
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return (
    state.eat(0x2A /* * */) ||
    state.eat(0x2B /* + */) ||
    state.eat(0x3F /* ? */) ||
    this.regexp_eatBracedQuantifier(state, noError)
  )
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(0x7B /* { */)) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(0x7D /* } */)) {
        // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
pp$1.regexp_eatAtom = function(state) {
  return (
    this.regexp_eatPatternCharacters(state) ||
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state)
  )
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatAtomEscape(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(0x28 /* ( */)) {
    if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        return true
      }
      state.raise("Unterminated group");
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(0x28 /* ( */)) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 0x3F /* ? */) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(0x29 /* ) */)) {
      state.numCapturingParens += 1;
      return true
    }
    state.raise("Unterminated group");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
pp$1.regexp_eatExtendedAtom = function(state) {
  return (
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state) ||
    this.regexp_eatInvalidBracedQuantifier(state) ||
    this.regexp_eatExtendedPatternCharacter(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};
function isSyntaxCharacter(ch) {
  return (
    ch === 0x24 /* $ */ ||
    ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
    ch === 0x2E /* . */ ||
    ch === 0x3F /* ? */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
// But eat eager.
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (
    ch !== -1 &&
    ch !== 0x24 /* $ */ &&
    !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
    ch !== 0x2E /* . */ &&
    ch !== 0x3F /* ? */ &&
    ch !== 0x5B /* [ */ &&
    ch !== 0x5E /* ^ */ &&
    ch !== 0x7C /* | */
  ) {
    state.advance();
    return true
  }
  return false
};

// GroupSpecifier ::
//   [empty]
//   `?` GroupName
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(0x3F /* ? */)) {
    if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i = 0, list = known; i < list.length; i += 1) {
          var altID = list[i];

          if (!altID.separatedFrom(state.branchID))
            { state.raise("Duplicate capture group name"); }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};

// GroupName ::
//   `<` RegExpIdentifierName `>`
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(0x3C /* < */)) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
      return true
    }
    state.raise("Invalid capture group name");
  }
  return false
};

// RegExpIdentifierName ::
//   RegExpIdentifierStart
//   RegExpIdentifierName RegExpIdentifierPart
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true
  }
  return false
};

// RegExpIdentifierStart ::
//   UnicodeIDStart
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[+U]
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
}

// RegExpIdentifierPart ::
//   UnicodeIDContinue
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[+U]
//   <ZWNJ>
//   <ZWJ>
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
pp$1.regexp_eatAtomEscape = function(state) {
  if (
    this.regexp_eatBackReference(state) ||
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state) ||
    (state.switchN && this.regexp_eatKGroupName(state))
  ) {
    return true
  }
  if (state.switchU) {
    // Make the same message as V8.
    if (state.current() === 0x63 /* c */) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true
    }
    if (n <= state.numCapturingParens) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(0x6B /* k */)) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true
    }
    state.raise("Invalid named reference");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
pp$1.regexp_eatCharacterEscape = function(state) {
  return (
    this.regexp_eatControlEscape(state) ||
    this.regexp_eatCControlLetter(state) ||
    this.regexp_eatZero(state) ||
    this.regexp_eatHexEscapeSequence(state) ||
    this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
    (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
    this.regexp_eatIdentityEscape(state)
  )
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(0x63 /* c */)) {
    if (this.regexp_eatControlLetter(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 0x74 /* t */) {
    state.lastIntValue = 0x09; /* \t */
    state.advance();
    return true
  }
  if (ch === 0x6E /* n */) {
    state.lastIntValue = 0x0A; /* \n */
    state.advance();
    return true
  }
  if (ch === 0x76 /* v */) {
    state.lastIntValue = 0x0B; /* \v */
    state.advance();
    return true
  }
  if (ch === 0x66 /* f */) {
    state.lastIntValue = 0x0C; /* \f */
    state.advance();
    return true
  }
  if (ch === 0x72 /* r */) {
    state.lastIntValue = 0x0D; /* \r */
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};
function isControlLetter(ch) {
  return (
    (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
    (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if ( forceU === void 0 ) forceU = false;

  var start = state.pos;
  var switchU = forceU || state.switchU;

  if (state.eat(0x75 /* u */)) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 0xDC00 && trail <= 0xDFFF) {
            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
            return true
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true
    }
    if (
      switchU &&
      state.eat(0x7B /* { */) &&
      this.regexp_eatHexDigits(state) &&
      state.eat(0x7D /* } */) &&
      isValidUnicode(state.lastIntValue)
    ) {
      return true
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }

  return false
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 0x10FFFF
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true
    }
    if (state.eat(0x2F /* / */)) {
      state.lastIntValue = 0x2F; /* / */
      return true
    }
    return false
  }

  var ch = state.current();
  if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
    return true
  }
  return false
};

// Return values used by character set parsing methods, needed to
// forbid negation of sets that can match strings.
var CharSetNone = 0; // Nothing parsed
var CharSetOk = 1; // Construct parsed, cannot contain strings
var CharSetString = 2; // Construct parsed, can contain strings

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();

  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk
  }

  var negate = false;
  if (
    state.switchU &&
    this.options.ecmaVersion >= 9 &&
    ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
  ) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (
      state.eat(0x7B /* { */) &&
      (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
      state.eat(0x7D /* } */)
    ) {
      if (negate && result === CharSetString) { state.raise("Invalid property name"); }
      return result
    }
    state.raise("Invalid property name");
  }

  return CharSetNone
};

function isCharacterClassEscape(ch) {
  return (
    ch === 0x64 /* d */ ||
    ch === 0x44 /* D */ ||
    ch === 0x73 /* s */ ||
    ch === 0x53 /* S */ ||
    ch === 0x77 /* w */ ||
    ch === 0x57 /* W */
  )
}

// UnicodePropertyValueExpression ::
//   UnicodePropertyName `=` UnicodePropertyValue
//   LoneUnicodePropertyNameOrValue
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;

  // UnicodePropertyName `=` UnicodePropertyValue
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk
    }
  }
  state.pos = start;

  // LoneUnicodePropertyNameOrValue
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
  }
  return CharSetNone
};

pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name))
    { state.raise("Invalid property name"); }
  if (!state.unicodeProperties.nonBinary[name].test(value))
    { state.raise("Invalid property value"); }
};

pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
  state.raise("Invalid property name");
};

// UnicodePropertyName ::
//   UnicodePropertyNameCharacters
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};

function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 0x5F /* _ */
}

// UnicodePropertyValue ::
//   UnicodePropertyValueCharacters
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
}

// LoneUnicodePropertyNameOrValue ::
//   UnicodePropertyValueCharacters
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state)
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(0x5B /* [ */)) {
    var negate = state.eat(0x5E /* ^ */);
    var result = this.regexp_classContents(state);
    if (!state.eat(0x5D /* ] */))
      { state.raise("Unterminated character class"); }
    if (negate && result === CharSetString)
      { state.raise("Negated character class may contain strings"); }
    return true
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassContents
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
pp$1.regexp_classContents = function(state) {
  if (state.current() === 0x5D /* ] */) { return CharSetOk }
  if (state.switchV) { return this.regexp_classSetExpression(state) }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;

  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatClassEscape(state)) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      var ch$1 = state.current();
      if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }

  var ch = state.current();
  if (ch !== 0x5D /* ] */) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;

  if (state.eat(0x62 /* b */)) {
    state.lastIntValue = 0x08; /* <BS> */
    return true
  }

  if (state.switchU && state.eat(0x2D /* - */)) {
    state.lastIntValue = 0x2D; /* - */
    return true
  }

  if (!state.switchU && state.eat(0x63 /* c */)) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true
    }
    state.pos = start;
  }

  return (
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state)
  )
};

// https://tc39.es/ecma262/#prod-ClassSetExpression
// https://tc39.es/ecma262/#prod-ClassUnion
// https://tc39.es/ecma262/#prod-ClassIntersection
// https://tc39.es/ecma262/#prod-ClassSubtraction
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) { result = CharSetString; }
    // https://tc39.es/ecma262/#prod-ClassIntersection
    var start = state.pos;
    while (state.eatChars([0x26, 0x26] /* && */)) {
      if (
        state.current() !== 0x26 /* & */ &&
        (subResult = this.regexp_eatClassSetOperand(state))
      ) {
        if (subResult !== CharSetString) { result = CharSetOk; }
        continue
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) { return result }
    // https://tc39.es/ecma262/#prod-ClassSubtraction
    while (state.eatChars([0x2D, 0x2D] /* -- */)) {
      if (this.regexp_eatClassSetOperand(state)) { continue }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) { return result }
  } else {
    state.raise("Invalid character in character class");
  }
  // https://tc39.es/ecma262/#prod-ClassUnion
  for (;;) {
    if (this.regexp_eatClassSetRange(state)) { continue }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) { return result }
    if (subResult === CharSetString) { result = CharSetString; }
  }
};

// https://tc39.es/ecma262/#prod-ClassSetRange
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true
    }
    state.pos = start;
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassSetOperand
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
};

// https://tc39.es/ecma262/#prod-NestedClass
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(0x5B /* [ */)) {
    var negate = state.eat(0x5E /* ^ */);
    var result = this.regexp_classContents(state);
    if (state.eat(0x5D /* ] */)) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result
    }
    state.pos = start;
  }
  if (state.eat(0x5C /* \ */)) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1
    }
    state.pos = start;
  }
  return null
};

// https://tc39.es/ecma262/#prod-ClassStringDisjunction
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars([0x5C, 0x71] /* \q */)) {
    if (state.eat(0x7B /* { */)) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(0x7D /* } */)) {
        return result
      }
    } else {
      // Make the same message as V8.
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null
};

// https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(0x7C /* | */)) {
    if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
  }
  return result
};

// https://tc39.es/ecma262/#prod-ClassString
// https://tc39.es/ecma262/#prod-NonEmptyClassString
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) { count++; }
  return count === 1 ? CharSetOk : CharSetString
};

// https://tc39.es/ecma262/#prod-ClassSetCharacter
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (
      this.regexp_eatCharacterEscape(state) ||
      this.regexp_eatClassSetReservedPunctuator(state)
    ) {
      return true
    }
    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }
    state.pos = start;
    return false
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
  if (isClassSetSyntaxCharacter(ch)) { return false }
  state.advance();
  state.lastIntValue = ch;
  return true
};

// https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return (
    ch === 0x21 /* ! */ ||
    ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
    ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
    ch === 0x2E /* . */ ||
    ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
    ch === 0x5E /* ^ */ ||
    ch === 0x60 /* ` */ ||
    ch === 0x7E /* ~ */
  )
}

// https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
function isClassSetSyntaxCharacter(ch) {
  return (
    ch === 0x28 /* ( */ ||
    ch === 0x29 /* ) */ ||
    ch === 0x2D /* - */ ||
    ch === 0x2F /* / */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
function isClassSetReservedPunctuator(ch) {
  return (
    ch === 0x21 /* ! */ ||
    ch === 0x23 /* # */ ||
    ch === 0x25 /* % */ ||
    ch === 0x26 /* & */ ||
    ch === 0x2C /* , */ ||
    ch === 0x2D /* - */ ||
    ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
    ch === 0x40 /* @ */ ||
    ch === 0x60 /* ` */ ||
    ch === 0x7E /* ~ */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(0x78 /* x */)) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
    state.advance();
  }
  return state.pos !== start
};
function isDecimalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start
};
function isHexDigit(ch) {
  return (
    (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
    (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
    (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
  )
}
function hexToInt(ch) {
  if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
    return 10 + (ch - 0x41 /* A */)
  }
  if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
    return 10 + (ch - 0x61 /* a */)
  }
  return ch - 0x30 /* 0 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
// Allows only 0-377(octal) i.e. 0-255(decimal).
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 0x30; /* 0 */
    state.advance();
    return true
  }
  state.lastIntValue = 0;
  return false
};
function isOctalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
// And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true
};

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations)
    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  if (p.options.ranges)
    { this.range = [p.start, p.end]; }
};

// ## Tokenizer

var pp = Parser.prototype;

// Move to the next token

pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
    { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
  if (this.options.onToken)
    { this.options.onToken(new Token(this)); }

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp.getToken = function() {
  this.next();
  return new Token(this)
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  { pp[Symbol.iterator] = function() {
    var this$1$1 = this;

    return {
      next: function () {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        }
      }
    }
  }; }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

// Read a single token, updating the parser object's token-related
// properties.

pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  this.start = this.pos;
  if (this.options.locations) { this.startLoc = this.curPosition(); }
  if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

  if (curContext.override) { return curContext.override(this) }
  else { this.readToken(this.fullCharCodeAtPos()); }
};

pp.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    { return this.readWord() }

  return this.getTokenFromCode(code)
};

pp.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xdc00) { return code }
  var next = this.input.charCodeAt(this.pos + 1);
  return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
};

pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment)
    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition()); }
};

pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment)
    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition()); }
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp.skipSpace = function() {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
    case 32: case 160: // ' '
      ++this.pos;
      break
    case 13:
      if (this.input.charCodeAt(this.pos + 1) === 10) {
        ++this.pos;
      }
    case 10: case 8232: case 8233:
      ++this.pos;
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      break
    case 47: // '/'
      switch (this.input.charCodeAt(this.pos + 1)) {
      case 42: // '*'
        this.skipBlockComment();
        break
      case 47:
        this.skipLineComment(2);
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this.pos;
      } else {
        break loop
      }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) { this.endLoc = this.curPosition(); }
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) { return this.readNumber(true) }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(types$1.ellipsis)
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot)
  }
};

pp.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.slash, 1)
};

pp.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
  return this.finishOp(tokentype, size)
};

pp.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
  }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
};

pp.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.bitwiseXOR, 1)
};

pp.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken()
    }
    return this.finishOp(types$1.incDec, 2)
  }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.plusMin, 1)
};

pp.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(types$1.bitShift, size)
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
      this.input.charCodeAt(this.pos + 3) === 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken()
  }
  if (next === 61) { size = 2; }
  return this.finishOp(types$1.relational, size)
};

pp.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2;
    return this.finishToken(types$1.arrow)
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
};

pp.readToken_question = function() { // '?'
  var ecmaVersion = this.options.ecmaVersion;
  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(types$1.coalesce, 2)
    }
  }
  return this.finishOp(types$1.question, 1)
};

pp.readToken_numberSign = function() { // '#'
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35; // '#'
  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
      return this.finishToken(types$1.privateId, this.readWord1())
    }
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.getTokenFromCode = function(code) {
  switch (code) {
  // The interpretation of a dot depends on whether it is followed
  // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(types$1.parenL)
  case 41: ++this.pos; return this.finishToken(types$1.parenR)
  case 59: ++this.pos; return this.finishToken(types$1.semi)
  case 44: ++this.pos; return this.finishToken(types$1.comma)
  case 91: ++this.pos; return this.finishToken(types$1.bracketL)
  case 93: ++this.pos; return this.finishToken(types$1.bracketR)
  case 123: ++this.pos; return this.finishToken(types$1.braceL)
  case 125: ++this.pos; return this.finishToken(types$1.braceR)
  case 58: ++this.pos; return this.finishToken(types$1.colon)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) { break }
    ++this.pos;
    return this.finishToken(types$1.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.
  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 63: // '?'
    return this.readToken_question()

  case 126: // '~'
    return this.finishOp(types$1.prefix, 1)

  case 35: // '#'
    return this.readToken_numberSign()
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str)
};

pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
    if (!escaped) {
      if (ch === "[") { inClass = true; }
      else if (ch === "]" && inClass) { inClass = false; }
      else if (ch === "/" && !inClass) { break }
      escaped = ch === "\\";
    } else { escaped = false; }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) { this.unexpected(flagsStart); }

  // Validate pattern
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);

  // Create Literal#value property value.
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
    // ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  // `len` is used for character escape sequences. In that case, disallow separators.
  var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

  // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
  // and isn't fraction part nor exponent part. In that case, if the first digit
  // is zero then disallow separators.
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

  var start = this.pos, total = 0, lastCode = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = (void 0);

    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
      if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
      if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
      lastCode = code;
      continue
    }

    if (code >= 97) { val = code - 97 + 10; } // a
    else if (code >= 65) { val = code - 65 + 10; } // A
    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
    else { val = Infinity; }
    if (val >= radix) { break }
    lastCode = code;
    total = total * radix + val;
  }

  if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
  if (this.pos === start || len != null && this.pos - start !== len) { return null }

  return total
};

function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8)
  }

  // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
  return parseFloat(str.replace(/_/g, ""))
}

function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null
  }

  // `BigInt(value)` throws syntax error if the string contains numeric separators.
  return BigInt(str.replace(/_/g, ""))
}

pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  return this.finishToken(types$1.num, val)
};

// Read an integer, octal integer, or floating-point number.

pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) { this.raise(start, "Invalid number"); }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val$1)
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  if (next === 46 && !octal) { // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) { ++this.pos; } // '+-'
    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val)
};

// Read a string value, interpreting backslash-escapes.

pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) { this.unexpected(); }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  } else {
    code = this.readHexChar(4);
  }
  return code
};

pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) { break }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 0x2028 || ch === 0x2029) {
      if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out)
};

// Reads template string tokens.

var INVALID_TEMPLATE_ESCAPE_ERROR = {};

pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err
    }
  }

  this.inTemplateElement = false;
};

pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message);
  }
};

pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL)
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote)
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out)
    }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
      case 10:
        out += "\n";
        break
      default:
        out += String.fromCharCode(ch);
        break
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};

// Reads a template token to search for the end, without validating any escape sequences
pp.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
    case "\\":
      ++this.pos;
      break

    case "$":
      if (this.input[this.pos + 1] !== "{") { break }
      // fall through
    case "`":
      return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

    case "\r":
      if (this.input[this.pos + 1] === "\n") { ++this.pos; }
      // fall through
    case "\n": case "\u2028": case "\u2029":
      ++this.curLine;
      this.lineStart = this.pos + 1;
      break
    }
  }
  this.raise(this.start, "Unterminated template");
};

// Used to read escaped characters

pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
    return ""
  case 56:
  case 57:
    if (this.strict) {
      this.invalidStringToken(
        this.pos - 1,
        "Invalid escape sequence"
      );
    }
    if (inTemplate) {
      var codePos = this.pos - 1;

      this.invalidStringToken(
        codePos,
        "Invalid escape sequence in template string"
      );
    }
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
      var octal = parseInt(octalStr, 8);
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1);
        octal = parseInt(octalStr, 8);
      }
      this.pos += octalStr.length - 1;
      ch = this.input.charCodeAt(this.pos);
      if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(
          this.pos - 1 - octalStr.length,
          inTemplate
            ? "Octal literal in template string"
            : "Octal literal in strict mode"
        );
      }
      return String.fromCharCode(octal)
    }
    if (isNewLine(ch)) {
      // Unicode new line characters after \ get removed from output in both
      // template literals and strings
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    }
    return String.fromCharCode(ch)
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  return n
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) { // "\"
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) // "u"
        { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos)
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word)
};

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/acornjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/acornjs/acorn/issues
//
// [walk]: util/walk.js


var version = "8.12.0";

Parser.acorn = {
  Parser: Parser,
  version: version,
  defaultOptions: defaultOptions,
  Position: Position,
  SourceLocation: SourceLocation,
  getLineInfo: getLineInfo,
  Node: Node,
  TokenType: TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext: TokContext,
  tokContexts: types,
  isIdentifierChar: isIdentifierChar,
  isIdentifierStart: isIdentifierStart,
  Token: Token,
  isNewLine: isNewLine,
  lineBreak: lineBreak,
  lineBreakG: lineBreakG,
  nonASCIIwhitespace: nonASCIIwhitespace
};

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and returns
// an abstract syntax tree as specified by the [ESTree spec][estree].
//
// [estree]: https://github.com/estree/estree

function parse(input, options) {
  return Parser.parse(input, options)
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  return Parser.parseExpressionAt(input, pos, options)
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return Parser.tokenizer(input, options)
}




}),
"./node_modules/.pnpm/countries-list@3.1.1/node_modules/countries-list/mjs/index.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  continents: function() { return u; },
  countries: function() { return a; },
  getCountryCode: function() { return m; },
  getCountryData: function() { return c; },
  getCountryDataList: function() { return t; },
  getEmojiFlag: function() { return h; },
  languages: function() { return s; }
});
/*! countries-list v3.1.1 by Annexare | MIT */
var u={AF:"Africa",AN:"Antarctica",AS:"Asia",EU:"Europe",NA:"North America",OC:"Oceania",SA:"South America"};var a={AD:{name:"Andorra",native:"Andorra",phone:[376],continent:"EU",capital:"Andorra la Vella",currency:["EUR"],languages:["ca"]},AE:{name:"United Arab Emirates",native:"\u062F\u0648\u0644\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629",phone:[971],continent:"AS",capital:"Abu Dhabi",currency:["AED"],languages:["ar"]},AF:{name:"Afghanistan",native:"\u0627\u0641\u063A\u0627\u0646\u0633\u062A\u0627\u0646",phone:[93],continent:"AS",capital:"Kabul",currency:["AFN"],languages:["ps","uz","tk"]},AG:{name:"Antigua and Barbuda",native:"Antigua and Barbuda",phone:[1268],continent:"NA",capital:"Saint John's",currency:["XCD"],languages:["en"]},AI:{name:"Anguilla",native:"Anguilla",phone:[1264],continent:"NA",capital:"The Valley",currency:["XCD"],languages:["en"]},AL:{name:"Albania",native:"Shqip\xEBria",phone:[355],continent:"EU",capital:"Tirana",currency:["ALL"],languages:["sq"]},AM:{name:"Armenia",native:"\u0540\u0561\u0575\u0561\u057D\u057F\u0561\u0576",phone:[374],continent:"AS",capital:"Yerevan",currency:["AMD"],languages:["hy","ru"]},AO:{name:"Angola",native:"Angola",phone:[244],continent:"AF",capital:"Luanda",currency:["AOA"],languages:["pt"]},AQ:{name:"Antarctica",native:"Antarctica",phone:[672],continent:"AN",capital:"",currency:[],languages:[]},AR:{name:"Argentina",native:"Argentina",phone:[54],continent:"SA",capital:"Buenos Aires",currency:["ARS"],languages:["es","gn"]},AS:{name:"American Samoa",native:"American Samoa",phone:[1684],continent:"OC",capital:"Pago Pago",currency:["USD"],languages:["en","sm"]},AT:{name:"Austria",native:"\xD6sterreich",phone:[43],continent:"EU",capital:"Vienna",currency:["EUR"],languages:["de"]},AU:{name:"Australia",native:"Australia",phone:[61],continent:"OC",capital:"Canberra",currency:["AUD"],languages:["en"]},AW:{name:"Aruba",native:"Aruba",phone:[297],continent:"NA",capital:"Oranjestad",currency:["AWG"],languages:["nl","pa"]},AX:{name:"Aland",native:"\xC5land",phone:[358],continent:"EU",capital:"Mariehamn",currency:["EUR"],languages:["sv"],partOf:"FI"},AZ:{name:"Azerbaijan",native:"Az\u0259rbaycan",phone:[994],continent:"AS",continents:["AS","EU"],capital:"Baku",currency:["AZN"],languages:["az"]},BA:{name:"Bosnia and Herzegovina",native:"Bosna i Hercegovina",phone:[387],continent:"EU",capital:"Sarajevo",currency:["BAM"],languages:["bs","hr","sr"]},BB:{name:"Barbados",native:"Barbados",phone:[1246],continent:"NA",capital:"Bridgetown",currency:["BBD"],languages:["en"]},BD:{name:"Bangladesh",native:"Bangladesh",phone:[880],continent:"AS",capital:"Dhaka",currency:["BDT"],languages:["bn"]},BE:{name:"Belgium",native:"Belgi\xEB",phone:[32],continent:"EU",capital:"Brussels",currency:["EUR"],languages:["nl","fr","de"]},BF:{name:"Burkina Faso",native:"Burkina Faso",phone:[226],continent:"AF",capital:"Ouagadougou",currency:["XOF"],languages:["fr","ff"]},BG:{name:"Bulgaria",native:"\u0411\u044A\u043B\u0433\u0430\u0440\u0438\u044F",phone:[359],continent:"EU",capital:"Sofia",currency:["BGN"],languages:["bg"]},BH:{name:"Bahrain",native:"\u200F\u0627\u0644\u0628\u062D\u0631\u064A\u0646",phone:[973],continent:"AS",capital:"Manama",currency:["BHD"],languages:["ar"]},BI:{name:"Burundi",native:"Burundi",phone:[257],continent:"AF",capital:"Bujumbura",currency:["BIF"],languages:["fr","rn"]},BJ:{name:"Benin",native:"B\xE9nin",phone:[229],continent:"AF",capital:"Porto-Novo",currency:["XOF"],languages:["fr"]},BL:{name:"Saint Barthelemy",native:"Saint-Barth\xE9lemy",phone:[590],continent:"NA",capital:"Gustavia",currency:["EUR"],languages:["fr"]},BM:{name:"Bermuda",native:"Bermuda",phone:[1441],continent:"NA",capital:"Hamilton",currency:["BMD"],languages:["en"]},BN:{name:"Brunei",native:"Negara Brunei Darussalam",phone:[673],continent:"AS",capital:"Bandar Seri Begawan",currency:["BND"],languages:["ms"]},BO:{name:"Bolivia",native:"Bolivia",phone:[591],continent:"SA",capital:"Sucre",currency:["BOB","BOV"],languages:["es","ay","qu"]},BQ:{name:"Bonaire",native:"Bonaire",phone:[5997],continent:"NA",capital:"Kralendijk",currency:["USD"],languages:["nl"]},BR:{name:"Brazil",native:"Brasil",phone:[55],continent:"SA",capital:"Bras\xEDlia",currency:["BRL"],languages:["pt"]},BS:{name:"Bahamas",native:"Bahamas",phone:[1242],continent:"NA",capital:"Nassau",currency:["BSD"],languages:["en"]},BT:{name:"Bhutan",native:"\u02BCbrug-yul",phone:[975],continent:"AS",capital:"Thimphu",currency:["BTN","INR"],languages:["dz"]},BV:{name:"Bouvet Island",native:"Bouvet\xF8ya",phone:[47],continent:"AN",capital:"",currency:["NOK"],languages:["no","nb","nn"]},BW:{name:"Botswana",native:"Botswana",phone:[267],continent:"AF",capital:"Gaborone",currency:["BWP"],languages:["en","tn"]},BY:{name:"Belarus",native:"\u0411\u0435\u043B\u0430\u0440\u0443\u0301\u0441\u044C",phone:[375],continent:"EU",capital:"Minsk",currency:["BYN"],languages:["be","ru"]},BZ:{name:"Belize",native:"Belize",phone:[501],continent:"NA",capital:"Belmopan",currency:["BZD"],languages:["en","es"]},CA:{name:"Canada",native:"Canada",phone:[1],continent:"NA",capital:"Ottawa",currency:["CAD"],languages:["en","fr"]},CC:{name:"Cocos (Keeling) Islands",native:"Cocos (Keeling) Islands",phone:[61],continent:"AS",capital:"West Island",currency:["AUD"],languages:["en"]},CD:{name:"Democratic Republic of the Congo",native:"R\xE9publique d\xE9mocratique du Congo",phone:[243],continent:"AF",capital:"Kinshasa",currency:["CDF"],languages:["fr","ln","kg","sw","lu"]},CF:{name:"Central African Republic",native:"K\xF6d\xF6r\xF6s\xEAse t\xEE B\xEAafr\xEEka",phone:[236],continent:"AF",capital:"Bangui",currency:["XAF"],languages:["fr","sg"]},CG:{name:"Republic of the Congo",native:"R\xE9publique du Congo",phone:[242],continent:"AF",capital:"Brazzaville",currency:["XAF"],languages:["fr","ln"]},CH:{name:"Switzerland",native:"Schweiz",phone:[41],continent:"EU",capital:"Bern",currency:["CHE","CHF","CHW"],languages:["de","fr","it"]},CI:{name:"Ivory Coast",native:"C\xF4te d'Ivoire",phone:[225],continent:"AF",capital:"Yamoussoukro",currency:["XOF"],languages:["fr"]},CK:{name:"Cook Islands",native:"Cook Islands",phone:[682],continent:"OC",capital:"Avarua",currency:["NZD"],languages:["en"]},CL:{name:"Chile",native:"Chile",phone:[56],continent:"SA",capital:"Santiago",currency:["CLF","CLP"],languages:["es"]},CM:{name:"Cameroon",native:"Cameroon",phone:[237],continent:"AF",capital:"Yaound\xE9",currency:["XAF"],languages:["en","fr"]},CN:{name:"China",native:"\u4E2D\u56FD",phone:[86],continent:"AS",capital:"Beijing",currency:["CNY"],languages:["zh"]},CO:{name:"Colombia",native:"Colombia",phone:[57],continent:"SA",capital:"Bogot\xE1",currency:["COP"],languages:["es"]},CR:{name:"Costa Rica",native:"Costa Rica",phone:[506],continent:"NA",capital:"San Jos\xE9",currency:["CRC"],languages:["es"]},CU:{name:"Cuba",native:"Cuba",phone:[53],continent:"NA",capital:"Havana",currency:["CUC","CUP"],languages:["es"]},CV:{name:"Cape Verde",native:"Cabo Verde",phone:[238],continent:"AF",capital:"Praia",currency:["CVE"],languages:["pt"]},CW:{name:"Curacao",native:"Cura\xE7ao",phone:[5999],continent:"NA",capital:"Willemstad",currency:["ANG"],languages:["nl","pa","en"]},CX:{name:"Christmas Island",native:"Christmas Island",phone:[61],continent:"AS",capital:"Flying Fish Cove",currency:["AUD"],languages:["en"]},CY:{name:"Cyprus",native:"\u039A\u03CD\u03C0\u03C1\u03BF\u03C2",phone:[357],continent:"EU",capital:"Nicosia",currency:["EUR"],languages:["el","tr","hy"]},CZ:{name:"Czech Republic",native:"\u010Cesk\xE1 republika",phone:[420],continent:"EU",capital:"Prague",currency:["CZK"],languages:["cs"]},DE:{name:"Germany",native:"Deutschland",phone:[49],continent:"EU",capital:"Berlin",currency:["EUR"],languages:["de"]},DJ:{name:"Djibouti",native:"Djibouti",phone:[253],continent:"AF",capital:"Djibouti",currency:["DJF"],languages:["fr","ar"]},DK:{name:"Denmark",native:"Danmark",phone:[45],continent:"EU",continents:["EU","NA"],capital:"Copenhagen",currency:["DKK"],languages:["da"]},DM:{name:"Dominica",native:"Dominica",phone:[1767],continent:"NA",capital:"Roseau",currency:["XCD"],languages:["en"]},DO:{name:"Dominican Republic",native:"Rep\xFAblica Dominicana",phone:[1809,1829,1849],continent:"NA",capital:"Santo Domingo",currency:["DOP"],languages:["es"]},DZ:{name:"Algeria",native:"\u0627\u0644\u062C\u0632\u0627\u0626\u0631",phone:[213],continent:"AF",capital:"Algiers",currency:["DZD"],languages:["ar"]},EC:{name:"Ecuador",native:"Ecuador",phone:[593],continent:"SA",capital:"Quito",currency:["USD"],languages:["es"]},EE:{name:"Estonia",native:"Eesti",phone:[372],continent:"EU",capital:"Tallinn",currency:["EUR"],languages:["et"]},EG:{name:"Egypt",native:"\u0645\u0635\u0631\u200E",phone:[20],continent:"AF",continents:["AF","AS"],capital:"Cairo",currency:["EGP"],languages:["ar"]},EH:{name:"Western Sahara",native:"\u0627\u0644\u0635\u062D\u0631\u0627\u0621 \u0627\u0644\u063A\u0631\u0628\u064A\u0629",phone:[212],continent:"AF",capital:"El Aai\xFAn",currency:["MAD","DZD","MRU"],languages:["es"]},ER:{name:"Eritrea",native:"\u12A4\u122D\u1275\u122B",phone:[291],continent:"AF",capital:"Asmara",currency:["ERN"],languages:["ti","ar","en"]},ES:{name:"Spain",native:"Espa\xF1a",phone:[34],continent:"EU",capital:"Madrid",currency:["EUR"],languages:["es","eu","ca","gl","oc"]},ET:{name:"Ethiopia",native:"\u12A2\u1275\u12EE\u1335\u12EB",phone:[251],continent:"AF",capital:"Addis Ababa",currency:["ETB"],languages:["am"]},FI:{name:"Finland",native:"Suomi",phone:[358],continent:"EU",capital:"Helsinki",currency:["EUR"],languages:["fi","sv"]},FJ:{name:"Fiji",native:"Fiji",phone:[679],continent:"OC",capital:"Suva",currency:["FJD"],languages:["en","fj","hi","ur"]},FK:{name:"Falkland Islands",native:"Falkland Islands",phone:[500],continent:"SA",capital:"Stanley",currency:["FKP"],languages:["en"]},FM:{name:"Micronesia",native:"Micronesia",phone:[691],continent:"OC",capital:"Palikir",currency:["USD"],languages:["en"]},FO:{name:"Faroe Islands",native:"F\xF8royar",phone:[298],continent:"EU",capital:"T\xF3rshavn",currency:["DKK"],languages:["fo"]},FR:{name:"France",native:"France",phone:[33],continent:"EU",capital:"Paris",currency:["EUR"],languages:["fr"]},GA:{name:"Gabon",native:"Gabon",phone:[241],continent:"AF",capital:"Libreville",currency:["XAF"],languages:["fr"]},GB:{name:"United Kingdom",native:"United Kingdom",phone:[44],continent:"EU",capital:"London",currency:["GBP"],languages:["en"]},GD:{name:"Grenada",native:"Grenada",phone:[1473],continent:"NA",capital:"St. George's",currency:["XCD"],languages:["en"]},GE:{name:"Georgia",native:"\u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD",phone:[995],continent:"AS",continents:["AS","EU"],capital:"Tbilisi",currency:["GEL"],languages:["ka"]},GF:{name:"French Guiana",native:"Guyane fran\xE7aise",phone:[594],continent:"SA",capital:"Cayenne",currency:["EUR"],languages:["fr"]},GG:{name:"Guernsey",native:"Guernsey",phone:[44],continent:"EU",capital:"St. Peter Port",currency:["GBP"],languages:["en","fr"]},GH:{name:"Ghana",native:"Ghana",phone:[233],continent:"AF",capital:"Accra",currency:["GHS"],languages:["en"]},GI:{name:"Gibraltar",native:"Gibraltar",phone:[350],continent:"EU",capital:"Gibraltar",currency:["GIP"],languages:["en"]},GL:{name:"Greenland",native:"Kalaallit Nunaat",phone:[299],continent:"NA",capital:"Nuuk",currency:["DKK"],languages:["kl"]},GM:{name:"Gambia",native:"Gambia",phone:[220],continent:"AF",capital:"Banjul",currency:["GMD"],languages:["en"]},GN:{name:"Guinea",native:"Guin\xE9e",phone:[224],continent:"AF",capital:"Conakry",currency:["GNF"],languages:["fr","ff"]},GP:{name:"Guadeloupe",native:"Guadeloupe",phone:[590],continent:"NA",capital:"Basse-Terre",currency:["EUR"],languages:["fr"]},GQ:{name:"Equatorial Guinea",native:"Guinea Ecuatorial",phone:[240],continent:"AF",capital:"Malabo",currency:["XAF"],languages:["es","fr"]},GR:{name:"Greece",native:"\u0395\u03BB\u03BB\u03AC\u03B4\u03B1",phone:[30],continent:"EU",capital:"Athens",currency:["EUR"],languages:["el"]},GS:{name:"South Georgia and the South Sandwich Islands",native:"South Georgia",phone:[500],continent:"AN",capital:"King Edward Point",currency:["GBP"],languages:["en"]},GT:{name:"Guatemala",native:"Guatemala",phone:[502],continent:"NA",capital:"Guatemala City",currency:["GTQ"],languages:["es"]},GU:{name:"Guam",native:"Guam",phone:[1671],continent:"OC",capital:"Hag\xE5t\xF1a",currency:["USD"],languages:["en","ch","es"]},GW:{name:"Guinea-Bissau",native:"Guin\xE9-Bissau",phone:[245],continent:"AF",capital:"Bissau",currency:["XOF"],languages:["pt"]},GY:{name:"Guyana",native:"Guyana",phone:[592],continent:"SA",capital:"Georgetown",currency:["GYD"],languages:["en"]},HK:{name:"Hong Kong",native:"\u9999\u6E2F",phone:[852],continent:"AS",capital:"City of Victoria",currency:["HKD"],languages:["zh","en"]},HM:{name:"Heard Island and McDonald Islands",native:"Heard Island and McDonald Islands",phone:[61],continent:"AN",capital:"",currency:["AUD"],languages:["en"]},HN:{name:"Honduras",native:"Honduras",phone:[504],continent:"NA",capital:"Tegucigalpa",currency:["HNL"],languages:["es"]},HR:{name:"Croatia",native:"Hrvatska",phone:[385],continent:"EU",capital:"Zagreb",currency:["EUR"],languages:["hr"]},HT:{name:"Haiti",native:"Ha\xEFti",phone:[509],continent:"NA",capital:"Port-au-Prince",currency:["HTG","USD"],languages:["fr","ht"]},HU:{name:"Hungary",native:"Magyarorsz\xE1g",phone:[36],continent:"EU",capital:"Budapest",currency:["HUF"],languages:["hu"]},ID:{name:"Indonesia",native:"Indonesia",phone:[62],continent:"AS",capital:"Jakarta",currency:["IDR"],languages:["id"]},IE:{name:"Ireland",native:"\xC9ire",phone:[353],continent:"EU",capital:"Dublin",currency:["EUR"],languages:["ga","en"]},IL:{name:"Israel",native:"\u05D9\u05B4\u05E9\u05B0\u05C2\u05E8\u05B8\u05D0\u05B5\u05DC",phone:[972],continent:"AS",capital:"Jerusalem",currency:["ILS"],languages:["he","ar"]},IM:{name:"Isle of Man",native:"Isle of Man",phone:[44],continent:"EU",capital:"Douglas",currency:["GBP"],languages:["en","gv"]},IN:{name:"India",native:"\u092D\u093E\u0930\u0924",phone:[91],continent:"AS",capital:"New Delhi",currency:["INR"],languages:["hi","en"]},IO:{name:"British Indian Ocean Territory",native:"British Indian Ocean Territory",phone:[246],continent:"AS",capital:"Diego Garcia",currency:["USD"],languages:["en"]},IQ:{name:"Iraq",native:"\u0627\u0644\u0639\u0631\u0627\u0642",phone:[964],continent:"AS",capital:"Baghdad",currency:["IQD"],languages:["ar","ku"]},IR:{name:"Iran",native:"\u0627\u06CC\u0631\u0627\u0646",phone:[98],continent:"AS",capital:"Tehran",currency:["IRR"],languages:["fa"]},IS:{name:"Iceland",native:"\xCDsland",phone:[354],continent:"EU",capital:"Reykjavik",currency:["ISK"],languages:["is"]},IT:{name:"Italy",native:"Italia",phone:[39],continent:"EU",capital:"Rome",currency:["EUR"],languages:["it"]},JE:{name:"Jersey",native:"Jersey",phone:[44],continent:"EU",capital:"Saint Helier",currency:["GBP"],languages:["en","fr"]},JM:{name:"Jamaica",native:"Jamaica",phone:[1876],continent:"NA",capital:"Kingston",currency:["JMD"],languages:["en"]},JO:{name:"Jordan",native:"\u0627\u0644\u0623\u0631\u062F\u0646",phone:[962],continent:"AS",capital:"Amman",currency:["JOD"],languages:["ar"]},JP:{name:"Japan",native:"\u65E5\u672C",phone:[81],continent:"AS",capital:"Tokyo",currency:["JPY"],languages:["ja"]},KE:{name:"Kenya",native:"Kenya",phone:[254],continent:"AF",capital:"Nairobi",currency:["KES"],languages:["en","sw"]},KG:{name:"Kyrgyzstan",native:"\u041A\u044B\u0440\u0433\u044B\u0437\u0441\u0442\u0430\u043D",phone:[996],continent:"AS",capital:"Bishkek",currency:["KGS"],languages:["ky","ru"]},KH:{name:"Cambodia",native:"K\xE2mp\u016Dch\xE9a",phone:[855],continent:"AS",capital:"Phnom Penh",currency:["KHR"],languages:["km"]},KI:{name:"Kiribati",native:"Kiribati",phone:[686],continent:"OC",capital:"South Tarawa",currency:["AUD"],languages:["en"]},KM:{name:"Comoros",native:"Komori",phone:[269],continent:"AF",capital:"Moroni",currency:["KMF"],languages:["ar","fr"]},KN:{name:"Saint Kitts and Nevis",native:"Saint Kitts and Nevis",phone:[1869],continent:"NA",capital:"Basseterre",currency:["XCD"],languages:["en"]},KP:{name:"North Korea",native:"\uBD81\uD55C",phone:[850],continent:"AS",capital:"Pyongyang",currency:["KPW"],languages:["ko"]},KR:{name:"South Korea",native:"\uB300\uD55C\uBBFC\uAD6D",phone:[82],continent:"AS",capital:"Seoul",currency:["KRW"],languages:["ko"]},KW:{name:"Kuwait",native:"\u0627\u0644\u0643\u0648\u064A\u062A",phone:[965],continent:"AS",capital:"Kuwait City",currency:["KWD"],languages:["ar"]},KY:{name:"Cayman Islands",native:"Cayman Islands",phone:[1345],continent:"NA",capital:"George Town",currency:["KYD"],languages:["en"]},KZ:{name:"Kazakhstan",native:"\u049A\u0430\u0437\u0430\u049B\u0441\u0442\u0430\u043D",phone:[7],continent:"AS",continents:["AS","EU"],capital:"Astana",currency:["KZT"],languages:["kk","ru"]},LA:{name:"Laos",native:"\u0EAA\u0E9B\u0E9B\u0EA5\u0EB2\u0EA7",phone:[856],continent:"AS",capital:"Vientiane",currency:["LAK"],languages:["lo"]},LB:{name:"Lebanon",native:"\u0644\u0628\u0646\u0627\u0646",phone:[961],continent:"AS",capital:"Beirut",currency:["LBP"],languages:["ar","fr"]},LC:{name:"Saint Lucia",native:"Saint Lucia",phone:[1758],continent:"NA",capital:"Castries",currency:["XCD"],languages:["en"]},LI:{name:"Liechtenstein",native:"Liechtenstein",phone:[423],continent:"EU",capital:"Vaduz",currency:["CHF"],languages:["de"]},LK:{name:"Sri Lanka",native:"\u015Br\u012B la\u1E43k\u0101va",phone:[94],continent:"AS",capital:"Colombo",currency:["LKR"],languages:["si","ta"]},LR:{name:"Liberia",native:"Liberia",phone:[231],continent:"AF",capital:"Monrovia",currency:["LRD"],languages:["en"]},LS:{name:"Lesotho",native:"Lesotho",phone:[266],continent:"AF",capital:"Maseru",currency:["LSL","ZAR"],languages:["en","st"]},LT:{name:"Lithuania",native:"Lietuva",phone:[370],continent:"EU",capital:"Vilnius",currency:["EUR"],languages:["lt"]},LU:{name:"Luxembourg",native:"Luxembourg",phone:[352],continent:"EU",capital:"Luxembourg",currency:["EUR"],languages:["fr","de","lb"]},LV:{name:"Latvia",native:"Latvija",phone:[371],continent:"EU",capital:"Riga",currency:["EUR"],languages:["lv"]},LY:{name:"Libya",native:"\u200F\u0644\u064A\u0628\u064A\u0627",phone:[218],continent:"AF",capital:"Tripoli",currency:["LYD"],languages:["ar"]},MA:{name:"Morocco",native:"\u0627\u0644\u0645\u063A\u0631\u0628",phone:[212],continent:"AF",capital:"Rabat",currency:["MAD"],languages:["ar"]},MC:{name:"Monaco",native:"Monaco",phone:[377],continent:"EU",capital:"Monaco",currency:["EUR"],languages:["fr"]},MD:{name:"Moldova",native:"Moldova",phone:[373],continent:"EU",capital:"Chi\u0219in\u0103u",currency:["MDL"],languages:["ro"]},ME:{name:"Montenegro",native:"\u0426\u0440\u043D\u0430 \u0413\u043E\u0440\u0430",phone:[382],continent:"EU",capital:"Podgorica",currency:["EUR"],languages:["sr","bs","sq","hr"]},MF:{name:"Saint Martin",native:"Saint-Martin",phone:[590],continent:"NA",capital:"Marigot",currency:["EUR"],languages:["en","fr","nl"]},MG:{name:"Madagascar",native:"Madagasikara",phone:[261],continent:"AF",capital:"Antananarivo",currency:["MGA"],languages:["fr","mg"]},MH:{name:"Marshall Islands",native:"M\u0327aje\u013C",phone:[692],continent:"OC",capital:"Majuro",currency:["USD"],languages:["en","mh"]},MK:{name:"North Macedonia",native:"\u0421\u0435\u0432\u0435\u0440\u043D\u0430 \u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0438\u0458\u0430",phone:[389],continent:"EU",capital:"Skopje",currency:["MKD"],languages:["mk"]},ML:{name:"Mali",native:"Mali",phone:[223],continent:"AF",capital:"Bamako",currency:["XOF"],languages:["fr"]},MM:{name:"Myanmar (Burma)",native:"\u1019\u103C\u1014\u103A\u1019\u102C",phone:[95],continent:"AS",capital:"Naypyidaw",currency:["MMK"],languages:["my"]},MN:{name:"Mongolia",native:"\u041C\u043E\u043D\u0433\u043E\u043B \u0443\u043B\u0441",phone:[976],continent:"AS",capital:"Ulan Bator",currency:["MNT"],languages:["mn"]},MO:{name:"Macao",native:"\u6FB3\u9580",phone:[853],continent:"AS",capital:"",currency:["MOP"],languages:["zh","pt"]},MP:{name:"Northern Mariana Islands",native:"Northern Mariana Islands",phone:[1670],continent:"OC",capital:"Saipan",currency:["USD"],languages:["en","ch"]},MQ:{name:"Martinique",native:"Martinique",phone:[596],continent:"NA",capital:"Fort-de-France",currency:["EUR"],languages:["fr"]},MR:{name:"Mauritania",native:"\u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0627",phone:[222],continent:"AF",capital:"Nouakchott",currency:["MRU"],languages:["ar"]},MS:{name:"Montserrat",native:"Montserrat",phone:[1664],continent:"NA",capital:"Plymouth",currency:["XCD"],languages:["en"]},MT:{name:"Malta",native:"Malta",phone:[356],continent:"EU",capital:"Valletta",currency:["EUR"],languages:["mt","en"]},MU:{name:"Mauritius",native:"Maurice",phone:[230],continent:"AF",capital:"Port Louis",currency:["MUR"],languages:["en"]},MV:{name:"Maldives",native:"Maldives",phone:[960],continent:"AS",capital:"Mal\xE9",currency:["MVR"],languages:["dv"]},MW:{name:"Malawi",native:"Malawi",phone:[265],continent:"AF",capital:"Lilongwe",currency:["MWK"],languages:["en","ny"]},MX:{name:"Mexico",native:"M\xE9xico",phone:[52],continent:"NA",capital:"Mexico City",currency:["MXN"],languages:["es"]},MY:{name:"Malaysia",native:"Malaysia",phone:[60],continent:"AS",capital:"Kuala Lumpur",currency:["MYR"],languages:["ms"]},MZ:{name:"Mozambique",native:"Mo\xE7ambique",phone:[258],continent:"AF",capital:"Maputo",currency:["MZN"],languages:["pt"]},NA:{name:"Namibia",native:"Namibia",phone:[264],continent:"AF",capital:"Windhoek",currency:["NAD","ZAR"],languages:["en","af"]},NC:{name:"New Caledonia",native:"Nouvelle-Cal\xE9donie",phone:[687],continent:"OC",capital:"Noum\xE9a",currency:["XPF"],languages:["fr"]},NE:{name:"Niger",native:"Niger",phone:[227],continent:"AF",capital:"Niamey",currency:["XOF"],languages:["fr"]},NF:{name:"Norfolk Island",native:"Norfolk Island",phone:[672],continent:"OC",capital:"Kingston",currency:["AUD"],languages:["en"]},NG:{name:"Nigeria",native:"Nigeria",phone:[234],continent:"AF",capital:"Abuja",currency:["NGN"],languages:["en"]},NI:{name:"Nicaragua",native:"Nicaragua",phone:[505],continent:"NA",capital:"Managua",currency:["NIO"],languages:["es"]},NL:{name:"Netherlands",native:"Nederland",phone:[31],continent:"EU",capital:"Amsterdam",currency:["EUR"],languages:["nl"]},NO:{name:"Norway",native:"Norge",phone:[47],continent:"EU",capital:"Oslo",currency:["NOK"],languages:["no","nb","nn"]},NP:{name:"Nepal",native:"\u0928\u0947\u092A\u093E\u0932",phone:[977],continent:"AS",capital:"Kathmandu",currency:["NPR"],languages:["ne"]},NR:{name:"Nauru",native:"Nauru",phone:[674],continent:"OC",capital:"Yaren",currency:["AUD"],languages:["en","na"]},NU:{name:"Niue",native:"Niu\u0113",phone:[683],continent:"OC",capital:"Alofi",currency:["NZD"],languages:["en"]},NZ:{name:"New Zealand",native:"New Zealand",phone:[64],continent:"OC",capital:"Wellington",currency:["NZD"],languages:["en","mi"]},OM:{name:"Oman",native:"\u0639\u0645\u0627\u0646",phone:[968],continent:"AS",capital:"Muscat",currency:["OMR"],languages:["ar"]},PA:{name:"Panama",native:"Panam\xE1",phone:[507],continent:"NA",capital:"Panama City",currency:["PAB","USD"],languages:["es"]},PE:{name:"Peru",native:"Per\xFA",phone:[51],continent:"SA",capital:"Lima",currency:["PEN"],languages:["es"]},PF:{name:"French Polynesia",native:"Polyn\xE9sie fran\xE7aise",phone:[689],continent:"OC",capital:"Papeet\u0113",currency:["XPF"],languages:["fr"]},PG:{name:"Papua New Guinea",native:"Papua Niugini",phone:[675],continent:"OC",capital:"Port Moresby",currency:["PGK"],languages:["en"]},PH:{name:"Philippines",native:"Pilipinas",phone:[63],continent:"AS",capital:"Manila",currency:["PHP"],languages:["en"]},PK:{name:"Pakistan",native:"Pakistan",phone:[92],continent:"AS",capital:"Islamabad",currency:["PKR"],languages:["en","ur"]},PL:{name:"Poland",native:"Polska",phone:[48],continent:"EU",capital:"Warsaw",currency:["PLN"],languages:["pl"]},PM:{name:"Saint Pierre and Miquelon",native:"Saint-Pierre-et-Miquelon",phone:[508],continent:"NA",capital:"Saint-Pierre",currency:["EUR"],languages:["fr"]},PN:{name:"Pitcairn Islands",native:"Pitcairn Islands",phone:[64],continent:"OC",capital:"Adamstown",currency:["NZD"],languages:["en"]},PR:{name:"Puerto Rico",native:"Puerto Rico",phone:[1787,1939],continent:"NA",capital:"San Juan",currency:["USD"],languages:["es","en"]},PS:{name:"Palestine",native:"\u0641\u0644\u0633\u0637\u064A\u0646",phone:[970],continent:"AS",capital:"Ramallah",currency:["ILS"],languages:["ar"]},PT:{name:"Portugal",native:"Portugal",phone:[351],continent:"EU",capital:"Lisbon",currency:["EUR"],languages:["pt"]},PW:{name:"Palau",native:"Palau",phone:[680],continent:"OC",capital:"Ngerulmud",currency:["USD"],languages:["en"]},PY:{name:"Paraguay",native:"Paraguay",phone:[595],continent:"SA",capital:"Asunci\xF3n",currency:["PYG"],languages:["es","gn"]},QA:{name:"Qatar",native:"\u0642\u0637\u0631",phone:[974],continent:"AS",capital:"Doha",currency:["QAR"],languages:["ar"]},RE:{name:"Reunion",native:"La R\xE9union",phone:[262],continent:"AF",capital:"Saint-Denis",currency:["EUR"],languages:["fr"]},RO:{name:"Romania",native:"Rom\xE2nia",phone:[40],continent:"EU",capital:"Bucharest",currency:["RON"],languages:["ro"]},RS:{name:"Serbia",native:"\u0421\u0440\u0431\u0438\u0458\u0430",phone:[381],continent:"EU",capital:"Belgrade",currency:["RSD"],languages:["sr"]},RU:{name:"Russia",native:"\u0420\u043E\u0441\u0441\u0438\u044F",phone:[7],continent:"AS",continents:["AS","EU"],capital:"Moscow",currency:["RUB"],languages:["ru"]},RW:{name:"Rwanda",native:"Rwanda",phone:[250],continent:"AF",capital:"Kigali",currency:["RWF"],languages:["rw","en","fr"]},SA:{name:"Saudi Arabia",native:"\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",phone:[966],continent:"AS",capital:"Riyadh",currency:["SAR"],languages:["ar"]},SB:{name:"Solomon Islands",native:"Solomon Islands",phone:[677],continent:"OC",capital:"Honiara",currency:["SBD"],languages:["en"]},SC:{name:"Seychelles",native:"Seychelles",phone:[248],continent:"AF",capital:"Victoria",currency:["SCR"],languages:["fr","en"]},SD:{name:"Sudan",native:"\u0627\u0644\u0633\u0648\u062F\u0627\u0646",phone:[249],continent:"AF",capital:"Khartoum",currency:["SDG"],languages:["ar","en"]},SE:{name:"Sweden",native:"Sverige",phone:[46],continent:"EU",capital:"Stockholm",currency:["SEK"],languages:["sv"]},SG:{name:"Singapore",native:"Singapore",phone:[65],continent:"AS",capital:"Singapore",currency:["SGD"],languages:["en","ms","ta","zh"]},SH:{name:"Saint Helena",native:"Saint Helena",phone:[290],continent:"AF",capital:"Jamestown",currency:["SHP"],languages:["en"]},SI:{name:"Slovenia",native:"Slovenija",phone:[386],continent:"EU",capital:"Ljubljana",currency:["EUR"],languages:["sl"]},SJ:{name:"Svalbard and Jan Mayen",native:"Svalbard og Jan Mayen",phone:[4779],continent:"EU",capital:"Longyearbyen",currency:["NOK"],languages:["no"]},SK:{name:"Slovakia",native:"Slovensko",phone:[421],continent:"EU",capital:"Bratislava",currency:["EUR"],languages:["sk"]},SL:{name:"Sierra Leone",native:"Sierra Leone",phone:[232],continent:"AF",capital:"Freetown",currency:["SLL"],languages:["en"]},SM:{name:"San Marino",native:"San Marino",phone:[378],continent:"EU",capital:"City of San Marino",currency:["EUR"],languages:["it"]},SN:{name:"Senegal",native:"S\xE9n\xE9gal",phone:[221],continent:"AF",capital:"Dakar",currency:["XOF"],languages:["fr"]},SO:{name:"Somalia",native:"Soomaaliya",phone:[252],continent:"AF",capital:"Mogadishu",currency:["SOS"],languages:["so","ar"]},SR:{name:"Suriname",native:"Suriname",phone:[597],continent:"SA",capital:"Paramaribo",currency:["SRD"],languages:["nl"]},SS:{name:"South Sudan",native:"South Sudan",phone:[211],continent:"AF",capital:"Juba",currency:["SSP"],languages:["en"]},ST:{name:"Sao Tome and Principe",native:"S\xE3o Tom\xE9 e Pr\xEDncipe",phone:[239],continent:"AF",capital:"S\xE3o Tom\xE9",currency:["STN"],languages:["pt"]},SV:{name:"El Salvador",native:"El Salvador",phone:[503],continent:"NA",capital:"San Salvador",currency:["SVC","USD"],languages:["es"]},SX:{name:"Sint Maarten",native:"Sint Maarten",phone:[1721],continent:"NA",capital:"Philipsburg",currency:["ANG"],languages:["nl","en"]},SY:{name:"Syria",native:"\u0633\u0648\u0631\u064A\u0627",phone:[963],continent:"AS",capital:"Damascus",currency:["SYP"],languages:["ar"]},SZ:{name:"Eswatini",native:"Eswatini",phone:[268],continent:"AF",capital:"Lobamba",currency:["SZL"],languages:["en","ss"]},TC:{name:"Turks and Caicos Islands",native:"Turks and Caicos Islands",phone:[1649],continent:"NA",capital:"Cockburn Town",currency:["USD"],languages:["en"]},TD:{name:"Chad",native:"Tchad",phone:[235],continent:"AF",capital:"N'Djamena",currency:["XAF"],languages:["fr","ar"]},TF:{name:"French Southern Territories",native:"Territoire des Terres australes et antarctiques fr",phone:[262],continent:"AN",capital:"Port-aux-Fran\xE7ais",currency:["EUR"],languages:["fr"]},TG:{name:"Togo",native:"Togo",phone:[228],continent:"AF",capital:"Lom\xE9",currency:["XOF"],languages:["fr"]},TH:{name:"Thailand",native:"\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28\u0E44\u0E17\u0E22",phone:[66],continent:"AS",capital:"Bangkok",currency:["THB"],languages:["th"]},TJ:{name:"Tajikistan",native:"\u0422\u043E\u04B7\u0438\u043A\u0438\u0441\u0442\u043E\u043D",phone:[992],continent:"AS",capital:"Dushanbe",currency:["TJS"],languages:["tg","ru"]},TK:{name:"Tokelau",native:"Tokelau",phone:[690],continent:"OC",capital:"Fakaofo",currency:["NZD"],languages:["en"]},TL:{name:"East Timor",native:"Timor-Leste",phone:[670],continent:"OC",capital:"Dili",currency:["USD"],languages:["pt"]},TM:{name:"Turkmenistan",native:"T\xFCrkmenistan",phone:[993],continent:"AS",capital:"Ashgabat",currency:["TMT"],languages:["tk","ru"]},TN:{name:"Tunisia",native:"\u062A\u0648\u0646\u0633",phone:[216],continent:"AF",capital:"Tunis",currency:["TND"],languages:["ar"]},TO:{name:"Tonga",native:"Tonga",phone:[676],continent:"OC",capital:"Nuku'alofa",currency:["TOP"],languages:["en","to"]},TR:{name:"Turkey",native:"T\xFCrkiye",phone:[90],continent:"AS",continents:["AS","EU"],capital:"Ankara",currency:["TRY"],languages:["tr"]},TT:{name:"Trinidad and Tobago",native:"Trinidad and Tobago",phone:[1868],continent:"NA",capital:"Port of Spain",currency:["TTD"],languages:["en"]},TV:{name:"Tuvalu",native:"Tuvalu",phone:[688],continent:"OC",capital:"Funafuti",currency:["AUD"],languages:["en"]},TW:{name:"Taiwan",native:"\u81FA\u7063",phone:[886],continent:"AS",capital:"Taipei",currency:["TWD"],languages:["zh"]},TZ:{name:"Tanzania",native:"Tanzania",phone:[255],continent:"AF",capital:"Dodoma",currency:["TZS"],languages:["sw","en"]},UA:{name:"Ukraine",native:"\u0423\u043A\u0440\u0430\u0457\u043D\u0430",phone:[380],continent:"EU",capital:"Kyiv",currency:["UAH"],languages:["uk"]},UG:{name:"Uganda",native:"Uganda",phone:[256],continent:"AF",capital:"Kampala",currency:["UGX"],languages:["en","sw"]},UM:{name:"U.S. Minor Outlying Islands",native:"United States Minor Outlying Islands",phone:[1],continent:"OC",capital:"",currency:["USD"],languages:["en"]},US:{name:"United States",native:"United States",phone:[1],continent:"NA",capital:"Washington D.C.",currency:["USD","USN","USS"],languages:["en"]},UY:{name:"Uruguay",native:"Uruguay",phone:[598],continent:"SA",capital:"Montevideo",currency:["UYI","UYU"],languages:["es"]},UZ:{name:"Uzbekistan",native:"O'zbekiston",phone:[998],continent:"AS",capital:"Tashkent",currency:["UZS"],languages:["uz","ru"]},VA:{name:"Vatican City",native:"Vaticano",phone:[379],continent:"EU",capital:"Vatican City",currency:["EUR"],languages:["it","la"]},VC:{name:"Saint Vincent and the Grenadines",native:"Saint Vincent and the Grenadines",phone:[1784],continent:"NA",capital:"Kingstown",currency:["XCD"],languages:["en"]},VE:{name:"Venezuela",native:"Venezuela",phone:[58],continent:"SA",capital:"Caracas",currency:["VES"],languages:["es"]},VG:{name:"British Virgin Islands",native:"British Virgin Islands",phone:[1284],continent:"NA",capital:"Road Town",currency:["USD"],languages:["en"]},VI:{name:"U.S. Virgin Islands",native:"United States Virgin Islands",phone:[1340],continent:"NA",capital:"Charlotte Amalie",currency:["USD"],languages:["en"]},VN:{name:"Vietnam",native:"Vi\u1EC7t Nam",phone:[84],continent:"AS",capital:"Hanoi",currency:["VND"],languages:["vi"]},VU:{name:"Vanuatu",native:"Vanuatu",phone:[678],continent:"OC",capital:"Port Vila",currency:["VUV"],languages:["bi","en","fr"]},WF:{name:"Wallis and Futuna",native:"Wallis et Futuna",phone:[681],continent:"OC",capital:"Mata-Utu",currency:["XPF"],languages:["fr"]},WS:{name:"Samoa",native:"Samoa",phone:[685],continent:"OC",capital:"Apia",currency:["WST"],languages:["sm","en"]},XK:{name:"Kosovo",native:"Republika e Kosov\xEBs",phone:[377,381,383,386],continent:"EU",capital:"Pristina",currency:["EUR"],languages:["sq","sr"],userAssigned:!0},YE:{name:"Yemen",native:"\u0627\u0644\u064A\u064E\u0645\u064E\u0646",phone:[967],continent:"AS",capital:"Sana'a",currency:["YER"],languages:["ar"]},YT:{name:"Mayotte",native:"Mayotte",phone:[262],continent:"AF",capital:"Mamoudzou",currency:["EUR"],languages:["fr"]},ZA:{name:"South Africa",native:"South Africa",phone:[27],continent:"AF",capital:"Pretoria",currency:["ZAR"],languages:["af","en","nr","st","ss","tn","ts","ve","xh","zu"]},ZM:{name:"Zambia",native:"Zambia",phone:[260],continent:"AF",capital:"Lusaka",currency:["ZMW"],languages:["en"]},ZW:{name:"Zimbabwe",native:"Zimbabwe",phone:[263],continent:"AF",capital:"Harare",currency:["USD","ZAR","BWP","GBP","AUD","CNY","INR","JPY"],languages:["en","sn","nd"]}};var s={aa:{name:"Afar",native:"Afar"},ab:{name:"Abkhazian",native:"\u0410\u04A7\u0441\u0443\u0430"},af:{name:"Afrikaans",native:"Afrikaans"},ak:{name:"Akan",native:"Akana"},am:{name:"Amharic",native:"\u12A0\u121B\u122D\u129B"},an:{name:"Aragonese",native:"Aragon\xE9s"},ar:{name:"Arabic",native:"\u0627\u0644\u0639\u0631\u0628\u064A\u0629",rtl:1},as:{name:"Assamese",native:"\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE"},av:{name:"Avar",native:"\u0410\u0432\u0430\u0440"},ay:{name:"Aymara",native:"Aymar"},az:{name:"Azerbaijani",native:"Az\u0259rbaycanca / \u0622\u0630\u0631\u0628\u0627\u064A\u062C\u0627\u0646"},ba:{name:"Bashkir",native:"\u0411\u0430\u0448\u04A1\u043E\u0440\u0442"},be:{name:"Belarusian",native:"\u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0430\u044F"},bg:{name:"Bulgarian",native:"\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438"},bh:{name:"Bihari",native:"\u092D\u094B\u091C\u092A\u0941\u0930\u0940"},bi:{name:"Bislama",native:"Bislama"},bm:{name:"Bambara",native:"Bamanankan"},bn:{name:"Bengali",native:"\u09AC\u09BE\u0982\u09B2\u09BE"},bo:{name:"Tibetan",native:"\u0F56\u0F7C\u0F51\u0F0B\u0F61\u0F72\u0F42 / Bod skad"},br:{name:"Breton",native:"Brezhoneg"},bs:{name:"Bosnian",native:"Bosanski"},ca:{name:"Catalan",native:"Catal\xE0"},ce:{name:"Chechen",native:"\u041D\u043E\u0445\u0447\u0438\u0439\u043D"},ch:{name:"Chamorro",native:"Chamoru"},co:{name:"Corsican",native:"Corsu"},cr:{name:"Cree",native:"Nehiyaw"},cs:{name:"Czech",native:"\u010Ce\u0161tina"},cu:{name:"Old Church Slavonic / Old Bulgarian",native:"\u0441\u043B\u043E\u0432\u0463\u043D\u044C\u0441\u043A\u044A / slov\u011Bn\u012Dsk\u016D"},cv:{name:"Chuvash",native:"\u0427\u0103\u0432\u0430\u0448"},cy:{name:"Welsh",native:"Cymraeg"},da:{name:"Danish",native:"Dansk"},de:{name:"German",native:"Deutsch"},dv:{name:"Divehi",native:"\u078B\u07A8\u0788\u07AC\u0780\u07A8\u0784\u07A6\u0790\u07B0",rtl:1},dz:{name:"Dzongkha",native:"\u0F47\u0F7C\u0F44\u0F0B\u0F41"},ee:{name:"Ewe",native:"\u0190\u028B\u025B"},el:{name:"Greek",native:"\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC"},en:{name:"English",native:"English"},eo:{name:"Esperanto",native:"Esperanto"},es:{name:"Spanish",native:"Espa\xF1ol"},et:{name:"Estonian",native:"Eesti"},eu:{name:"Basque",native:"Euskara"},fa:{name:"Persian",native:"\u0641\u0627\u0631\u0633\u06CC",rtl:1},ff:{name:"Peul",native:"Fulfulde"},fi:{name:"Finnish",native:"Suomi"},fj:{name:"Fijian",native:"Na Vosa Vakaviti"},fo:{name:"Faroese",native:"F\xF8royskt"},fr:{name:"French",native:"Fran\xE7ais"},fy:{name:"West Frisian",native:"Frysk"},ga:{name:"Irish",native:"Gaeilge"},gd:{name:"Scottish Gaelic",native:"G\xE0idhlig"},gl:{name:"Galician",native:"Galego"},gn:{name:"Guarani",native:"Ava\xF1e'\u1EBD"},gu:{name:"Gujarati",native:"\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0"},gv:{name:"Manx",native:"Gaelg"},ha:{name:"Hausa",native:"\u0647\u064E\u0648\u064F\u0633\u064E",rtl:1},he:{name:"Hebrew",native:"\u05E2\u05D1\u05E8\u05D9\u05EA",rtl:1},hi:{name:"Hindi",native:"\u0939\u093F\u0928\u094D\u0926\u0940"},ho:{name:"Hiri Motu",native:"Hiri Motu"},hr:{name:"Croatian",native:"Hrvatski"},ht:{name:"Haitian",native:"Kr\xE8yol ayisyen"},hu:{name:"Hungarian",native:"Magyar"},hy:{name:"Armenian",native:"\u0540\u0561\u0575\u0565\u0580\u0565\u0576"},hz:{name:"Herero",native:"Otsiherero"},ia:{name:"Interlingua",native:"Interlingua"},id:{name:"Indonesian",native:"Bahasa Indonesia"},ie:{name:"Interlingue",native:"Interlingue"},ig:{name:"Igbo",native:"Igbo"},ii:{name:"Sichuan Yi",native:"\uA187\uA259 / \u56DB\u5DDD\u5F5D\u8BED"},ik:{name:"Inupiak",native:"I\xF1upiak"},io:{name:"Ido",native:"Ido"},is:{name:"Icelandic",native:"\xCDslenska"},it:{name:"Italian",native:"Italiano"},iu:{name:"Inuktitut",native:"\u1403\u14C4\u1483\u144E\u1450\u1466"},ja:{name:"Japanese",native:"\u65E5\u672C\u8A9E"},jv:{name:"Javanese",native:"Basa Jawa"},ka:{name:"Georgian",native:"\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8"},kg:{name:"Kongo",native:"KiKongo"},ki:{name:"Kikuyu",native:"G\u0129k\u0169y\u0169"},kj:{name:"Kuanyama",native:"Kuanyama"},kk:{name:"Kazakh",native:"\u049A\u0430\u0437\u0430\u049B\u0448\u0430"},kl:{name:"Greenlandic",native:"Kalaallisut"},km:{name:"Cambodian",native:"\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A"},kn:{name:"Kannada",native:"\u0C95\u0CA8\u0CCD\u0CA8\u0CA1"},ko:{name:"Korean",native:"\uD55C\uAD6D\uC5B4"},kr:{name:"Kanuri",native:"Kanuri"},ks:{name:"Kashmiri",native:"\u0915\u0936\u094D\u092E\u0940\u0930\u0940 / \u0643\u0634\u0645\u064A\u0631\u064A",rtl:1},ku:{name:"Kurdish",native:"Kurd\xEE / \u0643\u0648\u0631\u062F\u06CC",rtl:1},kv:{name:"Komi",native:"\u041A\u043E\u043C\u0438"},kw:{name:"Cornish",native:"Kernewek"},ky:{name:"Kyrgyz",native:"\u041A\u044B\u0440\u0433\u044B\u0437\u0447\u0430"},la:{name:"Latin",native:"Latina"},lb:{name:"Luxembourgish",native:"L\xEBtzebuergesch"},lg:{name:"Ganda",native:"Luganda"},li:{name:"Limburgian",native:"Limburgs"},ln:{name:"Lingala",native:"Ling\xE1la"},lo:{name:"Laotian",native:"\u0EA5\u0EB2\u0EA7 / Pha xa lao"},lt:{name:"Lithuanian",native:"Lietuvi\u0173"},lu:{name:"Luba-Katanga",native:"Tshiluba"},lv:{name:"Latvian",native:"Latvie\u0161u"},mg:{name:"Malagasy",native:"Malagasy"},mh:{name:"Marshallese",native:"Kajin Majel / Ebon"},mi:{name:"Maori",native:"M\u0101ori"},mk:{name:"Macedonian",native:"\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438"},ml:{name:"Malayalam",native:"\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02"},mn:{name:"Mongolian",native:"\u041C\u043E\u043D\u0433\u043E\u043B"},mo:{name:"Moldovan",native:"Moldoveneasc\u0103"},mr:{name:"Marathi",native:"\u092E\u0930\u093E\u0920\u0940"},ms:{name:"Malay",native:"Bahasa Melayu"},mt:{name:"Maltese",native:"bil-Malti"},my:{name:"Burmese",native:"\u1019\u103C\u1014\u103A\u1019\u102C\u1005\u102C"},na:{name:"Nauruan",native:"Dorerin Naoero"},nb:{name:"Norwegian Bokm\xE5l",native:"Norsk bokm\xE5l"},nd:{name:"North Ndebele",native:"Sindebele"},ne:{name:"Nepali",native:"\u0928\u0947\u092A\u093E\u0932\u0940"},ng:{name:"Ndonga",native:"Oshiwambo"},nl:{name:"Dutch",native:"Nederlands"},nn:{name:"Norwegian Nynorsk",native:"Norsk nynorsk"},no:{name:"Norwegian",native:"Norsk"},nr:{name:"South Ndebele",native:"isiNdebele"},nv:{name:"Navajo",native:"Din\xE9 bizaad"},ny:{name:"Chichewa",native:"Chi-Chewa"},oc:{name:"Occitan",native:"Occitan"},oj:{name:"Ojibwa",native:"\u140A\u14C2\u1511\u14C8\u142F\u14A7\u140E\u14D0 / Anishinaabemowin"},om:{name:"Oromo",native:"Oromoo"},or:{name:"Oriya",native:"\u0B13\u0B21\u0B3C\u0B3F\u0B06"},os:{name:"Ossetian / Ossetic",native:"\u0418\u0440\u043E\u043D\u0430\u0443"},pa:{name:"Panjabi / Punjabi",native:"\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40 / \u092A\u0902\u091C\u093E\u092C\u0940 / \u067E\u0646\u062C\u0627\u0628\u064A"},pi:{name:"Pali",native:"P\u0101li / \u092A\u093E\u0934\u093F"},pl:{name:"Polish",native:"Polski"},ps:{name:"Pashto",native:"\u067E\u069A\u062A\u0648",rtl:1},pt:{name:"Portuguese",native:"Portugu\xEAs"},qu:{name:"Quechua",native:"Runa Simi"},rm:{name:"Raeto Romance",native:"Rumantsch"},rn:{name:"Kirundi",native:"Kirundi"},ro:{name:"Romanian",native:"Rom\xE2n\u0103"},ru:{name:"Russian",native:"\u0420\u0443\u0441\u0441\u043A\u0438\u0439"},rw:{name:"Rwandi",native:"Kinyarwandi"},sa:{name:"Sanskrit",native:"\u0938\u0902\u0938\u094D\u0915\u0943\u0924\u092E\u094D"},sc:{name:"Sardinian",native:"Sardu"},sd:{name:"Sindhi",native:"\u0938\u093F\u0928\u0927\u093F"},se:{name:"Northern Sami",native:"S\xE1megiella"},sg:{name:"Sango",native:"S\xE4ng\xF6"},sh:{name:"Serbo-Croatian",native:"Srpskohrvatski / \u0421\u0440\u043F\u0441\u043A\u043E\u0445\u0440\u0432\u0430\u0442\u0441\u043A\u0438"},si:{name:"Sinhalese",native:"\u0DC3\u0DD2\u0D82\u0DC4\u0DBD"},sk:{name:"Slovak",native:"Sloven\u010Dina"},sl:{name:"Slovenian",native:"Sloven\u0161\u010Dina"},sm:{name:"Samoan",native:"Gagana Samoa"},sn:{name:"Shona",native:"chiShona"},so:{name:"Somalia",native:"Soomaaliga"},sq:{name:"Albanian",native:"Shqip"},sr:{name:"Serbian",native:"\u0421\u0440\u043F\u0441\u043A\u0438"},ss:{name:"Swati",native:"SiSwati"},st:{name:"Southern Sotho",native:"Sesotho"},su:{name:"Sundanese",native:"Basa Sunda"},sv:{name:"Swedish",native:"Svenska"},sw:{name:"Swahili",native:"Kiswahili"},ta:{name:"Tamil",native:"\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD"},te:{name:"Telugu",native:"\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41"},tg:{name:"Tajik",native:"\u0422\u043E\u04B7\u0438\u043A\u04E3"},th:{name:"Thai",native:"\u0E44\u0E17\u0E22 / Phasa Thai"},ti:{name:"Tigrinya",native:"\u1275\u130D\u122D\u129B"},tk:{name:"Turkmen",native:"\u0422\u0443\u0440\u043A\u043C\u0435\u043D / \u062A\u0631\u0643\u0645\u0646"},tl:{name:"Tagalog / Filipino",native:"Tagalog"},tn:{name:"Tswana",native:"Setswana"},to:{name:"Tonga",native:"Lea Faka-Tonga"},tr:{name:"Turkish",native:"T\xFCrk\xE7e"},ts:{name:"Tsonga",native:"Xitsonga"},tt:{name:"Tatar",native:"Tatar\xE7a"},tw:{name:"Twi",native:"Twi"},ty:{name:"Tahitian",native:"Reo M\u0101`ohi"},ug:{name:"Uyghur",native:"Uy\u01A3urq\u0259 / \u0626\u06C7\u064A\u063A\u06C7\u0631\u0686\u06D5"},uk:{name:"Ukrainian",native:"\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430"},ur:{name:"Urdu",native:"\u0627\u0631\u062F\u0648",rtl:1},uz:{name:"Uzbek",native:"O'zbekcha"},ve:{name:"Venda",native:"Tshiven\u1E13a"},vi:{name:"Vietnamese",native:"Ti\u1EBFng Vi\u1EC7t"},vo:{name:"Volap\xFCk",native:"Volap\xFCk"},wa:{name:"Walloon",native:"Walon"},wo:{name:"Wolof",native:"Wollof"},xh:{name:"Xhosa",native:"isiXhosa"},yi:{name:"Yiddish",native:"\u05D9\u05D9\u05B4\u05D3\u05D9\u05E9",rtl:1},yo:{name:"Yoruba",native:"Yor\xF9b\xE1"},za:{name:"Zhuang",native:"Cuengh / T\xF4\xF4 / \u58EE\u8BED"},zh:{name:"Chinese",native:"\u4E2D\u6587"},zu:{name:"Zulu",native:"isiZulu"}};var r={AD:"AND",AE:"ARE",AF:"AFG",AG:"ATG",AI:"AIA",AL:"ALB",AM:"ARM",AO:"AGO",AQ:"ATA",AR:"ARG",AS:"ASM",AT:"AUT",AU:"AUS",AW:"ABW",AX:"ALA",AZ:"AZE",BA:"BIH",BB:"BRB",BD:"BGD",BE:"BEL",BF:"BFA",BG:"BGR",BH:"BHR",BI:"BDI",BJ:"BEN",BL:"BLM",BM:"BMU",BN:"BRN",BO:"BOL",BQ:"BES",BR:"BRA",BS:"BHS",BT:"BTN",BV:"BVT",BW:"BWA",BY:"BLR",BZ:"BLZ",CA:"CAN",CC:"CCK",CD:"COD",CF:"CAF",CG:"COG",CH:"CHE",CI:"CIV",CK:"COK",CL:"CHL",CM:"CMR",CN:"CHN",CO:"COL",CR:"CRI",CU:"CUB",CV:"CPV",CW:"CUW",CX:"CXR",CY:"CYP",CZ:"CZE",DE:"DEU",DJ:"DJI",DK:"DNK",DM:"DMA",DO:"DOM",DZ:"DZA",EC:"ECU",EE:"EST",EG:"EGY",EH:"ESH",ER:"ERI",ES:"ESP",ET:"ETH",FI:"FIN",FJ:"FJI",FK:"FLK",FM:"FSM",FO:"FRO",FR:"FRA",GA:"GAB",GB:"GBR",GD:"GRD",GE:"GEO",GF:"GUF",GG:"GGY",GH:"GHA",GI:"GIB",GL:"GRL",GM:"GMB",GN:"GIN",GP:"GLP",GQ:"GNQ",GR:"GRC",GS:"SGS",GT:"GTM",GU:"GUM",GW:"GNB",GY:"GUY",HK:"HKG",HM:"HMD",HN:"HND",HR:"HRV",HT:"HTI",HU:"HUN",ID:"IDN",IE:"IRL",IL:"ISR",IM:"IMN",IN:"IND",IO:"IOT",IQ:"IRQ",IR:"IRN",IS:"ISL",IT:"ITA",JE:"JEY",JM:"JAM",JO:"JOR",JP:"JPN",KE:"KEN",KG:"KGZ",KH:"KHM",KI:"KIR",KM:"COM",KN:"KNA",KP:"PRK",KR:"KOR",KW:"KWT",KY:"CYM",KZ:"KAZ",LA:"LAO",LB:"LBN",LC:"LCA",LI:"LIE",LK:"LKA",LR:"LBR",LS:"LSO",LT:"LTU",LU:"LUX",LV:"LVA",LY:"LBY",MA:"MAR",MC:"MCO",MD:"MDA",ME:"MNE",MF:"MAF",MG:"MDG",MH:"MHL",MK:"MKD",ML:"MLI",MM:"MMR",MN:"MNG",MO:"MAC",MP:"MNP",MQ:"MTQ",MR:"MRT",MS:"MSR",MT:"MLT",MU:"MUS",MV:"MDV",MW:"MWI",MX:"MEX",MY:"MYS",MZ:"MOZ",NA:"NAM",NC:"NCL",NE:"NER",NF:"NFK",NG:"NGA",NI:"NIC",NL:"NLD",NO:"NOR",NP:"NPL",NR:"NRU",NU:"NIU",NZ:"NZL",OM:"OMN",PA:"PAN",PE:"PER",PF:"PYF",PG:"PNG",PH:"PHL",PK:"PAK",PL:"POL",PM:"SPM",PN:"PCN",PR:"PRI",PS:"PSE",PT:"PRT",PW:"PLW",PY:"PRY",QA:"QAT",RE:"REU",RO:"ROU",RS:"SRB",RU:"RUS",RW:"RWA",SA:"SAU",SB:"SLB",SC:"SYC",SD:"SDN",SE:"SWE",SG:"SGP",SH:"SHN",SI:"SVN",SJ:"SJM",SK:"SVK",SL:"SLE",SM:"SMR",SN:"SEN",SO:"SOM",SR:"SUR",SS:"SSD",ST:"STP",SV:"SLV",SX:"SXM",SY:"SYR",SZ:"SWZ",TC:"TCA",TD:"TCD",TF:"ATF",TG:"TGO",TH:"THA",TJ:"TJK",TK:"TKL",TL:"TLS",TM:"TKM",TN:"TUN",TO:"TON",TR:"TUR",TT:"TTO",TV:"TUV",TW:"TWN",TZ:"TZA",UA:"UKR",UG:"UGA",UM:"UMI",US:"USA",UY:"URY",UZ:"UZB",VA:"VAT",VC:"VCT",VE:"VEN",VG:"VGB",VI:"VIR",VN:"VNM",VU:"VUT",WF:"WLF",WS:"WSM",XK:"XKX",YE:"YEM",YT:"MYT",ZA:"ZAF",ZM:"ZMB",ZW:"ZWE"};var c=n=>({...a[n],iso2:n,iso3:r[n]}),t=()=>Object.keys(a).map(n=>c(n));var g=t(),m=n=>{let e=`${n}`.trim().replace(/[|\\{}()[\]^$+*?.]/g,"\\$&").replace(/-/g,"\\x2d"),i=new RegExp("^"+e+"$","i");return g.find(({name:o,native:l})=>i.test(o)||i.test(l))?.iso2||!1};var p=127397,v=/^[A-Z]{2}$/,h=n=>v.test(n)?String.fromCodePoint(...n.split("").map(e=>p+e.toUpperCase().charCodeAt(0))):"";


}),
"./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/async.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  AsyncWalker: function() { return AsyncWalker; }
});
/* harmony import */var _walker_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./walker.js */ "./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/walker.js");


/**
 * @typedef { import('estree').Node} Node
 * @typedef { import('./walker.js').WalkerContext} WalkerContext
 * @typedef {(
 *    this: WalkerContext,
 *    node: Node,
 *    parent: Node | null,
 *    key: string | number | symbol | null | undefined,
 *    index: number | null | undefined
 * ) => Promise<void>} AsyncHandler
 */

class AsyncWalker extends _walker_js__WEBPACK_IMPORTED_MODULE_0__.WalkerBase {
	/**
	 *
	 * @param {AsyncHandler} [enter]
	 * @param {AsyncHandler} [leave]
	 */
	constructor(enter, leave) {
		super();

		/** @type {boolean} */
		this.should_skip = false;

		/** @type {boolean} */
		this.should_remove = false;

		/** @type {Node | null} */
		this.replacement = null;

		/** @type {WalkerContext} */
		this.context = {
			skip: () => (this.should_skip = true),
			remove: () => (this.should_remove = true),
			replace: (node) => (this.replacement = node)
		};

		/** @type {AsyncHandler | undefined} */
		this.enter = enter;

		/** @type {AsyncHandler | undefined} */
		this.leave = leave;
	}

	/**
	 * @template {Node} Parent
	 * @param {Node} node
	 * @param {Parent | null} parent
	 * @param {keyof Parent} [prop]
	 * @param {number | null} [index]
	 * @returns {Promise<Node | null>}
	 */
	async visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				await this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			/** @type {keyof Node} */
			let key;

			for (key in node) {
				/** @type {unknown} */
				const value = node[key];

				if (value && typeof value === 'object') {
					if (Array.isArray(value)) {
						const nodes = /** @type {Array<unknown>} */ (value);
						for (let i = 0; i < nodes.length; i += 1) {
							const item = nodes[i];
							if (isNode(item)) {
								if (!(await this.visit(item, node, key, i))) {
									// removed
									i--;
								}
							}
						}
					} else if (isNode(value)) {
						await this.visit(value, node, key, null);
					}
				}
			}

			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				await this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}

/**
 * Ducktype a node.
 *
 * @param {unknown} value
 * @returns {value is Node}
 */
function isNode(value) {
	return (
		value !== null && typeof value === 'object' && 'type' in value && typeof value.type === 'string'
	);
}


}),
"./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/index.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  asyncWalk: function() { return asyncWalk; },
  walk: function() { return walk; }
});
/* harmony import */var _sync_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sync.js */ "./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/sync.js");
/* harmony import */var _async_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./async.js */ "./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/async.js");



/**
 * @typedef {import('estree').Node} Node
 * @typedef {import('./sync.js').SyncHandler} SyncHandler
 * @typedef {import('./async.js').AsyncHandler} AsyncHandler
 */

/**
 * @param {Node} ast
 * @param {{
 *   enter?: SyncHandler
 *   leave?: SyncHandler
 * }} walker
 * @returns {Node | null}
 */
function walk(ast, { enter, leave }) {
	const instance = new _sync_js__WEBPACK_IMPORTED_MODULE_0__.SyncWalker(enter, leave);
	return instance.visit(ast, null);
}

/**
 * @param {Node} ast
 * @param {{
 *   enter?: AsyncHandler
 *   leave?: AsyncHandler
 * }} walker
 * @returns {Promise<Node | null>}
 */
async function asyncWalk(ast, { enter, leave }) {
	const instance = new _async_js__WEBPACK_IMPORTED_MODULE_1__.AsyncWalker(enter, leave);
	return await instance.visit(ast, null);
}


}),
"./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/sync.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  SyncWalker: function() { return SyncWalker; }
});
/* harmony import */var _walker_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./walker.js */ "./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/walker.js");


/**
 * @typedef { import('estree').Node} Node
 * @typedef { import('./walker.js').WalkerContext} WalkerContext
 * @typedef {(
 *    this: WalkerContext,
 *    node: Node,
 *    parent: Node | null,
 *    key: string | number | symbol | null | undefined,
 *    index: number | null | undefined
 * ) => void} SyncHandler
 */

class SyncWalker extends _walker_js__WEBPACK_IMPORTED_MODULE_0__.WalkerBase {
	/**
	 *
	 * @param {SyncHandler} [enter]
	 * @param {SyncHandler} [leave]
	 */
	constructor(enter, leave) {
		super();

		/** @type {boolean} */
		this.should_skip = false;

		/** @type {boolean} */
		this.should_remove = false;

		/** @type {Node | null} */
		this.replacement = null;

		/** @type {WalkerContext} */
		this.context = {
			skip: () => (this.should_skip = true),
			remove: () => (this.should_remove = true),
			replace: (node) => (this.replacement = node)
		};

		/** @type {SyncHandler | undefined} */
		this.enter = enter;

		/** @type {SyncHandler | undefined} */
		this.leave = leave;
	}

	/**
	 * @template {Node} Parent
	 * @param {Node} node
	 * @param {Parent | null} parent
	 * @param {keyof Parent} [prop]
	 * @param {number | null} [index]
	 * @returns {Node | null}
	 */
	visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			/** @type {keyof Node} */
			let key;

			for (key in node) {
				/** @type {unknown} */
				const value = node[key];

				if (value && typeof value === 'object') {
					if (Array.isArray(value)) {
						const nodes = /** @type {Array<unknown>} */ (value);
						for (let i = 0; i < nodes.length; i += 1) {
							const item = nodes[i];
							if (isNode(item)) {
								if (!this.visit(item, node, key, i)) {
									// removed
									i--;
								}
							}
						}
					} else if (isNode(value)) {
						this.visit(value, node, key, null);
					}
				}
			}

			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}

/**
 * Ducktype a node.
 *
 * @param {unknown} value
 * @returns {value is Node}
 */
function isNode(value) {
	return (
		value !== null && typeof value === 'object' && 'type' in value && typeof value.type === 'string'
	);
}


}),
"./node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/walker.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  WalkerBase: function() { return WalkerBase; }
});
/**
 * @typedef { import('estree').Node} Node
 * @typedef {{
 *   skip: () => void;
 *   remove: () => void;
 *   replace: (node: Node) => void;
 * }} WalkerContext
 */

class WalkerBase {
	constructor() {
		/** @type {boolean} */
		this.should_skip = false;

		/** @type {boolean} */
		this.should_remove = false;

		/** @type {Node | null} */
		this.replacement = null;

		/** @type {WalkerContext} */
		this.context = {
			skip: () => (this.should_skip = true),
			remove: () => (this.should_remove = true),
			replace: (node) => (this.replacement = node)
		};
	}

	/**
	 * @template {Node} Parent
	 * @param {Parent | null | undefined} parent
	 * @param {keyof Parent | null | undefined} prop
	 * @param {number | null | undefined} index
	 * @param {Node} node
	 */
	replace(parent, prop, index, node) {
		if (parent && prop) {
			if (index != null) {
				/** @type {Array<Node>} */ (parent[prop])[index] = node;
			} else {
				/** @type {Node} */ (parent[prop]) = node;
			}
		}
	}

	/**
	 * @template {Node} Parent
	 * @param {Parent | null | undefined} parent
	 * @param {keyof Parent | null | undefined} prop
	 * @param {number | null | undefined} index
	 */
	remove(parent, prop, index) {
		if (parent && prop) {
			if (index !== null && index !== undefined) {
				/** @type {Array<Node>} */ (parent[prop]).splice(index, 1);
			} else {
				delete parent[prop];
			}
		}
	}
}


}),

});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
id: moduleId,
loaded: false,
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);

// Flag the module as loaded
module.loaded = true;
// Return the exports of the module
return module.exports;

}

/************************************************************************/
// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-harmony modules
__webpack_require__.n = function (module) {
	var getter = module && module.__esModule ?
		function () { return module['default']; } :
		function () { return module; };
	__webpack_require__.d(getter, { a: getter });
	return getter;
};




})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = function(exports, definition) {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/global
(() => {
__webpack_require__.g = (function () {
	if (typeof globalThis === 'object') return globalThis;
	try {
		return this || new Function('return this')();
	} catch (e) {
		if (typeof window === 'object') return window;
	}
})();

})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = function (obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
};

})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = function(exports) {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};

})();
// webpack/runtime/node_module_decorator
(() => {
__webpack_require__.nmd = function (module) {
    module.paths = [];
    if (!module.children) module.children = [];
    return module;
};
})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = function () {
	return "1.0.5";
};

})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.0.5";

})();
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _dataset_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dataset/index.js */ "./js/dataset/index.js");


window.DatasetFormWidget = _dataset_index_js__WEBPACK_IMPORTED_MODULE_0__.DatasetFormWidget

})();

})()
;
//# sourceMappingURL=dataset_form_widget.js.map