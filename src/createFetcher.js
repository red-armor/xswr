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

// trigger fetcher to run...
proto.validate = function() {
  const state = this[STATE]
  const {fetch, fetchArgs} = state

  state.promise = fetch
    .apply(state, fetchArgs)
    .then(data => {
      state.data = data
      state.finalized = true
      this.notifyData()
      return data
    })
    .catch(err => {
      state.hasError = true
      state.error = err
      state.finalized = true
    })
    .finally(() => {
      state.finalized = true
    })
}

proto.revalidate = function() {
  const state = this[STATE]
  const {fetch, fetchArgs} = state
  state.finalized = false
  this.validate()
}

proto.getData = function(prop) {
  const state = this[STATE]
  const {data, isRevoked, retryStrategy} = state

  // 如果说已经触发过，并且没有报错的话直接返回结果
  // if (isRevoked) {
  //   if (!hasError) return data
  //   else retryStrategy.run()
  //   return
  // }

  this.setProp("isRevoked", true)
  return this.getProp("data")
}

export default ({key, fetch, fetchArgs}) => {
  const _fetcher = new fetcher()
  const cacheStrategy = new CacheStrategy()
  const retryStrategy = new RetryStrategy()
  const poolStrategy = new PoolStrategy()

  // promise property to make a delay....
  // createHiddenProperty(_fetcher, 'promise', {
  //   then: (onFulfilled, onReject) => {
  //     const state = this[STATE]
  //     const {data, error, promise} = state
  //     if (data) onFulfilled(data)
  //     else onReject(error)
  //   },
  //   catch: onCatch => {
  //     const state = this[STATE]
  //     const {hasError, error, promise} = state
  //     if (!promise && hasError) onCatch(error)
  //   },
  //   finally: onFinally => {
  //     const state = this[STATE]
  //     const {hasError, error, promise} = state
  //     onFinally()
  //   }
  // })

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
