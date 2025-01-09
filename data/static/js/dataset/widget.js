import { DiffDOM } from "diff-dom"

import { editFormTemplate, gridTemplate, menuItems } from "./templates"
import { countPreviousSiblings, findCodeVariables } from "./tools"
import { ContextMenu } from "../tools"
import { DEFAULT_CONTENT } from "./default"

export class DatasetFormWidget {
  constructor(container, options) {
    this.container = container
    this.options = options
    this.hasDataSchema = Boolean(options.data_schema.properties)
    this.value = null
    this.selectedElement = null
    this.selectedWarning = null
    this.selectedExternalValue = null
    this.dragging = false
    this.dd = new DiffDOM()
    this.bind()
  }

  bind() {
    this.container.addEventListener("click", (event) => this.click(event))
    this.container.addEventListener("change", (event) => this.change(event))
    // We also capture input events to get changes from text input immediately
    this.container.addEventListener("input", (event) => this.change(event))
  }

  setupDragAndDrop() {
    const gridElement = this.container.querySelector(".grid")

    let elementDOM, element
    let initialX, initialY
    let gridColumnStart, gridRowStart
    let outerHeight, outerWidth
    let gridUnitWidth, gridUnitHeight

    gridElement.addEventListener("mousedown", (event) => {
      if (elementDOM) {
        // Already dragging other element
        return
      }
      elementDOM = event.target.closest("div.grid-item.outer")
      if (!elementDOM) {
        return
      }
      initialX = event.clientX
      initialY = event.clientY
      this.dragging = false

      gridUnitWidth =
        (gridElement.offsetWidth * (this.options.scale || 1)) / 100
      gridUnitHeight =
        (gridElement.offsetHeight * (this.options.scale || 1)) / 100
      element =
        this.value.elements[
          countPreviousSiblings(
            event.target.closest("div.grid-item.outer.main,li.item.main"),
          )
        ]

      if (elementDOM.matches("div.grid-item.outer.sub,li.item.sub")) {
        outerHeight = element.inner_coordinates.height
        outerWidth = element.inner_coordinates.width
        element =
          element.sub_elements[
            countPreviousSiblings(elementDOM) - 1 // -1 to subtract main item
          ]
      } else {
        outerHeight = 100
        outerWidth = 100
      }
      gridColumnStart = element.outer_coordinates.x
      gridRowStart = element.outer_coordinates.y
    })

    gridElement.addEventListener("mousemove", (event) => {
      if (!elementDOM) {
        return
      }
      const columnOffset = parseInt((event.clientX - initialX) / gridUnitWidth)
      const rowOffset = parseInt((event.clientY - initialY) / gridUnitHeight)
      const newGridColumnStart = Math.min(
        Math.max(gridColumnStart + columnOffset, 1),
        outerWidth - element.outer_coordinates.width + 1,
      )
      const newGridRowStart = Math.min(
        Math.max(gridRowStart + rowOffset, 1),
        outerHeight - element.outer_coordinates.height + 1,
      )
      if (
        element.outer_coordinates.y !== newGridRowStart ||
        element.outer_coordinates.x !== newGridColumnStart
      ) {
        this.dragging = true
      }
      if (!this.dragging) {
        return
      }
      elementDOM.style.gridColumnStart = newGridColumnStart
      elementDOM.style.gridRowStart = newGridRowStart
      element.outer_coordinates.y = newGridRowStart
      element.outer_coordinates.x = newGridColumnStart
    })
    gridElement.addEventListener("mouseup", (event) => {
      if (!elementDOM || !this.dragging) {
        if (elementDOM) {
          elementDOM = null
        }
        return
      }
      event.preventDefault()
      event.stopImmediatePropagation()
      elementDOM = null
      this.options.onChange()
    })
  }

  setupHandleBar() {
    const gridElement = this.container.querySelector(".grid")
    const handleBar = this.container.querySelector(".grid-handle-bar")
    let isResizing = false

    const originalWidth = gridElement.offsetWidth * (this.options.scale || 1)
    const originalHeight = gridElement.offsetHeight * (this.options.scale || 1)

    handleBar.addEventListener("mousedown", (e) => {
      isResizing = true
      const prevX = e.clientX
      const prevY = e.clientY
      const currentWidth = originalWidth * (this.options.scale || 1)
      const currentHeight = originalHeight * (this.options.scale || 1)

      const resizeGrid = (e) => {
        e.stopImmediatePropagation()
        e.preventDefault()
        if (!isResizing) return

        const newWidth = currentWidth + (e.clientX - prevX)
        const newHeight = currentHeight + (e.clientY - prevY)

        // Prevent the element from becoming too small
        if (newWidth >= 100 && newHeight >= 100) {
          const scaleW = newWidth / originalWidth
          const scaleH = newHeight / originalHeight
          this.options.scale = Math.min(scaleW, scaleH, 1)
          gridElement.style.transform = `scale(${this.options.scale})`
          gridElement.style.marginBottom = `${(this.options.scale - 1) * 719}px`
          gridElement.style.marginRight = `${(this.options.scale - 1) * 1238}px`
        }
      }

      const stopResizing = () => {
        isResizing = false
        document.removeEventListener("mousemove", resizeGrid)
        document.removeEventListener("mouseup", stopResizing)
      }
      document.addEventListener("mousemove", resizeGrid)
      document.addEventListener("mouseup", stopResizing)
    })
  }

  click(event) {
    if (this.dragging) {
      // ignore click if happens after dragging
      this.dragging = false
      return
    }
    // Find the element that was clicked by walking the DOM.
    const elementDOM = event.target.closest("div.grid-item.outer,li.item")
    if (elementDOM) {
      this.selectedWarning = null
      this.selectedExternalValue = null
      let element =
        this.value.elements[
          countPreviousSiblings(
            event.target.closest("div.grid-item.outer.main,li.item.main"),
          )
        ]
      if (elementDOM.matches("div.grid-item.outer.sub")) {
        element =
          element.sub_elements[
            countPreviousSiblings(elementDOM) - 1 // -1 to subtract main item
          ]
      } else if (elementDOM.matches("li.item.sub")) {
        element = element.sub_elements[countPreviousSiblings(elementDOM)]
      }
      if (this.selectedElement === element) {
        this.selectedElement = null
      } else {
        this.selectedElement = element
      }
      this.render()
    } else if (event.target.closest("button.show-content")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showContent = !this.options.showContent
      this.render()
    } else if (event.target.closest("button.show-elements-list")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showElementsList = !this.options.showElementsList
      this.render()
    } else if (event.target.closest("button.show-warnings-list")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showWarningsList = !this.options.showWarningsList
      this.render()
    } else if (event.target.closest("button.show-external-values-list")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.options.showExternalValuesList = !this.options.showExternalValuesList
      this.render()
    } else if (event.target.closest("button.download-json")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.downloadJSON()
    } else if (event.target.closest("button.upload-json")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      this.uploadJSON()
    } else if (event.target.closest("div.selected-element-properties")) {
      if (event.target.closest("button.option-sort-up")) {
        event.preventDefault()
        const position = countPreviousSiblings(
          event.target.closest("div.option-form-wrapper"),
        )
        const options = this.selectedElement.content.options
        if (!position) {
          return // first item. ignore
        }
        const temp = options[position]
        options[position] = options[position - 1]
        options[position - 1] = temp
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-sort-down")) {
        event.preventDefault()
        const position = countPreviousSiblings(
          event.target.closest("div.option-form-wrapper"),
        )
        const options = this.selectedElement.content.options
        if (position === options.length - 1) {
          return // last position
        }
        const temp = options[position]
        options[position] = options[position + 1]
        options[position + 1] = temp
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-delete")) {
        event.preventDefault()
        const position = countPreviousSiblings(
          event.target.closest("div.option-form-wrapper"),
        )
        const options = this.selectedElement.content.options
        options.splice(position, 1)
        while (options.length < 2) {
          // There always have to be at least two
          options.push({ text: "", db_value: "" })
        }
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.condition-delete")) {
        event.preventDefault()
        const position = countPreviousSiblings(
          event.target.closest("div.condition-form-wrapper"),
        )
        this.selectedElement.conditions.splice(position, 1)
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-db_value-add")) {
        event.preventDefault()
        this.selectedElement.content.options.push({ text: "", db_value: "" })
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.option-column-add")) {
        event.preventDefault()
        this.selectedElement.content.options.push({ text: "", column: "" })
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.condition-add")) {
        event.preventDefault()
        this.selectedElement.conditions.push({
          code: "",
          variables: [],
        })
        this.options.onChange()
        this.render()
      } else if (event.target.closest("button.delete-selected-element")) {
        event.preventDefault()
        this.value.elements = this.value.elements.filter(
          (element) => element !== this.selectedElement,
        )
        this.value.elements.forEach((element) => {
          element.sub_elements = element.sub_elements.filter(
            (element) => element !== this.selectedElement,
          )
        })
        this.selectedElement = null
        this.options.onChange()
        this.render()
      } else if (event.target.closest("input.checkboxinput")) {
        const property = event.target.getAttribute("name")
        this.selectedElement.content[property] = event.target.checked
        this.options.onChange()
        this.render()
      }
    } else if (event.target.closest("button.add-warning")) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.options.showWarningsList = true
      this.selectedWarning = { text: "", test: "", variables: [] }
      this.value.warnings.push(this.selectedWarning)
      this.selectedElement = null
      this.selectedExternalValue = null
      this.render()
    } else if (event.target.closest("ul.warnings li")) {
      event.preventDefault()
      const position = countPreviousSiblings(
        event.target.closest("ul.warnings li"),
      )
      this.selectedWarning = this.value.warnings[position]
      this.selectedElement = null
      this.selectedExternalValue = null
      this.render()
    } else if (event.target.closest("button.delete-selected-warning")) {
      event.preventDefault()
      this.value.warnings = this.value.warnings.filter(
        (element) => element !== this.selectedWarning,
      )
      this.selectedWarning = null
      this.options.onChange()
      this.render()
    } else if (event.target.closest("button.add-external-value")) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.options.showExternalValuesList = true
      this.selectedExternalValue = {
        type: "column",
      }
      this.value.external_values.push(this.selectedExternalValue)
      this.selectedElement = null
      this.selectedWarning = null
      this.render()
    } else if (event.target.closest("ul.external-values li")) {
      event.preventDefault()
      const position = countPreviousSiblings(
        event.target.closest("ul.external-values li"),
      )
      this.selectedExternalValue = this.value.external_values[position]
      this.selectedElement = null
      this.selectedWarning = null
      this.render()
    } else if (event.target.closest("button.delete-selected-external-value")) {
      event.preventDefault()
      this.value.external_values = this.value.external_values.filter(
        (element) => element !== this.selectedExternalValue,
      )
      this.selectedExternalValue = null
      this.options.onChange()
      this.render()
    }
  }

  change(event) {
    if (event.target.closest("div.selected-element-properties")) {
      const contentObject = this.selectedElement.content
      const name = event.target.name
      if (!name) {
        return
      }
      if (name === "option-text") {
        const position = countPreviousSiblings(
          event.target.closest("div.option-form-wrapper"),
        )
        contentObject.options[position].text = event.target.value
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "option-db_value") {
        const position = countPreviousSiblings(
          event.target.closest("div.option-form-wrapper"),
        )
        contentObject.options[position].db_value = event.target.value
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "option-column") {
        const position = countPreviousSiblings(
          event.target.closest("div.option-form-wrapper"),
        )
        contentObject.options[position].column = parseInt(event.target.value)
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "condition-code") {
        const position = countPreviousSiblings(
          event.target.closest("div.condition-form-wrapper"),
        )
        const condition = this.selectedElement.conditions[position]
        condition.code = event.target.value
        condition.variables = findCodeVariables(event.target.value)
        this.options.onChange()
        this.render()
      } else if (
        [
          "caption",
          "input_type",
          "placement",
          "options_orientation",
          "placeholder",
          "default_value",
          "text",
          "column",
          "property",
          "tag",
        ].includes(name)
      ) {
        contentObject[name] = event.target.value
        this.options.onChange()
        this.renderGridContent()
      } else if (["width", "tabindex"].includes(name)) {
        contentObject[name] = parseInt(event.target.value)
        this.options.onChange()
        this.renderGridContent()
      } else if (
        [
          "hide_text",
          "background",
          "border_left",
          "border_right",
          "border_top",
          "border_bottom",
        ].includes(name)
      ) {
        contentObject[name] = event.target.checked
        this.options.onChange()
        this.renderGridContent()
      } else if (
        [
          "outer_coordinates-x",
          "outer_coordinates-y",
          "outer_coordinates-width",
          "outer_coordinates-height",
        ].includes(name)
      ) {
        this.selectedElement.outer_coordinates[name.split("-")[1]] = parseInt(
          event.target.value,
        )
        this.options.onChange()
        this.renderGridContent()
      } else if (
        [
          "inner_coordinates-x",
          "inner_coordinates-y",
          "inner_coordinates-width",
          "inner_coordinates-height",
        ].includes(name)
      ) {
        this.selectedElement.inner_coordinates[name.split("-")[1]] = parseInt(
          event.target.value,
        )
        this.options.onChange()
        this.renderGridContent()
      } else if (name === "label") {
        this.selectedElement.label = event.target.value
      } else if (name === "source") {
        contentObject.source = event.target.value
        contentObject.variables = findCodeVariables(event.target.value)
        this.options.onChange()
        this.render()
      } else if (name === "html") {
        contentObject.html = event.target.value.replaceAll("/", "\\/")
        this.options.onChange()
        this.renderGridContent()
      }
    } else if (event.target.closest("div.selected-warning-properties")) {
      const name = event.target.name
      if (!name) {
        return
      }
      if (name === "test") {
        this.selectedWarning.test = event.target.value
        this.selectedWarning.variables = findCodeVariables(event.target.value)
      } else if (name === "text") {
        this.selectedWarning.text = event.target.value
      }
      this.options.onChange()
      this.render()
    } else if (event.target.closest("div.selected-external-value-properties")) {
      const name = event.target.name
      if (!name) {
        return
      }
      if (name === "value-dataset") {
        this.selectedExternalValue.dataset = event.target.value
      } else if (name === "value-column") {
        this.selectedExternalValue.column = event.target.value
      } else if (name === "value-property") {
        this.selectedExternalValue.property = event.target.value
      } else if (name === "value-type") {
        this.selectedExternalValue.type = event.target.value
        delete this.selectedExternalValue.dataset
        delete this.selectedExternalValue.column
        delete this.selectedExternalValue.property
        delete this.selectedExternalValue.code
      } else if (name === "value-code") {
        this.selectedExternalValue.code = event.target.value
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase()
      }
      this.options.onChange()
      this.render()
    }
  }

  set(value) {
    this.value = value
    this.selectedElement = null
    this.selectedWarning = null
    this.selectedExternalValue = null
    if (!this.value.elements) {
      this.value.elements = []
    }
    if (!this.value.warnings) {
      this.value.warnings = []
    }
    if (!this.value.external_values) {
      this.value.external_values = []
    }
    this.render()
  }

  render() {
    const newContainer = document.createElement("div")
    newContainer.id = this.container.id
    newContainer.style = this.container.style
    newContainer.innerHTML = editFormTemplate(
      this.value,
      Object.assign(
        {
          selectedElement: this.selectedElement,
          selectedWarning: this.selectedWarning,
          selectedExternalValue: this.selectedExternalValue,
          hasDataSchema: this.hasDataSchema,
        },
        this.options,
      ),
    )
    const diff = this.dd.diff(this.container, newContainer)
    this.dd.apply(this.container, diff)
    new ContextMenu(
      this.container.querySelector("button.add-element"),
      menuItems(this),
      {
        openEvent: "onclick",
      },
    )
    if (!this.value.elements.length) {
      return
    }
    this.setupHandleBar()
    this.setupDragAndDrop()
  }

  renderGridContent() {
    this.container.querySelector("div.grid-content").innerHTML = gridTemplate(
      this.value,
      Object.assign({ selectedElement: this.selectedElement }, this.options),
    )
  }

  get() {
    return this.value
  }

  addElement(type) {
    const container =
      this.selectedElement && this.selectedElement.sub_elements
        ? this.selectedElement.sub_elements
        : this.value.elements
    container.push({
      label: "",
      outer_coordinates: {
        y: 1,
        height: 10,
        x: 1,
        width: 20,
      },
      inner_coordinates: {
        y: 1,
        height: 10,
        x: 1,
        width: 20,
      },
      content: Object.assign(
        {
          type: type,
          tabindex: 0,
          width: 0,
        },
        DEFAULT_CONTENT[type],
      ),
      sub_elements: [],
      background: true,
      border: null,
      conditions: [],
    })
  }

  downloadJSON() {
    const jsonData = JSON.stringify(this.get())
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = this.options.dataset_name
      ? `${this.options.dataset_name}.form.json`
      : "form.json"
    a.style.display = "none"

    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  uploadJSON() {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".json"
    document.body.appendChild(fileInput)

    fileInput.onchange = (_event) => {
      const file = fileInput.files[0]

      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result
          this.set(JSON.parse(content))
          document.body.removeChild(fileInput)
          this.options.onChange()
        }
        reader.readAsText(file)
      } else {
        alert("Please select a JSON file to upload.")
        document.body.removeChild(fileInput)
      }
    }

    fileInput.click()
  }
}
