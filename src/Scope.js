import CacheStrategy from "./CacheStrategy"
import PoolStrategy from "./PoolStrategy"
import RetryStrategy from "./RetryStrategy"

export default class Scope {
  constructor(config) {
    const {
      immediately,
      maxAge,
      minThresholdMS,
      staleWhileRevalidateMS,

      stopIfResultEqual
    } = config

    this.cacheStrategy = new CacheStrategy({
      maxAge,
      immediately,
      minThresholdMS,
      staleWhileRevalidateMS
    })

    this.poolStrategy = new PoolStrategy({})

    this.retryStrategy = new RetryStrategy({})

    this.usedData = null

    // 默认情况下， 如果说值一样的话，就不再进行更新
    this.stopIfResultEqual = stopIfResultEqual
  }

  assertResultEqual(newResult) {
    if (!this.stopIfResultEqual) return false
    return true
  }

  assertErrorEqual(error) {
    return true
  }
}
