import {RESUMABLE_PROMISE, USE_XSWR} from "./commons"

export interface PromiseLike<T> {
  then: (
    onfulfilled?: ((value: T) => T | PromiseLike<T> | void) | null | undefined,
    onrejected?: (reason: any) => void
  ) => PromiseLike<T>
}

export interface IResumablePromise {
  [RESUMABLE_PROMISE]: any
  resolve: <T>(result: T | PromiseLike<T>) => void
  reject: <T>(reason?: any) => void
}

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
  onInitial?: <T>(cacheKey: string) => PromiseLike<T> | any
  onPersistance?: (cacheKey: string, newData: any) => void

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
  onInitial?: <T>(cacheKey: string) => PromiseLike<T> | any
  onPersistance?: (cacheKey: string, newData: any) => void
}

export interface IComponentSubscriber {
  id: string
  deps: IComponentSubscriber[]
  updater: () => void
  remover: null | {(): void}
  forceValidate: boolean
  children: IComponentSubscriber[]
  scope: IScope
  dataRef: null | object

  fetch: <T>() => PromiseLike<T>
  fetchArgs: any[]

  shouldComponentUpdate: boolean
  suppressUpdateIfEqual: boolean

  teardown: () => void
  handleUpdate: (newData: object | null) => void
  handleError: (err: Error) => void
  attemptToFetch: () => void
  forceRevalidate: () => void
  addChild: (child: IComponentSubscriber) => void
}

export interface IPromiseSubscriber {
  id: string
  scope: IScope
  onSuccess: functionOrNull
  onError: functionOrNull
  remover: functionOrNull
  teardown: () => void
  resolve: (data: any) => void
  reject: (err: Error) => void
  forceRevalidate: () => void
}

export type ISubscriber = IPromiseSubscriber | IComponentSubscriber

export interface fetcherSubscriber {
  subscriber: ISubscriber
  remove: () => void
}

export interface Fetcher {
  key: string
  fetch: <T>() => PromiseLike<T>
  fetchArgs: any[]

  data: null | any
  finalized: boolean
  componentSubscribers: IComponentSubscriber[]
  promise: null
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
  fetch: <T>() => PromiseLike<T>
  fetchArgs: any[]
}

export interface State {}

export enum MODE {
  NORMAL = 0,
  POOL = 1,
  RETRY = 2
}

export interface useResult {
  [USE_XSWR]: IComponentSubscriber
  data: any
  error: Error | null
  isValidating: boolean
  clearPooling: {(): void}
  isPooling: boolean
}
