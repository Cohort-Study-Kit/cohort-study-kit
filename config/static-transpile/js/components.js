(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({
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
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return __WEBPACK_DEFAULT_EXPORT__; }
});
/* harmony import */var _types_options__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types/options */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/types/options.js");
/* harmony import */var _l10n_default__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./l10n/default */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/l10n/default.js");
/* harmony import */var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/index.js");
/* harmony import */var _utils_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/dom */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/dom.js");
/* harmony import */var _utils_dates__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/dates */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/dates.js");
/* harmony import */var _utils_formatting__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/formatting */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/formatting.js");
/* harmony import */var _utils_polyfills__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/polyfills */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/polyfills.js");
/* harmony import */var _utils_polyfills__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_utils_polyfills__WEBPACK_IMPORTED_MODULE_6__);
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};







var DEBOUNCED_CHANGE_MS = 300;
function FlatpickrInstance(element, instanceConfig) {
    var self = {
        config: __assign(__assign({}, _types_options__WEBPACK_IMPORTED_MODULE_0__.defaults), flatpickr.defaultConfig),
        l10n: _l10n_default__WEBPACK_IMPORTED_MODULE_1__["default"],
    };
    self.parseDate = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.createDateParser)({ config: self.config, l10n: self.l10n });
    self._handlers = [];
    self.pluginElements = [];
    self.loadedPlugins = [];
    self._bind = bind;
    self._setHoursFromDate = setHoursFromDate;
    self._positionCalendar = positionCalendar;
    self.changeMonth = changeMonth;
    self.changeYear = changeYear;
    self.clear = clear;
    self.close = close;
    self.onMouseOver = onMouseOver;
    self._createElement = _utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement;
    self.createDay = createDay;
    self.destroy = destroy;
    self.isEnabled = isEnabled;
    self.jumpToDate = jumpToDate;
    self.updateValue = updateValue;
    self.open = open;
    self.redraw = redraw;
    self.set = set;
    self.setDate = setDate;
    self.toggle = toggle;
    function setupHelperFunctions() {
        self.utils = {
            getDaysInMonth: function (month, yr) {
                if (month === void 0) { month = self.currentMonth; }
                if (yr === void 0) { yr = self.currentYear; }
                if (month === 1 && ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0))
                    return 29;
                return self.l10n.daysInMonth[month];
            },
        };
    }
    function init() {
        self.element = self.input = element;
        self.isOpen = false;
        parseConfig();
        setupLocale();
        setupInputs();
        setupDates();
        setupHelperFunctions();
        if (!self.isMobile)
            build();
        bindEvents();
        if (self.selectedDates.length || self.config.noCalendar) {
            if (self.config.enableTime) {
                setHoursFromDate(self.config.noCalendar ? self.latestSelectedDateObj : undefined);
            }
            updateValue(false);
        }
        setCalendarWidth();
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (!self.isMobile && isSafari) {
            positionCalendar();
        }
        triggerEvent("onReady");
    }
    function getClosestActiveElement() {
        var _a;
        return (((_a = self.calendarContainer) === null || _a === void 0 ? void 0 : _a.getRootNode())
            .activeElement || document.activeElement);
    }
    function bindToInstance(fn) {
        return fn.bind(self);
    }
    function setCalendarWidth() {
        var config = self.config;
        if (config.weekNumbers === false && config.showMonths === 1) {
            return;
        }
        else if (config.noCalendar !== true) {
            window.requestAnimationFrame(function () {
                if (self.calendarContainer !== undefined) {
                    self.calendarContainer.style.visibility = "hidden";
                    self.calendarContainer.style.display = "block";
                }
                if (self.daysContainer !== undefined) {
                    var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
                    self.daysContainer.style.width = daysWidth + "px";
                    self.calendarContainer.style.width =
                        daysWidth +
                            (self.weekWrapper !== undefined
                                ? self.weekWrapper.offsetWidth
                                : 0) +
                            "px";
                    self.calendarContainer.style.removeProperty("visibility");
                    self.calendarContainer.style.removeProperty("display");
                }
            });
        }
    }
    function updateTime(e) {
        if (self.selectedDates.length === 0) {
            var defaultDate = self.config.minDate === undefined ||
                (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(new Date(), self.config.minDate) >= 0
                ? new Date()
                : new Date(self.config.minDate.getTime());
            var defaults = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.getDefaultHours)(self.config);
            defaultDate.setHours(defaults.hours, defaults.minutes, defaults.seconds, defaultDate.getMilliseconds());
            self.selectedDates = [defaultDate];
            self.latestSelectedDateObj = defaultDate;
        }
        if (e !== undefined && e.type !== "blur") {
            timeWrapper(e);
        }
        var prevValue = self._input.value;
        setHoursFromInputs();
        updateValue();
        if (self._input.value !== prevValue) {
            self._debouncedChange();
        }
    }
    function ampm2military(hour, amPM) {
        return (hour % 12) + 12 * (0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(amPM === self.l10n.amPM[1]);
    }
    function military2ampm(hour) {
        switch (hour % 24) {
            case 0:
            case 12:
                return 12;
            default:
                return hour % 12;
        }
    }
    function setHoursFromInputs() {
        if (self.hourElement === undefined || self.minuteElement === undefined)
            return;
        var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60, seconds = self.secondElement !== undefined
            ? (parseInt(self.secondElement.value, 10) || 0) % 60
            : 0;
        if (self.amPM !== undefined) {
            hours = ampm2military(hours, self.amPM.textContent);
        }
        var limitMinHours = self.config.minTime !== undefined ||
            (self.config.minDate &&
                self.minDateHasTime &&
                self.latestSelectedDateObj &&
                (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(self.latestSelectedDateObj, self.config.minDate, true) ===
                    0);
        var limitMaxHours = self.config.maxTime !== undefined ||
            (self.config.maxDate &&
                self.maxDateHasTime &&
                self.latestSelectedDateObj &&
                (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(self.latestSelectedDateObj, self.config.maxDate, true) ===
                    0);
        if (self.config.maxTime !== undefined &&
            self.config.minTime !== undefined &&
            self.config.minTime > self.config.maxTime) {
            var minBound = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.calculateSecondsSinceMidnight)(self.config.minTime.getHours(), self.config.minTime.getMinutes(), self.config.minTime.getSeconds());
            var maxBound = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.calculateSecondsSinceMidnight)(self.config.maxTime.getHours(), self.config.maxTime.getMinutes(), self.config.maxTime.getSeconds());
            var currentTime = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.calculateSecondsSinceMidnight)(hours, minutes, seconds);
            if (currentTime > maxBound && currentTime < minBound) {
                var result = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.parseSeconds)(minBound);
                hours = result[0];
                minutes = result[1];
                seconds = result[2];
            }
        }
        else {
            if (limitMaxHours) {
                var maxTime = self.config.maxTime !== undefined
                    ? self.config.maxTime
                    : self.config.maxDate;
                hours = Math.min(hours, maxTime.getHours());
                if (hours === maxTime.getHours())
                    minutes = Math.min(minutes, maxTime.getMinutes());
                if (minutes === maxTime.getMinutes())
                    seconds = Math.min(seconds, maxTime.getSeconds());
            }
            if (limitMinHours) {
                var minTime = self.config.minTime !== undefined
                    ? self.config.minTime
                    : self.config.minDate;
                hours = Math.max(hours, minTime.getHours());
                if (hours === minTime.getHours() && minutes < minTime.getMinutes())
                    minutes = minTime.getMinutes();
                if (minutes === minTime.getMinutes())
                    seconds = Math.max(seconds, minTime.getSeconds());
            }
        }
        setHours(hours, minutes, seconds);
    }
    function setHoursFromDate(dateObj) {
        var date = dateObj || self.latestSelectedDateObj;
        if (date && date instanceof Date) {
            setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
    }
    function setHours(hours, minutes, seconds) {
        if (self.latestSelectedDateObj !== undefined) {
            self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
        }
        if (!self.hourElement || !self.minuteElement || self.isMobile)
            return;
        self.hourElement.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(!self.config.time_24hr
            ? ((12 + hours) % 12) + 12 * (0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(hours % 12 === 0)
            : hours);
        self.minuteElement.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(minutes);
        if (self.amPM !== undefined)
            self.amPM.textContent = self.l10n.amPM[(0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(hours >= 12)];
        if (self.secondElement !== undefined)
            self.secondElement.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(seconds);
    }
    function onYearInput(event) {
        var eventTarget = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(event);
        var year = parseInt(eventTarget.value) + (event.delta || 0);
        if (year / 1000 > 1 ||
            (event.key === "Enter" && !/[^\d]/.test(year.toString()))) {
            changeYear(year);
        }
    }
    function bind(element, event, handler, options) {
        if (event instanceof Array)
            return event.forEach(function (ev) { return bind(element, ev, handler, options); });
        if (element instanceof Array)
            return element.forEach(function (el) { return bind(el, event, handler, options); });
        element.addEventListener(event, handler, options);
        self._handlers.push({
            remove: function () { return element.removeEventListener(event, handler, options); },
        });
    }
    function triggerChange() {
        triggerEvent("onChange");
    }
    function bindEvents() {
        if (self.config.wrap) {
            ["open", "close", "toggle", "clear"].forEach(function (evt) {
                Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function (el) {
                    return bind(el, "click", self[evt]);
                });
            });
        }
        if (self.isMobile) {
            setupMobile();
            return;
        }
        var debouncedResize = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.debounce)(onResize, 50);
        self._debouncedChange = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.debounce)(triggerChange, DEBOUNCED_CHANGE_MS);
        if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
            bind(self.daysContainer, "mouseover", function (e) {
                if (self.config.mode === "range")
                    onMouseOver((0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e));
            });
        bind(self._input, "keydown", onKeyDown);
        if (self.calendarContainer !== undefined) {
            bind(self.calendarContainer, "keydown", onKeyDown);
        }
        if (!self.config.inline && !self.config.static)
            bind(window, "resize", debouncedResize);
        if (window.ontouchstart !== undefined)
            bind(window.document, "touchstart", documentClick);
        else
            bind(window.document, "mousedown", documentClick);
        bind(window.document, "focus", documentClick, { capture: true });
        if (self.config.clickOpens === true) {
            bind(self._input, "focus", self.open);
            bind(self._input, "click", self.open);
        }
        if (self.daysContainer !== undefined) {
            bind(self.monthNav, "click", onMonthNavClick);
            bind(self.monthNav, ["keyup", "increment"], onYearInput);
            bind(self.daysContainer, "click", selectDate);
        }
        if (self.timeContainer !== undefined &&
            self.minuteElement !== undefined &&
            self.hourElement !== undefined) {
            var selText = function (e) {
                return (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e).select();
            };
            bind(self.timeContainer, ["increment"], updateTime);
            bind(self.timeContainer, "blur", updateTime, { capture: true });
            bind(self.timeContainer, "click", timeIncrement);
            bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
            if (self.secondElement !== undefined)
                bind(self.secondElement, "focus", function () { return self.secondElement && self.secondElement.select(); });
            if (self.amPM !== undefined) {
                bind(self.amPM, "click", function (e) {
                    updateTime(e);
                });
            }
        }
        if (self.config.allowInput) {
            bind(self._input, "blur", onBlur);
        }
    }
    function jumpToDate(jumpDate, triggerChange) {
        var jumpTo = jumpDate !== undefined
            ? self.parseDate(jumpDate)
            : self.latestSelectedDateObj ||
                (self.config.minDate && self.config.minDate > self.now
                    ? self.config.minDate
                    : self.config.maxDate && self.config.maxDate < self.now
                        ? self.config.maxDate
                        : self.now);
        var oldYear = self.currentYear;
        var oldMonth = self.currentMonth;
        try {
            if (jumpTo !== undefined) {
                self.currentYear = jumpTo.getFullYear();
                self.currentMonth = jumpTo.getMonth();
            }
        }
        catch (e) {
            e.message = "Invalid date supplied: " + jumpTo;
            self.config.errorHandler(e);
        }
        if (triggerChange && self.currentYear !== oldYear) {
            triggerEvent("onYearChange");
            buildMonthSwitch();
        }
        if (triggerChange &&
            (self.currentYear !== oldYear || self.currentMonth !== oldMonth)) {
            triggerEvent("onMonthChange");
        }
        self.redraw();
    }
    function timeIncrement(e) {
        var eventTarget = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
        if (~eventTarget.className.indexOf("arrow"))
            incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
    }
    function incrementNumInput(e, delta, inputElem) {
        var target = e && (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
        var input = inputElem ||
            (target && target.parentNode && target.parentNode.firstChild);
        var event = createEvent("increment");
        event.delta = delta;
        input && input.dispatchEvent(event);
    }
    function build() {
        var fragment = window.document.createDocumentFragment();
        self.calendarContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-calendar");
        self.calendarContainer.tabIndex = -1;
        if (!self.config.noCalendar) {
            fragment.appendChild(buildMonthNav());
            self.innerContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-innerContainer");
            if (self.config.weekNumbers) {
                var _a = buildWeeks(), weekWrapper = _a.weekWrapper, weekNumbers = _a.weekNumbers;
                self.innerContainer.appendChild(weekWrapper);
                self.weekNumbers = weekNumbers;
                self.weekWrapper = weekWrapper;
            }
            self.rContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-rContainer");
            self.rContainer.appendChild(buildWeekdays());
            if (!self.daysContainer) {
                self.daysContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-days");
                self.daysContainer.tabIndex = -1;
            }
            buildDays();
            self.rContainer.appendChild(self.daysContainer);
            self.innerContainer.appendChild(self.rContainer);
            fragment.appendChild(self.innerContainer);
        }
        if (self.config.enableTime) {
            fragment.appendChild(buildTime());
        }
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "rangeMode", self.config.mode === "range");
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "animate", self.config.animate === true);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
        self.calendarContainer.appendChild(fragment);
        var customAppend = self.config.appendTo !== undefined &&
            self.config.appendTo.nodeType !== undefined;
        if (self.config.inline || self.config.static) {
            self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");
            if (self.config.inline) {
                if (!customAppend && self.element.parentNode)
                    self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);
                else if (self.config.appendTo !== undefined)
                    self.config.appendTo.appendChild(self.calendarContainer);
            }
            if (self.config.static) {
                var wrapper = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-wrapper");
                if (self.element.parentNode)
                    self.element.parentNode.insertBefore(wrapper, self.element);
                wrapper.appendChild(self.element);
                if (self.altInput)
                    wrapper.appendChild(self.altInput);
                wrapper.appendChild(self.calendarContainer);
            }
        }
        if (!self.config.static && !self.config.inline)
            (self.config.appendTo !== undefined
                ? self.config.appendTo
                : window.document.body).appendChild(self.calendarContainer);
    }
    function createDay(className, date, _dayNumber, i) {
        var dateIsEnabled = isEnabled(date, true), dayElement = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", className, date.getDate().toString());
        dayElement.dateObj = date;
        dayElement.$i = i;
        dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));
        if (className.indexOf("hidden") === -1 &&
            (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(date, self.now) === 0) {
            self.todayDateElem = dayElement;
            dayElement.classList.add("today");
            dayElement.setAttribute("aria-current", "date");
        }
        if (dateIsEnabled) {
            dayElement.tabIndex = -1;
            if (isDateSelected(date)) {
                dayElement.classList.add("selected");
                self.selectedDateElem = dayElement;
                if (self.config.mode === "range") {
                    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(dayElement, "startRange", self.selectedDates[0] &&
                        (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(date, self.selectedDates[0], true) === 0);
                    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(dayElement, "endRange", self.selectedDates[1] &&
                        (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(date, self.selectedDates[1], true) === 0);
                    if (className === "nextMonthDay")
                        dayElement.classList.add("inRange");
                }
            }
        }
        else {
            dayElement.classList.add("flatpickr-disabled");
        }
        if (self.config.mode === "range") {
            if (isDateInRange(date) && !isDateSelected(date))
                dayElement.classList.add("inRange");
        }
        if (self.weekNumbers &&
            self.config.showMonths === 1 &&
            className !== "prevMonthDay" &&
            i % 7 === 6) {
            self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
        }
        triggerEvent("onDayCreate", dayElement);
        return dayElement;
    }
    function focusOnDayElem(targetNode) {
        targetNode.focus();
        if (self.config.mode === "range")
            onMouseOver(targetNode);
    }
    function getFirstAvailableDay(delta) {
        var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
        var endMonth = delta > 0 ? self.config.showMonths : -1;
        for (var m = startMonth; m != endMonth; m += delta) {
            var month = self.daysContainer.children[m];
            var startIndex = delta > 0 ? 0 : month.children.length - 1;
            var endIndex = delta > 0 ? month.children.length : -1;
            for (var i = startIndex; i != endIndex; i += delta) {
                var c = month.children[i];
                if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
                    return c;
            }
        }
        return undefined;
    }
    function getNextAvailableDay(current, delta) {
        var givenMonth = current.className.indexOf("Month") === -1
            ? current.dateObj.getMonth()
            : self.currentMonth;
        var endMonth = delta > 0 ? self.config.showMonths : -1;
        var loopDelta = delta > 0 ? 1 : -1;
        for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
            var month = self.daysContainer.children[m];
            var startIndex = givenMonth - self.currentMonth === m
                ? current.$i + delta
                : delta < 0
                    ? month.children.length - 1
                    : 0;
            var numMonthDays = month.children.length;
            for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
                var c = month.children[i];
                if (c.className.indexOf("hidden") === -1 &&
                    isEnabled(c.dateObj) &&
                    Math.abs(current.$i - i) >= Math.abs(delta))
                    return focusOnDayElem(c);
            }
        }
        self.changeMonth(loopDelta);
        focusOnDay(getFirstAvailableDay(loopDelta), 0);
        return undefined;
    }
    function focusOnDay(current, offset) {
        var activeElement = getClosestActiveElement();
        var dayFocused = isInView(activeElement || document.body);
        var startElem = current !== undefined
            ? current
            : dayFocused
                ? activeElement
                : self.selectedDateElem !== undefined && isInView(self.selectedDateElem)
                    ? self.selectedDateElem
                    : self.todayDateElem !== undefined && isInView(self.todayDateElem)
                        ? self.todayDateElem
                        : getFirstAvailableDay(offset > 0 ? 1 : -1);
        if (startElem === undefined) {
            self._input.focus();
        }
        else if (!dayFocused) {
            focusOnDayElem(startElem);
        }
        else {
            getNextAvailableDay(startElem, offset);
        }
    }
    function buildMonthDays(year, month) {
        var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
        var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12, year);
        var daysInMonth = self.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
        var dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
        for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
            days.appendChild(createDay("flatpickr-day " + prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
        }
        for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
            days.appendChild(createDay("flatpickr-day", new Date(year, month, dayNumber), dayNumber, dayIndex));
        }
        for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth &&
            (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
            days.appendChild(createDay("flatpickr-day " + nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
        }
        var dayContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "dayContainer");
        dayContainer.appendChild(days);
        return dayContainer;
    }
    function buildDays() {
        if (self.daysContainer === undefined) {
            return;
        }
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.clearNode)(self.daysContainer);
        if (self.weekNumbers)
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.clearNode)(self.weekNumbers);
        var frag = document.createDocumentFragment();
        for (var i = 0; i < self.config.showMonths; i++) {
            var d = new Date(self.currentYear, self.currentMonth, 1);
            d.setMonth(self.currentMonth + i);
            frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
        }
        self.daysContainer.appendChild(frag);
        self.days = self.daysContainer.firstChild;
        if (self.config.mode === "range" && self.selectedDates.length === 1) {
            onMouseOver();
        }
    }
    function buildMonthSwitch() {
        if (self.config.showMonths > 1 ||
            self.config.monthSelectorType !== "dropdown")
            return;
        var shouldBuildMonth = function (month) {
            if (self.config.minDate !== undefined &&
                self.currentYear === self.config.minDate.getFullYear() &&
                month < self.config.minDate.getMonth()) {
                return false;
            }
            return !(self.config.maxDate !== undefined &&
                self.currentYear === self.config.maxDate.getFullYear() &&
                month > self.config.maxDate.getMonth());
        };
        self.monthsDropdownContainer.tabIndex = -1;
        self.monthsDropdownContainer.innerHTML = "";
        for (var i = 0; i < 12; i++) {
            if (!shouldBuildMonth(i))
                continue;
            var month = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("option", "flatpickr-monthDropdown-month");
            month.value = new Date(self.currentYear, i).getMonth().toString();
            month.textContent = (0,_utils_formatting__WEBPACK_IMPORTED_MODULE_5__.monthToStr)(i, self.config.shorthandCurrentMonth, self.l10n);
            month.tabIndex = -1;
            if (self.currentMonth === i) {
                month.selected = true;
            }
            self.monthsDropdownContainer.appendChild(month);
        }
    }
    function buildMonth() {
        var container = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-month");
        var monthNavFragment = window.document.createDocumentFragment();
        var monthElement;
        if (self.config.showMonths > 1 ||
            self.config.monthSelectorType === "static") {
            monthElement = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "cur-month");
        }
        else {
            self.monthsDropdownContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("select", "flatpickr-monthDropdown-months");
            self.monthsDropdownContainer.setAttribute("aria-label", self.l10n.monthAriaLabel);
            bind(self.monthsDropdownContainer, "change", function (e) {
                var target = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
                var selectedMonth = parseInt(target.value, 10);
                self.changeMonth(selectedMonth - self.currentMonth);
                triggerEvent("onMonthChange");
            });
            buildMonthSwitch();
            monthElement = self.monthsDropdownContainer;
        }
        var yearInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createNumberInput)("cur-year", { tabindex: "-1" });
        var yearElement = yearInput.getElementsByTagName("input")[0];
        yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
        if (self.config.minDate) {
            yearElement.setAttribute("min", self.config.minDate.getFullYear().toString());
        }
        if (self.config.maxDate) {
            yearElement.setAttribute("max", self.config.maxDate.getFullYear().toString());
            yearElement.disabled =
                !!self.config.minDate &&
                    self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
        }
        var currentMonth = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-current-month");
        currentMonth.appendChild(monthElement);
        currentMonth.appendChild(yearInput);
        monthNavFragment.appendChild(currentMonth);
        container.appendChild(monthNavFragment);
        return {
            container: container,
            yearElement: yearElement,
            monthElement: monthElement,
        };
    }
    function buildMonths() {
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.clearNode)(self.monthNav);
        self.monthNav.appendChild(self.prevMonthNav);
        if (self.config.showMonths) {
            self.yearElements = [];
            self.monthElements = [];
        }
        for (var m = self.config.showMonths; m--;) {
            var month = buildMonth();
            self.yearElements.push(month.yearElement);
            self.monthElements.push(month.monthElement);
            self.monthNav.appendChild(month.container);
        }
        self.monthNav.appendChild(self.nextMonthNav);
    }
    function buildMonthNav() {
        self.monthNav = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-months");
        self.yearElements = [];
        self.monthElements = [];
        self.prevMonthNav = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "flatpickr-prev-month");
        self.prevMonthNav.innerHTML = self.config.prevArrow;
        self.nextMonthNav = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "flatpickr-next-month");
        self.nextMonthNav.innerHTML = self.config.nextArrow;
        buildMonths();
        Object.defineProperty(self, "_hidePrevMonthArrow", {
            get: function () { return self.__hidePrevMonthArrow; },
            set: function (bool) {
                if (self.__hidePrevMonthArrow !== bool) {
                    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.prevMonthNav, "flatpickr-disabled", bool);
                    self.__hidePrevMonthArrow = bool;
                }
            },
        });
        Object.defineProperty(self, "_hideNextMonthArrow", {
            get: function () { return self.__hideNextMonthArrow; },
            set: function (bool) {
                if (self.__hideNextMonthArrow !== bool) {
                    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.nextMonthNav, "flatpickr-disabled", bool);
                    self.__hideNextMonthArrow = bool;
                }
            },
        });
        self.currentYearElement = self.yearElements[0];
        updateNavigationCurrentMonth();
        return self.monthNav;
    }
    function buildTime() {
        self.calendarContainer.classList.add("hasTime");
        if (self.config.noCalendar)
            self.calendarContainer.classList.add("noCalendar");
        var defaults = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.getDefaultHours)(self.config);
        self.timeContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-time");
        self.timeContainer.tabIndex = -1;
        var separator = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "flatpickr-time-separator", ":");
        var hourInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createNumberInput)("flatpickr-hour", {
            "aria-label": self.l10n.hourAriaLabel,
        });
        self.hourElement = hourInput.getElementsByTagName("input")[0];
        var minuteInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createNumberInput)("flatpickr-minute", {
            "aria-label": self.l10n.minuteAriaLabel,
        });
        self.minuteElement = minuteInput.getElementsByTagName("input")[0];
        self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
        self.hourElement.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(self.latestSelectedDateObj
            ? self.latestSelectedDateObj.getHours()
            : self.config.time_24hr
                ? defaults.hours
                : military2ampm(defaults.hours));
        self.minuteElement.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(self.latestSelectedDateObj
            ? self.latestSelectedDateObj.getMinutes()
            : defaults.minutes);
        self.hourElement.setAttribute("step", self.config.hourIncrement.toString());
        self.minuteElement.setAttribute("step", self.config.minuteIncrement.toString());
        self.hourElement.setAttribute("min", self.config.time_24hr ? "0" : "1");
        self.hourElement.setAttribute("max", self.config.time_24hr ? "23" : "12");
        self.hourElement.setAttribute("maxlength", "2");
        self.minuteElement.setAttribute("min", "0");
        self.minuteElement.setAttribute("max", "59");
        self.minuteElement.setAttribute("maxlength", "2");
        self.timeContainer.appendChild(hourInput);
        self.timeContainer.appendChild(separator);
        self.timeContainer.appendChild(minuteInput);
        if (self.config.time_24hr)
            self.timeContainer.classList.add("time24hr");
        if (self.config.enableSeconds) {
            self.timeContainer.classList.add("hasSeconds");
            var secondInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createNumberInput)("flatpickr-second");
            self.secondElement = secondInput.getElementsByTagName("input")[0];
            self.secondElement.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(self.latestSelectedDateObj
                ? self.latestSelectedDateObj.getSeconds()
                : defaults.seconds);
            self.secondElement.setAttribute("step", self.minuteElement.getAttribute("step"));
            self.secondElement.setAttribute("min", "0");
            self.secondElement.setAttribute("max", "59");
            self.secondElement.setAttribute("maxlength", "2");
            self.timeContainer.appendChild((0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "flatpickr-time-separator", ":"));
            self.timeContainer.appendChild(secondInput);
        }
        if (!self.config.time_24hr) {
            self.amPM = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "flatpickr-am-pm", self.l10n.amPM[(0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)((self.latestSelectedDateObj
                ? self.hourElement.value
                : self.config.defaultHour) > 11)]);
            self.amPM.title = self.l10n.toggleTitle;
            self.amPM.tabIndex = -1;
            self.timeContainer.appendChild(self.amPM);
        }
        return self.timeContainer;
    }
    function buildWeekdays() {
        if (!self.weekdayContainer)
            self.weekdayContainer = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-weekdays");
        else
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.clearNode)(self.weekdayContainer);
        for (var i = self.config.showMonths; i--;) {
            var container = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-weekdaycontainer");
            self.weekdayContainer.appendChild(container);
        }
        updateWeekdays();
        return self.weekdayContainer;
    }
    function updateWeekdays() {
        if (!self.weekdayContainer) {
            return;
        }
        var firstDayOfWeek = self.l10n.firstDayOfWeek;
        var weekdays = __spreadArrays(self.l10n.weekdays.shorthand);
        if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
            weekdays = __spreadArrays(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
        }
        for (var i = self.config.showMonths; i--;) {
            self.weekdayContainer.children[i].innerHTML = "\n      <span class='flatpickr-weekday'>\n        " + weekdays.join("</span><span class='flatpickr-weekday'>") + "\n      </span>\n      ";
        }
    }
    function buildWeeks() {
        self.calendarContainer.classList.add("hasWeeks");
        var weekWrapper = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-weekwrapper");
        weekWrapper.appendChild((0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
        var weekNumbers = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("div", "flatpickr-weeks");
        weekWrapper.appendChild(weekNumbers);
        return {
            weekWrapper: weekWrapper,
            weekNumbers: weekNumbers,
        };
    }
    function changeMonth(value, isOffset) {
        if (isOffset === void 0) { isOffset = true; }
        var delta = isOffset ? value : value - self.currentMonth;
        if ((delta < 0 && self._hidePrevMonthArrow === true) ||
            (delta > 0 && self._hideNextMonthArrow === true))
            return;
        self.currentMonth += delta;
        if (self.currentMonth < 0 || self.currentMonth > 11) {
            self.currentYear += self.currentMonth > 11 ? 1 : -1;
            self.currentMonth = (self.currentMonth + 12) % 12;
            triggerEvent("onYearChange");
            buildMonthSwitch();
        }
        buildDays();
        triggerEvent("onMonthChange");
        updateNavigationCurrentMonth();
    }
    function clear(triggerChangeEvent, toInitial) {
        if (triggerChangeEvent === void 0) { triggerChangeEvent = true; }
        if (toInitial === void 0) { toInitial = true; }
        self.input.value = "";
        if (self.altInput !== undefined)
            self.altInput.value = "";
        if (self.mobileInput !== undefined)
            self.mobileInput.value = "";
        self.selectedDates = [];
        self.latestSelectedDateObj = undefined;
        if (toInitial === true) {
            self.currentYear = self._initialDate.getFullYear();
            self.currentMonth = self._initialDate.getMonth();
        }
        if (self.config.enableTime === true) {
            var _a = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.getDefaultHours)(self.config), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
            setHours(hours, minutes, seconds);
        }
        self.redraw();
        if (triggerChangeEvent)
            triggerEvent("onChange");
    }
    function close() {
        self.isOpen = false;
        if (!self.isMobile) {
            if (self.calendarContainer !== undefined) {
                self.calendarContainer.classList.remove("open");
            }
            if (self._input !== undefined) {
                self._input.classList.remove("active");
            }
        }
        triggerEvent("onClose");
    }
    function destroy() {
        if (self.config !== undefined)
            triggerEvent("onDestroy");
        for (var i = self._handlers.length; i--;) {
            self._handlers[i].remove();
        }
        self._handlers = [];
        if (self.mobileInput) {
            if (self.mobileInput.parentNode)
                self.mobileInput.parentNode.removeChild(self.mobileInput);
            self.mobileInput = undefined;
        }
        else if (self.calendarContainer && self.calendarContainer.parentNode) {
            if (self.config.static && self.calendarContainer.parentNode) {
                var wrapper = self.calendarContainer.parentNode;
                wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
                if (wrapper.parentNode) {
                    while (wrapper.firstChild)
                        wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                    wrapper.parentNode.removeChild(wrapper);
                }
            }
            else
                self.calendarContainer.parentNode.removeChild(self.calendarContainer);
        }
        if (self.altInput) {
            self.input.type = "text";
            if (self.altInput.parentNode)
                self.altInput.parentNode.removeChild(self.altInput);
            delete self.altInput;
        }
        if (self.input) {
            self.input.type = self.input._type;
            self.input.classList.remove("flatpickr-input");
            self.input.removeAttribute("readonly");
        }
        [
            "_showTimeInput",
            "latestSelectedDateObj",
            "_hideNextMonthArrow",
            "_hidePrevMonthArrow",
            "__hideNextMonthArrow",
            "__hidePrevMonthArrow",
            "isMobile",
            "isOpen",
            "selectedDateElem",
            "minDateHasTime",
            "maxDateHasTime",
            "days",
            "daysContainer",
            "_input",
            "_positionElement",
            "innerContainer",
            "rContainer",
            "monthNav",
            "todayDateElem",
            "calendarContainer",
            "weekdayContainer",
            "prevMonthNav",
            "nextMonthNav",
            "monthsDropdownContainer",
            "currentMonthElement",
            "currentYearElement",
            "navigationCurrentMonth",
            "selectedDateElem",
            "config",
        ].forEach(function (k) {
            try {
                delete self[k];
            }
            catch (_) { }
        });
    }
    function isCalendarElem(elem) {
        return self.calendarContainer.contains(elem);
    }
    function documentClick(e) {
        if (self.isOpen && !self.config.inline) {
            var eventTarget_1 = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
            var isCalendarElement = isCalendarElem(eventTarget_1);
            var isInput = eventTarget_1 === self.input ||
                eventTarget_1 === self.altInput ||
                self.element.contains(eventTarget_1) ||
                (e.path &&
                    e.path.indexOf &&
                    (~e.path.indexOf(self.input) ||
                        ~e.path.indexOf(self.altInput)));
            var lostFocus = !isInput &&
                !isCalendarElement &&
                !isCalendarElem(e.relatedTarget);
            var isIgnored = !self.config.ignoredFocusElements.some(function (elem) {
                return elem.contains(eventTarget_1);
            });
            if (lostFocus && isIgnored) {
                if (self.config.allowInput) {
                    self.setDate(self._input.value, false, self.config.altInput
                        ? self.config.altFormat
                        : self.config.dateFormat);
                }
                if (self.timeContainer !== undefined &&
                    self.minuteElement !== undefined &&
                    self.hourElement !== undefined &&
                    self.input.value !== "" &&
                    self.input.value !== undefined) {
                    updateTime();
                }
                self.close();
                if (self.config &&
                    self.config.mode === "range" &&
                    self.selectedDates.length === 1)
                    self.clear(false);
            }
        }
    }
    function changeYear(newYear) {
        if (!newYear ||
            (self.config.minDate && newYear < self.config.minDate.getFullYear()) ||
            (self.config.maxDate && newYear > self.config.maxDate.getFullYear()))
            return;
        var newYearNum = newYear, isNewYear = self.currentYear !== newYearNum;
        self.currentYear = newYearNum || self.currentYear;
        if (self.config.maxDate &&
            self.currentYear === self.config.maxDate.getFullYear()) {
            self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
        }
        else if (self.config.minDate &&
            self.currentYear === self.config.minDate.getFullYear()) {
            self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
        }
        if (isNewYear) {
            self.redraw();
            triggerEvent("onYearChange");
            buildMonthSwitch();
        }
    }
    function isEnabled(date, timeless) {
        var _a;
        if (timeless === void 0) { timeless = true; }
        var dateToCheck = self.parseDate(date, undefined, timeless);
        if ((self.config.minDate &&
            dateToCheck &&
            (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(dateToCheck, self.config.minDate, timeless !== undefined ? timeless : !self.minDateHasTime) < 0) ||
            (self.config.maxDate &&
                dateToCheck &&
                (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(dateToCheck, self.config.maxDate, timeless !== undefined ? timeless : !self.maxDateHasTime) > 0))
            return false;
        if (!self.config.enable && self.config.disable.length === 0)
            return true;
        if (dateToCheck === undefined)
            return false;
        var bool = !!self.config.enable, array = (_a = self.config.enable) !== null && _a !== void 0 ? _a : self.config.disable;
        for (var i = 0, d = void 0; i < array.length; i++) {
            d = array[i];
            if (typeof d === "function" &&
                d(dateToCheck))
                return bool;
            else if (d instanceof Date &&
                dateToCheck !== undefined &&
                d.getTime() === dateToCheck.getTime())
                return bool;
            else if (typeof d === "string") {
                var parsed = self.parseDate(d, undefined, true);
                return parsed && parsed.getTime() === dateToCheck.getTime()
                    ? bool
                    : !bool;
            }
            else if (typeof d === "object" &&
                dateToCheck !== undefined &&
                d.from &&
                d.to &&
                dateToCheck.getTime() >= d.from.getTime() &&
                dateToCheck.getTime() <= d.to.getTime())
                return bool;
        }
        return !bool;
    }
    function isInView(elem) {
        if (self.daysContainer !== undefined)
            return (elem.className.indexOf("hidden") === -1 &&
                elem.className.indexOf("flatpickr-disabled") === -1 &&
                self.daysContainer.contains(elem));
        return false;
    }
    function onBlur(e) {
        var isInput = e.target === self._input;
        var valueChanged = self._input.value.trimEnd() !== getDateStr();
        if (isInput &&
            valueChanged &&
            !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
            self.setDate(self._input.value, true, e.target === self.altInput
                ? self.config.altFormat
                : self.config.dateFormat);
        }
    }
    function onKeyDown(e) {
        var eventTarget = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
        var isInput = self.config.wrap
            ? element.contains(eventTarget)
            : eventTarget === self._input;
        var allowInput = self.config.allowInput;
        var allowKeydown = self.isOpen && (!allowInput || !isInput);
        var allowInlineKeydown = self.config.inline && isInput && !allowInput;
        if (e.keyCode === 13 && isInput) {
            if (allowInput) {
                self.setDate(self._input.value, true, eventTarget === self.altInput
                    ? self.config.altFormat
                    : self.config.dateFormat);
                self.close();
                return eventTarget.blur();
            }
            else {
                self.open();
            }
        }
        else if (isCalendarElem(eventTarget) ||
            allowKeydown ||
            allowInlineKeydown) {
            var isTimeObj = !!self.timeContainer &&
                self.timeContainer.contains(eventTarget);
            switch (e.keyCode) {
                case 13:
                    if (isTimeObj) {
                        e.preventDefault();
                        updateTime();
                        focusAndClose();
                    }
                    else
                        selectDate(e);
                    break;
                case 27:
                    e.preventDefault();
                    focusAndClose();
                    break;
                case 8:
                case 46:
                    if (isInput && !self.config.allowInput) {
                        e.preventDefault();
                        self.clear();
                    }
                    break;
                case 37:
                case 39:
                    if (!isTimeObj && !isInput) {
                        e.preventDefault();
                        var activeElement = getClosestActiveElement();
                        if (self.daysContainer !== undefined &&
                            (allowInput === false ||
                                (activeElement && isInView(activeElement)))) {
                            var delta_1 = e.keyCode === 39 ? 1 : -1;
                            if (!e.ctrlKey)
                                focusOnDay(undefined, delta_1);
                            else {
                                e.stopPropagation();
                                changeMonth(delta_1);
                                focusOnDay(getFirstAvailableDay(1), 0);
                            }
                        }
                    }
                    else if (self.hourElement)
                        self.hourElement.focus();
                    break;
                case 38:
                case 40:
                    e.preventDefault();
                    var delta = e.keyCode === 40 ? 1 : -1;
                    if ((self.daysContainer &&
                        eventTarget.$i !== undefined) ||
                        eventTarget === self.input ||
                        eventTarget === self.altInput) {
                        if (e.ctrlKey) {
                            e.stopPropagation();
                            changeYear(self.currentYear - delta);
                            focusOnDay(getFirstAvailableDay(1), 0);
                        }
                        else if (!isTimeObj)
                            focusOnDay(undefined, delta * 7);
                    }
                    else if (eventTarget === self.currentYearElement) {
                        changeYear(self.currentYear - delta);
                    }
                    else if (self.config.enableTime) {
                        if (!isTimeObj && self.hourElement)
                            self.hourElement.focus();
                        updateTime(e);
                        self._debouncedChange();
                    }
                    break;
                case 9:
                    if (isTimeObj) {
                        var elems = [
                            self.hourElement,
                            self.minuteElement,
                            self.secondElement,
                            self.amPM,
                        ]
                            .concat(self.pluginElements)
                            .filter(function (x) { return x; });
                        var i = elems.indexOf(eventTarget);
                        if (i !== -1) {
                            var target = elems[i + (e.shiftKey ? -1 : 1)];
                            e.preventDefault();
                            (target || self._input).focus();
                        }
                    }
                    else if (!self.config.noCalendar &&
                        self.daysContainer &&
                        self.daysContainer.contains(eventTarget) &&
                        e.shiftKey) {
                        e.preventDefault();
                        self._input.focus();
                    }
                    break;
                default:
                    break;
            }
        }
        if (self.amPM !== undefined && eventTarget === self.amPM) {
            switch (e.key) {
                case self.l10n.amPM[0].charAt(0):
                case self.l10n.amPM[0].charAt(0).toLowerCase():
                    self.amPM.textContent = self.l10n.amPM[0];
                    setHoursFromInputs();
                    updateValue();
                    break;
                case self.l10n.amPM[1].charAt(0):
                case self.l10n.amPM[1].charAt(0).toLowerCase():
                    self.amPM.textContent = self.l10n.amPM[1];
                    setHoursFromInputs();
                    updateValue();
                    break;
            }
        }
        if (isInput || isCalendarElem(eventTarget)) {
            triggerEvent("onKeyDown", e);
        }
    }
    function onMouseOver(elem, cellClass) {
        if (cellClass === void 0) { cellClass = "flatpickr-day"; }
        if (self.selectedDates.length !== 1 ||
            (elem &&
                (!elem.classList.contains(cellClass) ||
                    elem.classList.contains("flatpickr-disabled"))))
            return;
        var hoverDate = elem
            ? elem.dateObj.getTime()
            : self.days.firstElementChild.dateObj.getTime(), initialDate = self.parseDate(self.selectedDates[0], undefined, true).getTime(), rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime());
        var containsDisabled = false;
        var minRange = 0, maxRange = 0;
        for (var t = rangeStartDate; t < rangeEndDate; t += _utils_dates__WEBPACK_IMPORTED_MODULE_4__.duration.DAY) {
            if (!isEnabled(new Date(t), true)) {
                containsDisabled =
                    containsDisabled || (t > rangeStartDate && t < rangeEndDate);
                if (t < initialDate && (!minRange || t > minRange))
                    minRange = t;
                else if (t > initialDate && (!maxRange || t < maxRange))
                    maxRange = t;
            }
        }
        var hoverableCells = Array.from(self.rContainer.querySelectorAll("*:nth-child(-n+" + self.config.showMonths + ") > ." + cellClass));
        hoverableCells.forEach(function (dayElem) {
            var date = dayElem.dateObj;
            var timestamp = date.getTime();
            var outOfRange = (minRange > 0 && timestamp < minRange) ||
                (maxRange > 0 && timestamp > maxRange);
            if (outOfRange) {
                dayElem.classList.add("notAllowed");
                ["inRange", "startRange", "endRange"].forEach(function (c) {
                    dayElem.classList.remove(c);
                });
                return;
            }
            else if (containsDisabled && !outOfRange)
                return;
            ["startRange", "inRange", "endRange", "notAllowed"].forEach(function (c) {
                dayElem.classList.remove(c);
            });
            if (elem !== undefined) {
                elem.classList.add(hoverDate <= self.selectedDates[0].getTime()
                    ? "startRange"
                    : "endRange");
                if (initialDate < hoverDate && timestamp === initialDate)
                    dayElem.classList.add("startRange");
                else if (initialDate > hoverDate && timestamp === initialDate)
                    dayElem.classList.add("endRange");
                if (timestamp >= minRange &&
                    (maxRange === 0 || timestamp <= maxRange) &&
                    (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.isBetween)(timestamp, initialDate, hoverDate))
                    dayElem.classList.add("inRange");
            }
        });
    }
    function onResize() {
        if (self.isOpen && !self.config.static && !self.config.inline)
            positionCalendar();
    }
    function open(e, positionElement) {
        if (positionElement === void 0) { positionElement = self._positionElement; }
        if (self.isMobile === true) {
            if (e) {
                e.preventDefault();
                var eventTarget = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
                if (eventTarget) {
                    eventTarget.blur();
                }
            }
            if (self.mobileInput !== undefined) {
                self.mobileInput.focus();
                self.mobileInput.click();
            }
            triggerEvent("onOpen");
            return;
        }
        else if (self._input.disabled || self.config.inline) {
            return;
        }
        var wasOpen = self.isOpen;
        self.isOpen = true;
        if (!wasOpen) {
            self.calendarContainer.classList.add("open");
            self._input.classList.add("active");
            triggerEvent("onOpen");
            positionCalendar(positionElement);
        }
        if (self.config.enableTime === true && self.config.noCalendar === true) {
            if (self.config.allowInput === false &&
                (e === undefined ||
                    !self.timeContainer.contains(e.relatedTarget))) {
                setTimeout(function () { return self.hourElement.select(); }, 50);
            }
        }
    }
    function minMaxDateSetter(type) {
        return function (date) {
            var dateObj = (self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat));
            var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];
            if (dateObj !== undefined) {
                self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] =
                    dateObj.getHours() > 0 ||
                        dateObj.getMinutes() > 0 ||
                        dateObj.getSeconds() > 0;
            }
            if (self.selectedDates) {
                self.selectedDates = self.selectedDates.filter(function (d) { return isEnabled(d); });
                if (!self.selectedDates.length && type === "min")
                    setHoursFromDate(dateObj);
                updateValue();
            }
            if (self.daysContainer) {
                redraw();
                if (dateObj !== undefined)
                    self.currentYearElement[type] = dateObj.getFullYear().toString();
                else
                    self.currentYearElement.removeAttribute(type);
                self.currentYearElement.disabled =
                    !!inverseDateObj &&
                        dateObj !== undefined &&
                        inverseDateObj.getFullYear() === dateObj.getFullYear();
            }
        };
    }
    function parseConfig() {
        var boolOpts = [
            "wrap",
            "weekNumbers",
            "allowInput",
            "allowInvalidPreload",
            "clickOpens",
            "time_24hr",
            "enableTime",
            "noCalendar",
            "altInput",
            "shorthandCurrentMonth",
            "inline",
            "static",
            "enableSeconds",
            "disableMobile",
        ];
        var userConfig = __assign(__assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
        var formats = {};
        self.config.parseDate = userConfig.parseDate;
        self.config.formatDate = userConfig.formatDate;
        Object.defineProperty(self.config, "enable", {
            get: function () { return self.config._enable; },
            set: function (dates) {
                self.config._enable = parseDateRules(dates);
            },
        });
        Object.defineProperty(self.config, "disable", {
            get: function () { return self.config._disable; },
            set: function (dates) {
                self.config._disable = parseDateRules(dates);
            },
        });
        var timeMode = userConfig.mode === "time";
        if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
            var defaultDateFormat = flatpickr.defaultConfig.dateFormat || _types_options__WEBPACK_IMPORTED_MODULE_0__.defaults.dateFormat;
            formats.dateFormat =
                userConfig.noCalendar || timeMode
                    ? "H:i" + (userConfig.enableSeconds ? ":S" : "")
                    : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
        }
        if (userConfig.altInput &&
            (userConfig.enableTime || timeMode) &&
            !userConfig.altFormat) {
            var defaultAltFormat = flatpickr.defaultConfig.altFormat || _types_options__WEBPACK_IMPORTED_MODULE_0__.defaults.altFormat;
            formats.altFormat =
                userConfig.noCalendar || timeMode
                    ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K")
                    : defaultAltFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
        }
        Object.defineProperty(self.config, "minDate", {
            get: function () { return self.config._minDate; },
            set: minMaxDateSetter("min"),
        });
        Object.defineProperty(self.config, "maxDate", {
            get: function () { return self.config._maxDate; },
            set: minMaxDateSetter("max"),
        });
        var minMaxTimeSetter = function (type) { return function (val) {
            self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i:S");
        }; };
        Object.defineProperty(self.config, "minTime", {
            get: function () { return self.config._minTime; },
            set: minMaxTimeSetter("min"),
        });
        Object.defineProperty(self.config, "maxTime", {
            get: function () { return self.config._maxTime; },
            set: minMaxTimeSetter("max"),
        });
        if (userConfig.mode === "time") {
            self.config.noCalendar = true;
            self.config.enableTime = true;
        }
        Object.assign(self.config, formats, userConfig);
        for (var i = 0; i < boolOpts.length; i++)
            self.config[boolOpts[i]] =
                self.config[boolOpts[i]] === true ||
                    self.config[boolOpts[i]] === "true";
        _types_options__WEBPACK_IMPORTED_MODULE_0__.HOOKS.filter(function (hook) { return self.config[hook] !== undefined; }).forEach(function (hook) {
            self.config[hook] = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.arrayify)(self.config[hook] || []).map(bindToInstance);
        });
        self.isMobile =
            !self.config.disableMobile &&
                !self.config.inline &&
                self.config.mode === "single" &&
                !self.config.disable.length &&
                !self.config.enable &&
                !self.config.weekNumbers &&
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        for (var i = 0; i < self.config.plugins.length; i++) {
            var pluginConf = self.config.plugins[i](self) || {};
            for (var key in pluginConf) {
                if (_types_options__WEBPACK_IMPORTED_MODULE_0__.HOOKS.indexOf(key) > -1) {
                    self.config[key] = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.arrayify)(pluginConf[key])
                        .map(bindToInstance)
                        .concat(self.config[key]);
                }
                else if (typeof userConfig[key] === "undefined")
                    self.config[key] = pluginConf[key];
            }
        }
        if (!userConfig.altInputClass) {
            self.config.altInputClass =
                getInputElem().className + " " + self.config.altInputClass;
        }
        triggerEvent("onParseConfig");
    }
    function getInputElem() {
        return self.config.wrap
            ? element.querySelector("[data-input]")
            : element;
    }
    function setupLocale() {
        if (typeof self.config.locale !== "object" &&
            typeof flatpickr.l10ns[self.config.locale] === "undefined")
            self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
        self.l10n = __assign(__assign({}, flatpickr.l10ns.default), (typeof self.config.locale === "object"
            ? self.config.locale
            : self.config.locale !== "default"
                ? flatpickr.l10ns[self.config.locale]
                : undefined));
        _utils_formatting__WEBPACK_IMPORTED_MODULE_5__.tokenRegex.D = "(" + self.l10n.weekdays.shorthand.join("|") + ")";
        _utils_formatting__WEBPACK_IMPORTED_MODULE_5__.tokenRegex.l = "(" + self.l10n.weekdays.longhand.join("|") + ")";
        _utils_formatting__WEBPACK_IMPORTED_MODULE_5__.tokenRegex.M = "(" + self.l10n.months.shorthand.join("|") + ")";
        _utils_formatting__WEBPACK_IMPORTED_MODULE_5__.tokenRegex.F = "(" + self.l10n.months.longhand.join("|") + ")";
        _utils_formatting__WEBPACK_IMPORTED_MODULE_5__.tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
        var userConfig = __assign(__assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
        if (userConfig.time_24hr === undefined &&
            flatpickr.defaultConfig.time_24hr === undefined) {
            self.config.time_24hr = self.l10n.time_24hr;
        }
        self.formatDate = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.createDateFormatter)(self);
        self.parseDate = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.createDateParser)({ config: self.config, l10n: self.l10n });
    }
    function positionCalendar(customPositionElement) {
        if (typeof self.config.position === "function") {
            return void self.config.position(self, customPositionElement);
        }
        if (self.calendarContainer === undefined)
            return;
        triggerEvent("onPreCalendarPosition");
        var positionElement = customPositionElement || self._positionElement;
        var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, (function (acc, child) { return acc + child.offsetHeight; }), 0), calendarWidth = self.calendarContainer.offsetWidth, configPos = self.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" ||
            (configPosVertical !== "below" &&
                distanceFromBottom < calendarHeight &&
                inputBounds.top > calendarHeight);
        var top = window.pageYOffset +
            inputBounds.top +
            (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "arrowTop", !showOnTop);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "arrowBottom", showOnTop);
        if (self.config.inline)
            return;
        var left = window.pageXOffset + inputBounds.left;
        var isCenter = false;
        var isRight = false;
        if (configPosHorizontal === "center") {
            left -= (calendarWidth - inputBounds.width) / 2;
            isCenter = true;
        }
        else if (configPosHorizontal === "right") {
            left -= calendarWidth - inputBounds.width;
            isRight = true;
        }
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "arrowLeft", !isCenter && !isRight);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "arrowCenter", isCenter);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "arrowRight", isRight);
        var right = window.document.body.offsetWidth -
            (window.pageXOffset + inputBounds.right);
        var rightMost = left + calendarWidth > window.document.body.offsetWidth;
        var centerMost = right + calendarWidth > window.document.body.offsetWidth;
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "rightMost", rightMost);
        if (self.config.static)
            return;
        self.calendarContainer.style.top = top + "px";
        if (!rightMost) {
            self.calendarContainer.style.left = left + "px";
            self.calendarContainer.style.right = "auto";
        }
        else if (!centerMost) {
            self.calendarContainer.style.left = "auto";
            self.calendarContainer.style.right = right + "px";
        }
        else {
            var doc = getDocumentStyleSheet();
            if (doc === undefined)
                return;
            var bodyWidth = window.document.body.offsetWidth;
            var centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
            var centerBefore = ".flatpickr-calendar.centerMost:before";
            var centerAfter = ".flatpickr-calendar.centerMost:after";
            var centerIndex = doc.cssRules.length;
            var centerStyle = "{left:" + inputBounds.left + "px;right:auto;}";
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "rightMost", false);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.toggleClass)(self.calendarContainer, "centerMost", true);
            doc.insertRule(centerBefore + "," + centerAfter + centerStyle, centerIndex);
            self.calendarContainer.style.left = centerLeft + "px";
            self.calendarContainer.style.right = "auto";
        }
    }
    function getDocumentStyleSheet() {
        var editableSheet = null;
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (!sheet.cssRules)
                continue;
            try {
                sheet.cssRules;
            }
            catch (err) {
                continue;
            }
            editableSheet = sheet;
            break;
        }
        return editableSheet != null ? editableSheet : createStyleSheet();
    }
    function createStyleSheet() {
        var style = document.createElement("style");
        document.head.appendChild(style);
        return style.sheet;
    }
    function redraw() {
        if (self.config.noCalendar || self.isMobile)
            return;
        buildMonthSwitch();
        updateNavigationCurrentMonth();
        buildDays();
    }
    function focusAndClose() {
        self._input.focus();
        if (window.navigator.userAgent.indexOf("MSIE") !== -1 ||
            navigator.msMaxTouchPoints !== undefined) {
            setTimeout(self.close, 0);
        }
        else {
            self.close();
        }
    }
    function selectDate(e) {
        e.preventDefault();
        e.stopPropagation();
        var isSelectable = function (day) {
            return day.classList &&
                day.classList.contains("flatpickr-day") &&
                !day.classList.contains("flatpickr-disabled") &&
                !day.classList.contains("notAllowed");
        };
        var t = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.findParent)((0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e), isSelectable);
        if (t === undefined)
            return;
        var target = t;
        var selectedDate = (self.latestSelectedDateObj = new Date(target.dateObj.getTime()));
        var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth ||
            selectedDate.getMonth() >
                self.currentMonth + self.config.showMonths - 1) &&
            self.config.mode !== "range";
        self.selectedDateElem = target;
        if (self.config.mode === "single")
            self.selectedDates = [selectedDate];
        else if (self.config.mode === "multiple") {
            var selectedIndex = isDateSelected(selectedDate);
            if (selectedIndex)
                self.selectedDates.splice(parseInt(selectedIndex), 1);
            else
                self.selectedDates.push(selectedDate);
        }
        else if (self.config.mode === "range") {
            if (self.selectedDates.length === 2) {
                self.clear(false, false);
            }
            self.latestSelectedDateObj = selectedDate;
            self.selectedDates.push(selectedDate);
            if ((0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(selectedDate, self.selectedDates[0], true) !== 0)
                self.selectedDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
        }
        setHoursFromInputs();
        if (shouldChangeMonth) {
            var isNewYear = self.currentYear !== selectedDate.getFullYear();
            self.currentYear = selectedDate.getFullYear();
            self.currentMonth = selectedDate.getMonth();
            if (isNewYear) {
                triggerEvent("onYearChange");
                buildMonthSwitch();
            }
            triggerEvent("onMonthChange");
        }
        updateNavigationCurrentMonth();
        buildDays();
        updateValue();
        if (!shouldChangeMonth &&
            self.config.mode !== "range" &&
            self.config.showMonths === 1)
            focusOnDayElem(target);
        else if (self.selectedDateElem !== undefined &&
            self.hourElement === undefined) {
            self.selectedDateElem && self.selectedDateElem.focus();
        }
        if (self.hourElement !== undefined)
            self.hourElement !== undefined && self.hourElement.focus();
        if (self.config.closeOnSelect) {
            var single = self.config.mode === "single" && !self.config.enableTime;
            var range = self.config.mode === "range" &&
                self.selectedDates.length === 2 &&
                !self.config.enableTime;
            if (single || range) {
                focusAndClose();
            }
        }
        triggerChange();
    }
    var CALLBACKS = {
        locale: [setupLocale, updateWeekdays],
        showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
        minDate: [jumpToDate],
        maxDate: [jumpToDate],
        positionElement: [updatePositionElement],
        clickOpens: [
            function () {
                if (self.config.clickOpens === true) {
                    bind(self._input, "focus", self.open);
                    bind(self._input, "click", self.open);
                }
                else {
                    self._input.removeEventListener("focus", self.open);
                    self._input.removeEventListener("click", self.open);
                }
            },
        ],
    };
    function set(option, value) {
        if (option !== null && typeof option === "object") {
            Object.assign(self.config, option);
            for (var key in option) {
                if (CALLBACKS[key] !== undefined)
                    CALLBACKS[key].forEach(function (x) { return x(); });
            }
        }
        else {
            self.config[option] = value;
            if (CALLBACKS[option] !== undefined)
                CALLBACKS[option].forEach(function (x) { return x(); });
            else if (_types_options__WEBPACK_IMPORTED_MODULE_0__.HOOKS.indexOf(option) > -1)
                self.config[option] = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.arrayify)(value);
        }
        self.redraw();
        updateValue(true);
    }
    function setSelectedDate(inputDate, format) {
        var dates = [];
        if (inputDate instanceof Array)
            dates = inputDate.map(function (d) { return self.parseDate(d, format); });
        else if (inputDate instanceof Date || typeof inputDate === "number")
            dates = [self.parseDate(inputDate, format)];
        else if (typeof inputDate === "string") {
            switch (self.config.mode) {
                case "single":
                case "time":
                    dates = [self.parseDate(inputDate, format)];
                    break;
                case "multiple":
                    dates = inputDate
                        .split(self.config.conjunction)
                        .map(function (date) { return self.parseDate(date, format); });
                    break;
                case "range":
                    dates = inputDate
                        .split(self.l10n.rangeSeparator)
                        .map(function (date) { return self.parseDate(date, format); });
                    break;
                default:
                    break;
            }
        }
        else
            self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
        self.selectedDates = (self.config.allowInvalidPreload
            ? dates
            : dates.filter(function (d) { return d instanceof Date && isEnabled(d, false); }));
        if (self.config.mode === "range")
            self.selectedDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
    }
    function setDate(date, triggerChange, format) {
        if (triggerChange === void 0) { triggerChange = false; }
        if (format === void 0) { format = self.config.dateFormat; }
        if ((date !== 0 && !date) || (date instanceof Array && date.length === 0))
            return self.clear(triggerChange);
        setSelectedDate(date, format);
        self.latestSelectedDateObj =
            self.selectedDates[self.selectedDates.length - 1];
        self.redraw();
        jumpToDate(undefined, triggerChange);
        setHoursFromDate();
        if (self.selectedDates.length === 0) {
            self.clear(false);
        }
        updateValue(triggerChange);
        if (triggerChange)
            triggerEvent("onChange");
    }
    function parseDateRules(arr) {
        return arr
            .slice()
            .map(function (rule) {
            if (typeof rule === "string" ||
                typeof rule === "number" ||
                rule instanceof Date) {
                return self.parseDate(rule, undefined, true);
            }
            else if (rule &&
                typeof rule === "object" &&
                rule.from &&
                rule.to)
                return {
                    from: self.parseDate(rule.from, undefined),
                    to: self.parseDate(rule.to, undefined),
                };
            return rule;
        })
            .filter(function (x) { return x; });
    }
    function setupDates() {
        self.selectedDates = [];
        self.now = self.parseDate(self.config.now) || new Date();
        var preloadedDate = self.config.defaultDate ||
            ((self.input.nodeName === "INPUT" ||
                self.input.nodeName === "TEXTAREA") &&
                self.input.placeholder &&
                self.input.value === self.input.placeholder
                ? null
                : self.input.value);
        if (preloadedDate)
            setSelectedDate(preloadedDate, self.config.dateFormat);
        self._initialDate =
            self.selectedDates.length > 0
                ? self.selectedDates[0]
                : self.config.minDate &&
                    self.config.minDate.getTime() > self.now.getTime()
                    ? self.config.minDate
                    : self.config.maxDate &&
                        self.config.maxDate.getTime() < self.now.getTime()
                        ? self.config.maxDate
                        : self.now;
        self.currentYear = self._initialDate.getFullYear();
        self.currentMonth = self._initialDate.getMonth();
        if (self.selectedDates.length > 0)
            self.latestSelectedDateObj = self.selectedDates[0];
        if (self.config.minTime !== undefined)
            self.config.minTime = self.parseDate(self.config.minTime, "H:i");
        if (self.config.maxTime !== undefined)
            self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
        self.minDateHasTime =
            !!self.config.minDate &&
                (self.config.minDate.getHours() > 0 ||
                    self.config.minDate.getMinutes() > 0 ||
                    self.config.minDate.getSeconds() > 0);
        self.maxDateHasTime =
            !!self.config.maxDate &&
                (self.config.maxDate.getHours() > 0 ||
                    self.config.maxDate.getMinutes() > 0 ||
                    self.config.maxDate.getSeconds() > 0);
    }
    function setupInputs() {
        self.input = getInputElem();
        if (!self.input) {
            self.config.errorHandler(new Error("Invalid input element specified"));
            return;
        }
        self.input._type = self.input.type;
        self.input.type = "text";
        self.input.classList.add("flatpickr-input");
        self._input = self.input;
        if (self.config.altInput) {
            self.altInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)(self.input.nodeName, self.config.altInputClass);
            self._input = self.altInput;
            self.altInput.placeholder = self.input.placeholder;
            self.altInput.disabled = self.input.disabled;
            self.altInput.required = self.input.required;
            self.altInput.tabIndex = self.input.tabIndex;
            self.altInput.type = "text";
            self.input.setAttribute("type", "hidden");
            if (!self.config.static && self.input.parentNode)
                self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
        }
        if (!self.config.allowInput)
            self._input.setAttribute("readonly", "readonly");
        updatePositionElement();
    }
    function updatePositionElement() {
        self._positionElement = self.config.positionElement || self._input;
    }
    function setupMobile() {
        var inputType = self.config.enableTime
            ? self.config.noCalendar
                ? "time"
                : "datetime-local"
            : "date";
        self.mobileInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.createElement)("input", self.input.className + " flatpickr-mobile");
        self.mobileInput.tabIndex = 1;
        self.mobileInput.type = inputType;
        self.mobileInput.disabled = self.input.disabled;
        self.mobileInput.required = self.input.required;
        self.mobileInput.placeholder = self.input.placeholder;
        self.mobileFormatStr =
            inputType === "datetime-local"
                ? "Y-m-d\\TH:i:S"
                : inputType === "date"
                    ? "Y-m-d"
                    : "H:i:S";
        if (self.selectedDates.length > 0) {
            self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
        }
        if (self.config.minDate)
            self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
        if (self.config.maxDate)
            self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
        if (self.input.getAttribute("step"))
            self.mobileInput.step = String(self.input.getAttribute("step"));
        self.input.type = "hidden";
        if (self.altInput !== undefined)
            self.altInput.type = "hidden";
        try {
            if (self.input.parentNode)
                self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
        }
        catch (_a) { }
        bind(self.mobileInput, "change", function (e) {
            self.setDate((0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e).value, false, self.mobileFormatStr);
            triggerEvent("onChange");
            triggerEvent("onClose");
        });
    }
    function toggle(e) {
        if (self.isOpen === true)
            return self.close();
        self.open(e);
    }
    function triggerEvent(event, data) {
        if (self.config === undefined)
            return;
        var hooks = self.config[event];
        if (hooks !== undefined && hooks.length > 0) {
            for (var i = 0; hooks[i] && i < hooks.length; i++)
                hooks[i](self.selectedDates, self.input.value, self, data);
        }
        if (event === "onChange") {
            self.input.dispatchEvent(createEvent("change"));
            self.input.dispatchEvent(createEvent("input"));
        }
    }
    function createEvent(name) {
        var e = document.createEvent("Event");
        e.initEvent(name, true, true);
        return e;
    }
    function isDateSelected(date) {
        for (var i = 0; i < self.selectedDates.length; i++) {
            var selectedDate = self.selectedDates[i];
            if (selectedDate instanceof Date &&
                (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(selectedDate, date) === 0)
                return "" + i;
        }
        return false;
    }
    function isDateInRange(date) {
        if (self.config.mode !== "range" || self.selectedDates.length < 2)
            return false;
        return ((0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(date, self.selectedDates[0]) >= 0 &&
            (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates)(date, self.selectedDates[1]) <= 0);
    }
    function updateNavigationCurrentMonth() {
        if (self.config.noCalendar || self.isMobile || !self.monthNav)
            return;
        self.yearElements.forEach(function (yearElement, i) {
            var d = new Date(self.currentYear, self.currentMonth, 1);
            d.setMonth(self.currentMonth + i);
            if (self.config.showMonths > 1 ||
                self.config.monthSelectorType === "static") {
                self.monthElements[i].textContent =
                    (0,_utils_formatting__WEBPACK_IMPORTED_MODULE_5__.monthToStr)(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
            }
            else {
                self.monthsDropdownContainer.value = d.getMonth().toString();
            }
            yearElement.value = d.getFullYear().toString();
        });
        self._hidePrevMonthArrow =
            self.config.minDate !== undefined &&
                (self.currentYear === self.config.minDate.getFullYear()
                    ? self.currentMonth <= self.config.minDate.getMonth()
                    : self.currentYear < self.config.minDate.getFullYear());
        self._hideNextMonthArrow =
            self.config.maxDate !== undefined &&
                (self.currentYear === self.config.maxDate.getFullYear()
                    ? self.currentMonth + 1 > self.config.maxDate.getMonth()
                    : self.currentYear > self.config.maxDate.getFullYear());
    }
    function getDateStr(specificFormat) {
        var format = specificFormat ||
            (self.config.altInput ? self.config.altFormat : self.config.dateFormat);
        return self.selectedDates
            .map(function (dObj) { return self.formatDate(dObj, format); })
            .filter(function (d, i, arr) {
            return self.config.mode !== "range" ||
                self.config.enableTime ||
                arr.indexOf(d) === i;
        })
            .join(self.config.mode !== "range"
            ? self.config.conjunction
            : self.l10n.rangeSeparator);
    }
    function updateValue(triggerChange) {
        if (triggerChange === void 0) { triggerChange = true; }
        if (self.mobileInput !== undefined && self.mobileFormatStr) {
            self.mobileInput.value =
                self.latestSelectedDateObj !== undefined
                    ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr)
                    : "";
        }
        self.input.value = getDateStr(self.config.dateFormat);
        if (self.altInput !== undefined) {
            self.altInput.value = getDateStr(self.config.altFormat);
        }
        if (triggerChange !== false)
            triggerEvent("onValueUpdate");
    }
    function onMonthNavClick(e) {
        var eventTarget = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e);
        var isPrevMonth = self.prevMonthNav.contains(eventTarget);
        var isNextMonth = self.nextMonthNav.contains(eventTarget);
        if (isPrevMonth || isNextMonth) {
            changeMonth(isPrevMonth ? -1 : 1);
        }
        else if (self.yearElements.indexOf(eventTarget) >= 0) {
            eventTarget.select();
        }
        else if (eventTarget.classList.contains("arrowUp")) {
            self.changeYear(self.currentYear + 1);
        }
        else if (eventTarget.classList.contains("arrowDown")) {
            self.changeYear(self.currentYear - 1);
        }
    }
    function timeWrapper(e) {
        e.preventDefault();
        var isKeyDown = e.type === "keydown", eventTarget = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_3__.getEventTarget)(e), input = eventTarget;
        if (self.amPM !== undefined && eventTarget === self.amPM) {
            self.amPM.textContent =
                self.l10n.amPM[(0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(self.amPM.textContent === self.l10n.amPM[0])];
        }
        var min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta ||
            (isKeyDown ? (e.which === 38 ? 1 : -1) : 0);
        var newValue = curValue + step * delta;
        if (typeof input.value !== "undefined" && input.value.length === 2) {
            var isHourElem = input === self.hourElement, isMinuteElem = input === self.minuteElement;
            if (newValue < min) {
                newValue =
                    max +
                        newValue +
                        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(!isHourElem) +
                        ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(isHourElem) && (0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(!self.amPM));
                if (isMinuteElem)
                    incrementNumInput(undefined, -1, self.hourElement);
            }
            else if (newValue > max) {
                newValue =
                    input === self.hourElement ? newValue - max - (0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(!self.amPM) : min;
                if (isMinuteElem)
                    incrementNumInput(undefined, 1, self.hourElement);
            }
            if (self.amPM &&
                isHourElem &&
                (step === 1
                    ? newValue + curValue === 23
                    : Math.abs(newValue - curValue) > step)) {
                self.amPM.textContent =
                    self.l10n.amPM[(0,_utils__WEBPACK_IMPORTED_MODULE_2__.int)(self.amPM.textContent === self.l10n.amPM[0])];
            }
            input.value = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.pad)(newValue);
        }
    }
    init();
    return self;
}
function _flatpickr(nodeList, config) {
    var nodes = Array.prototype.slice
        .call(nodeList)
        .filter(function (x) { return x instanceof HTMLElement; });
    var instances = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        try {
            if (node.getAttribute("data-fp-omit") !== null)
                continue;
            if (node._flatpickr !== undefined) {
                node._flatpickr.destroy();
                node._flatpickr = undefined;
            }
            node._flatpickr = FlatpickrInstance(node, config || {});
            instances.push(node._flatpickr);
        }
        catch (e) {
            console.error(e);
        }
    }
    return instances.length === 1 ? instances[0] : instances;
}
if (typeof HTMLElement !== "undefined" &&
    typeof HTMLCollection !== "undefined" &&
    typeof NodeList !== "undefined") {
    HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function (config) {
        return _flatpickr(this, config);
    };
    HTMLElement.prototype.flatpickr = function (config) {
        return _flatpickr([this], config);
    };
}
var flatpickr = function (selector, config) {
    if (typeof selector === "string") {
        return _flatpickr(window.document.querySelectorAll(selector), config);
    }
    else if (selector instanceof Node) {
        return _flatpickr([selector], config);
    }
    else {
        return _flatpickr(selector, config);
    }
};
flatpickr.defaultConfig = {};
flatpickr.l10ns = {
    en: __assign({}, _l10n_default__WEBPACK_IMPORTED_MODULE_1__["default"]),
    default: __assign({}, _l10n_default__WEBPACK_IMPORTED_MODULE_1__["default"]),
};
flatpickr.localize = function (l10n) {
    flatpickr.l10ns.default = __assign(__assign({}, flatpickr.l10ns.default), l10n);
};
flatpickr.setDefaults = function (config) {
    flatpickr.defaultConfig = __assign(__assign({}, flatpickr.defaultConfig), config);
};
flatpickr.parseDate = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.createDateParser)({});
flatpickr.formatDate = (0,_utils_dates__WEBPACK_IMPORTED_MODULE_4__.createDateFormatter)({});
flatpickr.compareDates = _utils_dates__WEBPACK_IMPORTED_MODULE_4__.compareDates;
if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
    jQuery.fn.flatpickr = function (config) {
        return _flatpickr(this, config);
    };
}
Date.prototype.fp_incr = function (days) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
};
if (typeof window !== "undefined") {
    window.flatpickr = flatpickr;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (flatpickr);


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/l10n/default.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return __WEBPACK_DEFAULT_EXPORT__; },
  english: function() { return english; }
});
var english = {
    weekdays: {
        shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longhand: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ],
    },
    months: {
        shorthand: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        longhand: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
    },
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    firstDayOfWeek: 0,
    ordinal: function (nth) {
        var s = nth % 100;
        if (s > 3 && s < 21)
            return "th";
        switch (s % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    },
    rangeSeparator: " to ",
    weekAbbreviation: "Wk",
    scrollTitle: "Scroll to increment",
    toggleTitle: "Click to toggle",
    amPM: ["AM", "PM"],
    yearAriaLabel: "Year",
    monthAriaLabel: "Month",
    hourAriaLabel: "Hour",
    minuteAriaLabel: "Minute",
    time_24hr: false,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (english);


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/types/options.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  HOOKS: function() { return HOOKS; },
  defaults: function() { return defaults; }
});
var HOOKS = [
    "onChange",
    "onClose",
    "onDayCreate",
    "onDestroy",
    "onKeyDown",
    "onMonthChange",
    "onOpen",
    "onParseConfig",
    "onReady",
    "onValueUpdate",
    "onYearChange",
    "onPreCalendarPosition",
];
var defaults = {
    _disable: [],
    allowInput: false,
    allowInvalidPreload: false,
    altFormat: "F j, Y",
    altInput: false,
    altInputClass: "form-control input",
    animate: typeof window === "object" &&
        window.navigator.userAgent.indexOf("MSIE") === -1,
    ariaDateFormat: "F j, Y",
    autoFillDefaultTime: true,
    clickOpens: true,
    closeOnSelect: true,
    conjunction: ", ",
    dateFormat: "Y-m-d",
    defaultHour: 12,
    defaultMinute: 0,
    defaultSeconds: 0,
    disable: [],
    disableMobile: false,
    enableSeconds: false,
    enableTime: false,
    errorHandler: function (err) {
        return typeof console !== "undefined" && console.warn(err);
    },
    getWeek: function (givenDate) {
        var date = new Date(givenDate.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        var week1 = new Date(date.getFullYear(), 0, 4);
        return (1 +
            Math.round(((date.getTime() - week1.getTime()) / 86400000 -
                3 +
                ((week1.getDay() + 6) % 7)) /
                7));
    },
    hourIncrement: 1,
    ignoredFocusElements: [],
    inline: false,
    locale: "default",
    minuteIncrement: 5,
    mode: "single",
    monthSelectorType: "dropdown",
    nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
    noCalendar: false,
    now: new Date(),
    onChange: [],
    onClose: [],
    onDayCreate: [],
    onDestroy: [],
    onKeyDown: [],
    onMonthChange: [],
    onOpen: [],
    onParseConfig: [],
    onReady: [],
    onValueUpdate: [],
    onYearChange: [],
    onPreCalendarPosition: [],
    plugins: [],
    position: "auto",
    positionElement: undefined,
    prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
    shorthandCurrentMonth: false,
    showMonths: 1,
    static: false,
    time_24hr: false,
    weekNumbers: false,
    wrap: false,
};


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/dates.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  calculateSecondsSinceMidnight: function() { return calculateSecondsSinceMidnight; },
  compareDates: function() { return compareDates; },
  compareTimes: function() { return compareTimes; },
  createDateFormatter: function() { return createDateFormatter; },
  createDateParser: function() { return createDateParser; },
  duration: function() { return duration; },
  getDefaultHours: function() { return getDefaultHours; },
  isBetween: function() { return isBetween; },
  parseSeconds: function() { return parseSeconds; }
});
/* harmony import */var _formatting__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./formatting */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/formatting.js");
/* harmony import */var _types_options__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/options */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/types/options.js");
/* harmony import */var _l10n_default__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../l10n/default */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/l10n/default.js");



var createDateFormatter = function (_a) {
    var _b = _a.config, config = _b === void 0 ? _types_options__WEBPACK_IMPORTED_MODULE_1__.defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? _l10n_default__WEBPACK_IMPORTED_MODULE_2__.english : _c, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d;
    return function (dateObj, frmt, overrideLocale) {
        var locale = overrideLocale || l10n;
        if (config.formatDate !== undefined && !isMobile) {
            return config.formatDate(dateObj, frmt, locale);
        }
        return frmt
            .split("")
            .map(function (c, i, arr) {
            return _formatting__WEBPACK_IMPORTED_MODULE_0__.formats[c] && arr[i - 1] !== "\\"
                ? _formatting__WEBPACK_IMPORTED_MODULE_0__.formats[c](dateObj, locale, config)
                : c !== "\\"
                    ? c
                    : "";
        })
            .join("");
    };
};
var createDateParser = function (_a) {
    var _b = _a.config, config = _b === void 0 ? _types_options__WEBPACK_IMPORTED_MODULE_1__.defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? _l10n_default__WEBPACK_IMPORTED_MODULE_2__.english : _c;
    return function (date, givenFormat, timeless, customLocale) {
        if (date !== 0 && !date)
            return undefined;
        var locale = customLocale || l10n;
        var parsedDate;
        var dateOrig = date;
        if (date instanceof Date)
            parsedDate = new Date(date.getTime());
        else if (typeof date !== "string" &&
            date.toFixed !== undefined)
            parsedDate = new Date(date);
        else if (typeof date === "string") {
            var format = givenFormat || (config || _types_options__WEBPACK_IMPORTED_MODULE_1__.defaults).dateFormat;
            var datestr = String(date).trim();
            if (datestr === "today") {
                parsedDate = new Date();
                timeless = true;
            }
            else if (config && config.parseDate) {
                parsedDate = config.parseDate(date, format);
            }
            else if (/Z$/.test(datestr) ||
                /GMT$/.test(datestr)) {
                parsedDate = new Date(date);
            }
            else {
                var matched = void 0, ops = [];
                for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
                    var token = format[i];
                    var isBackSlash = token === "\\";
                    var escaped = format[i - 1] === "\\" || isBackSlash;
                    if (_formatting__WEBPACK_IMPORTED_MODULE_0__.tokenRegex[token] && !escaped) {
                        regexStr += _formatting__WEBPACK_IMPORTED_MODULE_0__.tokenRegex[token];
                        var match = new RegExp(regexStr).exec(date);
                        if (match && (matched = true)) {
                            ops[token !== "Y" ? "push" : "unshift"]({
                                fn: _formatting__WEBPACK_IMPORTED_MODULE_0__.revFormat[token],
                                val: match[++matchIndex],
                            });
                        }
                    }
                    else if (!isBackSlash)
                        regexStr += ".";
                }
                parsedDate =
                    !config || !config.noCalendar
                        ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0)
                        : new Date(new Date().setHours(0, 0, 0, 0));
                ops.forEach(function (_a) {
                    var fn = _a.fn, val = _a.val;
                    return (parsedDate = fn(parsedDate, val, locale) || parsedDate);
                });
                parsedDate = matched ? parsedDate : undefined;
            }
        }
        if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
            config.errorHandler(new Error("Invalid date provided: " + dateOrig));
            return undefined;
        }
        if (timeless === true)
            parsedDate.setHours(0, 0, 0, 0);
        return parsedDate;
    };
};
function compareDates(date1, date2, timeless) {
    if (timeless === void 0) { timeless = true; }
    if (timeless !== false) {
        return (new Date(date1.getTime()).setHours(0, 0, 0, 0) -
            new Date(date2.getTime()).setHours(0, 0, 0, 0));
    }
    return date1.getTime() - date2.getTime();
}
function compareTimes(date1, date2) {
    return (3600 * (date1.getHours() - date2.getHours()) +
        60 * (date1.getMinutes() - date2.getMinutes()) +
        date1.getSeconds() -
        date2.getSeconds());
}
var isBetween = function (ts, ts1, ts2) {
    return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
};
var calculateSecondsSinceMidnight = function (hours, minutes, seconds) {
    return hours * 3600 + minutes * 60 + seconds;
};
var parseSeconds = function (secondsSinceMidnight) {
    var hours = Math.floor(secondsSinceMidnight / 3600), minutes = (secondsSinceMidnight - hours * 3600) / 60;
    return [hours, minutes, secondsSinceMidnight - hours * 3600 - minutes * 60];
};
var duration = {
    DAY: 86400000,
};
function getDefaultHours(config) {
    var hours = config.defaultHour;
    var minutes = config.defaultMinute;
    var seconds = config.defaultSeconds;
    if (config.minDate !== undefined) {
        var minHour = config.minDate.getHours();
        var minMinutes = config.minDate.getMinutes();
        var minSeconds = config.minDate.getSeconds();
        if (hours < minHour) {
            hours = minHour;
        }
        if (hours === minHour && minutes < minMinutes) {
            minutes = minMinutes;
        }
        if (hours === minHour && minutes === minMinutes && seconds < minSeconds)
            seconds = config.minDate.getSeconds();
    }
    if (config.maxDate !== undefined) {
        var maxHr = config.maxDate.getHours();
        var maxMinutes = config.maxDate.getMinutes();
        hours = Math.min(hours, maxHr);
        if (hours === maxHr)
            minutes = Math.min(maxMinutes, minutes);
        if (hours === maxHr && minutes === maxMinutes)
            seconds = config.maxDate.getSeconds();
    }
    return { hours: hours, minutes: minutes, seconds: seconds };
}


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/dom.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  clearNode: function() { return clearNode; },
  createElement: function() { return createElement; },
  createNumberInput: function() { return createNumberInput; },
  findParent: function() { return findParent; },
  getEventTarget: function() { return getEventTarget; },
  toggleClass: function() { return toggleClass; }
});
function toggleClass(elem, className, bool) {
    if (bool === true)
        return elem.classList.add(className);
    elem.classList.remove(className);
}
function createElement(tag, className, content) {
    var e = window.document.createElement(tag);
    className = className || "";
    content = content || "";
    e.className = className;
    if (content !== undefined)
        e.textContent = content;
    return e;
}
function clearNode(node) {
    while (node.firstChild)
        node.removeChild(node.firstChild);
}
function findParent(node, condition) {
    if (condition(node))
        return node;
    else if (node.parentNode)
        return findParent(node.parentNode, condition);
    return undefined;
}
function createNumberInput(inputClassName, opts) {
    var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
    if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
        numInput.type = "number";
    }
    else {
        numInput.type = "text";
        numInput.pattern = "\\d*";
    }
    if (opts !== undefined)
        for (var key in opts)
            numInput.setAttribute(key, opts[key]);
    wrapper.appendChild(numInput);
    wrapper.appendChild(arrowUp);
    wrapper.appendChild(arrowDown);
    return wrapper;
}
function getEventTarget(event) {
    try {
        if (typeof event.composedPath === "function") {
            var path = event.composedPath();
            return path[0];
        }
        return event.target;
    }
    catch (error) {
        return event.target;
    }
}


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/formatting.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  formats: function() { return formats; },
  monthToStr: function() { return monthToStr; },
  revFormat: function() { return revFormat; },
  tokenRegex: function() { return tokenRegex; }
});
/* harmony import */var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/index.js");

var doNothing = function () { return undefined; };
var monthToStr = function (monthNumber, shorthand, locale) { return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber]; };
var revFormat = {
    D: doNothing,
    F: function (dateObj, monthName, locale) {
        dateObj.setMonth(locale.months.longhand.indexOf(monthName));
    },
    G: function (dateObj, hour) {
        dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
    },
    H: function (dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
    },
    J: function (dateObj, day) {
        dateObj.setDate(parseFloat(day));
    },
    K: function (dateObj, amPM, locale) {
        dateObj.setHours((dateObj.getHours() % 12) +
            12 * (0,_utils__WEBPACK_IMPORTED_MODULE_0__.int)(new RegExp(locale.amPM[1], "i").test(amPM)));
    },
    M: function (dateObj, shortMonth, locale) {
        dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
    },
    S: function (dateObj, seconds) {
        dateObj.setSeconds(parseFloat(seconds));
    },
    U: function (_, unixSeconds) { return new Date(parseFloat(unixSeconds) * 1000); },
    W: function (dateObj, weekNum, locale) {
        var weekNumber = parseInt(weekNum);
        var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
        date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
        return date;
    },
    Y: function (dateObj, year) {
        dateObj.setFullYear(parseFloat(year));
    },
    Z: function (_, ISODate) { return new Date(ISODate); },
    d: function (dateObj, day) {
        dateObj.setDate(parseFloat(day));
    },
    h: function (dateObj, hour) {
        dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
    },
    i: function (dateObj, minutes) {
        dateObj.setMinutes(parseFloat(minutes));
    },
    j: function (dateObj, day) {
        dateObj.setDate(parseFloat(day));
    },
    l: doNothing,
    m: function (dateObj, month) {
        dateObj.setMonth(parseFloat(month) - 1);
    },
    n: function (dateObj, month) {
        dateObj.setMonth(parseFloat(month) - 1);
    },
    s: function (dateObj, seconds) {
        dateObj.setSeconds(parseFloat(seconds));
    },
    u: function (_, unixMillSeconds) {
        return new Date(parseFloat(unixMillSeconds));
    },
    w: doNothing,
    y: function (dateObj, year) {
        dateObj.setFullYear(2000 + parseFloat(year));
    },
};
var tokenRegex = {
    D: "",
    F: "",
    G: "(\\d\\d|\\d)",
    H: "(\\d\\d|\\d)",
    J: "(\\d\\d|\\d)\\w+",
    K: "",
    M: "",
    S: "(\\d\\d|\\d)",
    U: "(.+)",
    W: "(\\d\\d|\\d)",
    Y: "(\\d{4})",
    Z: "(.+)",
    d: "(\\d\\d|\\d)",
    h: "(\\d\\d|\\d)",
    i: "(\\d\\d|\\d)",
    j: "(\\d\\d|\\d)",
    l: "",
    m: "(\\d\\d|\\d)",
    n: "(\\d\\d|\\d)",
    s: "(\\d\\d|\\d)",
    u: "(.+)",
    w: "(\\d\\d|\\d)",
    y: "(\\d{2})",
};
var formats = {
    Z: function (date) { return date.toISOString(); },
    D: function (date, locale, options) {
        return locale.weekdays.shorthand[formats.w(date, locale, options)];
    },
    F: function (date, locale, options) {
        return monthToStr(formats.n(date, locale, options) - 1, false, locale);
    },
    G: function (date, locale, options) {
        return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(formats.h(date, locale, options));
    },
    H: function (date) { return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(date.getHours()); },
    J: function (date, locale) {
        return locale.ordinal !== undefined
            ? date.getDate() + locale.ordinal(date.getDate())
            : date.getDate();
    },
    K: function (date, locale) { return locale.amPM[(0,_utils__WEBPACK_IMPORTED_MODULE_0__.int)(date.getHours() > 11)]; },
    M: function (date, locale) {
        return monthToStr(date.getMonth(), true, locale);
    },
    S: function (date) { return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(date.getSeconds()); },
    U: function (date) { return date.getTime() / 1000; },
    W: function (date, _, options) {
        return options.getWeek(date);
    },
    Y: function (date) { return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(date.getFullYear(), 4); },
    d: function (date) { return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(date.getDate()); },
    h: function (date) { return (date.getHours() % 12 ? date.getHours() % 12 : 12); },
    i: function (date) { return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(date.getMinutes()); },
    j: function (date) { return date.getDate(); },
    l: function (date, locale) {
        return locale.weekdays.longhand[date.getDay()];
    },
    m: function (date) { return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.pad)(date.getMonth() + 1); },
    n: function (date) { return date.getMonth() + 1; },
    s: function (date) { return date.getSeconds(); },
    u: function (date) { return date.getTime(); },
    w: function (date) { return date.getDay(); },
    y: function (date) { return String(date.getFullYear()).substring(2); },
};


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/index.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  arrayify: function() { return arrayify; },
  debounce: function() { return debounce; },
  int: function() { return int; },
  pad: function() { return pad; }
});
var pad = function (number, length) {
    if (length === void 0) { length = 2; }
    return ("000" + number).slice(length * -1);
};
var int = function (bool) { return (bool === true ? 1 : 0); };
function debounce(fn, wait) {
    var t;
    return function () {
        var _this = this;
        var args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { return fn.apply(_this, args); }, wait);
    };
}
var arrayify = function (obj) {
    return obj instanceof Array ? obj : [obj];
};


}),
"./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/utils/polyfills.js": (function () {

if (typeof Object.assign !== "function") {
    Object.assign = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!target) {
            throw TypeError("Cannot convert undefined or null to object");
        }
        var _loop_1 = function (source) {
            if (source) {
                Object.keys(source).forEach(function (key) { return (target[key] = source[key]); });
            }
        };
        for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
            var source = args_1[_a];
            _loop_1(source);
        }
        return target;
    };
}


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
/* harmony import */var flatpickr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flatpickr */ "./node_modules/.pnpm/flatpickr@4.6.13/node_modules/flatpickr/dist/esm/index.js");
/* harmony import */var _tools_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tools/index.js */ "./js/tools/index.js");




document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input[type=date]").forEach((el) => {
    el.dataset.date = el.value
    const fEl = (0,flatpickr__WEBPACK_IMPORTED_MODULE_0__["default"])(el, {
      altFormat: "d-m-Y",
      altInput: true,
      allowInput: true,
      parseDate: _tools_index_js__WEBPACK_IMPORTED_MODULE_1__.parseDate,
      onClose: function (_selectedDates, dateStr) {
        if (!dateStr) {
          dateStr = ""
          fEl.input.value = dateStr
          fEl.altInput.value = dateStr
        }
        el.dataset.date = dateStr
      },
      errorHandler: function (_error) {},
    })
    if (el.hasAttribute("id")) {
      const id = el.id
      el.removeAttribute("id")
      fEl.altInput.id = id
      fEl.altInput.setAttribute("autocomplete", "off")
    }
    el.addEventListener("change", () => {
      if (el.value === el.dataset.date) {
        return
      }
      el.dataset.date = el.value
      fEl.setDate(el.value, true, "Y-m-d")
    })
  })
})

})()
;
//# sourceMappingURL=components.js.map