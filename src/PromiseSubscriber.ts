// @ts-ignore
import equal from "deep-equal"
import ResumablePromise from "./ResumablePromise"

import {
  Fetcher,
  IScope,
  IPromiseSubscriber,
  IResumablePromise,
  FunctionOrNull
} from "./interface"

let count = 0

export default class PromiseSubscriber implements IPromiseSubscriber {
  public id: string
  public fetcher: Fetcher
  public scope: IScope
  public fetchArgs: any[]
  public promise: IResumablePromise
  public cacheKey: string
  public dataRef: null | object
  public remover: FunctionOrNull
  public onSuccess: FunctionOrNull
  public onError: FunctionOrNull

  constructor({
    fetcher,
    scope,
    fetchArgs,
    cacheKey,
    onSuccess,
    onError
  }: {
    fetcher: Fetcher
    scope: IScope
    fetchArgs: any[]
    cacheKey: string
    onSuccess: () => void | null
    onError: () => void | null
  }) {
    this.id = `promise_subscriber_${count++}`
    this.fetcher = fetcher
    this.scope = scope
    this.scope.bind(this)
    this.remover = () => {}
    // https://stackoverflow.com/questions/43623461/new-expression-whose-target-lacks-a-construct-signature-in-typescript
    this.promise = new (ResumablePromise as any)()
    this.dataRef = null
    this.fetchArgs = fetchArgs
    this.cacheKey = cacheKey
    this.onSuccess = onSuccess
    this.onError = onError

    this.fetcher.handlePromise(this)
  }

  resolve(newData?: any): void {
    if (!equal(this.dataRef, newData)) {
      this.dataRef = newData
      this.promise.resolve(newData)
      const {onPersistance} = this.scope
      if (typeof onPersistance === "function") {
        onPersistance.call(this, this.cacheKey, newData)
      }

      if (typeof this.onSuccess === "function") {
        this.onSuccess(newData)
      }
    }

    this.scope.attemptToPooling()
  }

  reject(err: Error): void {
    if (this.scope.assertContinueRetry()) {
      this.scope.attemptToRetry()
    } else {
      this.promise.reject(err)

      if (typeof this.onError === "function") {
        this.onError(err)
      }

      this.scope.attemptToPooling()
    }
  }

  validate() {
    this.fetcher.handlePromise(this)
  }

  teardown() {
    if (typeof this.remover === "function") {
      this.remover()
    }
    this.remover = null
  }

  forceRevalidate() {
    this.fetcher.forcePromiseRevalidate(this)
  }
}
