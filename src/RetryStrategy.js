export default class RetryStrategy {
  constructor({interval, maxCount}) {
    this.count = 0
    this.belongs = null
    this.timeoutHandler = null
    this.interval = interval
    this.maxCount = maxCount
  }

  nextTick() {
    // exponential back-off
    // http://blog.darrengordon.net/2014/11/exponential-backoff-in-javascript.html
    this.count = Math.max(this.count * 2, 1)
    const timeout = this.count * this.interval
    return timeout
  }

  resumeTick() {
    this.count = 0
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
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }
}
