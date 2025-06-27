import { DataTable } from "simple-datatables"

import { get, getJson, dateCell, ContextMenu } from "../tools"

const DISPLAY_VALUES = {
  father: gettext("Father"),
  second_father: gettext("2nd father"),
  non_bio_father: gettext("Non-biological father"),
  stepfather: gettext("Stepfather"),
  mother: gettext("Mother"),
  second_mother: gettext("2nd Mother"),
  non_bio_mother: gettext("Non-biological mother"),
  stepmother: gettext("Stepmother"),
  sibling: gettext("Sibling"),
  same_father: gettext("Same father"),
  same_mother: gettext("Same mother"),
  non_bio_sibling: gettext("Non-biological sibling"),
  unknown: gettext("Unknown"),
}

export class Relatives {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId

    this.table = false
  }

  init() {
    this.bind()
    return this.getData().then((relatives) => this.renderData(relatives))
  }

  getData() {
    return getJson(`/api/get_relatives/${this.copsacId}/`).then(({ json }) => {
      return json.relatives.map((row) =>
        row.map((cell, index) => {
          if (index !== 4) {
            return cell
          }
          return dateCell(cell)
        }),
      )
    })
  }

  renderData(relatives) {
    this.el.innerHTML = `<table></table>`
    this.table = new DataTable(this.el.lastElementChild, {
      type: "string",
      data: {
        headings: [
          gettext("ID"),
          `${gettext("Relatives:")} <a class="plus-button create-relative" href="/base/relative/create/${this.copsacId}/">+</a>`,
          gettext("Relation"),
          gettext("Twin"),
          gettext("Deathdate"),
          gettext("Comments"),
        ],
        data: relatives,
      },
      tabIndex: 4,
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
        const deathDate = String(row.cells[4].data).trim()
        if (deathDate.length) {
          tr.attributes["data-deathdate"] = deathDate
        }
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
          render: (value, _td, _rowIndex, _cellIndex) => {
            return DISPLAY_VALUES[value]
          },
        },
        {
          select: [3, 4],
          hidden: true,
        },
        {
          select: 5,
          render: (value, _td, _rowIndex, _cellIndex) => {
            if (value.length > 13) {
              return `${value.substring(0, 12)}…`
            }
            return value
          },
        },
      ],
    })
  }

  deleteData(id) {
    const relative = this.table.data.data.find(
      (row) => row.cells[0]?.data === id,
    )
    if (
      confirm(
        `${gettext("Are you sure you want to delete relative:")} ${relative.cells[1].data}`,
      )
    ) {
      return get(`/api/delete_relative/${id}/`).then(() => {
        const index = this.table.data.data.findIndex(
          (row) => row.cells[0]?.data === id,
        )
        if (index > -1) {
          this.table.rows.remove(index)
        }
      })
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
      window.location = `/base/relative/update/${this.copsacId}/${id}/`
    })

    this.el.addEventListener("keydown", (event) => {
      const index = this.table.rows.cursor
      const id = this.table.data.data[index].cells[0].data
      if (event.keyCode === 13) {
        // Enter
        event.preventDefault()
        window.location = `/base/relative/update/${this.copsacId}/${id}/`
      } else if (
        event.keyCode === 46 && // Delete
        document.body.dataset.canModerate
      ) {
        return this.deleteData(parseInt(id))
      }
    })

    const menuItems = [
      {
        label: gettext("Edit relative"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = tr.dataset.id
          window.location = `/base/relative/update/${this.copsacId}/${id}/`
        },
      },
    ]
    if (document.body.dataset.canModerate) {
      menuItems.push({
        label: gettext("Delete relative"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = tr.dataset.id
          if (!id) {
            return
          }
          return this.deleteData(parseInt(id))
        },
      })
    }
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
