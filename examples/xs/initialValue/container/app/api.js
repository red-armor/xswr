const counter = {}

export const getInfo = (url, params) => {
  if (url.startsWith("/api/info")) {
    const parts = url.split("/")
    const key = parts.pop()
    if (typeof counter[key] === "undefined") {
      counter[key] = -1
    }
    counter[key] += 1
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              location: `shanghai_${key}_${counter[key]}`
            },
            {
              location: `beijing_${key}_${counter[key]}`
            },
            {
              location: `nanjing_${key}_${counter[key]}`
            }
          ],
          ts: Date.now(),
          success: true
        })
      }, 1000)
    })
  }
}

export const getInfoV2 = (url, params) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            location: `shanghai_${url}`
          },
          {
            location: `beijing_${url}`
          },
          {
            location: `nanjing_${url}`
          }
        ],
        ts: Date.now(),
        success: true
      })
    }, 1000)
  })
}
