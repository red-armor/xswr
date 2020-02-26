import React from "react"
import {useXS, xswr as xs} from "xswr"
import {getInfo} from "./api"
import ResumablePromise from "xswr/src/ResumablePromise"
console.log("R ", ResumablePromise)

export default () => {
  const promise = new ResumablePromise()
  console.log("promise ", promise)
  const b = promise.then(result => {
    console.log("result ", result)
  })
  console.log("b ", b)
  promise.resolve(10)

  // const result = useXS("/api/user", getInfo)
  // console.log("result ", result.data)

  // xs("/api/user", getInfo).then(result => {
  //   console.log("user 1 ", result)
  // })

  // setTimeout(() => {
  //   const start = Date.now()
  //   const b = xs("/api/user", getInfo)
  //   const f = b
  //     .then(result => {
  //       console.log("user 2 ", Date.now() - start, result)
  //       return 3
  //     })
  //     .then(result => {
  //       console.log("after user 2", result)
  //       throw new Error("user 2 abort")
  //     })
  //     .then(
  //       () => {},
  //       () => {
  //         console.log("i am in reject")
  //         return "second"
  //       }
  //     )
  //     .catch(err => {
  //       console.log("catcher ")
  //       return 7
  //     })
  //     .then(result => {
  //       console.log("run after catch", result)
  //     })

  //   f.finally(() => {
  //     console.log("user 2 finish")
  //   })

  //   const e = b.then(result => {
  //     console.log("user 4 ", Date.now() - start, result)
  //   })
  //   e.finally(() => {
  //     console.log("user 4 finished")
  //   })

  //   b.hooks.onFulfilled({a: 1})

  //   xs("/api/user/v2", getInfo).then(result => {
  //     console.log("use 3 ", Date.now(), result)
  //   })
  // }, 2000)

  return null
}
