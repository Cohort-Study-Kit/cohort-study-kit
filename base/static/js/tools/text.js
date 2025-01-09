// From https://github.com/fiduswriter/fiduswriter/blob/main/fiduswriter/base/static/js/modules/common/basic.js

export const escapeText = function (text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
