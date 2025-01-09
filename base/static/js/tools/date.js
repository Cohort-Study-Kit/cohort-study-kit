export function renderDate(dateString) {
  // We are here translating date strings in ISO 8601 (2022-07-13)
  // into preferred Danish format (13-07-2022).
  if (!dateString.length) {
    return ""
  }
  return `${dateString.slice(8, 10)}‑${dateString.slice(
    5,
    7,
  )}‑${dateString.slice(0, 4)}`
}

export function parseDate(dateString = "", format = null) {
  if (
    format === "Y-m-d" ||
    (format === null &&
      parseInt(dateString.slice(0, 4)) < 2100 &&
      parseInt(dateString.slice(5, 7)) < 13 &&
      parseInt(dateString.slice(8, 10)) < 32)
  ) {
    return new Date(
      `${dateString.slice(0, 4)}-${dateString.slice(5, 7)}-${dateString.slice(
        8,
        10,
      )}`,
    )
  } else if (dateString.length < 4) {
    // The dateString is too short. We'll use an obviously incorrect date.
    return undefined
  } else {
    // format is dd-mm-YYYY or d-m-YY or similar.

    // We will look for a non-numeric character at index 1.
    // Else we will assume the first two characters are the day.
    const daySplitIndex = /[0-9]/.test(dateString[1]) ? 2 : 1
    const day = parseInt(
      dateString.substr(0, daySplitIndex).replace(/[^\d]/g, "") || 1,
    )
    dateString = dateString.slice(daySplitIndex).replace(/^[^\d]/g, "")
    if (dateString.length < 3 || day < 1 || day > 31) {
      // The dateStringing is too short or day is incorrect. We'll use an obviously incorrect date.
      return undefined
    }

    // We will look for a non-numeric character at index 1.
    // Else we will assume that the first two characters are the month.
    const monthSplitIndex = /[0-9]/.test(dateString[1]) ? 2 : 1
    const month = parseInt(
      dateString.substr(0, monthSplitIndex).replace(/[^\d]/g, "") || 1,
    )
    let year = parseInt(dateString.slice(monthSplitIndex).replace(/[^\d]/g, ""))
    if (year < 100) {
      const currentYear = new Date().getFullYear() - 2000
      if (year < currentYear + 2) {
        year += 2000
      } else {
        year += 1900
      }
    }
    if (year < 1900 || year > 2100 || month < 1 || month > 12) {
      // The dateString is too short or month/year is incorrect. We'll use an obviously incorrect date.
      return undefined
    }
    const returnDate = new Date(`${year}-${month}-${day}`)
    if (
      returnDate.getFullYear() === year &&
      returnDate.getMonth() + 1 === month &&
      returnDate.getDate() === day
    ) {
      return returnDate
    } else {
      // Something about the date wasn't right
      return undefined
    }
  }
}
