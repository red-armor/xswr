export default class CacheStrategy {
  constructor({maxAge, forceValidate, minThresholdMS, staleWhileRevalidateMS}) {
    this.maxAge = maxAge
    this.forceValidate = forceValidate
    this.minThresholdMS = minThresholdMS
    this.staleWhileRevalidateMS = staleWhileRevalidateMS
  }

  canIUseCache(lastUpdatedMS) {
    if (!lastUpdatedMS) return false

    const now = Date.now()
    const delta = now - lastUpdatedMS

    if (delta < 0) return false

    if (this.forceValidate) {
      return delta < this.minThresholdMS
    }
    return delta < this.staleWhileRevalidateMS
  }
}
