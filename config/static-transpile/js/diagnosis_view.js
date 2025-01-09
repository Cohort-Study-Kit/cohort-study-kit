(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({
"./js/diagnosis_view/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DiagnosisView: function() { return DiagnosisView; }
});
/* harmony import */var _tools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools */ "./js/tools/index.js");
/* harmony import */var choices_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! choices.js */ "./node_modules/.pnpm/choices.js@11.0.2/node_modules/choices.js/public/assets/scripts/choices.mjs");



class DiagnosisView {
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
    const choice = new choices_js__WEBPACK_IMPORTED_MODULE_1__["default"](icdCodeSelector, {
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
          return (0,_tools__WEBPACK_IMPORTED_MODULE_0__.get)(`/api/diagnosis/delete/${this.copsacId}/${id}/`).then(
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
    return (0,_tools__WEBPACK_IMPORTED_MODULE_0__.getJson)(`/api/icd_code/search/${encodeURIComponent(term)}/`).then(
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


}),
"./js/tools/autocomplete.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
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
"./node_modules/.pnpm/choices.js@11.0.2/node_modules/choices.js/public/assets/scripts/choices.mjs": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return Choices; }
});
/*! choices.js v11.0.2 | © 2024 Josh Johnson | https://github.com/jshjohnson/Choices#readme */

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

var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var ActionType = {
    ADD_CHOICE: 'ADD_CHOICE',
    REMOVE_CHOICE: 'REMOVE_CHOICE',
    FILTER_CHOICES: 'FILTER_CHOICES',
    ACTIVATE_CHOICES: 'ACTIVATE_CHOICES',
    CLEAR_CHOICES: 'CLEAR_CHOICES',
    ADD_GROUP: 'ADD_GROUP',
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    HIGHLIGHT_ITEM: 'HIGHLIGHT_ITEM',
};

var EventType = {
    showDropdown: 'showDropdown',
    hideDropdown: 'hideDropdown',
    change: 'change',
    choice: 'choice',
    search: 'search',
    addItem: 'addItem',
    removeItem: 'removeItem',
    highlightItem: 'highlightItem',
    highlightChoice: 'highlightChoice',
    unhighlightItem: 'unhighlightItem',
};

var ObjectsInConfig = ['fuseOptions', 'classNames'];

var PassedElementTypes = {
    Text: 'text',
    SelectOne: 'select-one',
    SelectMultiple: 'select-multiple',
};

var addChoice = function (choice) { return ({
    type: ActionType.ADD_CHOICE,
    choice: choice,
}); };
var removeChoice = function (choice) { return ({
    type: ActionType.REMOVE_CHOICE,
    choice: choice,
}); };
var filterChoices = function (results) { return ({
    type: ActionType.FILTER_CHOICES,
    results: results,
}); };
var activateChoices = function (active) {
    return ({
        type: ActionType.ACTIVATE_CHOICES,
        active: active,
    });
};

var addGroup = function (group) { return ({
    type: ActionType.ADD_GROUP,
    group: group,
}); };

var addItem = function (item) { return ({
    type: ActionType.ADD_ITEM,
    item: item,
}); };
var removeItem$1 = function (item) { return ({
    type: ActionType.REMOVE_ITEM,
    item: item,
}); };
var highlightItem = function (item, highlighted) { return ({
    type: ActionType.HIGHLIGHT_ITEM,
    item: item,
    highlighted: highlighted,
}); };

var getRandomNumber = function (min, max) { return Math.floor(Math.random() * (max - min) + min); };
var generateChars = function (length) {
    return Array.from({ length: length }, function () { return getRandomNumber(0, 36).toString(36); }).join('');
};
var generateId = function (element, prefix) {
    var id = element.id || (element.name && "".concat(element.name, "-").concat(generateChars(2))) || generateChars(4);
    id = id.replace(/(:|\.|\[|\]|,)/g, '');
    id = "".concat(prefix, "-").concat(id);
    return id;
};
var getAdjacentEl = function (startEl, selector, direction) {
    if (direction === void 0) { direction = 1; }
    var prop = "".concat(direction > 0 ? 'next' : 'previous', "ElementSibling");
    var sibling = startEl[prop];
    while (sibling) {
        if (sibling.matches(selector)) {
            return sibling;
        }
        sibling = sibling[prop];
    }
    return null;
};
var isScrolledIntoView = function (element, parent, direction) {
    if (direction === void 0) { direction = 1; }
    var isVisible;
    if (direction > 0) {
        // In view from bottom
        isVisible = parent.scrollTop + parent.offsetHeight >= element.offsetTop + element.offsetHeight;
    }
    else {
        // In view from top
        isVisible = element.offsetTop >= parent.scrollTop;
    }
    return isVisible;
};
var sanitise = function (value) {
    if (typeof value !== 'string') {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            if ('raw' in value) {
                return sanitise(value.raw);
            }
            if ('trusted' in value) {
                return value.trusted;
            }
        }
        return value;
    }
    return value
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/'/g, '&#039;')
        .replace(/"/g, '&quot;');
};
var strToEl = (function () {
    var tmpEl = document.createElement('div');
    return function (str) {
        tmpEl.innerHTML = str.trim();
        var firstChild = tmpEl.children[0];
        while (tmpEl.firstChild) {
            tmpEl.removeChild(tmpEl.firstChild);
        }
        return firstChild;
    };
})();
var resolveNoticeFunction = function (fn, value) {
    return typeof fn === 'function' ? fn(sanitise(value), value) : fn;
};
var resolveStringFunction = function (fn) {
    return typeof fn === 'function' ? fn() : fn;
};
var unwrapStringForRaw = function (s) {
    if (typeof s === 'string') {
        return s;
    }
    if (typeof s === 'object') {
        if ('trusted' in s) {
            return s.trusted;
        }
        if ('raw' in s) {
            return s.raw;
        }
    }
    return '';
};
var unwrapStringForEscaped = function (s) {
    if (typeof s === 'string') {
        return s;
    }
    if (typeof s === 'object') {
        if ('escaped' in s) {
            return s.escaped;
        }
        if ('trusted' in s) {
            return s.trusted;
        }
    }
    return '';
};
var escapeForTemplate = function (allowHTML, s) {
    return allowHTML ? unwrapStringForEscaped(s) : sanitise(s);
};
var setElementHtml = function (el, allowHtml, html) {
    el.innerHTML = escapeForTemplate(allowHtml, html);
};
var sortByAlpha = function (_a, _b) {
    var value = _a.value, _c = _a.label, label = _c === void 0 ? value : _c;
    var value2 = _b.value, _d = _b.label, label2 = _d === void 0 ? value2 : _d;
    return unwrapStringForRaw(label).localeCompare(unwrapStringForRaw(label2), [], {
        sensitivity: 'base',
        ignorePunctuation: true,
        numeric: true,
    });
};
var sortByRank = function (a, b) {
    return a.rank - b.rank;
};
var dispatchEvent = function (element, type, customArgs) {
    if (customArgs === void 0) { customArgs = null; }
    var event = new CustomEvent(type, {
        detail: customArgs,
        bubbles: true,
        cancelable: true,
    });
    return element.dispatchEvent(event);
};
/**
 * Returns an array of keys present on the first but missing on the second object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var diff = function (a, b) {
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    return aKeys.filter(function (i) { return bKeys.indexOf(i) < 0; });
};
var getClassNames = function (ClassNames) {
    return Array.isArray(ClassNames) ? ClassNames : [ClassNames];
};
var getClassNamesSelector = function (option) {
    if (option && Array.isArray(option)) {
        return option
            .map(function (item) {
            return ".".concat(item);
        })
            .join('');
    }
    return ".".concat(option);
};
var addClassesToElement = function (element, className) {
    var _a;
    (_a = element.classList).add.apply(_a, getClassNames(className));
};
var removeClassesFromElement = function (element, className) {
    var _a;
    (_a = element.classList).remove.apply(_a, getClassNames(className));
};
var parseCustomProperties = function (customProperties) {
    if (typeof customProperties !== 'undefined') {
        try {
            return JSON.parse(customProperties);
        }
        catch (e) {
            return customProperties;
        }
    }
    return {};
};
var updateClassList = function (item, add, remove) {
    var itemEl = item.itemEl;
    if (itemEl) {
        removeClassesFromElement(itemEl, remove);
        addClassesToElement(itemEl, add);
    }
};

var Dropdown = /** @class */ (function () {
    function Dropdown(_a) {
        var element = _a.element, type = _a.type, classNames = _a.classNames;
        this.element = element;
        this.classNames = classNames;
        this.type = type;
        this.isActive = false;
    }
    /**
     * Show dropdown to user by adding active state class
     */
    Dropdown.prototype.show = function () {
        addClassesToElement(this.element, this.classNames.activeState);
        this.element.setAttribute('aria-expanded', 'true');
        this.isActive = true;
        return this;
    };
    /**
     * Hide dropdown from user
     */
    Dropdown.prototype.hide = function () {
        removeClassesFromElement(this.element, this.classNames.activeState);
        this.element.setAttribute('aria-expanded', 'false');
        this.isActive = false;
        return this;
    };
    return Dropdown;
}());

var Container = /** @class */ (function () {
    function Container(_a) {
        var element = _a.element, type = _a.type, classNames = _a.classNames, position = _a.position;
        this.element = element;
        this.classNames = classNames;
        this.type = type;
        this.position = position;
        this.isOpen = false;
        this.isFlipped = false;
        this.isDisabled = false;
        this.isLoading = false;
    }
    /**
     * Determine whether container should be flipped based on passed
     * dropdown position
     */
    Container.prototype.shouldFlip = function (dropdownPos, dropdownHeight) {
        // If flip is enabled and the dropdown bottom position is
        // greater than the window height flip the dropdown.
        var shouldFlip = false;
        if (this.position === 'auto') {
            shouldFlip =
                this.element.getBoundingClientRect().top - dropdownHeight >= 0 &&
                    !window.matchMedia("(min-height: ".concat(dropdownPos + 1, "px)")).matches;
        }
        else if (this.position === 'top') {
            shouldFlip = true;
        }
        return shouldFlip;
    };
    Container.prototype.setActiveDescendant = function (activeDescendantID) {
        this.element.setAttribute('aria-activedescendant', activeDescendantID);
    };
    Container.prototype.removeActiveDescendant = function () {
        this.element.removeAttribute('aria-activedescendant');
    };
    Container.prototype.open = function (dropdownPos, dropdownHeight) {
        addClassesToElement(this.element, this.classNames.openState);
        this.element.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        if (this.shouldFlip(dropdownPos, dropdownHeight)) {
            addClassesToElement(this.element, this.classNames.flippedState);
            this.isFlipped = true;
        }
    };
    Container.prototype.close = function () {
        removeClassesFromElement(this.element, this.classNames.openState);
        this.element.setAttribute('aria-expanded', 'false');
        this.removeActiveDescendant();
        this.isOpen = false;
        // A dropdown flips if it does not have space within the page
        if (this.isFlipped) {
            removeClassesFromElement(this.element, this.classNames.flippedState);
            this.isFlipped = false;
        }
    };
    Container.prototype.addFocusState = function () {
        addClassesToElement(this.element, this.classNames.focusState);
    };
    Container.prototype.removeFocusState = function () {
        removeClassesFromElement(this.element, this.classNames.focusState);
    };
    Container.prototype.enable = function () {
        removeClassesFromElement(this.element, this.classNames.disabledState);
        this.element.removeAttribute('aria-disabled');
        if (this.type === PassedElementTypes.SelectOne) {
            this.element.setAttribute('tabindex', '0');
        }
        this.isDisabled = false;
    };
    Container.prototype.disable = function () {
        addClassesToElement(this.element, this.classNames.disabledState);
        this.element.setAttribute('aria-disabled', 'true');
        if (this.type === PassedElementTypes.SelectOne) {
            this.element.setAttribute('tabindex', '-1');
        }
        this.isDisabled = true;
    };
    Container.prototype.wrap = function (element) {
        var el = this.element;
        var parentNode = element.parentNode;
        if (parentNode) {
            if (element.nextSibling) {
                parentNode.insertBefore(el, element.nextSibling);
            }
            else {
                parentNode.appendChild(el);
            }
        }
        el.appendChild(element);
    };
    Container.prototype.unwrap = function (element) {
        var el = this.element;
        var parentNode = el.parentNode;
        if (parentNode) {
            // Move passed element outside this element
            parentNode.insertBefore(element, el);
            // Remove this element
            parentNode.removeChild(el);
        }
    };
    Container.prototype.addLoadingState = function () {
        addClassesToElement(this.element, this.classNames.loadingState);
        this.element.setAttribute('aria-busy', 'true');
        this.isLoading = true;
    };
    Container.prototype.removeLoadingState = function () {
        removeClassesFromElement(this.element, this.classNames.loadingState);
        this.element.removeAttribute('aria-busy');
        this.isLoading = false;
    };
    return Container;
}());

var Input = /** @class */ (function () {
    function Input(_a) {
        var element = _a.element, type = _a.type, classNames = _a.classNames, preventPaste = _a.preventPaste;
        this.element = element;
        this.type = type;
        this.classNames = classNames;
        this.preventPaste = preventPaste;
        this.isFocussed = this.element.isEqualNode(document.activeElement);
        this.isDisabled = element.disabled;
        this._onPaste = this._onPaste.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onBlur = this._onBlur.bind(this);
    }
    Object.defineProperty(Input.prototype, "placeholder", {
        set: function (placeholder) {
            this.element.placeholder = placeholder;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Input.prototype, "value", {
        get: function () {
            return this.element.value;
        },
        set: function (value) {
            this.element.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Input.prototype.addEventListeners = function () {
        var el = this.element;
        el.addEventListener('paste', this._onPaste);
        el.addEventListener('input', this._onInput, {
            passive: true,
        });
        el.addEventListener('focus', this._onFocus, {
            passive: true,
        });
        el.addEventListener('blur', this._onBlur, {
            passive: true,
        });
    };
    Input.prototype.removeEventListeners = function () {
        var el = this.element;
        el.removeEventListener('input', this._onInput);
        el.removeEventListener('paste', this._onPaste);
        el.removeEventListener('focus', this._onFocus);
        el.removeEventListener('blur', this._onBlur);
    };
    Input.prototype.enable = function () {
        var el = this.element;
        el.removeAttribute('disabled');
        this.isDisabled = false;
    };
    Input.prototype.disable = function () {
        var el = this.element;
        el.setAttribute('disabled', '');
        this.isDisabled = true;
    };
    Input.prototype.focus = function () {
        if (!this.isFocussed) {
            this.element.focus();
        }
    };
    Input.prototype.blur = function () {
        if (this.isFocussed) {
            this.element.blur();
        }
    };
    Input.prototype.clear = function (setWidth) {
        if (setWidth === void 0) { setWidth = true; }
        this.element.value = '';
        if (setWidth) {
            this.setWidth();
        }
        return this;
    };
    /**
     * Set the correct input width based on placeholder
     * value or input value
     */
    Input.prototype.setWidth = function () {
        // Resize input to contents or placeholder
        var element = this.element;
        element.style.minWidth = "".concat(element.placeholder.length + 1, "ch");
        element.style.width = "".concat(element.value.length + 1, "ch");
    };
    Input.prototype.setActiveDescendant = function (activeDescendantID) {
        this.element.setAttribute('aria-activedescendant', activeDescendantID);
    };
    Input.prototype.removeActiveDescendant = function () {
        this.element.removeAttribute('aria-activedescendant');
    };
    Input.prototype._onInput = function () {
        if (this.type !== PassedElementTypes.SelectOne) {
            this.setWidth();
        }
    };
    Input.prototype._onPaste = function (event) {
        if (this.preventPaste) {
            event.preventDefault();
        }
    };
    Input.prototype._onFocus = function () {
        this.isFocussed = true;
    };
    Input.prototype._onBlur = function () {
        this.isFocussed = false;
    };
    return Input;
}());

var SCROLLING_SPEED = 4;

var List = /** @class */ (function () {
    function List(_a) {
        var element = _a.element;
        this.element = element;
        this.scrollPos = this.element.scrollTop;
        this.height = this.element.offsetHeight;
    }
    List.prototype.prepend = function (node) {
        var child = this.element.firstElementChild;
        if (child) {
            this.element.insertBefore(node, child);
        }
        else {
            this.element.append(node);
        }
    };
    List.prototype.scrollToTop = function () {
        this.element.scrollTop = 0;
    };
    List.prototype.scrollToChildElement = function (element, direction) {
        var _this = this;
        if (!element) {
            return;
        }
        var listHeight = this.element.offsetHeight;
        // Scroll position of dropdown
        var listScrollPosition = this.element.scrollTop + listHeight;
        var elementHeight = element.offsetHeight;
        // Distance from bottom of element to top of parent
        var elementPos = element.offsetTop + elementHeight;
        // Difference between the element and scroll position
        var destination = direction > 0 ? this.element.scrollTop + elementPos - listScrollPosition : element.offsetTop;
        requestAnimationFrame(function () {
            _this._animateScroll(destination, direction);
        });
    };
    List.prototype._scrollDown = function (scrollPos, strength, destination) {
        var easing = (destination - scrollPos) / strength;
        var distance = easing > 1 ? easing : 1;
        this.element.scrollTop = scrollPos + distance;
    };
    List.prototype._scrollUp = function (scrollPos, strength, destination) {
        var easing = (scrollPos - destination) / strength;
        var distance = easing > 1 ? easing : 1;
        this.element.scrollTop = scrollPos - distance;
    };
    List.prototype._animateScroll = function (destination, direction) {
        var _this = this;
        var strength = SCROLLING_SPEED;
        var choiceListScrollTop = this.element.scrollTop;
        var continueAnimation = false;
        if (direction > 0) {
            this._scrollDown(choiceListScrollTop, strength, destination);
            if (choiceListScrollTop < destination) {
                continueAnimation = true;
            }
        }
        else {
            this._scrollUp(choiceListScrollTop, strength, destination);
            if (choiceListScrollTop > destination) {
                continueAnimation = true;
            }
        }
        if (continueAnimation) {
            requestAnimationFrame(function () {
                _this._animateScroll(destination, direction);
            });
        }
    };
    return List;
}());

var WrappedElement = /** @class */ (function () {
    function WrappedElement(_a) {
        var element = _a.element, classNames = _a.classNames;
        this.element = element;
        this.classNames = classNames;
        this.isDisabled = false;
    }
    Object.defineProperty(WrappedElement.prototype, "isActive", {
        get: function () {
            return this.element.dataset.choice === 'active';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WrappedElement.prototype, "dir", {
        get: function () {
            return this.element.dir;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WrappedElement.prototype, "value", {
        get: function () {
            return this.element.value;
        },
        set: function (value) {
            this.element.setAttribute('value', value);
            this.element.value = value;
        },
        enumerable: false,
        configurable: true
    });
    WrappedElement.prototype.conceal = function () {
        var el = this.element;
        // Hide passed input
        addClassesToElement(el, this.classNames.input);
        el.hidden = true;
        // Remove element from tab index
        el.tabIndex = -1;
        // Backup original styles if any
        var origStyle = el.getAttribute('style');
        if (origStyle) {
            el.setAttribute('data-choice-orig-style', origStyle);
        }
        el.setAttribute('data-choice', 'active');
    };
    WrappedElement.prototype.reveal = function () {
        var el = this.element;
        // Reinstate passed element
        removeClassesFromElement(el, this.classNames.input);
        el.hidden = false;
        el.removeAttribute('tabindex');
        // Recover original styles if any
        var origStyle = el.getAttribute('data-choice-orig-style');
        if (origStyle) {
            el.removeAttribute('data-choice-orig-style');
            el.setAttribute('style', origStyle);
        }
        else {
            el.removeAttribute('style');
        }
        el.removeAttribute('data-choice');
    };
    WrappedElement.prototype.enable = function () {
        this.element.removeAttribute('disabled');
        this.element.disabled = false;
        this.isDisabled = false;
    };
    WrappedElement.prototype.disable = function () {
        this.element.setAttribute('disabled', '');
        this.element.disabled = true;
        this.isDisabled = true;
    };
    WrappedElement.prototype.triggerEvent = function (eventType, data) {
        dispatchEvent(this.element, eventType, data || {});
    };
    return WrappedElement;
}());

var WrappedInput = /** @class */ (function (_super) {
    __extends(WrappedInput, _super);
    function WrappedInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return WrappedInput;
}(WrappedElement));

var coerceBool = function (arg, defaultValue) {
    if (defaultValue === void 0) { defaultValue = true; }
    return typeof arg === 'undefined' ? defaultValue : !!arg;
};
var stringToHtmlClass = function (input) {
    if (typeof input === 'string') {
        // eslint-disable-next-line no-param-reassign
        input = input.split(' ').filter(function (s) { return s.length; });
    }
    if (Array.isArray(input) && input.length) {
        return input;
    }
    return undefined;
};
var mapInputToChoice = function (value, allowGroup) {
    if (typeof value === 'string') {
        var result_1 = mapInputToChoice({
            value: value,
            label: value,
        }, false);
        return result_1;
    }
    var groupOrChoice = value;
    if ('choices' in groupOrChoice) {
        if (!allowGroup) {
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup
            throw new TypeError("optGroup is not allowed");
        }
        var group = groupOrChoice;
        var choices = group.choices.map(function (e) { return mapInputToChoice(e, false); });
        var result_2 = {
            id: 0, // actual ID will be assigned during _addGroup
            label: unwrapStringForRaw(group.label) || group.value,
            active: !!choices.length,
            disabled: !!group.disabled,
            choices: choices,
        };
        return result_2;
    }
    var choice = groupOrChoice;
    var result = {
        id: 0, // actual ID will be assigned during _addChoice
        group: null, // actual group will be assigned during _addGroup but before _addChoice
        score: 0, // used in search
        rank: 0, // used in search, stable sort order
        value: choice.value,
        label: choice.label || choice.value,
        active: coerceBool(choice.active),
        selected: coerceBool(choice.selected, false),
        disabled: coerceBool(choice.disabled, false),
        placeholder: coerceBool(choice.placeholder, false),
        highlighted: false,
        labelClass: stringToHtmlClass(choice.labelClass),
        labelDescription: choice.labelDescription,
        customProperties: choice.customProperties,
    };
    return result;
};

var isHtmlInputElement = function (e) { return e.tagName === 'INPUT'; };
var isHtmlSelectElement = function (e) { return e.tagName === 'SELECT'; };
var isHtmlOption = function (e) { return e.tagName === 'OPTION'; };
var isHtmlOptgroup = function (e) { return e.tagName === 'OPTGROUP'; };

var WrappedSelect = /** @class */ (function (_super) {
    __extends(WrappedSelect, _super);
    function WrappedSelect(_a) {
        var element = _a.element, classNames = _a.classNames, template = _a.template, extractPlaceholder = _a.extractPlaceholder;
        var _this = _super.call(this, { element: element, classNames: classNames }) || this;
        _this.template = template;
        _this.extractPlaceholder = extractPlaceholder;
        return _this;
    }
    Object.defineProperty(WrappedSelect.prototype, "placeholderOption", {
        get: function () {
            return (this.element.querySelector('option[value=""]') ||
                // Backward compatibility layer for the non-standard placeholder attribute supported in older versions.
                this.element.querySelector('option[placeholder]'));
        },
        enumerable: false,
        configurable: true
    });
    WrappedSelect.prototype.addOptions = function (choices) {
        var _this = this;
        var fragment = document.createDocumentFragment();
        choices.forEach(function (obj) {
            var choice = obj;
            if (choice.element) {
                return;
            }
            var option = _this.template(choice);
            fragment.appendChild(option);
            choice.element = option;
        });
        this.element.appendChild(fragment);
    };
    WrappedSelect.prototype.optionsAsChoices = function () {
        var _this = this;
        var choices = [];
        this.element.querySelectorAll(':scope > option, :scope > optgroup').forEach(function (e) {
            if (isHtmlOption(e)) {
                choices.push(_this._optionToChoice(e));
            }
            else if (isHtmlOptgroup(e)) {
                choices.push(_this._optgroupToChoice(e));
            }
            // todo: hr as empty optgroup, requires displaying empty opt-groups to be useful
        });
        return choices;
    };
    // eslint-disable-next-line class-methods-use-this
    WrappedSelect.prototype._optionToChoice = function (option) {
        // option.value returns the label if there is no value attribute, which can break legacy placeholder attribute support
        if (!option.hasAttribute('value') && option.hasAttribute('placeholder')) {
            option.setAttribute('value', '');
            option.value = '';
        }
        return {
            id: 0,
            group: null,
            score: 0,
            rank: 0,
            value: option.value,
            label: option.innerHTML,
            element: option,
            active: true,
            // this returns true if nothing is selected on initial load, which will break placeholder support
            selected: this.extractPlaceholder ? option.selected : option.hasAttribute('selected'),
            disabled: option.disabled,
            highlighted: false,
            placeholder: this.extractPlaceholder && (!option.value || option.hasAttribute('placeholder')),
            labelClass: typeof option.dataset.labelClass !== 'undefined' ? stringToHtmlClass(option.dataset.labelClass) : undefined,
            labelDescription: typeof option.dataset.labelDescription !== 'undefined' ? option.dataset.labelDescription : undefined,
            customProperties: parseCustomProperties(option.dataset.customProperties),
        };
    };
    WrappedSelect.prototype._optgroupToChoice = function (optgroup) {
        var _this = this;
        var options = optgroup.querySelectorAll('option');
        var choices = Array.from(options).map(function (option) { return _this._optionToChoice(option); });
        return {
            id: 0,
            label: optgroup.label || '',
            element: optgroup,
            active: !!choices.length,
            disabled: optgroup.disabled,
            choices: choices,
        };
    };
    return WrappedSelect;
}(WrappedElement));

var DEFAULT_CLASSNAMES = {
    containerOuter: ['choices'],
    containerInner: ['choices__inner'],
    input: ['choices__input'],
    inputCloned: ['choices__input--cloned'],
    list: ['choices__list'],
    listItems: ['choices__list--multiple'],
    listSingle: ['choices__list--single'],
    listDropdown: ['choices__list--dropdown'],
    item: ['choices__item'],
    itemSelectable: ['choices__item--selectable'],
    itemDisabled: ['choices__item--disabled'],
    itemChoice: ['choices__item--choice'],
    description: ['choices__description'],
    placeholder: ['choices__placeholder'],
    group: ['choices__group'],
    groupHeading: ['choices__heading'],
    button: ['choices__button'],
    activeState: ['is-active'],
    focusState: ['is-focused'],
    openState: ['is-open'],
    disabledState: ['is-disabled'],
    highlightedState: ['is-highlighted'],
    selectedState: ['is-selected'],
    flippedState: ['is-flipped'],
    loadingState: ['is-loading'],
    notice: ['choices__notice'],
    addChoice: ['choices__item--selectable', 'add-choice'],
    noResults: ['has-no-results'],
    noChoices: ['has-no-choices'],
};
var DEFAULT_CONFIG = {
    items: [],
    choices: [],
    silent: false,
    renderChoiceLimit: -1,
    maxItemCount: -1,
    closeDropdownOnSelect: 'auto',
    singleModeForMultiSelect: false,
    addChoices: false,
    addItems: true,
    addItemFilter: function (value) { return !!value && value !== ''; },
    removeItems: true,
    removeItemButton: false,
    removeItemButtonAlignLeft: false,
    editItems: false,
    allowHTML: false,
    allowHtmlUserInput: false,
    duplicateItemsAllowed: true,
    delimiter: ',',
    paste: true,
    searchEnabled: true,
    searchChoices: true,
    searchFloor: 1,
    searchResultLimit: 4,
    searchFields: ['label', 'value'],
    position: 'auto',
    resetScrollPosition: true,
    shouldSort: true,
    shouldSortItems: false,
    sorter: sortByAlpha,
    shadowRoot: null,
    placeholder: true,
    placeholderValue: null,
    searchPlaceholderValue: null,
    prependValue: null,
    appendValue: null,
    renderSelectedChoices: 'auto',
    loadingText: 'Loading...',
    noResultsText: 'No results found',
    noChoicesText: 'No choices to choose from',
    itemSelectText: 'Press to select',
    uniqueItemText: 'Only unique values can be added',
    customAddItemText: 'Only values matching specific conditions can be added',
    addItemText: function (value) { return "Press Enter to add <b>\"".concat(value, "\"</b>"); },
    removeItemIconText: function () { return "Remove item"; },
    removeItemLabelText: function (value) { return "Remove item: ".concat(value); },
    maxItemText: function (maxItemCount) { return "Only ".concat(maxItemCount, " values can be added"); },
    valueComparer: function (value1, value2) { return value1 === value2; },
    fuseOptions: {
        includeScore: true,
    },
    labelId: '',
    callbackOnInit: null,
    callbackOnCreateTemplates: null,
    classNames: DEFAULT_CLASSNAMES,
    appendGroupInSearch: false,
};

var removeItem = function (item) {
    var itemEl = item.itemEl;
    if (itemEl) {
        itemEl.remove();
        item.itemEl = undefined;
    }
};
function items(s, action, context) {
    var state = s;
    var update = true;
    switch (action.type) {
        case ActionType.ADD_ITEM: {
            action.item.selected = true;
            var el = action.item.element;
            if (el) {
                el.selected = true;
                el.setAttribute('selected', '');
            }
            state.push(action.item);
            break;
        }
        case ActionType.REMOVE_ITEM: {
            action.item.selected = false;
            var el = action.item.element;
            if (el) {
                el.selected = false;
                el.removeAttribute('selected');
                // For a select-one, if all options are deselected, the first item is selected. To set a black value, select.value needs to be set
                var select = el.parentElement;
                if (select && isHtmlSelectElement(select) && select.type === PassedElementTypes.SelectOne) {
                    select.value = '';
                }
            }
            // this is mixing concerns, but this is *so much faster*
            removeItem(action.item);
            state = state.filter(function (choice) { return choice.id !== action.item.id; });
            break;
        }
        case ActionType.REMOVE_CHOICE: {
            removeItem(action.choice);
            state = state.filter(function (item) { return item.id !== action.choice.id; });
            break;
        }
        case ActionType.HIGHLIGHT_ITEM: {
            var highlighted = action.highlighted;
            var item = state.find(function (obj) { return obj.id === action.item.id; });
            if (item && item.highlighted !== highlighted) {
                item.highlighted = highlighted;
                if (context) {
                    updateClassList(item, highlighted ? context.classNames.highlightedState : context.classNames.selectedState, highlighted ? context.classNames.selectedState : context.classNames.highlightedState);
                }
            }
            break;
        }
        default: {
            update = false;
            break;
        }
    }
    return { state: state, update: update };
}

function groups(s, action) {
    var state = s;
    var update = true;
    switch (action.type) {
        case ActionType.ADD_GROUP: {
            state.push(action.group);
            break;
        }
        case ActionType.CLEAR_CHOICES: {
            state = [];
            break;
        }
        default: {
            update = false;
            break;
        }
    }
    return { state: state, update: update };
}

/* eslint-disable */
function choices(s, action, context) {
    var state = s;
    var update = true;
    switch (action.type) {
        case ActionType.ADD_CHOICE: {
            state.push(action.choice);
            break;
        }
        case ActionType.REMOVE_CHOICE: {
            action.choice.choiceEl = undefined;
            if (action.choice.group) {
                action.choice.group.choices = action.choice.group.choices.filter(function (obj) { return obj.id !== action.choice.id; });
            }
            state = state.filter(function (obj) { return obj.id !== action.choice.id; });
            break;
        }
        case ActionType.ADD_ITEM:
        case ActionType.REMOVE_ITEM: {
            action.item.choiceEl = undefined;
            break;
        }
        case ActionType.FILTER_CHOICES: {
            // avoid O(n^2) algorithm complexity when searching/filtering choices
            var scoreLookup_1 = [];
            action.results.forEach(function (result) {
                scoreLookup_1[result.item.id] = result;
            });
            state.forEach(function (choice) {
                var result = scoreLookup_1[choice.id];
                if (result !== undefined) {
                    choice.score = result.score;
                    choice.rank = result.rank;
                    choice.active = true;
                }
                else {
                    choice.score = 0;
                    choice.rank = 0;
                    choice.active = false;
                }
                if (context && context.appendGroupInSearch) {
                    choice.choiceEl = undefined;
                }
            });
            break;
        }
        case ActionType.ACTIVATE_CHOICES: {
            state.forEach(function (choice) {
                choice.active = action.active;
                if (context && context.appendGroupInSearch) {
                    choice.choiceEl = undefined;
                }
            });
            break;
        }
        case ActionType.CLEAR_CHOICES: {
            state = [];
            break;
        }
        default: {
            update = false;
            break;
        }
    }
    return { state: state, update: update };
}

var reducers = {
    groups: groups,
    items: items,
    choices: choices,
};
var Store = /** @class */ (function () {
    function Store(context) {
        this._state = this.defaultState;
        this._listeners = [];
        this._txn = 0;
        this._context = context;
    }
    Object.defineProperty(Store.prototype, "defaultState", {
        // eslint-disable-next-line class-methods-use-this
        get: function () {
            return {
                groups: [],
                items: [],
                choices: [],
            };
        },
        enumerable: false,
        configurable: true
    });
    // eslint-disable-next-line class-methods-use-this
    Store.prototype.changeSet = function (init) {
        return {
            groups: init,
            items: init,
            choices: init,
        };
    };
    Store.prototype.reset = function () {
        this._state = this.defaultState;
        var changes = this.changeSet(true);
        if (this._txn) {
            this._changeSet = changes;
        }
        else {
            this._listeners.forEach(function (l) { return l(changes); });
        }
    };
    Store.prototype.subscribe = function (onChange) {
        this._listeners.push(onChange);
        return this;
    };
    Store.prototype.dispatch = function (action) {
        var _this = this;
        var state = this._state;
        var hasChanges = false;
        var changes = this._changeSet || this.changeSet(false);
        Object.keys(reducers).forEach(function (key) {
            var stateUpdate = reducers[key](state[key], action, _this._context);
            if (stateUpdate.update) {
                hasChanges = true;
                changes[key] = true;
                state[key] = stateUpdate.state;
            }
        });
        if (hasChanges) {
            if (this._txn) {
                this._changeSet = changes;
            }
            else {
                this._listeners.forEach(function (l) { return l(changes); });
            }
        }
    };
    Store.prototype.withTxn = function (func) {
        this._txn++;
        try {
            func();
        }
        finally {
            this._txn = Math.max(0, this._txn - 1);
            if (!this._txn) {
                var changeSet_1 = this._changeSet;
                if (changeSet_1) {
                    this._changeSet = undefined;
                    this._listeners.forEach(function (l) { return l(changeSet_1); });
                }
            }
        }
    };
    Object.defineProperty(Store.prototype, "state", {
        /**
         * Get store object
         */
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "items", {
        /**
         * Get items from store
         */
        get: function () {
            return this.state.items;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "highlightedActiveItems", {
        /**
         * Get highlighted items from store
         */
        get: function () {
            return this.items.filter(function (item) { return !item.disabled && item.active && item.highlighted; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "choices", {
        /**
         * Get choices from store
         */
        get: function () {
            return this.state.choices;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "activeChoices", {
        /**
         * Get active choices from store
         */
        get: function () {
            return this.choices.filter(function (choice) { return choice.active; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "searchableChoices", {
        /**
         * Get choices that can be searched (excluding placeholders)
         */
        get: function () {
            return this.choices.filter(function (choice) { return !choice.disabled && !choice.placeholder; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "groups", {
        /**
         * Get groups from store
         */
        get: function () {
            return this.state.groups;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "activeGroups", {
        /**
         * Get active groups from store
         */
        get: function () {
            var _this = this;
            return this.state.groups.filter(function (group) {
                var isActive = group.active && !group.disabled;
                var hasActiveOptions = _this.state.choices.some(function (choice) { return choice.active && !choice.disabled; });
                return isActive && hasActiveOptions;
            }, []);
        },
        enumerable: false,
        configurable: true
    });
    Store.prototype.inTxn = function () {
        return this._txn > 0;
    };
    /**
     * Get single choice by it's ID
     */
    Store.prototype.getChoiceById = function (id) {
        return this.activeChoices.find(function (choice) { return choice.id === id; });
    };
    /**
     * Get group by group id
     */
    Store.prototype.getGroupById = function (id) {
        return this.groups.find(function (group) { return group.id === id; });
    };
    return Store;
}());

var NoticeTypes = {
    noChoices: 'no-choices',
    noResults: 'no-results',
    addChoice: 'add-choice',
    generic: '',
};

function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

/**
 * Fuse.js v7.0.0 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2023 Kiro Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function isArray(value) {
  return !Array.isArray ? getTag(value) === '[object Array]' : Array.isArray(value);
}

// Adapted from: https://github.com/lodash/lodash/blob/master/.internal/baseToString.js
const INFINITY = 1 / 0;
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  let result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}
function toString(value) {
  return value == null ? '' : baseToString(value);
}
function isString(value) {
  return typeof value === 'string';
}
function isNumber(value) {
  return typeof value === 'number';
}

// Adapted from: https://github.com/lodash/lodash/blob/master/isBoolean.js
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && getTag(value) == '[object Boolean]';
}
function isObject(value) {
  return typeof value === 'object';
}

// Checks if `value` is object-like.
function isObjectLike(value) {
  return isObject(value) && value !== null;
}
function isDefined(value) {
  return value !== undefined && value !== null;
}
function isBlank(value) {
  return !value.trim().length;
}

// Gets the `toStringTag` of `value`.
// Adapted from: https://github.com/lodash/lodash/blob/master/.internal/getTag.js
function getTag(value) {
  return value == null ? value === undefined ? '[object Undefined]' : '[object Null]' : Object.prototype.toString.call(value);
}
const EXTENDED_SEARCH_UNAVAILABLE = 'Extended search is not available';
const INCORRECT_INDEX_TYPE = "Incorrect 'index' type";
const LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = key => `Invalid value for key ${key}`;
const PATTERN_LENGTH_TOO_LARGE = max => `Pattern length exceeds max of ${max}.`;
const MISSING_KEY_PROPERTY = name => `Missing ${name} property in key`;
const INVALID_KEY_WEIGHT_VALUE = key => `Property 'weight' in key '${key}' must be a positive integer`;
const hasOwn = Object.prototype.hasOwnProperty;
class KeyStore {
  constructor(keys) {
    this._keys = [];
    this._keyMap = {};
    let totalWeight = 0;
    keys.forEach(key => {
      let obj = createKey(key);
      this._keys.push(obj);
      this._keyMap[obj.id] = obj;
      totalWeight += obj.weight;
    });

    // Normalize weights so that their sum is equal to 1
    this._keys.forEach(key => {
      key.weight /= totalWeight;
    });
  }
  get(keyId) {
    return this._keyMap[keyId];
  }
  keys() {
    return this._keys;
  }
  toJSON() {
    return JSON.stringify(this._keys);
  }
}
function createKey(key) {
  let path = null;
  let id = null;
  let src = null;
  let weight = 1;
  let getFn = null;
  if (isString(key) || isArray(key)) {
    src = key;
    path = createKeyPath(key);
    id = createKeyId(key);
  } else {
    if (!hasOwn.call(key, 'name')) {
      throw new Error(MISSING_KEY_PROPERTY('name'));
    }
    const name = key.name;
    src = name;
    if (hasOwn.call(key, 'weight')) {
      weight = key.weight;
      if (weight <= 0) {
        throw new Error(INVALID_KEY_WEIGHT_VALUE(name));
      }
    }
    path = createKeyPath(name);
    id = createKeyId(name);
    getFn = key.getFn;
  }
  return {
    path,
    id,
    weight,
    src,
    getFn
  };
}
function createKeyPath(key) {
  return isArray(key) ? key : key.split('.');
}
function createKeyId(key) {
  return isArray(key) ? key.join('.') : key;
}
function get(obj, path) {
  let list = [];
  let arr = false;
  const deepGet = (obj, path, index) => {
    if (!isDefined(obj)) {
      return;
    }
    if (!path[index]) {
      // If there's no path left, we've arrived at the object we care about.
      list.push(obj);
    } else {
      let key = path[index];
      const value = obj[key];
      if (!isDefined(value)) {
        return;
      }

      // If we're at the last value in the path, and if it's a string/number/bool,
      // add it to the list
      if (index === path.length - 1 && (isString(value) || isNumber(value) || isBoolean(value))) {
        list.push(toString(value));
      } else if (isArray(value)) {
        arr = true;
        // Search each item in the array.
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path, index + 1);
        }
      } else if (path.length) {
        // An object. Recurse further.
        deepGet(value, path, index + 1);
      }
    }
  };

  // Backwards compatibility (since path used to be a string)
  deepGet(obj, isString(path) ? path.split('.') : path, 0);
  return arr ? list : list[0];
}
const MatchOptions = {
  // Whether the matches should be included in the result set. When `true`, each record in the result
  // set will include the indices of the matched characters.
  // These can consequently be used for highlighting purposes.
  includeMatches: false,
  // When `true`, the matching function will continue to the end of a search pattern even if
  // a perfect match has already been located in the string.
  findAllMatches: false,
  // Minimum number of characters that must be matched before a result is considered a match
  minMatchCharLength: 1
};
const BasicOptions = {
  // When `true`, the algorithm continues searching to the end of the input even if a perfect
  // match is found before the end of the same input.
  isCaseSensitive: false,
  // When true, the matching function will continue to the end of a search pattern even if
  includeScore: false,
  // List of properties that will be searched. This also supports nested properties.
  keys: [],
  // Whether to sort the result list, by score
  shouldSort: true,
  // Default sort function: sort by ascending score, ascending index
  sortFn: (a, b) => a.score === b.score ? a.idx < b.idx ? -1 : 1 : a.score < b.score ? -1 : 1
};
const FuzzyOptions = {
  // Approximately where in the text is the pattern expected to be found?
  location: 0,
  // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
  // (of both letters and location), a threshold of '1.0' would match anything.
  threshold: 0.6,
  // Determines how close the match must be to the fuzzy location (specified above).
  // An exact letter match which is 'distance' characters away from the fuzzy location
  // would score as a complete mismatch. A distance of '0' requires the match be at
  // the exact location specified, a threshold of '1000' would require a perfect match
  // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
  distance: 100
};
const AdvancedOptions = {
  // When `true`, it enables the use of unix-like search commands
  useExtendedSearch: false,
  // The get function to use when fetching an object's properties.
  // The default will search nested paths *ie foo.bar.baz*
  getFn: get,
  // When `true`, search will ignore `location` and `distance`, so it won't matter
  // where in the string the pattern appears.
  // More info: https://fusejs.io/concepts/scoring-theory.html#fuzziness-score
  ignoreLocation: false,
  // When `true`, the calculation for the relevance score (used for sorting) will
  // ignore the field-length norm.
  // More info: https://fusejs.io/concepts/scoring-theory.html#field-length-norm
  ignoreFieldNorm: false,
  // The weight to determine how much field length norm effects scoring.
  fieldNormWeight: 1
};
var Config = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, BasicOptions), MatchOptions), FuzzyOptions), AdvancedOptions);
const SPACE = /[^ ]+/g;

// Field-length norm: the shorter the field, the higher the weight.
// Set to 3 decimals to reduce index size.
function norm(weight = 1, mantissa = 3) {
  const cache = new Map();
  const m = Math.pow(10, mantissa);
  return {
    get(value) {
      const numTokens = value.match(SPACE).length;
      if (cache.has(numTokens)) {
        return cache.get(numTokens);
      }

      // Default function is 1/sqrt(x), weight makes that variable
      const norm = 1 / Math.pow(numTokens, 0.5 * weight);

      // In place of `toFixed(mantissa)`, for faster computation
      const n = parseFloat(Math.round(norm * m) / m);
      cache.set(numTokens, n);
      return n;
    },
    clear() {
      cache.clear();
    }
  };
}
class FuseIndex {
  constructor({
    getFn = Config.getFn,
    fieldNormWeight = Config.fieldNormWeight
  } = {}) {
    this.norm = norm(fieldNormWeight, 3);
    this.getFn = getFn;
    this.isCreated = false;
    this.setIndexRecords();
  }
  setSources(docs = []) {
    this.docs = docs;
  }
  setIndexRecords(records = []) {
    this.records = records;
  }
  setKeys(keys = []) {
    this.keys = keys;
    this._keysMap = {};
    keys.forEach((key, idx) => {
      this._keysMap[key.id] = idx;
    });
  }
  create() {
    if (this.isCreated || !this.docs.length) {
      return;
    }
    this.isCreated = true;

    // List is Array<String>
    if (isString(this.docs[0])) {
      this.docs.forEach((doc, docIndex) => {
        this._addString(doc, docIndex);
      });
    } else {
      // List is Array<Object>
      this.docs.forEach((doc, docIndex) => {
        this._addObject(doc, docIndex);
      });
    }
    this.norm.clear();
  }
  // Adds a doc to the end of the index
  add(doc) {
    const idx = this.size();
    if (isString(doc)) {
      this._addString(doc, idx);
    } else {
      this._addObject(doc, idx);
    }
  }
  // Removes the doc at the specified index of the index
  removeAt(idx) {
    this.records.splice(idx, 1);

    // Change ref index of every subsquent doc
    for (let i = idx, len = this.size(); i < len; i += 1) {
      this.records[i].i -= 1;
    }
  }
  getValueForItemAtKeyId(item, keyId) {
    return item[this._keysMap[keyId]];
  }
  size() {
    return this.records.length;
  }
  _addString(doc, docIndex) {
    if (!isDefined(doc) || isBlank(doc)) {
      return;
    }
    let record = {
      v: doc,
      i: docIndex,
      n: this.norm.get(doc)
    };
    this.records.push(record);
  }
  _addObject(doc, docIndex) {
    let record = {
      i: docIndex,
      $: {}
    };

    // Iterate over every key (i.e, path), and fetch the value at that key
    this.keys.forEach((key, keyIndex) => {
      let value = key.getFn ? key.getFn(doc) : this.getFn(doc, key.path);
      if (!isDefined(value)) {
        return;
      }
      if (isArray(value)) {
        let subRecords = [];
        const stack = [{
          nestedArrIndex: -1,
          value
        }];
        while (stack.length) {
          const {
            nestedArrIndex,
            value
          } = stack.pop();
          if (!isDefined(value)) {
            continue;
          }
          if (isString(value) && !isBlank(value)) {
            let subRecord = {
              v: value,
              i: nestedArrIndex,
              n: this.norm.get(value)
            };
            subRecords.push(subRecord);
          } else if (isArray(value)) {
            value.forEach((item, k) => {
              stack.push({
                nestedArrIndex: k,
                value: item
              });
            });
          } else ;
        }
        record.$[keyIndex] = subRecords;
      } else if (isString(value) && !isBlank(value)) {
        let subRecord = {
          v: value,
          n: this.norm.get(value)
        };
        record.$[keyIndex] = subRecord;
      }
    });
    this.records.push(record);
  }
  toJSON() {
    return {
      keys: this.keys,
      records: this.records
    };
  }
}
function createIndex(keys, docs, {
  getFn = Config.getFn,
  fieldNormWeight = Config.fieldNormWeight
} = {}) {
  const myIndex = new FuseIndex({
    getFn,
    fieldNormWeight
  });
  myIndex.setKeys(keys.map(createKey));
  myIndex.setSources(docs);
  myIndex.create();
  return myIndex;
}
function parseIndex(data, {
  getFn = Config.getFn,
  fieldNormWeight = Config.fieldNormWeight
} = {}) {
  const {
    keys,
    records
  } = data;
  const myIndex = new FuseIndex({
    getFn,
    fieldNormWeight
  });
  myIndex.setKeys(keys);
  myIndex.setIndexRecords(records);
  return myIndex;
}
function computeScore$1(pattern, {
  errors = 0,
  currentLocation = 0,
  expectedLocation = 0,
  distance = Config.distance,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  const accuracy = errors / pattern.length;
  if (ignoreLocation) {
    return accuracy;
  }
  const proximity = Math.abs(expectedLocation - currentLocation);
  if (!distance) {
    // Dodge divide by zero error.
    return proximity ? 1.0 : accuracy;
  }
  return accuracy + proximity / distance;
}
function convertMaskToIndices(matchmask = [], minMatchCharLength = Config.minMatchCharLength) {
  let indices = [];
  let start = -1;
  let end = -1;
  let i = 0;
  for (let len = matchmask.length; i < len; i += 1) {
    let match = matchmask[i];
    if (match && start === -1) {
      start = i;
    } else if (!match && start !== -1) {
      end = i - 1;
      if (end - start + 1 >= minMatchCharLength) {
        indices.push([start, end]);
      }
      start = -1;
    }
  }

  // (i-1 - start) + 1 => i - start
  if (matchmask[i - 1] && i - start >= minMatchCharLength) {
    indices.push([start, i - 1]);
  }
  return indices;
}

// Machine word size
const MAX_BITS = 32;
function search(text, pattern, patternAlphabet, {
  location = Config.location,
  distance = Config.distance,
  threshold = Config.threshold,
  findAllMatches = Config.findAllMatches,
  minMatchCharLength = Config.minMatchCharLength,
  includeMatches = Config.includeMatches,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  if (pattern.length > MAX_BITS) {
    throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS));
  }
  const patternLen = pattern.length;
  // Set starting location at beginning text and initialize the alphabet.
  const textLen = text.length;
  // Handle the case when location > text.length
  const expectedLocation = Math.max(0, Math.min(location, textLen));
  // Highest score beyond which we give up.
  let currentThreshold = threshold;
  // Is there a nearby exact match? (speedup)
  let bestLocation = expectedLocation;

  // Performance: only computer matches when the minMatchCharLength > 1
  // OR if `includeMatches` is true.
  const computeMatches = minMatchCharLength > 1 || includeMatches;
  // A mask of the matches, used for building the indices
  const matchMask = computeMatches ? Array(textLen) : [];
  let index;

  // Get all exact matches, here for speed up
  while ((index = text.indexOf(pattern, bestLocation)) > -1) {
    let score = computeScore$1(pattern, {
      currentLocation: index,
      expectedLocation,
      distance,
      ignoreLocation
    });
    currentThreshold = Math.min(score, currentThreshold);
    bestLocation = index + patternLen;
    if (computeMatches) {
      let i = 0;
      while (i < patternLen) {
        matchMask[index + i] = 1;
        i += 1;
      }
    }
  }

  // Reset the best location
  bestLocation = -1;
  let lastBitArr = [];
  let finalScore = 1;
  let binMax = patternLen + textLen;
  const mask = 1 << patternLen - 1;
  for (let i = 0; i < patternLen; i += 1) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from the match location we can stray
    // at this error level.
    let binMin = 0;
    let binMid = binMax;
    while (binMin < binMid) {
      const score = computeScore$1(pattern, {
        errors: i,
        currentLocation: expectedLocation + binMid,
        expectedLocation,
        distance,
        ignoreLocation
      });
      if (score <= currentThreshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }
      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }

    // Use the result from this iteration as the maximum for the next.
    binMax = binMid;
    let start = Math.max(1, expectedLocation - binMid + 1);
    let finish = findAllMatches ? textLen : Math.min(expectedLocation + binMid, textLen) + patternLen;

    // Initialize the bit array
    let bitArr = Array(finish + 2);
    bitArr[finish + 1] = (1 << i) - 1;
    for (let j = finish; j >= start; j -= 1) {
      let currentLocation = j - 1;
      let charMatch = patternAlphabet[text.charAt(currentLocation)];
      if (computeMatches) {
        // Speed up: quick bool to int conversion (i.e, `charMatch ? 1 : 0`)
        matchMask[currentLocation] = +!!charMatch;
      }

      // First pass: exact match
      bitArr[j] = (bitArr[j + 1] << 1 | 1) & charMatch;

      // Subsequent passes: fuzzy match
      if (i) {
        bitArr[j] |= (lastBitArr[j + 1] | lastBitArr[j]) << 1 | 1 | lastBitArr[j + 1];
      }
      if (bitArr[j] & mask) {
        finalScore = computeScore$1(pattern, {
          errors: i,
          currentLocation,
          expectedLocation,
          distance,
          ignoreLocation
        });

        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (finalScore <= currentThreshold) {
          // Indeed it is
          currentThreshold = finalScore;
          bestLocation = currentLocation;

          // Already passed `loc`, downhill from here on in.
          if (bestLocation <= expectedLocation) {
            break;
          }

          // When passing `bestLocation`, don't exceed our current distance from `expectedLocation`.
          start = Math.max(1, 2 * expectedLocation - bestLocation);
        }
      }
    }

    // No hope for a (better) match at greater error levels.
    const score = computeScore$1(pattern, {
      errors: i + 1,
      currentLocation: expectedLocation,
      expectedLocation,
      distance,
      ignoreLocation
    });
    if (score > currentThreshold) {
      break;
    }
    lastBitArr = bitArr;
  }
  const result = {
    isMatch: bestLocation >= 0,
    // Count exact matches (those with a score of 0) to be "almost" exact
    score: Math.max(0.001, finalScore)
  };
  if (computeMatches) {
    const indices = convertMaskToIndices(matchMask, minMatchCharLength);
    if (!indices.length) {
      result.isMatch = false;
    } else if (includeMatches) {
      result.indices = indices;
    }
  }
  return result;
}
function createPatternAlphabet(pattern) {
  let mask = {};
  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern.charAt(i);
    mask[char] = (mask[char] || 0) | 1 << len - i - 1;
  }
  return mask;
}
class BitapSearch {
  constructor(pattern, {
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    this.options = {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreLocation
    };
    this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    this.chunks = [];
    if (!this.pattern.length) {
      return;
    }
    const addChunk = (pattern, startIndex) => {
      this.chunks.push({
        pattern,
        alphabet: createPatternAlphabet(pattern),
        startIndex
      });
    };
    const len = this.pattern.length;
    if (len > MAX_BITS) {
      let i = 0;
      const remainder = len % MAX_BITS;
      const end = len - remainder;
      while (i < end) {
        addChunk(this.pattern.substr(i, MAX_BITS), i);
        i += MAX_BITS;
      }
      if (remainder) {
        const startIndex = len - MAX_BITS;
        addChunk(this.pattern.substr(startIndex), startIndex);
      }
    } else {
      addChunk(this.pattern, 0);
    }
  }
  searchIn(text) {
    const {
      isCaseSensitive,
      includeMatches
    } = this.options;
    if (!isCaseSensitive) {
      text = text.toLowerCase();
    }

    // Exact match
    if (this.pattern === text) {
      let result = {
        isMatch: true,
        score: 0
      };
      if (includeMatches) {
        result.indices = [[0, text.length - 1]];
      }
      return result;
    }

    // Otherwise, use Bitap algorithm
    const {
      location,
      distance,
      threshold,
      findAllMatches,
      minMatchCharLength,
      ignoreLocation
    } = this.options;
    let allIndices = [];
    let totalScore = 0;
    let hasMatches = false;
    this.chunks.forEach(({
      pattern,
      alphabet,
      startIndex
    }) => {
      const {
        isMatch,
        score,
        indices
      } = search(text, pattern, alphabet, {
        location: location + startIndex,
        distance,
        threshold,
        findAllMatches,
        minMatchCharLength,
        includeMatches,
        ignoreLocation
      });
      if (isMatch) {
        hasMatches = true;
      }
      totalScore += score;
      if (isMatch && indices) {
        allIndices = [...allIndices, ...indices];
      }
    });
    let result = {
      isMatch: hasMatches,
      score: hasMatches ? totalScore / this.chunks.length : 1
    };
    if (hasMatches && includeMatches) {
      result.indices = allIndices;
    }
    return result;
  }
}
class BaseMatch {
  constructor(pattern) {
    this.pattern = pattern;
  }
  static isMultiMatch(pattern) {
    return getMatch(pattern, this.multiRegex);
  }
  static isSingleMatch(pattern) {
    return getMatch(pattern, this.singleRegex);
  }
  search( /*text*/) {}
}
function getMatch(pattern, exp) {
  const matches = pattern.match(exp);
  return matches ? matches[1] : null;
}

// Token: 'file

class ExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'exact';
  }
  static get multiRegex() {
    return /^="(.*)"$/;
  }
  static get singleRegex() {
    return /^=(.*)$/;
  }
  search(text) {
    const isMatch = text === this.pattern;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
}

// Token: !fire

class InverseExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-exact';
  }
  static get multiRegex() {
    return /^!"(.*)"$/;
  }
  static get singleRegex() {
    return /^!(.*)$/;
  }
  search(text) {
    const index = text.indexOf(this.pattern);
    const isMatch = index === -1;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
}

// Token: ^file

class PrefixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'prefix-exact';
  }
  static get multiRegex() {
    return /^\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^\^(.*)$/;
  }
  search(text) {
    const isMatch = text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
}

// Token: !^fire

class InversePrefixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-prefix-exact';
  }
  static get multiRegex() {
    return /^!\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^!\^(.*)$/;
  }
  search(text) {
    const isMatch = !text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
}

// Token: .file$

class SuffixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'suffix-exact';
  }
  static get multiRegex() {
    return /^"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^(.*)\$$/;
  }
  search(text) {
    const isMatch = text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [text.length - this.pattern.length, text.length - 1]
    };
  }
}

// Token: !.file$

class InverseSuffixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-suffix-exact';
  }
  static get multiRegex() {
    return /^!"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^!(.*)\$$/;
  }
  search(text) {
    const isMatch = !text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
}
class FuzzyMatch extends BaseMatch {
  constructor(pattern, {
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    super(pattern);
    this._bitapSearch = new BitapSearch(pattern, {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreLocation
    });
  }
  static get type() {
    return 'fuzzy';
  }
  static get multiRegex() {
    return /^"(.*)"$/;
  }
  static get singleRegex() {
    return /^(.*)$/;
  }
  search(text) {
    return this._bitapSearch.searchIn(text);
  }
}

// Token: 'file

class IncludeMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'include';
  }
  static get multiRegex() {
    return /^'"(.*)"$/;
  }
  static get singleRegex() {
    return /^'(.*)$/;
  }
  search(text) {
    let location = 0;
    let index;
    const indices = [];
    const patternLen = this.pattern.length;

    // Get all exact matches
    while ((index = text.indexOf(this.pattern, location)) > -1) {
      location = index + patternLen;
      indices.push([index, location - 1]);
    }
    const isMatch = !!indices.length;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices
    };
  }
}

// ❗Order is important. DO NOT CHANGE.
const searchers = [ExactMatch, IncludeMatch, PrefixExactMatch, InversePrefixExactMatch, InverseSuffixExactMatch, SuffixExactMatch, InverseExactMatch, FuzzyMatch];
const searchersLen = searchers.length;

// Regex to split by spaces, but keep anything in quotes together
const SPACE_RE = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
const OR_TOKEN = '|';

// Return a 2D array representation of the query, for simpler parsing.
// Example:
// "^core go$ | rb$ | py$ xy$" => [["^core", "go$"], ["rb$"], ["py$", "xy$"]]
function parseQuery(pattern, options = {}) {
  return pattern.split(OR_TOKEN).map(item => {
    let query = item.trim().split(SPACE_RE).filter(item => item && !!item.trim());
    let results = [];
    for (let i = 0, len = query.length; i < len; i += 1) {
      const queryItem = query[i];

      // 1. Handle multiple query match (i.e, once that are quoted, like `"hello world"`)
      let found = false;
      let idx = -1;
      while (!found && ++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isMultiMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          found = true;
        }
      }
      if (found) {
        continue;
      }

      // 2. Handle single query matches (i.e, once that are *not* quoted)
      idx = -1;
      while (++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isSingleMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          break;
        }
      }
    }
    return results;
  });
}

// These extended matchers can return an array of matches, as opposed
// to a singl match
const MultiMatchSet = new Set([FuzzyMatch.type, IncludeMatch.type]);

/**
 * Command-like searching
 * ======================
 *
 * Given multiple search terms delimited by spaces.e.g. `^jscript .python$ ruby !java`,
 * search in a given text.
 *
 * Search syntax:
 *
 * | Token       | Match type                 | Description                            |
 * | ----------- | -------------------------- | -------------------------------------- |
 * | `jscript`   | fuzzy-match                | Items that fuzzy match `jscript`       |
 * | `=scheme`   | exact-match                | Items that are `scheme`                |
 * | `'python`   | include-match              | Items that include `python`            |
 * | `!ruby`     | inverse-exact-match        | Items that do not include `ruby`       |
 * | `^java`     | prefix-exact-match         | Items that start with `java`           |
 * | `!^earlang` | inverse-prefix-exact-match | Items that do not start with `earlang` |
 * | `.js$`      | suffix-exact-match         | Items that end with `.js`              |
 * | `!.go$`     | inverse-suffix-exact-match | Items that do not end with `.go`       |
 *
 * A single pipe character acts as an OR operator. For example, the following
 * query matches entries that start with `core` and end with either`go`, `rb`,
 * or`py`.
 *
 * ```
 * ^core go$ | rb$ | py$
 * ```
 */
class ExtendedSearch {
  constructor(pattern, {
    isCaseSensitive = Config.isCaseSensitive,
    includeMatches = Config.includeMatches,
    minMatchCharLength = Config.minMatchCharLength,
    ignoreLocation = Config.ignoreLocation,
    findAllMatches = Config.findAllMatches,
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance
  } = {}) {
    this.query = null;
    this.options = {
      isCaseSensitive,
      includeMatches,
      minMatchCharLength,
      findAllMatches,
      ignoreLocation,
      location,
      threshold,
      distance
    };
    this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    this.query = parseQuery(this.pattern, this.options);
  }
  static condition(_, options) {
    return options.useExtendedSearch;
  }
  searchIn(text) {
    const query = this.query;
    if (!query) {
      return {
        isMatch: false,
        score: 1
      };
    }
    const {
      includeMatches,
      isCaseSensitive
    } = this.options;
    text = isCaseSensitive ? text : text.toLowerCase();
    let numMatches = 0;
    let allIndices = [];
    let totalScore = 0;

    // ORs
    for (let i = 0, qLen = query.length; i < qLen; i += 1) {
      const searchers = query[i];

      // Reset indices
      allIndices.length = 0;
      numMatches = 0;

      // ANDs
      for (let j = 0, pLen = searchers.length; j < pLen; j += 1) {
        const searcher = searchers[j];
        const {
          isMatch,
          indices,
          score
        } = searcher.search(text);
        if (isMatch) {
          numMatches += 1;
          totalScore += score;
          if (includeMatches) {
            const type = searcher.constructor.type;
            if (MultiMatchSet.has(type)) {
              allIndices = [...allIndices, ...indices];
            } else {
              allIndices.push(indices);
            }
          }
        } else {
          totalScore = 0;
          numMatches = 0;
          allIndices.length = 0;
          break;
        }
      }

      // OR condition, so if TRUE, return
      if (numMatches) {
        let result = {
          isMatch: true,
          score: totalScore / numMatches
        };
        if (includeMatches) {
          result.indices = allIndices;
        }
        return result;
      }
    }

    // Nothing was matched
    return {
      isMatch: false,
      score: 1
    };
  }
}
const registeredSearchers = [];
function register(...args) {
  registeredSearchers.push(...args);
}
function createSearcher(pattern, options) {
  for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
    let searcherClass = registeredSearchers[i];
    if (searcherClass.condition(pattern, options)) {
      return new searcherClass(pattern, options);
    }
  }
  return new BitapSearch(pattern, options);
}
const LogicalOperator = {
  AND: '$and',
  OR: '$or'
};
const KeyType = {
  PATH: '$path',
  PATTERN: '$val'
};
const isExpression = query => !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);
const isPath = query => !!query[KeyType.PATH];
const isLeaf = query => !isArray(query) && isObject(query) && !isExpression(query);
const convertToExplicit = query => ({
  [LogicalOperator.AND]: Object.keys(query).map(key => ({
    [key]: query[key]
  }))
});

// When `auto` is `true`, the parse function will infer and initialize and add
// the appropriate `Searcher` instance
function parse(query, options, {
  auto = true
} = {}) {
  const next = query => {
    let keys = Object.keys(query);
    const isQueryPath = isPath(query);
    if (!isQueryPath && keys.length > 1 && !isExpression(query)) {
      return next(convertToExplicit(query));
    }
    if (isLeaf(query)) {
      const key = isQueryPath ? query[KeyType.PATH] : keys[0];
      const pattern = isQueryPath ? query[KeyType.PATTERN] : query[key];
      if (!isString(pattern)) {
        throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key));
      }
      const obj = {
        keyId: createKeyId(key),
        pattern
      };
      if (auto) {
        obj.searcher = createSearcher(pattern, options);
      }
      return obj;
    }
    let node = {
      children: [],
      operator: keys[0]
    };
    keys.forEach(key => {
      const value = query[key];
      if (isArray(value)) {
        value.forEach(item => {
          node.children.push(next(item));
        });
      }
    });
    return node;
  };
  if (!isExpression(query)) {
    query = convertToExplicit(query);
  }
  return next(query);
}

// Practical scoring function
function computeScore(results, {
  ignoreFieldNorm = Config.ignoreFieldNorm
}) {
  results.forEach(result => {
    let totalScore = 1;
    result.matches.forEach(({
      key,
      norm,
      score
    }) => {
      const weight = key ? key.weight : null;
      totalScore *= Math.pow(score === 0 && weight ? Number.EPSILON : score, (weight || 1) * (ignoreFieldNorm ? 1 : norm));
    });
    result.score = totalScore;
  });
}
function transformMatches(result, data) {
  const matches = result.matches;
  data.matches = [];
  if (!isDefined(matches)) {
    return;
  }
  matches.forEach(match => {
    if (!isDefined(match.indices) || !match.indices.length) {
      return;
    }
    const {
      indices,
      value
    } = match;
    let obj = {
      indices,
      value
    };
    if (match.key) {
      obj.key = match.key.src;
    }
    if (match.idx > -1) {
      obj.refIndex = match.idx;
    }
    data.matches.push(obj);
  });
}
function transformScore(result, data) {
  data.score = result.score;
}
function format(results, docs, {
  includeMatches = Config.includeMatches,
  includeScore = Config.includeScore
} = {}) {
  const transformers = [];
  if (includeMatches) transformers.push(transformMatches);
  if (includeScore) transformers.push(transformScore);
  return results.map(result => {
    const {
      idx
    } = result;
    const data = {
      item: docs[idx],
      refIndex: idx
    };
    if (transformers.length) {
      transformers.forEach(transformer => {
        transformer(result, data);
      });
    }
    return data;
  });
}
class Fuse {
  constructor(docs, options = {}, index) {
    this.options = _objectSpread2(_objectSpread2({}, Config), options);
    if (this.options.useExtendedSearch && !true) {}
    this._keyStore = new KeyStore(this.options.keys);
    this.setCollection(docs, index);
  }
  setCollection(docs, index) {
    this._docs = docs;
    if (index && !(index instanceof FuseIndex)) {
      throw new Error(INCORRECT_INDEX_TYPE);
    }
    this._myIndex = index || createIndex(this.options.keys, this._docs, {
      getFn: this.options.getFn,
      fieldNormWeight: this.options.fieldNormWeight
    });
  }
  add(doc) {
    if (!isDefined(doc)) {
      return;
    }
    this._docs.push(doc);
    this._myIndex.add(doc);
  }
  remove(predicate = ( /* doc, idx */) => false) {
    const results = [];
    for (let i = 0, len = this._docs.length; i < len; i += 1) {
      const doc = this._docs[i];
      if (predicate(doc, i)) {
        this.removeAt(i);
        i -= 1;
        len -= 1;
        results.push(doc);
      }
    }
    return results;
  }
  removeAt(idx) {
    this._docs.splice(idx, 1);
    this._myIndex.removeAt(idx);
  }
  getIndex() {
    return this._myIndex;
  }
  search(query, {
    limit = -1
  } = {}) {
    const {
      includeMatches,
      includeScore,
      shouldSort,
      sortFn,
      ignoreFieldNorm
    } = this.options;
    let results = isString(query) ? isString(this._docs[0]) ? this._searchStringList(query) : this._searchObjectList(query) : this._searchLogical(query);
    computeScore(results, {
      ignoreFieldNorm
    });
    if (shouldSort) {
      results.sort(sortFn);
    }
    if (isNumber(limit) && limit > -1) {
      results = results.slice(0, limit);
    }
    return format(results, this._docs, {
      includeMatches,
      includeScore
    });
  }
  _searchStringList(query) {
    const searcher = createSearcher(query, this.options);
    const {
      records
    } = this._myIndex;
    const results = [];

    // Iterate over every string in the index
    records.forEach(({
      v: text,
      i: idx,
      n: norm
    }) => {
      if (!isDefined(text)) {
        return;
      }
      const {
        isMatch,
        score,
        indices
      } = searcher.searchIn(text);
      if (isMatch) {
        results.push({
          item: text,
          idx,
          matches: [{
            score,
            value: text,
            norm,
            indices
          }]
        });
      }
    });
    return results;
  }
  _searchLogical(query) {
    const expression = parse(query, this.options);
    const evaluate = (node, item, idx) => {
      if (!node.children) {
        const {
          keyId,
          searcher
        } = node;
        const matches = this._findMatches({
          key: this._keyStore.get(keyId),
          value: this._myIndex.getValueForItemAtKeyId(item, keyId),
          searcher
        });
        if (matches && matches.length) {
          return [{
            idx,
            item,
            matches
          }];
        }
        return [];
      }
      const res = [];
      for (let i = 0, len = node.children.length; i < len; i += 1) {
        const child = node.children[i];
        const result = evaluate(child, item, idx);
        if (result.length) {
          res.push(...result);
        } else if (node.operator === LogicalOperator.AND) {
          return [];
        }
      }
      return res;
    };
    const records = this._myIndex.records;
    const resultMap = {};
    const results = [];
    records.forEach(({
      $: item,
      i: idx
    }) => {
      if (isDefined(item)) {
        let expResults = evaluate(expression, item, idx);
        if (expResults.length) {
          // Dedupe when adding
          if (!resultMap[idx]) {
            resultMap[idx] = {
              idx,
              item,
              matches: []
            };
            results.push(resultMap[idx]);
          }
          expResults.forEach(({
            matches
          }) => {
            resultMap[idx].matches.push(...matches);
          });
        }
      }
    });
    return results;
  }
  _searchObjectList(query) {
    const searcher = createSearcher(query, this.options);
    const {
      keys,
      records
    } = this._myIndex;
    const results = [];

    // List is Array<Object>
    records.forEach(({
      $: item,
      i: idx
    }) => {
      if (!isDefined(item)) {
        return;
      }
      let matches = [];

      // Iterate over every key (i.e, path), and fetch the value at that key
      keys.forEach((key, keyIndex) => {
        matches.push(...this._findMatches({
          key,
          value: item[keyIndex],
          searcher
        }));
      });
      if (matches.length) {
        results.push({
          idx,
          item,
          matches
        });
      }
    });
    return results;
  }
  _findMatches({
    key,
    value,
    searcher
  }) {
    if (!isDefined(value)) {
      return [];
    }
    let matches = [];
    if (isArray(value)) {
      value.forEach(({
        v: text,
        i: idx,
        n: norm
      }) => {
        if (!isDefined(text)) {
          return;
        }
        const {
          isMatch,
          score,
          indices
        } = searcher.searchIn(text);
        if (isMatch) {
          matches.push({
            score,
            key,
            value: text,
            idx,
            norm,
            indices
          });
        }
      });
    } else {
      const {
        v: text,
        n: norm
      } = value;
      const {
        isMatch,
        score,
        indices
      } = searcher.searchIn(text);
      if (isMatch) {
        matches.push({
          score,
          key,
          value: text,
          norm,
          indices
        });
      }
    }
    return matches;
  }
}
Fuse.version = '7.0.0';
Fuse.createIndex = createIndex;
Fuse.parseIndex = parseIndex;
Fuse.config = Config;
{
  Fuse.parseQuery = parse;
}
{
  register(ExtendedSearch);
}

var SearchByFuse = /** @class */ (function () {
    function SearchByFuse(config) {
        this._haystack = [];
        this._fuseOptions = __assign(__assign({}, config.fuseOptions), { keys: __spreadArray([], config.searchFields, true), includeMatches: true });
    }
    SearchByFuse.prototype.index = function (data) {
        this._haystack = data;
        if (this._fuse) {
            this._fuse.setCollection(data);
        }
    };
    SearchByFuse.prototype.reset = function () {
        this._haystack = [];
        this._fuse = undefined;
    };
    SearchByFuse.prototype.isEmptyIndex = function () {
        return !this._haystack.length;
    };
    SearchByFuse.prototype.search = function (needle) {
        if (!this._fuse) {
            {
                this._fuse = new Fuse(this._haystack, this._fuseOptions);
            }
        }
        var results = this._fuse.search(needle);
        return results.map(function (value, i) {
            return {
                item: value.item,
                score: value.score || 0,
                rank: i + 1, // If value.score is used for sorting, this can create non-stable sorts!
            };
        });
    };
    return SearchByFuse;
}());

function getSearcher(config) {
    {
        return new SearchByFuse(config);
    }
}

/**
 * Helpers to create HTML elements used by Choices
 * Can be overridden by providing `callbackOnCreateTemplates` option.
 * `Choices.defaults.templates` allows access to the default template methods from `callbackOnCreateTemplates`
 */
var isEmptyObject = function (obj) {
    // eslint-disable-next-line no-restricted-syntax
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
    return true;
};
var assignCustomProperties = function (el, choice, withCustomProperties) {
    var dataset = el.dataset;
    var customProperties = choice.customProperties, labelClass = choice.labelClass, labelDescription = choice.labelDescription;
    if (labelClass) {
        dataset.labelClass = getClassNames(labelClass).join(' ');
    }
    if (labelDescription) {
        dataset.labelDescription = labelDescription;
    }
    if (withCustomProperties && customProperties) {
        if (typeof customProperties === 'string') {
            dataset.customProperties = customProperties;
        }
        else if (typeof customProperties === 'object' && !isEmptyObject(customProperties)) {
            dataset.customProperties = JSON.stringify(customProperties);
        }
    }
};
var addAriaLabel = function (docRoot, id, element) {
    var label = id && docRoot.querySelector("label[for='".concat(id, "']"));
    var text = label && label.innerText;
    if (text) {
        element.setAttribute('aria-label', text);
    }
};
var templates = {
    containerOuter: function (_a, dir, isSelectElement, isSelectOneElement, searchEnabled, passedElementType, labelId) {
        var containerOuter = _a.classNames.containerOuter;
        var div = document.createElement('div');
        addClassesToElement(div, containerOuter);
        div.dataset.type = passedElementType;
        if (dir) {
            div.dir = dir;
        }
        if (isSelectOneElement) {
            div.tabIndex = 0;
        }
        if (isSelectElement) {
            div.setAttribute('role', searchEnabled ? 'combobox' : 'listbox');
            if (searchEnabled) {
                div.setAttribute('aria-autocomplete', 'list');
            }
            else if (!labelId) {
                addAriaLabel(this._docRoot, this.passedElement.element.id, div);
            }
            div.setAttribute('aria-haspopup', 'true');
            div.setAttribute('aria-expanded', 'false');
        }
        if (labelId) {
            div.setAttribute('aria-labelledby', labelId);
        }
        return div;
    },
    containerInner: function (_a) {
        var containerInner = _a.classNames.containerInner;
        var div = document.createElement('div');
        addClassesToElement(div, containerInner);
        return div;
    },
    itemList: function (_a, isSelectOneElement) {
        var searchEnabled = _a.searchEnabled, _b = _a.classNames, list = _b.list, listSingle = _b.listSingle, listItems = _b.listItems;
        var div = document.createElement('div');
        addClassesToElement(div, list);
        addClassesToElement(div, isSelectOneElement ? listSingle : listItems);
        if (this._isSelectElement && searchEnabled) {
            div.setAttribute('role', 'listbox');
        }
        return div;
    },
    placeholder: function (_a, value) {
        var allowHTML = _a.allowHTML, placeholder = _a.classNames.placeholder;
        var div = document.createElement('div');
        addClassesToElement(div, placeholder);
        setElementHtml(div, allowHTML, value);
        return div;
    },
    item: function (_a, choice, removeItemButton) {
        var allowHTML = _a.allowHTML, removeItemButtonAlignLeft = _a.removeItemButtonAlignLeft, removeItemIconText = _a.removeItemIconText, removeItemLabelText = _a.removeItemLabelText, _b = _a.classNames, item = _b.item, button = _b.button, highlightedState = _b.highlightedState, itemSelectable = _b.itemSelectable, placeholder = _b.placeholder;
        var rawValue = unwrapStringForRaw(choice.value);
        var div = document.createElement('div');
        addClassesToElement(div, item);
        if (choice.labelClass) {
            var spanLabel = document.createElement('span');
            setElementHtml(spanLabel, allowHTML, choice.label);
            addClassesToElement(spanLabel, choice.labelClass);
            div.appendChild(spanLabel);
        }
        else {
            setElementHtml(div, allowHTML, choice.label);
        }
        div.dataset.item = '';
        div.dataset.id = choice.id;
        div.dataset.value = rawValue;
        assignCustomProperties(div, choice, true);
        if (choice.disabled || this.containerOuter.isDisabled) {
            div.setAttribute('aria-disabled', 'true');
        }
        if (this._isSelectElement) {
            div.setAttribute('aria-selected', 'true');
            div.setAttribute('role', 'option');
        }
        if (choice.placeholder) {
            addClassesToElement(div, placeholder);
            div.dataset.placeholder = '';
        }
        addClassesToElement(div, choice.highlighted ? highlightedState : itemSelectable);
        if (removeItemButton) {
            if (choice.disabled) {
                removeClassesFromElement(div, itemSelectable);
            }
            div.dataset.deletable = '';
            var removeButton = document.createElement('button');
            removeButton.type = 'button';
            addClassesToElement(removeButton, button);
            setElementHtml(removeButton, true, resolveNoticeFunction(removeItemIconText, choice.value));
            var REMOVE_ITEM_LABEL = resolveNoticeFunction(removeItemLabelText, choice.value);
            if (REMOVE_ITEM_LABEL) {
                removeButton.setAttribute('aria-label', REMOVE_ITEM_LABEL);
            }
            removeButton.dataset.button = '';
            if (removeItemButtonAlignLeft) {
                div.insertAdjacentElement('afterbegin', removeButton);
            }
            else {
                div.appendChild(removeButton);
            }
        }
        return div;
    },
    choiceList: function (_a, isSelectOneElement) {
        var list = _a.classNames.list;
        var div = document.createElement('div');
        addClassesToElement(div, list);
        if (!isSelectOneElement) {
            div.setAttribute('aria-multiselectable', 'true');
        }
        div.setAttribute('role', 'listbox');
        return div;
    },
    choiceGroup: function (_a, _b) {
        var allowHTML = _a.allowHTML, _c = _a.classNames, group = _c.group, groupHeading = _c.groupHeading, itemDisabled = _c.itemDisabled;
        var id = _b.id, label = _b.label, disabled = _b.disabled;
        var rawLabel = unwrapStringForRaw(label);
        var div = document.createElement('div');
        addClassesToElement(div, group);
        if (disabled) {
            addClassesToElement(div, itemDisabled);
        }
        div.setAttribute('role', 'group');
        div.dataset.group = '';
        div.dataset.id = id;
        div.dataset.value = rawLabel;
        if (disabled) {
            div.setAttribute('aria-disabled', 'true');
        }
        var heading = document.createElement('div');
        addClassesToElement(heading, groupHeading);
        setElementHtml(heading, allowHTML, label || '');
        div.appendChild(heading);
        return div;
    },
    choice: function (_a, choice, selectText, groupName) {
        var allowHTML = _a.allowHTML, _b = _a.classNames, item = _b.item, itemChoice = _b.itemChoice, itemSelectable = _b.itemSelectable, selectedState = _b.selectedState, itemDisabled = _b.itemDisabled, description = _b.description, placeholder = _b.placeholder;
        // eslint-disable-next-line prefer-destructuring
        var label = choice.label;
        var rawValue = unwrapStringForRaw(choice.value);
        var div = document.createElement('div');
        div.id = choice.elementId;
        addClassesToElement(div, item);
        addClassesToElement(div, itemChoice);
        if (groupName && typeof label === 'string') {
            label = escapeForTemplate(allowHTML, label);
            label += " (".concat(groupName, ")");
            label = { trusted: label };
        }
        var describedBy = div;
        if (choice.labelClass) {
            var spanLabel = document.createElement('span');
            setElementHtml(spanLabel, allowHTML, label);
            addClassesToElement(spanLabel, choice.labelClass);
            describedBy = spanLabel;
            div.appendChild(spanLabel);
        }
        else {
            setElementHtml(div, allowHTML, label);
        }
        if (choice.labelDescription) {
            var descId = "".concat(choice.elementId, "-description");
            describedBy.setAttribute('aria-describedby', descId);
            var spanDesc = document.createElement('span');
            setElementHtml(spanDesc, allowHTML, choice.labelDescription);
            spanDesc.id = descId;
            addClassesToElement(spanDesc, description);
            div.appendChild(spanDesc);
        }
        if (choice.selected) {
            addClassesToElement(div, selectedState);
        }
        if (choice.placeholder) {
            addClassesToElement(div, placeholder);
        }
        div.setAttribute('role', choice.group ? 'treeitem' : 'option');
        div.dataset.choice = '';
        div.dataset.id = choice.id;
        div.dataset.value = rawValue;
        if (selectText) {
            div.dataset.selectText = selectText;
        }
        if (choice.group) {
            div.dataset.groupId = "".concat(choice.group.id);
        }
        assignCustomProperties(div, choice, false);
        if (choice.disabled) {
            addClassesToElement(div, itemDisabled);
            div.dataset.choiceDisabled = '';
            div.setAttribute('aria-disabled', 'true');
        }
        else {
            addClassesToElement(div, itemSelectable);
            div.dataset.choiceSelectable = '';
        }
        return div;
    },
    input: function (_a, placeholderValue) {
        var _b = _a.classNames, input = _b.input, inputCloned = _b.inputCloned, labelId = _a.labelId;
        var inp = document.createElement('input');
        inp.type = 'search';
        addClassesToElement(inp, input);
        addClassesToElement(inp, inputCloned);
        inp.autocomplete = 'off';
        inp.autocapitalize = 'off';
        inp.spellcheck = false;
        inp.setAttribute('role', 'textbox');
        inp.setAttribute('aria-autocomplete', 'list');
        if (placeholderValue) {
            inp.setAttribute('aria-label', placeholderValue);
        }
        else if (!labelId) {
            addAriaLabel(this._docRoot, this.passedElement.element.id, inp);
        }
        return inp;
    },
    dropdown: function (_a) {
        var _b = _a.classNames, list = _b.list, listDropdown = _b.listDropdown;
        var div = document.createElement('div');
        addClassesToElement(div, list);
        addClassesToElement(div, listDropdown);
        div.setAttribute('aria-expanded', 'false');
        return div;
    },
    notice: function (_a, innerHTML, type) {
        var _b = _a.classNames, item = _b.item, itemChoice = _b.itemChoice, addChoice = _b.addChoice, noResults = _b.noResults, noChoices = _b.noChoices, noticeItem = _b.notice;
        if (type === void 0) { type = NoticeTypes.generic; }
        var notice = document.createElement('div');
        setElementHtml(notice, true, innerHTML);
        addClassesToElement(notice, item);
        addClassesToElement(notice, itemChoice);
        addClassesToElement(notice, noticeItem);
        // eslint-disable-next-line default-case
        switch (type) {
            case NoticeTypes.addChoice:
                addClassesToElement(notice, addChoice);
                break;
            case NoticeTypes.noResults:
                addClassesToElement(notice, noResults);
                break;
            case NoticeTypes.noChoices:
                addClassesToElement(notice, noChoices);
                break;
        }
        if (type === NoticeTypes.addChoice) {
            notice.dataset.choiceSelectable = '';
            notice.dataset.choice = '';
        }
        return notice;
    },
    option: function (choice) {
        // HtmlOptionElement's label value does not support HTML, so the avoid double escaping unwrap the untrusted string.
        var labelValue = unwrapStringForRaw(choice.label);
        var opt = new Option(labelValue, choice.value, false, choice.selected);
        assignCustomProperties(opt, choice, true);
        opt.disabled = choice.disabled;
        if (choice.selected) {
            opt.setAttribute('selected', '');
        }
        return opt;
    },
};

/** @see {@link http://browserhacks.com/#hack-acea075d0ac6954f275a70023906050c} */
var IS_IE11 = '-ms-scroll-limit' in document.documentElement.style &&
    '-ms-ime-align' in document.documentElement.style;
var USER_DEFAULTS = {};
var parseDataSetId = function (element) {
    if (!element) {
        return undefined;
    }
    return element.dataset.id ? parseInt(element.dataset.id, 10) : undefined;
};
var selectableChoiceIdentifier = '[data-choice-selectable]';
/**
 * Choices
 * @author Josh Johnson<josh@joshuajohnson.co.uk>
 */
var Choices = /** @class */ (function () {
    function Choices(element, userConfig) {
        if (element === void 0) { element = '[data-choice]'; }
        if (userConfig === void 0) { userConfig = {}; }
        var _this = this;
        this.initialisedOK = undefined;
        this._hasNonChoicePlaceholder = false;
        this._lastAddedChoiceId = 0;
        this._lastAddedGroupId = 0;
        var defaults = Choices.defaults;
        this.config = __assign(__assign(__assign({}, defaults.allOptions), defaults.options), userConfig);
        ObjectsInConfig.forEach(function (key) {
            _this.config[key] = __assign(__assign(__assign({}, defaults.allOptions[key]), defaults.options[key]), userConfig[key]);
        });
        var config = this.config;
        if (!config.silent) {
            this._validateConfig();
        }
        var docRoot = config.shadowRoot || document.documentElement;
        this._docRoot = docRoot;
        var passedElement = typeof element === 'string' ? docRoot.querySelector(element) : element;
        if (!passedElement ||
            typeof passedElement !== 'object' ||
            !(isHtmlInputElement(passedElement) || isHtmlSelectElement(passedElement))) {
            if (!passedElement && typeof element === 'string') {
                throw TypeError("Selector ".concat(element, " failed to find an element"));
            }
            throw TypeError("Expected one of the following types text|select-one|select-multiple");
        }
        var elementType = passedElement.type;
        var isText = elementType === PassedElementTypes.Text;
        if (isText || config.maxItemCount !== 1) {
            config.singleModeForMultiSelect = false;
        }
        if (config.singleModeForMultiSelect) {
            elementType = PassedElementTypes.SelectMultiple;
        }
        var isSelectOne = elementType === PassedElementTypes.SelectOne;
        var isSelectMultiple = elementType === PassedElementTypes.SelectMultiple;
        var isSelect = isSelectOne || isSelectMultiple;
        this._elementType = elementType;
        this._isTextElement = isText;
        this._isSelectOneElement = isSelectOne;
        this._isSelectMultipleElement = isSelectMultiple;
        this._isSelectElement = isSelectOne || isSelectMultiple;
        this._canAddUserChoices = (isText && config.addItems) || (isSelect && config.addChoices);
        if (typeof config.renderSelectedChoices !== 'boolean') {
            config.renderSelectedChoices = config.renderSelectedChoices === 'always' || isSelectOne;
        }
        if (config.closeDropdownOnSelect === 'auto') {
            config.closeDropdownOnSelect = isText || isSelectOne || config.singleModeForMultiSelect;
        }
        else {
            config.closeDropdownOnSelect = coerceBool(config.closeDropdownOnSelect);
        }
        if (config.placeholder) {
            if (config.placeholderValue) {
                this._hasNonChoicePlaceholder = true;
            }
            else if (passedElement.dataset.placeholder) {
                this._hasNonChoicePlaceholder = true;
                config.placeholderValue = passedElement.dataset.placeholder;
            }
        }
        if (userConfig.addItemFilter && typeof userConfig.addItemFilter !== 'function') {
            var re = userConfig.addItemFilter instanceof RegExp ? userConfig.addItemFilter : new RegExp(userConfig.addItemFilter);
            config.addItemFilter = re.test.bind(re);
        }
        if (this._isTextElement) {
            this.passedElement = new WrappedInput({
                element: passedElement,
                classNames: config.classNames,
            });
        }
        else {
            var selectEl = passedElement;
            this.passedElement = new WrappedSelect({
                element: selectEl,
                classNames: config.classNames,
                template: function (data) { return _this._templates.option(data); },
                extractPlaceholder: config.placeholder && !this._hasNonChoicePlaceholder,
            });
        }
        this.initialised = false;
        this._store = new Store(config);
        this._currentValue = '';
        config.searchEnabled = (!isText && config.searchEnabled) || isSelectMultiple;
        this._canSearch = config.searchEnabled;
        this._isScrollingOnIe = false;
        this._highlightPosition = 0;
        this._wasTap = true;
        this._placeholderValue = this._generatePlaceholderValue();
        this._baseId = generateId(passedElement, 'choices-');
        /**
         * setting direction in cases where it's explicitly set on passedElement
         * or when calculated direction is different from the document
         */
        this._direction = passedElement.dir;
        if (!this._direction) {
            var elementDirection = window.getComputedStyle(passedElement).direction;
            var documentDirection = window.getComputedStyle(document.documentElement).direction;
            if (elementDirection !== documentDirection) {
                this._direction = elementDirection;
            }
        }
        this._idNames = {
            itemChoice: 'item-choice',
        };
        this._templates = defaults.templates;
        this._render = this._render.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onBlur = this._onBlur.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
        this._onFormReset = this._onFormReset.bind(this);
        this._onSelectKey = this._onSelectKey.bind(this);
        this._onEnterKey = this._onEnterKey.bind(this);
        this._onEscapeKey = this._onEscapeKey.bind(this);
        this._onDirectionKey = this._onDirectionKey.bind(this);
        this._onDeleteKey = this._onDeleteKey.bind(this);
        // If element has already been initialised with Choices, fail silently
        if (this.passedElement.isActive) {
            if (!config.silent) {
                console.warn('Trying to initialise Choices on element already initialised', { element: element });
            }
            this.initialised = true;
            this.initialisedOK = false;
            return;
        }
        // Let's go
        this.init();
        // preserve the selected item list after setup for form reset
        this._initialItems = this._store.items.map(function (choice) { return choice.value; });
    }
    Object.defineProperty(Choices, "defaults", {
        get: function () {
            return Object.preventExtensions({
                get options() {
                    return USER_DEFAULTS;
                },
                get allOptions() {
                    return DEFAULT_CONFIG;
                },
                get templates() {
                    return templates;
                },
            });
        },
        enumerable: false,
        configurable: true
    });
    Choices.prototype.init = function () {
        if (this.initialised || this.initialisedOK !== undefined) {
            return;
        }
        this._searcher = getSearcher(this.config);
        this._loadChoices();
        this._createTemplates();
        this._createElements();
        this._createStructure();
        if ((this._isTextElement && !this.config.addItems) ||
            this.passedElement.element.hasAttribute('disabled') ||
            !!this.passedElement.element.closest('fieldset:disabled')) {
            this.disable();
        }
        else {
            this.enable();
            this._addEventListeners();
        }
        // should be triggered **after** disabled state to avoid additional re-draws
        this._initStore();
        this.initialised = true;
        this.initialisedOK = true;
        var callbackOnInit = this.config.callbackOnInit;
        // Run callback if it is a function
        if (typeof callbackOnInit === 'function') {
            callbackOnInit.call(this);
        }
    };
    Choices.prototype.destroy = function () {
        if (!this.initialised) {
            return;
        }
        this._removeEventListeners();
        this.passedElement.reveal();
        this.containerOuter.unwrap(this.passedElement.element);
        this._store._listeners = []; // prevents select/input value being wiped
        this.clearStore(false);
        this._stopSearch();
        this._templates = Choices.defaults.templates;
        this.initialised = false;
        this.initialisedOK = undefined;
    };
    Choices.prototype.enable = function () {
        if (this.passedElement.isDisabled) {
            this.passedElement.enable();
        }
        if (this.containerOuter.isDisabled) {
            this._addEventListeners();
            this.input.enable();
            this.containerOuter.enable();
        }
        return this;
    };
    Choices.prototype.disable = function () {
        if (!this.passedElement.isDisabled) {
            this.passedElement.disable();
        }
        if (!this.containerOuter.isDisabled) {
            this._removeEventListeners();
            this.input.disable();
            this.containerOuter.disable();
        }
        return this;
    };
    Choices.prototype.highlightItem = function (item, runEvent) {
        if (runEvent === void 0) { runEvent = true; }
        if (!item || !item.id) {
            return this;
        }
        var choice = this._store.items.find(function (c) { return c.id === item.id; });
        if (!choice || choice.highlighted) {
            return this;
        }
        this._store.dispatch(highlightItem(choice, true));
        if (runEvent) {
            this.passedElement.triggerEvent(EventType.highlightItem, this._getChoiceForOutput(choice));
        }
        return this;
    };
    Choices.prototype.unhighlightItem = function (item, runEvent) {
        if (runEvent === void 0) { runEvent = true; }
        if (!item || !item.id) {
            return this;
        }
        var choice = this._store.items.find(function (c) { return c.id === item.id; });
        if (!choice || !choice.highlighted) {
            return this;
        }
        this._store.dispatch(highlightItem(choice, false));
        if (runEvent) {
            this.passedElement.triggerEvent(EventType.unhighlightItem, this._getChoiceForOutput(choice));
        }
        return this;
    };
    Choices.prototype.highlightAll = function () {
        var _this = this;
        this._store.withTxn(function () {
            _this._store.items.forEach(function (item) {
                if (!item.highlighted) {
                    _this._store.dispatch(highlightItem(item, true));
                    _this.passedElement.triggerEvent(EventType.highlightItem, _this._getChoiceForOutput(item));
                }
            });
        });
        return this;
    };
    Choices.prototype.unhighlightAll = function () {
        var _this = this;
        this._store.withTxn(function () {
            _this._store.items.forEach(function (item) {
                if (item.highlighted) {
                    _this._store.dispatch(highlightItem(item, false));
                    _this.passedElement.triggerEvent(EventType.highlightItem, _this._getChoiceForOutput(item));
                }
            });
        });
        return this;
    };
    Choices.prototype.removeActiveItemsByValue = function (value) {
        var _this = this;
        this._store.withTxn(function () {
            _this._store.items.filter(function (item) { return item.value === value; }).forEach(function (item) { return _this._removeItem(item); });
        });
        return this;
    };
    Choices.prototype.removeActiveItems = function (excludedId) {
        var _this = this;
        this._store.withTxn(function () {
            _this._store.items.filter(function (_a) {
                var id = _a.id;
                return id !== excludedId;
            }).forEach(function (item) { return _this._removeItem(item); });
        });
        return this;
    };
    Choices.prototype.removeHighlightedItems = function (runEvent) {
        var _this = this;
        if (runEvent === void 0) { runEvent = false; }
        this._store.withTxn(function () {
            _this._store.highlightedActiveItems.forEach(function (item) {
                _this._removeItem(item);
                // If this action was performed by the user
                // trigger the event
                if (runEvent) {
                    _this._triggerChange(item.value);
                }
            });
        });
        return this;
    };
    Choices.prototype.showDropdown = function (preventInputFocus) {
        var _this = this;
        if (this.dropdown.isActive) {
            return this;
        }
        requestAnimationFrame(function () {
            _this.dropdown.show();
            var rect = _this.dropdown.element.getBoundingClientRect();
            _this.containerOuter.open(rect.bottom, rect.height);
            if (!preventInputFocus && _this._canSearch) {
                _this.input.focus();
            }
            _this.passedElement.triggerEvent(EventType.showDropdown);
        });
        return this;
    };
    Choices.prototype.hideDropdown = function (preventInputBlur) {
        var _this = this;
        if (!this.dropdown.isActive) {
            return this;
        }
        requestAnimationFrame(function () {
            _this.dropdown.hide();
            _this.containerOuter.close();
            if (!preventInputBlur && _this._canSearch) {
                _this.input.removeActiveDescendant();
                _this.input.blur();
            }
            _this.passedElement.triggerEvent(EventType.hideDropdown);
        });
        return this;
    };
    Choices.prototype.getValue = function (valueOnly) {
        var _this = this;
        var values = this._store.items.map(function (item) {
            return (valueOnly ? item.value : _this._getChoiceForOutput(item));
        });
        return this._isSelectOneElement || this.config.singleModeForMultiSelect ? values[0] : values;
    };
    Choices.prototype.setValue = function (items) {
        var _this = this;
        if (!this.initialisedOK) {
            this._warnChoicesInitFailed('setValue');
            return this;
        }
        this._store.withTxn(function () {
            items.forEach(function (value) {
                if (value) {
                    _this._addChoice(mapInputToChoice(value, false));
                }
            });
        });
        // @todo integrate with Store
        this._searcher.reset();
        return this;
    };
    Choices.prototype.setChoiceByValue = function (value) {
        var _this = this;
        if (!this.initialisedOK) {
            this._warnChoicesInitFailed('setChoiceByValue');
            return this;
        }
        if (this._isTextElement) {
            return this;
        }
        this._store.withTxn(function () {
            // If only one value has been passed, convert to array
            var choiceValue = Array.isArray(value) ? value : [value];
            // Loop through each value and
            choiceValue.forEach(function (val) { return _this._findAndSelectChoiceByValue(val); });
            _this.unhighlightAll();
        });
        // @todo integrate with Store
        this._searcher.reset();
        return this;
    };
    /**
     * Set choices of select input via an array of objects (or function that returns array of object or promise of it),
     * a value field name and a label field name.
     * This behaves the same as passing items via the choices option but can be called after initialising Choices.
     * This can also be used to add groups of choices (see example 2); Optionally pass a true `replaceChoices` value to remove any existing choices.
     * Optionally pass a `customProperties` object to add additional data to your choices (useful when searching/filtering etc).
     *
     * **Input types affected:** select-one, select-multiple
     *
     * @example
     * ```js
     * const example = new Choices(element);
     *
     * example.setChoices([
     *   {value: 'One', label: 'Label One', disabled: true},
     *   {value: 'Two', label: 'Label Two', selected: true},
     *   {value: 'Three', label: 'Label Three'},
     * ], 'value', 'label', false);
     * ```
     *
     * @example
     * ```js
     * const example = new Choices(element);
     *
     * example.setChoices(async () => {
     *   try {
     *      const items = await fetch('/items');
     *      return items.json()
     *   } catch(err) {
     *      console.error(err)
     *   }
     * });
     * ```
     *
     * @example
     * ```js
     * const example = new Choices(element);
     *
     * example.setChoices([{
     *   label: 'Group one',
     *   id: 1,
     *   disabled: false,
     *   choices: [
     *     {value: 'Child One', label: 'Child One', selected: true},
     *     {value: 'Child Two', label: 'Child Two',  disabled: true},
     *     {value: 'Child Three', label: 'Child Three'},
     *   ]
     * },
     * {
     *   label: 'Group two',
     *   id: 2,
     *   disabled: false,
     *   choices: [
     *     {value: 'Child Four', label: 'Child Four', disabled: true},
     *     {value: 'Child Five', label: 'Child Five'},
     *     {value: 'Child Six', label: 'Child Six', customProperties: {
     *       description: 'Custom description about child six',
     *       random: 'Another random custom property'
     *     }},
     *   ]
     * }], 'value', 'label', false);
     * ```
     */
    Choices.prototype.setChoices = function (choicesArrayOrFetcher, value, label, replaceChoices, clearSearchFlag) {
        var _this = this;
        if (choicesArrayOrFetcher === void 0) { choicesArrayOrFetcher = []; }
        if (value === void 0) { value = 'value'; }
        if (label === void 0) { label = 'label'; }
        if (replaceChoices === void 0) { replaceChoices = false; }
        if (clearSearchFlag === void 0) { clearSearchFlag = true; }
        if (!this.initialisedOK) {
            this._warnChoicesInitFailed('setChoices');
            return this;
        }
        if (!this._isSelectElement) {
            throw new TypeError("setChoices can't be used with INPUT based Choices");
        }
        if (typeof value !== 'string' || !value) {
            throw new TypeError("value parameter must be a name of 'value' field in passed objects");
        }
        // Clear choices if needed
        if (replaceChoices) {
            this.clearChoices();
        }
        if (typeof choicesArrayOrFetcher === 'function') {
            // it's a choices fetcher function
            var fetcher_1 = choicesArrayOrFetcher(this);
            if (typeof Promise === 'function' && fetcher_1 instanceof Promise) {
                // that's a promise
                // eslint-disable-next-line no-promise-executor-return
                return new Promise(function (resolve) { return requestAnimationFrame(resolve); })
                    .then(function () { return _this._handleLoadingState(true); })
                    .then(function () { return fetcher_1; })
                    .then(function (data) { return _this.setChoices(data, value, label, replaceChoices); })
                    .catch(function (err) {
                    if (!_this.config.silent) {
                        console.error(err);
                    }
                })
                    .then(function () { return _this._handleLoadingState(false); })
                    .then(function () { return _this; });
            }
            // function returned something else than promise, let's check if it's an array of choices
            if (!Array.isArray(fetcher_1)) {
                throw new TypeError(".setChoices first argument function must return either array of choices or Promise, got: ".concat(typeof fetcher_1));
            }
            // recursion with results, it's sync and choices were cleared already
            return this.setChoices(fetcher_1, value, label, false);
        }
        if (!Array.isArray(choicesArrayOrFetcher)) {
            throw new TypeError(".setChoices must be called either with array of choices with a function resulting into Promise of array of choices");
        }
        this.containerOuter.removeLoadingState();
        this._store.withTxn(function () {
            if (clearSearchFlag) {
                _this._isSearching = false;
            }
            var isDefaultValue = value === 'value';
            var isDefaultLabel = label === 'label';
            choicesArrayOrFetcher.forEach(function (groupOrChoice) {
                if ('choices' in groupOrChoice) {
                    var group = groupOrChoice;
                    if (!isDefaultLabel) {
                        group = __assign(__assign({}, group), { label: group[label] });
                    }
                    _this._addGroup(mapInputToChoice(group, true));
                }
                else {
                    var choice = groupOrChoice;
                    if (!isDefaultLabel || !isDefaultValue) {
                        choice = __assign(__assign({}, choice), { value: choice[value], label: choice[label] });
                    }
                    _this._addChoice(mapInputToChoice(choice, false));
                }
            });
            _this.unhighlightAll();
        });
        // @todo integrate with Store
        this._searcher.reset();
        return this;
    };
    Choices.prototype.refresh = function (withEvents, selectFirstOption, deselectAll) {
        var _this = this;
        if (withEvents === void 0) { withEvents = false; }
        if (selectFirstOption === void 0) { selectFirstOption = false; }
        if (deselectAll === void 0) { deselectAll = false; }
        if (!this._isSelectElement) {
            if (!this.config.silent) {
                console.warn('refresh method can only be used on choices backed by a <select> element');
            }
            return this;
        }
        this._store.withTxn(function () {
            var choicesFromOptions = _this.passedElement.optionsAsChoices();
            // Build the list of items which require preserving
            var existingItems = {};
            if (!deselectAll) {
                _this._store.items.forEach(function (choice) {
                    if (choice.id && choice.active && choice.selected && !choice.disabled) {
                        existingItems[choice.value] = true;
                    }
                });
            }
            _this.clearStore(false);
            var updateChoice = function (choice) {
                if (deselectAll) {
                    _this._store.dispatch(removeItem$1(choice));
                }
                else if (existingItems[choice.value]) {
                    choice.selected = true;
                }
            };
            choicesFromOptions.forEach(function (groupOrChoice) {
                if ('choices' in groupOrChoice) {
                    groupOrChoice.choices.forEach(updateChoice);
                    return;
                }
                updateChoice(groupOrChoice);
            });
            /* @todo only generate add events for the added options instead of all
            if (withEvents) {
              items.forEach((choice) => {
                if (existingItems[choice.value]) {
                  this.passedElement.triggerEvent(
                    EventType.removeItem,
                    this._getChoiceForEvent(choice),
                  );
                }
              });
            }
            */
            // load new choices & items
            _this._addPredefinedChoices(choicesFromOptions, selectFirstOption, withEvents);
            // re-do search if required
            if (_this._isSearching) {
                _this._searchChoices(_this.input.value);
            }
        });
        return this;
    };
    Choices.prototype.removeChoice = function (value) {
        var choice = this._store.choices.find(function (c) { return c.value === value; });
        if (!choice) {
            return this;
        }
        this._clearNotice();
        this._store.dispatch(removeChoice(choice));
        // @todo integrate with Store
        this._searcher.reset();
        if (choice.selected) {
            this.passedElement.triggerEvent(EventType.removeItem, this._getChoiceForOutput(choice));
        }
        return this;
    };
    Choices.prototype.clearChoices = function () {
        var _this = this;
        this._store.withTxn(function () {
            _this._store.choices.forEach(function (choice) {
                if (!choice.selected) {
                    _this._store.dispatch(removeChoice(choice));
                }
            });
        });
        // @todo integrate with Store
        this._searcher.reset();
        return this;
    };
    Choices.prototype.clearStore = function (clearOptions) {
        if (clearOptions === void 0) { clearOptions = true; }
        this._stopSearch();
        if (clearOptions) {
            this.passedElement.element.replaceChildren('');
        }
        this.itemList.element.replaceChildren('');
        this.choiceList.element.replaceChildren('');
        this._store.reset();
        this._lastAddedChoiceId = 0;
        this._lastAddedGroupId = 0;
        // @todo integrate with Store
        this._searcher.reset();
        return this;
    };
    Choices.prototype.clearInput = function () {
        var shouldSetInputWidth = !this._isSelectOneElement;
        this.input.clear(shouldSetInputWidth);
        this._stopSearch();
        return this;
    };
    Choices.prototype._validateConfig = function () {
        var config = this.config;
        var invalidConfigOptions = diff(config, DEFAULT_CONFIG);
        if (invalidConfigOptions.length) {
            console.warn('Unknown config option(s) passed', invalidConfigOptions.join(', '));
        }
        if (config.allowHTML && config.allowHtmlUserInput) {
            if (config.addItems) {
                console.warn('Warning: allowHTML/allowHtmlUserInput/addItems all being true is strongly not recommended and may lead to XSS attacks');
            }
            if (config.addChoices) {
                console.warn('Warning: allowHTML/allowHtmlUserInput/addChoices all being true is strongly not recommended and may lead to XSS attacks');
            }
        }
    };
    Choices.prototype._render = function (changes) {
        if (changes === void 0) { changes = { choices: true, groups: true, items: true }; }
        if (this._store.inTxn()) {
            return;
        }
        if (this._isSelectElement) {
            if (changes.choices || changes.groups) {
                this._renderChoices();
            }
        }
        if (changes.items) {
            this._renderItems();
        }
    };
    Choices.prototype._renderChoices = function () {
        var _this = this;
        if (!this._canAddItems()) {
            return; // block rendering choices if the input limit is reached.
        }
        var _a = this, config = _a.config, isSearching = _a._isSearching;
        var _b = this._store, activeGroups = _b.activeGroups, activeChoices = _b.activeChoices;
        var renderLimit = 0;
        if (isSearching && config.searchResultLimit > 0) {
            renderLimit = config.searchResultLimit;
        }
        else if (config.renderChoiceLimit > 0) {
            renderLimit = config.renderChoiceLimit;
        }
        if (this._isSelectElement) {
            var backingOptions = activeChoices.filter(function (choice) { return !choice.element; });
            if (backingOptions.length) {
                this.passedElement.addOptions(backingOptions);
            }
        }
        var fragment = document.createDocumentFragment();
        var renderableChoices = function (choices) {
            return choices.filter(function (choice) {
                return !choice.placeholder && (isSearching ? !!choice.rank : config.renderSelectedChoices || !choice.selected);
            });
        };
        var selectableChoices = false;
        var renderChoices = function (choices, withinGroup, groupLabel) {
            if (isSearching) {
                // sortByRank is used to ensure stable sorting, as scores are non-unique
                // this additionally ensures fuseOptions.sortFn is not ignored
                choices.sort(sortByRank);
            }
            else if (config.shouldSort) {
                choices.sort(config.sorter);
            }
            var choiceLimit = choices.length;
            choiceLimit = !withinGroup && renderLimit && choiceLimit > renderLimit ? renderLimit : choiceLimit;
            choiceLimit--;
            choices.every(function (choice, index) {
                // choiceEl being empty signals the contents has probably significantly changed
                var dropdownItem = choice.choiceEl || _this._templates.choice(config, choice, config.itemSelectText, groupLabel);
                choice.choiceEl = dropdownItem;
                fragment.appendChild(dropdownItem);
                if (!choice.disabled && (isSearching || !choice.selected)) {
                    selectableChoices = true;
                }
                return index < choiceLimit;
            });
        };
        if (activeChoices.length) {
            if (config.resetScrollPosition) {
                requestAnimationFrame(function () { return _this.choiceList.scrollToTop(); });
            }
            if (!this._hasNonChoicePlaceholder && !isSearching && this._isSelectOneElement) {
                // If we have a placeholder choice along with groups
                renderChoices(activeChoices.filter(function (choice) { return choice.placeholder && !choice.group; }), false, undefined);
            }
            // If we have grouped options
            if (activeGroups.length && !isSearching) {
                if (config.shouldSort) {
                    activeGroups.sort(config.sorter);
                }
                // render Choices without group first, regardless of sort, otherwise they won't be distinguishable
                // from the last group
                renderChoices(activeChoices.filter(function (choice) { return !choice.placeholder && !choice.group; }), false, undefined);
                activeGroups.forEach(function (group) {
                    var groupChoices = renderableChoices(group.choices);
                    if (groupChoices.length) {
                        if (group.label) {
                            var dropdownGroup = group.groupEl || _this._templates.choiceGroup(_this.config, group);
                            group.groupEl = dropdownGroup;
                            dropdownGroup.remove();
                            fragment.appendChild(dropdownGroup);
                        }
                        renderChoices(groupChoices, true, config.appendGroupInSearch && isSearching ? group.label : undefined);
                    }
                });
            }
            else {
                renderChoices(renderableChoices(activeChoices), false, undefined);
            }
        }
        if (!selectableChoices) {
            if (!this._notice) {
                this._notice = {
                    text: resolveStringFunction(isSearching ? config.noResultsText : config.noChoicesText),
                    type: isSearching ? NoticeTypes.noResults : NoticeTypes.noChoices,
                };
            }
            fragment.replaceChildren('');
        }
        this._renderNotice(fragment);
        this.choiceList.element.replaceChildren(fragment);
        if (selectableChoices) {
            this._highlightChoice();
        }
    };
    Choices.prototype._renderItems = function () {
        var _this = this;
        var items = this._store.items || [];
        var itemList = this.itemList.element;
        var config = this.config;
        var fragment = document.createDocumentFragment();
        var itemFromList = function (item) {
            return itemList.querySelector("[data-item][data-id=\"".concat(item.id, "\"]"));
        };
        var addItemToFragment = function (item) {
            var el = item.itemEl;
            if (el && el.parentElement) {
                return;
            }
            el = itemFromList(item) || _this._templates.item(config, item, config.removeItemButton);
            item.itemEl = el;
            fragment.appendChild(el);
        };
        // new items
        items.forEach(addItemToFragment);
        var addItems = !!fragment.childNodes.length;
        if (this._isSelectOneElement && this._hasNonChoicePlaceholder) {
            var existingItems = itemList.children.length;
            if (addItems || existingItems > 1) {
                var placeholder = itemList.querySelector(getClassNamesSelector(config.classNames.placeholder));
                if (placeholder) {
                    placeholder.remove();
                }
            }
            else if (!existingItems) {
                addItems = true;
                addItemToFragment(mapInputToChoice({
                    selected: true,
                    value: '',
                    label: config.placeholderValue || '',
                    placeholder: true,
                }, false));
            }
        }
        if (addItems) {
            itemList.append(fragment);
            if (config.shouldSortItems && !this._isSelectOneElement) {
                items.sort(config.sorter);
                // push sorting into the DOM
                items.forEach(function (item) {
                    var el = itemFromList(item);
                    if (el) {
                        el.remove();
                        fragment.append(el);
                    }
                });
                itemList.append(fragment);
            }
        }
        if (this._isTextElement) {
            // Update the value of the hidden input
            this.passedElement.value = items.map(function (_a) {
                var value = _a.value;
                return value;
            }).join(config.delimiter);
        }
    };
    Choices.prototype._displayNotice = function (text, type, openDropdown) {
        if (openDropdown === void 0) { openDropdown = true; }
        var oldNotice = this._notice;
        if (oldNotice &&
            ((oldNotice.type === type && oldNotice.text === text) ||
                (oldNotice.type === NoticeTypes.addChoice &&
                    (type === NoticeTypes.noResults || type === NoticeTypes.noChoices)))) {
            if (openDropdown) {
                this.showDropdown(true);
            }
            return;
        }
        this._clearNotice();
        this._notice = text
            ? {
                text: text,
                type: type,
            }
            : undefined;
        this._renderNotice();
        if (openDropdown && text) {
            this.showDropdown(true);
        }
    };
    Choices.prototype._clearNotice = function () {
        if (!this._notice) {
            return;
        }
        var noticeElement = this.choiceList.element.querySelector(getClassNamesSelector(this.config.classNames.notice));
        if (noticeElement) {
            noticeElement.remove();
        }
        this._notice = undefined;
    };
    Choices.prototype._renderNotice = function (fragment) {
        var noticeConf = this._notice;
        if (noticeConf) {
            var notice = this._templates.notice(this.config, noticeConf.text, noticeConf.type);
            if (fragment) {
                fragment.append(notice);
            }
            else {
                this.choiceList.prepend(notice);
            }
        }
    };
    // eslint-disable-next-line class-methods-use-this
    Choices.prototype._getChoiceForOutput = function (choice, keyCode) {
        return {
            id: choice.id,
            highlighted: choice.highlighted,
            labelClass: choice.labelClass,
            labelDescription: choice.labelDescription,
            customProperties: choice.customProperties,
            disabled: choice.disabled,
            active: choice.active,
            label: choice.label,
            placeholder: choice.placeholder,
            value: choice.value,
            groupValue: choice.group ? choice.group.label : undefined,
            element: choice.element,
            keyCode: keyCode,
        };
    };
    Choices.prototype._triggerChange = function (value) {
        if (value === undefined || value === null) {
            return;
        }
        this.passedElement.triggerEvent(EventType.change, {
            value: value,
        });
    };
    Choices.prototype._handleButtonAction = function (element) {
        var _this = this;
        var items = this._store.items;
        if (!items.length || !this.config.removeItems || !this.config.removeItemButton) {
            return;
        }
        var id = element && parseDataSetId(element.parentElement);
        var itemToRemove = id && items.find(function (item) { return item.id === id; });
        if (!itemToRemove) {
            return;
        }
        this._store.withTxn(function () {
            // Remove item associated with button
            _this._removeItem(itemToRemove);
            _this._triggerChange(itemToRemove.value);
            if (_this._isSelectOneElement && !_this._hasNonChoicePlaceholder) {
                var placeholderChoice = _this._store.choices
                    .reverse()
                    .find(function (choice) { return !choice.disabled && choice.placeholder; });
                if (placeholderChoice) {
                    _this._addItem(placeholderChoice);
                    _this.unhighlightAll();
                    if (placeholderChoice.value) {
                        _this._triggerChange(placeholderChoice.value);
                    }
                }
            }
        });
    };
    Choices.prototype._handleItemAction = function (element, hasShiftKey) {
        var _this = this;
        if (hasShiftKey === void 0) { hasShiftKey = false; }
        var items = this._store.items;
        if (!items.length || !this.config.removeItems || this._isSelectOneElement) {
            return;
        }
        var id = parseDataSetId(element);
        if (!id) {
            return;
        }
        // We only want to select one item with a click
        // so we deselect any items that aren't the target
        // unless shift is being pressed
        items.forEach(function (item) {
            if (item.id === id && !item.highlighted) {
                _this.highlightItem(item);
            }
            else if (!hasShiftKey && item.highlighted) {
                _this.unhighlightItem(item);
            }
        });
        // Focus input as without focus, a user cannot do anything with a
        // highlighted item
        this.input.focus();
    };
    Choices.prototype._handleChoiceAction = function (element) {
        var _this = this;
        // If we are clicking on an option
        var id = parseDataSetId(element);
        var choice = id && this._store.getChoiceById(id);
        if (!choice || choice.disabled) {
            return false;
        }
        var hasActiveDropdown = this.dropdown.isActive;
        if (!choice.selected) {
            if (!this._canAddItems()) {
                return true; // causes _onEnterKey to early out
            }
            this._store.withTxn(function () {
                _this._addItem(choice, true, true);
                _this.clearInput();
                _this.unhighlightAll();
            });
            this._triggerChange(choice.value);
        }
        // We want to close the dropdown if we are dealing with a single select box
        if (hasActiveDropdown && this.config.closeDropdownOnSelect) {
            this.hideDropdown(true);
            this.containerOuter.element.focus();
        }
        return true;
    };
    Choices.prototype._handleBackspace = function (items) {
        var config = this.config;
        if (!config.removeItems || !items.length) {
            return;
        }
        var lastItem = items[items.length - 1];
        var hasHighlightedItems = items.some(function (item) { return item.highlighted; });
        // If editing the last item is allowed and there are not other selected items,
        // we can edit the item value. Otherwise if we can remove items, remove all selected items
        if (config.editItems && !hasHighlightedItems && lastItem) {
            this.input.value = lastItem.value;
            this.input.setWidth();
            this._removeItem(lastItem);
            this._triggerChange(lastItem.value);
        }
        else {
            if (!hasHighlightedItems) {
                // Highlight last item if none already highlighted
                this.highlightItem(lastItem, false);
            }
            this.removeHighlightedItems(true);
        }
    };
    Choices.prototype._loadChoices = function () {
        var _a;
        var config = this.config;
        if (this._isTextElement) {
            // Assign preset items from passed object first
            this._presetChoices = config.items.map(function (e) { return mapInputToChoice(e, false); });
            // Add any values passed from attribute
            if (this.passedElement.value) {
                var elementItems = this.passedElement.value
                    .split(config.delimiter)
                    .map(function (e) { return mapInputToChoice(e, false); });
                this._presetChoices = this._presetChoices.concat(elementItems);
            }
            this._presetChoices.forEach(function (choice) {
                choice.selected = true;
            });
        }
        else if (this._isSelectElement) {
            // Assign preset choices from passed object
            this._presetChoices = config.choices.map(function (e) { return mapInputToChoice(e, true); });
            // Create array of choices from option elements
            var choicesFromOptions = this.passedElement.optionsAsChoices();
            if (choicesFromOptions) {
                (_a = this._presetChoices).push.apply(_a, choicesFromOptions);
            }
        }
    };
    Choices.prototype._handleLoadingState = function (setLoading) {
        if (setLoading === void 0) { setLoading = true; }
        var el = this.itemList.element;
        if (setLoading) {
            this.disable();
            this.containerOuter.addLoadingState();
            if (this._isSelectOneElement) {
                el.replaceChildren(this._templates.placeholder(this.config, this.config.loadingText));
            }
            else {
                this.input.placeholder = this.config.loadingText;
            }
        }
        else {
            this.enable();
            this.containerOuter.removeLoadingState();
            if (this._isSelectOneElement) {
                el.replaceChildren('');
                this._render();
            }
            else {
                this.input.placeholder = this._placeholderValue || '';
            }
        }
    };
    Choices.prototype._handleSearch = function (value) {
        if (!this.input.isFocussed) {
            return;
        }
        // Check that we have a value to search and the input was an alphanumeric character
        if (value !== null && typeof value !== 'undefined' && value.length >= this.config.searchFloor) {
            var resultCount = this.config.searchChoices ? this._searchChoices(value) : 0;
            if (resultCount !== null) {
                // Trigger search event
                this.passedElement.triggerEvent(EventType.search, {
                    value: value,
                    resultCount: resultCount,
                });
            }
        }
        else if (this._store.choices.some(function (option) { return !option.active; })) {
            this._stopSearch();
        }
    };
    Choices.prototype._canAddItems = function () {
        var config = this.config;
        var maxItemCount = config.maxItemCount, maxItemText = config.maxItemText;
        if (!config.singleModeForMultiSelect && maxItemCount > 0 && maxItemCount <= this._store.items.length) {
            this.choiceList.element.replaceChildren('');
            this._displayNotice(typeof maxItemText === 'function' ? maxItemText(maxItemCount) : maxItemText, NoticeTypes.addChoice);
            return false;
        }
        return true;
    };
    Choices.prototype._canCreateItem = function (value) {
        var config = this.config;
        var canAddItem = true;
        var notice = '';
        if (canAddItem && typeof config.addItemFilter === 'function' && !config.addItemFilter(value)) {
            canAddItem = false;
            notice = resolveNoticeFunction(config.customAddItemText, value);
        }
        if (canAddItem) {
            var foundChoice = this._store.choices.find(function (choice) { return config.valueComparer(choice.value, value); });
            if (this._isSelectElement) {
                // for exact matches, do not prompt to add it as a custom choice
                if (foundChoice) {
                    this._displayNotice('', NoticeTypes.addChoice);
                    return false;
                }
            }
            else if (this._isTextElement && !config.duplicateItemsAllowed) {
                if (foundChoice) {
                    canAddItem = false;
                    notice = resolveNoticeFunction(config.uniqueItemText, value);
                }
            }
        }
        if (canAddItem) {
            notice = resolveNoticeFunction(config.addItemText, value);
        }
        if (notice) {
            this._displayNotice(notice, NoticeTypes.addChoice);
        }
        return canAddItem;
    };
    Choices.prototype._searchChoices = function (value) {
        var newValue = value.trim().replace(/\s{2,}/, ' ');
        // signal input didn't change search
        if (!newValue.length || newValue === this._currentValue) {
            return null;
        }
        var searcher = this._searcher;
        if (searcher.isEmptyIndex()) {
            searcher.index(this._store.searchableChoices);
        }
        // If new value matches the desired length and is not the same as the current value with a space
        var results = searcher.search(newValue);
        this._currentValue = newValue;
        this._highlightPosition = 0;
        this._isSearching = true;
        var notice = this._notice;
        var noticeType = notice && notice.type;
        if (noticeType !== NoticeTypes.addChoice) {
            if (!results.length) {
                this._displayNotice(resolveStringFunction(this.config.noResultsText), NoticeTypes.noResults);
            }
            else {
                this._clearNotice();
            }
        }
        this._store.dispatch(filterChoices(results));
        return results.length;
    };
    Choices.prototype._stopSearch = function () {
        if (this._isSearching) {
            this._currentValue = '';
            this._isSearching = false;
            this._clearNotice();
            this._store.dispatch(activateChoices(true));
            this.passedElement.triggerEvent(EventType.search, {
                value: '',
                resultCount: 0,
            });
        }
    };
    Choices.prototype._addEventListeners = function () {
        var documentElement = this._docRoot;
        var outerElement = this.containerOuter.element;
        var inputElement = this.input.element;
        // capture events - can cancel event processing or propagation
        documentElement.addEventListener('touchend', this._onTouchEnd, true);
        outerElement.addEventListener('keydown', this._onKeyDown, true);
        outerElement.addEventListener('mousedown', this._onMouseDown, true);
        // passive events - doesn't call `preventDefault` or `stopPropagation`
        documentElement.addEventListener('click', this._onClick, { passive: true });
        documentElement.addEventListener('touchmove', this._onTouchMove, {
            passive: true,
        });
        this.dropdown.element.addEventListener('mouseover', this._onMouseOver, {
            passive: true,
        });
        if (this._isSelectOneElement) {
            outerElement.addEventListener('focus', this._onFocus, {
                passive: true,
            });
            outerElement.addEventListener('blur', this._onBlur, {
                passive: true,
            });
        }
        inputElement.addEventListener('keyup', this._onKeyUp, {
            passive: true,
        });
        inputElement.addEventListener('input', this._onInput, {
            passive: true,
        });
        inputElement.addEventListener('focus', this._onFocus, {
            passive: true,
        });
        inputElement.addEventListener('blur', this._onBlur, {
            passive: true,
        });
        if (inputElement.form) {
            inputElement.form.addEventListener('reset', this._onFormReset, {
                passive: true,
            });
        }
        this.input.addEventListeners();
    };
    Choices.prototype._removeEventListeners = function () {
        var documentElement = this._docRoot;
        var outerElement = this.containerOuter.element;
        var inputElement = this.input.element;
        documentElement.removeEventListener('touchend', this._onTouchEnd, true);
        outerElement.removeEventListener('keydown', this._onKeyDown, true);
        outerElement.removeEventListener('mousedown', this._onMouseDown, true);
        documentElement.removeEventListener('click', this._onClick);
        documentElement.removeEventListener('touchmove', this._onTouchMove);
        this.dropdown.element.removeEventListener('mouseover', this._onMouseOver);
        if (this._isSelectOneElement) {
            outerElement.removeEventListener('focus', this._onFocus);
            outerElement.removeEventListener('blur', this._onBlur);
        }
        inputElement.removeEventListener('keyup', this._onKeyUp);
        inputElement.removeEventListener('input', this._onInput);
        inputElement.removeEventListener('focus', this._onFocus);
        inputElement.removeEventListener('blur', this._onBlur);
        if (inputElement.form) {
            inputElement.form.removeEventListener('reset', this._onFormReset);
        }
        this.input.removeEventListeners();
    };
    Choices.prototype._onKeyDown = function (event) {
        var keyCode = event.keyCode;
        var hasActiveDropdown = this.dropdown.isActive;
        /*
        See:
        https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
        https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
        https://en.wikipedia.org/wiki/UTF-16#Code_points_from_U+010000_to_U+10FFFF - UTF-16 surrogate pairs
        https://stackoverflow.com/a/70866532 - "Unidentified" for mobile
        http://www.unicode.org/versions/Unicode5.2.0/ch16.pdf#G19635 - U+FFFF is reserved (Section 16.7)
    
        Logic: when a key event is sent, `event.key` represents its printable value _or_ one
        of a large list of special values indicating meta keys/functionality. In addition,
        key events for compose functionality contain a value of `Dead` when mid-composition.
    
        I can't quite verify it, but non-English IMEs may also be able to generate key codes
        for code points in the surrogate-pair range, which could potentially be seen as having
        key.length > 1. Since `Fn` is one of the special keys, we can't distinguish by that
        alone.
    
        Here, key.length === 1 means we know for sure the input was printable and not a special
        `key` value. When the length is greater than 1, it could be either a printable surrogate
        pair or a special `key` value. We can tell the difference by checking if the _character
        code_ value (not code point!) is in the "surrogate pair" range or not.
    
        We don't use .codePointAt because an invalid code point would return 65535, which wouldn't
        pass the >= 0x10000 check we would otherwise use.
    
        > ...The Unicode Standard sets aside 66 noncharacter code points. The last two code points
        > of each plane are noncharacters: U+FFFE and U+FFFF on the BMP...
        */
        var wasPrintableChar = event.key.length === 1 ||
            (event.key.length === 2 && event.key.charCodeAt(0) >= 0xd800) ||
            event.key === 'Unidentified';
        if (!this._isTextElement && !hasActiveDropdown) {
            this.showDropdown();
            if (!this.input.isFocussed && wasPrintableChar) {
                /*
                  We update the input value with the pressed key as
                  the input was not focussed at the time of key press
                  therefore does not have the value of the key.
                */
                this.input.value += event.key;
                // browsers interpret a space as pagedown
                if (event.key === ' ') {
                    event.preventDefault();
                }
            }
        }
        switch (keyCode) {
            case 65 /* KeyCodeMap.A_KEY */:
                return this._onSelectKey(event, this.itemList.element.hasChildNodes());
            case 13 /* KeyCodeMap.ENTER_KEY */:
                return this._onEnterKey(event, hasActiveDropdown);
            case 27 /* KeyCodeMap.ESC_KEY */:
                return this._onEscapeKey(event, hasActiveDropdown);
            case 38 /* KeyCodeMap.UP_KEY */:
            case 33 /* KeyCodeMap.PAGE_UP_KEY */:
            case 40 /* KeyCodeMap.DOWN_KEY */:
            case 34 /* KeyCodeMap.PAGE_DOWN_KEY */:
                return this._onDirectionKey(event, hasActiveDropdown);
            case 8 /* KeyCodeMap.DELETE_KEY */:
            case 46 /* KeyCodeMap.BACK_KEY */:
                return this._onDeleteKey(event, this._store.items, this.input.isFocussed);
        }
    };
    Choices.prototype._onKeyUp = function ( /* event: KeyboardEvent */) {
        this._canSearch = this.config.searchEnabled;
    };
    Choices.prototype._onInput = function ( /* event: InputEvent */) {
        var value = this.input.value;
        if (!value) {
            if (this._isTextElement) {
                this.hideDropdown(true);
            }
            else {
                this._stopSearch();
            }
            return;
        }
        if (!this._canAddItems()) {
            return;
        }
        if (this._canSearch) {
            // do the search even if the entered text can not be added
            this._handleSearch(value);
        }
        if (!this._canAddUserChoices) {
            return;
        }
        // determine if a notice needs to be displayed for why a search result can't be added
        this._canCreateItem(value);
        if (this._isSelectElement) {
            this._highlightPosition = 0; // reset to select the notice and/or exact match
            this._highlightChoice();
        }
    };
    Choices.prototype._onSelectKey = function (event, hasItems) {
        // If CTRL + A or CMD + A have been pressed and there are items to select
        if ((event.ctrlKey || event.metaKey) && hasItems) {
            this._canSearch = false;
            var shouldHightlightAll = this.config.removeItems && !this.input.value && this.input.element === document.activeElement;
            if (shouldHightlightAll) {
                this.highlightAll();
            }
        }
    };
    Choices.prototype._onEnterKey = function (event, hasActiveDropdown) {
        var _this = this;
        var value = this.input.value;
        var target = event.target;
        event.preventDefault();
        if (target && target.hasAttribute('data-button')) {
            this._handleButtonAction(target);
            return;
        }
        if (!hasActiveDropdown) {
            if (this._isSelectElement || this._notice) {
                this.showDropdown();
            }
            return;
        }
        var highlightedChoice = this.dropdown.element.querySelector(getClassNamesSelector(this.config.classNames.highlightedState));
        if (highlightedChoice && this._handleChoiceAction(highlightedChoice)) {
            return;
        }
        if (!target || !value) {
            this.hideDropdown(true);
            return;
        }
        if (!this._canAddItems()) {
            return;
        }
        var addedItem = false;
        this._store.withTxn(function () {
            addedItem = _this._findAndSelectChoiceByValue(value, true);
            if (!addedItem) {
                if (!_this._canAddUserChoices) {
                    return;
                }
                if (!_this._canCreateItem(value)) {
                    return;
                }
                var sanitisedValue = sanitise(value);
                var userValue = _this.config.allowHtmlUserInput || sanitisedValue === value ? value : { escaped: sanitisedValue, raw: value };
                _this._addChoice(mapInputToChoice({
                    value: userValue,
                    label: userValue,
                    selected: true,
                }, false), true, true);
                addedItem = true;
            }
            _this.clearInput();
            _this.unhighlightAll();
        });
        if (!addedItem) {
            return;
        }
        this._triggerChange(value);
        if (this.config.closeDropdownOnSelect) {
            this.hideDropdown(true);
        }
    };
    Choices.prototype._onEscapeKey = function (event, hasActiveDropdown) {
        if (hasActiveDropdown) {
            event.stopPropagation();
            this.hideDropdown(true);
            this.containerOuter.element.focus();
        }
    };
    Choices.prototype._onDirectionKey = function (event, hasActiveDropdown) {
        var keyCode = event.keyCode;
        // If up or down key is pressed, traverse through options
        if (hasActiveDropdown || this._isSelectOneElement) {
            this.showDropdown();
            this._canSearch = false;
            var directionInt = keyCode === 40 /* KeyCodeMap.DOWN_KEY */ || keyCode === 34 /* KeyCodeMap.PAGE_DOWN_KEY */ ? 1 : -1;
            var skipKey = event.metaKey || keyCode === 34 /* KeyCodeMap.PAGE_DOWN_KEY */ || keyCode === 33 /* KeyCodeMap.PAGE_UP_KEY */;
            var nextEl = void 0;
            if (skipKey) {
                if (directionInt > 0) {
                    nextEl = this.dropdown.element.querySelector("".concat(selectableChoiceIdentifier, ":last-of-type"));
                }
                else {
                    nextEl = this.dropdown.element.querySelector(selectableChoiceIdentifier);
                }
            }
            else {
                var currentEl = this.dropdown.element.querySelector(getClassNamesSelector(this.config.classNames.highlightedState));
                if (currentEl) {
                    nextEl = getAdjacentEl(currentEl, selectableChoiceIdentifier, directionInt);
                }
                else {
                    nextEl = this.dropdown.element.querySelector(selectableChoiceIdentifier);
                }
            }
            if (nextEl) {
                // We prevent default to stop the cursor moving
                // when pressing the arrow
                if (!isScrolledIntoView(nextEl, this.choiceList.element, directionInt)) {
                    this.choiceList.scrollToChildElement(nextEl, directionInt);
                }
                this._highlightChoice(nextEl);
            }
            // Prevent default to maintain cursor position whilst
            // traversing dropdown options
            event.preventDefault();
        }
    };
    Choices.prototype._onDeleteKey = function (event, items, hasFocusedInput) {
        // If backspace or delete key is pressed and the input has no value
        if (!this._isSelectOneElement && !event.target.value && hasFocusedInput) {
            this._handleBackspace(items);
            event.preventDefault();
        }
    };
    Choices.prototype._onTouchMove = function () {
        if (this._wasTap) {
            this._wasTap = false;
        }
    };
    Choices.prototype._onTouchEnd = function (event) {
        var target = (event || event.touches[0]).target;
        var touchWasWithinContainer = this._wasTap && this.containerOuter.element.contains(target);
        if (touchWasWithinContainer) {
            var containerWasExactTarget = target === this.containerOuter.element || target === this.containerInner.element;
            if (containerWasExactTarget) {
                if (this._isTextElement) {
                    this.input.focus();
                }
                else if (this._isSelectMultipleElement) {
                    this.showDropdown();
                }
            }
            // Prevents focus event firing
            event.stopPropagation();
        }
        this._wasTap = true;
    };
    /**
     * Handles mousedown event in capture mode for containetOuter.element
     */
    Choices.prototype._onMouseDown = function (event) {
        var target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        // If we have our mouse down on the scrollbar and are on IE11...
        if (IS_IE11 && this.choiceList.element.contains(target)) {
            // check if click was on a scrollbar area
            var firstChoice = this.choiceList.element.firstElementChild;
            this._isScrollingOnIe =
                this._direction === 'ltr' ? event.offsetX >= firstChoice.offsetWidth : event.offsetX < firstChoice.offsetLeft;
        }
        if (target === this.input.element) {
            return;
        }
        var item = target.closest('[data-button],[data-item],[data-choice]');
        if (item instanceof HTMLElement) {
            if ('button' in item.dataset) {
                this._handleButtonAction(item);
            }
            else if ('item' in item.dataset) {
                this._handleItemAction(item, event.shiftKey);
            }
            else if ('choice' in item.dataset) {
                this._handleChoiceAction(item);
            }
        }
        event.preventDefault();
    };
    /**
     * Handles mouseover event over this.dropdown
     * @param {MouseEvent} event
     */
    Choices.prototype._onMouseOver = function (_a) {
        var target = _a.target;
        if (target instanceof HTMLElement && 'choice' in target.dataset) {
            this._highlightChoice(target);
        }
    };
    Choices.prototype._onClick = function (_a) {
        var target = _a.target;
        var containerOuter = this.containerOuter;
        var clickWasWithinContainer = containerOuter.element.contains(target);
        if (clickWasWithinContainer) {
            if (!this.dropdown.isActive && !containerOuter.isDisabled) {
                if (this._isTextElement) {
                    if (document.activeElement !== this.input.element) {
                        this.input.focus();
                    }
                }
                else {
                    this.showDropdown();
                    containerOuter.element.focus();
                }
            }
            else if (this._isSelectOneElement &&
                target !== this.input.element &&
                !this.dropdown.element.contains(target)) {
                this.hideDropdown();
            }
        }
        else {
            containerOuter.removeFocusState();
            this.hideDropdown(true);
            this.unhighlightAll();
        }
    };
    Choices.prototype._onFocus = function (_a) {
        var target = _a.target;
        var containerOuter = this.containerOuter;
        var focusWasWithinContainer = target && containerOuter.element.contains(target);
        if (!focusWasWithinContainer) {
            return;
        }
        var targetIsInput = target === this.input.element;
        if (this._isTextElement) {
            if (targetIsInput) {
                containerOuter.addFocusState();
            }
        }
        else if (this._isSelectMultipleElement) {
            if (targetIsInput) {
                this.showDropdown(true);
                // If element is a select box, the focused element is the container and the dropdown
                // isn't already open, focus and show dropdown
                containerOuter.addFocusState();
            }
        }
        else {
            containerOuter.addFocusState();
            if (targetIsInput) {
                this.showDropdown(true);
            }
        }
    };
    Choices.prototype._onBlur = function (_a) {
        var target = _a.target;
        var containerOuter = this.containerOuter;
        var blurWasWithinContainer = target && containerOuter.element.contains(target);
        if (blurWasWithinContainer && !this._isScrollingOnIe) {
            var targetIsInput = target === this.input.element;
            if (this._isTextElement || this._isSelectMultipleElement) {
                if (targetIsInput) {
                    containerOuter.removeFocusState();
                    this.hideDropdown(true);
                    this.unhighlightAll();
                }
            }
            else {
                containerOuter.removeFocusState();
                if (targetIsInput || (target === containerOuter.element && !this._canSearch)) {
                    this.hideDropdown(true);
                }
            }
        }
        else {
            // On IE11, clicking the scollbar blurs our input and thus
            // closes the dropdown. To stop this, we refocus our input
            // if we know we are on IE *and* are scrolling.
            this._isScrollingOnIe = false;
            this.input.element.focus();
        }
    };
    Choices.prototype._onFormReset = function () {
        var _this = this;
        this._store.withTxn(function () {
            _this.clearInput();
            _this.hideDropdown();
            _this.refresh(false, false, true);
            if (_this._initialItems.length) {
                _this.setChoiceByValue(_this._initialItems);
            }
        });
    };
    Choices.prototype._highlightChoice = function (el) {
        if (el === void 0) { el = null; }
        var choices = Array.from(this.dropdown.element.querySelectorAll(selectableChoiceIdentifier));
        if (!choices.length) {
            return;
        }
        var passedEl = el;
        var highlightedState = this.config.classNames.highlightedState;
        var highlightedChoices = Array.from(this.dropdown.element.querySelectorAll(getClassNamesSelector(highlightedState)));
        // Remove any highlighted choices
        highlightedChoices.forEach(function (choice) {
            removeClassesFromElement(choice, highlightedState);
            choice.setAttribute('aria-selected', 'false');
        });
        if (passedEl) {
            this._highlightPosition = choices.indexOf(passedEl);
        }
        else {
            // Highlight choice based on last known highlight location
            if (choices.length > this._highlightPosition) {
                // If we have an option to highlight
                passedEl = choices[this._highlightPosition];
            }
            else {
                // Otherwise highlight the option before
                passedEl = choices[choices.length - 1];
            }
            if (!passedEl) {
                passedEl = choices[0];
            }
        }
        addClassesToElement(passedEl, highlightedState);
        passedEl.setAttribute('aria-selected', 'true');
        this.passedElement.triggerEvent(EventType.highlightChoice, {
            el: passedEl,
        });
        if (this.dropdown.isActive) {
            // IE11 ignores aria-label and blocks virtual keyboard
            // if aria-activedescendant is set without a dropdown
            this.input.setActiveDescendant(passedEl.id);
            this.containerOuter.setActiveDescendant(passedEl.id);
        }
    };
    Choices.prototype._addItem = function (item, withEvents, userTriggered) {
        if (withEvents === void 0) { withEvents = true; }
        if (userTriggered === void 0) { userTriggered = false; }
        if (!item.id) {
            throw new TypeError('item.id must be set before _addItem is called for a choice/item');
        }
        if (this.config.singleModeForMultiSelect || this._isSelectOneElement) {
            this.removeActiveItems(item.id);
        }
        this._store.dispatch(addItem(item));
        if (withEvents) {
            this.passedElement.triggerEvent(EventType.addItem, this._getChoiceForOutput(item));
            if (userTriggered) {
                this.passedElement.triggerEvent(EventType.choice, this._getChoiceForOutput(item));
            }
        }
    };
    Choices.prototype._removeItem = function (item) {
        if (!item.id) {
            return;
        }
        this._store.dispatch(removeItem$1(item));
        this.passedElement.triggerEvent(EventType.removeItem, this._getChoiceForOutput(item));
    };
    Choices.prototype._addChoice = function (choice, withEvents, userTriggered) {
        if (withEvents === void 0) { withEvents = true; }
        if (userTriggered === void 0) { userTriggered = false; }
        if (choice.id) {
            throw new TypeError('Can not re-add a choice which has already been added');
        }
        var config = this.config;
        if ((this._isSelectElement || !config.duplicateItemsAllowed) &&
            this._store.choices.find(function (c) { return config.valueComparer(c.value, choice.value); })) {
            return;
        }
        // Generate unique id, in-place update is required so chaining _addItem works as expected
        this._lastAddedChoiceId++;
        choice.id = this._lastAddedChoiceId;
        choice.elementId = "".concat(this._baseId, "-").concat(this._idNames.itemChoice, "-").concat(choice.id);
        var prependValue = config.prependValue, appendValue = config.appendValue;
        if (prependValue) {
            choice.value = prependValue + choice.value;
        }
        if (appendValue) {
            choice.value += appendValue.toString();
        }
        if ((prependValue || appendValue) && choice.element) {
            choice.element.value = choice.value;
        }
        this._clearNotice();
        this._store.dispatch(addChoice(choice));
        if (choice.selected) {
            this._addItem(choice, withEvents, userTriggered);
        }
    };
    Choices.prototype._addGroup = function (group, withEvents) {
        var _this = this;
        if (withEvents === void 0) { withEvents = true; }
        if (group.id) {
            throw new TypeError('Can not re-add a group which has already been added');
        }
        this._store.dispatch(addGroup(group));
        if (!group.choices) {
            return;
        }
        // add unique id for the group(s), and do not store the full list of choices in this group
        this._lastAddedGroupId++;
        group.id = this._lastAddedGroupId;
        group.choices.forEach(function (item) {
            item.group = group;
            if (group.disabled) {
                item.disabled = true;
            }
            _this._addChoice(item, withEvents);
        });
    };
    Choices.prototype._createTemplates = function () {
        var _this = this;
        var callbackOnCreateTemplates = this.config.callbackOnCreateTemplates;
        var userTemplates = {};
        if (typeof callbackOnCreateTemplates === 'function') {
            userTemplates = callbackOnCreateTemplates.call(this, strToEl, escapeForTemplate, getClassNames);
        }
        var templating = {};
        Object.keys(this._templates).forEach(function (name) {
            if (name in userTemplates) {
                templating[name] = userTemplates[name].bind(_this);
            }
            else {
                templating[name] = _this._templates[name].bind(_this);
            }
        });
        this._templates = templating;
    };
    Choices.prototype._createElements = function () {
        var templating = this._templates;
        var _a = this, config = _a.config, isSelectOneElement = _a._isSelectOneElement;
        var position = config.position, classNames = config.classNames;
        var elementType = this._elementType;
        this.containerOuter = new Container({
            element: templating.containerOuter(config, this._direction, this._isSelectElement, isSelectOneElement, config.searchEnabled, elementType, config.labelId),
            classNames: classNames,
            type: elementType,
            position: position,
        });
        this.containerInner = new Container({
            element: templating.containerInner(config),
            classNames: classNames,
            type: elementType,
            position: position,
        });
        this.input = new Input({
            element: templating.input(config, this._placeholderValue),
            classNames: classNames,
            type: elementType,
            preventPaste: !config.paste,
        });
        this.choiceList = new List({
            element: templating.choiceList(config, isSelectOneElement),
        });
        this.itemList = new List({
            element: templating.itemList(config, isSelectOneElement),
        });
        this.dropdown = new Dropdown({
            element: templating.dropdown(config),
            classNames: classNames,
            type: elementType,
        });
    };
    Choices.prototype._createStructure = function () {
        var _a = this, containerInner = _a.containerInner, containerOuter = _a.containerOuter, passedElement = _a.passedElement;
        var dropdownElement = this.dropdown.element;
        // Hide original element
        passedElement.conceal();
        // Wrap input in container preserving DOM ordering
        containerInner.wrap(passedElement.element);
        // Wrapper inner container with outer container
        containerOuter.wrap(containerInner.element);
        if (this._isSelectOneElement) {
            this.input.placeholder = this.config.searchPlaceholderValue || '';
        }
        else {
            if (this._placeholderValue) {
                this.input.placeholder = this._placeholderValue;
            }
            this.input.setWidth();
        }
        containerOuter.element.appendChild(containerInner.element);
        containerOuter.element.appendChild(dropdownElement);
        containerInner.element.appendChild(this.itemList.element);
        dropdownElement.appendChild(this.choiceList.element);
        if (!this._isSelectOneElement) {
            containerInner.element.appendChild(this.input.element);
        }
        else if (this.config.searchEnabled) {
            dropdownElement.insertBefore(this.input.element, dropdownElement.firstChild);
        }
        this._highlightPosition = 0;
        this._isSearching = false;
    };
    Choices.prototype._initStore = function () {
        var _this = this;
        this._store.subscribe(this._render).withTxn(function () {
            _this._addPredefinedChoices(_this._presetChoices, _this._isSelectOneElement && !_this._hasNonChoicePlaceholder, false);
        });
        if (!this._store.choices.length || (this._isSelectOneElement && this._hasNonChoicePlaceholder)) {
            this._render();
        }
    };
    Choices.prototype._addPredefinedChoices = function (choices, selectFirstOption, withEvents) {
        var _this = this;
        if (selectFirstOption === void 0) { selectFirstOption = false; }
        if (withEvents === void 0) { withEvents = true; }
        if (selectFirstOption) {
            /**
             * If there is a selected choice already or the choice is not the first in
             * the array, add each choice normally.
             *
             * Otherwise we pre-select the first enabled choice in the array ("select-one" only)
             */
            var noSelectedChoices = choices.findIndex(function (choice) { return choice.selected; }) === -1;
            if (noSelectedChoices) {
                choices.some(function (choice) {
                    if (choice.disabled || 'choices' in choice) {
                        return false;
                    }
                    choice.selected = true;
                    return true;
                });
            }
        }
        choices.forEach(function (item) {
            if ('choices' in item) {
                if (_this._isSelectElement) {
                    _this._addGroup(item, withEvents);
                }
            }
            else {
                _this._addChoice(item, withEvents);
            }
        });
    };
    Choices.prototype._findAndSelectChoiceByValue = function (value, userTriggered) {
        var _this = this;
        if (userTriggered === void 0) { userTriggered = false; }
        // Check 'value' property exists and the choice isn't already selected
        var foundChoice = this._store.choices.find(function (choice) { return _this.config.valueComparer(choice.value, value); });
        if (foundChoice && !foundChoice.disabled && !foundChoice.selected) {
            this._addItem(foundChoice, true, userTriggered);
            return true;
        }
        return false;
    };
    Choices.prototype._generatePlaceholderValue = function () {
        var config = this.config;
        if (!config.placeholder) {
            return null;
        }
        if (this._hasNonChoicePlaceholder) {
            return config.placeholderValue;
        }
        if (this._isSelectElement) {
            var placeholderOption = this.passedElement.placeholderOption;
            return placeholderOption ? placeholderOption.text : null;
        }
        return null;
    };
    Choices.prototype._warnChoicesInitFailed = function (caller) {
        if (this.config.silent) {
            return;
        }
        if (!this.initialised) {
            throw new TypeError("".concat(caller, " called on a non-initialised instance of Choices"));
        }
        else if (!this.initialisedOK) {
            throw new TypeError("".concat(caller, " called for an element which has multiple instances of Choices initialised on it"));
        }
    };
    Choices.version = '11.0.2';
    return Choices;
}());




}),
"./node_modules/.pnpm/countries-list@3.1.1/node_modules/countries-list/mjs/index.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
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
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

/************************************************************************/
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
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _diagnosis_view_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./diagnosis_view/index.js */ "./js/diagnosis_view/index.js");


const diagnosisView = new _diagnosis_view_index_js__WEBPACK_IMPORTED_MODULE_0__.DiagnosisView()
diagnosisView.init()

})()
;
//# sourceMappingURL=diagnosis_view.js.map