import equal from "deep-equal"
import store from "./store"
import {buildKey} from "./resolveArgs"
import {USE_XSWR} from "./commons"

let count = 0
export default class ComponentSubscriber {
  constructor({
    updater,
    scope,
    fetch,
    fetchArgs,
    deps,
    onError,
    onSuccess,
    shouldComponentUpdateAfterStateChange
  }) {
    this.id = `component_subscriber_${count++}`
    this.deps = []
    this.updater = updater
    this.remover = []
    this.immediately = true
    this.children = []
    this.scope = scope
    this.scope.bind(this)
    this.dataRef = null

    this.fetch = fetch
    this.fetchArgs = fetchArgs

    this.onError = onError
    this.onSuccess = onSuccess
    this.shouldComponentUpdateAfterStateChange = shouldComponentUpdateAfterStateChange

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

    return this.fetcher.getData(this)
  }

  teardown() {
    if (typeof this.remover === "function") {
      this.remover()
    }
    this.remover = null
  }

  shouldComponentUpdate() {
    return this.shouldComponentUpdateAfterStateChange
  }

  handleUpdate(newData) {
    if (!equal(this.dataRef, newData)) {
      this.dataRef = newData
      this.children.forEach(child => {
        child.attemptToFetch()
      })
      if (this.shouldComponentUpdate()) {
        this.updater()
      }

      if (typeof this.onSuccess === "function") {
        this.onSuccess(newData)
      }
    }
  }

  handleError(err) {
    if (this.scope.assertContinueRetry()) {
      this.scope.attemptToRetry()
    } else {
      if (this.shouldComponentUpdate()) {
        this.updater()
      }

      if (typeof this.onError === "function") {
        this.onError(err)
      }
    }
  }

  attemptToFetch() {
    if (!this.fetcher) {
      const key = this.generateKey()
      if (!key) return
      this.fetcher = store.getFetcher({
        key,
        fetchArgs: this.fetchArgs,
        fetch: this.fetch
      })
      this.fetcher.revalidate(this)
    }
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

  revalidate() {
    this.fetcher.revalidate(this)
  }
}
