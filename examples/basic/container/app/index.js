import React from "react"
import {useXS} from "xswr"
import {getInfo} from "./api"

export default () => {
  const {data} = useXS("/api/info", url => {
    return getInfo(url)
  })
  console.log("data ", data)
  return null
}
