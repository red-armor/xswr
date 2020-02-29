import createFetcher from "./createFetcher"

class Store {
  constructor() {
    this.fetchers = {}
    this.currentComponentSubscriber = null
  }

  getFetcher({key, fetch, fetchArgs, config}) {
    if (!this.fetchers[key]) {
      this.fetchers[key] = createFetcher({
        key,
        fetch,
        config,
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
