import {PromiseLike, Fetcher} from "./interface"

import createFetcher from "./createFetcher"

class Store {
  public fetchers: {
    [key: string]: Fetcher
  }

  constructor() {
    this.fetchers = {}
  }

  getFetcher({
    key,
    fetch,
    fetchArgs
  }: {
    key: string
    fetch: <T>() => PromiseLike<T>
    fetchArgs: any[]
  }) {
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
