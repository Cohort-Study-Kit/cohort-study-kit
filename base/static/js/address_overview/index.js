import { DataTable } from "simple-datatables"
import { getJson, dateCell } from "../tools/index.js"

export class AddressOverview {
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
    return getJson(`/api/address/get/${this.copsacId}/`).then(({ json }) => {
      this.addresses = json.addresses.map((address) => {
        return [
          address.id,
          dateCell(address.start_date),
          dateCell(address.end_date),
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
    new DataTable(this.el, {
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
