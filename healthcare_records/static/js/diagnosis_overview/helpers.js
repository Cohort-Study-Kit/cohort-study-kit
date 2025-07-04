export const displayRecipient = (recipient) => {
  switch (recipient) {
    case "proband":
      return "Proband"
    case "mother":
      return "Mother of proband"
    default:
      return "Unknown"
  }
}

export const recipientOptions = ["Proband", "Mother of proband"]
