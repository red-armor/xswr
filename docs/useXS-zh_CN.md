[English](./useXS.md) | 简体中文

# useXS

_React Hooks remote data fetching method_

## Quick Start

```js
import {useXS} from "xswr"

function Account() {
  const account = useXS("/api/account", fetcher, {
    shouldComponentUpdate: false
  })

  const assets = useXS(
    () => {
      const {assetsId} = account.data
      return ["/api/assets", {id: assetsId}]
    },
    (url, params) => {
      return fetch(url, params)
    },
    [account]
  )

  const {data, error, isValidating} = assets

  if (error) return <div>error</div>
  if (isValidating) return <div>loading</div>
  if (data) return <div>{data}</div>
}
```

1. `shouldComponentUpdate`即使`/api/account`获取到数据也不会对当前组件进行刷新
2. `["/api/assets", {id: assetsId}]`是 useXS 的第一个参数，可以是`string`, `array`或者返回`string`或者`array`的函数；它最终会被作为`fetcher`的实参进行使用
3. `[account]`表示的是依赖关系，也就是说`assets`中的`url`或者`params`使用到了`account`中的值；

## Usage

```js
const {data, error, isValidating, clearPooling, isPooling} = useXS(
  key,
  fetcher,
  config,
  deps
)
```

### Return Value

#### data

1. 如果有缓存数据的话，首先返回缓存数据
2. 判断是否存在正在执行的请求；
   1. 如果请求正常返回，会在请求结束以后对 data 进行更新
   2. 如果不存在，判断当前的缓存数据是否可用
      1. 如果可用，处理结束
      2. 如果不可能，开始验证请求，并且等待请求结束进行数据更新

#### error

1. 如果请求结束，并且报错的话
   1. 判断是否可以进行重试
      1. 如果可以重试，则重新发起请求，并且等待返回状态
      2. 如果说没有重试机会，则设置 error 为当前处理的错误信息

#### isValidating

请求发送开始，直到拿到结果或者说重试次数完成都被认为是`is validating`.

#### clearPooling

当存在轮询操作时，可以通过这个方法结束掉轮询处理

#### isPooling

如果说`poolingInterval !== 0`的话，排除第一次请求以及它会存在的重试；接下来的状态它一直为`true`

### Params

#### key

唯一标识 fetcher 的字段，最好是`url`和`params`的组合；可以是`string`，`array`或者说返回`string/array`的函数。函数的场景一般是针对`url`或者`params`是一个`runtime`的值

#### fetcher

返回`Promise`的函数，一般情况就是指`Ajax`请求；字段`key`会给他提供一个(`url`)或者两个参数(`url`, `params`)

#### config

1. `staleWhileRevalidateMS=5 * 60 * 1000`，指定 cache 过期以后，还能够使用的毫秒数
2. `poolingInterval=0`, 轮询间隔毫秒数
3. `retryMaxCount=3`，最多重试的次数
4. `retryInterval=1000`，重试的基数时间间隔毫秒数
5. `suppressUpdateIfEqual=true`，当获取到数据以后，会进行新旧值的对比；默认情况下，如果说相等的话，依赖它的请求不会再触发
6. `shouldComponentUpdate`，即使 data 发生变化也不触发组件的重新渲染，用来优化请求存在依赖关系时造成的无效渲染消耗
7. `onSuccess`, 如果请求正常返回，则会直接被调用；如果报错，会在重发请求正常返回时进行调用
8. `onError`, 如果请求失败，并且重试结束，依旧返回报错时进行调用

#### deps

指定当前请求存在的依赖关系，它的值需要是`useXS`返回的 result。使用时有下面的注意点

1. 当存在依赖时，`key`需要是一个函数，否则直接使用`undefined`值会报错
2. 因为渲染控制的约束，result 的解构只能发生在`key`函数中；否则如果`deps`设置了`shouldComponentUpdate=false`的话，在`key`函数中拿不到最新的值；

下面的例子存在的问题是，即使因为`shouldComponentUpdate`的设置，`account`发生了变化，即使`xswr`可以自动触发`assets`对应的函数调用，但是在`keyFn`中拿到的`data`依旧是旧值比如 undefined，然后就会报错。具体写法参考[quick-start](#quick-start)

```js
function Account() {
  const account = useXS("/api/account", fetcher, {
    shouldComponentUpdate: false
  })

  const {data} = account

  const assets = useXS(
    () => {
      const {assetsId} = data
      return ["/api/assets", {id: assetsId}]
    },
    (url, params) => {
      return fetch(url, params)
    },
    [account]
  )

  const {data, error, isValidating} = assets

  if (error) return <div>error</div>
  if (isValidating) return <div>loading</div>
  if (data) return <div>{data}</div>
}
```

## FAQ

### 与`swr`相比解决的问题和区别

相同点：

1. 提供 cache，retry 和 pooling 在前端的一个易用性解决方案
2. 可以搭配 React Hooks 使用，当数据更新时触发组件的渲染
3. 当请求存在依赖时，提供解决依赖问题的方案

不同点：

1. 在处理 deps 的方式上，为了准确的知道接口之间的依赖关系，从而实现对附属接口的调用，xswr 使用了类似`useEffect`中对依赖的书写方式

优点：

1. 机制上的优化，`config`是隔离的，fetcher 只是一个数据提供方，当需要使用数据时，只需插到对应的 fetcher 上即可（此过程会存在触发数据验证的处理)。
2. 渲染控制的优化，当接口之间存在数据依赖时，如果页面的展示只跟请求`A`的字段有关，那么它的所有依赖接口其实只是为了丰富请求`A`的请求数据，这些依赖接口如果触发了页面的重新渲染的话，其实就是对性能的浪费。

缺点：

1. 对 suspense 的支持
2. 对于 page 上比如视窗，滚动等优化处理
3. 对网络状态的支持
4. 对页面 prefetch 的支持
