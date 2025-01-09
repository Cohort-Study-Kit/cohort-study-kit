(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

/************************************************************************/
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = function(exports) {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};

})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = function () {
	return "1.0.5";
};

})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.0.5";

})();
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
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

})()
;
//# sourceMappingURL=RelativeView.js.map