import {IRetryStrategy, ISubscriber} from "./interface"

export default class RetryStrategy implements IRetryStrategy {
  public count: number
  public belongs: null | ISubscriber
  public timeoutHandler: ReturnType<typeof setTimeout> | null
  public interval: number
  public maxCount: number
  public originCount: number

  constructor({interval, maxCount}: {interval: number; maxCount: number}) {
    this.count = 0
    this.belongs = null
    this.timeoutHandler = null
    this.interval = interval
    this.maxCount = maxCount
    this.originCount = maxCount
  }

  nextTick(): number {
    // exponential back-off
    // http://blog.darrengordon.net/2014/11/exponential-backoff-in-javascript.html
    this.count = Math.max(this.count * 2, 1)
    const timeout = this.count * this.interval
    return timeout
  }

  reset(): void {
    this.count = 0
    this.maxCount = this.originCount
  }

  resumeTick(): void {
    this.reset()
    this.continueTick()
  }

  continueTick(): void {
    this.maxCount--
    const tick = this.nextTick()
    if (tick) {
      this.timeoutHandler = setTimeout(() => {
        if (this.belongs) this.belongs.forceRevalidate()
      }, tick)
    }
  }

  cleanup(): void {
    this.reset()
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }
}
