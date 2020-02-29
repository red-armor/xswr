import equal from "deep-equal"
import store from "./store"

let count = 0

export default class ComponentSubscriber {
  constructor({updater, scope, fetch, fetchArgs}) {
    this.deps = []
    this.updater = updater
    this.removers = []
    this.immediately = true
    this.parents = []
    this.scope = scope

    this.dataRef = null
    this.id = `component_subscriber_${count++}`

    this.fetch = fetch
    this.fetchArgs = fetchArgs

    this.attemptToFetch()
  }

  generateKey() {
    let keyArgs = this.fetchArgs

    if (typeof keyArgs[0] === "function") {
      try {
        args = keyArgs[0].call(null)
        this.keyArgs = args
      } catch (err) {
        // do nothing..
      }
    }

    const key = JSON.stringify(keyArgs)

    if (typeof key === "string" || Array.isArray(key)) {
      this.fetcher = store.getFetcher({
        key,
        fetch: this.fetch,
        fetchArgs: this.fetchArgs
      })
    }
  }

  // If not has fetch, which means parents is not resolved, then return undefined.
  getData() {
    store.currentComponentSubscriber = this
    if (!this.fetcher) {
      if (this.parents.length) this.attemptToFetch()
      else throw new Error("Maybe you are using async method to get key")
      return
    }

    return this.fetcher.getData(this)
  }

  teardown() {
    this.removers.forEach(remove => remove())
    this.removers = []
  }

  addRemover(remove) {
    this.removers.push(remove)
  }

  handleUpdate(newData) {
    if (!this.immediately && this.deps.length) {
      this.deps.forEach(dep => dep.attemptToFetch())
    }

    if (!equal(this.dataRef, newData)) {
      this.dataRef = newData
      this.deps.forEach(dep => dep.attemptToFetch())
      this.updater()
    }
  }

  handleError(err) {}

  attemptToFetch() {
    if (this.fetcher) return
    const keyArgs = this.generateKey()
    if (!keyArgs) return // not ready
    this.fetcher = store.getFetcher({
      keyArgs,
      fetchArgs: this.fetchArgs,
      fetch: this.fetch
    })
  }

  addParent(parent) {
    const index = this.parents.indexOf(parent)
    if (index === -1) {
      this.parents.push(parent)
    }
  }

  addDeps(dep) {
    const index = this.deps.indexOf(dep)
    if (index === -1) {
      this.deps.push(dep)
      dep.addParent(this)
    }
  }
}
