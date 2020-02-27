import {useEffect, useCallback, useState, useRef} from "react"
import store from "./store"
import Base from "./Base"
import resolveArgs from "./resolveArgs"
import Scope from "./Scope"

export default (...args) => {
  const {key, fetchArgs, fetch, config} = resolveArgs(args)
  const stateFetcher = store.getFetcher({key, fetchArgs, fetch})
  const [, setState] = useState(0)
  const scope = new Scope(config)
  const update = useCallback(() => setState(Date.now()), [])
  const base = useRef(
    new Base({
      update,
      scope,
      fetcher: stateFetcher
    })
  )

  useEffect(() => {
    stateFetcher.addSubscriber(base.current)
    return () => base.current.teardown()
  }, [stateFetcher.getProp("finalized")])

  const resultRef = useRef(
    Object.defineProperties(
      {},
      {
        data: {
          get() {
            const {currentBase} = store
            if (currentBase && currentBase !== base) {
              base.current.addDeps(currentBase)
            }
            return stateFetcher.getData()
          }
        }
      }
    )
  )

  return resultRef.current
}

// trigger: call function only
// use-xswr will trigger component re-render...
// useXSBailResult: return value only
