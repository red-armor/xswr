export default class CacheStrategy {
  constructor() {
    this.maxAge = 0
    this.latestUpdateTS = null

    this.staleWhileRevalidateMS = 5 * 60 * 1000

    this.minTSThreshold = 300
  }

  canIUseCache(immediately = false) {
    if (!this.latestUpdateTS) return false

    const now = Date.now()
    const delta = now - this.latestUpdateTS
    if (delta < 0) return false

    if (immediately) {
      return delta < this.minTSThreshold
    } else {
      return delta < this.staleWhileRevalidateMS
    }
  }

  updateTS(ms) {
    this.latestUpdateTS = ms
  }
}
