import CacheStrategy from "./CacheStrategy"
import PoolStrategy from "./PoolStrategy"
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

      errorRetryInterval
    } = config

    this.cacheStrategy = new CacheStrategy({
      maxAge,
      immediately,
      minThresholdMS,
      staleWhileRevalidateMS
    })

    this.poolStrategy = new PoolStrategy({
      interval: poolInterval
    })

    this.retryStrategy = new RetryStrategy({
      interval: errorRetryInterval
    })

    this.usedData = null

    this.mode = MODE.NORMAL

    // 默认情况下， 如果说值一样的话，就不再进行更新
    this.stopIfResultEqual = stopIfResultEqual

    this.belongs = null
  }

  bind(subscriber) {
    this.belongs = subscriber
    this.poolStrategy.belongs = subscriber
    this.retryStrategy.belongs = subscriber
  }

  assertResultEqual(newResult) {
    this.cleanup()
    this.attemptToPool()
    if (!this.stopIfResultEqual) return false
    return true
  }

  assertErrorEqual(error) {
    this.cleanup()
    this.attemptToRetry()
    return false
  }

  attemptToPool() {
    if (this.mode == MODE.NORMAL || this.mode === MODE.RETRY) {
      this.mode = MODE.POOL
      this.poolStrategy.resumeTick()
    }
  }

  attemptToRetry() {
    if (this.mode == MODE.NORMAL || this.mode === MODE.POOL) {
      this.mode = MODE.RETRY
      this.retryStrategy.resumeTick()
    }
  }

  cleanup() {
    this.poolStrategy.cleanup()
    this.retryStrategy.cleanup()
  }
}