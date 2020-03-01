[English](./xs.md) | 简体中文

# xs

_Remote data fetching solution for Promise-based Ajax request chain_

## Quick Start

```js
import {xs} from 'xswr'
import service from './service'

const fetchAssetInfo() {
  xs("/api/account", fetcher, {
    staleWhileRevalidateMS: 1000,
    poolingInterval: 1000,
  }).then(account => {
    const {assetsId} = account.data

    return xs(["/api/assets", {id: assetsId}], (url, params) => {
      return fetch(url, params)
    })
  }).then(assets => {
    // handle assets
  }).catch(err => {
    // handle error
  })
}
```

## Usage

```js
const promise = xs(key, fetcher, config)
```

### Return Value

#### promise

`promise` 是`ResumablePromise`的一个实例，`ResumablePromise`基本上按照遵从[Promises/A+](https://github.com/promises-aplus/promises-spec)标准，但是为了实现重新执行的机制进行了一定程度的定制化支持。但是在使用方式上支持`then`, `catch`和`finally`等链式的基本操作。

在进行`onFulfilled`和`onRejected`上它遵照下面的原则

#### onFulfilled

1. 如果有缓存数据的话，首先 resolve 缓存数据
2. 判断是否存在正在执行的请求；
   1. 如果存在 data 会在请求结束，再次调用 resolve 操作，实现下游引用结果的更新
   2. 如果不存在，判断当前的缓存数据是否可用
      1. 如果可用，处理结束
      2. 如果不可能，开始验证请求，并且等待请求结束进行数据更新

#### onRejected

1. 如果请求结束，并且报错的话
   1. 判断是否可以进行重试
      1. 如果可以重试，则重新发起请求，并且等待返回状态
      2. 如果说没有重试机会，则设置 error 为当前处理的错误信息

### Params

#### key

唯一标识 fetcher 的字段，最好是`url`和`params`的组合；可以是`string`，`array`或者说返回`string/array`的函数。

#### fetcher

返回`Promise`的函数，一般情况就是指`Ajax`请求；字段`key`会给他提供一个(`url`)或者两个参数(`url`, `params`)

#### config

1. `staleWhileRevalidateMS=5 * 60 * 1000`，指定 cache 过期以后，还能够使用的毫秒数
2. `poolingInterval=0`, 轮询间隔毫秒数
3. `retryMaxCount=3`，最多重试的次数
4. `retryInterval=1000`，重试的基数时间间隔毫秒数
5. `suppressUpdateIfEqual=true`，当获取到数据以后，会进行新旧值的对比；默认情况下，如果说相等的话，依赖它的请求不会再触发
