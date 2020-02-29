export default class PoolingStrategy {
  constructor({interval}) {
    this.belongs = null
    this.timeoutHandler = null
    this.interval = interval
  }

  bind(subscriber) {
    this.belongs = subscriber
  }

  suspense() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }

  resumeTick() {
    this.timeoutHandler = setTimeout(() => {
      this.belongs.revalidate()
    })
  }

  cleanup() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }

  destroy() {
    this.cleanup()
    this.interval = 0
  }
}
