export const getInfo = () => {
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
    }, 5000)
  })
}
