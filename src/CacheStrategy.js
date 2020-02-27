export default class CacheStrategy {
  constructor({maxAge, immediately, minThresholdMS, staleWhileRevalidateMS}) {
    this.maxAge = maxAge
    this.immediately = immediately
    this.minThresholdMS = minThresholdMS
    this.staleWhileRevalidateMS = staleWhileRevalidateMS
  }

  canIUseCache(lastUpdatedMS) {
    if (!lastUpdatedMS) return false

    const now = Date.now()
    const delta = now - lastUpdatedMS
    if (delta < 0) return false

    if (this.immediately) {
      return delta < this.minThresholdMS
    } else {
      return delta < this.staleWhileRevalidateMS
    }
  }
}
