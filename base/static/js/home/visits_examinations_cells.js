import { DataTable } from "simple-datatables"

import { get, getJson, dateCell, ContextMenu } from "../tools"

export class VisitsExaminationsCells {
  constructor(visitsEl, examinationsEl, cellsEl, copsacId) {
    this.visitsEl = visitsEl
    this.examinationsEl = examinationsEl
    this.cellsEl = cellsEl
    this.copsacId = copsacId
    window.VisitsExaminationsCells = this

    const pathParts = window.location.pathname.split("/")
    this.selectedVisitId = pathParts[3] ? parseInt(pathParts[3]) : false
    this.selectedExaminationName = pathParts[4] || "Exposition"
    this.visitsTable = false
    this.examinationsTable = false
    this.cellsTable = false
  }

  init() {
    this.bind()
    return Promise.all([
      this.getVisits()
        .then((visits) => this.renderVisits(visits))
        .then(() => this.getExaminations())
        .then((examinations) => this.renderExaminations(examinations))
        .then(() => this.setHistory())
        .then(() => {
          this.scrollExaminationIntoView()
          this.scrollVisitIntoView()
          return this.focusExaminations()
        }),
      this.getCells().then((cells) => this.renderCells(cells)),
    ])
  }

  getVisits() {
    return getJson(`/api/get_visits/${this.copsacId}/`).then(({ json }) => {
      const visits = json.visits.map((row) =>
        row.map((cell, index) => {
          if (index === 3 && !cell) {
            return ""
          }
          if (index === 4) {
            return dateCell(cell)
          }
          return cell
        }),
      )
      if (!this.selectedVisitId && visits.length) {
        this.selectedVisitId = (visits.find((visit) => !visit[4]) ||
          visits[0])[0]
      }
      return visits
    })
  }

  getExaminations() {
    if (!this.selectedVisitId) {
      return Promise.resolve([])
    }
    return getJson(`/api/get_examinations/${this.selectedVisitId}/`).then(
      ({ json }) =>
        json.examinations.map((row) =>
          row.map((cell, index) => {
            if (index === 7) {
              return dateCell(cell)
            }
            return cell
          }),
        ),
    )
  }

  getCells() {
    if (!this.selectedExaminationName) {
      return Promise.resolve([])
    }
    return getJson(
      `/api/get_cells/${this.copsacId}/${this.selectedExaminationName}/`,
    ).then(({ json }) => ({ data: json.data, headings: json.headings }))
  }

  renderVisits(visits) {
    if (this.visitsTable) {
      this.visitsTable.destroy()
    }
    this.visitsEl.innerHTML = `<table></table>`
    this.visitsTable = new DataTable(this.visitsEl.lastElementChild, {
      type: "string",
      data: {
        headings: [
          gettext("ID"),
          `${gettext("Visits")}: <a class="plus-button create-visit" href="/data/visit/create/${this.copsacId}/">+</a>`,
          gettext("Sec. type"),
          gettext("Status"),
          gettext("Date"),
          gettext("Adhoc"),
          gettext("Comments"),
        ],
        data: visits,
      },
      tabIndex: 3,
      rowNavigation: true,
      header: true,
      searchable: false,
      fixedHeight: false,
      paging: false,
      scrollY: "14vh",
      layout: {
        top: "",
        bottom: "",
      },
      rowRender: (row, tr, _index) => {
        if (!tr.attributes) {
          tr.attributes = {}
        }
        tr.attributes["data-id"] = row.cells[0].data
        if (row.cells[0].data !== this.selectedVisitId) {
          return tr
        }
        if (tr.attributes.class) {
          tr.attributes.class += " selected"
        } else {
          tr.attributes.class = "selected"
        }
        return tr
      },
      columns: [
        {
          select: 0,
          hidden: true,
        },
        {
          select: 2,
          render: (data, td, _index, _cIndex) => {
            if (data.length > 10) {
              td.childNodes[0].data = `${data.slice(0, 10)}...`
            }
            return td
          },
        },
        {
          select: 4,
          width: "50px",
        },
        {
          select: 5,
          hidden: true,
        },
        {
          select: 6,
          render: (data, td, _index, _cIndex) => {
            if (data.length > 27) {
              td.childNodes[0].data = `${data.slice(0, 27)}...`
            }
            return td
          },
        },
      ],
    })
    const selectedRow = this.visitsTable.dom.querySelector(
      "tr.selected[data-index]",
    )
    if (selectedRow) {
      this.visitsTable.rows.setCursor(parseInt(selectedRow.dataset.index))
    }
  }

  setCreateExaminationLink() {
    const dom = this.examinationsEl.querySelector("a.create-examination")
    if (dom) {
      dom.setAttribute(
        "href",
        `/data/examination/create/${this.copsacId}/${
          this.selectedVisitId ? `${this.selectedVisitId}/` : ""
        }`,
      )
    }
  }

  renderExaminations(examinations) {
    if (this.examinationsTable) {
      this.examinationsTable.destroy()
    }
    this.examinationsEl.innerHTML = `<table></table>`
    this.examinationsTable = new DataTable(
      this.examinationsEl.lastElementChild,
      {
        type: "string",
        data: {
          headings: [
            gettext("url"),
            gettext("ID"),
            gettext("lock_status"),
            gettext("name"),
            `${gettext("Examinations")}: <a class="plus-button create-examination">+</a>`,
            gettext("Visit"),
            gettext("Status"),
            gettext("Date"),
            gettext("Comments"),
          ],
          data: examinations,
        },
        tabIndex: 2,
        rowNavigation: true,
        searchable: false,
        fixedHeight: false,
        paging: false,
        scrollY: "33vh",
        layout: {
          top: "",
          bottom: "",
        },
        rowRender: (row, tr, _index) => {
          if (!tr.attributes) {
            tr.attributes = {}
          }
          tr.attributes["data-url"] = row.cells[0].data
          tr.attributes["data-id"] = String(row.cells[1].data)

          if (row.cells[2].data === 1) {
            if (tr.attributes.class) {
              tr.attributes.class += " locked"
            } else {
              tr.attributes.class = "locked"
            }
          }
          if (row.cells[3].data === this.selectedExaminationName) {
            if (tr.attributes.class) {
              tr.attributes.class += " selected"
            } else {
              tr.attributes.class = "selected"
            }
          }
          tr.attributes["data-name"] = row.cells[3].data
          return tr
        },
        columns: [
          {
            select: [0, 1, 2, 3, 5],
            hidden: true,
          },
          {
            select: 8,
            render: (data, td, _index, _cIndex) => {
              if (data.length > 27) {
                td.childNodes[0].data = `${data.slice(0, 27)}...`
              }
              return td
            },
          },
        ],
      },
    )
    this.setCreateExaminationLink()

    const selectedRow = this.examinationsTable.dom.querySelector(
      "tr.selected[data-index]",
    )
    if (selectedRow) {
      this.examinationsTable.rows.setCursor(parseInt(selectedRow.dataset.index))
    }
  }

  scrollExaminationIntoView() {
    const selectedExaminationRow =
      this.examinationsTable.dom.querySelector("tr.selected")
    const selectedVisitRow = this.visitsTable.dom.querySelector("tr.selected")
    if (selectedVisitRow) {
      selectedVisitRow
        .closest("div.datatable-container")
        .scrollTo({ top: Math.max(selectedVisitRow.offsetTop - 20, 0) })
    }
    if (selectedExaminationRow) {
      selectedExaminationRow
        .closest("div.datatable-container")
        .scrollTo({ top: Math.max(selectedExaminationRow.offsetTop - 20, 0) })
    }
  }

  scrollVisitIntoView() {
    const selectedVisitRow = this.visitsTable.dom.querySelector("tr.selected")
    if (selectedVisitRow) {
      selectedVisitRow
        .closest("div.datatable-container")
        .scrollTo({ top: Math.max(selectedVisitRow.offsetTop - 20, 0) })
    }
  }

  focusExaminations() {
    this.examinationsTable.dom.focus()
  }

  setHistory() {
    const examinationName = this.examinationsTable.data.data.length
      ? this.selectedExaminationName
      : false
    const pathParts = window.location.pathname.split("/").slice(0, 3)
    pathParts.push(this.selectedVisitId)

    if (examinationName) {
      pathParts.push(examinationName)
    }

    const url = `${pathParts.join("/")}/`
    const state = { visitId: this.selectedVisitId, examinationName }
    if (this.historyUsed) {
      window.history.pushState(state, null, url)
    } else {
      this.historyUsed = true
      window.history.replaceState(state, null, url)
    }
  }

  renderCells(cells) {
    if (this.cellsTable) {
      this.cellsTable.destroy()
    }
    this.cellsEl.innerHTML = `<table></table>`

    this.cellsTable = new DataTable(this.cellsEl.lastElementChild, {
      type: "string",
      data: cells,
      searchable: false,
      fixedHeight: false,
      paging: false,
      scrollY: false,
      tabIndex: 8,
      rowNavigation: true,
      layout: {
        top: "",
        bottom: "",
      },
      rowRender: (row, tr, _index) => {
        if (!tr.attributes) {
          tr.attributes = {}
        }
        tr.attributes["data-visit-id"] = String(row.cells[3].data)
        tr.attributes["data-examination-name"] = String(row.cells[2].data)
        if (row.cells[1].data === 1) {
          // locked

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
          select: [0, 1, 2, 3],
          hidden: true,
        },
        {
          select: 1,
          render: (data, td, _index, _cIndex) => {
            if (data.length > 27) {
              td.childNodes[0].data = `${data.slice(0, 27)}...`
            }
            return td
          },
        },
      ],
    })
  }

  deleteVisit(id) {
    const visit = this.visitsTable.data.data.find(
      (row) => row.cells[0].data === id,
    )
    if (
      confirm(
        `${gettext("Are you sure you want to delete visit:")} ${visit.cells[1].data}`,
      )
    ) {
      return get(`/api/delete_visit/${id}/`).then(() => {
        const visitIndex = this.visitsTable.data.data.findIndex(
          (row) => row.cells[0].data === id,
        )
        if (visitIndex > -1) {
          this.visitsTable.rows.remove(visitIndex)
        }
      })
    }
    return Promise.resolve()
  }

  lockExaminationRow(tr) {
    const id = parseInt(tr.dataset.id)
    return get(`/api/lock_examination/${String(id)}/`).then(() => {
      // lock in examinations table
      const examinationIndex = this.examinationsTable.data.data.findIndex(
        (row) => row.cells[1].data === id,
      )
      const cell = this.examinationsTable.data.data[examinationIndex].cells[2]
      if (cell.data === 1) {
        cell.data = 0
        cell.text = "0"
      } else {
        cell.data = 1
        cell.text = "1"
      }
      this.examinationsTable.update()
      // lock in main data table if present
      const cellsIndex = this.cellsTable.data.data.findIndex(
        (row) => row.cells[0].data === id,
      )
      if (cellsIndex > -1) {
        const cell = this.cellsTable.data.data[cellsIndex].cells[1]
        if (cell.data === 1) {
          cell.data = 0
          cell.text = "0"
        } else {
          cell.data = 1
          cell.text = "1"
        }
        this.cellsTable.update()
      }
      return Promise.resolve()
    })
  }

  deleteExamination(id) {
    const examination = this.examinationsTable.data.data.find(
      (row) => row.cells[1].data === id,
    )
    if (
      confirm(
        `${gettext("Are you sure you want to delete examination:")} ${examination.cells[3].data}`,
      )
    ) {
      return get(`/api/delete_examination/${id}/`).then(() => {
        const examinationIndex = this.examinationsTable.data.data.findIndex(
          (row) => row.cells[1].data === id,
        )
        if (examinationIndex > -1) {
          this.examinationsTable.rows.remove(examinationIndex)
        }
      })
    }
    return Promise.resolve()
  }

  bind() {
    window.addEventListener("popstate", (event) => {
      const state = event.state
      if (state.visitId !== this.selectedVisitId) {
        this.selectedVisitId = state.visitId
        this.selectedExaminationName = state.examinationName
        this.getExaminations()
          .then((examinations) => this.renderExaminations(examinations))
          .then(() => {
            this.visitsTable.update()
            this.scrollExaminationIntoView()
            this.scrollVisitIntoView()
            return this.focusExaminations()
          })
      } else if (state.examinationName !== this.selectedExaminationName) {
        this.selectedExaminationName = state.examinationName
        this.examinationsTable.update()
      }
    })

    this.visitsEl.addEventListener("click", (event) => {
      const tr = event.target.closest("tr[data-index]")
      if (!tr) {
        return
      }
      const id = tr.dataset.id
      if (!id) {
        return
      }
      event.preventDefault()
      this.selectedVisitId = parseInt(id)
      this.visitsTable.rows.setCursor(parseInt(tr.dataset.index))
      this.setCreateExaminationLink()
      this.getExaminations()
        .then((examinations) => this.renderExaminations(examinations))
        .then(() => this.setHistory())
    })

    this.visitsEl.addEventListener("dblclick", (event) => {
      // Note that the dblclick will be preceded by a click event.
      const tr = event.target.closest("tr")
      if (!tr) {
        return
      }
      const id = tr.dataset.id
      if (!id) {
        return
      }
      event.preventDefault()
      window.location = `/data/visit/update/${id}`
    })

    this.visitsEl.addEventListener("keydown", (event) => {
      const index = this.visitsTable.rows.cursor
      const id = this.visitsTable.data.data[index].cells[0].data
      if (event.key === "Enter") {
        if (this.selectedVisitId !== id) {
          this.selectedVisitId = id
          this.setHistory()
        }
        window.location = `/data/visit/update/${id}`
      } else if (event.key === "Delete" && document.body.dataset.canModerate) {
        return this.deleteVisit(id)
      } else if (event.key === " ") {
        event.preventDefault()
        this.selectedVisitId = id
        this.visitsTable.update()
        this.setCreateExaminationLink()
        this.getExaminations()
          .then((examinations) => this.renderExaminations(examinations))
          .then(() => this.setHistory())
      }
    })

    const visitMenuItems = [
      {
        label: gettext("Select visit"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = tr.dataset.id
          this.selectedVisitId = parseInt(id)
          this.visitsTable.update()
          this.setCreateExaminationLink()
          this.getExaminations()
            .then((examinations) => this.renderExaminations(examinations))
            .then(() => this.setHistory())
        },
      },
      {
        label: gettext("Edit visit"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = tr.dataset.id
          window.location = `/data/visit/update/${id}`
        },
      },
    ]
    if (document.body.dataset.canModerate) {
      visitMenuItems.push({
        label: gettext("Delete visit"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = parseInt(tr.dataset.id)
          this.deleteVisit(id)
        },
      })
    }
    new ContextMenu(this.visitsEl, visitMenuItems, {
      show: (event) => {
        const tr = event.target.closest("tr[data-index]")
        if (!tr) {
          return false
        }
        this.visitsTable.rows.setCursor(parseInt(tr.dataset.index))
        return true
      },
    })

    this.examinationsEl.addEventListener("click", (event) => {
      const tr = event.target.closest("tr[data-index]")
      if (!tr) {
        return
      }
      const name = tr.dataset.name
      if (!name) {
        return
      }
      event.preventDefault()
      this.selectedExaminationName = name
      this.examinationsTable.rows.setCursor(parseInt(tr.dataset.index))
      this.setHistory()
      this.getCells().then((cells) => this.renderCells(cells))
    })

    this.examinationsEl.addEventListener("dblclick", (event) => {
      // Note that the dblclick will be preceded by a click event.
      const tr = event.target.closest("tr")
      if (!tr) {
        return
      }
      const url = tr.dataset.url
      if (!url) {
        return
      }
      event.preventDefault()

      window.location = url
    })

    this.examinationsEl.addEventListener("keydown", (event) => {
      const tr = this.examinationsTable.dom.querySelector("tr.datatable-cursor")
      const name = tr.dataset.name
      if (!name) {
        return
      }
      if (event.key === "Enter") {
        const url = tr.dataset.url
        if (!url) {
          return
        }
        const name = tr.dataset.name
        if (!name) {
          return
        }
        event.preventDefault()
        if (name !== this.selectedExaminationName) {
          this.selectedExaminationName = name
          this.setHistory()
        }
        window.location = url
      } else if (event.key === "Delete" && document.body.dataset.canModerate) {
        const id = tr.dataset.id
        return this.deleteExamination(parseInt(id))
      } else if (event.key === "l") {
        this.lockExaminationRow(tr)
      } else if (
        event.key === " " // Space
      ) {
        const name = tr.dataset.name
        if (!name) {
          return
        }
        event.preventDefault()
        this.selectedExaminationName = name
        this.setHistory()
        this.examinationsTable.update()
        this.getCells().then((cells) => this.renderCells(cells))
      }
    })

    const examinationMenuItems = [
      {
        label: gettext("Select examination"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const name = tr.dataset.name
          if (!name) {
            return
          }
          this.selectedExaminationName = name
          this.examinationsTable.update()
          this.getCells().then((cells) => this.renderCells(cells))
        },
      },
      {
        label: gettext("Edit examination"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const url = tr.dataset.url
          if (!url) {
            return
          }
          window.location = url
        },
      },
      {
        label: gettext("Lock/unlock event"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          this.lockExaminationRow(tr)
        },
      },
    ]

    if (document.body.dataset.canModerate) {
      examinationMenuItems.push({
        label: gettext("Open examination in backoffice"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = parseInt(tr.dataset.id)
          window.open(`/backoffice/data/examination/${id}/change/`)
        },
      })
      examinationMenuItems.push({
        label: gettext("Delete examination"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = parseInt(tr.dataset.id)
          this.deleteExamination(id)
        },
      })
    }
    new ContextMenu(this.examinationsEl, examinationMenuItems, {
      show: (event) => {
        const tr = event.target.closest("tr[data-index]")
        if (!tr) {
          return false
        }
        this.examinationsTable.rows.setCursor(parseInt(tr.dataset.index))
        return true
      },
    })

    this.cellsEl.addEventListener("click", (event) => {
      const tr = event.target.closest("tr[data-index]")
      if (!tr) {
        return
      }
      const id = tr.dataset.visitId
      if (!id) {
        return
      }
      event.preventDefault()
      this.cellsTable.rows.setCursor(parseInt(tr.dataset.index))
      this.selectedVisitId = parseInt(id)
      this.visitsTable.update()
      this.setCreateExaminationLink()
      this.getExaminations()
        .then((examinations) => this.renderExaminations(examinations))
        .then(() => {
          this.setHistory()
          this.scrollExaminationIntoView()
          this.scrollVisitIntoView()
        })
    })

    this.cellsEl.addEventListener("keydown", (event) => {
      const index = this.cellsTable.rows.cursor
      const id = this.cellsTable.data.data[index].cells[3].data
      if (event.key === " ") {
        event.preventDefault()
        this.selectedVisitId = parseInt(id)
        this.visitsTable.update()
        this.setCreateExaminationLink()
        this.getExaminations()
          .then((examinations) => this.renderExaminations(examinations))
          .then(() => {
            this.setHistory()
            this.scrollExaminationIntoView()
            this.scrollVisitIntoView()
          })
      }
    })
  }
}
