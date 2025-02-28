import { getJson } from "../tools"

export class BaseInfo {
  constructor(el, body, copsacId) {
    this.el = el
    this.body = body
    this.copsacId = copsacId
    this.proband = {}
  }

  init() {
    return this.getProband().then(() => this.render())
  }

  getProband() {
    return getJson(`/api/get_proband/${this.copsacId}/`).then(({ json }) => {
      if (!json.proband) {
        alert(gettext("There is no proband in the system with this ID."))
        return
      }
      this.proband = json.proband
    })
  }

  render() {
    this.el.innerHTML = `${this.proband.name} (Copsac ID: ${this.copsacId}) | Age: ${this.proband.age} | CPR: ${this.proband.cpr} | Status: ${this.proband.status} | Divorced: ${this.proband.divorced}`
    if (this.proband.legal_guardian.length) {
      this.el.innerHTML += ` | ${gettext("Legal guardian:")} ${this.proband.legal_guardian}`
    }
    if (this.proband.status === "passive") {
      this.body.classList.add("passive")
    } else if (this.proband.status === "active") {
      this.body.classList.add("active")
    } else if (this.proband.status === "withdrawn") {
      this.body.classList.add("withdrawn")
    }
    if (this.copsacId < 2000) {
      this.body.classList.add("copsac-copsac")
    } else {
      this.body.classList.add("copsac-abc")
    }
  }
}
