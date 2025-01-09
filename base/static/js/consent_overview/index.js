import { DataTable } from "simple-datatables"
import { getJson, dateCell } from "../tools"

export class ConsentOverview {
  constructor() {
    this.el = false
    this.copsacId = false
    this.consents = []
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.el = document.querySelector("table")
    this.copsacId = document.body.dataset.copsac
    this.bind()
    this.getConsents().then(() => this.render())
  }

  getConsents() {
    return getJson(`/api/get_consents/${this.copsacId}/`).then(({ json }) => {
      this.consents = json["consents"].map((consent) => {
        return [
          consent.id,
          consent.name,
          dateCell(consent.date),
          consent.status,
        ]
      })
    })
  }

  render() {
    new DataTable(this.el, {
      type: "string",
      data: {
        headings: ["ID", "Name", "Date", "Status"],
        data: this.consents,
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
          select: [2],
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
      window.location = `/base/consent/update/${this.copsacId}/${id}/`
    })
  }
}
