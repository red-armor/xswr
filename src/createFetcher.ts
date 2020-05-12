import {
  fetcherSubscriber,
  ISubscriber,
  createFetchOptions,
  IComponentSubscriber,
  IPromiseSubscriber,
  Fetcher
} from "./interface"

import {createHiddenProperty, STATE, isPromiseLike} from "./commons"

const fetcher = (function(): void {} as any) as {new (): Fetcher}
const proto = fetcher.prototype

const findIndex = (
  subscribers: fetcherSubscriber[],
  subscriber: ISubscriber
) => {
  return subscribers.findIndex(({subscriber: o}) => o.id === subscriber.id)
}

proto.getProp = function(prop: string): any {
  const state = this[STATE]
  return state[prop]
}

proto.addComponentSubscriber = function(subscriber: ISubscriber): void {
  const state = this[STATE]
  const index = findIndex(state.componentSubscribers, subscriber)
  if (index !== -1) return

  subscriber.remover = () => {
    const removerIndex = findIndex(state.componentSubscribers, subscriber)
    if (removerIndex !== -1) state.componentSubscribers.splice(removerIndex, 1)
  }
  state.componentSubscribers.push({
    subscriber,
    remove: () => subscriber.teardown()
  })
}

proto.addPromiseSubscriber = function(subscriber: ISubscriber): void {
  const state = this[STATE]
  const index = findIndex(state.promiseSubscribers, subscriber)
  if (index !== -1) return

  subscriber.remover = () => {
    const removerIndex = findIndex(state.promiseSubscribers, subscriber)
    if (removerIndex !== -1) state.promiseSubscribers.splice(removerIndex, 1)
  }
  state.promiseSubscribers.push({
    subscriber,
    remove: () => subscriber.teardown()
  })
}

proto.notifyData = function(): void {
  const state = this[STATE]
  const {data, promiseSubscribers, componentSubscribers} = state

  // Should use slice copy, because `componentSubscribers` is changed after remove.
  // It cause cause the following subscriber not be revoked..
  componentSubscribers
    .slice()
    .forEach(
      ({
        subscriber,
        remove
      }: {
        subscriber: IComponentSubscriber
        remove: () => void
      }) => {
        subscriber.handleUpdate(data)
        remove()
      }
    )

  promiseSubscribers
    .slice()
    .forEach(
      ({
        subscriber,
        remove
      }: {
        subscriber: IPromiseSubscriber
        remove: () => void
      }) => {
        subscriber.resolve(data)
        remove()
      }
    )
}

proto.notifyError = function(): void {
  const state = this[STATE]
  const {error, promiseSubscribers, componentSubscribers} = state

  // notify subscriber
  componentSubscribers
    .slice()
    .forEach(
      ({
        subscriber,
        remove
      }: {
        subscriber: IComponentSubscriber
        remove: () => void
      }) => {
        subscriber.handleError(error)
        remove()
      }
    )

  promiseSubscribers
    .slice()
    .forEach(
      ({
        subscriber,
        remove
      }: {
        subscriber: IPromiseSubscriber
        remove: () => void
      }) => {
        subscriber.reject(error)
        remove()
      }
    )
}

proto.assertValidating = function(): boolean {
  const state = this[STATE]
  const {promise, finalized} = state
  return promise && !finalized
}

// trigger fetcher to run...
proto.validate = function(): void {
  const state = this[STATE]
  const {fetch, fetchArgs} = state

  state.finalized = false
  state.promise = fetch.apply(state, fetchArgs).then(
    (data: any) => {
      state.data = data
      state.lastUpdatedMS = Date.now()
      state.error = null
      state.hasError = false
      state.finalized = true
      this.notifyData()
    },
    (err: Error) => {
      state.error = err
      state.hasError = true
      state.finalized = true
      state.lastUpdatedMS = Date.now()
      this.notifyError()
    }
  )
}

/**
 * Do not care about cache is valid or not..Normally, it's used for pooling or
 * retry...
 */
proto.forceComponentRevalidate = function(subscriber: ISubscriber): void {
  // If there has ongoing request, bind `onFulfilled` and `onReject`
  if (this.assertValidating()) {
    this.addComponentSubscriber(subscriber)
  } else {
    // If there is not ongoing request, check its validation.
    this.addComponentSubscriber(subscriber)
    this.validate()
  }
}

/**
 * Basically, used by `ComponentSubscriber`. trigger fetch asap
 */
proto.attemptToValidate = function(subscriber: ISubscriber): void {
  const {
    scope: {cacheStrategy}
  } = subscriber
  const state = this[STATE]
  const {lastUpdatedMS} = state

  if (!this.assertValidating() && !cacheStrategy.canIUseCache(lastUpdatedMS)) {
    this.validate()
  }
}

proto.getData = function(subscriber: IComponentSubscriber): object | null {
  const {
    scope: {cacheStrategy, initialValue, onInitial, cacheKey}
  } = subscriber
  const state = this[STATE]
  const {lastUpdatedMS, data} = state

  // If there has ongoing request, bind `onFulfilled` and `onReject`
  if (this.assertValidating()) {
    this.addComponentSubscriber(subscriber)
  } else if (!cacheStrategy.canIUseCache(lastUpdatedMS)) {
    // If there is not ongoing request, check its validation.
    this.addComponentSubscriber(subscriber)
    this.validate()
  }

  // If there has data, return first
  if (data) return data

  if (initialValue) {
    state.data = initialValue
    subscriber.handleUpdate(initialValue)
  } else if (typeof onInitial === "function") {
    try {
      const pendingValue = onInitial(cacheKey)
      if (isPromiseLike(pendingValue)) {
        pendingValue.then((result: any) => {
          state.data = result
          subscriber.handleUpdate(result)
        })
      } else {
        state.data = pendingValue
        subscriber.handleUpdate(pendingValue)
      }
    } catch (err) {
      // dismiss
    }
  }

  return null
}

/**
 * Do not care about cache is valid or not..Normally, it's used for pooling or
 * retry...
 */
proto.forcePromiseRevalidate = function(subscriber: IPromiseSubscriber): void {
  // If there has ongoing request, bind `onFulfilled` and `onReject`
  if (this.assertValidating()) {
    this.addPromiseSubscriber(subscriber)
  } else {
    // If there is not ongoing request, check its validation.
    this.addPromiseSubscriber(subscriber)
    this.validate()
  }
}

proto.handlePromise = function(subscriber: IPromiseSubscriber): void {
  const state = this[STATE]
  const {
    scope: {cacheStrategy, initialValue, onInitial, cacheKey}
  } = subscriber
  const {data, lastUpdatedMS} = state

  // If there has data, return first
  if (data) {
    subscriber.resolve(data)
  } else if (initialValue) {
    subscriber.resolve(initialValue)
  } else if (typeof onInitial === "function") {
    try {
      const pendingValue = onInitial(cacheKey)
      if (isPromiseLike(pendingValue)) {
        pendingValue.then((result: any) => subscriber.resolve(result))
      } else {
        subscriber.resolve(pendingValue)
      }
    } catch (err) {
      // dismiss
    }
  }

  // If there has ongoing request, bind `onFulfilled` and `onReject`
  if (this.assertValidating()) {
    this.addPromiseSubscriber(subscriber)
  } else if (!cacheStrategy.canIUseCache(lastUpdatedMS)) {
    // If there is not ongoing request, check its validation.
    this.addPromiseSubscriber(subscriber)
    this.validate()
  }
}

export default (options: createFetchOptions): Fetcher => {
  const {key, fetch, fetchArgs} = options
  const _fetcher = new fetcher()

  createHiddenProperty(_fetcher, STATE, {
    key,
    fetch,
    fetchArgs,

    data: null,
    finalized: false,
    componentSubscribers: [],
    promise: null,
    promiseSubscribers: [],
    hasError: false,
    error: null,
    lastUpdatedMS: null
  })

  return _fetcher
}
