// benefit from swr, but do not trigger component re-render..
// return a promise
import PromiseSubscriber from "./PromiseSubscriber"
import store from "./store"
import resolveArgs from "./resolveArgs"

export default (...args) => {
  const {config, key, fetchArgs, fetch} = resolveArgs(args)
  const stateFetcher = store.getFetcher({key, fetchArgs, fetch})
  const subscriber = new PromiseSubscriber({
    fetcher: stateFetcher,
    config
  })

  return subscriber.promise
}
