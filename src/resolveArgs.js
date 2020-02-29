const defaultConfig = {
  immediately: false,
  poolInterval: 0,

  // for cache strategy usage
  maxAge: 0,
  minThresholdMS: 300,
  staleWhileRevalidateMS: 5 * 60 * 1000,

  poolInterval: 0
}

export default args => {
  const key = args[0]
  const fetchArgs = [].concat(key)
  const fetch = args[1]
  const config = args[2] || {}

  return {
    key,
    fetch,
    fetchArgs,
    config: {...defaultConfig, ...config}
  }
}
