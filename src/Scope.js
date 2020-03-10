import CacheStrategy from "./CacheStrategy"
import PoolingStrategy from "./PoolingStrategy"
import RetryStrategy from "./RetryStrategy"

const MODE = {
  NORMAL: 0,
  POOL: 1,
  RETRY: 2
}

export default class Scope {
  constructor(config) {
    const {
      forceValidate,
      maxAge,
      staleWhileRevalidateMS,

      stopIfResultEqual,

      poolingInterval,

      retryInterval,
      retryMaxCount,
      cacheKey,
      onInitial,
      initialValue,
      onPersistance
    } = config

    this.cacheStrategy = new CacheStrategy({
      maxAge,
      forceValidate,
      staleWhileRevalidateMS
    })

    this.poolingStrategy = new PoolingStrategy({
      interval: poolingInterval
    })

    this.retryStrategy = new RetryStrategy({
      interval: retryInterval,
      maxCount: retryMaxCount
    })

    this.usedData = null

    this.mode = MODE.NORMAL

    // 默认情况下， 如果说值一样的话，就不再进行更新
    this.stopIfResultEqual = stopIfResultEqual

    this.belongs = null

    this.cacheKey = cacheKey
    this.initialValue = initialValue
    this.onInitial = onInitial
    this.onPersistance = onPersistance
  }

  bind(subscriber) {
    this.belongs = subscriber
    this.poolingStrategy.belongs = subscriber
    this.retryStrategy.belongs = subscriber
  }

  setCacheKey(cacheKey) {
    this.cacheKey = cacheKey
  }

  attemptToPooling() {
    if (this.poolingStrategy.interval <= 0) return
    // when start pooling, retry strategy should be reset..
    this.retryStrategy.cleanup()

    if (this.mode === MODE.NORMAL || this.mode === MODE.RETRY) {
      this.mode = MODE.POOL
    }

    this.poolingStrategy.resumeTick()
  }

  assertContinueRetry() {
    return this.retryStrategy.maxCount > 0
  }

  attemptToRetry() {
    if (this.mode === MODE.POOL) {
      this.poolingStrategy.suspense()
    }

    if (this.mode === MODE.NORMAL || this.mode === MODE.POOL) {
      this.mode = MODE.RETRY
      this.retryStrategy.resumeTick()
    } else {
      this.retryStrategy.continueTick()
    }
  }

  assertPooling() {
    return this.mode === MODE.POOL
  }

  cleanup() {
    this.poolingStrategy.cleanup()
    this.retryStrategy.cleanup()
  }
}
