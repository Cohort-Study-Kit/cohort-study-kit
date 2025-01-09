function ifCheckbox() {
  const checkBox = document.getElementById("dead")
  const date = document.getElementById("showDeathdate")
  const field = document.getElementById("deathdate")
  if (checkBox.checked == true) {
    date.style.display = "flex"
    field.required = "true"
  } else {
    date.style.display = "none"
    field.required = ""
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#dead").addEventListener("click", () => ifCheckbox())
})
