import equal from "deep-equal"
import store from "./store"
import {buildKey} from "./resolveArgs"
import {USE_XSWR} from "./commons"

let count = 0
export default class ComponentSubscriber {
  constructor({updater, scope, fetch, fetchArgs, deps}) {
    this.id = `component_subscriber_${count++}`
    this.deps = []
    this.updater = updater
    this.removers = []
    this.immediately = true
    this.children = []
    this.scope = scope
    this.dataRef = null

    this.fetch = fetch
    this.fetchArgs = fetchArgs

    this.handleDeps(deps)

    this.attemptToFetch()
  }

  generateKey() {
    let parts = []
    let key
    if (typeof this.fetchArgs[0] === "function") {
      try {
        parts = this.fetchArgs[0].call(null)
        this.fetchArgs = parts
      } catch (err) {
        console.log("err ", err)
        // do nothing..
      }
    } else {
      parts = this.fetchArgs
    }

    if (parts.length) {
      key = buildKey(parts[0], parts[1])
    }

    return key
  }

  // If not has fetch, which means deps is not resolved, then return undefined.
  getData() {
    if (!this.fetcher) {
      if (this.deps.length) this.attemptToFetch()
      else throw new Error("Maybe you are using async method to get key")
      return
    }

    return (this.dataRef = this.fetcher.getData(this))
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

  addChild(parent) {
    const index = this.children.indexOf(parent)
    if (index === -1) {
      this.children.push(parent)
    }
  }

  handleDeps(deps) {
    deps.forEach(dep => this.addDeps(dep))
  }

  addDeps(dep) {
    const state = dep[USE_XSWR]
    const index = this.deps.indexOf(state)
    if (index === -1) {
      this.deps.push(state)
      state.addChild(this)
    }
  }
}
