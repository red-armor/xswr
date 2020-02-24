// benefit from swr, but do not trigger component re-render..
// return a promise
import PromiseSubscriber from "./PromiseSubscriber"
import store from "./store"

export default (...args) => {
  const key = args[0]
  const fetchArgs = [].concat(key)
  const fetch = args[1]
  const config = args[2] | {}

  const stateFetcher = store.getFetcher({key, fetch, fetchArgs})
  console.log("state ", stateFetcher)
  const subscriber = new PromiseSubscriber({
    fetcher: stateFetcher
  })

  // stateFetcher.addPromiseSubscriber(subscriber)

  return subscriber.promise
}
