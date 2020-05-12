import {ICacheStrategy} from "./interface"

export default class CacheStrategy implements ICacheStrategy {
  public maxAge: undefined | number
  public forceValidate: boolean
  public staleWhileRevalidateMS: number

  constructor({
    maxAge,
    forceValidate,
    staleWhileRevalidateMS
  }: {
    maxAge: undefined | number
    forceValidate: boolean
    staleWhileRevalidateMS: number
  }) {
    this.maxAge = maxAge
    this.forceValidate = forceValidate
    this.staleWhileRevalidateMS = staleWhileRevalidateMS
  }

  canIUseCache(lastUpdatedMS?: number): boolean {
    if (!lastUpdatedMS) return false

    const now = Date.now()
    const delta = now - lastUpdatedMS

    if (delta < 0) return false

    if (this.forceValidate) {
      return false
    }
    return delta < this.staleWhileRevalidateMS
  }
}
