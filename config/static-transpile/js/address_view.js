(() => { // webpackBootstrap
var __webpack_modules__ = ({
"./js/address_view/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  AddressView: function() { return AddressView; }
});
/* harmony import */var provinces__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! provinces */ "./node_modules/.pnpm/provinces@1.11.0/node_modules/provinces/index.js");
/* harmony import */var _tools__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools */ "./js/tools/index.js");




class AddressView {
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
        if (confirm(`Do you really want to delete this address?`)) {
          return (0,_tools__WEBPACK_IMPORTED_MODULE_1__.get)(`/api/address/delete/${this.copsacId}/${id}/`).then(
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
        : provinces__WEBPACK_IMPORTED_MODULE_0__.filter((province) => province.country === currentCountry)
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
    countrySelector.innerHTML = _tools__WEBPACK_IMPORTED_MODULE_1__.countryList.map(
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
    const currentCity = _tools__WEBPACK_IMPORTED_MODULE_1__.postCodes[currentPostCode] || ""
    cityInput.value = currentCity
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
"./node_modules/.pnpm/provinces@1.11.0/node_modules/provinces/index.js": (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = __webpack_require__(/*! ./provinces.json */ "./node_modules/.pnpm/provinces@1.11.0/node_modules/provinces/provinces.json");


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
"./node_modules/.pnpm/provinces@1.11.0/node_modules/provinces/provinces.json": (function (module) {
"use strict";
module.exports = JSON.parse('[{"short":"AL","name":"Alabama","country":"US"},{"short":"AK","name":"Alaska","country":"US"},{"short":"AZ","name":"Arizona","country":"US"},{"short":"AR","name":"Arkansas","country":"US"},{"short":"CA","name":"California","country":"US"},{"short":"CO","name":"Colorado","country":"US"},{"short":"CT","name":"Connecticut","country":"US"},{"short":"DC","name":"District of Columbia","alt":["Washington DC","Washington D.C."],"country":"US"},{"short":"DE","name":"Delaware","country":"US"},{"short":"FL","name":"Florida","country":"US"},{"short":"GA","name":"Georgia","country":"US"},{"short":"HI","name":"Hawaii","country":"US"},{"short":"ID","name":"Idaho","country":"US"},{"short":"IL","name":"Illinois","country":"US"},{"short":"IN","name":"Indiana","country":"US"},{"short":"IA","name":"Iowa","country":"US"},{"short":"KS","name":"Kansas","country":"US"},{"short":"KY","name":"Kentucky","country":"US"},{"short":"LA","name":"Louisiana","country":"US"},{"short":"ME","name":"Maine","country":"US"},{"short":"MD","name":"Maryland","country":"US"},{"short":"MA","name":"Massachusetts","country":"US"},{"short":"MI","name":"Michigan","country":"US"},{"short":"MN","name":"Minnesota","country":"US"},{"short":"MS","name":"Mississippi","country":"US"},{"short":"MO","name":"Missouri","country":"US"},{"short":"MT","name":"Montana","country":"US"},{"short":"NE","name":"Nebraska","country":"US"},{"short":"NV","name":"Nevada","country":"US"},{"short":"NH","name":"New Hampshire","country":"US"},{"short":"NJ","name":"New Jersey","country":"US"},{"short":"NM","name":"New Mexico","country":"US"},{"short":"NY","name":"New York","country":"US"},{"short":"NC","name":"North Carolina","country":"US"},{"short":"ND","name":"North Dakota","country":"US"},{"short":"OH","name":"Ohio","country":"US"},{"short":"OK","name":"Oklahoma","country":"US"},{"short":"OR","name":"Oregon","country":"US"},{"short":"PA","name":"Pennsylvania","country":"US"},{"short":"RI","name":"Rhode Island","country":"US"},{"short":"SC","name":"South Carolina","country":"US"},{"short":"SD","name":"South Dakota","country":"US"},{"short":"TN","name":"Tennessee","country":"US"},{"short":"TX","name":"Texas","country":"US"},{"short":"UT","name":"Utah","country":"US"},{"short":"VT","name":"Vermont","country":"US"},{"short":"VA","name":"Virginia","country":"US"},{"short":"WA","name":"Washington","country":"US"},{"short":"WV","name":"West Virginia","country":"US"},{"short":"WI","name":"Wisconsin","country":"US"},{"short":"WY","name":"Wyoming","country":"US"},{"short":"AS","name":"American Samoa","country":"US"},{"short":"GU","name":"Guam","country":"US"},{"short":"MP","name":"Northern Mariana Islands","country":"US"},{"short":"PR","name":"Puerto Rico","country":"US"},{"short":"UM","name":"United States Minor Outlying Islands","country":"US"},{"short":"VI","name":"Virgin Islands","country":"US"},{"short":"AB","name":"Alberta","country":"CA"},{"short":"BC","name":"British Columbia","country":"CA"},{"short":"MB","name":"Manitoba","country":"CA"},{"short":"NB","name":"New Brunswick","country":"CA"},{"short":"NL","name":"Newfoundland and Labrador","country":"CA","alt":["Newfoundland","Labrador"]},{"short":"NS","name":"Nova Scotia","country":"CA"},{"short":"NU","name":"Nunavut","country":"CA"},{"short":"NT","name":"Northwest Territories","country":"CA"},{"short":"ON","name":"Ontario","country":"CA"},{"short":"PE","name":"Prince Edward Island","country":"CA"},{"short":"QC","name":"Quebec","country":"CA"},{"short":"SK","name":"Saskatchewan","country":"CA"},{"short":"YT","name":"Yukon","country":"CA"},{"name":"Ashmore and Cartier Islands","country":"AU"},{"name":"Australian Antarctic Territory","country":"AU"},{"short":"ACT","name":"Australian Capital Territory","country":"AU"},{"short":"CX","name":"Christmas Island","country":"AU"},{"short":"CC","name":"Cocos Islands","alt":["Keeling Islands"],"country":"AU"},{"name":"Coral Sea Islands","country":"AU"},{"short":"HM","name":"Heard Island and McDonald Islands","country":"AU"},{"short":"JBT","name":"Jervis Bay Territory","country":"AU"},{"short":"NSW","name":"New South Wales","country":"AU"},{"short":"NF","name":"Norfolk Island","country":"AU"},{"short":"NT","name":"Northern Territory","country":"AU"},{"short":"QLD","name":"Queensland","country":"AU"},{"short":"SA","name":"South Australia","country":"AU"},{"short":"TAS","name":"Tasmania","country":"AU"},{"short":"VIC","name":"Victoria","country":"AU"},{"short":"WA","name":"Western Australia","country":"AU"},{"name":"Aguascalientes","short":"AG","alt":["AGS"],"country":"MX"},{"name":"Baja California","short":"BC","alt":["BCN"],"country":"MX"},{"name":"Baja California Sur","short":"BS","alt":["BCS"],"country":"MX"},{"name":"Campeche","short":"CM","alt":["Camp","CAM"],"country":"MX"},{"name":"Chiapas","short":"CS","alt":["Chis","CHP"],"country":"MX"},{"name":"Chihuahua","short":"CH","alt":["Chih","CHH"],"country":"MX"},{"name":"Coahuila","short":"MX","alt":["Coah","COA"],"country":"MX"},{"name":"Colima","short":"CL","alt":["COL"],"country":"MX"},{"name":"Federal District","short":"DF","alt":["DIF"],"country":"MX"},{"name":"Durango","short":"DG","alt":["Dgo","DUR"],"country":"MX"},{"name":"Guanajuato","short":"GT","alt":["Gto","GUA"],"country":"MX"},{"name":"Guerrero","short":"GR","alt":["Gro","GRO"],"country":"MX"},{"name":"Hidalgo","short":"HG","alt":["Hgo","HID"],"country":"MX"},{"name":"Jalisco","short":"JA","alt":["Jal","JAL"],"country":"MX"},{"name":"Mexico","short":"ME","alt":["Edomex","MEX"],"country":"MX"},{"name":"Michoacán","short":"MI","alt":["Mich","MIC"],"country":"MX"},{"name":"Morelos","short":"MO","alt":["Mor","MOR"],"country":"MX"},{"name":"Nayarit","short":"NA","alt":["Nay","NAY"],"country":"MX"},{"name":"Nuevo León","short":"NL","alt":["NLE"],"country":"MX"},{"name":"Oaxaca","short":"OA","alt":["Oax","OAX"],"country":"MX"},{"name":"Puebla","short":"PU","alt":["Pue","PUE"],"country":"MX"},{"name":"Querétaro","short":"QE","alt":["Qro","QUE"],"country":"MX"},{"name":"Quintana Roo","short":"QR","alt":["Q Roo","ROO"],"country":"MX"},{"name":"San Luis Potosí","short":"SL","alt":["SLP"],"country":"MX"},{"name":"Sinaloa","short":"SI","alt":["SIN"],"country":"MX"},{"name":"Sonora","short":"SO","alt":["SON"],"country":"MX"},{"name":"Tabasco","short":"TB","alt":["TAB"],"country":"MX"},{"name":"Tamaulipas","short":"TM","alt":["Tamps","TAM"],"country":"MX"},{"name":"Tlaxcala","short":"TL","alt":["Tlax","TLA"],"country":"MX"},{"name":"Veracruz","short":"VE","alt":["VER"],"country":"MX"},{"name":"Yucatán","short":"YU","alt":["YUC"],"country":"MX"},{"name":"Zacatecas","short":"ZA","alt":["ZAC"],"country":"MX"},{"name":"重庆","short":"渝","english":"Chongqing","country":"CN"},{"name":"黑龙江","short":"黑","english":"Heilongjiang","country":"CN"},{"name":"吉林","short":"吉","english":"Jilin","country":"CN"},{"name":"海南","short":"琼","english":"Hainan","country":"CN"},{"name":"北京","short":"京","english":"Beijing","country":"CN"},{"name":"辽宁","short":"辽","english":"Liaoning","country":"CN"},{"name":"内蒙古","short":"蒙","english":"Inner Mongolia","alt":["Nei Menggu"],"country":"CN"},{"name":"西藏","short":"藏","english":"Xizang","alt":["Tibet"],"country":"CN"},{"name":"青海","short":"青","english":"Qinghai","country":"CN"},{"name":"宁夏","short":"宁","english":"Ningxia","country":"CN"},{"name":"新疆","short":"新","english":"Xinjiang","alt":["Uygur"],"country":"CN"},{"name":"甘肃","short":"甘","english":"Gansu","country":"CN"},{"name":"河北","short":"冀","english":"Hebei","country":"CN"},{"name":"河南","short":"豫","english":"Henan","country":"CN"},{"name":"湖北","short":"鄂","english":"Hubei","country":"CN"},{"name":"湖南","short":"湘","english":"Hunan","country":"CN"},{"name":"山东","short":"鲁","english":"Shandong","country":"CN"},{"name":"江苏","short":"苏","english":"Jiangsu","country":"CN"},{"name":"安徽","short":"皖","english":"Anhui","country":"CN"},{"name":"山西","short":"晋","english":"Shanxi","country":"CN"},{"name":"陕西","short":"陕","english":"Shaanxi","country":"CN"},{"name":"四川","short":"川","english":"sichuan","country":"CN"},{"name":"云南","short":"滇","english":"Yunnan","country":"CN"},{"name":"贵州","short":"黔","english":"Guizhou","country":"CN"},{"name":"浙江","short":"浙","english":"Zhejiang","country":"CN"},{"name":"福建","short":"闽","english":"Fujian","country":"CN"},{"name":"广西","short":"桂","english":"Guangxi","country":"CN"},{"name":"上海","short":"沪","english":"Shanghai","country":"CN"},{"name":"天津","short":"津","english":"Tianjin","country":"CN"},{"name":"香港","short":"港","english":"Hongkong","alt":["Hong Kong"],"country":"CN"},{"name":"澳门","short":"澳","english":"Macau","alt":["Macao"],"country":"CN"},{"name":"台湾","short":"台","english":"Taiwan","country":"CN"},{"name":"江西","short":"赣","english":"Jiangxi","country":"CN"},{"name":"广东","short":"粤","english":"Guangdong","country":"CN"},{"name":"Avon","country":"GB","region":"England"},{"name":"Bedfordshire","country":"GB","region":"England"},{"name":"Berkshire","country":"GB","region":"England"},{"name":"Borders","country":"GB","region":"England"},{"name":"Bristol","country":"GB","region":"England"},{"name":"Buckinghamshire","country":"GB","region":"England"},{"name":"Cambridgeshire","country":"GB","region":"England"},{"name":"Channel Islands","country":"GB","region":"England"},{"name":"Cheshire","country":"GB","region":"England"},{"name":"Cleveland","country":"GB","region":"England"},{"name":"Cornwall","country":"GB","region":"England"},{"name":"Cumbria","country":"GB","region":"England"},{"name":"Derbyshire","country":"GB","region":"England"},{"name":"Devon","country":"GB","region":"England"},{"name":"Dorset","country":"GB","region":"England"},{"name":"Durham","country":"GB","region":"England"},{"name":"East Riding of Yorkshire","country":"GB","region":"England"},{"name":"East Sussex","country":"GB","region":"England"},{"name":"Essex","country":"GB","region":"England"},{"name":"Gloucestershire","country":"GB","region":"England"},{"name":"Greater Manchester","country":"GB","region":"England"},{"name":"Hampshire","country":"GB","region":"England"},{"name":"Herefordshire","country":"GB","region":"England"},{"name":"Hertfordshire","country":"GB","region":"England"},{"name":"Humberside","country":"GB","region":"England"},{"name":"Isle of Man","country":"GB","region":"England"},{"name":"Isle of Wight","country":"GB","region":"England"},{"name":"Isles of Scilly","country":"GB","region":"England"},{"name":"Kent","country":"GB","region":"England"},{"name":"Lancashire","country":"GB","region":"England"},{"name":"Leicestershire","country":"GB","region":"England"},{"name":"Lincolnshire","country":"GB","region":"England"},{"name":"London","country":"GB","region":"England"},{"name":"Merseyside","country":"GB","region":"England"},{"name":"Middlesex","country":"GB","region":"England"},{"name":"Norfolk","country":"GB","region":"England"},{"name":"North Yorkshire","country":"GB","region":"England"},{"name":"Northamptonshire","country":"GB","region":"England"},{"name":"Northumberland","country":"GB","region":"England"},{"name":"Nottinghamshire","country":"GB","region":"England"},{"name":"Oxfordshire","country":"GB","region":"England"},{"name":"Rutland","country":"GB","region":"England"},{"name":"Shropshire","country":"GB","region":"England"},{"name":"Somerset","country":"GB","region":"England"},{"name":"South Yorkshire","country":"GB","region":"England"},{"name":"Staffordshire","country":"GB","region":"England"},{"name":"Suffolk","country":"GB","region":"England"},{"name":"Surrey","country":"GB","region":"England"},{"name":"Tyne and Wear","country":"GB","region":"England"},{"name":"Warwickshire","country":"GB","region":"England"},{"name":"West Midlands","country":"GB","region":"England"},{"name":"West Sussex","country":"GB","region":"England"},{"name":"West Yorkshire","country":"GB","region":"England"},{"name":"Wiltshire","country":"GB","region":"England"},{"name":"Worcestershire","country":"GB","region":"England"},{"name":"Antrim","country":"GB","region":"Northern Ireland"},{"name":"Down","country":"GB","region":"Northern Ireland"},{"name":"Fermanagh","country":"GB","region":"Northern Ireland"},{"name":"Londonderry","country":"GB","region":"Northern Ireland"},{"name":"Tyrone","country":"GB","region":"Northern Ireland"},{"name":"Aberdeen City","country":"GB","region":"Scotland"},{"name":"Aberdeenshire","country":"GB","region":"Scotland"},{"name":"Angus","country":"GB","region":"Scotland"},{"name":"Argyll and Bute","country":"GB","region":"Scotland"},{"name":"Armagh","country":"GB","region":"Scotland"},{"name":"Carmarthenshire","country":"GB","region":"Scotland"},{"name":"Clackmannan","country":"GB","region":"Scotland"},{"name":"Dumfries and Galloway","country":"GB","region":"Scotland"},{"name":"East Ayrshire","country":"GB","region":"Scotland"},{"name":"East Dunbartonshire","country":"GB","region":"Scotland"},{"name":"East Lothian","country":"GB","region":"Scotland"},{"name":"East Renfrewshire","country":"GB","region":"Scotland"},{"name":"Edinburgh City","country":"GB","region":"Scotland"},{"name":"Falkirk","country":"GB","region":"Scotland"},{"name":"Fife","country":"GB","region":"Scotland"},{"name":"Glasgow","country":"GB","region":"Scotland"},{"name":"Highland","country":"GB","region":"Scotland"},{"name":"Inverclyde","country":"GB","region":"Scotland"},{"name":"Midlothian","country":"GB","region":"Scotland"},{"name":"Moray","country":"GB","region":"Scotland"},{"name":"North Ayrshire","country":"GB","region":"Scotland"},{"name":"North Lanarkshire","country":"GB","region":"Scotland"},{"name":"Orkney","country":"GB","region":"Scotland"},{"name":"Perthshire and Kinross","country":"GB","region":"Scotland"},{"name":"Renfrewshire","country":"GB","region":"Scotland"},{"name":"Roxburghshire","country":"GB","region":"Scotland"},{"name":"Shetland","country":"GB","region":"Scotland"},{"name":"South Ayrshire","country":"GB","region":"Scotland"},{"name":"South Lanarkshire","country":"GB","region":"Scotland"},{"name":"Stirling","country":"GB","region":"Scotland"},{"name":"West Dunbartonshire","country":"GB","region":"Scotland"},{"name":"West Lothian","country":"GB","region":"Scotland"},{"name":"Western Isles","country":"GB","region":"Scotland"},{"name":"Blaenau Gwent","country":"GB","region":"Wales"},{"name":"Bridgend","country":"GB","region":"Wales"},{"name":"Caerphilly","country":"GB","region":"Wales"},{"name":"Cardiff","country":"GB","region":"Wales"},{"name":"Ceredigion","country":"GB","region":"Wales"},{"name":"Conwy","country":"GB","region":"Wales"},{"name":"Denbighshire","country":"GB","region":"Wales"},{"name":"Flintshire","country":"GB","region":"Wales"},{"name":"Gwynedd","country":"GB","region":"Wales"},{"name":"Isle of Anglesey","country":"GB","region":"Wales"},{"name":"Merthyr Tydfil","country":"GB","region":"Wales"},{"name":"Monmouthshire","country":"GB","region":"Wales"},{"name":"Neath Port Talbot","country":"GB","region":"Wales"},{"name":"Newport","country":"GB","region":"Wales"},{"name":"Pembrokeshire","country":"GB","region":"Wales"},{"name":"Powys","country":"GB","region":"Wales"},{"name":"Rhondda Cynon Taff","country":"GB","region":"Wales"},{"name":"Swansea","country":"GB","region":"Wales"},{"name":"The Vale of Glamorgan","country":"GB","region":"Wales"},{"name":"Torfaen","country":"GB","region":"Wales"},{"name":"Wrexham","country":"GB","region":"Wales"},{"short":"BW","name":"Baden-Württemberg","country":"DE"},{"short":"BY","name":"Bayern","country":"DE"},{"short":"BE","name":"Berlin","country":"DE"},{"short":"BB","name":"Brandenburg","country":"DE"},{"short":"HB","name":"Bremen","country":"DE"},{"short":"HH","name":"Hamburg","country":"DE"},{"short":"HE","name":"Hessen","country":"DE"},{"short":"MV","name":"Mecklenburg-Vorpommern","country":"DE"},{"short":"NI","name":"Niedersachsen","country":"DE"},{"short":"NW","name":"Nordrhein-Westfalen","country":"DE"},{"short":"RP","name":"Rheinland-Pfalz","country":"DE"},{"short":"SL","name":"Saarland","country":"DE"},{"short":"SN","name":"Sachsen","country":"DE"},{"short":"ST","name":"Sachsen-Anhalt","country":"DE"},{"short":"SH","name":"Schleswig-Holstein","country":"DE"},{"short":"TH","name":"Thüringen","country":"DE"},{"short":"DR","name":"Drenthe","country":"NL"},{"short":"FL","name":"Flevoland","country":"NL"},{"short":"FR","name":"Friesland","country":"NL","alt":["Fryslân"]},{"short":"GD","name":"Gelderland","country":"NL"},{"short":"GR","name":"Groningen","country":"NL"},{"short":"LB","name":"Limburg","country":"NL"},{"short":"NB","name":"Noord-Brabant","country":"NL"},{"short":"NH","name":"Noord-Holland","country":"NL"},{"short":"OV","name":"Overijssel","country":"NL"},{"short":"UT","name":"Utrecht","country":"NL"},{"short":"ZH","name":"Zuid-Holland","country":"NL"},{"short":"ZL","name":"Zeeland","country":"NL"},{"short":"ANT","name":"Antwerpen","country":"BE"},{"short":"HAI","name":"Henegouwen","country":"BE","alt":["Hainaut"]},{"short":"LIE","name":"Luik","country":"BE","alt":["Liège"]},{"short":"LIM","name":"Limburg","country":"BE"},{"short":"LUX","name":"Luxemburg","country":"BE"},{"short":"NAM","name":"Namen","country":"BE"},{"short":"OVL","name":"Oost-Vlaanderen","country":"BE"},{"short":"VBR","name":"Vlaams-Brabant","country":"BE"},{"short":"WBR","name":"Waals-Brabant","country":"BE"},{"short":"WVL","name":"West-Vlaanderen","country":"BE"},{"name":"Hovedstaden","country":"DK"},{"name":"Midtjylland","country":"DK"},{"name":"Nordjylland","country":"DK"},{"name":"Sjælland","country":"DK"},{"name":"Syddanmark","country":"DK"},{"name":"Adana","country":"TR"},{"name":"Adıyaman","country":"TR"},{"name":"Afyonkarahisar","country":"TR"},{"name":"Ağrı","country":"TR"},{"name":"Amasya","country":"TR"},{"name":"Ankara","country":"TR"},{"name":"Antalya","country":"TR"},{"name":"Artvin","country":"TR"},{"name":"Aydın","country":"TR"},{"name":"Balıkesir","country":"TR"},{"name":"Bilecik","country":"TR"},{"name":"Bingöl","country":"TR"},{"name":"Bitlis","country":"TR"},{"name":"Bolu","country":"TR"},{"name":"Burdur","country":"TR"},{"name":"Bursa","country":"TR"},{"name":"Çanakkale","country":"TR"},{"name":"Çankırı","country":"TR"},{"name":"Çorum","country":"TR"},{"name":"Denizli","country":"TR"},{"name":"Diyarbakır","country":"TR"},{"name":"Edirne","country":"TR"},{"name":"Elazığ","country":"TR"},{"name":"Erzincan","country":"TR"},{"name":"Erzurum","country":"TR"},{"name":"Eskişehir","country":"TR"},{"name":"Gaziantep","country":"TR"},{"name":"Giresun","country":"TR"},{"name":"Gümüşhane","country":"TR"},{"name":"Hakkâri","country":"TR"},{"name":"Hatay","country":"TR"},{"name":"Isparta","country":"TR"},{"name":"Mersin","country":"TR"},{"name":"Istanbul","country":"TR"},{"name":"İzmir","country":"TR"},{"name":"Kars","country":"TR"},{"name":"Kastamonu","country":"TR"},{"name":"Kayseri","country":"TR"},{"name":"Kırklareli","country":"TR"},{"name":"Kırşehir","country":"TR"},{"name":"Kocaeli","country":"TR"},{"name":"Konya","country":"TR"},{"name":"Kütahya","country":"TR"},{"name":"Malatya","country":"TR"},{"name":"Manisa","country":"TR"},{"name":"Kahramanmaraş","country":"TR"},{"name":"Mardin","country":"TR"},{"name":"Muğla","country":"TR"},{"name":"Muş","country":"TR"},{"name":"Nevşehir","country":"TR"},{"name":"Niğde","country":"TR"},{"name":"Ordu","country":"TR"},{"name":"Rize","country":"TR"},{"name":"Sakarya","country":"TR"},{"name":"Samsun","country":"TR"},{"name":"Siirt","country":"TR"},{"name":"Sinop","country":"TR"},{"name":"Sivas","country":"TR"},{"name":"Tekirdağ","country":"TR"},{"name":"Tokat","country":"TR"},{"name":"Trabzon","country":"TR"},{"name":"Tunceli","country":"TR"},{"name":"Şanlıurfa","country":"TR"},{"name":"Uşak","country":"TR"},{"name":"Van","country":"TR"},{"name":"Yozgat","country":"TR"},{"name":"Zonguldak","country":"TR"},{"name":"Aksaray","country":"TR"},{"name":"Bayburt","country":"TR"},{"name":"Karaman","country":"TR"},{"name":"Kırıkkale","country":"TR"},{"name":"Batman","country":"TR"},{"name":"Şırnak","country":"TR"},{"name":"Bartın","country":"TR"},{"name":"Ardahan","country":"TR"},{"name":"Iğdır","country":"TR"},{"name":"Yalova","country":"TR"},{"name":"Karabük","country":"TR"},{"name":"Kilis","country":"TR"},{"name":"Osmaniye","country":"TR"},{"name":"Düzce","country":"TR"},{"short":"ID-AC","name":"Special Region of Aceh","country":"ID"},{"short":"ID-BA","name":"Bali","country":"ID"},{"short":"ID-BB","name":"Bangka–Belitung Islands","country":"ID"},{"short":"ID-BT","name":"Banten","country":"ID"},{"short":"ID-BE","name":"Bengkulu","country":"ID"},{"short":"ID-JT","name":"Central Java","country":"ID"},{"short":"ID-KT","name":"Central Kalimantan","country":"ID"},{"short":"ID-ST","name":"Central Sulawesi","country":"ID"},{"short":"ID-JI","name":"East Java","country":"ID"},{"short":"ID-KI","name":"East Kalimantan","country":"ID"},{"short":"ID-NT","name":"East Nusa Tenggara","country":"ID"},{"short":"ID-GO","name":"Gorontalo","country":"ID"},{"short":"ID-JK","name":"Jakarta Special Capital Region","country":"ID"},{"short":"ID-JA","name":"Jambi","country":"ID"},{"short":"ID-LA","name":"Lampung","country":"ID"},{"short":"ID-MA","name":"Maluku","country":"ID"},{"short":"ID-KU","name":"North Kalimantan","country":"ID"},{"short":"ID-MU","name":"North Maluku","country":"ID"},{"short":"ID-SA","name":"North Sulawesi","country":"ID"},{"short":"ID-SU","name":"North Sumatra","country":"ID"},{"short":"ID-PA","name":"Special Region of Papua","country":"ID"},{"short":"ID-RI","name":"Riau","country":"ID"},{"short":"ID-KR","name":"Riau Islands","country":"ID"},{"short":"ID-SG","name":"Southeast Sulawesi","country":"ID"},{"short":"ID-KS","name":"South Kalimantan","country":"ID"},{"short":"ID-SN","name":"South Sulawesi","country":"ID"},{"short":"ID-SS","name":"South Sumatra","country":"ID"},{"short":"ID-JB","name":"West Java","country":"ID"},{"short":"ID-KB","name":"West Kalimantan","country":"ID"},{"short":"ID-NB","name":"West Nusa Tenggara","country":"ID"},{"short":"ID-PB","name":"Special Region of West Papua","country":"ID"},{"short":"ID-SR","name":"West Sulawesi","country":"ID"},{"short":"ID-SB","name":"West Sumatra","country":"ID"},{"short":"ID-YO","name":"Special Region of Yogyakarta","country":"ID"},{"name":"Irbid","country":"JO"},{"name":"Ajloun","country":"JO"},{"name":"Jerash","country":"JO"},{"name":"Mafraq","country":"JO"},{"name":"Balqa","country":"JO"},{"name":"Amman","country":"JO"},{"name":"Zarqa","country":"JO"},{"name":"Madaba","country":"JO"},{"name":"Karak","country":"JO"},{"name":"Tafilah","country":"JO"},{"name":"Ma\'an","country":"JO"},{"name":"Aqaba","country":"JO"},{"short":"AP","name":"Andhra Pradesh","country":"IN"},{"short":"AR","name":"Arunachal Pradesh","country":"IN"},{"short":"AS","name":"Assam","country":"IN"},{"short":"BR","name":"Bihar","country":"IN"},{"short":"CT","name":"Chhattisgarh","country":"IN"},{"short":"GA","name":"Goa","country":"IN"},{"short":"GJ","name":"Gujarat","country":"IN"},{"short":"HR","name":"Haryana","country":"IN"},{"short":"HP","name":"Himachal Pradesh","country":"IN"},{"short":"JK","name":"Jammu and Kashmir","country":"IN"},{"short":"JH","name":"Jharkhand","country":"IN"},{"short":"KA","name":"Karnataka","country":"IN"},{"short":"KL","name":"Kerala","country":"IN"},{"short":"MP","name":"Madhya Pradesh","country":"IN"},{"short":"MH","name":"Maharashtra","country":"IN"},{"short":"MN","name":"Manipur","country":"IN"},{"short":"ML","name":"Meghalaya","country":"IN"},{"short":"MZ","name":"Mizoram","country":"IN"},{"short":"NL","name":"Nagaland","country":"IN"},{"short":"OR","name":"Odisha","country":"IN"},{"short":"PB","name":"Punjab","country":"IN"},{"short":"RJ","name":"Rajasthan","country":"IN"},{"short":"SK","name":"Sikkim","country":"IN"},{"short":"TN","name":"Tamil Nadu","country":"IN"},{"short":"TG","name":"Telangana","country":"IN"},{"short":"TR","name":"Tripura","country":"IN"},{"short":"UP","name":"Uttar Pradesh","country":"IN"},{"short":"UT","name":"Uttarakhand","country":"IN"},{"short":"WB","name":"West Bengal","country":"IN"},{"short":"AN","name":"Andaman and Nicobar Islands","country":"IN"},{"short":"CH","name":"Chandigarh","country":"IN"},{"short":"DN","name":"Dadra and Nagar Haveli","country":"IN"},{"short":"DD","name":"Daman and Diu","country":"IN"},{"short":"LD","name":"Lakshadweep","country":"IN"},{"short":"DL","name":"National Capital Territory of Delhi","country":"IN"},{"short":"PY","name":"Puducherry","country":"IN"},{"name":"ភ្នំពេញ","english":"Phnom Penh Municipality","country":"KH"},{"name":"បន្ទាយមានជ័យ","english":"Banteay Meanchey","country":"KH"},{"name":"បាត់ដំបង","english":"Battambang","country":"KH"},{"name":"កំពង់ចាម","english":"Kampong Cham","country":"KH"},{"name":"កំពង់ឆ្នាំង","english":"Kampong Chhnang","country":"KH"},{"name":"កំពង់ស្ពឺ","english":"Kampong Speu","country":"KH"},{"name":"កំពង់ធំ","english":"Kampong Thom","country":"KH"},{"name":"កំពត","english":"Kampot","country":"KH"},{"name":"កណ្តាល","english":"Kandal","country":"KH"},{"name":"កោះកុង","english":"Koh Kong","country":"KH"},{"name":"កែប","english":"Kep","country":"KH"},{"name":"ក្រចេះ","english":"Kratié","country":"KH"},{"name":"មណ្ឌលគីរី","english":"Mondulkiri","country":"KH"},{"name":"ឧត្តរមានជ័យ","english":"Oddar Meanchey","country":"KH"},{"name":"បៃលិន","english":"Pailin","country":"KH"},{"name":"ព្រះសីហនុ","english":"Preah Sihanouk","country":"KH"},{"name":"ព្រះវិហារ","english":"Preah Vihear","country":"KH"},{"name":"ពោធិ៍សាត់","english":"Pursat","country":"KH"},{"name":"ព្រៃវែង","english":"Prey Veng","country":"KH"},{"name":"រតនគីរី","english":"Ratanakiri","country":"KH"},{"name":"សៀមរាប","english":"Siem Reap","country":"KH"},{"name":"ស្ទឹងត្រែង","english":"Stung Treng","country":"KH"},{"name":"ស្វាយរៀង","english":"Svay Rieng","country":"KH"},{"name":"តាកែវ","english":"Takéo","country":"KH"},{"name":"ត្បូងឃ្មុំ","english":"Tbong Khmum","country":"KH"},{"name":"Addis Ababa","country":"ET"},{"name":"Afar Region","country":"ET"},{"name":"Amhara Region","country":"ET"},{"name":"Benishangul-Gumuz","country":"ET"},{"name":"Dire Dawa","country":"ET"},{"name":"Gambela","country":"ET"},{"name":"Harari","country":"ET"},{"name":"Oromia","country":"ET"},{"name":"Somali","country":"ET"},{"name":"Southern Nations, Nationalities, and Peoples\' Region","country":"ET"},{"name":"Tigray Region","country":"ET"},{"name":"Chachapoyas","region":"Amazonas","country":"PE"},{"name":"Bagua","region":"Amazonas","country":"PE"},{"name":"Bongará","region":"Amazonas","country":"PE"},{"name":"Condorcanqui","region":"Amazonas","country":"PE"},{"name":"Luya","region":"Amazonas","country":"PE"},{"name":"Rodríguez de Mendoza","region":"Amazonas","country":"PE"},{"name":"Utcubamba","region":"Amazonas","country":"PE"},{"name":"Huaraz","region":"Ancash","country":"PE"},{"name":"Aija","region":"Ancash","country":"PE"},{"name":"Antonio Raymondi","region":"Ancash","country":"PE"},{"name":"Asunción","region":"Ancash","country":"PE"},{"name":"Bolognesi","region":"Ancash","country":"PE"},{"name":"Carhuaz","region":"Ancash","country":"PE"},{"name":"Carlos Fermín Fitzcarrald","region":"Ancash","country":"PE"},{"name":"Casma","region":"Ancash","country":"PE"},{"name":"Corongo","region":"Ancash","country":"PE"},{"name":"Huari","region":"Ancash","country":"PE"},{"name":"Huarmey","region":"Ancash","country":"PE"},{"name":"Huaylas","region":"Ancash","country":"PE"},{"name":"Mariscal Luzuriaga","region":"Ancash","country":"PE"},{"name":"Ocros","region":"Ancash","country":"PE"},{"name":"Pallasca","region":"Ancash","country":"PE"},{"name":"Pomabamba","region":"Ancash","country":"PE"},{"name":"Recuay","region":"Ancash","country":"PE"},{"name":"Santa","region":"Ancash","country":"PE"},{"name":"Sihuas","region":"Ancash","country":"PE"},{"name":"Yungay","region":"Ancash","country":"PE"},{"name":"Abancay","region":"Apurímac","country":"PE"},{"name":"Andahuaylas","region":"Apurímac","country":"PE"},{"name":"Antabamba","region":"Apurímac","country":"PE"},{"name":"Aymaraes","region":"Apurímac","country":"PE"},{"name":"Cotabambas","region":"Apurímac","country":"PE"},{"name":"Chincheros","region":"Apurímac","country":"PE"},{"name":"Grau","region":"Apurímac","country":"PE"},{"name":"Arequipa","region":"Arequipa","country":"PE"},{"name":"Camaná","region":"Arequipa","country":"PE"},{"name":"Caravelí","region":"Arequipa","country":"PE"},{"name":"Castilla","region":"Arequipa","country":"PE"},{"name":"Caylloma","region":"Arequipa","country":"PE"},{"name":"Condesuyos","region":"Arequipa","country":"PE"},{"name":"Islay","region":"Arequipa","country":"PE"},{"name":"La Unión","region":"Arequipa","country":"PE"},{"name":"Huamanga","region":"Ayacucho","country":"PE"},{"name":"Cangallo","region":"Ayacucho","country":"PE"},{"name":"Huanca Sancos","region":"Ayacucho","country":"PE"},{"name":"Huanta","region":"Ayacucho","country":"PE"},{"name":"La Mar","region":"Ayacucho","country":"PE"},{"name":"Lucanas","region":"Ayacucho","country":"PE"},{"name":"Parinacochas","region":"Ayacucho","country":"PE"},{"name":"Páucar del Sara Sara","region":"Ayacucho","country":"PE"},{"name":"Sucre","region":"Ayacucho","country":"PE"},{"name":"Víctor Fajardo","region":"Ayacucho","country":"PE"},{"name":"Vilcas Huamán","region":"Ayacucho","country":"PE"},{"name":"Cajamarca","region":"Cajamarca","country":"PE"},{"name":"Cajabamba","region":"Cajamarca","country":"PE"},{"name":"Celendín","region":"Cajamarca","country":"PE"},{"name":"Chota","region":"Cajamarca","country":"PE"},{"name":"Contumazá","region":"Cajamarca","country":"PE"},{"name":"Cutervo","region":"Cajamarca","country":"PE"},{"name":"Hualgayoc","region":"Cajamarca","country":"PE"},{"name":"Jaén","region":"Cajamarca","country":"PE"},{"name":"San Ignacio","region":"Cajamarca","country":"PE"},{"name":"San Marcos","region":"Cajamarca","country":"PE"},{"name":"San Miguel","region":"Cajamarca","country":"PE"},{"name":"San Pablo","region":"Cajamarca","country":"PE"},{"name":"Santa Cruz","region":"Cajamarca","country":"PE"},{"name":"Callao","region":"Callao","country":"PE"},{"name":"Cusco","region":"Cusco","country":"PE"},{"name":"Acomayo","region":"Cusco","country":"PE"},{"name":"Anta","region":"Cusco","country":"PE"},{"name":"Calca","region":"Cusco","country":"PE"},{"name":"Canas","region":"Cusco","country":"PE"},{"name":"Canchis","region":"Cusco","country":"PE"},{"name":"Chumbivilcas","region":"Cusco","country":"PE"},{"name":"Espinar","region":"Cusco","country":"PE"},{"name":"La Convención","region":"Cusco","country":"PE"},{"name":"Paruro","region":"Cusco","country":"PE"},{"name":"Paucartambo","region":"Cusco","country":"PE"},{"name":"Quispicanchi","region":"Cusco","country":"PE"},{"name":"Urubamba","region":"Cusco","country":"PE"},{"name":"Huancavelica","region":"Huancavelica","country":"PE"},{"name":"Acobamba","region":"Huancavelica","country":"PE"},{"name":"Angaraes","region":"Huancavelica","country":"PE"},{"name":"Castrovirreyna","region":"Huancavelica","country":"PE"},{"name":"Churcampa","region":"Huancavelica","country":"PE"},{"name":"Huaytará","region":"Huancavelica","country":"PE"},{"name":"Tayacaja","region":"Huancavelica","country":"PE"},{"name":"Huánuco","region":"Huánuco","country":"PE"},{"name":"Ambo","region":"Huánuco","country":"PE"},{"name":"Dos de Mayo","region":"Huánuco","country":"PE"},{"name":"Huacaybamba","region":"Huánuco","country":"PE"},{"name":"Huamalíes","region":"Huánuco","country":"PE"},{"name":"Leoncio Prado","region":"Huánuco","country":"PE"},{"name":"Marañón","region":"Huánuco","country":"PE"},{"name":"Pachitea","region":"Huánuco","country":"PE"},{"name":"Puerto Inca","region":"Huánuco","country":"PE"},{"name":"Lauricocha","region":"Huánuco","country":"PE"},{"name":"Yarowilca","region":"Huánuco","country":"PE"},{"name":"Ica","region":"Ica","country":"PE"},{"name":"Chincha","region":"Ica","country":"PE"},{"name":"Nazca","region":"Ica","country":"PE"},{"name":"Palpa","region":"Ica","country":"PE"},{"name":"Pisco","region":"Ica","country":"PE"},{"name":"Huancayo","region":"Junín","country":"PE"},{"name":"Concepción","region":"Junín","country":"PE"},{"name":"Chanchamayo","region":"Junín","country":"PE"},{"name":"Jauja","region":"Junín","country":"PE"},{"name":"Junín","region":"Junín","country":"PE"},{"name":"Satipo","region":"Junín","country":"PE"},{"name":"Tarma","region":"Junín","country":"PE"},{"name":"Yauli","region":"Junín","country":"PE"},{"name":"Chupaca","region":"Junín","country":"PE"},{"name":"Trujillo","region":"La Libertad","country":"PE"},{"name":"Ascope","region":"La Libertad","country":"PE"},{"name":"Bolívar","region":"La Libertad","country":"PE"},{"name":"Chepén","region":"La Libertad","country":"PE"},{"name":"Julcán","region":"La Libertad","country":"PE"},{"name":"Otuzco","region":"La Libertad","country":"PE"},{"name":"Pacasmayo","region":"La Libertad","country":"PE"},{"name":"Pataz","region":"La Libertad","country":"PE"},{"name":"Sánchez Carrión","region":"La Libertad","country":"PE"},{"name":"Santiago de Chuco","region":"La Libertad","country":"PE"},{"name":"Gran Chimú","region":"La Libertad","country":"PE"},{"name":"Virú","region":"La Libertad","country":"PE"},{"name":"Chiclayo","region":"Lambayeque","country":"PE"},{"name":"Ferreñafe","region":"Lambayeque","country":"PE"},{"name":"Lambayeque","region":"Lambayeque","country":"PE"},{"name":"Lima","region":"autonomous","country":"PE"},{"name":"Huaura","region":"Lima","country":"PE"},{"name":"Barranca","region":"Lima","country":"PE"},{"name":"Cajatambo","region":"Lima","country":"PE"},{"name":"Canta","region":"Lima","country":"PE"},{"name":"Cañete","region":"Lima","country":"PE"},{"name":"Huaral","region":"Lima","country":"PE"},{"name":"Huarochirí","region":"Lima","country":"PE"},{"name":"Oyón","region":"Lima","country":"PE"},{"name":"Yauyos","region":"Lima","country":"PE"},{"name":"Maynas","region":"Loreto","country":"PE"},{"name":"Alto Amazonas","region":"Loreto","country":"PE"},{"name":"Loreto","region":"Loreto","country":"PE"},{"name":"Mariscal Ramón Castilla","region":"Loreto","country":"PE"},{"name":"Putumayo","region":"Loreto","country":"PE"},{"name":"Requena","region":"Loreto","country":"PE"},{"name":"Ucayali","region":"Loreto","country":"PE"},{"name":"Datem del Marañón","region":"Loreto","country":"PE"},{"name":"Tambopata","region":"Madre de Dios","country":"PE"},{"name":"Manú","region":"Madre de Dios","country":"PE"},{"name":"Tahuamanu","region":"Madre de Dios","country":"PE"},{"name":"Mariscal Nieto","region":"Moquegua","country":"PE"},{"name":"General Sánchez Cerro","region":"Moquegua","country":"PE"},{"name":"Ilo","region":"Moquegua","country":"PE"},{"name":"Pasco","region":"Pasco","country":"PE"},{"name":"Daniel Alcídes Carrión","region":"Pasco","country":"PE"},{"name":"Oxapampa","region":"Pasco","country":"PE"},{"name":"Piura","region":"Piura","country":"PE"},{"name":"Ayabaca","region":"Piura","country":"PE"},{"name":"Huancabamba","region":"Piura","country":"PE"},{"name":"Morropón","region":"Piura","country":"PE"},{"name":"Paita","region":"Piura","country":"PE"},{"name":"Sullana","region":"Piura","country":"PE"},{"name":"Talara","region":"Piura","country":"PE"},{"name":"Sechura","region":"Piura","country":"PE"},{"name":"Puno","region":"Puno","country":"PE"},{"name":"Azángaro","region":"Puno","country":"PE"},{"name":"Carabaya","region":"Puno","country":"PE"},{"name":"Chucuito","region":"Puno","country":"PE"},{"name":"El Collao","region":"Puno","country":"PE"},{"name":"Huancané","region":"Puno","country":"PE"},{"name":"Lampa","region":"Puno","country":"PE"},{"name":"Melgar","region":"Puno","country":"PE"},{"name":"Moho","region":"Puno","country":"PE"},{"name":"San Antonio de Putina","region":"Puno","country":"PE"},{"name":"San Román","region":"Puno","country":"PE"},{"name":"Sandia","region":"Puno","country":"PE"},{"name":"Yunguyo","region":"Puno","country":"PE"},{"name":"Moyobamba","region":"San Martín","country":"PE"},{"name":"Bellavista","region":"San Martín","country":"PE"},{"name":"El Dorado","region":"San Martín","country":"PE"},{"name":"Huallaga","region":"San Martín","country":"PE"},{"name":"Lamas","region":"San Martín","country":"PE"},{"name":"Mariscal Cáceres","region":"San Martín","country":"PE"},{"name":"Picota","region":"San Martín","country":"PE"},{"name":"Rioja","region":"San Martín","country":"PE"},{"name":"San Martín","region":"San Martín","country":"PE"},{"name":"Tocache","region":"San Martín","country":"PE"},{"name":"Tacna","region":"Tacna","country":"PE"},{"name":"Candarave","region":"Tacna","country":"PE"},{"name":"Jorge Basadre","region":"Tacna","country":"PE"},{"name":"Tarata","region":"Tacna","country":"PE"},{"name":"Tumbes","region":"Tumbes","country":"PE"},{"name":"Contralmirante Villar","region":"Tumbes","country":"PE"},{"name":"Zarumilla","region":"Tumbes","country":"PE"},{"name":"Coronel Portillo","region":"Ucayali","country":"PE"},{"name":"Atalaya","region":"Ucayali","country":"PE"},{"name":"Padre Abad","region":"Ucayali","country":"PE"},{"name":"Purús","region":"Ucayali","country":"PE"},{"name":"Camagüey","country":"CU"},{"name":"Ciego de Ávila","country":"CU"},{"name":"Cienfuegos","country":"CU"},{"name":"Havana","country":"CU"},{"name":"Bayamo","country":"CU"},{"name":"Guantánamo","country":"CU"},{"name":"Holguín","country":"CU"},{"name":"Nueva Gerona","country":"CU"},{"name":"Artemisa","country":"CU"},{"name":"Las Tunas","country":"CU"},{"name":"Matanzas","country":"CU"},{"name":"San José de las Lajas","country":"CU"},{"name":"Pinar del Río","country":"CU"},{"name":"Sancti Spíritus","country":"CU"},{"name":"Santiago de Cuba","country":"CU"},{"name":"Santa Clara","country":"CU"},{"name":"Ciudad Autónoma de Buenos Aires","country":"AR"},{"name":"Buenos Aires","country":"AR"},{"name":"Catamarca","country":"AR"},{"name":"Chaco","country":"AR"},{"name":"Chubut","country":"AR"},{"name":"Córdoba","country":"AR"},{"name":"Corrientes","country":"AR"},{"name":"Entre Ríos","country":"AR"},{"name":"Formosa","country":"AR"},{"name":"Jujuy","country":"AR"},{"name":"La Pampa","country":"AR"},{"name":"La Rioja","country":"AR"},{"name":"Mendoza","country":"AR"},{"name":"Misiones","country":"AR"},{"name":"Neuquén","country":"AR"},{"name":"Río Negro","country":"AR"},{"name":"Salta","country":"AR"},{"name":"San Juan","country":"AR"},{"name":"San Luis","country":"AR"},{"name":"Santa Cruz","country":"AR"},{"name":"Santa Fe","country":"AR"},{"name":"Santiago del Estero","country":"AR"},{"name":"Tierra del Fuego, Antártida e Islas del Atlántico Sur","country":"AR"},{"name":"Tucumán","country":"AR"},{"name":"Arica","region":"XV Arica and Parinacota","country":"CL"},{"name":"Parinacota","region":"XV Arica and Parinacota","country":"CL"},{"name":"Iquique","region":"I Tarapacá","country":"CL"},{"name":"Tamarugal","region":"I Tarapacá","country":"CL"},{"name":"Antofagasta","region":"II Antofagasta","country":"CL"},{"name":"El Loa","region":"II Antofagasta","country":"CL"},{"name":"Tocopilla","region":"II Antofagasta","country":"CL"},{"name":"Copiapó","region":"III Atacama","country":"CL"},{"name":"Huasco","region":"III Atacama","country":"CL"},{"name":"Chañaral","region":"III Atacama","country":"CL"},{"name":"Elqui","region":"IV Coquimbo","country":"CL"},{"name":"Limarí","region":"IV Coquimbo","country":"CL"},{"name":"Choapa","region":"IV Coquimbo","country":"CL"},{"name":"Isla de Pascua","region":"V Valparaíso","country":"CL"},{"name":"Los Andes","region":"V Valparaíso","country":"CL"},{"name":"Marga Marga","region":"V Valparaíso","country":"CL"},{"name":"Petorca","region":"V Valparaíso","country":"CL"},{"name":"Quillota","region":"V Valparaíso","country":"CL"},{"name":"San Antonio","region":"V Valparaíso","country":"CL"},{"name":"San Felipe de Aconcagua","region":"V Valparaíso","country":"CL"},{"name":"Valparaíso","region":"V Valparaíso","country":"CL"},{"name":"Cachapoal","region":"VI O\'Higgins","country":"CL"},{"name":"Colchagua","region":"VI O\'Higgins","country":"CL"},{"name":"Cardenal Caro","region":"VI O\'Higgins","country":"CL"},{"name":"Talca","region":"VII Maule","country":"CL"},{"name":"Linares","region":"VII Maule","country":"CL"},{"name":"Curicó","region":"VII Maule","country":"CL"},{"name":"Cauquenes","region":"VII Maule","country":"CL"},{"name":"Concepción","region":"VIII Biobío","country":"CL"},{"name":"Ñuble","region":"VIII Biobío","country":"CL"},{"name":"Biobío","region":"VIII Biobío","country":"CL"},{"name":"Arauco","region":"VIII Biobío","country":"CL"},{"name":"Cautin","region":"IX Araucanía","country":"CL"},{"name":"Malleco","region":"IX Araucanía","country":"CL"},{"name":"Valdivia","region":"XIV Los Ríos","country":"CL"},{"name":"Ranco","region":"XIV Los Ríos","country":"CL"},{"name":"Llanquihue","region":"X Los Lagos","country":"CL"},{"name":"Osorno","region":"X Los Lagos","country":"CL"},{"name":"Chiloe","region":"X Los Lagos","country":"CL"},{"name":"Palena","region":"X Los Lagos","country":"CL"},{"name":"Coihaique","region":"XI Aisén","country":"CL"},{"name":"Aisén","region":"XI Aisén","country":"CL"},{"name":"General Carrera","region":"XI Aisén","country":"CL"},{"name":"Capitan Prat","region":"XI Aisén","country":"CL"},{"name":"Magallanes","region":"XII Magallanes","country":"CL"},{"name":"Ultima Esperanza","region":"XII Magallanes","country":"CL"},{"name":"Tierra del Fuego","region":"XII Magallanes","country":"CL"},{"name":"Antártica Chilena","region":"XII Magallanes","country":"CL"},{"name":"Santiago","region":"RM Santiago Metropolitan","country":"CL"},{"name":"Cordillera","region":"RM Santiago Metropolitan","country":"CL"},{"name":"Maipo","region":"RM Santiago Metropolitan","country":"CL"},{"name":"Talagante","region":"RM Santiago Metropolitan","country":"CL"},{"name":"Melipilla","region":"RM Santiago Metropolitan","country":"CL"},{"name":"Chacabuco","region":"RM Santiago Metropolitan","country":"CL"},{"name":"Cercado","region":"Beni","country":"BO"},{"name":"Iténez","region":"Beni","country":"BO"},{"name":"José Ballivián","region":"Beni","country":"BO"},{"name":"Mamoré","region":"Beni","country":"BO"},{"name":"Marbán","region":"Beni","country":"BO"},{"name":"Moxos","region":"Beni","country":"BO"},{"name":"Vaca Díez","region":"Beni","country":"BO"},{"name":"Yacuma","region":"Beni","country":"BO"},{"name":"Azurduy","region":"Chuquisaca","country":"BO"},{"name":"Belisario Boeto","region":"Chuquisaca","country":"BO"},{"name":"Hernando Siles","region":"Chuquisaca","country":"BO"},{"name":"Jaime Zudáñez","region":"Chuquisaca","country":"BO"},{"name":"Luis Calvo","region":"Chuquisaca","country":"BO"},{"name":"Nor Cinti","region":"Chuquisaca","country":"BO"},{"name":"Oropeza","region":"Chuquisaca","country":"BO"},{"name":"Sud Cinti","region":"Chuquisaca","country":"BO"},{"name":"Tomina","region":"Chuquisaca","country":"BO"},{"name":"Yamparáez","region":"Chuquisaca","country":"BO"},{"name":"Arani","region":"Cochabamba","country":"BO"},{"name":"Arque","region":"Cochabamba","country":"BO"},{"name":"Ayopaya","region":"Cochabamba","country":"BO"},{"name":"Capinota","region":"Cochabamba","country":"BO"},{"name":"Carrasco","region":"Cochabamba","country":"BO"},{"name":"Cercado","region":"Cochabamba","country":"BO"},{"name":"Chapare","region":"Cochabamba","country":"BO"},{"name":"Esteban Arce","region":"Cochabamba","country":"BO"},{"name":"Germán Jordán","region":"Cochabamba","country":"BO"},{"name":"Mizque","region":"Cochabamba","country":"BO"},{"name":"Campero","region":"Cochabamba","country":"BO"},{"name":"Punata","region":"Cochabamba","country":"BO"},{"name":"Quillacollo","region":"Cochabamba","country":"BO"},{"name":"Bolívar","region":"Cochabamba","country":"BO"},{"name":"Tapacarí","region":"Cochabamba","country":"BO"},{"name":"Tiraque","region":"Cochabamba","country":"BO"},{"name":"Abel Iturralde","region":"La Paz","country":"BO"},{"name":"Aroma","region":"La Paz","country":"BO"},{"name":"Bautista Saavedra","region":"La Paz","country":"BO"},{"name":"Caranavi","region":"La Paz","country":"BO"},{"name":"Eliodoro Camacho","region":"La Paz","country":"BO"},{"name":"Franz Tamayo","region":"La Paz","country":"BO"},{"name":"Gualberto Villarroel","region":"La Paz","country":"BO"},{"name":"Ingavi","region":"La Paz","country":"BO"},{"name":"Inquisivi","region":"La Paz","country":"BO"},{"name":"José Manuel Pando","region":"La Paz","country":"BO"},{"name":"Larecaja","region":"La Paz","country":"BO"},{"name":"Loayza","region":"La Paz","country":"BO"},{"name":"Los Andes","region":"La Paz","country":"BO"},{"name":"Manco Kapac","region":"La Paz","country":"BO"},{"name":"Muñecas","region":"La Paz","country":"BO"},{"name":"Nor Yungas","region":"La Paz","country":"BO"},{"name":"Omasuyos","region":"La Paz","country":"BO"},{"name":"Pacajes","region":"La Paz","country":"BO"},{"name":"Murillo","region":"La Paz","country":"BO"},{"name":"Sud Yungas","region":"La Paz","country":"BO"},{"name":"Atahuallpa","region":"Oruro","country":"BO"},{"name":"Carangas","region":"Oruro","country":"BO"},{"name":"Cercado","region":"Oruro","country":"BO"},{"name":"Eduardo Avaroa","region":"Oruro","country":"BO"},{"name":"Ladislao Cabrera","region":"Oruro","country":"BO"},{"name":"Litoral","region":"Oruro","country":"BO"},{"name":"Nor Carangas","region":"Oruro","country":"BO"},{"name":"Pantaléon Dalence","region":"Oruro","country":"BO"},{"name":"Poopó","region":"Oruro","country":"BO"},{"name":"Puerto de Mejillones","region":"Oruro","country":"BO"},{"name":"Sajama","region":"Oruro","country":"BO"},{"name":"San Pedro de Totora","region":"Oruro","country":"BO"},{"name":"Saucarí","region":"Oruro","country":"BO"},{"name":"Sebastián Pagador","region":"Oruro","country":"BO"},{"name":"Sud Carangas","region":"Oruro","country":"BO"},{"name":"Tomas Barrón","region":"Oruro","country":"BO"},{"name":"Abuná","region":"Pando","country":"BO"},{"name":"Federico Román","region":"Pando","country":"BO"},{"name":"Madre de Dios","region":"Pando","country":"BO"},{"name":"Manuripi","region":"Pando","country":"BO"},{"name":"Nicolás Suárez","region":"Pando","country":"BO"},{"name":"Alonso de Ibáñez","region":"Potosí","country":"BO"},{"name":"Antonio Quijarro","region":"Potosí","country":"BO"},{"name":"Bernardino Bilbao","region":"Potosí","country":"BO"},{"name":"Charcas","region":"Potosí","country":"BO"},{"name":"Chayanta","region":"Potosí","country":"BO"},{"name":"Cornelio Saavedra","region":"Potosí","country":"BO"},{"name":"Daniel Campos","region":"Potosí","country":"BO"},{"name":"Enrique Baldivieso","region":"Potosí","country":"BO"},{"name":"José María Linares","region":"Potosí","country":"BO"},{"name":"Modesto Omiste","region":"Potosí","country":"BO"},{"name":"Nor Chichas","region":"Potosí","country":"BO"},{"name":"Nor Lípez","region":"Potosí","country":"BO"},{"name":"Rafael Bustillo","region":"Potosí","country":"BO"},{"name":"Sur Chichas","region":"Potosí","country":"BO"},{"name":"Sur Lípez","region":"Potosí","country":"BO"},{"name":"Tomás Frías","region":"Potosí","country":"BO"},{"name":"Andrés Ibáñez","region":"Santa Cruz","country":"BO"},{"name":"Ángel Sandoval","region":"Santa Cruz","country":"BO"},{"name":"Chiquitos","region":"Santa Cruz","country":"BO"},{"name":"Cordillera","region":"Santa Cruz","country":"BO"},{"name":"Florida","region":"Santa Cruz","country":"BO"},{"name":"Germán Busch","region":"Santa Cruz","country":"BO"},{"name":"Guarayos","region":"Santa Cruz","country":"BO"},{"name":"Ichilo","region":"Santa Cruz","country":"BO"},{"name":"Ignacio Warnes","region":"Santa Cruz","country":"BO"},{"name":"José Miguel de Velasco","region":"Santa Cruz","country":"BO"},{"name":"Manuel María Caballero","region":"Santa Cruz","country":"BO"},{"name":"Ñuflo de Chávez","region":"Santa Cruz","country":"BO"},{"name":"Obispo Santistevan","region":"Santa Cruz","country":"BO"},{"name":"Sara","region":"Santa Cruz","country":"BO"},{"name":"Vallegrande","region":"Santa Cruz","country":"BO"},{"name":"Aniceto Arce","region":"Tarija","country":"BO"},{"name":"Burnet O\'Connor","region":"Tarija","country":"BO"},{"name":"Cercado","region":"Tarija","country":"BO"},{"name":"Eustaquio Méndez","region":"Tarija","country":"BO"},{"name":"Gran Chaco","region":"Tarija","country":"BO"},{"name":"José María Avilés","region":"Tarija","country":"BO"},{"name":"La Coruña","short":"C","country":"ES"},{"name":"Lugo","short":"LU","country":"ES"},{"name":"Vizcaya","short":"BI","country":"ES"},{"name":"Guipúzcoa","short":"SS","country":"ES"},{"name":"Huesca","short":"HU","country":"ES"},{"name":"Lérida","short":"L","country":"ES"},{"name":"Gerona","short":"GI","country":"ES"},{"name":"Barcelona","short":"B","country":"ES"},{"name":"Tarragona","short":"T","country":"ES"},{"name":"Castellón","short":"CS","country":"ES"},{"name":"Valencia","short":"V","country":"ES"},{"name":"Alicante","short":"A","country":"ES"},{"name":"Murcia","short":"MU","country":"ES"},{"name":"Zaragoza","short":"Z","country":"ES"},{"name":"Teruel","short":"TE","country":"ES"},{"name":"Cuenca","short":"CU","country":"ES"},{"name":"Albacete","short":"AB","country":"ES"},{"name":"Almeria","short":"AL","country":"ES"},{"name":"Granada","short":"GR","country":"ES"},{"name":"Málaga","short":"MA","country":"ES"},{"name":"Tenerife","short":"TF","country":"ES"},{"name":"Cádiz","short":"CA","country":"ES"},{"name":"Sevilla","short":"SE","country":"ES"},{"name":"Huelva","short":"H","country":"ES"},{"name":"Las Palmas","short":"GC","country":"ES"},{"name":"Madrid","short":"M","country":"ES"},{"name":"Badajoz","short":"BA","country":"ES"},{"name":"Cáceres","short":"CC","country":"ES"},{"name":"Toledo","short":"TO","country":"ES"},{"name":"Ciudad Real","short":"CR","country":"ES"},{"name":"Salamanca","short":"SA","country":"ES"},{"name":"Córdoba","short":"CO","country":"ES"},{"name":"Jaén","short":"J","country":"ES"},{"name":"Ávila","short":"AV","country":"ES"},{"name":"Valladolid","short":"VA","country":"ES"},{"name":"Zamora","short":"ZA","country":"ES"},{"name":"Álava","short":"VI","country":"ES"},{"name":"Segovia","short":"SG","country":"ES"},{"name":"Burgos","short":"BU","country":"ES"},{"name":"Pontevedra","short":"PO","country":"ES"},{"name":"León","short":"LE","country":"ES"},{"name":"Orense","short":"OU","country":"ES"},{"name":"Palencia","short":"P","country":"ES"},{"name":"La Rioja","short":"LO","country":"ES"},{"name":"Soria","short":"SO","country":"ES"},{"name":"Guadalajara","short":"GU","country":"ES"},{"name":"বরগুনা","english":"Barguna","region":"Barisal","country":"BD"},{"name":"বরিশাল","english":"Barisal","region":"Barisal","country":"BD"},{"name":"ভোলা","english":"Bhola","region":"Barisal","country":"BD"},{"name":"ঝালকাঠি","english":"Jhalokati","region":"Barisal","country":"BD"},{"name":"পটুয়াখালী","english":"Patuakhali","region":"Barisal","country":"BD"},{"name":"পিরোজপুর","english":"Pirojpur","region":"Barisal","country":"BD"},{"name":"বান্দরবান","english":"Bandarban","region":"Chittagong","country":"BD"},{"name":"ব্রাহ্মণবাড়ীয়া","english":"Brahmanbaria","region":"Chittagong","country":"BD"},{"name":"চাঁদপুর","english":"Chandpur","region":"Chittagong","country":"BD"},{"name":"চট্টগ্রাম","english":"Chittagong","region":"Chittagong","country":"BD"},{"name":"কুমিল্লা","english":"Comilla","region":"Chittagong","country":"BD"},{"name":"কক্সবাজার","english":"Cox\'s Bazar","region":"Chittagong","country":"BD"},{"name":"ফেনী","english":"Feni","region":"Chittagong","country":"BD"},{"name":"খাগড়াছড়ি","english":"Khagrachhari","region":"Chittagong","country":"BD"},{"name":"লক্ষীপুর","english":"Lakshmipur","region":"Chittagong","country":"BD"},{"name":"নোয়াখালী","english":"Noakhali","region":"Chittagong","country":"BD"},{"name":"রাঙ্গামাটি","english":"Rangamati","region":"Chittagong","country":"BD"},{"name":"ঢাকা","english":"Dhaka","region":"Dhaka","country":"BD"},{"name":"ফরিদপুর","english":"Faridpur","region":"Dhaka","country":"BD"},{"name":"গাজীপুর","english":"Gazipur","region":"Dhaka","country":"BD"},{"name":"গোপালগঞ্জ","english":"Gopalganj","region":"Dhaka","country":"BD"},{"name":"জামালপুর","english":"Jamalpur","region":"Dhaka","country":"BD"},{"name":"কিশোরগঞ্জ","english":"Kishoreganj","region":"Dhaka","country":"BD"},{"name":"মাদারীপুর","english":"Madaripur","region":"Dhaka","country":"BD"},{"name":"মানিকগঞ্জ","english":"Manikganj","region":"Dhaka","country":"BD"},{"name":"মুন্সীগঞ্জ","english":"Munshiganj","region":"Dhaka","country":"BD"},{"name":"ময়মনসিংহ","english":"Mymensingh","region":"Dhaka","country":"BD"},{"name":"নারায়ণগঞ্জ","english":"Narayanganj","region":"Dhaka","country":"BD"},{"name":"নরসিংদী","english":"Narsingdi","region":"Dhaka","country":"BD"},{"name":"নেত্রকোনা","english":"Netrakona","region":"Dhaka","country":"BD"},{"name":"রাজবাড়ী","english":"Rajbari","region":"Dhaka","country":"BD"},{"name":"শরীয়তপুর","english":"Shariatpur","region":"Dhaka","country":"BD"},{"name":"শেরপুর","english":"Sherpur","region":"Dhaka","country":"BD"},{"name":"টাঙ্গাইল","english":"Tangail","region":"Dhaka","country":"BD"},{"name":"বাগেরহাট","english":"Bagerhat","region":"Khulna","country":"BD"},{"name":"চুয়াডাঙ্গা","english":"Chuadanga","region":"Khulna","country":"BD"},{"name":"যশোর","english":"Jessore","region":"Khulna","country":"BD"},{"name":"ঝিনাইদহ","english":"Jhenaidah","region":"Khulna","country":"BD"},{"name":"খুলনা","english":"Khulna","region":"Khulna","country":"BD"},{"name":"কুষ্টিয়া","english":"Kushtia","region":"Khulna","country":"BD"},{"name":"মাগুরা","english":"Magura","region":"Khulna","country":"BD"},{"name":"মেহেরপুর","english":"Meherpur","region":"Khulna","country":"BD"},{"name":"নড়াইল","english":"Narail","region":"Khulna","country":"BD"},{"name":"সাতক্ষিরা","english":"Satkhira","region":"Khulna","country":"BD"},{"name":"বগুড়া","english":"Bogra","region":"Rajshahi","country":"BD"},{"name":"জয়পুরহাট","english":"Joypurhat","region":"Rajshahi","country":"BD"},{"name":"নওগাঁ","english":"Naogaon","region":"Rajshahi","country":"BD"},{"name":"নাটোর","english":"Natore","region":"Rajshahi","country":"BD"},{"name":"নওয়াবগঞ্জ","english":"Chapainawabganj","region":"Rajshahi","country":"BD"},{"name":"পাবনা","english":"Pabna","region":"Rajshahi","country":"BD"},{"name":"রাজশাহী","english":"Rajshahi","region":"Rajshahi","country":"BD"},{"name":"সিরাজগঞ্জ","english":"Sirajganj","region":"Rajshahi","country":"BD"},{"name":"দিনাজপুর","english":"Dinajpur","region":"Rangpur","country":"BD"},{"name":"গাইবান্ধা","english":"Gaibandha","region":"Rangpur","country":"BD"},{"name":"কুড়িগ্রাম","english":"Kurigram","region":"Rangpur","country":"BD"},{"name":"লালমনিরহাট","english":"Lalmonirhat","region":"Rangpur","country":"BD"},{"name":"নীলফামারী","english":"Nilphamari","region":"Rangpur","country":"BD"},{"name":"পঞ্চগড়","english":"Panchagarh","region":"Rangpur","country":"BD"},{"name":"রংপুর","english":"Rangpur","region":"Rangpur","country":"BD"},{"name":"ঠাকুরগাঁ","english":"Thakurgaon","region":"Rangpur","country":"BD"},{"name":"হবিগঞ্জ","english":"Habiganj","region":"Sylhet","country":"BD"},{"name":"মৌলভীবাজার","english":"Moulvibazar","region":"Sylhet","country":"BD"},{"name":"সুনামগঞ্জ","english":"Sunamganj","region":"Sylhet","country":"BD"},{"name":"সিলেট","english":"Sylhet","region":"Sylhet","country":"BD"},{"name":"Azad Kashmir","country":"PK"},{"name":"Bahawalpur","country":"PK"},{"name":"Bannu","country":"PK"},{"name":"Dera Ghazi Khan","country":"PK"},{"name":"Dera Ismail Khan","country":"PK"},{"name":"Faisalabad","country":"PK"},{"name":"F.A.T.A.","country":"PK"},{"name":"Gujranwala","country":"PK"},{"name":"Hazara","country":"PK"},{"name":"Hyderabad","country":"PK"},{"name":"Islamabad","country":"PK"},{"name":"Kalat","country":"PK"},{"name":"Karachi","country":"PK"},{"name":"Kohat","country":"PK"},{"name":"Lahore","country":"PK"},{"name":"Larkana","country":"PK"},{"name":"Makran","country":"PK"},{"name":"Malakand","country":"PK"},{"name":"Mardan","country":"PK"},{"name":"Mirpur Khas","country":"PK"},{"name":"Multan","country":"PK"},{"name":"Nasirabad","country":"PK"},{"name":"Northern Areas","country":"PK"},{"name":"Peshawar","country":"PK"},{"name":"Quetta","country":"PK"},{"name":"Rawalpindi","country":"PK"},{"name":"Sargodha","country":"PK"},{"name":"Sahiwal","country":"PK"},{"name":"Sibi","country":"PK"},{"name":"Sukkur","country":"PK"},{"name":"Zhob","country":"PK"},{"short":"AB","name":"Abia","country":"NG"},{"short":"FC","name":"Abuja","country":"NG"},{"short":"AD","name":"Adamawa","country":"NG"},{"short":"AK","name":"Akwa Ibom","country":"NG"},{"short":"AN","name":"Anambra","country":"NG"},{"short":"BA","name":"Bauchi","country":"NG"},{"short":"BY","name":"Bayelsa","country":"NG"},{"short":"BE","name":"Benue","country":"NG"},{"short":"BO","name":"Borno","country":"NG"},{"short":"CR","name":"Cross River","country":"NG"},{"short":"DE","name":"Delta","country":"NG"},{"short":"EB","name":"Ebonyi","country":"NG"},{"short":"ED","name":"Edo","country":"NG"},{"short":"EK","name":"Ekiti","country":"NG"},{"short":"EN","name":"Enugu","country":"NG"},{"short":"GO","name":"Gombe","country":"NG"},{"short":"IM","name":"Imo","country":"NG"},{"short":"JI","name":"Jigawa","country":"NG"},{"short":"KD","name":"Kaduna","country":"NG"},{"short":"KN","name":"Kano","country":"NG"},{"short":"KT","name":"Katsina","country":"NG"},{"short":"KE","name":"Kebbi","country":"NG"},{"short":"KO","name":"Kogi","country":"NG"},{"short":"KW","name":"Kwara","country":"NG"},{"short":"LA","name":"Lagos","country":"NG"},{"short":"NA","name":"Nasarawa","country":"NG"},{"short":"NI","name":"Niger","country":"NG"},{"short":"OG","name":"Ogun","country":"NG"},{"short":"ON","name":"Ondo","country":"NG"},{"short":"OS","name":"Osun","country":"NG"},{"short":"OY","name":"Oyo","country":"NG"},{"short":"PL","name":"Plateau","country":"NG"},{"short":"RI","name":"Rivers","country":"NG"},{"short":"SO","name":"Sokoto","country":"NG"},{"short":"TA","name":"Taraba","country":"NG"},{"short":"YO","name":"Yobe","country":"NG"},{"short":"ZA","name":"Zamfara","country":"NG"},{"name":"愛知県","english":"Aichi","country":"JP"},{"name":"秋田県","english":"Akita","country":"JP"},{"name":"青森県","english":"Aomori","country":"JP"},{"name":"千葉県","english":"Chiba","country":"JP"},{"name":"愛媛県","english":"Ehime","country":"JP"},{"name":"福井県","english":"Fukui","country":"JP"},{"name":"福岡県","english":"Fukuoka","country":"JP"},{"name":"福島県","english":"Fukushima","country":"JP"},{"name":"岐阜県","english":"Gifu","country":"JP"},{"name":"群馬県","english":"Gunma","country":"JP"},{"name":"広島県","english":"Hiroshima","country":"JP"},{"name":"北海道","english":"Hokkaidō","country":"JP"},{"name":"兵庫県","english":"Hyōgo","country":"JP"},{"name":"茨城県","english":"Ibaraki","country":"JP"},{"name":"石川県","english":"Ishikawa","country":"JP"},{"name":"岩手県","english":"Iwate","country":"JP"},{"name":"香川県","english":"Kagawa","country":"JP"},{"name":"鹿児島県","english":"Kagoshima","country":"JP"},{"name":"神奈川県","english":"Kanagawa","country":"JP"},{"name":"高知県","english":"Kōchi","country":"JP"},{"name":"熊本県","english":"Kumamoto","country":"JP"},{"name":"京都府","english":"Kyōto","country":"JP"},{"name":"三重県","english":"Mie","country":"JP"},{"name":"宮城県","english":"Miyagi","country":"JP"},{"name":"宮崎県","english":"Miyazaki","country":"JP"},{"name":"長野県","english":"Nagano","country":"JP"},{"name":"長崎県","english":"Nagasaki","country":"JP"},{"name":"奈良県","english":"Nara","country":"JP"},{"name":"新潟県","english":"Niigata","country":"JP"},{"name":"大分県","english":"Ōita","country":"JP"},{"name":"岡山県","english":"Okayama","country":"JP"},{"name":"沖縄県","english":"Okinawa","country":"JP"},{"name":"大阪府","english":"Ōsaka","country":"JP"},{"name":"佐賀県","english":"Saga","country":"JP"},{"name":"埼玉県","english":"Saitama","country":"JP"},{"name":"滋賀県","english":"Shiga","country":"JP"},{"name":"島根県","english":"Shimane","country":"JP"},{"name":"静岡県","english":"Shizuoka","country":"JP"},{"name":"栃木県","english":"Tochigi","country":"JP"},{"name":"徳島県","english":"Tokushima","country":"JP"},{"name":"東京都","english":"Tōkyō","country":"JP"},{"name":"鳥取県","english":"Tottori","country":"JP"},{"name":"富山県","english":"Toyama","country":"JP"},{"name":"和歌山県","english":"Wakayama","country":"JP"},{"name":"山形県","english":"Yamagata","country":"JP"},{"name":"山口県","english":"Yamaguchi","country":"JP"},{"name":"山梨県","english":"Yamanashi","country":"JP"},{"short":"B","name":"Burgenland","country":"AT"},{"short":"K","name":"Kärnten","country":"AT"},{"short":"NÖ","name":"Niederösterreich","country":"AT"},{"short":"OÖ","name":"Oberösterreich","country":"AT"},{"short":"S","name":"Salzburg","country":"AT"},{"short":"ST","name":"Steiermark","country":"AT"},{"short":"T","name":"Tirol","country":"AT"},{"short":"V","name":"Vorarlberg","country":"AT"},{"short":"W","name":"Wien","country":"AT"},{"short":"AC","name":"Acre","country":"BR"},{"short":"AL","name":"Alagoas","country":"BR"},{"short":"AP","name":"Amapá","country":"BR"},{"short":"AM","name":"Amazonas","country":"BR"},{"short":"BA","name":"Bahia","country":"BR"},{"short":"CE","name":"Ceará","country":"BR"},{"short":"DF","name":"Distrito Federal","country":"BR"},{"short":"ES","name":"Espírito Santo","country":"BR"},{"short":"GO","name":"Goiás","country":"BR"},{"short":"MA","name":"Maranhão","country":"BR"},{"short":"MT","name":"Mato Grosso","country":"BR"},{"short":"MS","name":"Mato Grosso do Sul","country":"BR"},{"short":"MG","name":"Minas Gerais","country":"BR"},{"short":"PA","name":"Pará","country":"BR"},{"short":"PB","name":"Paraíba","country":"BR"},{"short":"PR","name":"Paraná","country":"BR"},{"short":"PE","name":"Pernambuco","country":"BR"},{"short":"PI","name":"Piauí","country":"BR"},{"short":"RJ","name":"Rio de Janeiro","country":"BR"},{"short":"RN","name":"Rio Grande do Norte","country":"BR"},{"short":"RS","name":"Rio Grande do Sul","country":"BR"},{"short":"RO","name":"Rondônia","country":"BR"},{"short":"RR","name":"Roraima","country":"BR"},{"short":"SC","name":"Santa Catarina","country":"BR"},{"short":"SP","name":"São Paulo","country":"BR"},{"short":"SE","name":"Sergipe","country":"BR"},{"short":"TO","name":"Tocantins","country":"BR"},{"name":"Abra","country":"PH"},{"name":"Agusan del Norte","country":"PH"},{"name":"Agusan del Sur","country":"PH"},{"name":"Aklan","country":"PH"},{"name":"Albay","country":"PH"},{"name":"Antique","country":"PH"},{"name":"Apayao","country":"PH"},{"name":"Aurora","country":"PH"},{"name":"Basilan","country":"PH"},{"name":"Bataan","country":"PH"},{"name":"Batanes","country":"PH"},{"name":"Batangas","country":"PH"},{"name":"Benguet","country":"PH"},{"name":"Biliran","country":"PH"},{"name":"Bohol","country":"PH"},{"name":"Bukidnon","country":"PH"},{"name":"Bulacan","country":"PH"},{"name":"Cagayan","country":"PH"},{"name":"Camarines Norte","country":"PH"},{"name":"Camarines Sur","country":"PH"},{"name":"Camiguin","country":"PH"},{"name":"Capiz","country":"PH"},{"name":"Catanduanes","country":"PH"},{"name":"Cavite","country":"PH"},{"name":"Cebu","country":"PH"},{"name":"Compostela Valley","country":"PH"},{"name":"Cotabato","country":"PH"},{"name":"Davao del Norte","country":"PH"},{"name":"Davao del Sur","country":"PH"},{"name":"Davao Occidental","country":"PH"},{"name":"Davao Oriental","country":"PH"},{"name":"Dinagat Islands","country":"PH"},{"name":"Eastern Samar","country":"PH"},{"name":"Guimaras","country":"PH"},{"name":"Ifugao","country":"PH"},{"name":"Ilocos Norte","country":"PH"},{"name":"Ilocos Sur","country":"PH"},{"name":"Iloilo","country":"PH"},{"name":"Isabela","country":"PH"},{"name":"Kalinga","country":"PH"},{"name":"La Union","country":"PH"},{"name":"Laguna","country":"PH"},{"name":"Lanao del Norte","country":"PH"},{"name":"Lanao del Sur","country":"PH"},{"name":"Leyte","country":"PH"},{"name":"Maguindanao","country":"PH"},{"name":"Marinduque","country":"PH"},{"name":"Masbate","country":"PH"},{"name":"Misamis Occidental","country":"PH"},{"name":"Misamis Oriental","country":"PH"},{"name":"Mountain Province","country":"PH"},{"name":"Negros Occidental","country":"PH"},{"name":"Negros Oriental","country":"PH"},{"name":"Northern Samar","country":"PH"},{"name":"Nueva Ecija","country":"PH"},{"name":"Nueva Vizcaya","country":"PH"},{"name":"Occidental Mindoro","country":"PH"},{"name":"Oriental Mindoro","country":"PH"},{"name":"Palawan","country":"PH"},{"name":"Pampanga","country":"PH"},{"name":"Pangasinan","country":"PH"},{"name":"Quezon","country":"PH"},{"name":"Quirino","country":"PH"},{"name":"Rizal","country":"PH"},{"name":"Romblon","country":"PH"},{"name":"Samar","country":"PH"},{"name":"Sarangani","country":"PH"},{"name":"Siquijor","country":"PH"},{"name":"Sorsogon","country":"PH"},{"name":"South Cotabato","country":"PH"},{"name":"Southern Leyte","country":"PH"},{"name":"Sultan Kudarat","country":"PH"},{"name":"Sulu","country":"PH"},{"name":"Surigao del Norte","country":"PH"},{"name":"Surigao del Sur","country":"PH"},{"name":"Tarlac","country":"PH"},{"name":"Tawi-Tawi","country":"PH"},{"name":"Zambales","country":"PH"},{"name":"Zamboanga del Norte","country":"PH"},{"name":"Zamboanga del Sur","country":"PH"},{"name":"Zamboanga Sibugay","country":"PH"},{"name":"Metro Manila","country":"PH"},{"name":"Hà Nội","country":"VN"},{"name":"Hà Giang","country":"VN"},{"name":"Cao Bằng","country":"VN"},{"name":"Bắc Kạn","country":"VN"},{"name":"Tuyên Quang","country":"VN"},{"name":"Lào Cai","country":"VN"},{"name":"Điện Biên","country":"VN"},{"name":"Lai Châu","country":"VN"},{"name":"Sơn La","country":"VN"},{"name":"Yên Bái","country":"VN"},{"name":"Hòa Bình","country":"VN"},{"name":"Thái Nguyên","country":"VN"},{"name":"Lạng Sơn","country":"VN"},{"name":"Quảng Ninh","country":"VN"},{"name":"Bắc Giang","country":"VN"},{"name":"Phú Thọ","country":"VN"},{"name":"Vĩnh Phúc","country":"VN"},{"name":"Bắc Ninh","country":"VN"},{"name":"Hải Dương","country":"VN"},{"name":"Hải Phòng","country":"VN"},{"name":"Hưng Yên","country":"VN"},{"name":"Thái Bình","country":"VN"},{"name":"Hà Nam","country":"VN"},{"name":"Nam Định","country":"VN"},{"name":"Ninh Bình","country":"VN"},{"name":"Thanh Hóa","country":"VN"},{"name":"Nghệ An","country":"VN"},{"name":"Hà Tĩnh","country":"VN"},{"name":"Quảng Bình","country":"VN"},{"name":"Quảng Trị","country":"VN"},{"name":"Thừa Thiên–Huế","country":"VN"},{"name":"Đà Nẵng","country":"VN"},{"name":"Quảng Nam","country":"VN"},{"name":"Quảng Ngãi","country":"VN"},{"name":"Bình Định","country":"VN"},{"name":"Phú Yên","country":"VN"},{"name":"Khánh Hòa","country":"VN"},{"name":"Ninh Thuận","country":"VN"},{"name":"Bình Thuận","country":"VN"},{"name":"Kon Tum","country":"VN"},{"name":"Gia Lai","country":"VN"},{"name":"Đắk Lắk","country":"VN"},{"name":"Đắk Nông","country":"VN"},{"name":"Lâm Đồng","country":"VN"},{"name":"Bình Phước","country":"VN"},{"name":"Tây Ninh","country":"VN"},{"name":"Bình Dương","country":"VN"},{"name":"Đồng Nai","country":"VN"},{"name":"Bà Rịa–Vũng Tàu","country":"VN"},{"name":"Thành phố Hồ Chí Minh","country":"VN"},{"name":"Long An","country":"VN"},{"name":"Tiền Giang","country":"VN"},{"name":"Bến Tre","country":"VN"},{"name":"Trà Vinh","country":"VN"},{"name":"Vĩnh Long","country":"VN"},{"name":"Đồng Tháp","country":"VN"},{"name":"An Giang","country":"VN"},{"name":"Kiên Giang","country":"VN"},{"name":"Cần Thơ","country":"VN"},{"name":"Hậu Giang","country":"VN"},{"name":"Sóc Trăng","country":"VN"},{"name":"Bạc Liêu","country":"VN"},{"name":"Cà Mau","country":"VN"},{"name":"San José","country":"CR"},{"name":"Alajuela","country":"CR"},{"name":"Cartago","country":"CR"},{"name":"Heredia","country":"CR"},{"name":"Guanacaste","country":"CR"},{"name":"Puntarenas","country":"CR"},{"name":"Limón","country":"CR"},{"name":"Auckland","country":"NZ"},{"name":"New Plymouth","country":"NZ"},{"name":"Hawke\'s Bay","country":"NZ"},{"name":"Wellington","country":"NZ"},{"name":"Nelson","country":"NZ"},{"name":"Marlborough","country":"NZ"},{"name":"Westland","country":"NZ"},{"name":"Canterbury","country":"NZ"},{"name":"Otago","country":"NZ"},{"name":"Southland","country":"NZ"}]')

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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _address_view_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./address_view/index.js */ "./js/address_view/index.js");


const addressView = new _address_view_index_js__WEBPACK_IMPORTED_MODULE_0__.AddressView()
addressView.init()

})();

})()
;
//# sourceMappingURL=address_view.js.map