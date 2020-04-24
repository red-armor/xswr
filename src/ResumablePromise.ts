// Basically, Promise A+ compliant.
import {
  createHiddenProperty,
  createHiddenProperties,
  RESUMABLE_PROMISE
} from "./commons"

const PENDING = 0
const FULFILLED = 1
const REJECTED = 2
let count = 0

interface IResumablePromise {
  [RESUMABLE_PROMISE]: any
  // [Key in string | number | symbol]: string;
}

// type SymbolMap = {
//   [Key in string | number | symbol]: string;
// }

const ResumablePromise = (function() {
  const state = {}
  createHiddenProperties(state, {
    id: count++,
    state: PENDING,
    result: null,
    reason: null,
    onFulfilled: null,
    onRejected: null,
    chainPromises: []
  })
  createHiddenProperty(this, RESUMABLE_PROMISE, state)
} as any) as {new (): IResumablePromise}

export default ResumablePromise

const proto = ResumablePromise.prototype

function perform(promise: IResumablePromise, sub: IResumablePromise) {
  if (promise[RESUMABLE_PROMISE].state === PENDING) return

  try {
    let value
    if (promise[RESUMABLE_PROMISE].state === FULFILLED) {
      value = sub[RESUMABLE_PROMISE].onFulfilled(
        promise[RESUMABLE_PROMISE].result
      )
    }

    if (promise[RESUMABLE_PROMISE].state === REJECTED) {
      value = sub[RESUMABLE_PROMISE].onRejected(
        promise[RESUMABLE_PROMISE].reason
      )
    }
    resolve(sub, value)
  } catch (err) {
    reject(sub, err)
  }
}

function reject(promise: IResumablePromise, reason) {
  promise[RESUMABLE_PROMISE].state = REJECTED
  promise[RESUMABLE_PROMISE].reason = reason
  const {chainPromises} = promise[RESUMABLE_PROMISE]
  chainPromises.forEach((chainPromise: IResumablePromise) => {
    perform(promise, chainPromise)
  })
}

function resolve(promise: IResumablePromise, value) {
  if (typeof value === "object" && value.then) {
    value.then(
      result => resolve(promise, result),
      reason => reject(promise, reason)
    )
  } else {
    promise[RESUMABLE_PROMISE].state = FULFILLED
    promise[RESUMABLE_PROMISE].result = value
    const {chainPromises} = promise[RESUMABLE_PROMISE]
    chainPromises.forEach(chainPromise => {
      perform(promise, chainPromise)
    })
  }
}

proto.then = function _then(_onFulfilled, _onRejected) {
  const promise = this
  const chainPromise = new ResumablePromise()
  chainPromise[RESUMABLE_PROMISE].onFulfilled =
    _onFulfilled ||
    function(result) {
      promise.resolve(result)
    }
  chainPromise[RESUMABLE_PROMISE].onRejected =
    _onRejected ||
    function(reason) {
      promise.reject(reason)
    }
  promise[RESUMABLE_PROMISE].chainPromises.push(chainPromise)

  perform(promise, chainPromise)

  return chainPromise
}

// catch will return a Promise as well
proto.catch = function _catch(_onRejected) {
  const promise = this
  const chainPromise = new ResumablePromise()
  chainPromise[RESUMABLE_PROMISE].onFulfilled = null
  chainPromise[RESUMABLE_PROMISE].onRejected = _onRejected

  promise[RESUMABLE_PROMISE].chainPromises.push(chainPromise)
  return chainPromise
}

proto.finally = function _finally(onFinally) {
  const promise = this
  const chainPromise = new ResumablePromise()
  promise[RESUMABLE_PROMISE].chainPromises.push(chainPromise)

  chainPromise[RESUMABLE_PROMISE].onFulfilled = function(result) {
    onFinally()
    return chainPromise.resolve(result)
  }
  chainPromise[RESUMABLE_PROMISE].onRejected = function(reason) {
    onFinally()
    return chainPromise.reject(reason)
  }
  return chainPromise
}

proto.resolve = function _resolve(result) {
  const promise = this
  resolve(promise, result)
}

proto.reject = function _reject(reason) {
  const promise = this
  reject(promise, reason)
}
