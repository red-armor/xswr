import React, {useState, useRef} from "react"
import {xs} from "xswr"

const initData1 = () =>
  xs(
    "/api/info/v4",
    url =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                location: "shanghai_cache"
              },
              {
                location: "beijing_cache"
              },
              {
                location: "nanjing_cache"
              }
            ],
            ts: Date.now(),
            success: true
          })
        }, 1000)
      }),
    {
      initialValue: {
        data: [
          {
            location: "shanghai_222"
          },
          {
            location: "beijing_222"
          },
          {
            location: "nanjing_222"
          }
        ]
      }
    }
  )

const initData2 = () =>
  xs(
    "/api/info/v3",
    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                location: `shanghai_cache1`
              },
              {
                location: `beijing_cache1`
              },
              {
                location: `nanjing_cache1`
              }
            ],
            ts: Date.now(),
            success: true
          })
        }, 2000)
      }),
    {
      staleWhileRevalidateMS: 10,
      onInitial: () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({
              data: [
                {
                  location: `shanghai_initialValue`
                },
                {
                  location: `beijing_initialValue`
                },
                {
                  location: `nanjing_initialValue`
                }
              ],
              ts: Date.now(),
              success: true
            })
          }, 200)
        })
    }
  )

export default () => {
  const [state, resolve] = useState(null)
  const [err, reject] = useState(null)
  const initRef = useRef(false)

  const [state2, resolve2] = useState(null)
  const [err2, reject2] = useState(null)

  if (!initRef.current) {
    initData1().then(resolve, reject)
    initData2().then(resolve2, reject2)
    initRef.current = true
  }

  return (
    <div>
      <h3>Group 1</h3>
      {!!err && <div>{err.message}</div>}
      {!!state &&
        state.data.map(({location}) => <div key={location}>{location}</div>)}
      {<h3>Group 2</h3>}
      {!!err2 && <div>{err2.message}</div>}
      {!!state2 &&
        state2.data.map(({location}) => <div key={location}>{location}</div>)}
    </div>
  )
}
