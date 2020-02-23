export default class Base {
  constructor({update, fetcher}) {
    this.deps = []
    this.update = update
    this.removers = []
    this.immediately = true
    this.fetcher = fetcher
    this.parent = null
  }

  teardown() {
    this.removers.forEach(remove => remove())
    this.removers = []
  }

  addRemover(remove) {
    this.removers.push(remove)
  }

  triggerUpdate() {
    if (!this.immediately && this.deps.length) {
      this.deps.forEach(dep => dep.start())
    }

    this.update()
  }

  start() {
    this.fetcher.validate()
  }

  addDeps(subBase) {
    const index = this.deps.indexOf(subBase)
    if (index === -1) {
      this.deps.push(subBase)
      subBase.parent = this
    }
  }
}
