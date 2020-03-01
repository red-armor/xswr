English | [简体中文](./xs-zh_CN.md)

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
