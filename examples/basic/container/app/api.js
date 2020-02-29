let count = 0
export const getInfo = (url, params) => {
  if (url === "/api/info") {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (count++ < 2) {
          reject(new Error("testing"))
        }

        resolve({
          data: [
            {
              location: "shanghai"
            }
          ],
          ts: Date.now(),
          success: true
        })
      }, 1000)
    })
  }

  if (url === "/api/city") {
    const {city} = params
    const list = {
      shanghai: {a: 1}
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          data: list[city],
          ts: Date.now(),
          success: true
        })
      }, 1000)
    })
  }
}
