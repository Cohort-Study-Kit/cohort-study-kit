import { DataTable } from "simple-datatables"

import { get, getJson, dateCell, ContextMenu } from "../tools"

export class Medication {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId

    this.medications = []
    this.vaccines = []
    this.table = false
    this.birthdate = false
    window.Medication = this
  }

  init() {
    this.bind()
    return this.getData().then(() => {
      this.createVaccineList()
      return this.renderData()
    })
  }

  getData() {
    return getJson(`/api/medication/get/${this.copsacId}/`).then(({ json }) => {
      this.birthdate = new Date(json.birthdate)
      this.medications = json.medications
        .filter((medication) => medication.recipient === "proband")
        .map((medication) => ({
          cells: [
            { data: medication.id },
            { data: medication.lock_status },
            { data: medication.atc_code__description },
            { data: medication.atc_code__code },
            dateCell(medication.start_date),
            dateCell(medication.end_date),
            {
              data: `${medication.dose} ${medication.unit} ${medication.frequency} ${medication.period} ${medication.route} ${medication.route_spec}`,
            },
          ],
        }))
    })
  }

  createVaccineList() {
    /* Vaccines are registered as medications. We should always as minimum have all these vaccines listed.
     * If a vaccine cannot be found under medication, it neds to be listed with empty dates. If too many are
     * found, they should still be listed.
       J07CA06/J07AL01 3 mdr. | difteri-tetanus-kighoste-polio-Hib 1 og PCV-1
       J07CA06/J07AL01 5 mdr. | difteri-tetanus-kighoste-polio-Hib 2 og PCV-2
       J07CA06/J07AL01 12 mdr. | difteri-tetanus-kighoste-polio-Hib 3 og PCV-3
       J07BD52 15 mdr. | MFR 1
       J07BD52 4 år | MFR 2
       J07AJ52 5 år | difteri-tetanus-kighoste-polio revaccination
       J07BM03 12 år | HPV 1
       J07BM03 13 år + 1 måned | HPV 2 **
       J07BX03 COVID-19 1 (20)
       J07BX03 COVID-19 2 (21)
       J07BX03 COVID-19 3 (22)
    */
    this.vaccines = this.medications.filter(
      (medication) => medication.cells[3].data.slice(0, 3) === "J07",
    )

    const createEmptyVaccineRow = (name, code, date) => {
      return {
        cells: [
          { data: "missing_vaccine" },
          { data: "unlocked" },
          { data: name },
          { data: code },
          { data: "", text: "", order: date.toISOString().split("T")[0] },
          dateCell(),
          { data: " " },
        ],
      }
    }

    const J07CA06s = this.vaccines.filter(
      (medication) => medication.cells[3].data === "J07CA06",
    )
    if (J07CA06s.length < 1) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "DiTeKiPol-Hib-vaccination",
          "J07CA06",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 3)),
        ),
      )
    }
    if (J07CA06s.length < 2) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "DiTeKiPol-Hib-vaccination",
          "J07CA06",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 5)),
        ),
      )
    }
    if (J07CA06s.length < 3) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "DiTeKiPol-Hib-vaccination",
          "J07CA06",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 12)),
        ),
      )
    }

    const J07AL01s = this.vaccines.filter(
      (medication) => medication.cells[3].data === "J07AL01",
    )
    if (J07AL01s.length < 1) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "PCV7",
          "J07AL01",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 3)),
        ),
      )
    }
    if (J07AL01s.length < 2) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "PCV7",
          "J07AL01",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 5)),
        ),
      )
    }
    if (J07AL01s.length < 3) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "PCV7",
          "J07AL01",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 12)),
        ),
      )
    }

    const J07BD52s = this.vaccines.filter(
      (medication) => medication.cells[3].data === "J07BD52",
    )
    if (J07BD52s.length < 1) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "MFR",
          "J07BD52",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 15)),
        ),
      )
    }
    if (J07BD52s.length < 2) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "MFR",
          "J07BD52",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 48)),
        ),
      )
    }

    if (
      !this.vaccines.find(
        (medication) => medication.cells[3].data === "J07AJ52",
      )
    ) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "DiTeKiPol-revaccination",
          "J07AJ52",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 60)),
        ),
      )
    }

    const J07BM03s = this.vaccines.filter(
      (medication) => medication.cells[3].data === "J07BM03",
    )

    if (J07BM03s.length < 1) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "HPV",
          "J07BM03",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 144)),
        ),
      )
    }
    if (J07BM03s.length < 2) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "HPV",
          "J07BM03",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 157)),
        ),
      )
    }

    const J07BX03s = this.vaccines.filter(
      (medication) => medication.cells[3].data === "J07BX03",
    )

    if (J07BX03s.length < 1) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "Covid 19",
          "J07BX03",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 240)),
        ),
      )
    }
    if (J07BX03s.length < 2) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "Covid 19",
          "J07BX03",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 252)),
        ),
      )
    }
    if (J07BX03s.length < 3) {
      this.vaccines.push(
        createEmptyVaccineRow(
          "Covid 19",
          "J07BX03",
          new Date(this.birthdate.setMonth(this.birthdate.getMonth() + 264)),
        ),
      )
    }

    this.vaccines.sort((a, b) => {
      if (a.cells[4].order > b.cells[4].order) {
        return 1
      } else if (a.cells[4].order < b.cells[4].order) {
        return -1
      } else {
        return 0
      }
    })
  }

  renderData() {
    if (this.table) {
      this.table.destroy()
    }
    const headings = [
      "ID",
      "lock_status",
      `<span class="medication active">Medications</span>/<span class="vaccination">Vaccinations</span>: <a class="plus-button" href="/medication/${this.copsacId}/">+</a>`,
      "ATC",
      "Startdate",
      "Finishdate",
      "DoseUnitFreqSpec",
    ]
    this.el.innerHTML = "<table></table>"
    this.table = new DataTable(this.el.lastElementChild, {
      type: "string",
      data: {
        headings,
        data: this.medications,
      },
      tabIndex: 7,
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
        const atc = row.cells[3].data
        if (!tr.attributes) {
          tr.attributes = {}
        }
        tr.attributes["data-id"] = String(datasetId)
        tr.attributes["data-atc"] = String(atc)
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
    return get(`/api/medication/lock/${this.copsacId}/${id}/`).then(() => {
      const index = this.table.data.data.findIndex(
        (row) => row.cells[0].data === id,
      )
      const cell = this.table.data.data[index].cells[1]
      const currentValue = cell.data
      if (currentValue === "unlocked") {
        cell.data = "locked"
      } else {
        cell.data = "unlocked"
      }
      this.table.update()
      return Promise.resolve()
    })
  }

  deleteData(id) {
    const data = this.table.data.data
    const medication = data.find((row) => row.cells[0]?.data === id)
    if (
      confirm(`Are you sure you want to delete: ${medication.cells[2].data}`)
    ) {
      return get(`/api/medication/delete/${this.copsacId}/${id}/`).then(
        ({ status, redirected }) => {
          if (status === 200 && !redirected) {
            const index = data.findIndex((row) => row.cells[0]?.data === id)
            if (index > -1 && this.table.data.data === data) {
              this.table.rows.remove(index)
            }
          }
        },
      )
    }
    return Promise.resolve()
  }

  bind() {
    this.el.addEventListener("mousedown", (event) => {
      const medVacSwitch = event.target.closest(
        "span.medication,span.vaccination",
      )

      if (medVacSwitch) {
        medVacSwitch.classList.add("active")
        if (medVacSwitch.matches("span.vaccination")) {
          this.el.querySelector("span.medication").classList.remove("active")
          this.table.data.data = this.vaccines
        } else {
          this.el.querySelector("span.vaccination").classList.remove("active")
          this.table.data.data = this.medications
        }
        this.table.update()
        event.preventDefault()
        event.stopPropagation()
        return
      }

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
      if (id === "missing_vaccine") {
        const atc = tr.dataset.atc
        window.location = `/medication/create/${this.copsacId}/?atc=${atc}`
      } else {
        window.location = `/medication/update/${this.copsacId}/${id}/`
      }
    })

    this.el.addEventListener("keydown", (event) => {
      const index = this.table.rows.cursor
      const id = this.table.data.data[index].cells[0].data
      const atc = this.table.data.data[index].cells[3].data

      if (event.keyCode === 13) {
        // Enter
        event.preventDefault()
        if (id === "missing_vaccine") {
          window.location = `/medication/create/${this.copsacId}/?atc=${atc}`
        } else {
          window.location = `/medication/update/${this.copsacId}/${id}/`
        }
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
        label: gettext("Edit medication"),
        callback: (event) => {
          const tr = event.target.closest("tr")
          const id = tr.dataset.id
          if (id === "missing_vaccine") {
            const atc = tr.dataset.atc
            window.location = `/medication/create/${this.copsacId}/?atc=${atc}`
          } else {
            window.location = `/medication/update/${this.copsacId}/${id}/`
          }
        },
      },
      {
        label: "Lock/unlock medication",
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
        label: gettext("Delete medication"),
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
