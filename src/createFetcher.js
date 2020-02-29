import {createHiddenProperty, createHiddenProperties, STATE} from "./commons"

function fetcher() {}
const proto = fetcher.prototype

const findIndex = (subscribers, subscriber) => {
  return subscribers.findIndex(({subscriber: o}) => o.id === subscriber.id)
}

proto.addComponentSubscriber = function(subscriber) {
  const state = this[STATE]
  const index = findIndex(state.componentSubscribers, subscriber)
  if (index !== -1) return

  subscriber.remover = () => {
    const index = findIndex(state.componentSubscribers, subscriber)
    if (index !== -1) state.componentSubscribers.splice(index, 1)
  }
  state.componentSubscribers.push({
    subscriber,
    remove: () => subscriber.teardown()
  })
}

proto.addPromiseSubscriber = function(subscriber) {
  const state = this[STATE]
  const index = findIndex(state.promiseSubscribers, subscriber)
  if (index !== -1) return

  subscriber.remover = () => {
    const index = findIndex(state.promiseSubscribers, subscriber)
    if (index !== -1) state.promiseSubscribers.splice(index, 1)
  }
  state.promiseSubscribers.push({
    subscriber,
    remove: () => subscriber.teardown()
  })
}

proto.notifyData = function() {
  const state = this[STATE]
  const {data, promiseSubscribers, componentSubscribers} = state

  // notify subscriber
  componentSubscribers.forEach(({subscriber, remove}) => {
    subscriber.handleUpdate(data)
    remove()
  })

  promiseSubscribers.forEach(({subscriber, remove}) => {
    subscriber.resolve(data)
    remove()
  })

  state.componentSubscribers = []
  state.promiseSubscribers = []
}

proto.notifyError = function() {
  const state = this[STATE]
  const {error, promiseSubscribers, componentSubscribers} = state

  // notify subscriber
  componentSubscribers.forEach(({subscriber, remove}) => {
    subscriber.handleError(error)
    remove()
  })

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
  const {fetch, fetchArgs} = state

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

proto.revalidate = function(subscriber) {
  const {
    scope: {cacheStrategy}
  } = subscriber

  // If there has ongoing request, bind `onFulfilled` and `onReject`
  if (this.assertValidating()) {
    this.addComponentSubscriber(subscriber)
  } else if (!cacheStrategy.canIUseCache()) {
    // If there is not ongoing request, check its validation.
    this.addComponentSubscriber(subscriber)
    this.validate()
  }
}

proto.getData = function(subscriber) {
  const state = this[STATE]

  const {data} = state
  // If there has data, return first
  if (data) return data
  this.revalidate(subscriber)
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
    isRevoked: false,
    finalized: false,
    componentSubscribers: [],

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
