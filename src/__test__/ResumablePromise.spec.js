import ResumablePromise from "../ResumablePromise"

const resolve = jest.fn()
const reject = jest.fn()
const onCatch = jest.fn()
const onFinish = jest.fn()

beforeEach(function() {
  resolve.mockClear()
  reject.mockClear()
  onCatch.mockClear()
  onFinish.mockClear()
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

  test("catch", () => {
    const promise = new ResumablePromise()
    promise.catch(onCatch)
    promise.reject()
    expect(onCatch).toBeCalled()
  })

  test("catch after reject and passing reason", () => {
    const promise = new ResumablePromise()
    const chain = promise
      .then(
        result => result,
        err => {
          throw err
        }
      )
      .catch(reason => {
        expect(reason.message).toEqual("catch after reject")
      })
    promise.reject(new Error("catch after reject"))
    return chain
  })

  test("catch an return a value", () => {
    const promise = new ResumablePromise()
    const chain = promise
      .then(
        result => result,
        err => {
          throw err
        }
      )
      .catch(reason => {
        expect(reason.message).toEqual("catch after reject")
        return 4
      })
      .then(result => expect(result).toBe(4))
    promise.reject(new Error("catch after reject"))
    return chain
  })

  test("finish after catch", () => {
    const promise = new ResumablePromise()
    promise.catch(onCatch).finally(onFinish)
    promise.reject()
    expect(onCatch).toBeCalled()
    expect(onFinish).toBeCalled()
  })

  test("resolve value", () => {
    const promise = new ResumablePromise()
    promise.resolve(3)
    return expect(promise.then(result => result)).resolves.toEqual(3)
  })

  test("resolve value chain", () => {
    const promise = new ResumablePromise()
    const chain = promise.then(result => result)
    promise.resolve(3)
    return expect(chain).resolves.toEqual(3)
  })
})

describe("test rerun", () => {
  const promise = new ResumablePromise()
  let firstRef = true
  const chain = promise
    .then(result => result + 3)
    .then(result => {
      if (firstRef) expect(result).toBe(7)
      else expect(result).toBe(10)
    })

  test("first time run", () => {
    promise.resolve(4)
    return chain
  })

  test("second time run", () => {
    firstRef = false
    promise.resolve(7)
    return chain
  })
})
