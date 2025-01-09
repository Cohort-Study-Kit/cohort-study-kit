import { DataTable } from "simple-datatables"

import { get, getJson, dateCell, ContextMenu } from "../tools"

export class Diagnosis {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId

    this.table = false
  }

  init() {
    this.bind()
    return this.getData().then((diagnosis) => this.renderData(diagnosis))
  }

  getData() {
    return getJson(`/api/diagnosis/get/${this.copsacId}/`).then(({ json }) => {
      return json.diagnoses.map((diagnosis) => [
        diagnosis.id,
        diagnosis.lock_status,
        diagnosis.icd_code__description,
        diagnosis.icd_code__code,
        dateCell(diagnosis.start_date),
        dateCell(diagnosis.end_date),
      ])
    })
  }

  renderData(diagnosis) {
    this.el.innerHTML = "<table></table>"
    this.table = new DataTable(this.el.lastElementChild, {
      type: "string",
      data: {
        headings: [
          "ID",
          "lock_status",
          `Diagnosis: <a class="plus-button" href="/diagnosis/${this.copsacId}/">+</a>`,
          "ICD10",
          "Start date",
          "End date",
        ],
        data: diagnosis,
      },
      tabIndex: 6,
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
        if (row.cells[1].data !== "unlocked") {
          if (tr.attributes.class) {
            tr.attributes.class += " locked"
          } else {
            tr.attributes.class = "locked"
          }
        }
        return tr
      },
      columns: [
        {
          select: [0, 1],
          hidden: true,
        },
        {
          select: 0,
          type: "number",
        },
        {
          select: 1,
          type: "string",
        },
        {
          select: [4, 5],
          width: "50px",
        },
      ],
    })
  }

  lockRow(id) {
    return get(`/api/diagnosis/lock/${this.copsacId}/${id}/`).then(() => {
      const row = this.table.data.data.find((row) => row.cells[0].data === id)
      const currentValue = row.cells[1].data
      if (currentValue === "unlocked") {
        row.cells[1].data = "locked"
      } else {
        row.cells[1].data = "unlocked"
      }
      this.table.update()
      return Promise.resolve()
    })
  }

  deleteData(id) {
    const diagnosis = this.table.data.data.find(
      (row) => row.cells[0].data === id,
    )
    if (
      confirm(
        `Are you sure you want to delete diagnosis: ${diagnosis.cells[2].data}`,
      )
    ) {
      return get(`/api/diagnosis/delete/${this.copsacId}/${id}/`).then(
        ({ status, redirected }) => {
          if (status === 200 && !redirected) {
            const index = this.table.data.data.findIndex(
              (row) => row.cells[0].data === id,
            )
            if (index > -1) {
              this.table.rows.remove(index)
            }
          }
        },
      )
    }
    return Promise.resolve()
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
      window.location = `/diagnosis/update/${this.copsacId}/${id}/`
    })

    this.el.addEventListener("keydown", (event) => {
      const index = this.table.rows.cursor
      const id = this.table.data.data[index].cells[0].data
      if (event.keyCode === 13) {
        // Enter
        event.preventDefault()
        window.location = `/diagnosis/update/${this.copsacId}/${id}/`
      } else if (
        event.keyCode === 46 // Delete
      ) {
        return this.deleteData(id)
      } else if (
        event.keyCode === 76 // L
      ) {
        this.lockRow(id)
      }
    })

    const menuItems = [
      {
        label: "Edit diagnosis",
        callback: (event) => {
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
        },
      },
      {
        label: "Lock/unlock diagnosis",
        callback: (event) => {
          const tr = event.target.closest("tr[data-id]")
          if (!tr) {
            return
          }

          this.lockRow(parseInt(tr.dataset.id))
          event.preventDefault()
        },
      },
      {
        label: "Delete diagnosis",
        callback: (event) => {
          const tr = event.target.closest("tr")
          if (!tr) {
            return
          }
          const id = tr.dataset.id
          if (!id) {
            return
          }
          event.preventDefault()
          return this.deleteData(parseInt(id))
        },
      },
    ]

    new ContextMenu(this.el, menuItems, {
      show: (event) => {
        const tr = event.target.closest("tr[data-index]")
        if (!tr) {
          return false
        }
        this.table.rows.setCursor(parseInt(tr.dataset.index))
        return true
      },
    })
  }
}
