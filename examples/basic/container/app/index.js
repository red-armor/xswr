import {useXS, xs} from "xswr"
import {getInfo} from "./api"

export default () => {
  // const result = useXS(
  //   "/api/info",
  //   url => {
  //     return getInfo(url)
  //   },
  //   {
  //     onSuccess: result => {
  //       console.log("success ", result)
  //     },
  //     onError: err => {
  //       console.log("err ", err)
  //     },
  //     suppressUpdateIfEqual: false,
  //     poolingInterval: 1000
  //   }
  // )

  // const {data, isValidating, error} = result

  // // won't run until data is ready...
  // const city = useXS(
  //   () => {
  //     const {data} = result
  //     console.log("result ", result)
  //     return ["/api/city", {city: data.data[0].location}]
  //   },
  //   (url, params) => {
  //     return getInfo(url, params)
  //   },
  //   {
  //     staleWhileRevalidateMS: 1000
  //   },

  //   [result]
  // )

  // console.log("result ", data, isValidating, error)
  // console.log("city ", city.data)

  xs(
    "/api/info",
    url => {
      return getInfo(url)
    },
    {
      poolingInterval: 1000
    }
  ).then(
    result => {
      console.log("result ", result)
    },
    err => {
      console.log("errxxxxx ", err)
    }
  )

  return null
}
