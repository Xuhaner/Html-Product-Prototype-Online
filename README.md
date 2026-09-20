# 产品原型导航

公开地址：https://xuhaner.github.io/Html-Product-Prototype-Online/

纯静态站点，无数据库、无安装依赖。GitHub Pages 自动发布 main 分支根目录。

## 日常维护

编辑 `catalog.json` 管理英文路径与中文显示名。新增原型放在 `项目 id/原型 id/`，登记 `id`、`name`、`description`、`entries`、`updatedAt`、`updateNote`。全部入口统一登记到 `entries`（`name`、`path`），例如电脑端、移动端、管理端；路径相对原型目录。新项目增加一个 projects 条目即可。

`updatedAt` 是内容实际更新日期；首次纳入本导航的两个原型记为 2026-09-20。最近更新自动展示前 6 项，同日按配置顺序。首页和项目列表均自动生成。项目独立链接为 `project.html?id=01-guilan`，新增项目无需复制 HTML。`updateNote` 写本次真实变更，未填写则隐藏。

```sh
python3 scripts/check_catalog.py
node scripts/check_navigation.cjs
python3 -m http.server 8000
```

浏览器打开 http://localhost:8000 。不要直接双击 HTML，浏览器会限制读取 JSON。

提交并推送到 main 后，等待 GitHub Pages 部署完成再刷新网页。JSON 每次打开首页重新请求，线上更新仍受 Pages 发布和 CDN 缓存时间影响，不是实时推送。

详细 agent 扩展约定见 `AGENTS.md`。历史目录保留用于兼容已有链接；新内容只登记英文目录。
