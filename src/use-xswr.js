import {useEffect, useCallback, useState, useRef} from "react"
import store from "./store"
import Base from "./Base"

export default (...args) => {
  const key = args[0]
  const fetchArgs = [].concat(key)
  const fetch = args[1]
  const config = args[2] | {}

  const stateFetcher = store.getFetcher({key, fetch, fetchArgs})
  const [, setState] = useState(0)
  const update = useCallback(() => setState(Date.now()), [])
  const base = useRef(new Base({update, fetcher: stateFetcher}))

  useEffect(() => {
    stateFetcher.addSubscription(base.current)
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
