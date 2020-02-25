import React from "react"
import {useXS, xswr as xs} from "xswr"
import {getInfo} from "./api"

export default () => {
  // const result = useXS("/api/user", getInfo)
  // console.log("result ", result.data)

  xs("/api/user", getInfo).then(result => {
    console.log("user 1 ", result)
  })

  setTimeout(() => {
    const start = Date.now()
    const b = xs("/api/user", getInfo)
    const f = b
      .then(result => {
        console.log("user 2 ", Date.now() - start, result)
        return 3
      })
      .then(result => {
        console.log("after user 2", result)
      })

    f.finally(() => {
      console.log("user 2 finish")
    })

    const e = b.then(result => {
      console.log("user 4 ", Date.now() - start, result)
    })
    e.finally(() => {
      console.log("user 4 finished")
    })

    console.log("e ", e, f)

    b.hooks.onFulfilled({a: 1})

    xs("/api/user/v2", getInfo).then(result => {
      console.log("use 3 ", Date.now(), result)
    })
  }, 2000)

  return null
}
