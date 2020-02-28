export default class PoolStrategy {
  constructor({poolInterval}) {
    this.belongs = null
    this.timeoutHandler = null
    this.interval = poolInterval
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
    if (!shouldIStartPool) return
    this.timeoutHandler = setTimeout(() => {
      this.belongs.validate()
    })
  }

  cleanup() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }
}
