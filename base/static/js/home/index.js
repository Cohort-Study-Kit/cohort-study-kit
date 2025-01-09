import { get, getJson, autocomplete } from "../tools"

import { Address } from "./address"
import { BaseInfo } from "./base_info"
import { Institution } from "./institution"
import { Diagnosis } from "./diagnosis"
import { Medication } from "./medication"
import { Consent } from "./consent"
import { Note } from "./note"
import { Relatives } from "./relatives"
import { Reminder } from "./reminder"
import { VisitsExaminationsCells } from "./visits_examinations_cells"

export class Home {
  constructor() {
    const pathParts = window.location.pathname.split("/")
    this.copsacId = pathParts[2]
    this.probands = []
  }

  init() {
    return Promise.all([
      new Promise((resolve) =>
        document.addEventListener("DOMContentLoaded", resolve),
      ),
      getJson(`/api/get_probands/`).then(({ json }) => {
        this.probands = json.probands
        return Promise.resolve()
      }),
    ]).then(() => this.whenReady())
  }

  bind() {
    document.querySelector("#id_logout").addEventListener("click", (event) => {
      event.preventDefault()
      return get("/api/logout_user/").then(() => (window.location = "/"))
    })

    document.querySelector("#probands").addEventListener("input", (event) => {
      const match = document.querySelector("#probands").value.match(/\d{4}/)
      if (!match) {
        return
      }
      event.preventDefault()
      window.location = `/proband/${match[0]}/`
    })
  }

  whenReady() {
    autocomplete(document.querySelector("#probands"), this.probands)

    if (this.copsacId) {
      const baseInfo = new BaseInfo(
        document.querySelector("#base-info"),
        document.body,
        this.copsacId,
      )
      const address = new Address(
        document.querySelector("#address"),
        this.copsacId,
      )
      address.init()
      baseInfo.init()
      const institution = new Institution(
        document.querySelector("#institution"),
        this.copsacId,
      )
      institution.init()
      const consent = new Consent(
        document.querySelector("#consent"),
        this.copsacId,
      )
      consent.init()
      const diagnosis = new Diagnosis(
        document.querySelector("#diagnosis"),
        this.copsacId,
      )
      diagnosis.init()

      const medication = new Medication(
        document.querySelector("#medication"),
        this.copsacId,
      )
      medication.init()

      const relatives = new Relatives(
        document.querySelector("#relatives"),
        this.copsacId,
      )
      relatives.init()

      const reminder = new Reminder(
        document.querySelector("#reminder"),
        this.copsacId,
      )
      reminder.init()

      const notes = new Note(document.querySelector("#notes"), this.copsacId)
      notes.init()

      const visitsExaminationsCells = new VisitsExaminationsCells(
        document.querySelector("#visits"),
        document.querySelector("#examinations-list"),
        document.querySelector("#cells-list"),
        this.copsacId,
      )
      visitsExaminationsCells.init()
    } else {
      document.querySelector("#probands").focus()
    }
    this.bind()
  }
}
