import { DataTable } from "simple-datatables"
import { getJson, dateCell } from "../tools/index.js"

export class DiagnosisOverview {
  constructor() {
    this.el = false
    this.copsacId = false
    this.diagnoses = []
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
    return getJson(`/api/diagnosis/get/${this.copsacId}/`).then(({ json }) => {
      this.diagnoses = json.diagnoses.map((diagnosis) => {
        return [
          diagnosis.id,
          dateCell(diagnosis.start_date),
          dateCell(diagnosis.end_date),
          diagnosis.icd_code__code,
          diagnosis.icd_code__description,
          diagnosis.is_chronic,
          diagnosis.medical_attention,
          diagnosis.comments,
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
          "ICD 10",
          "Diagnosis",
          "Chronic",
          "Medical attention",
          "Comments",
        ],
        data: this.diagnoses,
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
      window.location = `/diagnosis/update/${this.copsacId}/${id}/`
    })
  }
}
