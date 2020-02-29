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
      immediately,
      maxAge,
      minThresholdMS,
      staleWhileRevalidateMS,

      stopIfResultEqual,

      poolingInterval,

      retryInterval,
      retryMaxCount
    } = config

    this.cacheStrategy = new CacheStrategy({
      maxAge,
      immediately,
      minThresholdMS,
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
  }

  bind(subscriber) {
    this.belongs = subscriber
    this.poolingStrategy.belongs = subscriber
    this.retryStrategy.belongs = subscriber
  }

  assertResultEqual(newResult) {
    this.cleanup()
    this.attemptToPooling()
    if (!this.stopIfResultEqual) return false
    return true
  }

  assertErrorEqual(error) {
    this.cleanup()
    return false
  }

  attemptToPooling() {
    if (this.poolingStrategy.interval <= 0) return

    if (this.mode == MODE.NORMAL || this.mode === MODE.RETRY) {
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
