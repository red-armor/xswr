import equal from "deep-equal"

let count = 0

export default class ComponentSubscriber {
  constructor({update, scope, key, fetch, fetchArgs}) {
    this.deps = []
    this.update = update
    this.removers = []
    this.immediately = true
    this.parents = []
    this.scope = scope

    this.dataRef = null
    this.key = key
    this.id = `component_subscriber_${count++}`

    this.fetch = fetch
    this.fetchArgs = fetchArgs
  }

  generateKey() {
    let keyArgs = this.key

    if (typeof keyArgs === "function") {
      try {
        keyArgs = key.call(null)
      } catch (err) {
        // do nothing..
      }
    }

    if (typeof keyArgs === "string" || Array.isArray(keyArgs)) {
      const stateFetcher = store.getFetcher({keyArgs, fetchArgs, fetch})
      subscriberRef.current.bindFetcher(stateFetcher)
    }
  }

  // If not has fetch, which means parents is not resolved, then return undefined.
  getData() {
    store.currentComponentSubscriber = this
    if (!this.fetcher) {
      if (this.parents.length) this.attemptBeforeKeyReady()
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

  triggerUpdate(newData) {
    if (!this.immediately && this.deps.length) {
      this.deps.forEach(dep => dep.start())
    }

    if (!equal(this.dataRef, newData)) {
      this.dataRef = newData
      this.deps.forEach(dep => dep.start())
    }
  }

  attemptBeforeKeyReady() {
    if (this.fetcher) return
    const keyArgs = this.generateKey()
    if (!keyArgs) return // not ready
    this.fetcher = store.getFetcher({
      keyArgs,
      fetchArgs: this.fetchArgs,
      fetch: this.fetch
    })
  }

  addDeps(dep) {
    const index = this.deps.indexOf(dep)
    if (index === -1) {
      this.deps.push(dep)
      dep.parent = this
    }
  }
}
