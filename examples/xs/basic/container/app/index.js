import React, {useRef} from "react"
import UseCacheValue from "./UseCacheValue"
import ForceValidate from "./ForceValidate"
import LessThanTimeout from "./LessThanTimeout"
import GreaterThanTimeout from "./GreaterThanTimeout"

export default () => {
  const containerStyleRef = useRef({
    display: "flex",
    flexDirection: "row"
  })

  const wrapperStyleRef = useRef({
    width: "220px",
    height: "500px",
    marginRight: "40px",
    padding: "20px",
    borderRadius: 8,
    border: "1px solid #eee"
  })

  return (
    <div style={containerStyleRef.current}>
      <div style={wrapperStyleRef.current}>
        <h2>use cache value</h2>
        <UseCacheValue />
      </div>

      <div style={wrapperStyleRef.current}>
        <h2>force validate value</h2>
        <ForceValidate />
      </div>

      <div style={wrapperStyleRef.current}>
        <h2>less than timeout</h2>
        <LessThanTimeout />
      </div>

      <div style={wrapperStyleRef.current}>
        <h2>greater than timeout</h2>
        <GreaterThanTimeout />
      </div>
    </div>
  )
}
