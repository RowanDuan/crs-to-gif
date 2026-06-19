# CRS Project

## 功能

- 上传 `.crs` 动画文件（最多 5 个）
- 解析并转换为 GIF 预览与下载

## 开发

```bash
pnpm install
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 目录结构

```
app/page.tsx                    # CRS 页面入口（根路由 /）
components/TransformCrs/        # 上传与转换 UI
lib/crsToGif.ts                 # CRS 解析与 GIF 编码
types/gifenc.d.ts               # gifenc 类型声明
```
