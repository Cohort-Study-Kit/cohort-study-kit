(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({
"./js/address_overview/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  AddressOverview: function() { return AddressOverview; }
});
/* harmony import */var simple_datatables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! simple-datatables */ "./node_modules/.pnpm/simple-datatables@9.1.0/node_modules/simple-datatables/dist/module.js");
/* harmony import */var _tools_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/index.js */ "./js/tools/index.js");



class AddressOverview {
  constructor() {
    this.el = false
    this.copsacId = false
    this.addresses = []
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.el = document.querySelector("table")
    this.copsacId = document.body.dataset.copsac
    this.bind()
    this.getAddresses().then(() => this.render())
  }

  getAddresses() {
    return (0,_tools_index_js__WEBPACK_IMPORTED_MODULE_1__.getJson)(`/api/address/get/${this.copsacId}/`).then(({ json }) => {
      this.addresses = json.addresses.map((address) => {
        return [
          address.id,
          (0,_tools_index_js__WEBPACK_IMPORTED_MODULE_1__.dateCell)(address.start_date),
          (0,_tools_index_js__WEBPACK_IMPORTED_MODULE_1__.dateCell)(address.end_date),
          address.city,
          address.street,
          address.postcode,
          address.phone,
          address.cellphone_mother,
          address.cellphone_father,
          address.email_mother,
          address.email_father,
          address.comments,
        ]
      })
    })
  }

  render() {
    new simple_datatables__WEBPACK_IMPORTED_MODULE_0__.DataTable(this.el, {
      type: "string",
      data: {
        headings: [
          "ID",
          "Move in",
          "Move out",
          "City",
          "Street",
          "Postcode",
          "Phone",
          "Cellphone mother",
          "Cellphone father",
          "Email mother",
          "Email father",
          "Comments",
        ],
        data: this.addresses,
      },
      searchable: false,
      fixedHeight: false,
      paging: false,
      layout: {
        top: "",
        bottom: "",
      },
      rowRender: (row, tr, _index) => {
        const datasetId = row.cells[0].data
        if (!tr.attributes) {
          tr.attributes = {}
        }
        tr.attributes["data-id"] = String(datasetId)
        return tr
      },
      columns: [
        {
          select: 0,
          hidden: true,
        },
        {
          select: [1, 2],
          width: "50px",
        },
      ],
    })
  }

  bind() {
    this.el.addEventListener("click", (event) => {
      const tr = event.target.closest("tr")
      if (!tr) {
        return
      }
      const id = tr.dataset.id
      if (!id) {
        return
      }
      event.preventDefault()
      window.location = `/address/update/${this.copsacId}/${id}/`
    })
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
"./node_modules/.pnpm/simple-datatables@9.1.0/node_modules/simple-datatables/dist/module.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DataTable: function() { return nt; },
  addColumnFilter: function() { return gt; },
  convertCSV: function() { return at; },
  convertJSON: function() { return ot; },
  createElement: function() { return s; },
  exportCSV: function() { return rt; },
  exportJSON: function() { return lt; },
  exportSQL: function() { return dt; },
  exportTXT: function() { return ct; },
  isJson: function() { return e; },
  isObject: function() { return t; },
  makeEditable: function() { return pt; }
});
const t=t=>"[object Object]"===Object.prototype.toString.call(t),e=e=>{let s=!1;try{s=JSON.parse(e)}catch(t){return!1}return!(null===s||!Array.isArray(s)&&!t(s))&&s},s=(t,e)=>{const s=document.createElement(t);if(e&&"object"==typeof e)for(const t in e)"html"===t?s.innerHTML=e[t]:s.setAttribute(t,e[t]);return s},i=t=>["#text","#comment"].includes(t.nodeName)?t.data:t.childNodes?t.childNodes.map((t=>i(t))).join(""):"",n=t=>{if(null==t)return"";if(t.hasOwnProperty("text")||t.hasOwnProperty("data")){const e=t;return e.text??n(e.data)}return t.hasOwnProperty("nodeName")?i(t):String(t)},a=function(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},o=function(t,e){let s=0,i=0;for(;s<t+1;){e[i].hidden||(s+=1),i+=1}return i-1},r=function(t){const e={};if(t)for(const s of t)e[s.name]=s.value;return e},l=t=>t?t.trim().split(" ").map((t=>`.${t}`)).join(""):null,d=(t,e)=>{const s=e?.split(" ").some((e=>!t.classList.contains(e)));return!s},c=(t,e)=>t?e?`${t} ${e}`:t:e||"";var h=function(){return h=Object.assign||function(t){for(var e,s=arguments,i=1,n=arguments.length;i<n;i++)for(var a in e=s[i])Object.prototype.hasOwnProperty.call(e,a)&&(t[a]=e[a]);return t},h.apply(this,arguments)};function u(t,e,s){if(s||2===arguments.length)for(var i,n=0,a=e.length;n<a;n++)!i&&n in e||(i||(i=Array.prototype.slice.call(e,0,n)),i[n]=e[n]);return t.concat(i||Array.prototype.slice.call(e))}"function"==typeof SuppressedError&&SuppressedError;var p=function(){function t(t){void 0===t&&(t={});var e=this;Object.entries(t).forEach((function(t){var s=t[0],i=t[1];return e[s]=i}))}return t.prototype.toString=function(){return JSON.stringify(this)},t.prototype.setValue=function(t,e){return this[t]=e,this},t}();function f(t){for(var e=arguments,s=[],i=1;i<arguments.length;i++)s[i-1]=e[i];return null!=t&&s.some((function(e){var s,i;return"function"==typeof(null===(i=null===(s=null==t?void 0:t.ownerDocument)||void 0===s?void 0:s.defaultView)||void 0===i?void 0:i[e])&&t instanceof t.ownerDocument.defaultView[e]}))}function m(t,e,s){var i;return"#text"===t.nodeName?i=s.document.createTextNode(t.data):"#comment"===t.nodeName?i=s.document.createComment(t.data):(e?(i=s.document.createElementNS("http://www.w3.org/2000/svg",t.nodeName),"foreignObject"===t.nodeName&&(e=!1)):"svg"===t.nodeName.toLowerCase()?(i=s.document.createElementNS("http://www.w3.org/2000/svg","svg"),e=!0):i=s.document.createElement(t.nodeName),t.attributes&&Object.entries(t.attributes).forEach((function(t){var e=t[0],s=t[1];return i.setAttribute(e,s)})),t.childNodes&&t.childNodes.forEach((function(t){return i.appendChild(m(t,e,s))})),s.valueDiffing&&(t.value&&f(i,"HTMLButtonElement","HTMLDataElement","HTMLInputElement","HTMLLIElement","HTMLMeterElement","HTMLOptionElement","HTMLProgressElement","HTMLParamElement")&&(i.value=t.value),t.checked&&f(i,"HTMLInputElement")&&(i.checked=t.checked),t.selected&&f(i,"HTMLOptionElement")&&(i.selected=t.selected))),i}var g=function(t,e){for(e=e.slice();e.length>0;){var s=e.splice(0,1)[0];t=t.childNodes[s]}return t};function b(t,e,s){var i,n,a,o=e[s._const.action],r=e[s._const.route];[s._const.addElement,s._const.addTextElement].includes(o)||(i=g(t,r));var l={diff:e,node:i};if(s.preDiffApply(l))return!0;switch(o){case s._const.addAttribute:if(!i||!f(i,"Element"))return!1;i.setAttribute(e[s._const.name],e[s._const.value]);break;case s._const.modifyAttribute:if(!i||!f(i,"Element"))return!1;i.setAttribute(e[s._const.name],e[s._const.newValue]),f(i,"HTMLInputElement")&&"value"===e[s._const.name]&&(i.value=e[s._const.newValue]);break;case s._const.removeAttribute:if(!i||!f(i,"Element"))return!1;i.removeAttribute(e[s._const.name]);break;case s._const.modifyTextElement:if(!i||!f(i,"Text"))return!1;s.textDiff(i,i.data,e[s._const.oldValue],e[s._const.newValue]),f(i.parentNode,"HTMLTextAreaElement")&&(i.parentNode.value=e[s._const.newValue]);break;case s._const.modifyValue:if(!i||void 0===i.value)return!1;i.value=e[s._const.newValue];break;case s._const.modifyComment:if(!i||!f(i,"Comment"))return!1;s.textDiff(i,i.data,e[s._const.oldValue],e[s._const.newValue]);break;case s._const.modifyChecked:if(!i||void 0===i.checked)return!1;i.checked=e[s._const.newValue];break;case s._const.modifySelected:if(!i||void 0===i.selected)return!1;i.selected=e[s._const.newValue];break;case s._const.replaceElement:var d="svg"===e[s._const.newValue].nodeName.toLowerCase()||"http://www.w3.org/2000/svg"===i.parentNode.namespaceURI;i.parentNode.replaceChild(m(e[s._const.newValue],d,s),i);break;case s._const.relocateGroup:u([],new Array(e[s._const.groupLength]),!0).map((function(){return i.removeChild(i.childNodes[e[s._const.from]])})).forEach((function(t,n){0===n&&(a=i.childNodes[e[s._const.to]]),i.insertBefore(t,a||null)}));break;case s._const.removeElement:i.parentNode.removeChild(i);break;case s._const.addElement:var c=(p=r.slice()).splice(p.length-1,1)[0];if(!f(i=g(t,p),"Element"))return!1;i.insertBefore(m(e[s._const.element],"http://www.w3.org/2000/svg"===i.namespaceURI,s),i.childNodes[c]||null);break;case s._const.removeTextElement:if(!i||3!==i.nodeType)return!1;var h=i.parentNode;h.removeChild(i),f(h,"HTMLTextAreaElement")&&(h.value="");break;case s._const.addTextElement:var p;c=(p=r.slice()).splice(p.length-1,1)[0];if(n=s.document.createTextNode(e[s._const.value]),!(i=g(t,p)).childNodes)return!1;i.insertBefore(n,i.childNodes[c]||null),f(i.parentNode,"HTMLTextAreaElement")&&(i.parentNode.value=e[s._const.value]);break;default:console.log("unknown action")}return s.postDiffApply({diff:l.diff,node:l.node,newNode:n}),!0}function v(t,e,s){var i=t[e];t[e]=t[s],t[s]=i}function _(t,e,s){(e=e.slice()).reverse(),e.forEach((function(e){!function(t,e,s){switch(e[s._const.action]){case s._const.addAttribute:e[s._const.action]=s._const.removeAttribute,b(t,e,s);break;case s._const.modifyAttribute:v(e,s._const.oldValue,s._const.newValue),b(t,e,s);break;case s._const.removeAttribute:e[s._const.action]=s._const.addAttribute,b(t,e,s);break;case s._const.modifyTextElement:case s._const.modifyValue:case s._const.modifyComment:case s._const.modifyChecked:case s._const.modifySelected:case s._const.replaceElement:v(e,s._const.oldValue,s._const.newValue),b(t,e,s);break;case s._const.relocateGroup:v(e,s._const.from,s._const.to),b(t,e,s);break;case s._const.removeElement:e[s._const.action]=s._const.addElement,b(t,e,s);break;case s._const.addElement:e[s._const.action]=s._const.removeElement,b(t,e,s);break;case s._const.removeTextElement:e[s._const.action]=s._const.addTextElement,b(t,e,s);break;case s._const.addTextElement:e[s._const.action]=s._const.removeTextElement,b(t,e,s);break;default:console.log("unknown action")}}(t,e,s)}))}var w=function(t){var e=[];return e.push(t.nodeName),"#text"!==t.nodeName&&"#comment"!==t.nodeName&&t.attributes&&(t.attributes.class&&e.push("".concat(t.nodeName,".").concat(t.attributes.class.replace(/ /g,"."))),t.attributes.id&&e.push("".concat(t.nodeName,"#").concat(t.attributes.id))),e},y=function(t){var e={},s={};return t.forEach((function(t){w(t).forEach((function(t){var i=t in e;i||t in s?i&&(delete e[t],s[t]=!0):e[t]=!0}))})),e},D=function(t,e){var s=y(t),i=y(e),n={};return Object.keys(s).forEach((function(t){i[t]&&(n[t]=!0)})),n},M=function(t){return delete t.outerDone,delete t.innerDone,delete t.valueDone,!t.childNodes||t.childNodes.every(M)},N=function(t){if(Object.prototype.hasOwnProperty.call(t,"data"))return{nodeName:"#text"===t.nodeName?"#text":"#comment",data:t.data};var e={nodeName:t.nodeName};return Object.prototype.hasOwnProperty.call(t,"attributes")&&(e.attributes=h({},t.attributes)),Object.prototype.hasOwnProperty.call(t,"checked")&&(e.checked=t.checked),Object.prototype.hasOwnProperty.call(t,"value")&&(e.value=t.value),Object.prototype.hasOwnProperty.call(t,"selected")&&(e.selected=t.selected),Object.prototype.hasOwnProperty.call(t,"childNodes")&&(e.childNodes=t.childNodes.map((function(t){return N(t)}))),e},x=function(t,e){if(!["nodeName","value","checked","selected","data"].every((function(s){return t[s]===e[s]})))return!1;if(Object.prototype.hasOwnProperty.call(t,"data"))return!0;if(Boolean(t.attributes)!==Boolean(e.attributes))return!1;if(Boolean(t.childNodes)!==Boolean(e.childNodes))return!1;if(t.attributes){var s=Object.keys(t.attributes),i=Object.keys(e.attributes);if(s.length!==i.length)return!1;if(!s.every((function(s){return t.attributes[s]===e.attributes[s]})))return!1}if(t.childNodes){if(t.childNodes.length!==e.childNodes.length)return!1;if(!t.childNodes.every((function(t,s){return x(t,e.childNodes[s])})))return!1}return!0},O=function(t,e,s,i,n){if(void 0===n&&(n=!1),!t||!e)return!1;if(t.nodeName!==e.nodeName)return!1;if(["#text","#comment"].includes(t.nodeName))return!!n||t.data===e.data;if(t.nodeName in s)return!0;if(t.attributes&&e.attributes){if(t.attributes.id){if(t.attributes.id!==e.attributes.id)return!1;if("".concat(t.nodeName,"#").concat(t.attributes.id)in s)return!0}if(t.attributes.class&&t.attributes.class===e.attributes.class)if("".concat(t.nodeName,".").concat(t.attributes.class.replace(/ /g,"."))in s)return!0}if(i)return!0;var a=t.childNodes?t.childNodes.slice().reverse():[],o=e.childNodes?e.childNodes.slice().reverse():[];if(a.length!==o.length)return!1;if(n)return a.every((function(t,e){return t.nodeName===o[e].nodeName}));var r=D(a,o);return a.every((function(t,e){return O(t,o[e],r,!0,!0)}))},E=function(t,e){return u([],new Array(t),!0).map((function(){return e}))},V=function(t,e){for(var s=t.childNodes?t.childNodes:[],i=e.childNodes?e.childNodes:[],n=E(s.length,!1),a=E(i.length,!1),o=[],r=function(){return arguments[1]},l=!1,d=function(){var t=function(t,e,s,i){var n=0,a=[],o=t.length,r=e.length,l=u([],new Array(o+1),!0).map((function(){return[]})),d=D(t,e),c=o===r;c&&t.some((function(t,s){var i=w(t),n=w(e[s]);return i.length!==n.length?(c=!1,!0):(i.some((function(t,e){if(t!==n[e])return c=!1,!0})),!c||void 0)}));for(var h=0;h<o;h++)for(var p=t[h],f=0;f<r;f++){var m=e[f];s[h]||i[f]||!O(p,m,d,c)?l[h+1][f+1]=0:(l[h+1][f+1]=l[h][f]?l[h][f]+1:1,l[h+1][f+1]>=n&&(n=l[h+1][f+1],a=[h+1,f+1]))}return 0!==n&&{oldValue:a[0]-n,newValue:a[1]-n,length:n}}(s,i,n,a);t?(o.push(t),u([],new Array(t.length),!0).map(r).forEach((function(e){return function(t,e,s,i){t[s.oldValue+i]=!0,e[s.newValue+i]=!0}(n,a,t,e)}))):l=!0};!l;)d();return t.subsets=o,t.subsetsAge=100,o},$=function(){function t(){this.list=[]}return t.prototype.add=function(t){var e;(e=this.list).push.apply(e,t)},t.prototype.forEach=function(t){this.list.forEach((function(e){return t(e)}))},t}();function C(t,e){var s,i,n=t;for(e=e.slice();e.length>0;)i=e.splice(0,1)[0],s=n,n=n.childNodes?n.childNodes[i]:void 0;return{node:n,parentNode:s,nodeIndex:i}}function k(t,e,s){return e.forEach((function(e){!function(t,e,s){var i,n,a,o;if(![s._const.addElement,s._const.addTextElement].includes(e[s._const.action])){var r=C(t,e[s._const.route]);n=r.node,a=r.parentNode,o=r.nodeIndex}var l,d,c=[],h={diff:e,node:n};if(s.preVirtualDiffApply(h))return!0;switch(e[s._const.action]){case s._const.addAttribute:n.attributes||(n.attributes={}),n.attributes[e[s._const.name]]=e[s._const.value],"checked"===e[s._const.name]?n.checked=!0:"selected"===e[s._const.name]?n.selected=!0:"INPUT"===n.nodeName&&"value"===e[s._const.name]&&(n.value=e[s._const.value]);break;case s._const.modifyAttribute:n.attributes[e[s._const.name]]=e[s._const.newValue];break;case s._const.removeAttribute:delete n.attributes[e[s._const.name]],0===Object.keys(n.attributes).length&&delete n.attributes,"checked"===e[s._const.name]?n.checked=!1:"selected"===e[s._const.name]?delete n.selected:"INPUT"===n.nodeName&&"value"===e[s._const.name]&&delete n.value;break;case s._const.modifyTextElement:n.data=e[s._const.newValue],"TEXTAREA"===a.nodeName&&(a.value=e[s._const.newValue]);break;case s._const.modifyValue:n.value=e[s._const.newValue];break;case s._const.modifyComment:n.data=e[s._const.newValue];break;case s._const.modifyChecked:n.checked=e[s._const.newValue];break;case s._const.modifySelected:n.selected=e[s._const.newValue];break;case s._const.replaceElement:l=N(e[s._const.newValue]),a.childNodes[o]=l;break;case s._const.relocateGroup:n.childNodes.splice(e[s._const.from],e[s._const.groupLength]).reverse().forEach((function(t){return n.childNodes.splice(e[s._const.to],0,t)})),n.subsets&&n.subsets.forEach((function(t){if(e[s._const.from]<e[s._const.to]&&t.oldValue<=e[s._const.to]&&t.oldValue>e[s._const.from])t.oldValue-=e[s._const.groupLength],(i=t.oldValue+t.length-e[s._const.to])>0&&(c.push({oldValue:e[s._const.to]+e[s._const.groupLength],newValue:t.newValue+t.length-i,length:i}),t.length-=i);else if(e[s._const.from]>e[s._const.to]&&t.oldValue>e[s._const.to]&&t.oldValue<e[s._const.from]){var i;t.oldValue+=e[s._const.groupLength],(i=t.oldValue+t.length-e[s._const.to])>0&&(c.push({oldValue:e[s._const.to]+e[s._const.groupLength],newValue:t.newValue+t.length-i,length:i}),t.length-=i)}else t.oldValue===e[s._const.from]&&(t.oldValue=e[s._const.to])}));break;case s._const.removeElement:a.childNodes.splice(o,1),a.subsets&&a.subsets.forEach((function(t){t.oldValue>o?t.oldValue-=1:t.oldValue===o?t.delete=!0:t.oldValue<o&&t.oldValue+t.length>o&&(t.oldValue+t.length-1===o?t.length--:(c.push({newValue:t.newValue+o-t.oldValue,oldValue:o,length:t.length-o+t.oldValue-1}),t.length=o-t.oldValue))})),n=a;break;case s._const.addElement:var u=(d=e[s._const.route].slice()).splice(d.length-1,1)[0];n=null===(i=C(t,d))||void 0===i?void 0:i.node,l=N(e[s._const.element]),n.childNodes||(n.childNodes=[]),u>=n.childNodes.length?n.childNodes.push(l):n.childNodes.splice(u,0,l),n.subsets&&n.subsets.forEach((function(t){if(t.oldValue>=u)t.oldValue+=1;else if(t.oldValue<u&&t.oldValue+t.length>u){var e=t.oldValue+t.length-u;c.push({newValue:t.newValue+t.length-e,oldValue:u+1,length:e}),t.length-=e}}));break;case s._const.removeTextElement:a.childNodes.splice(o,1),"TEXTAREA"===a.nodeName&&delete a.value,a.subsets&&a.subsets.forEach((function(t){t.oldValue>o?t.oldValue-=1:t.oldValue===o?t.delete=!0:t.oldValue<o&&t.oldValue+t.length>o&&(t.oldValue+t.length-1===o?t.length--:(c.push({newValue:t.newValue+o-t.oldValue,oldValue:o,length:t.length-o+t.oldValue-1}),t.length=o-t.oldValue))})),n=a;break;case s._const.addTextElement:var p=(d=e[s._const.route].slice()).splice(d.length-1,1)[0];l={nodeName:"#text",data:e[s._const.value]},(n=C(t,d).node).childNodes||(n.childNodes=[]),p>=n.childNodes.length?n.childNodes.push(l):n.childNodes.splice(p,0,l),"TEXTAREA"===n.nodeName&&(n.value=e[s._const.newValue]),n.subsets&&n.subsets.forEach((function(t){if(t.oldValue>=p&&(t.oldValue+=1),t.oldValue<p&&t.oldValue+t.length>p){var e=t.oldValue+t.length-p;c.push({newValue:t.newValue+t.length-e,oldValue:p+1,length:e}),t.length-=e}}));break;default:console.log("unknown action")}n.subsets&&(n.subsets=n.subsets.filter((function(t){return!t.delete&&t.oldValue!==t.newValue})),c.length&&(n.subsets=n.subsets.concat(c))),s.postVirtualDiffApply({node:h.node,diff:h.diff,newNode:l})}(t,e,s)})),!0}function S(t,e){void 0===e&&(e={valueDiffing:!0});var s={nodeName:t.nodeName};if(f(t,"Text","Comment"))s.data=t.data;else{if(t.attributes&&t.attributes.length>0)s.attributes={},Array.prototype.slice.call(t.attributes).forEach((function(t){return s.attributes[t.name]=t.value}));if(t.childNodes&&t.childNodes.length>0)s.childNodes=[],Array.prototype.slice.call(t.childNodes).forEach((function(t){return s.childNodes.push(S(t,e))}));e.valueDiffing&&(f(t,"HTMLTextAreaElement")&&(s.value=t.value),f(t,"HTMLInputElement")&&["radio","checkbox"].includes(t.type.toLowerCase())&&void 0!==t.checked?s.checked=t.checked:f(t,"HTMLButtonElement","HTMLDataElement","HTMLInputElement","HTMLLIElement","HTMLMeterElement","HTMLOptionElement","HTMLProgressElement","HTMLParamElement")&&(s.value=t.value),f(t,"HTMLOptionElement")&&(s.selected=t.selected))}return s}var T=/<\s*\/*[a-zA-Z:_][a-zA-Z0-9:_\-.]*\s*(?:"[^"]*"['"]*|'[^']*'['"]*|[^'"/>])*\/*\s*>|<!--(?:.|\n|\r)*?-->/g,A=/\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;function L(t){return t.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")}var P={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,menuItem:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0},R=function(t,e){var s={nodeName:"",attributes:{}},i=!1,n=t.match(/<\/?([^\s]+?)[/\s>]/);if(n&&(s.nodeName=e||"svg"===n[1]?n[1]:n[1].toUpperCase(),(P[n[1]]||"/"===t.charAt(t.length-2))&&(i=!0),s.nodeName.startsWith("!--"))){var a=t.indexOf("--\x3e");return{type:"comment",node:{nodeName:"#comment",data:-1!==a?t.slice(4,a):""},voidElement:i}}for(var o=new RegExp(A),r=null,l=!1;!l;)if(null===(r=o.exec(t)))l=!0;else if(r[0].trim())if(r[1]){var d=r[1].trim(),c=[d,""];d.indexOf("=")>-1&&(c=d.split("=")),s.attributes[c[0]]=c[1],o.lastIndex--}else r[2]&&(s.attributes[r[2]]=r[3].trim().substring(1,r[3].length-1));return{type:"tag",node:s,voidElement:i}},H=function(t,e){void 0===e&&(e={valueDiffing:!0,caseSensitive:!1});var s,i=[],n=-1,a=[],o=!1;if(0!==t.indexOf("<")){var r=t.indexOf("<");i.push({nodeName:"#text",data:-1===r?t:t.substring(0,r)})}return t.replace(T,(function(r,l){var d="/"!==r.charAt(1),c=r.startsWith("\x3c!--"),h=l+r.length,u=t.charAt(h);if(c){var p=R(r,e.caseSensitive).node;if(n<0)return i.push(p),"";var f=a[n];return f&&p.nodeName&&(f.node.childNodes||(f.node.childNodes=[]),f.node.childNodes.push(p)),""}if(d){if("svg"===(s=R(r,e.caseSensitive||o)).node.nodeName&&(o=!0),n++,!s.voidElement&&u&&"<"!==u){s.node.childNodes||(s.node.childNodes=[]);var m=L(t.slice(h,t.indexOf("<",h)));s.node.childNodes.push({nodeName:"#text",data:m}),e.valueDiffing&&"TEXTAREA"===s.node.nodeName&&(s.node.value=m)}0===n&&s.node.nodeName&&i.push(s.node);var g=a[n-1];g&&s.node.nodeName&&(g.node.childNodes||(g.node.childNodes=[]),g.node.childNodes.push(s.node)),a[n]=s}if((!d||s.voidElement)&&(n>-1&&(s.voidElement||e.caseSensitive&&s.node.nodeName===r.slice(2,-1)||!e.caseSensitive&&s.node.nodeName.toUpperCase()===r.slice(2,-1).toUpperCase())&&--n>-1&&("svg"===s.node.nodeName&&(o=!1),s=a[n]),"<"!==u&&u)){var b=-1===n?i:a[n].node.childNodes||[],v=t.indexOf("<",h);m=L(t.slice(h,-1===v?void 0:v));b.push({nodeName:"#text",data:m})}return""})),i[0]},I=function(){function t(t,e,s){this.options=s,this.t1="undefined"!=typeof Element&&f(t,"Element")?S(t,this.options):"string"==typeof t?H(t,this.options):JSON.parse(JSON.stringify(t)),this.t2="undefined"!=typeof Element&&f(e,"Element")?S(e,this.options):"string"==typeof e?H(e,this.options):JSON.parse(JSON.stringify(e)),this.diffcount=0,this.foundAll=!1,this.debug&&(this.t1Orig="undefined"!=typeof Element&&f(t,"Element")?S(t,this.options):"string"==typeof t?H(t,this.options):JSON.parse(JSON.stringify(t)),this.t2Orig="undefined"!=typeof Element&&f(e,"Element")?S(e,this.options):"string"==typeof e?H(e,this.options):JSON.parse(JSON.stringify(e))),this.tracker=new $}return t.prototype.init=function(){return this.findDiffs(this.t1,this.t2)},t.prototype.findDiffs=function(t,e){var s;do{if(this.options.debug&&(this.diffcount+=1,this.diffcount>this.options.diffcap))throw new Error("surpassed diffcap:".concat(JSON.stringify(this.t1Orig)," -> ").concat(JSON.stringify(this.t2Orig)));0===(s=this.findNextDiff(t,e,[])).length&&(x(t,e)||(this.foundAll?console.error("Could not find remaining diffs!"):(this.foundAll=!0,M(t),s=this.findNextDiff(t,e,[])))),s.length>0&&(this.foundAll=!1,this.tracker.add(s),k(t,s,this.options))}while(s.length>0);return this.tracker.list},t.prototype.findNextDiff=function(t,e,s){var i,n;if(this.options.maxDepth&&s.length>this.options.maxDepth)return[];if(!t.outerDone){if(i=this.findOuterDiff(t,e,s),this.options.filterOuterDiff&&(n=this.options.filterOuterDiff(t,e,i))&&(i=n),i.length>0)return t.outerDone=!0,i;t.outerDone=!0}if(Object.prototype.hasOwnProperty.call(t,"data"))return[];if(!t.innerDone){if((i=this.findInnerDiff(t,e,s)).length>0)return i;t.innerDone=!0}if(this.options.valueDiffing&&!t.valueDone){if((i=this.findValueDiff(t,e,s)).length>0)return t.valueDone=!0,i;t.valueDone=!0}return[]},t.prototype.findOuterDiff=function(t,e,s){var i,n,a,o,r,l,d=[];if(t.nodeName!==e.nodeName){if(!s.length)throw new Error("Top level nodes have to be of the same kind.");return[(new p).setValue(this.options._const.action,this.options._const.replaceElement).setValue(this.options._const.oldValue,N(t)).setValue(this.options._const.newValue,N(e)).setValue(this.options._const.route,s)]}if(s.length&&this.options.diffcap<Math.abs((t.childNodes||[]).length-(e.childNodes||[]).length))return[(new p).setValue(this.options._const.action,this.options._const.replaceElement).setValue(this.options._const.oldValue,N(t)).setValue(this.options._const.newValue,N(e)).setValue(this.options._const.route,s)];if(Object.prototype.hasOwnProperty.call(t,"data")&&t.data!==e.data)return"#text"===t.nodeName?[(new p).setValue(this.options._const.action,this.options._const.modifyTextElement).setValue(this.options._const.route,s).setValue(this.options._const.oldValue,t.data).setValue(this.options._const.newValue,e.data)]:[(new p).setValue(this.options._const.action,this.options._const.modifyComment).setValue(this.options._const.route,s).setValue(this.options._const.oldValue,t.data).setValue(this.options._const.newValue,e.data)];for(n=t.attributes?Object.keys(t.attributes).sort():[],a=e.attributes?Object.keys(e.attributes).sort():[],o=n.length,l=0;l<o;l++)i=n[l],-1===(r=a.indexOf(i))?d.push((new p).setValue(this.options._const.action,this.options._const.removeAttribute).setValue(this.options._const.route,s).setValue(this.options._const.name,i).setValue(this.options._const.value,t.attributes[i])):(a.splice(r,1),t.attributes[i]!==e.attributes[i]&&d.push((new p).setValue(this.options._const.action,this.options._const.modifyAttribute).setValue(this.options._const.route,s).setValue(this.options._const.name,i).setValue(this.options._const.oldValue,t.attributes[i]).setValue(this.options._const.newValue,e.attributes[i])));for(o=a.length,l=0;l<o;l++)i=a[l],d.push((new p).setValue(this.options._const.action,this.options._const.addAttribute).setValue(this.options._const.route,s).setValue(this.options._const.name,i).setValue(this.options._const.value,e.attributes[i]));return d},t.prototype.findInnerDiff=function(t,e,s){var i=t.childNodes?t.childNodes.slice():[],n=e.childNodes?e.childNodes.slice():[],a=Math.max(i.length,n.length),o=Math.abs(i.length-n.length),r=[],l=0;if(!this.options.maxChildCount||a<this.options.maxChildCount){var d=Boolean(t.subsets&&t.subsetsAge--),c=d?t.subsets:t.childNodes&&e.childNodes?V(t,e):[];if(c.length>0&&(r=this.attemptGroupRelocation(t,e,c,s,d)).length>0)return r}for(var h=0;h<a;h+=1){var u=i[h],f=n[h];o&&(u&&!f?"#text"===u.nodeName?(r.push((new p).setValue(this.options._const.action,this.options._const.removeTextElement).setValue(this.options._const.route,s.concat(l)).setValue(this.options._const.value,u.data)),l-=1):(r.push((new p).setValue(this.options._const.action,this.options._const.removeElement).setValue(this.options._const.route,s.concat(l)).setValue(this.options._const.element,N(u))),l-=1):f&&!u&&("#text"===f.nodeName?r.push((new p).setValue(this.options._const.action,this.options._const.addTextElement).setValue(this.options._const.route,s.concat(l)).setValue(this.options._const.value,f.data)):r.push((new p).setValue(this.options._const.action,this.options._const.addElement).setValue(this.options._const.route,s.concat(l)).setValue(this.options._const.element,N(f))))),u&&f&&(!this.options.maxChildCount||a<this.options.maxChildCount?r=r.concat(this.findNextDiff(u,f,s.concat(l))):x(u,f)||(i.length>n.length?("#text"===u.nodeName?r.push((new p).setValue(this.options._const.action,this.options._const.removeTextElement).setValue(this.options._const.route,s.concat(l)).setValue(this.options._const.value,u.data)):r.push((new p).setValue(this.options._const.action,this.options._const.removeElement).setValue(this.options._const.element,N(u)).setValue(this.options._const.route,s.concat(l))),i.splice(h,1),h-=1,l-=1,o-=1):i.length<n.length?(r=r.concat([(new p).setValue(this.options._const.action,this.options._const.addElement).setValue(this.options._const.element,N(f)).setValue(this.options._const.route,s.concat(l))]),i.splice(h,0,N(f)),o-=1):r=r.concat([(new p).setValue(this.options._const.action,this.options._const.replaceElement).setValue(this.options._const.oldValue,N(u)).setValue(this.options._const.newValue,N(f)).setValue(this.options._const.route,s.concat(l))]))),l+=1}return t.innerDone=!0,r},t.prototype.attemptGroupRelocation=function(t,e,s,i,n){for(var a,o,r,l,d,c=function(t,e,s){var i=t.childNodes?E(t.childNodes.length,!0):[],n=e.childNodes?E(e.childNodes.length,!0):[],a=0;return s.forEach((function(t){for(var e=t.oldValue+t.length,s=t.newValue+t.length,o=t.oldValue;o<e;o+=1)i[o]=a;for(o=t.newValue;o<s;o+=1)n[o]=a;a+=1})),{gaps1:i,gaps2:n}}(t,e,s),h=c.gaps1,u=c.gaps2,f=t.childNodes.slice(),m=e.childNodes.slice(),g=Math.min(h.length,u.length),b=[],v=0,_=0;v<g;_+=1,v+=1)if(!n||!0!==h[v]&&!0!==u[v]){if(!0===h[_])if("#text"===(l=f[_]).nodeName)if("#text"===m[v].nodeName){if(l.data!==m[v].data){for(var w=_;f.length>w+1&&"#text"===f[w+1].nodeName;)if(w+=1,m[v].data===f[w].data){d=!0;break}d||b.push((new p).setValue(this.options._const.action,this.options._const.modifyTextElement).setValue(this.options._const.route,i.concat(_)).setValue(this.options._const.oldValue,l.data).setValue(this.options._const.newValue,m[v].data))}}else b.push((new p).setValue(this.options._const.action,this.options._const.removeTextElement).setValue(this.options._const.route,i.concat(_)).setValue(this.options._const.value,l.data)),h.splice(_,1),f.splice(_,1),g=Math.min(h.length,u.length),_-=1,v-=1;else!0===u[v]?b.push((new p).setValue(this.options._const.action,this.options._const.replaceElement).setValue(this.options._const.oldValue,N(l)).setValue(this.options._const.newValue,N(m[v])).setValue(this.options._const.route,i.concat(_))):(b.push((new p).setValue(this.options._const.action,this.options._const.removeElement).setValue(this.options._const.route,i.concat(_)).setValue(this.options._const.element,N(l))),h.splice(_,1),f.splice(_,1),g=Math.min(h.length,u.length),_-=1,v-=1);else if(!0===u[v])"#text"===(l=m[v]).nodeName?(b.push((new p).setValue(this.options._const.action,this.options._const.addTextElement).setValue(this.options._const.route,i.concat(_)).setValue(this.options._const.value,l.data)),h.splice(_,0,!0),f.splice(_,0,{nodeName:"#text",data:l.data}),g=Math.min(h.length,u.length)):(b.push((new p).setValue(this.options._const.action,this.options._const.addElement).setValue(this.options._const.route,i.concat(_)).setValue(this.options._const.element,N(l))),h.splice(_,0,!0),f.splice(_,0,N(l)),g=Math.min(h.length,u.length));else if(h[_]!==u[v]){if(b.length>0)return b;if(r=s[h[_]],(o=Math.min(r.newValue,f.length-r.length))!==r.oldValue){a=!1;for(var y=0;y<r.length;y+=1)O(f[o+y],f[r.oldValue+y],{},!1,!0)||(a=!0);if(a)return[(new p).setValue(this.options._const.action,this.options._const.relocateGroup).setValue(this.options._const.groupLength,r.length).setValue(this.options._const.from,r.oldValue).setValue(this.options._const.to,o).setValue(this.options._const.route,i)]}}}else;return b},t.prototype.findValueDiff=function(t,e,s){var i=[];return t.selected!==e.selected&&i.push((new p).setValue(this.options._const.action,this.options._const.modifySelected).setValue(this.options._const.oldValue,t.selected).setValue(this.options._const.newValue,e.selected).setValue(this.options._const.route,s)),(t.value||e.value)&&t.value!==e.value&&"OPTION"!==t.nodeName&&i.push((new p).setValue(this.options._const.action,this.options._const.modifyValue).setValue(this.options._const.oldValue,t.value||"").setValue(this.options._const.newValue,e.value||"").setValue(this.options._const.route,s)),t.checked!==e.checked&&i.push((new p).setValue(this.options._const.action,this.options._const.modifyChecked).setValue(this.options._const.oldValue,t.checked).setValue(this.options._const.newValue,e.checked).setValue(this.options._const.route,s)),i},t}(),Y={debug:!1,diffcap:10,maxDepth:!1,maxChildCount:50,valueDiffing:!0,textDiff:function(t,e,s,i){t.data=i},preVirtualDiffApply:function(){},postVirtualDiffApply:function(){},preDiffApply:function(){},postDiffApply:function(){},filterOuterDiff:null,compress:!1,_const:!1,document:!("undefined"==typeof window||!window.document)&&window.document,components:[]},j=function(){function t(t){if(void 0===t&&(t={}),Object.entries(Y).forEach((function(e){var s=e[0],i=e[1];Object.prototype.hasOwnProperty.call(t,s)||(t[s]=i)})),!t._const){var e=["addAttribute","modifyAttribute","removeAttribute","modifyTextElement","relocateGroup","removeElement","addElement","removeTextElement","addTextElement","replaceElement","modifyValue","modifyChecked","modifySelected","modifyComment","action","route","oldValue","newValue","element","group","groupLength","from","to","name","value","data","attributes","nodeName","childNodes","checked","selected"],s={};t.compress?e.forEach((function(t,e){return s[t]=e})):e.forEach((function(t){return s[t]=t})),t._const=s}this.options=t}return t.prototype.apply=function(t,e){return function(t,e,s){return e.every((function(e){return b(t,e,s)}))}(t,e,this.options)},t.prototype.undo=function(t,e){return _(t,e,this.options)},t.prototype.diff=function(t,e){return new I(t,e,this.options).init()},t}();const q=(t,e,s,{classes:i,format:n,hiddenHeader:a,sortable:o,scrollY:r,type:l},{noColumnWidths:d,unhideHeader:h})=>({nodeName:"TR",childNodes:t.map(((t,u)=>{const p=e[u]||{type:l,format:n,sortable:!0,searchable:!0};if(p.hidden)return;const f=t.attributes?{...t.attributes}:{};if(p.sortable&&o&&(!r.length||h)&&(p.filter?f["data-filterable"]="true":f["data-sortable"]="true"),p.headerClass&&(f.class=c(f.class,p.headerClass)),s.sort&&s.sort.column===u){const t="asc"===s.sort.dir?i.ascending:i.descending;f.class=c(f.class,t),f["aria-sort"]="asc"===s.sort.dir?"ascending":"descending"}else s.filters[u]&&(f.class=c(f.class,i.filterActive));if(s.widths[u]&&!d){const t=`width: ${s.widths[u]}%;`;f.style=c(f.style,t)}if(r.length&&!h){const t="padding-bottom: 0;padding-top: 0;border: 0;";f.style=c(f.style,t)}const m="html"===t.type?t.data:[{nodeName:"#text",data:t.text??String(t.data)}];return{nodeName:"TH",attributes:f,childNodes:!a&&!r.length||h?p.sortable&&o?[{nodeName:"BUTTON",attributes:{class:p.filter?i.filter:i.sorter},childNodes:m}]:m:[{nodeName:"#text",data:""}]}})).filter((t=>t))}),F=(t,e,s,i,a,o,{classes:r,hiddenHeader:l,header:d,footer:h,format:u,sortable:p,scrollY:f,type:m,rowRender:g,tabIndex:b},{noColumnWidths:v,unhideHeader:_,renderHeader:w},y,D)=>{const M={nodeName:"TABLE",attributes:{...t},childNodes:[{nodeName:"TBODY",childNodes:s.map((({row:t,index:e})=>{const s={nodeName:"TR",attributes:{...t.attributes,"data-index":String(e)},childNodes:t.cells.map(((t,s)=>{const o=i[s]||{type:m,format:u,sortable:!0,searchable:!0};if(o.hidden)return;const r={nodeName:"TD",attributes:t.attributes?{...t.attributes}:{},childNodes:"html"===o.type?t.data:[{nodeName:"#text",data:n(t)}]};if(d||h||!a.widths[s]||v||(r.attributes.style=c(r.attributes.style,`width: ${a.widths[s]}%;`)),o.cellClass&&(r.attributes.class=c(r.attributes.class,o.cellClass)),o.render){const i=o.render(t.data,r,e,s);if(i){if("string"!=typeof i)return i;{const t=H(`<td>${i}</td>`);1===t.childNodes.length&&["#text","#comment"].includes(t.childNodes[0].nodeName)?r.childNodes[0].data=i:r.childNodes=t.childNodes}}}return r})).filter((t=>t))};if(e===o&&(s.attributes.class=c(s.attributes.class,r.cursor)),g){const i=g(t,s,e);if(i){if("string"!=typeof i)return i;{const t=H(`<tr>${i}</tr>`);!t.childNodes||1===t.childNodes.length&&["#text","#comment"].includes(t.childNodes[0].nodeName)?s.childNodes[0].data=i:s.childNodes=t.childNodes}}}return s}))}]};if(M.attributes.class=c(M.attributes.class,r.table),d||h||w){const t=q(e,i,a,{classes:r,hiddenHeader:l,sortable:p,scrollY:f},{noColumnWidths:v,unhideHeader:_});if(d||w){const e={nodeName:"THEAD",childNodes:[t]};!f.length&&!l||_||(e.attributes={style:"height: 0px;"}),M.childNodes.unshift(e)}if(h){const e={nodeName:"TFOOT",childNodes:[d?structuredClone(t):t]};!f.length&&!l||_||(e.attributes={style:"height: 0px;"}),M.childNodes.push(e)}}return y.forEach((t=>M.childNodes.push(t))),D.forEach((t=>M.childNodes.push(t))),!1!==b&&(M.attributes.tabindex=String(b)),M};"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self&&self;function B(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var z={exports:{}},U=B(z.exports=function(){var t=1e3,e=6e4,s=36e5,i="millisecond",n="second",a="minute",o="hour",r="day",l="week",d="month",c="quarter",h="year",u="date",p="Invalid Date",f=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,m=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,g={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],s=t%100;return"["+t+(e[(s-20)%10]||e[s]||e[0])+"]"}},b=function(t,e,s){var i=String(t);return!i||i.length>=e?t:""+Array(e+1-i.length).join(s)+t},v={s:b,z:function(t){var e=-t.utcOffset(),s=Math.abs(e),i=Math.floor(s/60),n=s%60;return(e<=0?"+":"-")+b(i,2,"0")+":"+b(n,2,"0")},m:function t(e,s){if(e.date()<s.date())return-t(s,e);var i=12*(s.year()-e.year())+(s.month()-e.month()),n=e.clone().add(i,d),a=s-n<0,o=e.clone().add(i+(a?-1:1),d);return+(-(i+(s-n)/(a?n-o:o-n))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:d,y:h,w:l,d:r,D:u,h:o,m:a,s:n,ms:i,Q:c}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},_="en",w={};w[_]=g;var y="$isDayjsObject",D=function(t){return t instanceof O||!(!t||!t[y])},M=function t(e,s,i){var n;if(!e)return _;if("string"==typeof e){var a=e.toLowerCase();w[a]&&(n=a),s&&(w[a]=s,n=a);var o=e.split("-");if(!n&&o.length>1)return t(o[0])}else{var r=e.name;w[r]=e,n=r}return!i&&n&&(_=n),n||!i&&_},N=function(t,e){if(D(t))return t.clone();var s="object"==typeof e?e:{};return s.date=t,s.args=arguments,new O(s)},x=v;x.l=M,x.i=D,x.w=function(t,e){return N(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var O=function(){function g(t){this.$L=M(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[y]=!0}var b=g.prototype;return b.parse=function(t){this.$d=function(t){var e=t.date,s=t.utc;if(null===e)return new Date(NaN);if(x.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var i=e.match(f);if(i){var n=i[2]-1||0,a=(i[7]||"0").substring(0,3);return s?new Date(Date.UTC(i[1],n,i[3]||1,i[4]||0,i[5]||0,i[6]||0,a)):new Date(i[1],n,i[3]||1,i[4]||0,i[5]||0,i[6]||0,a)}}return new Date(e)}(t),this.init()},b.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},b.$utils=function(){return x},b.isValid=function(){return!(this.$d.toString()===p)},b.isSame=function(t,e){var s=N(t);return this.startOf(e)<=s&&s<=this.endOf(e)},b.isAfter=function(t,e){return N(t)<this.startOf(e)},b.isBefore=function(t,e){return this.endOf(e)<N(t)},b.$g=function(t,e,s){return x.u(t)?this[e]:this.set(s,t)},b.unix=function(){return Math.floor(this.valueOf()/1e3)},b.valueOf=function(){return this.$d.getTime()},b.startOf=function(t,e){var s=this,i=!!x.u(e)||e,c=x.p(t),p=function(t,e){var n=x.w(s.$u?Date.UTC(s.$y,e,t):new Date(s.$y,e,t),s);return i?n:n.endOf(r)},f=function(t,e){return x.w(s.toDate()[t].apply(s.toDate("s"),(i?[0,0,0,0]:[23,59,59,999]).slice(e)),s)},m=this.$W,g=this.$M,b=this.$D,v="set"+(this.$u?"UTC":"");switch(c){case h:return i?p(1,0):p(31,11);case d:return i?p(1,g):p(0,g+1);case l:var _=this.$locale().weekStart||0,w=(m<_?m+7:m)-_;return p(i?b-w:b+(6-w),g);case r:case u:return f(v+"Hours",0);case o:return f(v+"Minutes",1);case a:return f(v+"Seconds",2);case n:return f(v+"Milliseconds",3);default:return this.clone()}},b.endOf=function(t){return this.startOf(t,!1)},b.$set=function(t,e){var s,l=x.p(t),c="set"+(this.$u?"UTC":""),p=(s={},s[r]=c+"Date",s[u]=c+"Date",s[d]=c+"Month",s[h]=c+"FullYear",s[o]=c+"Hours",s[a]=c+"Minutes",s[n]=c+"Seconds",s[i]=c+"Milliseconds",s)[l],f=l===r?this.$D+(e-this.$W):e;if(l===d||l===h){var m=this.clone().set(u,1);m.$d[p](f),m.init(),this.$d=m.set(u,Math.min(this.$D,m.daysInMonth())).$d}else p&&this.$d[p](f);return this.init(),this},b.set=function(t,e){return this.clone().$set(t,e)},b.get=function(t){return this[x.p(t)]()},b.add=function(i,c){var u,p=this;i=Number(i);var f=x.p(c),m=function(t){var e=N(p);return x.w(e.date(e.date()+Math.round(t*i)),p)};if(f===d)return this.set(d,this.$M+i);if(f===h)return this.set(h,this.$y+i);if(f===r)return m(1);if(f===l)return m(7);var g=(u={},u[a]=e,u[o]=s,u[n]=t,u)[f]||1,b=this.$d.getTime()+i*g;return x.w(b,this)},b.subtract=function(t,e){return this.add(-1*t,e)},b.format=function(t){var e=this,s=this.$locale();if(!this.isValid())return s.invalidDate||p;var i=t||"YYYY-MM-DDTHH:mm:ssZ",n=x.z(this),a=this.$H,o=this.$m,r=this.$M,l=s.weekdays,d=s.months,c=s.meridiem,h=function(t,s,n,a){return t&&(t[s]||t(e,i))||n[s].slice(0,a)},u=function(t){return x.s(a%12||12,t,"0")},f=c||function(t,e,s){var i=t<12?"AM":"PM";return s?i.toLowerCase():i};return i.replace(m,(function(t,i){return i||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return x.s(e.$y,4,"0");case"M":return r+1;case"MM":return x.s(r+1,2,"0");case"MMM":return h(s.monthsShort,r,d,3);case"MMMM":return h(d,r);case"D":return e.$D;case"DD":return x.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return h(s.weekdaysMin,e.$W,l,2);case"ddd":return h(s.weekdaysShort,e.$W,l,3);case"dddd":return l[e.$W];case"H":return String(a);case"HH":return x.s(a,2,"0");case"h":return u(1);case"hh":return u(2);case"a":return f(a,o,!0);case"A":return f(a,o,!1);case"m":return String(o);case"mm":return x.s(o,2,"0");case"s":return String(e.$s);case"ss":return x.s(e.$s,2,"0");case"SSS":return x.s(e.$ms,3,"0");case"Z":return n}return null}(t)||n.replace(":","")}))},b.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},b.diff=function(i,u,p){var f,m=this,g=x.p(u),b=N(i),v=(b.utcOffset()-this.utcOffset())*e,_=this-b,w=function(){return x.m(m,b)};switch(g){case h:f=w()/12;break;case d:f=w();break;case c:f=w()/3;break;case l:f=(_-v)/6048e5;break;case r:f=(_-v)/864e5;break;case o:f=_/s;break;case a:f=_/e;break;case n:f=_/t;break;default:f=_}return p?f:x.a(f)},b.daysInMonth=function(){return this.endOf(d).$D},b.$locale=function(){return w[this.$L]},b.locale=function(t,e){if(!t)return this.$L;var s=this.clone(),i=M(t,e,!0);return i&&(s.$L=i),s},b.clone=function(){return x.w(this.$d,this)},b.toDate=function(){return new Date(this.valueOf())},b.toJSON=function(){return this.isValid()?this.toISOString():null},b.toISOString=function(){return this.$d.toISOString()},b.toString=function(){return this.$d.toUTCString()},g}(),E=O.prototype;return N.prototype=E,[["$ms",i],["$s",n],["$m",a],["$H",o],["$W",r],["$M",d],["$y",h],["$D",u]].forEach((function(t){E[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),N.extend=function(t,e){return t.$i||(t(e,O,N),t.$i=!0),N},N.locale=M,N.isDayjs=D,N.unix=function(t){return N(1e3*t)},N.en=w[_],N.Ls=w,N.p={},N}()),W={exports:{}},J=B(W.exports=function(){var t={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},e=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,s=/\d\d/,i=/\d\d?/,n=/\d*[^-_:/,()\s\d]+/,a={},o=function(t){return(t=+t)+(t>68?1900:2e3)},r=function(t){return function(e){this[t]=+e}},l=[/[+-]\d\d:?(\d\d)?|Z/,function(t){(this.zone||(this.zone={})).offset=function(t){if(!t)return 0;if("Z"===t)return 0;var e=t.match(/([+-]|\d\d)/g),s=60*e[1]+(+e[2]||0);return 0===s?0:"+"===e[0]?-s:s}(t)}],d=function(t){var e=a[t];return e&&(e.indexOf?e:e.s.concat(e.f))},c=function(t,e){var s,i=a.meridiem;if(i){for(var n=1;n<=24;n+=1)if(t.indexOf(i(n,0,e))>-1){s=n>12;break}}else s=t===(e?"pm":"PM");return s},h={A:[n,function(t){this.afternoon=c(t,!1)}],a:[n,function(t){this.afternoon=c(t,!0)}],S:[/\d/,function(t){this.milliseconds=100*+t}],SS:[s,function(t){this.milliseconds=10*+t}],SSS:[/\d{3}/,function(t){this.milliseconds=+t}],s:[i,r("seconds")],ss:[i,r("seconds")],m:[i,r("minutes")],mm:[i,r("minutes")],H:[i,r("hours")],h:[i,r("hours")],HH:[i,r("hours")],hh:[i,r("hours")],D:[i,r("day")],DD:[s,r("day")],Do:[n,function(t){var e=a.ordinal,s=t.match(/\d+/);if(this.day=s[0],e)for(var i=1;i<=31;i+=1)e(i).replace(/\[|\]/g,"")===t&&(this.day=i)}],M:[i,r("month")],MM:[s,r("month")],MMM:[n,function(t){var e=d("months"),s=(d("monthsShort")||e.map((function(t){return t.slice(0,3)}))).indexOf(t)+1;if(s<1)throw new Error;this.month=s%12||s}],MMMM:[n,function(t){var e=d("months").indexOf(t)+1;if(e<1)throw new Error;this.month=e%12||e}],Y:[/[+-]?\d+/,r("year")],YY:[s,function(t){this.year=o(t)}],YYYY:[/\d{4}/,r("year")],Z:l,ZZ:l};function u(s){var i,n;i=s,n=a&&a.formats;for(var o=(s=i.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(e,s,i){var a=i&&i.toUpperCase();return s||n[i]||t[i]||n[a].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(t,e,s){return e||s.slice(1)}))}))).match(e),r=o.length,l=0;l<r;l+=1){var d=o[l],c=h[d],u=c&&c[0],p=c&&c[1];o[l]=p?{regex:u,parser:p}:d.replace(/^\[|\]$/g,"")}return function(t){for(var e={},s=0,i=0;s<r;s+=1){var n=o[s];if("string"==typeof n)i+=n.length;else{var a=n.regex,l=n.parser,d=t.slice(i),c=a.exec(d)[0];l.call(e,c),t=t.replace(c,"")}}return function(t){var e=t.afternoon;if(void 0!==e){var s=t.hours;e?s<12&&(t.hours+=12):12===s&&(t.hours=0),delete t.afternoon}}(e),e}}return function(t,e,s){s.p.customParseFormat=!0,t&&t.parseTwoDigitYear&&(o=t.parseTwoDigitYear);var i=e.prototype,n=i.parse;i.parse=function(t){var e=t.date,i=t.utc,o=t.args;this.$u=i;var r=o[1];if("string"==typeof r){var l=!0===o[2],d=!0===o[3],c=l||d,h=o[2];d&&(h=o[2]),a=this.$locale(),!l&&h&&(a=s.Ls[h]),this.$d=function(t,e,s){try{if(["x","X"].indexOf(e)>-1)return new Date(("X"===e?1e3:1)*t);var i=u(e)(t),n=i.year,a=i.month,o=i.day,r=i.hours,l=i.minutes,d=i.seconds,c=i.milliseconds,h=i.zone,p=new Date,f=o||(n||a?1:p.getDate()),m=n||p.getFullYear(),g=0;n&&!a||(g=a>0?a-1:p.getMonth());var b=r||0,v=l||0,_=d||0,w=c||0;return h?new Date(Date.UTC(m,g,f,b,v,_,w+60*h.offset*1e3)):s?new Date(Date.UTC(m,g,f,b,v,_,w)):new Date(m,g,f,b,v,_,w)}catch(t){return new Date("")}}(e,r,i),this.init(),h&&!0!==h&&(this.$L=this.locale(h).$L),c&&e!=this.format(r)&&(this.$d=new Date("")),a={}}else if(r instanceof Array)for(var p=r.length,f=1;f<=p;f+=1){o[1]=r[f-1];var m=s.apply(this,o);if(m.isValid()){this.$d=m.$d,this.$L=m.$L,this.init();break}f===p&&(this.$d=new Date(""))}else n.call(this,t)}}}());U.extend(J);const Q=(t,e)=>{let s;if(e)switch(e){case"ISO_8601":s=t;break;case"RFC_2822":s=U(t.slice(5),"DD MMM YYYY HH:mm:ss ZZ").unix();break;case"MYSQL":s=U(t,"YYYY-MM-DD hh:mm:ss").unix();break;case"UNIX":s=U(t).unix();break;default:s=U(t,e,!0).valueOf()}return s},X=(t,e)=>{if(t?.constructor===Object&&Object.prototype.hasOwnProperty.call(t,"data")&&!Object.keys(t).find((t=>!["text","order","data","attributes"].includes(t))))return t;const s={data:t};switch(e.type){case"string":"string"!=typeof t&&(s.text=String(s.data),s.order=s.text);break;case"date":e.format&&(s.order=Q(String(s.data),e.format));break;case"number":s.text=String(s.data),s.data=parseFloat(s.data),s.order=s.data;break;case"html":{const t=Array.isArray(s.data)?{nodeName:"TD",childNodes:s.data}:H(`<td>${String(s.data)}</td>`);s.data=t.childNodes||[];const e=i(t);s.text=e,s.order=e;break}case"boolean":"string"==typeof s.data&&(s.data=s.data.toLowerCase().trim()),s.data=!["false",!1,null,void 0,0].includes(s.data),s.order=s.data?1:0,s.text=String(s.data);break;case"other":s.text="",s.order=0;break;default:s.text=JSON.stringify(s.data)}return s},Z=t=>{if(t instanceof Object&&t.constructor===Object&&t.hasOwnProperty("data")&&("string"==typeof t.text||"string"==typeof t.data))return t;const e={data:t};if("string"==typeof t){if(t.length){const s=H(`<th>${t}</th>`);if(s.childNodes&&(1!==s.childNodes.length||"#text"!==s.childNodes[0].nodeName)){e.data=s.childNodes,e.type="html";const t=i(s);e.text=t}}}else[null,void 0].includes(t)?e.text="":e.text=JSON.stringify(t);return e},G=(t,e=void 0,s,n,a)=>{const o={data:[],headings:[]};if(t.headings)o.headings=t.headings.map((t=>Z(t)));else if(e?.tHead)o.headings=Array.from(e.tHead.querySelectorAll("th")).map(((t,e)=>{const o=(t=>{const e=S(t,{valueDiffing:!1});let s;return s=!e.childNodes||1===e.childNodes.length&&"#text"===e.childNodes[0].nodeName?{data:t.innerText,type:"string"}:{data:e.childNodes,type:"html",text:i(e)},s.attributes=e.attributes,s})(t);s[e]||(s[e]={type:n,format:a,searchable:!0,sortable:!0});const r=s[e];return"false"!==t.dataset.sortable?.trim().toLowerCase()&&"false"!==t.dataset.sort?.trim().toLowerCase()||(r.sortable=!1),"false"===t.dataset.searchable?.trim().toLowerCase()&&(r.searchable=!1),"true"!==t.dataset.hidden?.trim().toLowerCase()&&"true"!==t.getAttribute("hidden")?.trim().toLowerCase()||(r.hidden=!0),["number","string","html","date","boolean","other"].includes(t.dataset.type)&&(r.type=t.dataset.type,"date"===r.type&&t.dataset.format&&(r.format=t.dataset.format)),o}));else if(t.data?.length){const e=t.data[0],s=Array.isArray(e)?e:e.cells;o.headings=s.map((t=>Z("")))}else e?.tBodies.length&&(o.headings=Array.from(e.tBodies[0].rows[0].cells).map((t=>Z(""))));for(let t=0;t<o.headings.length;t++)s[t]||(s[t]={type:n,format:a,sortable:!0,searchable:!0});if(t.data){const e=o.headings.map((t=>t.data?String(t.data):t.text));o.data=t.data.map((t=>{let i,n;return Array.isArray(t)?(i={},n=t):t.hasOwnProperty("cells")&&Object.keys(t).every((t=>["cells","attributes"].includes(t)))?(i=t.attributes,n=t.cells):(i={},n=[],Object.entries(t).forEach((([t,s])=>{const i=e.indexOf(t);i>-1&&(n[i]=s)}))),{attributes:i,cells:n.map(((t,e)=>X(t,s[e])))}}))}else e?.tBodies?.length&&(o.data=Array.from(e.tBodies[0].rows).map((t=>({attributes:r(t.attributes),cells:Array.from(t.cells).map(((t,e)=>{const i=t.dataset.content?X(t.dataset.content,s[e]):((t,e)=>{let s;switch(e.type){case"string":s={data:t.innerText};break;case"date":{const i=t.innerText;s={data:i,order:Q(i,e.format)};break}case"number":{const e=parseFloat(t.innerText);s={data:e,order:e,text:t.innerText};break}case"boolean":{const e=!["false","0","null","undefined"].includes(t.innerText.toLowerCase().trim());s={data:e,text:e?"1":"0",order:e?1:0};break}default:s={data:S(t,{valueDiffing:!1}).childNodes||[],text:t.innerText,order:t.innerText}}return s.attributes=r(t.attributes),s})(t,s[e]);return t.dataset.order&&(i.order=isNaN(parseFloat(t.dataset.order))?t.dataset.order:parseFloat(t.dataset.order)),i}))}))));if(o.data.length&&o.data[0].cells.length!==o.headings.length)throw new Error("Data heading length mismatch.");return o};class K{cursor;dt;constructor(t){this.dt=t,this.cursor=!1}setCursor(t=!1){if(t===this.cursor)return;const e=this.cursor;if(this.cursor=t,this.dt._renderTable(),!1!==t&&this.dt.options.scrollY){const t=l(this.dt.options.classes.cursor),e=this.dt.dom.querySelector(`tr${t}`);e&&e.scrollIntoView({block:"nearest"})}this.dt.emit("datatable.cursormove",this.cursor,e)}add(t){if(!Array.isArray(t)||t.length<1)return;const e={cells:t.map(((t,e)=>{const s=this.dt.columns.settings[e];return X(t,s)}))};this.dt.data.data.push(e),this.dt.hasRows=!0,this.dt.update(!0)}remove(t){if(!Array.isArray(t))return this.remove([t]);this.dt.data.data=this.dt.data.data.filter(((e,s)=>!t.includes(s))),this.dt.data.data.length||(this.dt.hasRows=!1),this.dt.update(!0)}findRowIndex(t,e){return this.dt.data.data.findIndex((s=>{const i=s.cells[t];return n(i).toLowerCase().includes(String(e).toLowerCase())}))}findRow(t,e){const s=this.findRowIndex(t,e);if(s<0)return{index:-1,row:null,cols:[]};const i=this.dt.data.data[s],n=i.cells.map((t=>t.data));return{index:s,row:i,cols:n}}updateRow(t,e){const s={cells:e.map(((t,e)=>{const s=this.dt.columns.settings[e];return X(t,s)}))};this.dt.data.data.splice(t,1,s),this.dt.update(!0)}}class tt{dt;settings;_state;constructor(t){this.dt=t,this.init()}init(){[this.settings,this._state]=((t=[],e,s)=>{let i=[],n=!1;const a=[];return t.forEach((t=>{(Array.isArray(t.select)?t.select:[t.select]).forEach((o=>{i[o]?t.type&&(i[o].type=t.type):i[o]={type:t.type||e,sortable:!0,searchable:!0};const r=i[o];t.render&&(r.render=t.render),t.format?r.format=t.format:"date"===t.type&&(r.format=s),t.cellClass&&(r.cellClass=t.cellClass),t.headerClass&&(r.headerClass=t.headerClass),t.locale&&(r.locale=t.locale),!1===t.sortable?r.sortable=!1:(t.numeric&&(r.numeric=t.numeric),t.caseFirst&&(r.caseFirst=t.caseFirst)),!1===t.searchable?r.searchable=!1:t.sensitivity&&(r.sensitivity=t.sensitivity),(r.searchable||r.sortable)&&void 0!==t.ignorePunctuation&&(r.ignorePunctuation=t.ignorePunctuation),t.hidden&&(r.hidden=!0),t.filter&&(r.filter=t.filter),t.sortSequence&&(r.sortSequence=t.sortSequence),t.sort&&(t.filter?a[o]=t.sort:n={column:o,dir:t.sort}),void 0!==t.searchItemSeparator&&(r.searchItemSeparator=t.searchItemSeparator)}))})),i=i.map((t=>t||{type:e,format:"date"===e?s:void 0,sortable:!0,searchable:!0})),[i,{filters:a,sort:n,widths:[]}]})(this.dt.options.columns,this.dt.options.type,this.dt.options.format)}get(t){return t<0||t>=this.size()?null:{...this.settings[t]}}size(){return this.settings.length}swap(t){if(2===t.length){const e=this.dt.data.headings.map(((t,e)=>e)),s=t[0],i=t[1],n=e[i];return e[i]=e[s],e[s]=n,this.order(e)}}order(t){this.dt.data.headings=t.map((t=>this.dt.data.headings[t])),this.dt.data.data.forEach((e=>e.cells=t.map((t=>e.cells[t])))),this.settings=t.map((t=>this.settings[t])),this.dt.update()}hide(t){Array.isArray(t)||(t=[t]),t.length&&(t.forEach((t=>{this.settings[t]||(this.settings[t]={type:"string"});this.settings[t].hidden=!0})),this.dt.update())}show(t){Array.isArray(t)||(t=[t]),t.length&&(t.forEach((t=>{this.settings[t]||(this.settings[t]={type:"string",sortable:!0});delete this.settings[t].hidden})),this.dt.update())}visible(t){return void 0===t&&(t=[...Array(this.dt.data.headings.length).keys()]),Array.isArray(t)?t.map((t=>!this.settings[t]?.hidden)):!this.settings[t]?.hidden}add(t){const e=this.dt.data.headings.length;if(this.dt.data.headings=this.dt.data.headings.concat([Z(t.heading)]),this.dt.data.data.forEach(((e,s)=>{e.cells=e.cells.concat([X(t.data[s],t)])})),this.settings[e]={type:t.type||"string",sortable:!0,searchable:!0},t.type||t.format||t.sortable||t.render||t.filter){const s=this.settings[e];t.render&&(s.render=t.render),t.format&&(s.format=t.format),t.cellClass&&(s.cellClass=t.cellClass),t.headerClass&&(s.headerClass=t.headerClass),t.locale&&(s.locale=t.locale),!1===t.sortable?s.sortable=!1:(t.numeric&&(s.numeric=t.numeric),t.caseFirst&&(s.caseFirst=t.caseFirst)),!1===t.searchable?s.searchable=!1:t.sensitivity&&(s.sensitivity=t.sensitivity),(s.searchable||s.sortable)&&t.ignorePunctuation&&(s.ignorePunctuation=t.ignorePunctuation),t.hidden&&(s.hidden=!0),t.filter&&(s.filter=t.filter),t.sortSequence&&(s.sortSequence=t.sortSequence)}this.dt.update(!0)}remove(t){Array.isArray(t)||(t=[t]),this.dt.data.headings=this.dt.data.headings.filter(((e,s)=>!t.includes(s))),this.dt.data.data.forEach((e=>e.cells=e.cells.filter(((e,s)=>!t.includes(s))))),this.dt.update(!0)}filter(t,e=!1){if(!this.settings[t]?.filter?.length)return;const s=this._state.filters[t];let i;if(s){let e=!1;i=this.settings[t].filter.find((t=>!!e||(t===s&&(e=!0),!1)))}else{const e=this.settings[t].filter;i=e?e[0]:void 0}i?this._state.filters[t]=i:s&&(this._state.filters[t]=void 0),this.dt._currentPage=1,this.dt.update(),e||this.dt.emit("datatable.filter",t,i)}sort(t,e=void 0,s=!1){const i=this.settings[t];if(s||this.dt.emit("datatable.sorting",t,e),!e){const s=!(!this._state.sort||this._state.sort.column!==t)&&this._state.sort?.dir,n=i?.sortSequence||["asc","desc"];if(s){const t=n.indexOf(s);e=-1===t?n[0]||"asc":t===n.length-1?n[0]:n[t+1]}else e=n.length?n[0]:"asc"}const a=!!["string","html"].includes(i.type)&&new Intl.Collator(i.locale||this.dt.options.locale,{usage:"sort",numeric:i.numeric||this.dt.options.numeric,caseFirst:i.caseFirst||this.dt.options.caseFirst,ignorePunctuation:i.ignorePunctuation||this.dt.options.ignorePunctuation});this.dt.data.data.sort(((s,i)=>{const o=s.cells[t],r=i.cells[t];let l=o.order??n(o),d=r.order??n(r);if("desc"===e){const t=l;l=d,d=t}return a&&"number"!=typeof l&&"number"!=typeof d?a.compare(String(l),String(d)):l<d?-1:l>d?1:0})),this._state.sort={column:t,dir:e},this.dt._searchQueries.length?(this.dt.multiSearch(this.dt._searchQueries),this.dt.emit("datatable.sort",t,e)):s||(this.dt._currentPage=1,this.dt.update(),this.dt.emit("datatable.sort",t,e))}_measureWidths(){const t=this.dt.data.headings.filter(((t,e)=>!this.settings[e]?.hidden));if((this.dt.options.scrollY.length||this.dt.options.fixedColumns)&&t?.length){this._state.widths=[];const t={noPaging:!0};if(this.dt.options.header||this.dt.options.footer){this.dt.options.scrollY.length&&(t.unhideHeader=!0),this.dt.headerDOM&&this.dt.headerDOM.parentElement.removeChild(this.dt.headerDOM),t.noColumnWidths=!0,this.dt._renderTable(t);const e=Array.from(this.dt.dom.querySelector("thead, tfoot")?.firstElementChild?.querySelectorAll("th")||[]);let s=0;const i=this.dt.data.headings.map(((t,i)=>{if(this.settings[i]?.hidden)return 0;const n=e[s].offsetWidth;return s+=1,n})),n=i.reduce(((t,e)=>t+e),0);this._state.widths=i.map((t=>t/n*100))}else{t.renderHeader=!0,this.dt._renderTable(t);const e=Array.from(this.dt.dom.querySelector("thead, tfoot")?.firstElementChild?.querySelectorAll("th")||[]);let s=0;const i=this.dt.data.headings.map(((t,i)=>{if(this.settings[i]?.hidden)return 0;const n=e[s].offsetWidth;return s+=1,n})),n=i.reduce(((t,e)=>t+e),0);this._state.widths=i.map((t=>t/n*100))}this.dt._renderTable()}}}const et={sortable:!0,locale:"en",numeric:!0,caseFirst:"false",searchable:!0,sensitivity:"base",ignorePunctuation:!0,destroyable:!0,searchItemSeparator:"",searchQuerySeparator:" ",searchAnd:!1,data:{},type:"html",format:"YYYY-MM-DD",columns:[],paging:!0,perPage:10,perPageSelect:[5,10,15,20,25],nextPrev:!0,firstLast:!1,prevText:"‹",nextText:"›",firstText:"«",lastText:"»",ellipsisText:"…",truncatePager:!0,pagerDelta:2,scrollY:"",fixedColumns:!0,fixedHeight:!1,footer:!1,header:!0,hiddenHeader:!1,caption:void 0,rowNavigation:!1,tabIndex:!1,pagerRender:!1,rowRender:!1,tableRender:!1,diffDomOptions:{valueDiffing:!1},labels:{placeholder:"Search...",searchTitle:"Search within table",perPage:"entries per page",pageTitle:"Page {page}",noRows:"No entries found",noResults:"No results match your search query",info:"Showing {start} to {end} of {rows} entries"},template:(t,e)=>`<div class='${t.classes.top}'>\n    ${t.paging&&t.perPageSelect?`<div class='${t.classes.dropdown}'>\n            <label>\n                <select class='${t.classes.selector}' name="per-page"></select> ${t.labels.perPage}\n            </label>\n        </div>`:""}\n    ${t.searchable?`<div class='${t.classes.search}'>\n            <input class='${t.classes.input}' placeholder='${t.labels.placeholder}' type='search' name="search" title='${t.labels.searchTitle}'${e.id?` aria-controls="${e.id}"`:""}>\n        </div>`:""}\n</div>\n<div class='${t.classes.container}'${t.scrollY.length?` style='height: ${t.scrollY}; overflow-Y: auto;'`:""}></div>\n<div class='${t.classes.bottom}'>\n    ${t.paging?`<div class='${t.classes.info}'></div>`:""}\n    <nav class='${t.classes.pagination}'></nav>\n</div>`,classes:{active:"datatable-active",ascending:"datatable-ascending",bottom:"datatable-bottom",container:"datatable-container",cursor:"datatable-cursor",descending:"datatable-descending",disabled:"datatable-disabled",dropdown:"datatable-dropdown",ellipsis:"datatable-ellipsis",filter:"datatable-filter",filterActive:"datatable-filter-active",empty:"datatable-empty",headercontainer:"datatable-headercontainer",hidden:"datatable-hidden",info:"datatable-info",input:"datatable-input",loading:"datatable-loading",pagination:"datatable-pagination",paginationList:"datatable-pagination-list",paginationListItem:"datatable-pagination-list-item",paginationListItemLink:"datatable-pagination-list-item-link",search:"datatable-search",selector:"datatable-selector",sorter:"datatable-sorter",table:"datatable-table",top:"datatable-top",wrapper:"datatable-wrapper"}},st=(t,e,s,i={})=>({nodeName:"LI",attributes:{class:i.active&&!i.hidden?`${s.classes.paginationListItem} ${s.classes.active}`:i.hidden?`${s.classes.paginationListItem} ${s.classes.hidden} ${s.classes.disabled}`:s.classes.paginationListItem},childNodes:[{nodeName:"BUTTON",attributes:{"data-page":String(t),class:s.classes.paginationListItemLink,"aria-label":s.labels.pageTitle.replace("{page}",String(t))},childNodes:[{nodeName:"#text",data:e}]}]}),it=(t,e,s,i,n)=>{let a=[];if(n.firstLast&&a.push(st(1,n.firstText,n)),n.nextPrev){const e=t?1:s-1;a.push(st(e,n.prevText,n,{hidden:t}))}let o=[...Array(i).keys()].map((t=>st(t+1,String(t+1),n,{active:t===s-1})));if(n.truncatePager&&(o=((t,e,s,i)=>{const n=i.pagerDelta,a=i.classes,o=i.ellipsisText,r=2*n;let l=e-n,d=e+n;e<4-n+r?d=3+r:e>s-(3-n+r)&&(l=s-(2+r));const c=[];for(let e=1;e<=s;e++)if(1==e||e==s||e>=l&&e<=d){const s=t[e-1];c.push(s)}let h;const u=[];return c.forEach((e=>{const s=parseInt(e.childNodes[0].attributes["data-page"],10);if(h){const e=parseInt(h.childNodes[0].attributes["data-page"],10);if(s-e==2)u.push(t[e]);else if(s-e!=1){const t={nodeName:"LI",attributes:{class:`${a.paginationListItem} ${a.ellipsis} ${a.disabled}`},childNodes:[{nodeName:"BUTTON",attributes:{class:a.paginationListItemLink},childNodes:[{nodeName:"#text",data:o}]}]};u.push(t)}}u.push(e),h=e})),u})(o,s,i,n)),a=a.concat(o),n.nextPrev){const t=e?i:s+1;a.push(st(t,n.nextText,n,{hidden:e}))}n.firstLast&&a.push(st(i,n.lastText,n));return{nodeName:"UL",attributes:{class:n.classes.paginationList},childNodes:o.length>1?a:[]}};class nt{columns;containerDOM;_currentPage;data;_dd;dom;_events;hasHeadings;hasRows;headerDOM;_initialHTML;initialized;_label;lastPage;_listeners;onFirstPage;onLastPage;options;_pagerDOMs;_virtualPagerDOM;pages;_rect;rows;_searchData;_searchQueries;_tableAttributes;_tableFooters;_tableCaptions;totalPages;_virtualDOM;_virtualHeaderDOM;wrapperDOM;constructor(t,e={}){const s="string"==typeof t?document.querySelector(t):t;s instanceof HTMLTableElement?this.dom=s:(this.dom=document.createElement("table"),s.appendChild(this.dom));const i={...et.diffDomOptions,...e.diffDomOptions},n={...et.labels,...e.labels},a={...et.classes,...e.classes};this.options={...et,...e,diffDomOptions:i,labels:n,classes:a},this._initialHTML=this.options.destroyable?s.outerHTML:"",this.options.tabIndex?this.dom.tabIndex=this.options.tabIndex:this.options.rowNavigation&&-1===this.dom.tabIndex&&(this.dom.tabIndex=0),this._listeners={onResize:()=>this._onResize()},this._dd=new j(this.options.diffDomOptions||{}),this.initialized=!1,this._events={},this._currentPage=0,this.onFirstPage=!0,this.hasHeadings=!1,this.hasRows=!1,this._searchQueries=[],this.init()}init(){if(this.initialized||d(this.dom,this.options.classes.table))return!1;this._virtualDOM=S(this.dom,this.options.diffDomOptions||{}),this._tableAttributes={...this._virtualDOM.attributes},this._tableFooters=this._virtualDOM.childNodes?.filter((t=>"TFOOT"===t.nodeName))??[],this._tableCaptions=this._virtualDOM.childNodes?.filter((t=>"CAPTION"===t.nodeName))??[],void 0!==this.options.caption&&this._tableCaptions.push({nodeName:"CAPTION",childNodes:[{nodeName:"#text",data:this.options.caption}]}),this.rows=new K(this),this.columns=new tt(this),this.data=G(this.options.data,this.dom,this.columns.settings,this.options.type,this.options.format),this._render(),setTimeout((()=>{this.emit("datatable.init"),this.initialized=!0}),10)}_render(){this.wrapperDOM=s("div",{class:`${this.options.classes.wrapper} ${this.options.classes.loading}`}),this.wrapperDOM.innerHTML=this.options.template(this.options,this.dom);const t=l(this.options.classes.selector),e=this.wrapperDOM.querySelector(`select${t}`);e&&this.options.paging&&this.options.perPageSelect?this.options.perPageSelect.forEach((t=>{const[s,i]=Array.isArray(t)?[t[0],t[1]]:[String(t),t],n=i===this.options.perPage,a=new Option(s,String(i),n,n);e.appendChild(a)})):e&&e.parentElement.removeChild(e);const i=l(this.options.classes.container);this.containerDOM=this.wrapperDOM.querySelector(i),this._pagerDOMs=[];const n=l(this.options.classes.pagination);Array.from(this.wrapperDOM.querySelectorAll(n)).forEach((t=>{t instanceof HTMLElement&&(t.innerHTML=`<ul class="${this.options.classes.paginationList}"></ul>`,this._pagerDOMs.push(t.firstElementChild))})),this._virtualPagerDOM={nodeName:"UL",attributes:{class:this.options.classes.paginationList}};const a=l(this.options.classes.info);this._label=this.wrapperDOM.querySelector(a),this.dom.parentElement.replaceChild(this.wrapperDOM,this.dom),this.containerDOM.appendChild(this.dom),this._rect=this.dom.getBoundingClientRect(),this._fixHeight(),this.options.header||this.wrapperDOM.classList.add("no-header"),this.options.footer||this.wrapperDOM.classList.add("no-footer"),this.options.sortable&&this.wrapperDOM.classList.add("sortable"),this.options.searchable&&this.wrapperDOM.classList.add("searchable"),this.options.fixedHeight&&this.wrapperDOM.classList.add("fixed-height"),this.options.fixedColumns&&this.wrapperDOM.classList.add("fixed-columns"),this._bindEvents(),this.columns._state.sort&&this.columns.sort(this.columns._state.sort.column,this.columns._state.sort.dir,!0),this.update(!0)}_renderTable(t={}){let e;e=(this.options.paging||this._searchQueries.length||this.columns._state.filters.length)&&this._currentPage&&this.pages.length&&!t.noPaging?this.pages[this._currentPage-1]:this.data.data.map(((t,e)=>({row:t,index:e})));let s=F(this._tableAttributes,this.data.headings,e,this.columns.settings,this.columns._state,this.rows.cursor,this.options,t,this._tableFooters,this._tableCaptions);if(this.options.tableRender){const t=this.options.tableRender(this.data,s,"main");t&&(s=t)}const i=this._dd.diff(this._virtualDOM,s);this._dd.apply(this.dom,i),this._virtualDOM=s}_renderPage(t=!1){this.hasRows&&this.totalPages?(this._currentPage>this.totalPages&&(this._currentPage=1),this._renderTable(),this.onFirstPage=1===this._currentPage,this.onLastPage=this._currentPage===this.lastPage):this.setMessage(this.options.labels.noRows);let e,s=0,i=0,n=0;if(this.totalPages&&(s=this._currentPage-1,i=s*this.options.perPage,n=i+this.pages[s].length,i+=1,e=this._searchQueries.length?this._searchData.length:this.data.data.length),this._label&&this.options.labels.info.length){const t=this.options.labels.info.replace("{start}",String(i)).replace("{end}",String(n)).replace("{page}",String(this._currentPage)).replace("{pages}",String(this.totalPages)).replace("{rows}",String(e));this._label.innerHTML=e?t:""}if(1==this._currentPage&&this._fixHeight(),this.options.rowNavigation&&this._currentPage&&(!this.rows.cursor||!this.pages[this._currentPage-1].find((t=>t.index===this.rows.cursor)))){const e=this.pages[this._currentPage-1];e.length&&(t?this.rows.setCursor(e[e.length-1].index):this.rows.setCursor(e[0].index))}}_renderPagers(){if(!this.options.paging)return;let t=it(this.onFirstPage,this.onLastPage,this._currentPage,this.totalPages,this.options);if(this.options.pagerRender){const e=this.options.pagerRender([this.onFirstPage,this.onLastPage,this._currentPage,this.totalPages],t);e&&(t=e)}const e=this._dd.diff(this._virtualPagerDOM,t);this._pagerDOMs.forEach((t=>{this._dd.apply(t,e)})),this._virtualPagerDOM=t}_renderSeparateHeader(){const t=this.dom.parentElement;this.headerDOM||(this.headerDOM=document.createElement("div"),this._virtualHeaderDOM={nodeName:"DIV"}),t.parentElement.insertBefore(this.headerDOM,t);let e={nodeName:"TABLE",attributes:this._tableAttributes,childNodes:[{nodeName:"THEAD",childNodes:[q(this.data.headings,this.columns.settings,this.columns._state,this.options,{unhideHeader:!0})]}]};if(e.attributes.class=c(e.attributes.class,this.options.classes.table),this.options.tableRender){const t=this.options.tableRender(this.data,e,"header");t&&(e=t)}const s={nodeName:"DIV",attributes:{class:this.options.classes.headercontainer},childNodes:[e]},i=this._dd.diff(this._virtualHeaderDOM,s);this._dd.apply(this.headerDOM,i),this._virtualHeaderDOM=s;const n=this.headerDOM.firstElementChild.clientWidth-this.dom.clientWidth;if(n){const t=structuredClone(this._virtualHeaderDOM);t.attributes.style=`padding-right: ${n}px;`;const e=this._dd.diff(this._virtualHeaderDOM,t);this._dd.apply(this.headerDOM,e),this._virtualHeaderDOM=t}t.scrollHeight>t.clientHeight&&(t.style.overflowY="scroll")}_bindEvents(){if(this.options.perPageSelect){const t=l(this.options.classes.selector),e=this.wrapperDOM.querySelector(t);e&&e instanceof HTMLSelectElement&&e.addEventListener("change",(()=>{this.emit("datatable.perpage:before",this.options.perPage),this.options.perPage=parseInt(e.value,10),this.update(),this._fixHeight(),this.emit("datatable.perpage",this.options.perPage)}),!1)}this.options.searchable&&this.wrapperDOM.addEventListener("input",(t=>{const e=l(this.options.classes.input),s=t.target;if(!(s instanceof HTMLInputElement&&s.matches(e)))return;t.preventDefault();const i=[];if(Array.from(this.wrapperDOM.querySelectorAll(e)).filter((t=>t.value.length)).forEach((t=>{const e=t.dataset.and||this.options.searchAnd,s=t.dataset.querySeparator||this.options.searchQuerySeparator?t.value.split(this.options.searchQuerySeparator):[t.value];e?s.forEach((e=>{t.dataset.columns?i.push({terms:[e],columns:JSON.parse(t.dataset.columns)}):i.push({terms:[e],columns:void 0})})):t.dataset.columns?i.push({terms:s,columns:JSON.parse(t.dataset.columns)}):i.push({terms:s,columns:void 0})})),1===i.length&&1===i[0].terms.length){const t=i[0];this.search(t.terms[0],t.columns)}else this.multiSearch(i)})),this.wrapperDOM.addEventListener("click",(t=>{const e=t.target.closest("a, button");if(e)if(e.hasAttribute("data-page"))this.page(parseInt(e.getAttribute("data-page"),10)),t.preventDefault();else if(d(e,this.options.classes.sorter)){const s=Array.from(e.parentElement.parentElement.children).indexOf(e.parentElement),i=o(s,this.columns.settings);this.columns.sort(i),t.preventDefault()}else if(d(e,this.options.classes.filter)){const s=Array.from(e.parentElement.parentElement.children).indexOf(e.parentElement),i=o(s,this.columns.settings);this.columns.filter(i),t.preventDefault()}}),!1),this.options.rowNavigation?(this.dom.addEventListener("keydown",(t=>{if("ArrowUp"===t.key){let e;t.preventDefault(),t.stopPropagation(),this.pages[this._currentPage-1].find((t=>t.index===this.rows.cursor||(e=t,!1))),e?this.rows.setCursor(e.index):this.onFirstPage||this.page(this._currentPage-1,!0)}else if("ArrowDown"===t.key){let e;t.preventDefault(),t.stopPropagation();const s=this.pages[this._currentPage-1].find((t=>!!e||(t.index===this.rows.cursor&&(e=!0),!1)));s?this.rows.setCursor(s.index):this.onLastPage||this.page(this._currentPage+1)}else["Enter"," "].includes(t.key)&&this.emit("datatable.selectrow",this.rows.cursor,t)})),this.dom.addEventListener("mousedown",(t=>{const e=t.target;if(e instanceof Element&&this.dom.matches(":focus")){const s=Array.from(this.dom.querySelectorAll("tbody > tr")).find((t=>t.contains(e)));s&&s instanceof HTMLElement&&this.emit("datatable.selectrow",parseInt(s.dataset.index,10),t)}}))):this.dom.addEventListener("mousedown",(t=>{const e=t.target;if(!(e instanceof Element))return;const s=Array.from(this.dom.querySelectorAll("tbody > tr")).find((t=>t.contains(e)));s&&s instanceof HTMLElement&&this.emit("datatable.selectrow",parseInt(s.dataset.index,10),t)})),window.addEventListener("resize",this._listeners.onResize)}_onResize(){this._rect=this.containerDOM.getBoundingClientRect(),this._rect.width&&this.update(!0)}destroy(){if(this.options.destroyable){if(this.wrapperDOM){const t=this.wrapperDOM.parentElement;if(t){const e=s("div");e.innerHTML=this._initialHTML;const i=e.firstElementChild;t.replaceChild(i,this.wrapperDOM),this.dom=i}else this.options.classes.table?.split(" ").forEach((t=>this.wrapperDOM.classList.remove(t)))}window.removeEventListener("resize",this._listeners.onResize),this.initialized=!1}}update(t=!1){this.emit("datatable.update:before"),t&&(this.columns._measureWidths(),this.hasRows=Boolean(this.data.data.length),this.hasHeadings=Boolean(this.data.headings.length)),this.options.classes.empty?.split(" ").forEach((t=>this.wrapperDOM.classList.remove(t))),this._paginate(),this._renderPage(),this._renderPagers(),this.options.scrollY.length&&this._renderSeparateHeader(),this.emit("datatable.update")}_paginate(){let t=this.data.data.map(((t,e)=>({row:t,index:e})));return this._searchQueries.length&&(t=[],this._searchData.forEach((e=>t.push({index:e,row:this.data.data[e]})))),this.columns._state.filters.length&&this.columns._state.filters.forEach(((e,s)=>{e&&(t=t.filter((t=>{const i=t.row.cells[s];return"function"==typeof e?e(i.data):n(i)===e})))})),this.options.paging&&this.options.perPage>0?this.pages=t.map(((e,s)=>s%this.options.perPage==0?t.slice(s,s+this.options.perPage):null)).filter((t=>t)):this.pages=[t],this.totalPages=this.lastPage=this.pages.length,this._currentPage||(this._currentPage=1),this.totalPages}_fixHeight(){this.options.fixedHeight&&(this.containerDOM.style.height=null,this._rect=this.containerDOM.getBoundingClientRect(),this.containerDOM.style.height=`${this._rect.height}px`)}search(t,e=void 0){if(this.emit("datatable.search:before",t,this._searchData),!t.length)return this._currentPage=1,this._searchQueries=[],this._searchData=[],this.update(),this.emit("datatable.search","",[]),this.wrapperDOM.classList.remove("search-results"),!1;this.multiSearch([{terms:[t],columns:e||void 0}]),this.emit("datatable.search",t,this._searchData)}multiSearch(t){if(!this.hasRows)return!1;this._currentPage=1,this._searchData=[];const e=t.map((t=>({columns:t.columns,terms:t.terms.map((t=>t.trim())).filter((t=>t))}))).filter((t=>t.terms.length));if(this.emit("datatable.multisearch:before",e,this._searchData),this._searchQueries=e,!e.length)return this.update(),this.emit("datatable.multisearch",e,this._searchData),this.wrapperDOM.classList.remove("search-results"),!1;const s=e.map((t=>this.columns.settings.map(((e,s)=>{if(e.hidden||!e.searchable||t.columns&&!t.columns.includes(s))return!1;let i=t.terms;const n=e.sensitivity||this.options.sensitivity;["base","accent"].includes(n)&&(i=i.map((t=>t.toLowerCase()))),["base","case"].includes(n)&&(i=i.map((t=>t.normalize("NFD").replace(/\p{Diacritic}/gu,""))));return(e.ignorePunctuation??this.options.ignorePunctuation)&&(i=i.map((t=>t.replace(/[.,/#!$%^&*;:{}=-_`~()]/g,"")))),i}))));this.data.data.forEach(((t,e)=>{const i=t.cells.map(((t,e)=>{let s=n(t).trim();const i=this.columns.settings[e];if(s.length){const t=i.sensitivity||this.options.sensitivity;["base","accent"].includes(t)&&(s=s.toLowerCase()),["base","case"].includes(t)&&(s=s.normalize("NFD").replace(/\p{Diacritic}/gu,""));(i.ignorePunctuation??this.options.ignorePunctuation)&&(s=s.replace(/[.,/#!$%^&*;:{}=-_`~()]/g,""))}const a=i.searchItemSeparator||this.options.searchItemSeparator;return a?s.split(a):[s]}));s.every((t=>t.find(((t,e)=>!!t&&t.find((t=>i[e].find((e=>e.includes(t)))))))))&&this._searchData.push(e)})),this.wrapperDOM.classList.add("search-results"),this._searchData.length?this.update():(this.wrapperDOM.classList.remove("search-results"),this.setMessage(this.options.labels.noResults)),this.emit("datatable.multisearch",e,this._searchData)}page(t,e=!1){return this.emit("datatable.page:before",t),t!==this._currentPage&&(isNaN(t)||(this._currentPage=t),!(t>this.pages.length||t<0)&&(this._renderPage(e),this._renderPagers(),void this.emit("datatable.page",t)))}insert(e){let s=[];if(Array.isArray(e)){const t=this.data.headings.map((t=>t.data?String(t.data):t.text));e.forEach(((e,i)=>{const n=[];Object.entries(e).forEach((([e,s])=>{const a=t.indexOf(e);a>-1?n[a]=X(s,this.columns.settings[a]):this.hasHeadings||this.hasRows||0!==i||(n[t.length]=X(s,this.columns.settings[t.length]),t.push(e),this.data.headings.push(Z(e)))})),s.push({cells:n})}))}else t(e)&&(!e.headings||this.hasHeadings||this.hasRows?e.data&&Array.isArray(e.data)&&(s=e.data.map((t=>{let e,s;return Array.isArray(t)?(e={},s=t):(e=t.attributes,s=t.cells),{attributes:e,cells:s.map(((t,e)=>X(t,this.columns.settings[e])))}}))):this.data=G(e,void 0,this.columns.settings,this.options.type,this.options.format));s.length&&s.forEach((t=>this.data.data.push(t))),this.hasHeadings=Boolean(this.data.headings.length),this.columns._state.sort&&this.columns.sort(this.columns._state.sort.column,this.columns._state.sort.dir,!0),this.update(!0)}refresh(){if(this.emit("datatable.refresh:before"),this.options.searchable){const t=l(this.options.classes.input);Array.from(this.wrapperDOM.querySelectorAll(t)).forEach((t=>t.value="")),this._searchQueries=[]}this._currentPage=1,this.onFirstPage=!0,this.update(!0),this.emit("datatable.refresh")}print(){const t=s("table");let e=F(this._tableAttributes,this.data.headings,this.data.data.map(((t,e)=>({row:t,index:e}))),this.columns.settings,this.columns._state,!1,this.options,{noColumnWidths:!0,unhideHeader:!0},this._tableFooters,this._tableCaptions);if(this.options.tableRender){const t=this.options.tableRender(this.data,e,"print");t&&(e=t)}const i=this._dd.diff({nodeName:"TABLE"},e);this._dd.apply(t,i);const n=window.open();n.document.body.appendChild(t),n.print()}setMessage(t){const e=this.data.headings.filter(((t,e)=>!this.columns.settings[e]?.hidden)).length||1;this.options.classes.empty?.split(" ").forEach((t=>this.wrapperDOM.classList.add(t))),this._label&&(this._label.innerHTML=""),this.totalPages=0,this._renderPagers();let s={nodeName:"TABLE",attributes:this._tableAttributes,childNodes:[{nodeName:"THEAD",childNodes:[q(this.data.headings,this.columns.settings,this.columns._state,this.options,{})]},{nodeName:"TBODY",childNodes:[{nodeName:"TR",childNodes:[{nodeName:"TD",attributes:{class:this.options.classes.empty,colspan:String(e)},childNodes:[{nodeName:"#text",data:t}]}]}]}]};if(this._tableFooters.forEach((t=>s.childNodes.push(t))),this._tableCaptions.forEach((t=>s.childNodes.push(t))),s.attributes.class=c(s.attributes.class,this.options.classes.table),this.options.tableRender){const t=this.options.tableRender(this.data,s,"message");t&&(s=t)}const i=this._dd.diff(this._virtualDOM,s);this._dd.apply(this.dom,i),this._virtualDOM=s}on(t,e){this._events[t]=this._events[t]||[],this._events[t].push(e)}off(t,e){t in this._events!=!1&&this._events[t].splice(this._events[t].indexOf(e),1)}emit(t,...e){if(t in this._events!=!1)for(let s=0;s<this._events[t].length;s++)this._events[t][s](...e)}}const at=function(e){let s;if(!t(e))return!1;const i={lineDelimiter:"\n",columnDelimiter:",",removeDoubleQuotes:!1,...e};if(i.data.length){s={data:[]};const t=i.data.split(i.lineDelimiter);if(t.length&&(i.headings&&(s.headings=t[0].split(i.columnDelimiter),i.removeDoubleQuotes&&(s.headings=s.headings.map((t=>t.trim().replace(/(^"|"$)/g,"")))),t.shift()),t.forEach(((t,e)=>{s.data[e]=[];const n=t.split(i.columnDelimiter);n.length&&n.forEach((t=>{i.removeDoubleQuotes&&(t=t.trim().replace(/(^"|"$)/g,"")),s.data[e].push(t)}))}))),s)return s}return!1},ot=function(s){let i;if(!t(s))return!1;const n={data:"",...s};if(n.data.length||t(n.data)){const t=!!e(n.data)&&JSON.parse(n.data);if(t?(i={headings:[],data:[]},t.forEach(((t,e)=>{i.data[e]=[],Object.entries(t).forEach((([t,s])=>{i.headings.includes(t)||i.headings.push(t),i.data[e].push(s)}))}))):console.warn("That's not valid JSON!"),i)return i}return!1},rt=function(e,s={}){if(!e.hasHeadings&&!e.hasRows)return!1;if(!t(s))return!1;const i={download:!0,skipColumn:[],lineDelimiter:"\n",columnDelimiter:",",...s},a=t=>!i.skipColumn.includes(t)&&!e.columns.settings[t]?.hidden,o=e.data.headings.filter(((t,e)=>a(e))).map((t=>t.text??t.data));let r;if(i.selection)if(Array.isArray(i.selection)){r=[];for(let t=0;t<i.selection.length;t++)r=r.concat(e.pages[i.selection[t]-1].map((t=>t.row)))}else r=e.pages[i.selection-1].map((t=>t.row));else r=e.data.data;let l=[];if(l[0]=o,l=l.concat(r.map((t=>t.cells.filter(((t,e)=>a(e))).map((t=>n(t)))))),l.length){let t="";if(l.forEach((e=>{e.forEach((e=>{"string"==typeof e&&(e=(e=(e=(e=(e=e.trim()).replace(/\s{2,}/g," ")).replace(/\n/g,"  ")).replace(/"/g,'""')).replace(/#/g,"%23")).includes(",")&&(e=`"${e}"`),t+=e+i.columnDelimiter})),t=t.trim().substring(0,t.length-1),t+=i.lineDelimiter})),t=t.trim().substring(0,t.length-1),i.download){const e=document.createElement("a");e.href=encodeURI(`data:text/csv;charset=utf-8,${t}`),e.download=`${i.filename||"datatable_export"}.csv`,document.body.appendChild(e),e.click(),document.body.removeChild(e)}return t}return!1},lt=function(e,s={}){if(!e.hasHeadings&&!e.hasRows)return!1;if(!t(s))return!1;const i={download:!0,skipColumn:[],replacer:null,space:4,...s},a=t=>!i.skipColumn.includes(t)&&!e.columns.settings[t]?.hidden;let o;if(i.selection)if(Array.isArray(i.selection)){o=[];for(let t=0;t<i.selection.length;t++)o=o.concat(e.pages[i.selection[t]-1].map((t=>t.row)))}else o=e.pages[i.selection-1].map((t=>t.row));else o=e.data.data;const r=o.map((t=>t.cells.filter(((t,e)=>a(e))).map((t=>n(t))))),l=e.data.headings.filter(((t,e)=>a(e))).map((t=>t.text??String(t.data)));if(r.length){const t=[];r.forEach(((e,s)=>{t[s]=t[s]||{},e.forEach(((e,i)=>{t[s][l[i]]=e}))}));const e=JSON.stringify(t,i.replacer,i.space);if(i.download){const t=new Blob([e],{type:"data:application/json;charset=utf-8"}),s=URL.createObjectURL(t),n=document.createElement("a");n.href=s,n.download=`${i.filename||"datatable_export"}.json`,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(s)}return e}return!1},dt=function(e,s={}){if(!e.hasHeadings&&!e.hasRows)return!1;if(!t(s))return!1;const i={download:!0,skipColumn:[],tableName:"myTable",...s},a=t=>!i.skipColumn.includes(t)&&!e.columns.settings[t]?.hidden;let o=[];if(i.selection)if(Array.isArray(i.selection))for(let t=0;t<i.selection.length;t++)o=o.concat(e.pages[i.selection[t]-1].map((t=>t.row)));else o=e.pages[i.selection-1].map((t=>t.row));else o=e.data.data;const r=o.map((t=>t.cells.filter(((t,e)=>a(e))).map((t=>n(t))))),l=e.data.headings.filter(((t,e)=>a(e))).map((t=>t.text??String(t.data)));if(r.length){let t=`INSERT INTO \`${i.tableName}\` (`;if(l.forEach((e=>{t+=`\`${e}\`,`})),t=t.trim().substring(0,t.length-1),t+=") VALUES ",r.forEach((e=>{t+="(",e.forEach((e=>{t+="string"==typeof e?`"${e}",`:`${e},`})),t=t.trim().substring(0,t.length-1),t+="),"})),t=t.trim().substring(0,t.length-1),t+=";",i.download&&(t=`data:application/sql;charset=utf-8,${t}`),i.download){const e=document.createElement("a");e.href=encodeURI(t),e.download=`${i.filename||"datatable_export"}.sql`,document.body.appendChild(e),e.click(),document.body.removeChild(e)}return t}return!1},ct=function(e,s={}){if(!e.hasHeadings&&!e.hasRows)return!1;if(!t(s))return!1;const i={download:!0,skipColumn:[],lineDelimiter:"\n",columnDelimiter:",",...s},a=t=>!i.skipColumn.includes(t)&&!e.columns.settings[t]?.hidden,o=e.data.headings.filter(((t,e)=>a(e))).map((t=>t.text??t.data));let r;if(i.selection)if(Array.isArray(i.selection)){r=[];for(let t=0;t<i.selection.length;t++)r=r.concat(e.pages[i.selection[t]-1].map((t=>t.row)))}else r=e.pages[i.selection-1].map((t=>t.row));else r=e.data.data;let l=[];if(l[0]=o,l=l.concat(r.map((t=>t.cells.filter(((t,e)=>a(e))).map((t=>n(t)))))),l.length){let t="";if(l.forEach((e=>{e.forEach((e=>{"string"==typeof e&&(e=(e=(e=(e=(e=e.trim()).replace(/\s{2,}/g," ")).replace(/\n/g,"  ")).replace(/"/g,'""')).replace(/#/g,"%23")).includes(",")&&(e=`"${e}"`),t+=e+i.columnDelimiter})),t=t.trim().substring(0,t.length-1),t+=i.lineDelimiter})),t=t.trim().substring(0,t.length-1),i.download&&(t=`data:text/csv;charset=utf-8,${t}`),i.download){const e=document.createElement("a");e.href=encodeURI(t),e.download=`${i.filename||"datatable_export"}.txt`,document.body.appendChild(e),e.click(),document.body.removeChild(e)}return t}return!1},ht={classes:{row:"datatable-editor-row",form:"datatable-editor-form",item:"datatable-editor-item",menu:"datatable-editor-menu",save:"datatable-editor-save",block:"datatable-editor-block",cancel:"datatable-editor-cancel",close:"datatable-editor-close",inner:"datatable-editor-inner",input:"datatable-editor-input",label:"datatable-editor-label",modal:"datatable-editor-modal",action:"datatable-editor-action",header:"datatable-editor-header",wrapper:"datatable-editor-wrapper",editable:"datatable-editor-editable",container:"datatable-editor-container",separator:"datatable-editor-separator"},labels:{closeX:"x",editCell:"Edit Cell",editRow:"Edit Row",removeRow:"Remove Row",reallyRemove:"Are you sure?",reallyCancel:"Do you really want to cancel?",save:"Save",cancel:"Cancel"},cancelModal:t=>confirm(t.options.labels.reallyCancel),inline:!0,hiddenColumns:!1,contextMenu:!0,clickEvent:"dblclick",excludeColumns:[],menuItems:[{text:t=>t.options.labels.editCell,action:(t,e)=>{if(!(t.event.target instanceof Element))return;const s=t.event.target.closest("td");return t.editCell(s)}},{text:t=>t.options.labels.editRow,action:(t,e)=>{if(!(t.event.target instanceof Element))return;const s=t.event.target.closest("tr");return t.editRow(s)}},{separator:!0},{text:t=>t.options.labels.removeRow,action:(t,e)=>{if(t.event.target instanceof Element&&confirm(t.options.labels.reallyRemove)){const e=t.event.target.closest("tr");t.removeRow(e)}}}]};class ut{menuOpen;containerDOM;data;disabled;dt;editing;editingCell;editingRow;event;events;initialized;limits;menuDOM;modalDOM;options;originalRowRender;rect;wrapperDOM;constructor(t,e={}){this.dt=t,this.options={...ht,...e}}init(){this.initialized||(this.options.classes.editable?.split(" ").forEach((t=>this.dt.wrapperDOM.classList.add(t))),this.options.inline&&(this.originalRowRender=this.dt.options.rowRender,this.dt.options.rowRender=(t,e,s)=>{let i=this.rowRender(t,e,s);return this.originalRowRender&&(i=this.originalRowRender(t,i,s)),i}),this.options.contextMenu&&(this.containerDOM=s("div",{id:this.options.classes.container}),this.wrapperDOM=s("div",{class:this.options.classes.wrapper}),this.menuDOM=s("ul",{class:this.options.classes.menu}),this.options.menuItems&&this.options.menuItems.length&&this.options.menuItems.forEach((t=>{const e=s("li",{class:t.separator?this.options.classes.separator:this.options.classes.item});if(!t.separator){const i=s("a",{class:this.options.classes.action,href:t.url||"#",html:"function"==typeof t.text?t.text(this):t.text});e.appendChild(i),t.action&&"function"==typeof t.action&&i.addEventListener("click",(e=>{e.preventDefault(),t.action(this,e)}))}this.menuDOM.appendChild(e)})),this.wrapperDOM.appendChild(this.menuDOM),this.containerDOM.appendChild(this.wrapperDOM),this.updateMenu()),this.data={},this.menuOpen=!1,this.editing=!1,this.editingRow=!1,this.editingCell=!1,this.bindEvents(),setTimeout((()=>{this.initialized=!0,this.dt.emit("editable.init")}),10))}bindEvents(){this.events={keydown:this.keydown.bind(this),click:this.click.bind(this)},this.dt.dom.addEventListener(this.options.clickEvent,this.events.click),document.addEventListener("keydown",this.events.keydown),this.options.contextMenu&&(this.events.context=this.context.bind(this),this.events.updateMenu=this.updateMenu.bind(this),this.events.dismissMenu=this.dismissMenu.bind(this),this.events.reset=function(t,e=300){let s;return(...i)=>{clearTimeout(s),s=window.setTimeout((()=>t()),e)}}((()=>this.events.updateMenu()),50),this.dt.dom.addEventListener("contextmenu",this.events.context),document.addEventListener("click",this.events.dismissMenu),window.addEventListener("resize",this.events.reset),window.addEventListener("scroll",this.events.reset))}context(t){const e=t.target;if(!(e instanceof Element))return;this.event=t;const s=e.closest("tbody td");if(!this.disabled&&s){t.preventDefault();let e=t.pageX,s=t.pageY;e>this.limits.x&&(e-=this.rect.width),s>this.limits.y&&(s-=this.rect.height),this.wrapperDOM.style.top=`${s}px`,this.wrapperDOM.style.left=`${e}px`,this.openMenu(),this.updateMenu()}}click(t){const e=t.target;if(e instanceof Element)if(this.editing&&this.data&&this.editingCell){const t=l(this.options.classes.input),e=this.modalDOM?this.modalDOM.querySelector(`input${t}[type=text]`):this.dt.wrapperDOM.querySelector(`input${t}[type=text]`);this.saveCell(e.value)}else if(!this.editing){const s=e.closest("tbody td");s&&(this.editCell(s),t.preventDefault())}}keydown(t){const e=l(this.options.classes.input);if(this.modalDOM){if("Escape"===t.key)this.options.cancelModal(this)&&this.closeModal();else if("Enter"===t.key)if(this.editingCell){const t=this.modalDOM.querySelector(`input${e}[type=text]`);this.saveCell(t.value)}else{const t=Array.from(this.modalDOM.querySelectorAll(`input${e}[type=text]`)).map((t=>t.value.trim()));this.saveRow(t,this.data.row)}}else if(this.editing&&this.data)if("Enter"===t.key){if(this.editingCell){const t=this.dt.wrapperDOM.querySelector(`input${e}[type=text]`);this.saveCell(t.value)}else if(this.editingRow){const t=Array.from(this.dt.wrapperDOM.querySelectorAll(`input${e}[type=text]`)).map((t=>t.value.trim()));this.saveRow(t,this.data.row)}}else"Escape"===t.key&&(this.editingCell?this.saveCell(this.data.content):this.editingRow&&this.saveRow(null,this.data.row))}editCell(t){const e=o(t.cellIndex,this.dt.columns.settings);if(this.options.excludeColumns.includes(e))return void this.closeMenu();const s=parseInt(t.parentElement.dataset.index,10),i=this.dt.data.data[s].cells[e];this.data={cell:i,rowIndex:s,columnIndex:e,content:n(i)},this.editing=!0,this.editingCell=!0,this.options.inline?this.dt.update():this.editCellModal(),this.closeMenu()}editCellModal(){const t=this.data.cell,e=this.data.columnIndex,i=this.dt.data.headings[e].text||String(this.dt.data.headings[e].data),o=[`<div class='${this.options.classes.inner}'>`,`<div class='${this.options.classes.header}'>`,`<h4>${this.options.labels.editCell}</h4>`,`<button class='${this.options.classes.close}' type='button' data-editor-cancel>${this.options.labels.closeX}</button>`," </div>",`<div class='${this.options.classes.block}'>`,`<form class='${this.options.classes.form}'>`,`<div class='${this.options.classes.row}'>`,`<label class='${this.options.classes.label}'>${a(i)}</label>`,`<input class='${this.options.classes.input}' value='${a(n(t))}' type='text'>`,"</div>",`<div class='${this.options.classes.row}'>`,`<button class='${this.options.classes.cancel}' type='button' data-editor-cancel>${this.options.labels.cancel}</button>`,`<button class='${this.options.classes.save}' type='button' data-editor-save>${this.options.labels.save}</button>`,"</div>","</form>","</div>","</div>"].join(""),r=s("div",{class:this.options.classes.modal,html:o});this.modalDOM=r,this.openModal();const d=l(this.options.classes.input),c=r.querySelector(`input${d}[type=text]`);c.focus(),c.selectionStart=c.selectionEnd=c.value.length,r.addEventListener("click",(t=>{const e=t.target;e instanceof Element&&(e.hasAttribute("data-editor-cancel")?(t.preventDefault(),this.options.cancelModal(this)&&this.closeModal()):e.hasAttribute("data-editor-save")&&(t.preventDefault(),this.saveCell(c.value)))}))}saveCell(t){const e=this.data.content,s=this.dt.columns.settings[this.data.columnIndex].type||this.dt.options.type,i=t.trim();let n;if("number"===s)n={data:parseFloat(i)};else if("boolean"===s)n=["","false","0"].includes(i)?{data:!1,text:"false",order:0}:{data:!0,text:"true",order:1};else if("html"===s)n={data:[{nodeName:"#text",data:t}],text:t,order:t};else if("string"===s)n={data:t};else if("date"===s){const e=this.dt.columns.settings[this.data.columnIndex].format||this.dt.options.format;n={data:t,order:Q(String(t),e)}}else n={data:t};this.dt.data.data[this.data.rowIndex].cells[this.data.columnIndex]=n,this.closeModal();const a=this.data.rowIndex,o=this.data.columnIndex;this.data={},this.dt.update(!0),this.editing=!1,this.editingCell=!1,this.dt.emit("editable.save.cell",t,e,a,o)}editRow(t){if(!t||"TR"!==t.nodeName||this.editing)return;const e=parseInt(t.dataset.index,10),s=this.dt.data.data[e];this.data={row:s.cells,rowIndex:e},this.editing=!0,this.editingRow=!0,this.options.inline?this.dt.update():this.editRowModal(),this.closeMenu()}editRowModal(){const t=this.data.row,e=[`<div class='${this.options.classes.inner}'>`,`<div class='${this.options.classes.header}'>`,`<h4>${this.options.labels.editRow}</h4>`,`<button class='${this.options.classes.close}' type='button' data-editor-cancel>${this.options.labels.closeX}</button>`," </div>",`<div class='${this.options.classes.block}'>`,`<form class='${this.options.classes.form}'>`,`<div class='${this.options.classes.row}'>`,`<button class='${this.options.classes.cancel}' type='button' data-editor-cancel>${this.options.labels.cancel}</button>`,`<button class='${this.options.classes.save}' type='button' data-editor-save>${this.options.labels.save}</button>`,"</div>","</form>","</div>","</div>"].join(""),i=s("div",{class:this.options.classes.modal,html:e}),o=i.firstElementChild;if(!o)return;const r=o.lastElementChild?.firstElementChild;if(!r)return;t.forEach(((t,e)=>{const i=this.dt.columns.settings[e];if((!i.hidden||i.hidden&&this.options.hiddenColumns)&&!this.options.excludeColumns.includes(e)){const i=this.dt.data.headings[e].text||String(this.dt.data.headings[e].data);r.insertBefore(s("div",{class:this.options.classes.row,html:[`<div class='${this.options.classes.row}'>`,`<label class='${this.options.classes.label}'>${a(i)}</label>`,`<input class='${this.options.classes.input}' value='${a(n(t))}' type='text'>`,"</div>"].join("")}),r.lastElementChild)}})),this.modalDOM=i,this.openModal();const d=l(this.options.classes.input),c=Array.from(r.querySelectorAll(`input${d}[type=text]`));i.addEventListener("click",(t=>{const e=t.target;if(e instanceof Element)if(e.hasAttribute("data-editor-cancel"))this.options.cancelModal(this)&&this.closeModal();else if(e.hasAttribute("data-editor-save")){const t=c.map((t=>t.value.trim()));this.saveRow(t,this.data.row)}}))}saveRow(t,e){const s=e.map((t=>n(t))),i=this.dt.data.data[this.data.rowIndex];if(t){let s=0;i.cells=e.map(((e,i)=>{if(this.options.excludeColumns.includes(i)||this.dt.columns.settings[i].hidden)return e;const n=this.dt.columns.settings[i].type||this.dt.options.type,a=t[s++];let o;if("number"===n)o={data:parseFloat(a)};else if("boolean"===n)o=["","false","0"].includes(a)?{data:!1,text:"false",order:0}:{data:!0,text:"true",order:1};else if("html"===n)o={data:[{nodeName:"#text",data:a}],text:a,order:a};else if("string"===n)o={data:a};else if("date"===n){const t=this.dt.columns.settings[i].format||this.dt.options.format;o={data:a,order:Q(String(a),t)}}else o={data:a};return o}))}const a=i.cells.map((t=>n(t)));this.data={},this.dt.update(!0),this.closeModal(),this.editing=!1,this.dt.emit("editable.save.row",a,s,e)}openModal(){this.modalDOM&&document.body.appendChild(this.modalDOM)}closeModal(){this.editing&&this.modalDOM&&(document.body.removeChild(this.modalDOM),this.modalDOM=this.editing=this.editingRow=this.editingCell=!1)}removeRow(t){if(!t||"TR"!==t.nodeName||this.editing)return;const e=parseInt(t.dataset.index,10);this.dt.rows.remove(e),this.closeMenu()}updateMenu(){const t=window.scrollX||window.pageXOffset,e=window.scrollY||window.pageYOffset;this.rect=this.wrapperDOM.getBoundingClientRect(),this.limits={x:window.innerWidth+t-this.rect.width,y:window.innerHeight+e-this.rect.height}}dismissMenu(t){const e=t.target;if(!(e instanceof Element)||this.wrapperDOM.contains(e))return;let s=!0;if(this.editing){const t=l(this.options.classes.input);s=!e.matches(`input${t}[type=text]`)}s&&this.closeMenu()}openMenu(){if(this.editing&&this.data&&this.editingCell){const t=l(this.options.classes.input),e=this.modalDOM?this.modalDOM.querySelector(`input${t}[type=text]`):this.dt.wrapperDOM.querySelector(`input${t}[type=text]`);this.saveCell(e.value)}document.body.appendChild(this.containerDOM),this.menuOpen=!0,this.dt.emit("editable.context.open")}closeMenu(){this.menuOpen&&(this.menuOpen=!1,document.body.removeChild(this.containerDOM),this.dt.emit("editable.context.close"))}destroy(){this.dt.dom.removeEventListener(this.options.clickEvent,this.events.click),this.dt.dom.removeEventListener("contextmenu",this.events.context),document.removeEventListener("click",this.events.dismissMenu),document.removeEventListener("keydown",this.events.keydown),window.removeEventListener("resize",this.events.reset),window.removeEventListener("scroll",this.events.reset),document.body.contains(this.containerDOM)&&document.body.removeChild(this.containerDOM),this.options.inline&&(this.dt.options.rowRender=this.originalRowRender),this.initialized=!1}rowRender(t,e,s){if(!this.data||this.data.rowIndex!==s)return e;if(this.editingCell){e.childNodes[function(t,e){let s=t,i=0;for(;i<t;)e[i].hidden&&(s-=1),i++;return s}(this.data.columnIndex,this.dt.columns.settings)].childNodes=[{nodeName:"INPUT",attributes:{type:"text",value:this.data.content,class:this.options.classes.input}}]}else e.childNodes.forEach(((s,i)=>{const n=o(i,this.dt.columns.settings),r=t[n];if(!this.options.excludeColumns.includes(n)){e.childNodes[i].childNodes=[{nodeName:"INPUT",attributes:{type:"text",value:a(r.text||String(r.data)||""),class:this.options.classes.input}}]}}));return e}}const pt=function(t,e={}){const s=new ut(t,e);return t.initialized?s.init():t.on("datatable.init",(()=>s.init())),s},ft={classes:{button:"datatable-column-filter-button",menu:"datatable-column-filter-menu",container:"datatable-column-filter-container",wrapper:"datatable-column-filter-wrapper"},labels:{button:"Filter columns within the table"},hiddenColumns:[]};class mt{addedButtonDOM;menuOpen;buttonDOM;dt;events;initialized;options;menuDOM;containerDOM;wrapperDOM;limits;rect;event;constructor(t,e={}){this.dt=t,this.options={...ft,...e}}init(){if(this.initialized)return;const t=l(this.options.classes.button);let e=this.dt.wrapperDOM.querySelector(t);if(!e){e=s("button",{class:this.options.classes.button,html:"▦"});const t=l(this.dt.options.classes.search),i=this.dt.wrapperDOM.querySelector(t);i?i.appendChild(e):this.dt.wrapperDOM.appendChild(e),this.addedButtonDOM=!0}this.buttonDOM=e,this.containerDOM=s("div",{id:this.options.classes.container}),this.wrapperDOM=s("div",{class:this.options.classes.wrapper}),this.menuDOM=s("ul",{class:this.options.classes.menu,html:this.dt.data.headings.map(((t,e)=>{const s=this.dt.columns.settings[e];return this.options.hiddenColumns.includes(e)?"":`<li data-column="${e}">\n                        <input type="checkbox" value="${t.text||t.data}" ${s.hidden?"":"checked=''"}>\n                        <label>\n                            ${t.text||t.data}\n                        </label>\n                    </li>`})).join("")}),this.wrapperDOM.appendChild(this.menuDOM),this.containerDOM.appendChild(this.wrapperDOM),this._measureSpace(),this._bind(),this.initialized=!0}dismiss(){this.addedButtonDOM&&this.buttonDOM.parentElement&&this.buttonDOM.parentElement.removeChild(this.buttonDOM),document.removeEventListener("click",this.events.click)}_bind(){this.events={click:this._click.bind(this)},document.addEventListener("click",this.events.click)}_openMenu(){document.body.appendChild(this.containerDOM),this._measureSpace(),this.menuOpen=!0,this.dt.emit("columnFilter.menu.open")}_closeMenu(){this.menuOpen&&(this.menuOpen=!1,document.body.removeChild(this.containerDOM),this.dt.emit("columnFilter.menu.close"))}_measureSpace(){const t=window.scrollX||window.pageXOffset,e=window.scrollY||window.pageYOffset;this.rect=this.wrapperDOM.getBoundingClientRect(),this.limits={x:window.innerWidth+t-this.rect.width,y:window.innerHeight+e-this.rect.height}}_click(t){const e=t.target;if(e instanceof Element)if(this.event=t,this.buttonDOM.contains(e)){if(t.preventDefault(),this.menuOpen)return void this._closeMenu();this._openMenu();let e=t.pageX,s=t.pageY;e>this.limits.x&&(e-=this.rect.width),s>this.limits.y&&(s-=this.rect.height),this.wrapperDOM.style.top=`${s}px`,this.wrapperDOM.style.left=`${e}px`}else if(this.menuDOM.contains(e)){const t=l(this.options.classes.menu),s=e.closest(`${t} > li`);if(!s)return;const i=s.querySelector("input[type=checkbox]");i.contains(e)||(i.checked=!i.checked);const n=Number(s.dataset.column);i.checked?this.dt.columns.show([n]):this.dt.columns.hide([n])}else this.menuOpen&&this._closeMenu()}}const gt=function(t,e={}){const s=new mt(t,e);return t.initialized?s.init():t.on("datatable.init",(()=>s.init())),s};
//# sourceMappingURL=module.js.map


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
/* harmony import */var _address_overview_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./address_overview/index.js */ "./js/address_overview/index.js");


const addressOverview = new _address_overview_index_js__WEBPACK_IMPORTED_MODULE_0__.AddressOverview()
addressOverview.init()

})()
;
//# sourceMappingURL=address_overview.js.map