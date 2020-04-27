import {IPoolingStrategy, ISubscriber} from "./interface"

export default class PoolingStrategy implements IPoolingStrategy {
  public belongs: null | ISubscriber
  // https://stackoverflow.com/questions/51040703/what-return-type-should-be-used-for-settimeout-in-typescript
  public timeoutHandler: ReturnType<typeof setTimeout> | null
  public interval: number

  constructor({interval}: {interval: number}) {
    this.belongs = null
    this.timeoutHandler = null
    this.interval = interval
  }

  bind(subscriber: ISubscriber): void {
    this.belongs = subscriber
  }

  suspense(): void {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }

  resumeTick(): void {
    if (this.interval > 0) {
      this.timeoutHandler = setTimeout(() => {
        if (this.belongs) this.belongs.forceRevalidate()
      }, this.interval)
    }
  }

  cleanup(): void {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }

  destroy(): void {
    this.cleanup()
    this.interval = 0
  }
}
