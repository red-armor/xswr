import {thenDescriptor, catchDescriptor, finallyDescriptor} from "./commons"
import createPromise from "./createPromise"

export default class PromiseSubscriber {
  constructor({config, fetcher}) {
    this.rejecter = () => {}
    this.resolver = () => {}
    this.promise = Promise.resolve()

    this.fetcher = fetcher

    Object.defineProperty(this.promise, "then", {
      ...thenDescriptor,
      value: function(_onFulfilled, _onRejected) {
        this.onFulfilled = _onFulfilled
        this.onReject = _onRejected
        this.fetcher.promise.then(this.onFulfilled, this.onReject)
      }.bind(this)
    })

    Object.defineProperty(this.promise, "catch", {
      ...catchDescriptor,
      value: function(_onCatch) {
        this.onCatch = _onCatch
        this.fetcher.promise.catch(this.onCatch)
      }.bind(this)
    })

    Object.defineProperty(this.promise, "finally", {
      ...finallyDescriptor,
      value: function(_onFinally) {
        this.onFinally = _onFinally
        this.fetcher.promise.finally(this.onFinally)
      }.bind(this)
    })

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
