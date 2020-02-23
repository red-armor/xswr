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

proto.addSubscription = function(subscriber) {
  const state = this[STATE]
  state.subscribers.push(subscriber)
  subscriber.addRemover(() => {
    const index = state.indexOf(subscriber)
    if (index !== -1) state.splice(index, 1)
  })
}

proto.update = function() {
  const state = this[STATE]
  state.subscribers.forEach(subscriber => subscriber.update())
}

proto.validate = function() {
  const state = this[STATE]
  const {fetch, fetchArgs} = state

  state.promise = fetch
    .apply(state, fetchArgs)
    .then(data => {
      state.data = data
      state.finalized = true
      this.update()
    })
    .catch(err => {
      state.hasError = true
      state.error = err
    })
}

proto.getData = function(prop) {
  const state = this[STATE]
  const {data, fetch, isRevoked, fetchArgs, retryStrategy} = state

  // 如果说已经触发过，并且没有报错的话直接返回结果
  if (isRevoked) {
    if (!hasError) return data
    else retryStrategy.run()
    return
  }

  this.setProp("isRevoked", true)
}

export default ({key, fetch, fetchArgs}) => {
  const _fetcher = new fetcher()
  const cacheStrategy = new CacheStrategy()
  const retryStrategy = new RetryStrategy()
  const poolStrategy = new PoolStrategy()

  createHiddenProperty(_fetcher, STATE, {
    key,

    fetch,
    fetchArgs,

    data: null,
    deps: [],
    subscribers: [],
    isRevoked: false,
    finalized: false,

    promise: new Promise(),

    onFetching: false,
    hasError: false,
    cacheStrategy,
    retryStrategy,
    poolStrategy
  })

  return _fetcher
}
