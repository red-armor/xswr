import ResumablePromise from "./ResumablePromise"

export default class PromiseSubscriber {
  constructor({fetcher, scope}) {
    this.promise = new ResumablePromise()
    this.fetcher = fetcher
    this.scope = scope
    this.remover = null

    this.fetcher.handlePromise(this)
  }

  resolve(result) {
    if (!this.scope.assertResultEqual(result)) {
      this.scope.usedData = result
      this.promise.resolve(result)
    }
  }

  reject(err) {
    this.promise.reject(err)

    // if (!this.scope.assertErrorEqual(err)) {
    //   this.promise.resolve(1)
    // }
  }

  teardown() {
    if (typeof this.remover === "function") {
      this.remover()
    }
    this.remover = null
  }
}
