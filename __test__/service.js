export default url => {
  if (url === "/api/user") {
    return new Promise(resolve => {
      setTimeout(() => resolve({name: "liu"}), 300)
    })
  }
}
