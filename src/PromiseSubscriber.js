import equal from "deep-equal"
import ResumablePromise from "./ResumablePromise"

let count = 0

export default class PromiseSubscriber {
  constructor({fetcher, scope, fetchArgs, cacheKey}) {
    this.id = `promise_subscriber_${count++}`
    this.fetcher = fetcher
    this.scope = scope
    this.scope.bind(this)
    this.remover = null
    this.promise = new ResumablePromise()
    this.dataRef = null
    this.fetchArgs = fetchArgs
    this.cacheKey = cacheKey

    this.fetcher.handlePromise(this)
  }

  resolve(newData) {
    if (!equal(this.dataRef, newData)) {
      this.dataRef = newData
      this.promise.resolve(newData)
      const {onPersistance} = this.scope
      if (typeof onPersistance === "function") {
        onPersistance.call(this, this.cacheKey, newData)
      }

      if (typeof this.onSuccess === "function") {
        this.onSuccess(newData)
      }
    }

    this.scope.attemptToPooling()
  }

  reject(err) {
    if (this.scope.assertContinueRetry()) {
      this.scope.attemptToRetry()
    } else {
      this.promise.reject(err)

      if (typeof this.onError === "function") {
        this.onError(err)
      }

      this.scope.attemptToPooling()
    }
  }

  validate() {
    this.fetcher.handlePromise(this)
  }

  teardown() {
    if (typeof this.remover === "function") {
      this.remover()
    }
    this.remover = null
  }

  forceRevalidate() {
    this.fetcher.forcePromiseRevalidate(this)
  }
}
