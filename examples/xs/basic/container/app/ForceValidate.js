import React, {useState, useRef} from "react"
import {xs} from "xswr"
import {getInfo} from "./api"

const initData = () =>
  xs("/api/info/v2", url => getInfo(url), {
    forceValidate: true
  })

export default () => {
  const [state, resolve] = useState(null)
  const [err, reject] = useState(null)
  const startTime = useRef(Date.now())
  const endTime = useRef(null)
  const delta = useRef(null)
  const initRef = useRef(false)

  const [state2, resolve2] = useState(null)
  const [err2, reject2] = useState(null)
  const startTime2 = useRef(null)
  const endTime2 = useRef(null)
  const delta2 = useRef(null)
  const updated = useRef(null)

  if (!initRef.current) {
    initData().then(resolve, reject)
    initRef.current = true
  }

  if ((err || state) && !endTime.current) {
    endTime.current = Date.now()
    delta.current = endTime.current - startTime.current

    initData().then(resolve2, reject2)
    startTime2.current = Date.now()
  }

  if (endTime2.current) {
    updated.current = Date.now()
  }

  if ((err2 || state2) && !endTime2.current) {
    endTime2.current = Date.now()
    delta2.current = endTime2.current - startTime2.current
  }

  return (
    <div>
      <h3>Group 1</h3>
      {startTime.current && <div>{`fetch start at ${startTime.current}`}</div>}
      {endTime.current && <div>{`fetch finish at ${endTime.current}`}</div>}
      {delta.current && <div>{`delta ms ${delta.current}`}</div>}
      {!!err && <div>{err.message}</div>}
      {!!state &&
        state.data.map(({location}) => <div key={location}>{location}</div>)}

      {startTime2.current && <h3>Group 2</h3>}
      {startTime2.current && (
        <div>{`fetch start at ${startTime2.current}`}</div>
      )}
      {endTime2.current && <div>{`fetch finish at ${endTime2.current}`}</div>}
      {updated.current && <div>{`updated at ${updated.current}`}</div>}
      {endTime2.current && <div>{`delta ms ${delta2.current}`}</div>}
      {updated.current && (
        <div>{`update delta ms ${updated.current - startTime2.current}`}</div>
      )}
      {!!err2 && <div>{err2.message}</div>}
      {!!state2 &&
        state2.data.map(({location}) => <div key={location}>{location}</div>)}
    </div>
  )
}
