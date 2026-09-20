# 原型库维护规范

## 结构与唯一数据源
- 这是原生 HTML/CSS/JavaScript 静态站点，GitHub Pages 从 main 分支根目录发布。无需数据库、npm 或构建框架。
- `catalog.json` 是项目中文名、原型中文名、入口、描述和更新时间的唯一数据源；首页不得硬编码原型列表。
- 项目目录使用 `序号-英文小写名称`，原型目录使用英文小写和连字符：`项目 id/原型 id/index.html`。
- 已发布 id 和路径保持稳定；中文名称可以直接改配置。不可擅自删除旧目录和链接。

## 新增与更新流程
1. 阅读 catalog.json，确定原型所属项目；无法判断归属时询问用户。
2. 将原型及资源放进对应目录，使用相对链接，不使用以 `/` 开头的站点根路径，确保 GitHub Pages 子路径可用。
3. 在项目 prototypes 中添加 id、name、description、entry、updatedAt。日期使用亚洲/上海时区的实际内容更新日期（YYYY-MM-DD），不要仅因首页改版修改所有日期。
4. 多端或附加页面写入 pages 数组，每项含 name 和 entry；entry 相对当前原型目录。不要为附加页面重复登记一个原型。
5. 新增项目时添加 projects 项（id、name、description、prototypes），空项目保留 .gitkeep。
6. 首页自动按更新时间倒序取 6 项；同一天按配置顺序。项目展示顺序跟随 projects 数组。
7. 执行 `python3 scripts/check_catalog.py`，通过 HTTP 服务验证首页、搜索、空项目、所有入口和移动端布局。
8. 用户授权发布后提交并推送 main；检查 GitHub Pages 部署结果。禁止将令牌、个人敏感信息或本地临时文件提交。

## 历史兼容
- legacy 数组仅维护既有历史入口（name、path），新原型必须归入 projects。
- 旧中文目录暂时保留用于兼容已分享的地址；当前维护入口为新的英文目录。
- 更新原型时同步维护描述和 updatedAt，不需修改首页渲染代码。
