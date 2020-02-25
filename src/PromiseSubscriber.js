import {thenDescriptor, catchDescriptor, finallyDescriptor} from "./commons"
import resumablePromise from "./resumablePromise"

export default class PromiseSubscriber {
  constructor({config, fetcher}) {
    this.promise = resumablePromise()
    this.fetcher = fetcher

    console.log("fetcher promise ", this.fetcher.promise)

    this.fetcher.promise.then(
      result => {
        this.promise.hooks.onFulfilled(result)
      },
      error => {
        this.promise.hooks.onReject(error)
      }
    )

    this.retryTimeoutHandler = null
    this.poolTimeoutHandler = null
    this.config = config
  }

  resolve(data) {
    this.resolver(resolve)

    if (this.poolInterval) {
      this.poolTimeoutHandler = setTimeout(() => {
        this.fetcher.validate()
      }, this.poolInterval)
    }
  }

  reject(err) {
    this.rejecter(err)
  }

  teardown() {}
}
