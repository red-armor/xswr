import {PromiseLike} from "./interface"

export const hideProperty = function(object: object, property: string) {
  return Object.defineProperty(object, property, {
    configurable: false,
    enumerable: false
  })
}

export const createHiddenProperty = (
  target: object,
  prop: string | symbol | number,
  value: any
) => {
  return Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true
  })
}

export const createHiddenProperties = (target: object, value: any) => {
  const keys = Object.keys(value)
  keys.forEach(key => {
    createHiddenProperty(target, key, value[key])
  })
}

const hasSymbol = typeof Symbol !== "undefined" && Symbol.for

export const STATE: unique symbol = hasSymbol
  ? Symbol.for("__xswr_state_")
  : ("__xswr_state_" as any)
export const USE_XSWR: unique symbol = hasSymbol
  ? Symbol.for("__use-xswr__")
  : ("__use-xswr__" as any)
export const RESUMABLE_PROMISE: unique symbol = hasSymbol
  ? Symbol.for("__resumable_promise__")
  : ("__resumable_promise__" as any)

export const toString = Function.call.bind(Object.prototype.toString)

export const generateKey = () => {}

export const isPromiseLike = (fn?: PromiseLike): boolean =>
  !!fn && typeof fn === "object" && typeof fn.then === "function"
