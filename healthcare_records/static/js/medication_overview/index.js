import { DataTable } from "simple-datatables"
import { getJson, dateCell } from "../tools/index.js"

export class MedicationOverview {
  constructor() {
    this.el = false
    this.copsacId = false
    this.medications = []
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.el = document.querySelector("table")
    this.copsacId = document.body.dataset.copsac
    this.bind()
    this.getDiagnoses().then(() => this.render())
  }

  getDiagnoses() {
    return getJson(`/api/medication/get/${this.copsacId}/`).then(({ json }) => {
      this.medications = json.medications.map((medication) => {
        return [
          medication.id,
          dateCell(medication.start_date),
          dateCell(medication.end_date),
          medication.atc_code__code,
          medication.atc_code__description,
          medication.atc_code__code.slice(0, 3) === "J07" ? "Yes" : "No",
          `${medication.dose} ${medication.unit} ${medication.frequency} ${medication.period} ${medication.route} ${medication.route_spec}`,
          medication.comments,
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
          "Start",
          "End",
          "ATC Code",
          "Medication",
          "Is vaccine",
          "Dose/Unit/Frequency/Period/Route/Route spec",
          "Comments",
        ],
        data: this.medications,
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
      window.location = `/medication/update/${this.copsacId}/${id}/`
    })
  }
}
