export const getInfo = (url, params) => {
  if (url === "/api/info") {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              location: "shanghai"
            }
          ],
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
          success: true
        })
      }, 1000)
    })
  }
}
