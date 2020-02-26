import {createHiddenProperty, createHiddenProperties} from "./commons"
const hasSymbol = typeof Symbol !== "undefined" && Symbol.for
const STATE = hasSymbol
  ? Symbol.for("__resumable_promise_")
  : "__resumable_promise_"

const PENDING = 0
const FULFILLED = 1
const REJECTED = 2

const ResumablePromise = {}
const proto = ResumablePromise.prototype

createHiddenProperty(promise, STATE, {
  state: PENDING,

  receive: null,
  result: null,
  reason: null,

  onFulfilled: null,

  onRejected: null,

  chainPromises: []
})

function resolve(promise, value) {
  if (typeof value !== "object" && value.then) {
    value.then(
      result => resolve(promise, result),
      reject => resolve(promise, reject)
    )
  } else {
    promise[STATE].state = FULFILLED
    promise[STATE].result = value
    const chainPromises = promise[STATE].chainPromises
    chainPromises.forEach(chainPromise => {
      perform(promise, chainPromise)
    })
  }
}

function reject(promise, reason) {
  promise[STATE].state = REJECTED
  promise[STATE].reason = reason

  chainPromises.forEach(chainPromise => {
    perform(promise, chainPromise)
  })
}

function perform(promise, sub) {
  try {
    let value
    if (promise[STATE].state === FULFILLED) {
      value = sub[STATE].onFulfilled(promise[STATE].result)
    }

    if (promise[STATE].state === REJECTED) {
      value = sub[STATE].onRejected(promise[STATE].reason)
    }
    resolve(sub, value)
  } catch (err) {
    reject(sub, err)
  }
}

proto.then = function(_onFulfilled, _onRejected) {
  const promise = this
  const chainPromise = new ResumablePromise()
  chainPromise[STATE].onFulfilled = _onFulfilled
  chainPromise[STATE].onRejected = _onRejected
  promise[STATE].chainPromises.push(chainPromise)

  perform(promise, chainPromise)

  return chainPromise
}

// catch will return a Promise as well
proto.catch = function _catch(_onRejected) {
  const promise = this
  const chainPromise = new ResumablePromise()
  chainPromise[STATE].onFulfilled = null
  chainPromise[STATE].onRejected = _onRejected

  promise[STATE].chainPromises.push(chainPromise)
  return chainPromise
}

proto.finally = function _finally(onFinally) {
  const promise = this
  const chainPromise = new ResumablePromise()
  promise[STATE].chainPromises.push(chainPromise)
  chainPromise[STATE].onFulfilled = function(result) {
    onFinally()
    return chainPromise.resolve(result)
  }
  chainPromise[STATE].onRejected = function(reason) {
    onFinally()
    return chainPromise.reject(reason)
  }
  return chainPromise
}

proto.resolve = function(result) {
  const promise = this
  resolve(promise, result)
}

proto.reject = function(reason) {
  const promise = this
  reject(promise, reason)
}
