import React, {useRef} from "react"
import {useXS} from "xswr"
import {getInfo} from "./api"

export default () => {
  const result = useXS("/api/info/v5", url => getInfo(url), {
    initialValue: {
      data: [
        {
          location: `shanghai_initialValue_1`
        },
        {
          location: `beijing_initialValue_2`
        },
        {
          location: `nanjing_initialValue_3`
        }
      ]
    }
  })

  const result2 = useXS("/api/info/v5", url => getInfo(url), {
    onInitial: () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: [
              {
                location: `shanghai_initialValue4`
              },
              {
                location: `beijing_initialValue5`
              },
              {
                location: `nanjing_initialValue6`
              }
            ]
          })
        }, 100)
      })
  })

  const {data: state, error: err} = result
  const {data: state2, error: err2} = result2

  return (
    <div>
      <h3>Group 1</h3>
      {!!err && <div>{err.message}</div>}
      {!!state &&
        state.data &&
        state.data.map(({location}) => {
          return <div key={location}>{location}</div>
        })}
      <h3>Group 2</h3>
      {!!err2 && <div>{err2.message}</div>}
      {!!state2 &&
        state2.data.map(({location}) => <div key={location}>{location}</div>)}
    </div>
  )
}
