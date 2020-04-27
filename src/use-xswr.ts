// @ts-ignore
import {useEffect, useCallback, useState, useRef} from "react"
import ComponentSubscriber from "./ComponentSubscriber"
import resolveArgs from "./resolveArgs"
import Scope from "./Scope"
import {createHiddenProperty, USE_XSWR} from "./commons"
import {useResult} from "./interface"

const STATE = USE_XSWR

// last one mayBe deps...
export default (...args: any[]): useResult => {
  const {fetchArgs, fetch, config, deps} = resolveArgs(args)
  const {shouldComponentUpdate, suppressUpdateIfEqual, ...restConfig} = config

  const scopeRef = useRef()
  if (!scopeRef.current) {
    scopeRef.current = new Scope({
      ...restConfig,
      cacheKey: ""
    })
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
      scope: scopeRef.current,
      shouldComponentUpdate,
      suppressUpdateIfEqual
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
      },
      error: {
        get() {
          return subscriberRef.current.getError()
        }
      },
      isValidating: {
        get() {
          return subscriberRef.current.getIsValidating()
        }
      },
      clearPooling: {
        get() {
          return subscriberRef.current.clearPooling.bind(subscriberRef.current)
        }
      },
      isPooling: {
        get() {
          return subscriberRef.current.getIsPooling()
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
