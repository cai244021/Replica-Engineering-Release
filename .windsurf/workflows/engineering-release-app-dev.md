---
description: TW Engineering Release APP 开发与排障指南
auto_execution_mode: 3
---

# TW Engineering Release APP 开发与排障指南

这个 workflow 用于继续开发 `TW_EngineeringRelease` APP，特别适用于达索 3DDashboard 环境、零件详情页、成熟度状态、产品打开搜索、结构表格和构建检查相关任务。

## 1. 开始前确认范围

1. 明确当前任务属于哪一类：
   - 首页导航与最近/我的产品/打开功能。
   - 零件详情页 `PartDetailView.vue`。
   - 成熟度状态图、提升/返回状态。
   - 子件结构表格、选中行、hover 高亮。
   - 达索搜索弹框 `ds-search-input.ts`。
   - 3DSpace API、SecurityContext、请求封装。
2. 优先查看相关文件，不要先大范围重构。
3. 用户如果强调“不要改核心逻辑”，只能做类型、格式、兼容性或局部修复。

## 2. 常用关键文件

- `src/views/HomeView.vue`
  - 首页左侧导航。
  - “最近”、“我的产品”、“打开”入口。
  - 侧边栏折叠逻辑。
  - 达索搜索打开后的路由跳转。

- `src/views/PartDetailView.vue`
  - 零件详情页主界面。
  - Part Maturity Status 弹框。
  - 成熟度状态图、正向/反向路线、返回箭头。
  - 子件结构表格、行选中、单元格 hover、表头 hover。
  - 拖拽打开对象逻辑。

- `src/plugins/ds-search-input.ts`
  - 达索搜索弹框封装。
  - 当前核心调用使用：`parent.require(['DS/PADServices/utils/SearchUtils'], ...)`。
  - 当前核心打开方式使用：`SearchUtils.inAppsSearch(params)`。
  - 不要随意替换成 `DS/E6WCommonUI/Search`，因为当前 R2026 环境可能 404。

- `src/api/partDetailApi.ts`
  - 零件详情、结构、成熟度 API。
  - `getStateGraph` 和 `promoteMaturity` 需要携带 `SecurityContext`。
  - `promoteMaturity` 请求体需要 `{ data: [...] }`。

- `src/utils/ds-request.ts`
  - 达索请求封装。
  - 全局默认 `SecurityContext` 注入。

- `src/store/modules/baseInfo.ts`
  - 获取 `spaceUrl`、`searchUrl`、`securityContext`。
  - 获取到 `securityContext` 后需要同步给请求封装。

## 3. 首页“打开”功能开发要点

1. `HomeView.vue` 中的打开入口应调用：

```ts
dsSearchInput(searchData.value, 'product', 'PSE', '', callback);
```

2. 回调里从搜索结果中提取对象 ID，常见字段包括：

```ts
physicalid || physicalId || id || objectId
```

3. 获取到 `physicalId` 后跳转：

```ts
router.push({
  name: 'partDetail',
  params: { physicalId }
});
```

4. 如果没有 ID，使用 `ElMessage.warning('无法获取选择对象的ID')` 提示。

## 4. 达索搜索插件注意事项

1. 保留 5 个参数，不要减少签名：

```ts
function dsSearchInput(searchData, openType, appName, CaId, callback)
```

2. 当前用户提供的核心逻辑依赖：

```ts
parent.require(['DS/PADServices/utils/SearchUtils'], SearchUtils => {
  SearchUtils.inAppsSearch(params);
});
```

3. 不要替换为下面这些模块，除非用户明确要求或验证可用：

```ts
DS/E6WCommonUI/Search
DS/E6WCommonUI/Views/FoundationBaseView
```

这些模块在当前 R2026 环境中可能出现 `404 Not Found`。

4. 修 ESLint 时只做语法安全改动：
   - `var` 改 `const` 或 `let`。
   - `Function` 改明确回调类型。
   - `String` 改 `string`。
   - `==` 改 `===`。
   - `@ts-ignore` 优先改 `@ts-expect-error`。
   - 保留原始搜索条件字符串、`precond`、`fts_value` 和 `inAppsSearch` 参数结构。

5. 如果用户要求“还原”，优先还原业务字符串和达索调用结构，再处理 lint。

## 5. 成熟度状态功能开发要点

1. 状态图接口：
   - `getStateGraph`。
   - 需要 header 和 query 都携带 `SecurityContext`。

2. 提升/返回接口：
   - `promoteMaturity`。
   - 请求体必须是对象：

```ts
{
  data: params
}
```

3. 状态显示：
   - 当前状态高亮。
   - 可达状态显示操作箭头。
   - 反向 transition 需要单独绘制返回路线。

4. 反向路线 UI：
   - 横线和竖线应贴近目标状态框边缘。
   - 目标状态处需要向上箭头。
   - “返回到xxx”的蓝色箭头在文字右侧。

5. 如果接口返回 transitions 中有 `OBSOLETE`，但 states 中没有，需要补充显示该状态，避免路线缺失。

## 6. 子件结构表格 UI 要点

1. 默认占满下方剩余屏幕：
   - 外层容器使用 flex。
   - `children-section` 使用 `flex: 1`。
   - `el-table` 设置 `height="100%"`。

2. 选中行：
   - 使用 `row-class-name` 返回 `selected-child-row`。
   - CSS 使用淡蓝背景，例如 `#d9ecff`。

3. 单元格 hover：
   - 当前 hover 单元格使用淡灰色，例如 `#e9edf3`。
   - 可加轻微 inset border 方便识别。

4. 表头联动高亮：
   - 用 `hoveredChildrenColumnId` 记录当前列。
   - `cell-mouse-enter` / `cell-mouse-leave` 更新状态。
   - `header-cell-class-name` 给对应表头加同色高亮。

5. 表格展开交互：
   - 后续所有 table 展开都使用“行级加载”方式。
   - 点击展开时不要触发整表 `loading`、页面刷新、表格遮罩、闪烁或布局抖动。
   - 只加载当前行的下一层数据，并只把下层数据插入当前行下面。
   - 加载过程中只改变当前行展开图标，使用 loading/spinner 样式，不要使用省略号或整表加载效果。
   - 加载完成后当前行从 `+` 变成 `-`，收起时只隐藏下层数据，不重新请求、不刷新整表。
   - 如果使用 `el-table-v2`，通过扁平化数据和 `row.isExpanded` 管理展开状态，不使用普通 `el-table` 的树形展开 API。

## 7. 侧边栏折叠要点

1. 折叠状态建议放在 `HomeView.vue`：

```ts
const sidebarCollapsed = ref(false);
```

2. 不要影响 `PartDetailView.vue` 的返回箭头。
3. 如果用户要求使用“最近”左侧箭头折叠，只绑定首页 header 区域的箭头，不要全局改 icon 行为。
4. 折叠后保留图标，隐藏文字，并给 nav item 增加 `title` 便于识别。

## 8. SecurityContext 与 3DSpace API

1. 达索接口通常需要：
   - Header 中的 `SecurityContext`。
   - URL query 中的 `SecurityContext`。

2. 如果后端报 500 或权限相关问题，优先检查：
   - `SecurityContext` 是否为空。
   - 是否同时放入 header 和 query。
   - 请求体格式是否符合接口要求。

3. `promote` 类接口如果后端按 JSONObject 解析，不要直接传数组，要包成对象。

## 9. 构建与校验

1. 修改 TS/Vue 后执行：

```powershell
pnpm build
```

2. 只检查单文件 ESLint 时执行：

```powershell
pnpm exec eslint src/plugins/ds-search-input.ts
```

3. 构建成功但出现以下警告通常不是阻塞问题：
   - `NODE_ENV=production is not supported in the .env file`
   - Sass `legacy-js-api` deprecation
   - chunk size warning

4. 如果用户只要求修 ES 语法，不要为了消除警告重构构建配置。

## 10. 修改原则

1. 小步修改，避免一次重写大文件。
2. 不要删除用户已有的达索核心逻辑。
3. 不要随意减少函数参数，尤其是 `dsSearchInput`。
4. 不要把用户给的搜索条件拆成可能改变运行行为的结构，除非用户确认。
5. UI 调整优先通过局部 CSS 和现有状态变量实现。
6. 每次关键修改后运行 lint 或 build 验证。
7. 最终回复用户时说明：
   - 改了哪些文件。
   - 保留了哪些核心逻辑。
   - 验证结果。
