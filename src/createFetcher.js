import {createHiddenProperty, createHiddenProperties, STATE} from "./commons"

function fetcher() {}
const proto = fetcher.prototype

proto.addPromiseSubscriber = function(subscriber) {
  const state = this[STATE]
  subscriber.remover = () => {
    const index = state.promiseSubscribers.indexOf(subscriber)
    if (index !== -1) state.promiseSubscribers.splice(index, 1)
  }
  state.promiseSubscribers.push({
    subscriber,
    remove: () => subscriber.teardown()
  })
}

proto.addSubscriber = function(subscriber) {
  const state = this[STATE]
  if (state("finalized")) return

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
  // state.subscribers.forEach(subscriber => subscriber.triggerUpdate())
  // state.subscribers = []

  promiseSubscribers.forEach(({subscriber, remove}) => {
    subscriber.resolve(data)
    remove()
  })
  // 是否对promiseSubscribers进行操作，需要业务自己实现，比如有可能A需要对请求进行pool
  // 而B并不需要
}

proto.notifyError = function() {
  const state = this[STATE]
  const {error, promiseSubscribers, subscribers} = state

  // notify subscriber
  // state.subscribers.forEach(subscriber => subscriber.triggerUpdate())
  // state.subscribers = []

  promiseSubscribers.forEach(({subscriber, remove}) => {
    subscriber.reject(error)
    remove()
  })
}

proto.assertValidating = function() {
  const state = this[STATE]
  const {promise, finalized} = state
  return promise && !finalized
}

// trigger fetcher to run...
proto.validate = function() {
  const state = this[STATE]
  const {fetch, fetchArgs, cacheStrategy} = state

  state.finalized = false
  state.promise = fetch.apply(state, fetchArgs).then(
    data => {
      state.data = data
      state.lastUpdatedMS = Date.now()
      state.finalized = true
      this.notifyData()
    },
    err => {
      state.error = err
      state.hasError = true
      state.finalized = true
      state.lastUpdatedMS = Date.now()
      this.notifyError()
    }
  )
}

proto.getData = function(prop) {
  const state = this[STATE]
  const {data, cacheStrategy} = state

  if (data) return data
  if (this.assertValidating()) promise.then(onFulfilled, onReject)
  else if (!cacheStrategy.canIUseCache()) this.validate()
}

proto.handlePromise = function(subscriber) {
  const state = this[STATE]
  const {
    scope: {cacheStrategy}
  } = subscriber
  const {data} = state
  // If there has data, return first
  if (data) subscriber.resolve(data)
  // If there has ongoing request, bind `onFulfilled` and `onReject`
  if (this.assertValidating()) {
    this.addPromiseSubscriber(subscriber)
  } else if (!cacheStrategy.canIUseCache()) {
    // If there is not ongoing request, check its validation.
    this.addPromiseSubscriber(subscriber)
    this.validate()
  }
}

export default ({key, fetch, fetchArgs}) => {
  const _fetcher = new fetcher()

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
    lastUpdatedMS: null
  })

  // 创建好fetcher就需要开始进行fetch了
  _fetcher.validate()

  return _fetcher
}
