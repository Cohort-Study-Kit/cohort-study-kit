import flatpickr from "flatpickr"
import { getJson, postJson, escapeText, parseDate, renderDate } from "../tools"

function dateHTMLReadonly(date) {
  return `<b>${renderDate(date)}</b>`
}

function dateHTML(date) {
  return `<input type="date" value="${date}">`
}

export class Note {
  constructor(el, copsacId) {
    this.el = el
    this.copsacId = copsacId
    this.notes = []
  }

  init() {
    this.bind()
    return this.getNotes().then(() => this.render())
  }

  getNotes() {
    return getJson(`/api/get_notes/${this.copsacId}/`).then(({ json }) => {
      const notes = json.notes
      notes.forEach((note) => (note.note = note.note.replaceAll("\r", "")))
      this.notes = notes
    })
  }

  render() {
    let outHTML =
      '<h4>Notes: <button class="edit add-note">+</button></h4><div class="proband-notes-box">'
    outHTML += `<div class="note hidden">
        <textarea data-note-id="0" placeholder="Write a new note here" id="new_note"></textarea>
        <div class="mx-1 my-2">
          <button class="btn btn-sm btn-primary save">Save</button>
          <button class="btn btn-sm btn-secondary cancel">Cancel</button>
        </div>
      </div>`
    outHTML += this.notes
      .map(
        (note) => `<div class="note disabled"><span class="date" data-date="${
          note.date
        }">${dateHTMLReadonly(
          note.date,
        )}</span><button class="edit edit-note">Edit</button>
          <textarea data-note-id="${note.id}" readonly>${escapeText(
            note.note,
          )}</textarea>
          <div class="mx-1 my-2">
            <button class="btn btn-sm btn-primary save">Save</button>
            <button class="btn btn-sm btn-secondary cancel">Cancel</button>
          </div>
        </div>`,
      )
      .join("")
    outHTML += "</div>"
    this.el.innerHTML = outHTML
    // Set correct height for textareas. Cannot be done with CSS. See https://stackoverflow.com/questions/2803880/is-there-a-way-to-get-a-textarea-to-stretch-to-fit-its-content-without-using-php
    this.el.querySelectorAll("textarea").forEach((textarea) => {
      textarea.style.height = `${Math.max(textarea.scrollHeight + 3, 30)}px`
      textarea.addEventListener("input", () => {
        textarea.style.height = ""
        textarea.style.height = `${Math.max(textarea.scrollHeight + 3, 30)}px`
      })
    })
  }

  bind() {
    let saveDialogOpen = false
    this.el.addEventListener("click", (event) => {
      if (event.target.closest("button.add-note")) {
        const noteDiv = this.el.querySelector(".note")
        noteDiv.classList.remove("hidden")
        return
      }
      const noteDiv = event.target.closest("div.note")
      if (!noteDiv) {
        return
      }
      if (event.target.closest("button.edit-note")) {
        noteDiv.classList.toggle("disabled")
        const textarea = noteDiv.querySelector("textarea")
        textarea.toggleAttribute("readonly")
        const noteDateDiv = noteDiv.querySelector(".date"),
          noteDateValue = noteDateDiv.dataset.date
        if (textarea.hasAttribute("readonly")) {
          noteDateDiv.innerHTML = dateHTMLReadonly(noteDateValue)
        } else {
          noteDateDiv.innerHTML = dateHTML(noteDateValue)
          // Use flatpickr to use Danish date format.
          const fEl = flatpickr(noteDateDiv.firstElementChild, {
            altFormat: "d-m-Y",
            altInput: true,
            allowInput: true,
            onClose: function (_selectedDates, dateStr) {
              if (!dateStr) {
                dateStr = ""
                fEl.input.value = dateStr
                fEl.altInput.value = dateStr
              }
              noteDateDiv.dataset.date = dateStr
            },
            parseDate,
            errorHandler: function (_error) {},
          })
          fEl.altInput.setAttribute("autocomplete", "off")
          fEl.altInput.classList.add("form-control-sm")
          // Set focus at end of textarea
          const end = textarea.value.length
          textarea.setSelectionRange(end, end)
          textarea.focus()
        }
        return
      } else if (event.target.closest("button.save")) {
        if (saveDialogOpen) {
          return
        }
        const textarea = noteDiv.querySelector("textarea")
        const noteId = parseInt(textarea.dataset.noteId)
        const noteText = textarea.value.replaceAll("\r", "")
        const noteDate = noteDiv.querySelector(".date")?.dataset.date
        if (noteDate && noteDate.length === 0) {
          alert("The note needs a valid date.")
          return
        }
        saveDialogOpen = true
        const oldNote = this.notes.find((note) => note.id === noteId)
        if (noteText === "") {
          if (noteId) {
            if (confirm("Are you sure you want to delete this note?")) {
              this.updateNote(noteId, noteText)
              noteDiv.classList.add("disabled")
              textarea.setAttribute("readonly", "true")
            }
          } else {
            noteDiv.classList.add("hidden")
          }
        } else if (
          oldNote &&
          noteText === oldNote.note &&
          noteDate === oldNote.date
        ) {
          // There has been no change. Don't update
          noteDiv.classList.add("disabled")
          textarea.setAttribute("readonly", "true")
        } else if (noteId === 0) {
          noteDiv.classList.add("hidden")
          textarea.value = ""
          this.updateNote(noteId, noteText)
        } else {
          if (confirm("Do you really want to change this note?")) {
            this.updateNote(noteId, noteText, noteDate)
            noteDiv.classList.add("disabled")
            textarea.setAttribute("readonly", "true")
          }
        }
        saveDialogOpen = false
      } else if (event.target.closest("button.cancel")) {
        if (saveDialogOpen) {
          return
        }
        saveDialogOpen = true
        const textarea = noteDiv.querySelector("textarea")
        const noteId = parseInt(textarea.dataset.noteId)
        const noteText = textarea.value.replaceAll("\r", "")
        const oldNote = this.notes.find((note) => note.id === noteId)
        if (oldNote) {
          const noteDateDiv = noteDiv.querySelector(".date"),
            noteDateValue = noteDateDiv.dataset.date
          if (noteText !== oldNote.note || noteDateValue !== oldNote.date) {
            if (
              confirm("Do you really want to cancel your changes to this note?")
            ) {
              textarea.value = oldNote.note
              noteDateDiv.dataset.date = oldNote.date
              noteDateDiv.innerHTML = dateHTMLReadonly(oldNote.date)
              textarea.setAttribute("readonly", "true")
              noteDiv.classList.add("disabled")
            }
          } else {
            noteDateDiv.innerHTML = dateHTMLReadonly(oldNote.date)
            textarea.setAttribute("readonly", "true")
            noteDiv.classList.add("disabled")
          }
        } else if (
          (noteText.length &&
            confirm("Do you really want to cancel writing this note?")) ||
          !noteText.length
        ) {
          textarea.value = ""
          noteDiv.classList.add("hidden")
        }
        saveDialogOpen = false
      }
    })

    window.addEventListener("beforeunload", (event) => {
      const textareas = Array.from(
        this.el.querySelectorAll("textarea:not(:read-only)"),
      )
      const unsavedChanges = textareas.find((textarea) => {
        const noteId = parseInt(textarea.dataset.noteId)
        const noteText = textarea.value.replaceAll("\r", "")
        if (noteId === 0 && noteText === "") {
          return false
        }
        const returnValue =
          noteText !== this.notes.find((note) => note.id === noteId)?.note
        return returnValue
      })

      if (unsavedChanges) {
        // Prompt user that there are unsaved data.
        event.preventDefault()
        event.returnValue = ""
        return ""
      }
    })
  }

  updateNote(noteId, noteText, noteDate = false) {
    const updatedValues = { note: noteText }
    if (noteDate) {
      updatedValues.date = noteDate
    }
    return postJson(
      `/api/save_note/${this.copsacId}/${noteId}/`,
      updatedValues,
    ).then(({ json }) => {
      if (noteId) {
        if (noteText.length) {
          const note = this.notes.find((note) => note.id === noteId)
          note.note = noteText
          if (noteDate) {
            note.date = noteDate
            this.notes.sort((a, b) => {
              if (a.date < b.date) {
                return 1
              } else if (b.date < a.date) {
                return -1
              } else if (a.id < b.id) {
                return 1
              } else {
                return -1
              }
            })
          }
        } else {
          this.notes = this.notes.filter((note) => note.id !== noteId)
        }
      } else {
        this.notes.unshift({
          id: json.id,
          date: json.date,
          note: noteText,
        })
      }
      return this.render()
    })
  }
}
