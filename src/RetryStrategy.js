export default class RetryStrategy {
  constructor({errorRetryInterval}) {
    this.count = 0
    this.belongs = null
    this.timeoutHandler = null
    this.errorRetryInterval = errorRetryInterval
  }

  nextTick() {
    const timeout =
      ~~((Math.random() + 0.5) * (1 << this.count)) * this.errorRetryInterval
    this.count += 1
    return timeout
  }

  reset() {
    this.count = 0
  }

  resumeTick() {
    this.count = 0
    const tick = this.nextTick()

    this.timeoutHandler = setTimeout(() => {
      this.belongs.validate()
    }, tick)
  }

  cleanup() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }
}
