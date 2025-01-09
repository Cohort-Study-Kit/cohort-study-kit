import { DataTable } from "simple-datatables"
import { getJson, dateCell } from "../tools"

export class EducationalInstitutionOverview {
  constructor() {
    this.el = false
    this.copsacId = false
    this.institutions = []
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.el = document.querySelector("table")
    this.copsacId = document.body.dataset.copsac
    this.bind()
    this.getInstitutions().then(() => this.render())
  }

  getInstitutions() {
    return getJson(`/api/educational_institution/get/${this.copsacId}/`).then(
      ({ json }) => {
        this.institutions = json.educational_institutions.map((institution) => {
          return [
            institution.id,
            dateCell(institution.start_date),
            dateCell(institution.end_date),
            institution.type,
            institution.city,
            institution.street,
            institution.postcode,
            institution.phone,
            institution.comments,
          ]
        })
      },
    )
  }

  render() {
    new DataTable(this.el, {
      type: "string",
      data: {
        headings: [
          "ID",
          "Move in",
          "Move out",
          "Type",
          "City",
          "Street",
          "Postcode",
          "Phone",
          "Comments",
        ],
        data: this.institutions,
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
      window.location = `/educational_institution/update/${this.copsacId}/${id}/`
    })
  }
}
