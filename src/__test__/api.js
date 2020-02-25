export const getInfo = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        success: true
      })
    }, 1000)
  })
}
