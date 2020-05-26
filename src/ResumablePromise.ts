// Basically, Promise A+ compliant.
import {
  createHiddenProperty,
  createHiddenProperties,
  RESUMABLE_PROMISE
} from "./commons"

import {PromiseLike, IResumablePromise} from "./interface"

const PENDING = 0
const FULFILLED = 1
const REJECTED = 2
let count = 0

// interface IResumablePromise {
//   [RESUMABLE_PROMISE]: any
//   resolve: <T>(result: T | PromiseLike<T>) => void,
//   reject: <T>(reason?: any) => void,
//   // [Key in string | number | symbol]: string;
// }

// type SymbolMap = {
//   [Key in string | number | symbol]: string;
// }

const enum state {
  PENDING,
  FULFILLED,
  REJECTED
}

interface PromiseState {
  id: number
  state: state
  result: null
  reason: null
  onFulfilled: null
  onRejected: null
  chainPromises: []
}

const ResumablePromise = (function(this: IResumablePromise) {
  const state: PromiseState = {} as any
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

function reject(promise: IResumablePromise, reason: any) {
  promise[RESUMABLE_PROMISE].state = REJECTED
  promise[RESUMABLE_PROMISE].reason = reason
  const {chainPromises} = promise[RESUMABLE_PROMISE]
  chainPromises.forEach((chainPromise: IResumablePromise) => {
    perform(promise, chainPromise)
  })
}

function resolve<T>(
  promise: IResumablePromise,
  value?: T | PromiseLike<T>
): void {
  if (typeof value === "object" && (value as PromiseLike<T>).then) {
    ;(value as PromiseLike<T>).then(
      (result: T): void => resolve<T>(promise, result),
      reason => reject(promise, reason)
    )
  } else {
    promise[RESUMABLE_PROMISE].state = FULFILLED
    promise[RESUMABLE_PROMISE].result = value
    const {chainPromises} = promise[RESUMABLE_PROMISE]
    chainPromises.forEach((chainPromise: IResumablePromise) => {
      perform(promise, chainPromise)
    })
  }
}

proto.then = function _then<T>(
  _onFulfilled?: (value?: T | PromiseLike<T>) => void,
  _onRejected?: (reason?: any) => void
) {
  const promise = this
  const chainPromise = new ResumablePromise()
  chainPromise[RESUMABLE_PROMISE].onFulfilled =
    _onFulfilled ||
    function(result: T | PromiseLike<T>) {
      chainPromise.resolve(result)
    }
  chainPromise[RESUMABLE_PROMISE].onRejected =
    _onRejected ||
    function(reason?: any) {
      chainPromise.reject(reason)
    }
  promise[RESUMABLE_PROMISE].chainPromises.push(chainPromise)

  perform(promise, chainPromise)

  return chainPromise
}

// catch will return a Promise as well
proto.catch = function _catch<T>(
  _onRejected: (reason?: any) => never | PromiseLike<T>
) {
  const promise = this
  const chainPromise = new ResumablePromise()
  chainPromise[RESUMABLE_PROMISE].onFulfilled = null
  chainPromise[RESUMABLE_PROMISE].onRejected = _onRejected

  promise[RESUMABLE_PROMISE].chainPromises.push(chainPromise)
  return chainPromise
}

proto.finally = function _finally(onFinally: () => void) {
  const promise = this
  const chainPromise = new ResumablePromise()
  promise[RESUMABLE_PROMISE].chainPromises.push(chainPromise)

  chainPromise[RESUMABLE_PROMISE].onFulfilled = function<T>(
    result: T | PromiseLike<T>
  ) {
    onFinally()
    return chainPromise.resolve(result)
  }
  chainPromise[RESUMABLE_PROMISE].onRejected = function(reason?: any) {
    onFinally()
    return chainPromise.reject(reason)
  }
  return chainPromise
}

proto.resolve = function _resolve<T>(result: T | PromiseLike<T>) {
  const promise = this
  resolve(promise, result)
}

proto.reject = function _reject(reason?: any) {
  const promise = this
  reject(promise, reason)
}
