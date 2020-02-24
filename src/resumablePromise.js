import {createHiddenProperty} from "./commons"
export default function resumablePromise() {
  const promise = {}
  createHiddenProperty(promise, "hooks", {
    onFulfilled: source => (promise.source = source),
    onReject: error => (promise.error = error)
  })
  createHiddenProperty(promise, "chainPromises", [])
  createHiddenProperty(promise, "source", null)
  createHiddenProperty(promise, "result", null)
  createHiddenProperty(promise, "error", null)

  Object.defineProperty(promise, "then", {
    value: function(_onFulfilled, _onRejected) {
      const chainPromise = resumablePromise()

      createHiddenProperty(chainPromise, "_parent_", promise)
      promise.chainPromises.push(chainPromise)

      this.hooks.onFulfilled = source => {
        promise.source = source
        promise.result = _onFulfilled(source)
        const chainPromises = promise.chainPromises

        if (promise.result && typeof promise.result.then === "function") {
          result.then(
            result => {
              chainPromises.forEach(chainPromise => {
                chainPromise.hooks.onFulfilled(result)
              })
            },
            err => {
              chainPromises.forEach(chainPromise =>
                chainPromise.hooks.onReject(result)
              )
            }
          )
        } else {
          chainPromises.forEach(chainPromise => {
            chainPromise.hooks.onFulfilled(promise.result)
          })
        }
      }

      this.hooks.onReject = error => {
        const errorResult = _onRejected(error)
        if (errorResult) {
          chainPromises.forEach(chainPromise =>
            chainPromise.hooks.onFulfilled(errorResult)
          )
        } else {
          chainPromises.forEach(chainPromise =>
            chainPromise.hooks.onReject(error)
          )
        }
      }
      console.log("pormise ", promise)

      const parent = promise._parent_
      console.log("parent ", parent)

      // 一般是直接对顶层调用了`onFulfilled`方法
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

  return promise
}
