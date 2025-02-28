import { getJson } from "../tools"

export class Institution {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId
    this.institutions = []
  }

  init() {
    return this.getInstitutions().then(() => this.render())
  }

  getInstitutions() {
    return getJson(
      `/api/educational_institution/get_current/${this.copsacId}/`,
    ).then(({ json }) => (this.institutions = json.educational_institutions))
  }

  render() {
    const outHTML = `<h4>${gettext("Institutions")}: <a class="plus-button create-institution" href="/educational_institution/${
      this.copsacId
    }/">+</a></h4>
    <div class="institution-box">
      ${this.institutions
        .map(
          (institution) => `<div class="textblock"> <b> ${
            institution.street
          }, ${institution.postcode} ${institution.city}${
            institution.province ? `, ${institution.province}` : ""
          }${
            institution.country === settings_COUNTRY
              ? ""
              : `, ${institution.country}`
          } </b> </div>
          ${
            institution.type
              ? `<div class="textblock"> <b> ${gettext("Type")}: </b> ${institution.type} </div>`
              : ""
          }
          ${
            institution.phone
              ? `<div class="textblock"> <b> ${gettext("Phone")}: </b> ${institution.phone} </div>`
              : ""
          }
          ${
            institution.comments
              ? `<div class="textblock"> <b> ${gettext("Comments")}: </b> ${institution.comments} </div>`
              : ""
          }
       `,
        )
        .join("<hr>")}
    </div>`
    this.el.innerHTML = outHTML
  }
}
