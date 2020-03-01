import React from "react"
import ReactDOM from "react-dom"
import App from "./container/app"

const Basic = () => (
  <div>
    hello world
    <App />
  </div>
)

ReactDOM.render(<Basic />, document.getElementById("app"))
