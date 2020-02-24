export default function createPromise() {
  const promise = {}

  Object.defineProperty(promise, "hooks", {
    value: {}
  })
  Object.defineProperty(promise, "chainPromise", {
    value: null,
    writable: true,
    enumerable: false,
    configurable: false
  })

  Object.defineProperty(promise, "then", {
    value: function(_onFulfilled, _onRejected) {
      const chainPromise = createPromise()

      Object.defineProperty(chainPromise, "parent", {value: this})
      this.chainPromise = chainPromise
      this.hooks.onFulfilled = _result => {
        const result = _onFulfilled(_result)
        if (result && typeof result.then === "function") {
          result.then(
            result => {
              if (chainPromise.hooks.onFulfilled) {
                chainPromise.hooks.onFulfilled(result)
              }
            },
            err => {
              if (chainPromise.hooks.onReject) {
                chainPromise.hooks.onReject(err)
              }
            }
          )
        } else {
          console.log("xxx")
          if (chainPromise.hooks.onFulfilled) {
            console.log("result before call --", result)
            chainPromise.hooks.onFulfilled(result)
          }
        }
      }

      console.log("this. parent ", this.parent)
      if (!this.parent) {
        Promise.resolve().then(() => {
          this.hooks.onFulfilled("testing-----")
        })
      }

      this.hooks.onReject = error => {
        _onRejected(error)
      }

      return this.chainPromise
    }.bind(promise)
  })

  return promise
}
