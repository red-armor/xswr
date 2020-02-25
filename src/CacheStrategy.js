export default class CacheStrategy {
  constructor({maxAge, minThresholdMS, staleWhileRevalidateMS}) {
    this.maxAge = maxAge
    this.latestUpdateTS = null
    this.minThresholdMS = minThresholdMS
    this.staleWhileRevalidateMS = staleWhileRevalidateMS
  }

  canIUseCache(immediately = false) {
    if (!this.latestUpdateTS) return false

    const now = Date.now()
    const delta = now - this.latestUpdateTS
    if (delta < 0) return false

    if (immediately) {
      return delta < this.minThresholdMS
    } else {
      return delta < this.staleWhileRevalidateMS
    }
  }

  updateTS(ms) {
    this.latestUpdateTS = ms
  }
}
