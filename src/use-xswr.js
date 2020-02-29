import {useEffect, useCallback, useState, useRef} from "react"
import store from "./store"
import ComponentSubscriber from "./ComponentSubscriber"
import resolveArgs from "./resolveArgs"
import Scope from "./Scope"
import {createHiddenProperty, USE_XSWR} from "./commons"

const STATE = USE_XSWR

// last one mayBe deps...
export default (...args) => {
  const {fetchArgs, fetch, config, deps} = resolveArgs(args)

  const scopeRef = useRef()
  if (!scopeRef.current) {
    scopeRef.current = new Scope(config)
  }

  const [, setState] = useState(0)
  const updater = useCallback(() => setState(Date.now()), [])

  const subscriberRef = useRef()
  if (!subscriberRef.current) {
    subscriberRef.current = new ComponentSubscriber({
      updater,
      fetch,
      fetchArgs,
      deps,
      scope: scopeRef.current
    })
  }

  const resultRef = useRef()
  if (!useRef.current) {
    resultRef.current = createHiddenProperty({}, STATE, subscriberRef.current)
    Object.defineProperties(resultRef.current, {
      data: {
        get() {
          return subscriberRef.current.getData()
        }
      }
    })
  }

  useEffect(() => {
    return () => {
      subscriberRef.current.teardown()
    }
  }, [])

  return resultRef.current
}

// trigger: call function only
// use-xswr will trigger component re-render...
// useXSBailResult: return value only
