import React from "react"
import {useXS} from "xswr"
import {getInfo} from "./api"

export default () => {
  const result = useXS("/api/user", getInfo)
  console.log("result ", result.data)

  return null
}
