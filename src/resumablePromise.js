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
    onReject: null,

    // should be null on default...
    catcher: null,

    // should be null on default...
    finish: null
  })
  createHiddenProperty(promise, "chainPromises", [])
  createHiddenProperty(promise, "source", null)
  createHiddenProperty(promise, "result", undefined)
  createHiddenProperty(promise, "error", null)

  function performError(promise, reason) {
    const chainPromises = promise.chainPromises
    chainPromises.forEach(chainPromise => {
      const {catcher, finish, onReject} = chainPromise.hooks
      // 正常情况下有`catcher`的话，是不会有`onResolve`的
      if (catcher) {
        catcher(reason)
      }
      if (onReject) {
        onReject(reason)
      }
      if (finish) finish()
    })
  }

  function performSuccess(promise, result) {
    const chainPromises = promise.chainPromises
    chainPromises.forEach(chainPromise => {
      const {catcher, finish, onReject, onResolve} = chainPromise.hooks
      // 正常情况下有`catcher`的话，是不会有`onResolve`的
      if (onResolve) {
        onResolve(result)
      }

      // 如果成功的话，是不走catcher逻辑的
      if (catcher) {
        // catch 后面紧邻finally
        if (finish) finish()
        else {
          chainPromise.chainPromises.forEach(promise => {
            promise.hooks.onResolve(result)
          })
        }
      }
    })
  }

  function perform(promise, result, fn) {
    try {
      const nextResult = fn(result) || null
      // 如果说包含finally方法的话，说明它是没有deps的。
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
      promise.error = reason
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
        promise.error = reason
        perform(chainPromise, reason, _onRejected)
      }

      // Just like `Promise.resolve(1)` provide a value directly.
      // Promise.resolve(1).then do not have parent
      if (promise.source) {
        chainPromise.hooks.onResolve(promise.source)
      }

      if (promise.error) {
        chainPromise.hooks.onReject(promise.source)
      }

      if (!(promise.result && typeof promise.result.then === "function")) {
        if (typeof promise.result !== "undefined") {
          chainPromise.hooks.onResolve(promise.result)
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

      chainPromise.hooks.catcher = reason => {
        perform(chainPromise, reason, onRejected)
      }

      if (promise.error) {
        perform(chainPromise, promise.error, onRejected)
      } else {
        chainPromise.source = promise.result
      }

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
