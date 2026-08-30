<div align="center">

# GitHub Proxy

一个基于 Cloudflare Workers 的轻量 GitHub 公共代理。

让 Release、源码压缩包、Raw 文件和 Gist 通过你自己的 Cloudflare 域名访问。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/y08lin4/GitHub-proxy)
[![GitHub license](https://img.shields.io/github/license/y08lin4/GitHub-proxy?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/y08lin4/GitHub-proxy?style=flat-square)](https://github.com/y08lin4/GitHub-proxy/stargazers)

[在线演示](https://github-proxy.linyu.qzz.io/)

</div>

## 项目简介

`GitHub Proxy` 是一个可以直接部署到 Cloudflare Workers 的公共 GitHub 资源代理。

它不需要数据库、服务器或管理后台。部署完成后，访问代理域名并在后面拼接 GitHub 资源地址即可使用。

```text
原始地址: https://github.com/user/repo/releases/download/v1.0/app.zip
代理地址: https://github-proxy.linyu.qzz.io/user/repo/releases/download/v1.0/app.zip
```

## 快速开始

### 一键部署

点击下面的按钮，登录 Cloudflare 并按照页面提示完成部署：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/y08lin4/GitHub-proxy)

部署完成后，Cloudflare 会提供一个 `workers.dev` 地址。你也可以在 Cloudflare Workers 的设置中绑定自己的域名。

### 手动部署

需要 Node.js 18 或更高版本，并准备好 Cloudflare 账号。

```bash
git clone https://github.com/y08lin4/GitHub-proxy.git
cd GitHub-proxy
npm install
npx wrangler login
npm run deploy
```

## 使用方式

代理支持完整 URL 和简写路径两种形式。

```text
https://github-proxy.linyu.qzz.io/https://github.com/user/repo/releases/download/v1.0/app.zip
https://github-proxy.linyu.qzz.io/user/repo/releases/download/v1.0/app.zip
```

常见用法：

```text
# Release 文件
https://github-proxy.linyu.qzz.io/user/repo/releases/download/v1.0/app.zip

# 仓库源码压缩包
https://github-proxy.linyu.qzz.io/user/repo/archive/refs/tags/v1.0.tar.gz

# Raw 文件
https://github-proxy.linyu.qzz.io/user/repo/raw/main/config.json

# Gist 文件
https://github-proxy.linyu.qzz.io/gist/user/123456789/raw/example.txt
```

访问代理域名根路径，可以查看简短的使用提示。

## 功能特性

- 基于 Cloudflare Workers，部署简单，运行成本低
- 仅代理 GitHub 相关域名，不开放任意网站转发
- 支持 GitHub Release、archive、Raw 和 Gist 资源
- 支持 `GET`、`HEAD` 和浏览器跨域访问
- 支持 GitHub 重定向和大文件流式传输
- 使用 Cloudflare Cache API 缓存成功响应
- 不需要数据库、账号系统或额外服务器

## 工作方式

```text
客户端
  │
  ▼
Cloudflare Worker
  ├─ 解析代理地址
  ├─ 校验 GitHub 域名
  ├─ 查询 Cloudflare 缓存
  └─ 流式请求 GitHub 并返回
```

项目默认允许以下上游域名：

```text
github.com
raw.githubusercontent.com
gist.githubusercontent.com
objects.githubusercontent.com
github-releases.githubusercontent.com
release-assets.githubusercontent.com
```

## 本地开发

```bash
npm install
npm run dev
```

默认会启动 Wrangler 本地开发服务。修改 `src/index.ts` 后，开发服务会自动重新加载。

部署前可以运行类型检查：

```bash
npm run build
```

## 项目结构

```text
.
├── src/
│   └── index.ts       # Worker 入口和代理逻辑
├── package.json       # 开发与部署脚本
├── tsconfig.json      # TypeScript 配置
├── wrangler.toml      # Cloudflare Workers 配置
├── LICENSE            # MIT License
└── README.md
```

## 注意事项

这是一个公开代理服务。部署后，任何知道域名的人都可以使用它访问公开 GitHub 资源。

- 当前版本不支持私有仓库和 GitHub Token
- 只允许 GitHub 相关域名，不是通用 HTTP 代理
- Cloudflare 和 GitHub 的访问限制仍然适用
- 公共服务可能产生 Worker 请求、CPU 和缓存相关费用
- 请根据自己的使用场景配置 Cloudflare 账户的用量提醒

## 参与贡献

欢迎提交 Issue 和 Pull Request：

1. Fork 本仓库
2. 创建功能分支
3. 提交修改并补充说明
4. 发起 Pull Request

在提交新功能前，建议先创建 Issue 讨论方案。

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
