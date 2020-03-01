English | [简体中文](./useXS-zh_CN.md)

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
