import createFetcher from "./createFetcher"

class Store {
  constructor() {
    this.fetchers = {}
    this.currentBase = null
  }

  getFetcher({key, fetch, fetchArgs}) {
    if (!this.fetchers[key]) {
      this.fetchers[key] = createFetcher({
        key,
        fetch,
        fetchArgs
      })
    }

    return this.fetchers[key]
  }

  addFetcher(fetcher) {
    const key = fetcher.getProp("key")
    this.fetchers[key] = fetcher
  }
}

export default new Store()
