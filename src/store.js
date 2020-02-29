import createFetcher from "./createFetcher"

class Store {
  constructor() {
    this.fetchers = {}
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
}

export default new Store()
