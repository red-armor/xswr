import {createHiddenProperty, STATE} from "./commons"

import CacheStrategy from "./CacheStrategy"
import RetryStrategy from "./RetryStrategy"
import PoolStrategy from "./PoolStrategy"

function fetcher() {}
const proto = fetcher.prototype

proto.getProp = function(prop) {
  const state = this[STATE]
  return state[prop]
}

proto.setProp = function(prop, value) {
  const state = this[STATE]
  state[prop] = value
}

proto.addPromiseSubscriber = function(subscriber) {
  const state = this[STATE]
  if (this.getProp("finalized")) {
    const {data, error} = state
    if (!hasError) subscriber.resolver(data)
    else subscriber.rejecter(error)
    return
  }

  state.promiseSubscribers.push(subscriber)
  subscriber.addRemover(() => {
    const index = state.promiseSubscribers.indexOf(subscriber)
    if (index !== -1) state.promiseSubscribers.splice(index, 1)
  })
}

proto.addSubscriber = function(subscriber) {
  const state = this[STATE]
  if (this.getProp("finalized")) return

  // run fetch immediately
  state.subscribers.push(subscriber)
  subscriber.addRemover(() => {
    const index = state.subscribers.indexOf(subscriber)
    if (index !== -1) state.subscribers.splice(index, 1)
  })
}

proto.update = function() {
  const state = this[STATE]
  state.subscribers.forEach(subscriber => subscriber.triggerUpdate())
}

proto.notifyData = function() {
  const state = this[STATE]
  const {data, promiseSubscribers, subscribers} = state

  // notify subscriber
  state.subscribers.forEach(subscriber => subscriber.triggerUpdate())
  state.subscribers = []

  // notify promiseSubscriber
  state.promiseSubscribers.forEach(subscriber => subscriber.resolver(data))
  // 是否对promiseSubscribers进行操作，需要业务自己实现，比如有可能A需要对请求进行pool
  // 而B并不需要
}

proto.shouldValidate = function() {
  const state = this[STATE]
  const {cacheStrategy, promise, finalized} = state
  const isNotValidating = promise && finalized
  return !cacheStrategy.canIUseCache() && isNotValidating
}

// trigger fetcher to run...
proto.validate = function() {
  const state = this[STATE]
  const {fetch, fetchArgs, cacheStrategy} = state

  state.finalized = false
  state.promise = fetch
    .apply(state, fetchArgs)
    .then(data => {
      state.data = data
      state.finalized = true
      this.notifyData()
      return data
    })
    .catch(err => {
      state.error = err
      state.hasError = true
      state.finalized = true
    })
    .finally(() => {
      state.finalized = true
      cacheStrategy.updateTS(Date.now())
    })
}

proto.getData = function(prop) {
  const state = this[STATE]
  const {data, cacheStrategy} = state

  if (data) return data
  if (this.shouldValidate()) this.validate()
}

export default ({key, fetch, fetchArgs}) => {
  const _fetcher = new fetcher()
  const cacheStrategy = new CacheStrategy()
  const retryStrategy = new RetryStrategy()
  const poolStrategy = new PoolStrategy()

  // promise property to make a delay....
  createHiddenProperty(_fetcher, "promise", {
    then: function(onFulfilled, onReject) {
      const state = this[STATE]
      const {data, error, promise} = state
      if (data) onFulfilled(data)
      if (this.shouldValidate()) this.validate()
    }.bind(_fetcher),
    catch: function(onCatch) {
      const state = this[STATE]
      const {hasError, error, promise} = state
      if (!promise && hasError) onCatch(error)
    }.bind(_fetcher),
    finally: function(onFinally) {
      const state = this[STATE]
      const {hasError, error, promise} = state
      onFinally()
    }.bind(_fetcher)
  })

  createHiddenProperty(_fetcher, STATE, {
    key,

    fetch,
    fetchArgs,

    data: null,
    deps: [],
    subscribers: [],
    isRevoked: false,
    finalized: false,

    promise: null,
    promiseSubscribers: [],

    onFetching: false,
    hasError: false,
    error: null,
    cacheStrategy,
    retryStrategy,
    poolStrategy
  })

  // 创建好fetcher就需要开始进行fetch了
  _fetcher.validate()

  return _fetcher
}
