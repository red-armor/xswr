export const hideProperty = function(object, property) {
  Object.defineProperty(object, property, {
    configurable: false,
    enumerable: false
  })
}

export const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
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
export const toString = Function.call.bind(Object.prototype.toString)

export const generateKey = () => {}

export const thenDescriptor = Object.getOwnPropertyDescriptor(
  Promise.prototype,
  "then"
)
export const catchDescriptor = Object.getOwnPropertyDescriptor(
  Promise.prototype,
  "catch"
)
export const finallyDescriptor = Object.getOwnPropertyDescriptor(
  Promise.prototype,
  "finally"
)
