import React from "react"
import {useXS} from "xswr"
import {getInfo} from "./api"

export default () => {
  const result = useXS("/api/info", url => {
    return getInfo(url)
  })
  const {data} = result

  // won't run until data is ready...
  const {city} = useXS(
    () => {
      console.log("hello")
      return ["/api/city", {city: data[0].location}]
    },
    args => {
      const [url, params] = args
      return getInfo(url, params)
    },
    [result]
  )
  console.log("data ", data, city)
  return null
}
