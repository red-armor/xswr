import {useEffect, useCallback, useState, useRef} from "react"
import store from "./store"
import ComponentSubscriber from "./ComponentSubscriber"
import resolveArgs from "./resolveArgs"
import Scope from "./Scope"

export default (...args) => {
  const {key, fetchArgs, fetch, config} = resolveArgs(args)
  const scopeRef = useRef(new Scope(config))

  const [, setState] = useState(0)
  const updater = useCallback(() => setState(Date.now()), [])

  const subscriberRef = useRef(
    new ComponentSubscriber({
      key,
      updater,
      fetch,
      fetchArgs,
      scope: scopeRef.current
    })
  )
  store.currentComponentSubscriber = subscriberRef.current

  useEffect(() => {
    return () => subscriberRef.current.teardown()
  }, [])

  const resultRef = useRef(
    Object.defineProperties(
      {},
      {
        data: {
          get() {
            const {currentComponentSubscriber} = store
            if (
              currentComponentSubscriber &&
              currentComponentSubscriber !== subscriberRef.current
            ) {
              subscriberRef.current.addDeps(currentBase)
            }
            return subscriberRef.getData()
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
