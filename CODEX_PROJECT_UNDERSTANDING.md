# Codex 项目理解：TW Engineering Release

> 后续每次处理本项目的新功能或修复前，先阅读本文件，再结合当前需求查看对应源码和原始文档。

## 1. 项目定位

`TW_EngineeringRelease` 是一个运行在达索 3DEXPERIENCE / 3DDashboard 环境中的 Vue Widget，目标是复刻或增强 ENOXEngineer / Engineering Release 的核心功能。

主要业务对象是产品、零件、图纸、文档、材料、BOM 结构、修订版、成熟度状态和配置上下文。用户的期望不是普通 Web App，而是尽量贴近达索原生 Widget 的交互、接口链路和弹窗行为。

## 2. 技术栈与运行方式

- 前端：Vue 3 + TypeScript + Element Plus。
- 状态：Pinia。
- 构建：Vite，包管理使用 pnpm。
- 路由：Vue Router，Hash 模式。
- 国际化：vue-i18n，包含 zh-CN / en-US。
- 3DDashboard 接入：`@widget-lab/3ddashboard-utils`。
- 关键请求链路：`src/utils/ds-request.ts` 封装 `WAFData.authenticatedRequest`。
- 常用命令：`pnpm dev`、`pnpm build`、`pnpm type-check`、`pnpm lint`、`pnpm format`、`pnpm lint:stylelint`。

注意：`.windsurf/workflows/tw-engineering-release-lessons.md` 里有用户约定：不要为了历史 lint 问题主动大范围格式化或重构；修改完成后是否运行构建要结合用户当次要求。若需要验证，应优先说明或只做与本次改动相关的检查。

## 3. 关键目录

- `docs/`：按按钮和功能拆分的功能文档，主要覆盖 HomeView 和 PartDetailView 的交互、实现位置、API、注意事项。
- `.windsurf/workflows/`：开发流程、编码规范、达索 OOTB 命令调用方式、项目经验沉淀、Vue 最佳实践。
- `Interface/`：HAR、接口返回样例、需求与抓包分析资料。遇到接口复刻或参数不确定时优先查这里。
- `OOTBSources/`：达索原生 Widget 源码参考。复刻 OOTB 行为前要查对应源码。
- `src/views/`：页面和业务弹窗。
- `src/api/`：3DSpace、模型、协同、创作、文档等 API 封装。
- `src/composables/`：头部命令、生命周期命令、打开方式、结构视图、拖拽、导入导出、对话框等复用逻辑。
- `src/store/modules/`：`baseInfo`、`dialog`、`queryMode`。
- `src/plugins/ds-search-input.ts`：达索搜索入口封装，尤其要保留现有 `SearchUtils.inAppsSearch` 结构。

## 4. 核心页面

### HomeView

文件：`src/views/HomeView.vue`

负责首页导航和产品卡片操作：

- 最近、我的产品、打开搜索。
- 新产品、新零件。
- 产品卡片下拉菜单：打开、打开方式、比较、关系、锁定、解锁、删除、设置企业项目编号。
- 打开产品详情时通过 router 跳转到 `partDetail`，参数是 `physicalId`。
- “打开”功能依赖 `dsSearchInput(searchData.value, 'product', 'PSE', '', callback)`，回调里从 `physicalid / physicalId / id / objectId` 提取对象 ID。

### PartDetailView

文件：`src/views/PartDetailView.vue`

这是项目最大、最核心的页面，承载零件/产品详情和 BOM 结构：

- Header 操作：修订版、新修订版、新修订版源、新建分支、复制、删除、比较、关系、锁定、解锁、更新修订版、更新整个结构修订版。
- Create 工具区：新产品、新零件、新图纸、新形状表示、上传文档、现有产品/图纸/文档/材料、材料数量、插入重复项。
- Expand 工具区：展开、展开 N 层、展开全部、折叠全部。
- Structure View：缩进、平铺、叶节点、仅可制造、材料、引用、使用。
- Other：成熟度、复制产品、变形、实例数量、拆离、导出 CSV。
- 子 BOM 表格使用 `el-auto-resizer` + `el-table-v2`，数据通过扁平化树结构渲染。
- 用户偏好行级展开：只加载当前行下一层，不整表遮罩、不闪烁、不重刷整个表。

## 5. API 与请求原则

所有 3DSpace REST 请求默认必须走 `src/utils/ds-request.ts`，不要在组件里直接 `fetch` 或直接 `axios`。

请求原则：

- URL 通常是 `/resources/...?...tenant=OnPremise`。
- `ds-request.ts` 负责拼接 3DSpace base URL、注入认证和默认 `SecurityContext`。
- `SecurityContext` 相关接口经常需要同时出现在 header 和 query。
- `partDetailApi.ts` 是详情页 API 主入口，覆盖锁定/解锁、删除、成熟度、企业项目编号、reparent、实例数量、复制、变形、拆离等。
- `expandApi.ts` 是 BOM 展开和解析核心，尤其注意 `ds6w:isLastRevision` 可能返回 `TRUE`，判断时要忽略大小写。
- `searchApi.ts`、`recentApi.ts`、`documentApi.ts`、`spreadsheetImportApi.ts` 分别处理搜索、最近、文档、电子表格导入相关能力。

## 6. OOTB 命令复刻与 Patch 规则

很多生命周期功能不是纯 REST，而是调用达索原生 AMD 模块：

- `HistoryCmd`：修订版历史弹窗。
- `ReviseCmd`：新修订版。
- `ReviseFromCmd`：新修订版源。
- `NewBranchCmd`：新建分支。
- `DuplicateCmd` / `DuplicateWidget`：复制或插入重复项。

常见链路：

1. 从 `topWindow.require` / `topWindow.requirejs` / `window.requirejs` 加载达索 AMD 模块。
2. 构造达索期望的 selection node / context / widget data。
3. 必要时 patch `WAFData.authenticatedRequest` 或 OOTB Widget 原型方法，修正请求参数、标题、attributeList、响应字段。
4. patch 必须尽量局部、可识别、可恢复，使用类似 `__twPatchXxx` 的标记避免重复包装。
5. patch 里要 pass-through 原始参数，异常不能中断原始 OOTB 流程。

处理 OOTB 前优先查：

- `.windsurf/workflows/call-ootb-history-dialog.md`
- `docs/AI复刻达索Widget开发流程分享.md`
- `OOTBSources/`
- `Interface/` 中相关 HAR

## 7. Store 与全局状态

- `baseInfo.ts`：维护 `spaceUrl`、`searchUrl`、`securityContext`、`currentUser` 等平台基础信息。拿到 `securityContext` 后要同步给请求封装。
- `dialog.ts`：管理创建类弹窗、上下文、最后创建结果等。
- `queryMode.ts`：管理 index/db 查询模式，以及创建/关联等操作后的短期数据库模式切换。

创建、关联、复制等操作完成后，经验文档要求通常要切到数据库查询模式；如果有勾选行，优先强制展开并刷新被勾选行，没有勾选行则刷新根节点。

## 8. 功能文档索引

`docs/` 中的功能文档按页面和按钮命名：

- `button-homeview-*`：首页导航和卡片操作。
- `button-homeview-card-*`：产品卡片下拉菜单操作。
- `button-partdetail-header-*`：详情页 Header 操作。
- `button-partdetail-create-*`：详情页创建/插入类操作。
- `button-partdetail-expand-*`：展开和折叠操作。
- `button-partdetail-structureview-*`：结构视图模式。
- `button-partdetail-other-*`：成熟度、复制、变形、实例数量、拆离、导出 CSV 等。

后续实现某个按钮前，先读对应 `docs/button-...md`，再读相关源码。

## 9. 编码与修改约定

- 优先最小改动，先定位 root cause，不做无关重构。
- 不随意删除或替换用户已有达索核心逻辑。
- 不随意减少函数参数，尤其是 `dsSearchInput(searchData, openType, appName, CaId, callback)`。
- 不轻易替换达索搜索模块；当前 R2026 环境里某些 `DS/E6WCommonUI/...` 模块可能 404。
- Vue 文件优先 Composition API + `<script setup>`，但实际修改要尊重现有文件结构。
- API 新增逻辑放在 `src/api/`，业务复用逻辑放在 `src/composables/`，组件内只保留 UI 状态和交互编排。
- 避免泛用 `any`，但 3DDashboard / WAFData / OOTB 无类型外部 API 可局部使用并注明意图。
- 日志保持项目习惯：`[HomeView]`、`[PartDetailView]`、`[PartDetailAPI]` 等前缀。
- 修改大 Vue 文件后要仔细看 diff，防止格式化破坏模板、`||`、结束标签或 slot 语法。

## 10. 排障优先级

遇到问题时优先按以下路径查：

1. 当前功能对应的 `docs/button-*.md`。
2. `.windsurf/workflows/engineering-release-app-dev.md` 和 `tw-engineering-release-lessons.md`。
3. 相关源码：`HomeView.vue`、`PartDetailView.vue`、`partDetailApi.ts`、`expandApi.ts`、`ds-request.ts`、对应 composable。
4. `Interface/` 的 HAR 和返回样例。
5. `OOTBSources/` 的达索原生实现。

## 11. 我后续工作的固定动作

每次收到本项目的新功能、修复或排障请求时：

1. 先阅读本文件。
2. 判断需求属于 HomeView、PartDetailView、API、OOTB 命令、BOM 表格、搜索、成熟度、创建/插入、配置上下文中的哪一类。
3. 阅读对应 `docs/button-*.md` 或 `.windsurf/workflows/*.md`。
4. 再读当前相关源码，按既有模式做最小必要修改。
5. 修改后检查 diff；是否运行构建或 lint 取决于任务风险和用户当次要求。

