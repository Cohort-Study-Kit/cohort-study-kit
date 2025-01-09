import { getJson } from "../tools"

export class Address {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId
    this.addresses = []
  }

  init() {
    return this.getAddresses().then(() => this.render())
  }

  getAddresses() {
    return getJson(`/api/address/get_current/${this.copsacId}/`).then(
      ({ json }) => (this.addresses = json.addresses),
    )
  }

  render() {
    const outHTML = `<h4>Addresses: <a class="plus-button create-address" href="/address/${
      this.copsacId
    }/">+</a></h4>
    <div class="address-box">
      ${this.addresses
        .map((address) => {
          return `<div class="textblock"> <b> ${address.street}, ${
            address.postcode
          } ${address.city}${address.province ? `, ${address.province}` : ""}${
            address.country === "DK" ? "" : `, ${address.country}`
          } </b> </div>
          ${
            address.home_type
              ? `<div class="textblock"> <b> Home type: </b> ${address.home_type} </div>`
              : ""
          }
          ${
            address.phone
              ? `<div class="textblock"> <b> Phone: </b> ${address.phone} </div>`
              : ""
          }
          ${
            address.cellphone_mother
              ? `<div class="textblock"> <b> Cellphone mother: </b> ${address.cellphone_mother} </div>`
              : ""
          }
          ${
            address.cellphone_father
              ? `<div class="textblock"> <b> Cellphone father: </b> ${address.cellphone_father} </div>`
              : ""
          }
          ${
            address.email_mother
              ? `<div class="textblock"> <b> Email mother: </b> ${address.email_mother} </div>`
              : ""
          }
          ${
            address.email_father
              ? `<div class="textblock"> <b> Email father: </b> ${address.email_father} </div>`
              : ""
          }
          ${
            address.comments
              ? `<div class="textblock"> <b> Comments: </b> ${address.comments} </div>`
              : ""
          }
          ${
            address.start_date
              ? `<div class="textblock"> <b> Move in: </b> ${address.start_date} </div>`
              : ""
          }
          `
        })
        .join("<hr>")}
    </div>`
    this.el.innerHTML = outHTML
  }
}
