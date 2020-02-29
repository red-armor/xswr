export const hideProperty = function(object, property) {
  return Object.defineProperty(object, property, {
    configurable: false,
    enumerable: false
  })
}

export const createHiddenProperty = (target, prop, value) => {
  return Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true
  })
}

export const createHiddenProperties = (target, value) => {
  const keys = Object.keys(value)
  keys.forEach(key => {
    createHiddenProperty(target, key, value[key])
  })
}

const hasSymbol = typeof Symbol !== "undefined" && Symbol.for

export const STATE = hasSymbol ? Symbol.for("__xswr_state_") : "__xswr_state_"
export const USE_XSWR = hasSymbol ? Symbol.for("__use-xswr__") : "__use-xswr__"
export const RESUMABLE_PROMISE = hasSymbol
  ? Symbol.for("__resumable_promise__")
  : "__resumable_promise__"

export const toString = Function.call.bind(Object.prototype.toString)

export const generateKey = () => {}
