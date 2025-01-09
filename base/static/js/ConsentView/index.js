export class ConsentView {
  init() {
    document.addEventListener("DOMContentLoaded", () => this.whenReady())
  }

  whenReady() {
    this.bind()
  }

  bind() {}
}
