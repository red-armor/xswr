import createFetcher from "./createFetcher"

class Store {
  constructor() {
    this.fetchers = {}
    this.currentComponentSubscriber = null
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

  setCurrent(subscriber) {
    this.currentComponentSubscriber = subscriber
  }
}

export default new Store()
