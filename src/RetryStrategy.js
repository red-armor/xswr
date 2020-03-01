export default class RetryStrategy {
  constructor({interval, maxCount}) {
    this.count = 0
    this.belongs = null
    this.timeoutHandler = null
    this.interval = interval
    this.maxCount = maxCount
    this.maxCountOriginalValue = maxCount
  }

  nextTick() {
    // exponential back-off
    // http://blog.darrengordon.net/2014/11/exponential-backoff-in-javascript.html
    this.count = Math.max(this.count * 2, 1)
    const timeout = this.count * this.interval
    return timeout
  }

  reset() {
    this.count = 0
    this.maxCount = this.maxCountOriginalValue
  }

  resumeTick() {
    this.reset()
    this.continueTick()
  }

  continueTick() {
    this.maxCount--
    const tick = this.nextTick()
    if (tick) {
      this.timeoutHandler = setTimeout(() => {
        this.belongs.forceRevalidate()
      }, tick)
    }
  }

  cleanup() {
    this.reset()
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }
}
