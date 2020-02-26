import ResumablePromise from "../ResumablePromise"

const resolve = jest.fn()
const reject = jest.fn()

beforeEach(function() {
  resolve.mockClear()
  reject.mockClear()
})

describe("basic", () => {
  test("resolve", () => {
    const promise = new ResumablePromise()
    promise.then(resolve, reject)
    promise.resolve(3)
    expect(resolve).toBeCalled()
    expect(() => expect(reject).toBeCalled()).toThrow()
  })

  test("reject", () => {
    const promise = new ResumablePromise()
    promise.then(resolve, reject)
    promise.reject("type error")
    expect(reject).toBeCalled()
    expect(() => expect(resolve).toBeCalled()).toThrow()
  })

  test("resolve value", () => {
    const promise = new ResumablePromise()
    promise.then(result => expect(result).toBe(3))
    promise.resolve(3)
  })
})

// describe("test", () => {
//   // https://github.com/facebook/jest/issues/3211
//   test("basic", done => {
//     xs("/api/user", getInfo).then(result => {
//       expect(result).toEqual({success: true})
//       expect(result).toEqual({success: false})
//     })

//     // jest.useFakeTimers();

//     setTimeout(() => {
//       const start = Date.now()
//       console.log("start ")
//       const b = xs("/api/user", getInfo)

//       const f = b
//         .then(result => {
//           console.log("xxxx")
//           // expect(result).toEqual({ success: true })
//           const delta = Date.now() - start
//           console.log("delta ", delta)

//           expect(delta).toBeNull()
//           expect(12).toBeLessThan(0)
//           return 3
//         })
//         .then(result => {
//           console.log("after user 2", result)
//           throw new Error("user 2 abort")
//         })
//         .then(
//           () => {},
//           () => {
//             console.log("i am in reject")
//             return "second"
//           }
//         )
//         .catch(err => {
//           console.log("catcher ")
//           return 7
//         })
//         .then(result => {
//           console.log("run after catch", result)
//         })

//       f.finally(() => {
//         console.log("user 2 finish")
//       })

//       const e = b.then(result => {
//         console.log("user 4 ", Date.now() - start, result)
//       })
//       e.finally(() => {
//         console.log("user 4 finished")
//       })

//       b.hooks.onFulfilled({a: 1})

//       xs("/api/user/v2", getInfo).then(result => {
//         console.log("use 3 ", Date.now(), result)
//       })
//       done()
//     }, 2000)

//     // jest.runAllTimers();
//   })
// })
