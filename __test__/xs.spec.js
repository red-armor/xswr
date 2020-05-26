import {xs} from "../src"
import service from "./service"
import store from "../src/store"

beforeEach(function() {
  store.fetchers = {}
  // jest.useFakeTimers();
})

describe("test", () => {
  test("basic works", () => {
    return xs("/api/user", url => service(url)).then(result =>
      expect(result).toEqual({name: "liu"})
    )
  })

  test("reject error", () => {
    return xs(
      "/api/user",
      url => {
        return Promise.reject(new Error("failed"))
      },
      {
        retryInterval: 200
      }
    ).then(
      () => {},
      err => {
        expect(err.message).toEqual("failed")
      }
    )
  })

  // test("test ttl", () => {
  //   const startTime = Date.now()
  //   return xs("/api/user", url => service(url)).then(() => {
  //     const now = Date.now()
  //     const delta = now - startTime
  //     expect(delta).toBeGreaterThanOrEqual(300)
  //   })
  // })

  test("test ttl", () => {
    return xs("/api/user", url => service(url)).then(() => {
      const startTime = Date.now()
      return xs("/api/user", url => service(url)).then(() => {
        const delta = Date.now() - startTime
        expect(delta).toBeLessThan(300)
      })
    })
  })
})
