import {toString} from "./commons"

const defaultConfig = {
  forceValidate: false,

  // for cache strategy usage
  maxAge: 0,
  staleWhileRevalidateMS: 5 * 60 * 1000,

  poolingInterval: 0,

  retryInterval: 1000,
  retryMaxCount: 3,

  shouldComponentUpdate: true,
  suppressUpdateIfEqual: true,

  initialValue: undefined,
  onInitial: undefined,
  onPersistance: undefined,
  stopIfResultEqual: true
}

export const buildKey = (url: string, params: object) => {
  const o: {params?: object; url: string} = {url}
  if (!url || url === "") throw new Error("url is required")
  if (params && toString(params) === "[object Object]") o.params = params

  return JSON.stringify(o)
}

export default (args: any[]) => {
  const key = args[0]
  const fetchArgs = [].concat(key)
  const fetch = args[1]
  const len = args.length

  if (typeof fetch !== "function") {
    throw new Error("The second param should be a function to fetch data")
  }

  let deps = []
  let config = {}

  const last = args[len - 1]
  const secondLast = args[len - 2]

  if (Array.isArray(last)) {
    deps = last
    if (toString(secondLast) === "[object Object]") {
      config = secondLast
    }
  } else if (toString(last) === "[object Object]") {
    config = last
  }

  return {
    key,
    fetch,
    fetchArgs,
    config: {...defaultConfig, ...config},
    deps
  }
}
