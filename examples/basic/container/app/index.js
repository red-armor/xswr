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
    console.log("start send ------")
    const b = xs("/api/user", getInfo)
    const c = b.then(result => {
      console.log("user 2 ", Date.now(), result)
    })

    console.log("b ", b, c)

    // xs("/api/user/v2", getInfo).then(result => {
    //   console.log("use 3 ", Date.now(), result)
    // })
  }, 2000)

  return null
}
