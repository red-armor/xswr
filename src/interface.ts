export interface PromiseLike {
  then: () => PromiseLike
}

export interface IResumablePromise {}

// https://stackoverflow.com/questions/47471052/type-null-is-not-assignable-to-type-void-null
export type functionOrNull = {(...args: any[]): void} | null

export interface ICacheStrategy {
  maxAge: undefined | number
  forceValidate: boolean
  staleWhileRevalidateMS: number
  canIUseCache: (lastUpdatedMS?: number) => boolean
}

export interface IPoolingStrategy {
  belongs: null | ISubscriber
  timeoutHandler: ReturnType<typeof setTimeout> | null
  interval: number

  bind: (subscriber: ISubscriber) => void
  suspense: () => void
  resumeTick: () => void
  cleanup: () => void
  destroy: () => void
}

export interface IRetryStrategy {
  count: number
  belongs: null | ISubscriber
  timeoutHandler: ReturnType<typeof setTimeout> | null
  interval: number
  maxCount: number
  originCount: number

  nextTick: () => number
  reset: () => void
  resumeTick: () => void
  continueTick: () => void
  cleanup: () => void
}

export interface IScope {
  cacheStrategy: ICacheStrategy
  poolingStrategy: IPoolingStrategy
  retryStrategy: IRetryStrategy
  usedData: object | null
  mode: number
  stopIfResultEqual: boolean
  belongs: ISubscriber | null
  cacheKey: string
  initialValue?: null | object
  onInitial?: (cacheKey: string) => PromiseLike | any
  onPersistance?: () => void

  bind: (subscriber: ISubscriber) => void
  setCacheKey: (cacheKey: string) => void
  attemptToPooling: () => void
  assertContinueRetry: () => boolean
  attemptToRetry: () => void
  assertPooling: () => boolean
  cleanup: () => void
}

export interface scopeConfig {
  forceValidate: boolean
  maxAge: number
  staleWhileRevalidateMS: number

  stopIfResultEqual: boolean

  poolingInterval: number

  retryInterval: number
  retryMaxCount: number
  cacheKey: string
  initialValue?: object
  onInitial?: (cacheKey: string) => PromiseLike | any
  onPersistance?: () => void
}

export interface IComponentSubscriber {
  id: string
  deps: State[]
  updater: () => void
  remover: () => void | null
  forceValidate: boolean
  children: IComponentSubscriber[]
  scope: IScope
  dataRef: null | object

  fetch: () => PromiseLike
  fetchArgs: any[]

  shouldComponentUpdate: boolean
  suppressUpdateIfEqual: boolean

  teardown: () => void
  handleUpdate: (initialValue: object) => void
  forceRevalidate: () => void
  attemptToFetch: () => void
}

export interface IPromiseSubscriber {
  id: string
  scope: IScope
  onSuccess: functionOrNull
  onError: functionOrNull
  remover: functionOrNull
  teardown: () => void
  resolve: (data: any) => void
  forceRevalidate: () => void
}

export type ISubscriber = IPromiseSubscriber | IComponentSubscriber

export interface fetcherSubscriber {
  subscriber: ISubscriber
  remove: () => void
}

export interface Fetcher {
  key: string
  fetch: () => PromiseLike
  fetchArgs: any[]

  data: null | any
  finalized: boolean
  componentSubscribers: IComponentSubscriber[]
  promise: null | PromiseLike
  promiseSubscribers: IPromiseSubscriber[]
  hasError: boolean
  error: null | string
  lastUpdatedMS: null | number

  findIndex: (
    subscribers: fetcherSubscriber[],
    subscriber: ISubscriber
  ) => number
  getProp: (prop: string) => any
  addComponentSubscriber: (subscriber: fetcherSubscriber) => void
  addPromiseSubscriber: (subscriber: fetcherSubscriber) => void
  notifyData: () => void
  notifyError: () => void
  assertValidating: () => boolean
  validate: () => void
  forceComponentRevalidate: (subscriber: ISubscriber) => void
  attemptToValidate: (subscriber: ISubscriber) => void
  getData: (subscriber: ISubscriber) => null | object | undefined
  forcePromiseRevalidate: (subscriber: ISubscriber) => void
  handlePromise: (subscriber: ISubscriber) => void
}

export interface createFetchOptions {
  key: string
  fetch: () => PromiseLike
  fetchArgs: any[]
}

export interface IResumablePromise {}

export interface State {}

export enum MODE {
  NORMAL = 0,
  POOL = 1,
  RETRY = 2
}
