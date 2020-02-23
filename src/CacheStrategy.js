export default class CacheStrategy {
  constructor() {
    this.maxAge = 10 * 60
    this.latestUpdateTS = Date.now()
    this.staleWhileRevalidate = 10 * 60
  }

  canIUseCache() {
    return true
  }

  validateExpiryTS() {}
}
