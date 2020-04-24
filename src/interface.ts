export interface PromiseLike {
  then: () => PromiseLike
}

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
}

export interface IRetryStrategy {
  count: number
  belongs: null | ISubscriber
  timeoutHandler: number | null
  interval: number
  maxCount: number
  originCount: number
}

export interface IScope {
  cacheStrategy: ICacheStrategy
  poolingStrategy: IPoolingStrategy
  retryStrategy: IRetryStrategy
  usedData: object | null
  mode: number
  stopIfResultEqual: boolean
  belongs: ISubscriber
  cacheKey: string
  initialValue?: object
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
  remover: any[]
  forceValidate: boolean
  children: IComponentSubscriber[]
  scope: IScope
  dataRef: null | object

  fetch: () => PromiseLike
  fetchArgs: any[]

  onError: (err: Error) => void | null
  onSuccess: (value?: any) => void | null
  shouldComponentUpdate: boolean
  suppressUpdateIfEqual: boolean

  teardown: () => void
  handleUpdate: (initialValue: object) => void
  forceRevalidate: () => void
}

export interface IPromiseSubscriber {
  id: string
  remover: () => void
  teardown: () => void
  scope: IScope
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
  forceComponentRevalidate: (subscriber: fetcherSubscriber) => void
  attemptToValidate: (subscriber: fetcherSubscriber) => void
  getData: (subscriber: ISubscriber) => null | object | undefined
  forcePromiseRevalidate: (subscriber: fetcherSubscriber) => void
  handlePromise: (subscriber: fetcherSubscriber) => void
}

export interface createFetchOptions {
  key: string
  fetch: () => PromiseLike
  fetchArgs: any[]
}

export interface IResumablePromise {}

export interface State {}
