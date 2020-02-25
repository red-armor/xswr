import {createHiddenProperty, createHiddenProperties} from "./commons"
export default function resumablePromise() {
  const promise = {}
  createHiddenProperties(promise, "hooks", {
    // trigger start....
    onFulfilled: function(source) {
      const {chainPromises} = this
      this.source = source
      chainPromises.forEach(chainPromise =>
        chainPromise.hooks.onResolve(source)
      )
    }.bind(promise),

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

  function performError(promise, reason) {
    const chainPromises = promise.chainPromises
    chainPromises.forEach(chainPromise => {
      const {catcher, finish, onReject} = chainPromise.hooks
      if (catcher) catcher(reason)
      if (finish) finish()
      onReject(reason)
    })
  }

  function performSuccess(promise, result) {
    const chainPromises = promise.chainPromises

    chainPromises.forEach(chainPromise => {
      const {catcher, finish, onReject, onResolve} = chainPromise.hooks
      if (onResolve) {
        const value = onResolve(result)
      }
    })
  }

  function perform(promise, result, fn) {
    try {
      const nextResult = fn(result)
      if (promise.hooks.finish) {
        if (nextResult && typeof nextResult.then === "function") {
          nextResult.finally(() => promise.hooks.finish())
        } else {
          promise.hooks.finish()
        }
        return
      }

      if (nextResult && typeof nextResult.then === "function") {
        nextResult.then(
          promiseResult => {
            promise.result = promiseResult
            performSuccess(promise, promiseResult)
          },
          err => performError(promise, reason)
        )
      } else {
        promise.result = nextResult
        performSuccess(promise, nextResult)
      }
    } catch (reason) {
      performError(promise, reason)
    }
  }

  Object.defineProperty(promise, "then", {
    value: function(_onFulfilled, _onRejected) {
      const chainPromise = resumablePromise()

      createHiddenProperty(chainPromise, "_parent_", promise)
      promise.chainPromises.push(chainPromise)

      chainPromise.hooks.onResolve = source => {
        promise.source = source
        perform(chainPromise, source, _onFulfilled)
      }

      chainPromise.hooks.onReject = reason => {
        perform(chainPromise, reason, _onRejected)
      }

      // Just like `Promise.resolve(1)` provide a value directly.
      // Promise.resolve(1).then do not have parent
      if (promise.source) {
        chainPromise.hooks.onResolve(promise.source)
      }

      if (promise.result) {
        chainPromise.hooks.onResolve(promise.result)
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
      onFinally()
      promise.hooks.finish = onFinally
    }
  })

  return promise
}
