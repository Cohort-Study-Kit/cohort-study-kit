import { getJson, post, escapeText } from "../tools"

export class Reminder {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId
    this.value = ""
  }

  init() {
    this.bind()
    return this.getReminder().then(() => this.render())
  }

  getReminder() {
    return getJson(`/api/get_reminder/${this.copsacId}/`).then(({ json }) => {
      if (json.reminder) {
        this.value = json.reminder.replaceAll("\r", "")
      }
    })
  }

  render() {
    const outHTML = `<h4>Reminder: <button class="edit">Edit</button></h4>
      <div class="reminder disabled">
        <textarea placeholder="Currently no reminders for this proband" readonly>${escapeText(
          this.value,
        )}</textarea>
        <div class="mx-1 my-2">
          <button class="btn btn-sm btn-primary save">Save</button>
          <button class="btn btn-sm btn-secondary cancel">Cancel</button>
        </div>
      </div>`
    this.el.innerHTML = outHTML
    const textarea = this.el.querySelector("textarea")
    textarea.style.height = textarea.scrollHeight + 3 + "px"
  }

  bind() {
    let saveDialogOpen = false
    this.el.addEventListener("click", (event) => {
      const reminderDiv = this.el.querySelector("div.reminder")
      const textarea = this.el.querySelector("textarea")
      if (event.target.closest("button.edit")) {
        reminderDiv.classList.toggle("disabled")
        textarea.toggleAttribute("readonly")

        if (!textarea.hasAttribute("readonly")) {
          // Set focus at end of textarea
          const end = textarea.value.length
          textarea.setSelectionRange(end, end)
          textarea.focus()
        }
      } else if (event.target.closest("button.save")) {
        if (saveDialogOpen) {
          return
        }
        saveDialogOpen = true
        const text = textarea.value.replaceAll("\r", "")
        if (
          text !== this.value &&
          confirm("Do you really want to change the reminder?")
        ) {
          this.updateReminder(text)
          reminderDiv.classList.add("disabled")
          textarea.setAttribute("readonly", "true")
        }
        saveDialogOpen = false
      } else if (event.target.closest("button.cancel")) {
        if (saveDialogOpen) {
          return
        }
        saveDialogOpen = true
        const text = textarea.value.replaceAll("\r", "")
        if (
          (text !== this.value &&
            confirm(
              "Do you really want to cancel your changes to the reminder?",
            )) ||
          text === this.value
        ) {
          textarea.value = this.value
          reminderDiv.classList.add("disabled")
          textarea.setAttribute("readonly", "true")
        }
        saveDialogOpen = false
      }
    })

    window.addEventListener(
      "beforeunload",
      (event) => {
        const textarea = this.el.querySelector("textarea:not(:read-only)")
        if (!textarea) {
          return
        }
        const currentValue = textarea.value.replaceAll("\r", "")
        if (currentValue !== this.value) {
          // Prompt user that there are unsaved data.
          event.preventDefault()
          event.returnValue = ""
        }
      },
      { capture: true },
    )
  }

  updateReminder(text) {
    return post(`/api/save_reminder/${this.copsacId}/`, {
      value: text,
    }).then(() => {
      this.value = text
    })
  }
}
