export default url => {
  if (url === "/api/user") {
    return new Promise(resolve => {
      setTimeout(() => resolve({name: "liu"}), 300)
    })
  }
  if (url === "/api/error") {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("err")), 300)
    })
  }
}
