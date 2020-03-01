[English](./README.md) | 简体中文

# xswr

_A data fetching solution for React Hooks and Imperative Ajax request_

[![npm version](https://img.shields.io/npm/v/xswr.svg?style=flat)](https://www.npmjs.com/package/xswr) [![NPM downloads](https://img.shields.io/npm/dm/xswr.svg?style=flat-square)](http://www.npmtrends.com/xswr) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Introduction

swr(steal-while-revalidating)借鉴于[swr](https://github.com/zeit/swr)和它文档中提到的[HTTP RFC 5861](https://tools.ietf.org/html/rfc5861).对于一个前端页面能够很好的使用 cache, retry 机制的话，在用户体验上会有不错的效果。和[swr](https://github.com/zeit/swr)相比的话，xswr 在使用方式和实现策略上有下面一些不同

1. **使用场景:** 适用于 React Hooks 或者 Promise-based Ajax 请求
2. **配置的隔离:** fetcher 是共享的，config 是互相隔离
3. **渲染控制:** 在 React Hooks，可以通过配置化的方式决定是否在数据更新时重新渲染
4. **使用简单:** 对 Promise-based Ajax 链式请求，retry 和 pooling 会被自动执行

## Installation

With `npm`

```bash
npm install xswr
```

With `yarn`

```bash
yarn add xswr
```

## Usage

1. [useXS - React Hooks solution](./docs/useXS-zh_CN.md)
2. [xs - Promise-based Ajax solution](./docs/xs-zh_CN.md)
