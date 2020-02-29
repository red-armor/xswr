export default class PoolStrategy {
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

  assertStartingPool() {
    return false
  }

  resumeTick() {
    if (!this.assertStartingPool()) return
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
