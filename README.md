# GitHub-proxy

一个基于 Cloudflare Workers 的公共 GitHub 资源代理。

## 支持

- GitHub Release 下载
- 仓库 archive
- Raw 文件
- Gist 文件
- 基础缓存
- CORS

## 用法

支持两种形式：

```text
https://your-domain/https://github.com/user/repo/releases/download/v1.0/app.zip
https://your-domain/user/repo/releases/download/v1.0/app.zip
```

## 本地开发

```bash
npm install
npm run dev
```

## 部署

```bash
npm run deploy
```

部署前请先配置 `wrangler` 的登录信息和自定义域名。

## 说明

当前版本只允许 GitHub 相关域名，不是通用代理。
