import resumablePromise from "../resumablePromise"

describe("test", () => {
  test("basic", () => {
    const p = resumablePromise()
    const t2 = p
      .then(
        result => {
          console.log("chain result", result)
          return result
        },
        err => {
          console.log("err", err)
        }
      )
      .then(result => {
        console.log("chain result 2 ", result)
      })

    // console.log(' p' , p)

    p.hooks.onFulfilled("testing")
    p.hooks.onFulfilled("hello")
    // t2.then(result => {
    //     console.log("chain result 2 ", result)
    //   })

    console.log("data : ", p)

    expect(true).toBe(true)
  })
})
