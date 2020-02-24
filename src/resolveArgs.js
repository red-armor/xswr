const defaultConfig = {
  immediately: false,
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
