# TW Engineering Release 项目总结报告

## 一、项目概览

| 项 | 值 |
|---|---|
| 项目名 | TW_EngineeringRelease |
| 技术栈 | Vue 3 + TypeScript + Element Plus + Pinia + Vite |
| 运行环境 | 达索 3DEXPERIENCE R2026 3DDashboard (OnPremise) |
| 包管理 | pnpm |
| 构建 | `vue-tsc -b --noEmit && vite build` |
| 路由 | Hash 模式 (`createWebHashHistory`) |
| 状态管理 | Pinia (3 stores: baseInfo / dialog / queryMode) |
| 国际化 | vue-i18n (zh-CN / en-US) |
| 核心依赖 | `@widget-lab/3ddashboard-utils` (3DDashboard SDK) |

### 业务定位

复刻达索 ENOXEngineer (Engineering Release) 应用的核心功能，包括：
- 首页导航（最近、我的产品、打开搜索）
- 零件/产品详情页（BOM 结构、属性、成熟度、生命周期操作）
- 配置上下文管理
- 各种创建/插入/复制/修订操作

---

## 二、目录结构

```
TW_EngineeringRelease/
├── Interface/              # HAR 抓包文件、接口文档、需求分析
│   ├── *.har               # 网络请求抓包（reparent、duplicate、变形等）
│   ├── *.txt               # 接口返回值样例（expand、table、state 等）
│   └── *.md                # 需求文档、HAR 分析报告
│
├── docs/                   # 功能文档（54 个按钮/操作说明）
│   ├── button-homeview-*.md    # 首页按钮文档
│   ├── button-partdetail-header-*.md  # 详情页 header 按钮文档
│   ├── button-partdetail-create-*.md  # 创建类操作文档
│   ├── button-partdetail-expand-*.md  # 展开类操作文档
│   ├── button-partdetail-other-*.md   # 其他操作文档
│   └── button-partdetail-structureview-*.md  # 结构视图文档
│
├── .windsurf/
│   ├── workflows/          # 14 个工作流文件
│   │   ├── engineering-release-app-dev.md      # 核心开发排障指南
│   │   ├── tw-engineering-release-lessons.md   # 项目经验沉淀
│   │   ├── call-ootb-history-dialog.md         # OOTB 命令调用指南
│   │   ├── coding-guidelines.md                # 编码准则
│   │   ├── analyze-har.md                      # HAR 分析工作流
│   │   └── vue-*.md                            # Vue 最佳实践系列
│   └── skills/
│       └── skill-creator/
│
├── src/
│   ├── main.ts             # 入口：widget 生命周期、Pinia、Element Plus、i18n
│   ├── App.vue             # 根组件：RouterView + 全局对话框
│   ├── router/index.ts    # 2 条路由：/ 和 /part-detail/:physicalId
│   │
│   ├── views/              # 19 个页面/对话框组件
│   │   ├── HomeView.vue              # 首页 (66KB) - 导航、搜索、最近记录
│   │   ├── PartDetailView.vue        # 详情页 (276KB) - 核心巨文件
│   │   ├── InternalConfig.vue        # 配置上下文对话框
│   │   ├── NewProductDialog.vue      # 新建产品
│   │   ├── NewPartDialog.vue         # 新建零件
│   │   ├── NewDrawingDialog.vue      # 新建图纸
│   │   ├── ReplaceRevisionDialog.vue # 替换修订版
│   │   ├── UpdateRevisionDialog.vue  # 更新修订版
│   │   └── ... (其他对话框)
│   │
│   ├── api/                # API 封装层
│   │   ├── partDetailApi.ts          # 零件详情 API (55KB) - 最大 API 文件
│   │   ├── expandApi.ts              # 展开 API (62KB) - 展开解析核心
│   │   ├── documentApi.ts            # 文档 API
│   │   ├── recentApi.ts              # 最近记录 API
│   │   ├── searchApi.ts              # 搜索 API
│   │   ├── spreadsheetImportApi.ts   # 电子表格导入
│   │   ├── base.ts / api.ts / types.ts / index.ts
│   │   ├── authoring/               # 创作服务
│   │   ├── collab/                  # 协作服务
│   │   ├── modeler/                 # 建模服务
│   │   ├── vplm/                    # VPLM 服务
│   │   └── widget/                  # Widget 服务
│   │
│   ├── composables/        # 12 个组合式函数
│   │   ├── headerActions.ts          # Header 按钮命令分发
│   │   ├── lifecycleCommands.ts      # 生命周期命令（修订/分支/复制）
│   │   ├── openWith.ts               # 打开方式
│   │   ├── replaceRevision.ts        # 替换修订版
│   │   ├── structureView.ts          # 结构视图切换
│   │   ├── treeOperations.ts         # 树操作
│   │   ├── findInStructure.ts        # 结构内查找
│   │   ├── dragDrop.ts               # 拖拽
│   │   ├── deformDialog.ts           # 变形对话框
│   │   ├── dialogs.ts                # 对话框管理
│   │   ├── clipboard.ts              # 剪贴板
│   │   └── exportImport.ts           # 导入导出
│   │
│   ├── store/              # Pinia 状态管理
│   │   ├── baseInfo.ts               # spaceUrl / searchUrl / securityContext / currentUser
│   │   ├── dialog.ts                 # 对话框开关 / 创建上下文
│   │   └── queryMode.ts             # index/db 查询模式 + 3分钟倒计时
│   │
│   ├── utils/              # 工具函数
│   │   ├── ds-request.ts             # ⭐ 核心：WAFData.authenticatedRequest 封装
│   │   ├── env.ts                    # 环境变量 (isDev/isStaging/isProd)
│   │   ├── request.ts                # 备用请求封装
│   │   ├── drag.ts                   # 拖拽工具
│   │   ├── elementMessage.ts         # Element Plus 消息封装
│   │   └── lodash.ts                 # lodash 按需导入
│   │
│   ├── plugins/
│   │   └── ds-search-input.ts        # 达索搜索弹框封装 (SearchUtils.inAppsSearch)
│   │
│   ├── components/         # 通用组件
│   │   ├── UploadProgressPanel.vue
│   │   └── common/                  # 公共子组件
│   │
│   ├── i18n/               # 国际化
│   │   ├── index.ts
│   │   └── lang/                    # zh-CN / en-US NLS 文件
│   │
│   └── config/
│       └── env.ts                    # 环境配置
│
├── .env / .env.development / .env.production / .env.staging
├── eslint.config.js        # ESLint 9 flat config
├── tsconfig.json           # TypeScript 配置 (@/* → ./src/*)
├── vite.config.ts          # Vite 构建配置
└── package.json            # 依赖声明
```

---

## 三、核心架构

### 3.1 请求链路

```
Vue Component / Composable
    ↓ import http from '@/utils/ds-request'
ds-request.ts (http.get/post/put/delete)
    ↓ WAFData.authenticatedRequest(baseURL + url, options)
DS/WAFData/WAFData (3DDashboard 原生认证模块)
    ↓ 自动注入 CSRF / SecurityContext / X-Requested-With
3DSpace REST API
```

**关键约定**：
- 所有 REST 请求必须走 `ds-request.ts`，禁止直接 `fetch` 或 `axios`
- URL 格式：`/resources/{path}?tenant=OnPremise`
- `ds-request.ts` 自动拼接 `spaceBaseURL`，组件不关心 baseURL
- `SecurityContext` 通过 `setDefaultSecurityContext()` 全局注入

### 3.2 OOTB 命令调用链路

```
headerActions.ts (命令分发)
    ↓ command === 'revision' / 'newRevision' / ...
lifecycleCommands.ts
    ↓ requirejs(['DS/LifecycleCmd/ReviseCmd', 'DS/WAFData/WAFData', ...])
Dassault OOTB Module (ReviseWidget / DuplicateCmd / NewBranchCmd / ...)
    ↓ WAFData.authenticatedRequest (请求链)
3DSpace REST API (prepare_revise / attributeList / duplicate/options / ...)
```

**关键约定**：
- 通过 `topWindow.require` / `requirejsPromise` 加载达索 AMD 模块
- 必要时 patch `WAFData.authenticatedRequest` 修正请求参数
- patch 必须标记 `__twPatchXxx = true` 防止重复包装
- patch 回调必须 pass-through 所有参数，隔离 patch 错误不中断原始流程

### 3.3 状态管理

| Store | 职责 | 关键状态 |
|-------|------|---------|
| `baseInfo` | 平台基础信息 | `spaceUrl`, `searchUrl`, `securityContext`, `currentUser` |
| `dialog` | 对话框管理 | `visible`, `isProductDialog`, `createContext*`, `lastCreatedInfo` |
| `queryMode` | 查询模式 | `queryMode` (index/db), 3分钟自动回退倒计时 |

### 3.4 路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | HomeView | 首页导航 |
| `/part-detail/:physicalId` | PartDetailView | 零件详情页 |

---

## 四、核心文件分析

### 4.1 PartDetailView.vue (276KB)

项目最大文件，承载详情页全部功能：

- **属性区**：零件基本信息展示
- **Header 操作栏**：修订版、新修订版、新修订版源、新建分支、复制、删除、比较、关系、锁定/解锁、更新修订版、编辑配置上下文
- **BOM 结构表格**：`el-table-v2` 虚拟表格，支持行级展开/折叠、拖拽移动、选中高亮
- **成熟度状态图**：状态节点 + 正向/反向 transition
- **工具栏**：新建产品/零件/图纸/文档、插入现有、材料数量、导出 CSV
- **WAFData Patch**：针对 Revise/NewBranch/Duplicate 的请求参数修正

**已知问题**：文件过大，理想状态应拆分为多个子组件。

### 4.2 expandApi.ts (62KB)

展开逻辑核心，`parseExpandData` 解析 3DSpace 展开返回值，处理：
- `ds6w:isLastRevision` 大小写问题
- 扁平化树结构
- 行级展开数据加载

### 4.3 partDetailApi.ts (55KB)

零件详情 API 封装，包括：
- 零件信息获取
- 锁定/解锁 (reserve/unreserve)
- 成熟度状态图/提升
- reparent (拖拽移动)
- 设置企业项目编号
- 版本图查询
- 实例数量修改

### 4.4 lifecycleCommands.ts (23KB)

生命周期命令封装：
- `openLifecycleReviseCmd` - 修订
- `openLifecycleNewBranchCmd` - 新建分支
- `openLifecycleReviseFromCmd` - 修订版源
- `openLifecycleDuplicateCmd` - 复制
- `applyReviseFromRequestPatch` - WAFData 请求修正

### 4.5 ds-request.ts (7KB)

**项目最关键的工具文件**，封装 `WAFData.authenticatedRequest`：
- `spaceBaseURL` / `searchBaseURL` 管理
- `defaultSecurityContext` 全局注入
- `http.get/post/put/delete` - 3DSpace 请求
- `searchHttp.get/post` - 搜索服务请求
- `dashboardPost/Get` - Dashboard 请求

---

## 五、Workflows 文件总结

| 文件 | 用途 |
|------|------|
| `engineering-release-app-dev.md` | 核心开发排障指南：关键文件、搜索、成熟度、表格、SecurityContext |
| `tw-engineering-release-lessons.md` | 项目经验沉淀：用户约定、表格架构、拖拽刷新、isLastRevision 大小写、创建上下文、重复项 |
| `call-ootb-history-dialog.md` | OOTB HistoryCmd 调用指南：requirejs 加载、widget 挂载、命令执行 |
| `coding-guidelines.md` | 编码准则：语法、复用接口、最小改动、3DDashboard 特化、组件设计 |
| `analyze-har.md` | HAR 文件分析工作流 |
| `vue-best-practices.md` | Vue 3 最佳实践 |
| `vue-debug-guides.md` | Vue 调试指南 |
| `vue-jsx-best-practices.md` | Vue JSX/TSX 语法 |
| `vue-options-api-best-practices.md` | Options API 最佳实践 |
| `vue-pinia-best-practices.md` | Pinia 最佳实践 |
| `vue-router-best-practices.md` | Router 最佳实践 |
| `vue-testing-best-practices.md` | 测试最佳实践 |
| `create-adaptable-composable.md` | 可复用 composable 创建 |
| `skill-creator.md` | Skill 创建器 |

---

## 六、Docs 文件总结

54 个功能文档，按页面分区：

| 区域 | 文档数 | 覆盖功能 |
|------|--------|---------|
| 首页 (homeview) | 7 | 最近、我的产品、打开、新产品、新零件、卡片操作 |
| 详情页 Header | 10 | 修订版、新修订版、新修订版源、新建分支、复制、删除、比较、关系、锁定/解锁、更新修订版 |
| 详情页 Create | 12 | 新产品/零件/图纸/形状表示/文档、插入现有、材料数量、上传文档、插入重复项 |
| 详情页 Expand | 3 | 展开、展开N层、展开全部、折叠全部 |
| 详情页 StructureView | 7 | 仅可制造、使用、叶节点、平铺、引用、材料、缩进 |
| 详情页 Other | 6 | 变形、复制、实例数量、导出CSV、成熟度、拆离 |

---

## 七、Interface 文件总结

| 类型 | 文件 | 用途 |
|------|------|------|
| HAR 抓包 | adddocument.har, document.har, error.har, reparent.har, success.har, 重复项.har, 变形计自.har, 修订版源*.har | 真实 API 请求/响应样例 |
| 接口文本 | Interface.txt (284KB), table.txt, expand.txt, state.txt, 最近.txt, 零件信息.txt | API 返回值结构参考 |
| 需求文档 | 需求.md, HAR分析报告.md, 09-更多应用程序.md, 10-打开方式.md | 功能需求和分析 |

---

## 八、技术债务与风险

### 8.1 超大文件

| 文件 | 大小 | 风险 |
|------|------|------|
| PartDetailView.vue | 276KB | 维护困难、IDE 卡顿、构建慢 |
| expandApi.ts | 62KB | 解析逻辑复杂、难以单测 |
| partDetailApi.ts | 55KB | API 过度集中 |

**建议**：逐步拆分 PartDetailView.vue 为子组件（属性区、Header 栏、BOM 表格、成熟度图、工具栏）。

### 8.2 IDE 自动格式化问题

多次出现 IDE 自动格式化破坏代码的情况：
- `</el-button>` 被拆成 `</` + `el-button>`
- `||` 被改为 `|` (bitwise OR)
- `pwin` 被改为 `win` (undefined variable)
- `<template #suffix>` 被拆成 `<t` + `#suffix mplate>`

**建议**：关闭 Format On Save，或配置 `.editorconfig` / `.prettierrc` 排除特定文件。

### 8.3 WAFData Patch 模式

当前通过 monkey-patch `WAFData.authenticatedRequest` 修正 OOTB 请求，存在风险：
- Patch 可能影响其他 widget 的请求
- 需要标记 `__twPatchXxx` 防止重复包装
- 3DDashboard 版本升级后 Patch 可能失效

### 8.4 TypeScript 严格性

- `@typescript-eslint/no-explicit-any: off` 导致 `any` 泛滥
- `partDetailApi.ts` 和 `PartDetailView.vue` 中大量 `any` 类型
- 缺少 API 响应类型定义（大部分用 `any` 接收）

---

## 九、关键业务流程

### 9.1 零件详情页加载

```
路由进入 /part-detail/:physicalId
    → baseInfoStore.fetchSpaceUrl() (获取 3DSpace URL)
    → baseInfoStore.getCollaborativeSpace() (获取 SecurityContext)
    → partDetailApi.getPartDetail(physicalId) (获取零件信息)
    → expandApi.expandRoot(physicalId) (展开根节点 BOM)
```

### 9.2 生命周期操作

```
用户点击 Header 按钮
    → headerActions.ts 命令分发
    → lifecycleCommands.ts 加载 OOTB 模块
    → applyRequestPatch(WAFData) 修正请求
    → OOTB Cmd 执行 (ReviseCmd/DuplicateCmd/NewBranchCmd/...)
    → WAFData.authenticatedRequest 发起请求链
    → 操作完成后刷新/跳转
```

### 9.3 创建操作

```
用户点击"新建产品/零件"
    → dialogStore.openProductDialog/openPartDialog
    → NewProductDialog/NewPartDialog 显示
    → 填写表单 → 调用 authoring API
    → 创建成功 → dialogStore.notifyCreated
    → 刷新 BOM 结构 (db 模式 3 分钟)
```

### 9.4 配置上下文

```
用户点击"编辑配置上下文"
    → headerActions.ts no-op (对话框自行处理)
    → InternalConfig.vue 挂载
    → http.post(getPandOAccessInformation) 权限检查
    → http.post(getMultipleConfigurationContextInfo) 获取配置
    → 展示配置上下文列表
```

---

## 十、环境与部署

| 环境 | 配置文件 | API 地址 |
|------|---------|---------|
| Development | `.env.development` | 本地 mock |
| Staging | `.env.staging` | 测试服务器 |
| Production | `.env.production` | 3DSpace 服务器 |

**3DDashboard 部署**：
- Widget 通过 `@widget-lab/3ddashboard-utils` 接入 3DDashboard
- 运行时通过 `i3DXCompassServices.getServiceUrl` 获取 3DSpace/3DSearch URL
- `widget.addEvent('onLoad', start)` 启动应用
- `widget.setPreferences` 配置平台和凭证选项

---

## 十一、开发命令速查

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式 (hot-reload)
pnpm build            # 类型检查 + 构建
pnpm lint             # ESLint 检查 + 自动修复
pnpm format           # Prettier 格式化 src/
pnpm lint:stylelint   # 样式检查
pnpm type-check       # TypeScript 类型检查
```

---

*本报告基于 2026-06-02 项目状态生成，涵盖源码、文档、工作流和接口资料的完整分析。*
