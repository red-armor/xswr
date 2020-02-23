import React from "react"
import {useXS} from "xswr"

export default () => {
  const [fetcher] = useXS("/api/user")
  console.log("fetcher ", fetcher)

  return null
}
