import he from "he"

import {
  getAvailableVariableNames,
  evaluateConditions,
  evaluateCode,
  checkUserCode,
  renderExternalValueName,
  getTextWidthAndHeight,
} from "./tools"

export const editFormTemplate = (value, options) => {
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
                }">${he.encode(warning.text)}</li>`,
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
                }">${renderExternalValueName(externalValue)}</li>`,
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

export const formTemplate = (form, maindataVisit, formOptions) =>
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
            <label for="column-${column}" class="form-label">${he.encode(
              formOptions.columns[column].title,
            )}</label>
            <input type="text" id="column-${column}" name="${column}" data-column="${column}" value="${he.encode(
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
        <textarea name="comments" cols="40" rows="3" class="form-control" maxlength="1000" id="id_comments" spellcheck="false">${he.encode(
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
      .map((warning) => `<li>${he.encode(warning.text)}</li>`)
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

export const gridTemplate = (value, options, maindataVisit) =>
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
      !evaluateConditions(
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
                      : `${he.encode(element.label)}
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
                        !evaluateConditions(
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
                        : `${he.encode(subElement.label)}
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
    ${displayType[element.content.type]}: ${he.encode(element.label)}
    ${
      element.sub_elements.length
        ? `<ul class="elements">${element.sub_elements
            .map((subElement) => {
              return `<li class="item sub ${
                options.selectedElement === subElement
                  ? "selected-element selected-item"
                  : "unselected-item"
              }">${displayType[subElement.content.type]}: ${he.encode(
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
            <button class="btn btn-danger btn-sm m-1 json-schema-array-remove-item" data-path="${he.encode(
              path,
            )} ${index}">Remove ${he.encode(schema.title || name)}</button>
          </div>`
        })
      }
      returnString += `<button class="btn btn-primary btn-sm json-schema-array-add-item" data-path="${he.encode(
        path,
      )}" data-type="${he.encode(schema.items.type)}">Add ${he.encode(
        schema.title || name,
      )}</button>`
      returnString += `</div>`
      break
    case "string":
      returnString += `<label for="question-${he.encode(
        path.replaceAll(" ", "-"),
      )}" class="form-label ${required ? "requiredField" : ""}">
        ${he.encode(schema.title || name)} ${
          required ? `<span class="asteriskField">*</span>` : ""
        }
        </label>
        ${
          schema.choices
            ? `<div class="col-auto"><select class="select form-select form-control" data-path="${he.encode(
                path,
              )}" id="question-${he.encode(path.replaceAll(" ", "-"))}">
            <option value="">---------</option>
            ${schema.choices.map(
              (choice) =>
                `<option value="${he.encode(choice)}" ${
                  value === choice ? "selected" : ""
                }>${he.encode(choice)}</option>`,
            )}
          </select></div>`
            : `<div class="col-auto"><input type="text" id="question-${he.encode(
                path.replaceAll(" ", "-"),
              )}" value="${he.encode(
                value || "",
              )}" class="form-control vTextField form-control" data-path="${he.encode(
                path,
              )}"></div>`
        }`
      break
    case "number":
    case "integer":
      returnString += `<label for="question-${he.encode(
        path.replaceAll(" ", "-"),
      )}" class="form-label ${required ? "requiredField" : ""}">
        ${he.encode(schema.title || name)} ${
          required ? `<span class="asteriskField">*</span>` : ""
        }
      </label>
      <div class="col-auto">
        <input type="number" id="question-${he.encode(
          path.replaceAll(" ", "-"),
        )}" value="${
          value || ""
        }" class="form-control vTextField" data-path="${he.encode(path)}"
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
      returnString += `<label for="question-${he.encode(
        path.replaceAll(" ", "-"),
      )}" class="form-label ${required ? "requiredField" : ""}">
        ${he.encode(schema.title || name)} ${
          required ? `<span class="asteriskField">*</span>` : ""
        }
      </label>
      <div class="col-auto"><input type="checkbox" class="form-check-input" id="question-${he.encode(
        path.replaceAll(" ", "-"),
      )}" ${value ? "checked" : ""} data-path="${he.encode(path)}"></div>`
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
          ? `<${he.encode(contentObject.tag)}>${he.encode(
              contentObject.text,
            )}</${he.encode(contentObject.tag)}>`
          : he.encode(contentObject.text)
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
                     title="${he.encode(contentObject.caption)}"
                     for="question-${contentObject.column}">${he.encode(
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
                  placeholder="${he.encode(contentObject.placeholder)}"
                  name="question-${contentObject.column}"
                  data-column="${contentObject.column}"
                  tabindex="${
                    contentObject.tabindex > 0
                      ? contentObject.tabindex + 3
                      : contentObject.tabindex
                  }"
                  type="text"
                  value="${he.encode(value)}"
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
                  }">${he.encode(contentObject.text)}</label>`
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
              ${maindataVisit?.readonly ? "disabled" : ""}>${he.encode(
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
                : `<label class="form-label d-block" title="${he.encode(
                    contentObject.caption,
                  )}">
              ${he.encode(contentObject.text)}
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
                         value="${he.encode(option.db_value)}"
                         ${option.checked ? "checked" : ""}
                         ${maindataVisit?.readonly ? "disabled" : ""}
                  >
                  ${he.encode(option.text)}
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
                }" title="${he.encode(contentObject.caption)}">
                ${he.encode(contentObject.text)}
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
                      `<option value="${he.encode(option.db_value)}"
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
              : `<p class="form-label">${he.encode(contentObject.text)}</p>`
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
        value = evaluateCode(
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
            : `<strong>${he.encode(contentObject.text)}</strong>: `
        }
        ${he.encode(String(value))}
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
  const availableVariables = getAvailableVariableNames(
    options.data_schema.properties,
    options.columns,
    value.external_values,
  )
  const warningTestSize = getTextWidthAndHeight(warning.test)
  return `<h1>Warning</h1>
  <div class="mb-3 warning-properties">
    <label class="form-label requiredField">
      Message <span class="asteriskField">*</span>
      <input type="text" name="text" value="${he.encode(
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
        checkUserCode(
          options.data_schema.properties,
          options.columns,
          value.external_values,
          warning.test,
        )
          ? "valid"
          : "invalid"
      }">${he.encode(warning.test)}</textarea>
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
                  `<option value="${he.encode(valueType)}" ${
                    type === valueType ? "selected" : ""
                  }>${he.encode(valueType)}</option>`,
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
                  `<option value="${he.encode(datasetOption)}" ${
                    dataset === datasetOption ? "selected" : ""
                  }>${he.encode(datasetOption)}</option>`,
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
                  `<option value="${he.encode(columnOption)}" ${
                    column === columnOption ? "selected" : ""
                  }>${he.encode(columnOption)}</option>`,
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
                  `<option value="${he.encode(datasetOption)}" ${
                    dataset === datasetOption ? "selected" : ""
                  }>${he.encode(datasetOption)}</option>`,
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
                  `<option value="${he.encode(propertyOption)}" ${
                    property === propertyOption ? "selected" : ""
                  }>${he.encode(propertyOption)}</option>`,
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
        <input type="text" name="value-code" value="${he.encode(
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
  const availableVariables = getAvailableVariableNames(
    options.data_schema.properties,
    options.columns,
    value.external_values,
  )
  let returnString = `<h1>${displayType[element.content.type]}</h1>
  <div id="div_id_label" class="mb-3">
    <label class="form-label requiredField">
      Label <span class="asteriskField">*</span>
      <input type="text" name="label" value="${he.encode(
        element.label,
      )}" maxlength="255" class="label vTextField">
    </label>
  </div>`
  switch (element.content.type) {
    case "html":
      returnString += `<div id="div_id_html" class="mb-3">
        <label class="form-label requiredField">
          HTML <span class="asteriskField">*</span>
          <textarea name="html" cols="40" rows="10" class="html vTextField">${he.encode(
            element.content.html.replaceAll("\\/", "/"),
          )}</textarea>
        </label>
      </div>`
      break
    case "label":
      returnString += `<div class="mb-3">
        <label class="form-label requiredField"> Text <span class="asteriskField">*</span>
          <textarea name="text" cols="40" rows="10" class="textarea form-control" spellcheck="true">${he.encode(
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
            <input type="text" name="text" value="${he.encode(
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
                  return `<option value="${he.encode(String(column[0]))}" ${
                    column[0] === element.content.column ? "selected" : ""
                  }>${he.encode(column[1])}</option>`
                })
                .join("")}
            </select>
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label">
            Caption
            <input type="text" name="caption" class="caption vTextField" value="${he.encode(
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
            <input type="text" name="placeholder" value="${he.encode(
              element.content.placeholder || "",
            )}" maxlength="255" class="placeholder vTextField">
          </label>
        </div>
        <div class="mb-3">
          <label class="form-label">
            Default value
            <input type="text" name="default_value" value="${he.encode(
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
                  return `<option value="${he.encode(property)}" ${
                    property === element.content.property ? "selected" : ""
                  }>${he.encode(property)}</option>`
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
          <input type="text" name="text" class="text vTextField" maxlength="1000" value="${he.encode(
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
                  `<option value="${he.encode(String(column[0]))}" ${
                    column[0] === element.content.column ? "selected" : ""
                  }>${he.encode(column[1])}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>
      <div class="flex-container">
        <label>
          Caption:
          <input type="text" name="caption" class="caption vTextField" maxlength="1000" value="${he.encode(
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
                    <input type="text" name="option-text" value="${he.encode(
                      option.text,
                    )}" class="vTextField">
                  </label>
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    Value
                    <input type="text" name="option-db_value" value="${he.encode(
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
          <input type="text" name="text" class="text vTextField" maxlength="1000" value="${he.encode(
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
                    <input type="text" name="option-text" value="${he.encode(
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
                            }>${he.encode(column[1])}</option>`,
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
      const contentSourceSize = getTextWidthAndHeight(element.content.source)
      returnString += `<div class="mb-3">
        <label class="form-label requiredField">
          Text <span class="asteriskField">*</span>
          <input type="text" name="text" value="${he.encode(
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
            checkUserCode(
              options.data_schema.properties,
              options.columns,
              value.external_values,
              element.content.source,
            )
              ? "valid"
              : "invalid"
          }">${he.encode(element.content.source)}</textarea>
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
          const conditionCodeSize = getTextWidthAndHeight(condition.code)
          return `<div class="condition-form-wrapper">
          <div class="d-flex">
            <div class="mb-3">
              <label class="form-label">
                Condition
                <textarea type="text" name="condition-code" rows="${
                  conditionCodeSize.height
                }" cols="${conditionCodeSize.width}" class="code user-code ${
                  checkUserCode(
                    options.data_schema.properties,
                    options.columns,
                    value.external_values,
                    condition.code,
                  )
                    ? "valid"
                    : "invalid"
                }">${he.encode(condition.code)}</textarea>
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

export const menuItems = (datasetForm) => {
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
