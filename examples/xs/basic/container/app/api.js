let count = -1

export const getInfo = (url, params) => {
  if (url === "/api/info") {
    count++
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              location: `shanghai_${count}`
            },
            {
              location: `beijing_${count}`
            },
            {
              location: `nanjing_${count}`
            }
          ],
          ts: Date.now(),
          success: true
        })
      }, 1000)
    })
  }
}
