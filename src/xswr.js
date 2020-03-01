// benefit from swr, but do not trigger component re-render..
// return a promise
import PromiseSubscriber from "./PromiseSubscriber"
import store from "./store"
import resolveArgs, {buildKey} from "./resolveArgs"
import Scope from "./Scope"

export default (...args) => {
  const {config, fetchArgs, fetch} = resolveArgs(args)
  const key = buildKey(fetchArgs[0], fetchArgs[1])
  const stateFetcher = store.getFetcher({key, fetchArgs, fetch})
  const scope = new Scope(config)

  const subscriber = new PromiseSubscriber({
    fetcher: stateFetcher,
    config,
    scope
  })

  return subscriber.promise
}
