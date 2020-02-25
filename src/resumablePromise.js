import {createHiddenProperty} from "./commons"
export default function resumablePromise() {
  const promise = {}
  createHiddenProperty(promise, "hooks", {
    onFulfilled: source => (promise.source = source),

    onResolve: null,

    // has default function value...
    onReject: error => (promise.error = error),

    // should be null on default...
    catcher: null,

    // should be null on default...
    finish: null
  })
  createHiddenProperty(promise, "chainPromises", [])
  createHiddenProperty(promise, "source", null)
  createHiddenProperty(promise, "result", null)
  createHiddenProperty(promise, "error", null)

  function performError(reason) {
    const chainPromises = promise.chainPromises
    chainPromises.forEach(promise => {
      const {catcher, finish, onReject} = promise.hooks
      if (catcher) catcher(reason)
      if (finish) finish()
      onReject(reason)
    })
  }

  function performSuccess(result) {
    const chainPromises = promise.chainPromises
    chainPromises.forEach(chainPromise => {
      const {catcher, finish, onReject, onResolve} = promise.hooks
      if (onResolve) onResolve(result)
      if (finish) finish()
    })
  }

  function perform(result, fn) {
    try {
      const nextResult = fn(result)
      const chainPromises = promise.chainPromises

      if (nextResult && typeof promise.result.then === "function") {
        result.then(
          promiseResult => {
            promise.result = promiseResult
            performSuccess(promiseResult)
          },
          err => performError(reason)
        )
      } else {
        promise.result = nextResult
        performSuccess(nextResult)
      }
    } catch (reason) {
      performError(reason)
    }
  }

  Object.defineProperty(promise, "then", {
    value: function(_onFulfilled, _onRejected) {
      const chainPromise = resumablePromise()

      createHiddenProperty(chainPromise, "_parent_", promise)
      promise.chainPromises.push(chainPromise)

      this.hooks.onResolve = source => {
        promise.source = source
        perform(source, _onFulfilled)
      }

      this.hooks.onReject = reason => {
        perform(reason, _onRejected)
      }

      const parent = promise._parent_

      // Just like `Promise.resolve(1)` provide a value directly.
      // Promise.resolve(1).then do not have parent
      if (promise.source) {
        promise.hooks.onFulfilled(promise.source)
      }

      if (parent) {
        const {result, error} = parent
        promise.source = result
        promise.error = error

        if (result) {
          promise.hooks.onFulfilled(result)
        }
      }

      return chainPromise
    }
  })

  // catch will return a Promise as well
  Object.defineProperty(promise, "catch", {
    value: function _catch(onRejected) {
      const chainPromise = resumablePromise()

      createHiddenProperty(chainPromise, "_parent_", promise)
      promise.chainPromises.push(chainPromise)

      this.hooks.catcher = reason => perform(reason, onRejected)
      return chainPromise
    }
  })

  Object.defineProperty(promise, "finally", {
    value: function _finally(onFinally) {
      promise.hooks.finish = onFinally
    }
  })

  return promise
}
