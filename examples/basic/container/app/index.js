import {useXS} from "xswr"
import {getInfo} from "./api"

export default () => {
  const result = useXS("/api/info", url => {
    return getInfo(url)
  })

  const {data} = result

  // won't run until data is ready...
  const city = useXS(
    () => {
      const {data} = result
      console.log("result ", result)
      return ["/api/city", {city: data.data[0].location}]
    },
    (url, params) => {
      return getInfo(url, params)
    },
    [result]
  )
  console.log("data ", data, city.data, result)
  return null
}
