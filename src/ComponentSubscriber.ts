// @ts-ignore
import equal from "deep-equal"
import store from "./store"
import {buildKey} from "./resolveArgs"
import {USE_XSWR} from "./commons"
import {
  IScope,
  PromiseLike,
  IComponentSubscriber,
  Fetcher,
  useResult
} from "./interface"

let count = 0
export default class ComponentSubscriber implements IComponentSubscriber {
  public id: string
  public deps: IComponentSubscriber[]
  public updater: () => void
  public remover: null | {(): void}
  public forceValidate: boolean
  public children: IComponentSubscriber[]
  public scope: IScope
  public dataRef: null | object

  public fetch: <T>() => PromiseLike<T>
  public fetcher: null | Fetcher
  public fetchArgs: any[]

  public shouldComponentUpdate: boolean
  public suppressUpdateIfEqual: boolean

  constructor({
    updater,
    scope,
    fetch,
    fetchArgs,
    deps,
    shouldComponentUpdate,
    suppressUpdateIfEqual
  }: {
    updater: () => void
    scope: IScope
    fetch: <T>() => PromiseLike<T>
    fetchArgs: any[]
    deps: useResult[]
    shouldComponentUpdate: boolean
    suppressUpdateIfEqual: boolean
  }) {
    this.id = `component_subscriber_${count++}`
    this.deps = []
    this.updater = updater
    this.remover = () => {}
    this.forceValidate = true
    this.children = []
    this.scope = scope
    this.scope.bind(this)
    this.dataRef = null

    this.fetch = fetch
    this.fetcher = null
    this.fetchArgs = fetchArgs

    this.shouldComponentUpdate = shouldComponentUpdate
    this.suppressUpdateIfEqual = suppressUpdateIfEqual

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

    return this.fetcher.getData(this) // eslint-disable-line
  }

  getError() {
    if (this.fetcher && this.fetcher.hasError) {
      if (this.scope.assertContinueRetry()) {
        return null
      }
      return this.fetcher.getProp("error")
    }

    return null
  }

  getIsValidating(): boolean {
    if (!this.fetcher) return false
    const shouldRevalidating =
      this.fetcher.getProp("hasError") && this.scope.assertContinueRetry()
    return this.fetcher.assertValidating() || shouldRevalidating
  }

  getIsPooling(): boolean {
    return this.scope.assertPooling()
  }

  clearPooling(): void {
    this.scope.poolingStrategy.destroy()
  }

  teardown() {
    if (typeof this.remover === "function") {
      this.remover()
    }
    this.remover = null
  }

  handleUpdate(newData: object | null) {
    if (!this.suppressUpdateIfEqual || !equal(this.dataRef, newData)) {
      this.dataRef = newData
      this.children.forEach(child => {
        child.attemptToFetch()
      })
      if (this.shouldComponentUpdate) {
        this.updater()
      }
    }

    this.scope.attemptToPooling()
  }

  handleError(err?: Error) {
    if (this.scope.assertContinueRetry()) {
      this.scope.attemptToRetry()
    } else {
      if (this.shouldComponentUpdate) {
        this.updater()
      }

      this.scope.attemptToPooling()
    }
  }

  attemptToFetch() {
    if (!this.fetcher) {
      const key = this.generateKey()
      if (!key) return
      this.scope.setCacheKey(key)
      this.fetcher = store.getFetcher({
        key,
        fetchArgs: this.fetchArgs,
        fetch: this.fetch
      })
    }
    this.fetcher.attemptToValidate(this)
  }

  addChild(child: IComponentSubscriber): void {
    const index = this.children.indexOf(child)
    if (index === -1) {
      this.children.push(child)
    }
  }

  handleDeps(deps: useResult[]): void {
    deps.forEach(dep => this.addDeps(dep))
  }

  addDeps(dep: useResult): void {
    try {
      const state: IComponentSubscriber = dep[USE_XSWR]
      const index = this.deps.indexOf(state)
      if (index === -1) {
        this.deps.push(state)
        state.addChild(this)
      }
    } catch (err) {
      throw new Error(
        "You are only allowed to assign a `useXS` return value as dependence" +
          `please, check dep ${dep} again.`
      )
    }
  }

  forceRevalidate() {
    if (this.fetcher) this.fetcher.forceComponentRevalidate(this)
  }
}
