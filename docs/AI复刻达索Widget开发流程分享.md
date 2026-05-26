---
marp: true
theme: default
paginate: true
size: 16:9
header: 'TW Engineering Release - Vue 复刻达索 Widget 开发流程'
footer: 'AI 辅助开发实践分享'
---

# 使用 Vue 复刻达索 Widget 的 AI 辅助开发流程

## TW Engineering Release 实战分享

- 基于 3DEXPERIENCE / Dassault Widget 行为复刻
- 基于 Vue 3 + TypeScript + Element Plus
- 基于抓包、源码阅读、AI 迭代实现

---

# 分享目标

本次分享回答 5 个问题：

1. 使用什么工具抓取前端请求，并喂给 AI
2. 接口请求怎么喂给 AI
3. 怎么和 AI 对话、提需求
4. 怎么让 AI 读取达索 Widget 源码，并在复刻 App 中调用、展示页面
5. 基于当前项目案例，讲清楚功能开发流程

---

# 项目背景

当前项目：`TW_EngineeringRelease`

技术栈：

- Vue 3 Composition API
- TypeScript
- Element Plus
- Pinia
- Vue Router
- Vite
- Dassault / 3DEXPERIENCE Widget API
- Widget Lab 相关工具包

核心页面：

- `src/views/HomeView.vue`
- `src/views/PartDetailView.vue`
- `src/composables/*`

---

# 复刻达索 Widget 的基本思路

复刻不是简单照抄 UI，而是复刻完整行为链路：

1. 用户点击入口
2. 前端构造上下文对象
3. 调用达索 OOTB Widget / Command
4. Widget 内部发起接口请求
5. 根据返回结果展示弹窗或更新结构树
6. Vue App 同步刷新当前业务页面

---

# 推荐抓包工具

## 浏览器内置工具

Chrome / Edge DevTools：

- Network 面板查看接口请求
- Preserve log 保留跳转前请求
- Fetch/XHR 过滤接口
- Copy as cURL 导出请求
- Copy response 导出返回结果

## 代理抓包工具

- Charles
- Fiddler Classic / Fiddler Everywhere
- Proxyman
- Wireshark，适合底层网络排查

---

# 抓包时重点看什么

一个请求至少要记录：

- Request URL
- Request Method
- Query Params
- Request Headers
- Request Payload
- Response Body
- Status Code
- 调用时机
- 触发按钮或 Widget 行为
- 请求前后的页面状态变化

---

# 推荐给 AI 的接口信息格式

不要只截图，优先提供结构化文本。

```md
## 场景
点击“新修订版源”按钮后，达索 Widget 需要打开 ReviseFrom 弹窗。

## 请求 1
URL: /resources/v1/modeler/lifecycle/prepare_revise_checkavailability
Method: POST
Payload:
```json
{
  "data": [
    {
      "physicalid": "xxx",
      "type": "VPMReference"
    }
  ]
}
```

Response:
```json
{
  "results": []
}
```

## 当前问题
弹窗中对象名称显示 undefined，需要分析请求字段缺失原因。
```

---

# 接口请求怎么喂给 AI

推荐分三层喂给 AI：

## 1. 业务意图

告诉 AI 你想复刻什么功能，例如：

- 打开生命周期修订版历史
- 新建修订版
- 新建分支
- 插入现有产品
- 查找结构中的零件

## 2. 请求链路

告诉 AI 完整请求顺序：

- 先请求什么
- 后请求什么
- 哪个返回值会进入下一个请求
- 哪个字段决定页面展示

## 3. 对比信息

告诉 AI：

- 达索原生 Widget 的请求长什么样
- 当前 Vue App 的请求长什么样
- 两者差异在哪里

---

# 和 AI 对话的有效方式

## 不推荐

“这个功能坏了，帮我看看。”

## 推荐

```md
我正在复刻达索 Lifecycle ReviseFrom Widget。
当前 Vue 文件是 src/views/PartDetailView.vue。
原生 Widget 源码在 OOTBSources/ReviseWidget.js。

目标：点击头部按钮 newRevisionSource 时，调用原生 ReviseFromCmd，打开和达索一致的弹窗。

现象：弹窗能打开，但是名称显示 undefined。

我抓到原生请求和当前请求如下：...
请帮我对比字段差异，并最小化修改现有代码。
```

---

# AI 提需求模板

每次需求尽量包含 6 个部分：

1. 当前目标
2. 已知入口文件
3. 相关源码路径
4. 复现步骤
5. 实际结果
6. 期望结果

示例：

```md
目标：复刻达索 HistoryCmd 修订版历史弹窗。
入口：PartDetailView.vue 的 revision 命令。
源码：OOTBSources/HistoryCmd.js。
期望：点击“修订版”后调用原生弹窗，不自研弹窗。
限制：不要影响其它头部按钮。
验证：npm run type-check 通过。
```

---

# 如何让 AI 读取达索 Widget 源码

把达索 OOTB 源码放入项目目录，例如：

```txt
OOTBSources/
  CompareCommon.js
  ReviseWidget.js
  HistoryCmd.js
```

然后明确告诉 AI：

- 源码路径
- 要分析的入口函数
- 要复刻的行为
- 哪些代码不能直接改
- 哪些代码可以作为参考

---

# AI 阅读源码的提问方式

示例：

```md
请阅读 OOTBSources/CompareCommon.js，找出原生 compare 功能如何构造上下文对象。
然后对比 src/views/PartDetailView.vue 中 handleRootOpenWith('compare') 的实现。
要求：只修改 Vue App，不修改 OOTB 源码。
```

AI 会做的事情：

- 搜索入口函数
- 读取关键源码
- 找调用链
- 找请求参数构造位置
- 对比当前 App 代码
- 给出最小改动方案

---

# 在 Vue App 中调用达索 Widget 的方式

核心是通过 `window.top` 或 `window.parent` 获取 Widget 运行环境：

```ts
const topWindow = window.top || window.parent || window;
const requireFn = topWindow.require || topWindow.requirejs || window.require;
```

然后加载达索模块：

```ts
requireFn(['DS/LifecycleCmd/HistoryCmd'], (HistoryCmd) => {
  // 构造 context
  // new Command
  // execute
});
```

---

# 达索 Widget 调用的关键点

复刻时通常不是只调用一个函数，而是要准备上下文：

- `getSelectedNodes()`
- `getEditMode()`
- `getPADTreeDocument()`
- `getCurrentFolder()`
- `selectedNodes`
- `securityContext`
- `objectId / physicalid / physicalId`
- `displayName / name / revision / type`

这些字段缺失时，原生 Widget 常见问题是：

- 弹窗打不开
- 名称显示 undefined
- 类型显示不正确
- 请求参数缺字段
- 生命周期按钮不可用

---

# 当前项目案例 1：头部命令分发

文件：

- `src/composables/headerActions.ts`
- `src/views/PartDetailView.vue`

核心函数：

```ts
handleHeaderActionCommand(command)
```

支持命令：

- delete
- compare
- relationship
- lock / unlock
- revision
- newRevision
- newBranch
- newRevisionSource
- copy
- updateRevisionAll
- updateRevision

---

# 当前项目案例 2：打开方式复刻

文件：

- `src/composables/openWith.ts`
- `src/views/PartDetailView.vue`

典型功能：

- compare
- relationship
- 使用达索原生打开方式

开发流程：

1. 从按钮命令进入
2. 构造达索目标对象
3. 补齐类型、名称、revision、taxonomies
4. 调用原生 Widget 能识别的入口
5. 对比原生请求字段
6. 调整当前 Vue App 的上下文对象

---

# 当前项目案例 3：修订版历史 HistoryCmd

入口命令：

```ts
command === 'revision'
```

处理流程：

1. 获取当前根对象 `physicalId`
2. 调用 `openLifecycleHistoryCmd(physicalId)`
3. 加载 `DS/LifecycleCmd/HistoryCmd`
4. 构造 target node
5. 创建 HistoryCmd 实例
6. 执行 `execute()`
7. 显示达索原生历史弹窗

---

# 当前项目案例 4：新修订版源 ReviseFromCmd

入口命令：

```ts
command === 'newRevisionSource'
```

处理流程：

1. 获取当前根对象 `physicalId`
2. 调用 `openLifecycleReviseFromCmd(physicalId)`
3. 加载达索 ReviseFromCmd
4. Patch 请求链路中的字段缺失问题
5. 调用原生 `reviseFrom_command`
6. 弹出达索原生新修订版源窗口

---

# 当前项目案例 5：新修订版 ReviseCmd

入口命令：

```ts
command === 'newRevision'
```

逻辑分支：

- 如果表格有选中行：对选中行执行新修订版
- 如果没有选中行：对根对象执行新修订版

关键难点：

- selected row 要转成达索 Widget 能识别的 target node
- 需要补齐 `displayName`、`name`、`revision`、`current_internal`
- 需要 Patch `WAFData.authenticatedRequest`
- 操作完成后监听生命周期事件并刷新树行

---

# 当前项目案例 6：结构查找 findInStructure

文件：

- `src/composables/findInStructure.ts`

开发流程：

1. 用户输入关键字
2. 构造 UQL 查询
3. 调用 expand API
4. 获取匹配路径上的 physicalId
5. 解析结构树
6. 合并到当前树数据
7. 高亮匹配行
8. 支持上一个、下一个、全选匹配结果

---

# 当前项目案例 7：替换修订版 replaceRevision

文件：

- `src/composables/replaceRevision.ts`
- `src/views/ReplaceRevisionDialog.vue`

开发流程：

1. 获取选中行
2. 校验 physicalId / relationId
3. 获取版本图
4. 查找目标修订版
5. 构造替换 operations
6. 调用替换接口
7. 显示替换报告
8. 切换数据库模式并刷新结构

---

# 当前项目案例 8：变形件 deformDialog

文件：

- `src/composables/deformDialog.ts`

开发流程：

1. 选择可变形产品
2. 查询可变形状态
3. 打开变形对话框
4. 输入前缀
5. 创建 Deformed Product
6. 插入到当前结构父节点
7. 展示插入报告
8. 刷新树结构

---

# AI 辅助开发的完整闭环

```txt
达索原生操作
  ↓
抓包记录请求
  ↓
保存 OOTB 源码
  ↓
让 AI 对比源码和请求
  ↓
Vue App 中复刻上下文和调用链
  ↓
运行 type-check / build
  ↓
在 3DEXPERIENCE 环境中验证
  ↓
继续补字段、修边界情况
```

---

# 当前项目的代码组织演进

重构前：

- 大量逻辑集中在 `PartDetailView.vue`
- 文件接近 9000 行
- 命令、弹窗、接口、树操作耦合严重

重构后已拆分：

- `openWith.ts`
- `clipboard.ts`
- `structureView.ts`
- `replaceRevision.ts`
- `findInStructure.ts`
- `deformDialog.ts`
- `headerActions.ts`

---

# Composable 拆分原则

适合拆分：

- 输入输出清晰
- 依赖可以通过参数传入
- 和模板耦合较低
- 可以单独 type-check
- 逻辑职责单一

不适合过早拆分：

- 依赖达索全局对象太多
- 大量函数互相调用
- 拆分后参数列表极长
- 业务还在快速变化

---

# 如何让 AI 帮你安全重构

给 AI 的约束要明确：

```md
只做重构，不改变功能。
每拆一个 composable 后运行 npm run type-check。
如果出现声明顺序问题，调整初始化位置，不改变业务逻辑。
不要删除达索 Widget 兼容字段。
不要修改 OOTB 源码。
```

当前项目就是按这个方式逐步拆分的。

---

# 常见问题：AI 为什么需要源码和请求？

因为达索 Widget 很多行为不是公开文档能完全说明的。

AI 需要通过以下信息推断：

- Widget 构造函数需要什么 context
- 请求链路由哪个函数发起
- 哪些字段来自 selected node
- 哪些字段来自 security context
- 哪些字段只在原生 Widget 中自动补齐
- 当前 Vue App 缺了哪些字段

---

# 常见问题：为什么要 Patch WAFData？

部分达索 Widget 内部会直接调用：

```ts
WAFData.authenticatedRequest(url, options)
```

当 Vue App 构造的上下文字段不完整时，请求或响应可能缺少 UI 需要的字段。

Patch 的目的：

- 补齐请求参数
- 补齐响应字段
- 保持原生流程继续执行
- 不直接改达索源码

注意：Patch 必须隔离异常，不能中断原始 Widget 流程。

---

# 当前项目中 AI 最有价值的地方

1. 快速阅读大型 Vue 文件
2. 定位命令入口和调用链
3. 对比原生 Widget 源码
4. 分析抓包请求差异
5. 生成 target node / context 字段
6. 修复 TypeScript 声明顺序问题
7. 抽取 composable 并保持功能不变
8. 输出验证步骤和风险点

---

# 推荐团队协作方式

## 开发者负责

- 在达索环境中复现问题
- 抓包
- 提供原生 Widget 源码
- 明确业务期望
- 最终功能验证

## AI 负责

- 读代码
- 找调用链
- 对比请求
- 生成补丁
- 拆分模块
- 运行类型检查
- 总结风险点

---

# 实战 Prompt：复刻一个达索按钮

```md
我要复刻达索 Widget 的【xxx】按钮。
当前 Vue 入口是 src/views/PartDetailView.vue。
原生源码在 OOTBSources/xxx.js。
抓包请求如下：...
当前实现的问题是：...
请你先分析调用链，再给最小修改方案。
要求：
1. 不改 OOTB 源码
2. 不影响其它按钮
3. 修改后运行 npm run type-check
```

---

# 实战 Prompt：让 AI 分析接口差异

```md
下面是原生 Widget 请求和当前 App 请求。
请对比 payload、headers、response 中影响 UI 展示的字段。
输出：
1. 缺失字段列表
2. 字段来源推测
3. 应该在 Vue 哪个函数补齐
4. 最小代码修改建议
```

---

# 实战 Prompt：让 AI 拆分 composable

```md
请把 PartDetailView.vue 中 xxx 相关逻辑拆成 src/composables/xxx.ts。
要求：
1. 不改变功能
2. 所有依赖通过参数传入
3. 保留原函数名，避免模板改动过大
4. 删除原文件中的重复定义
5. 运行 npm run type-check
```

---

# 当前项目建议的后续优化

1. 为 `headerActions.ts` 增加更明确的参数类型
2. 将生命周期命令继续沉淀到 `lifecycleCommands.ts`
3. 给 OOTB 调用封装统一的 `loadDassaultModule` 工具
4. 给请求 Patch 逻辑增加统一保护函数
5. 对关键 composable 增加单元测试
6. 整理 `OOTBSources/` 源码索引文档
7. 建立“抓包样本库”，按功能保存请求和响应

---

# 最终落地方法论

一句话总结：

> 用抓包还原行为，用源码理解机制，用 AI 缩短分析和实现周期，用 Vue composable 固化复刻能力。

这套方式适合：

- 达索 Widget 行为复刻
- 老系统前端迁移
- 私有 SDK / 半黑盒系统集成
- 大型 Vue 页面重构

---

# Q&A

欢迎讨论：

- 哪些达索 Widget 最适合优先复刻？
- 哪些请求需要沉淀为接口文档？
- 哪些 OOTB 源码需要纳入版本管理？
- 当前项目下一步应该拆分哪个模块？
