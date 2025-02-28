import { DataTable } from "simple-datatables"

import { getJson, dateCell, ContextMenu } from "../tools"

export class Consent {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId

    this.table = false
  }

  init() {
    this.bind()
    return this.getData().then((consents) => this.renderData(consents))
  }

  getData() {
    return getJson(`/api/get_missing_consents/${this.copsacId}/`).then(
      ({ json }) => {
        return json["consents"].map((consent) => {
          return [
            consent.id,
            consent.name,
            dateCell(consent.date),
            consent.status,
          ]
        })
      },
    )
  }

  renderData(consents) {
    if (this.table) {
      this.table.destroy()
    }
    this.el.innerHTML = "<table></table>"
    this.table = new DataTable(this.el.lastElementChild, {
      data: {
        headings: [
          gettext("ID"),
          `${gettext("Consent forms")}: <a class="plus-button" href="/base/consent/${this.copsacId}/">+</a>`,
          gettext("Date"),
          gettext("Status"),
        ],
        data: consents,
      },
      tabIndex: 5,
      rowNavigation: true,
      searchable: false,
      fixedHeight: false,
      paging: false,
      scrollY: "16vh",
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
          type: "number",
        },
        {
          select: 2,
          //width: "50px",
          type: "date",
        },
        {
          select: [2, 3],
          hidden: true,
        },
      ],
    })
  }

  bind() {
    this.el.addEventListener("click", (event) => {
      const tr = event.target.closest("tr[data-index]")
      if (!tr) {
        return
      }
      this.table.rows.setCursor(parseInt(tr.dataset.index))
    })

    this.el.addEventListener("dblclick", (event) => {
      const tr = event.target.closest("tr")
      if (!tr) {
        return
      }
      const id = tr.dataset.id
      if (!id) {
        return
      }
      event.preventDefault()
      window.location = `/base/consent/update/${this.copsacId}/${id}/`
    })

    this.el.addEventListener("keydown", (event) => {
      const index = this.table.rows.cursor
      const id = this.table.data.data[index].cells[0].data

      if (event.keyCode === 13) {
        // Enter
        event.preventDefault()
        window.location = `/base/consent/update/${this.copsacId}/${id}/`
      }
    })

    const menuItems = [
      {
        label: gettext("Edit consent"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = tr.dataset.id
          window.location = `/base/consent/update/${this.copsacId}/${id}/`
        },
      },
    ]
    new ContextMenu(this.el, menuItems, {
      show: (event) => {
        const tr = event.target.closest("tr")
        if (!tr) {
          return false
        }
        if (!tr.dataset.id) {
          return false
        }
        return true
      },
    })
  }
}
