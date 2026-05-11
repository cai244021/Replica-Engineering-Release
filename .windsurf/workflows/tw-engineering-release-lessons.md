---
description: TW Engineering Release 项目经验沉淀与常见实现约定
---

# TW Engineering Release 项目经验沉淀

适用于 `D:\AI\TWX_PSE\TW_EngineeringRelease` 项目中的 Vue 3 + TypeScript + Element Plus 开发、排障和 UI 调整。

## 用户约定

1. 不要主动运行 `pnpm build`、`npm run build` 或其他项目构建命令。
2. 修改完成后只需要提醒用户自行在 `D:\AI\TWX_PSE\TW_EngineeringRelease` 下构建或刷新验证。
3. 不要因为 IDE 中已有的 ESLint 大量历史报错而做无关的大范围格式化或重构。
4. 只修改和当前需求直接相关的代码。

## PartDetailView 子 BOM 表格

### 表格架构

1. 子 BOM 表格位于 `src/views/PartDetailView.vue`。
2. 当前使用 `el-auto-resizer` + `el-table-v2`。
3. 列配置由 `childrenTableColumns` 生成。
4. 展开数据由 `flattenChildrenData` 根据 `childrenData` 和 `row.isExpanded` 扁平化得到。
5. 行选择由 `selectedChildrenRows` 手动维护。
6. 行展开使用 `toggleRowExpand`，首次展开时调用 `loadChildren(row, null, resolve)`，不要做整表刷新。
7. 用户偏好：行级展开只加载当前行下一层，不应造成整页遮罩、闪烁或布局抖动。

### 表格列拖拽后满屏

如果用户要求 table 不管列怎么拖动都铺满容器，使用动态列宽补齐方案：

1. 模板中不要直接传 `childrenTableColumns`。
2. 在 `el-auto-resizer` 的 slot 中使用当前 `width`：

```vue
:columns="createChildrenTableColumns(width)"
```

3. 实现方式：

```ts
const createChildrenTableColumns = (tableWidth: number) => {
	const columns = childrenTableColumns.value.map(column => ({ ...column }));
	const totalWidth = columns.reduce((sum, column) => sum + Number(column.width || 0), 0);
	const extraWidth = Math.max(0, tableWidth - totalWidth);
	const lastColumn = columns[columns.length - 1];
	if (lastColumn && extraWidth > 0) {
		lastColumn.width = Number(lastColumn.width || 0) + extraWidth;
	}
	return columns;
};
```

4. 这样当总列宽小于容器宽度时，把差值补到最后一列；当总列宽大于容器宽度时保留横向滚动。

### 选择列/复选框对齐

`el-table-v2` 的固定列 DOM 结构可能导致普通 `first-child` 或 scoped 样式不生效。处理选择列对齐时：

1. 优先在 selection column 上增加列级 class：

```ts
class: 'selection-column-cell',
headerClass: 'selection-column-header',
align: 'center',
headerAlign: 'center'
```

2. `headerCellRenderer` 和 `cellRenderer` 内层容器使用 flex 居中：

```ts
style: {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '100%',
	height: '100%',
	padding: '0',
	backgroundColor: '#f2f3f5'
}
```

3. CSS 中针对列级 class 强制覆盖：

```scss
:deep(.selection-column-header),
:deep(.selection-column-cell) {
	padding: 0 !important;
	background-color: #f2f3f5 !important;
}

:deep(.selection-column-header > *),
:deep(.selection-column-cell > *) {
	width: 100%;
	height: 100%;
}
```

4. 如果仍未对齐，下一步可考虑固定选择列宽度、减小 `columnWidths.selection`，或对复选框容器使用绝对定位固定中心点。

### 表头和图标样式

1. 类型图标 `.name-cell .row-icon` 可缩小到 `16px x 16px`。
2. 表头浅灰背景可用：

```scss
:deep(.el-table-v2__header-cell) {
	background-color: #f2f3f5 !important;
	color: #303133;
	font-weight: 600;
}
```

## reparent / 拖拽移动

### reparent 错误本地化

1. `PartDetailView.vue` 可直接导入：

```ts
import enCatflNls from '@/i18n/lang/en-US/CATFLNls_en.json';
import zhCatflNls from '@/i18n/lang/zh-CN/CATFLNls_zh.json';
```

2. 根据 `localStorage.language` 或 `navigator.language` 选择 NLS。
3. API 返回失败且带错误码如 `ERR_FUN092398` 时，到 CATFLNls 中查找本地化文本。
4. 如果 `response.status && response.status !== 'success'`，显示错误并中断后续刷新。
5. 弹窗可用 `ElMessageBox.alert`，多条消息用 `<br />` 拼接并设置 `dangerouslyUseHTMLString: true`。

### 同 table 内拖拽后的刷新

用户期望：同一个 table 内拖拽移动后，目标行和源行原父节点都要强制刷新并展开。

推荐逻辑：

1. 拖拽 payload 中保留：
   - `rowId`
   - `relationId`
   - `path`
   - `sourceParentRowId`
   - `sourceParentPath`
2. 内部移动后不要只刷新目标行。
3. 先根据 dropped items 找到所有源父节点。
4. 如果源是 root 或目标是 root，必要时先 `loadPartDetail(rootPhysicalId)`。
5. root 刷新后，从最新 `flattenChildrenData.value` 重新定位受影响行对象。
6. 对源父节点和目标节点调用 `reloadAndExpandRow(row)`。
7. 避免同一行重复刷新展开。

## isLastRevision 大小写

在 `src/api/expandApi.ts` 的 `parseExpandData` 中，`ds6w:isLastRevision` 可能返回 `TRUE`。判断时必须忽略大小写：

```ts
const isLastRev = String(node['ds6w:isLastRevision'] || node.islastrevision || '').toLowerCase() === 'true';
```

## 现有创建/插入上下文经验

1. 子 BOM toolbar 的新建产品/新建零件复用全局 dialog store。
2. 创建前如果需要校验上下文，可调用 `ModelerAPI.getCADOriginsTypes`。
3. 如果返回 `V_usages` 包含 `3DPart`，阻止插入并提示 `错误: 无法插入到选定对象下`。
4. 创建错误本地化参考 `NewProductDialog.vue` 和 `NewPartDialog.vue`，优先查 `${errorCode}_Title`，再查 `${errorCode}_Subtitle`，最后使用原始错误码。

## 插入重复项经验

1. 子 BOM toolbar 的 `insertDuplicate` 和 `existingProduct` 一样，先调用 `dsSearchInput('', 'product', 'PSE', '', callback)` 打开相同的产品搜索入口。
2. 搜索选中产品后，不直接调用复制接口，而是弹出“插入重复项 - [类型][名称] [修订版]”确认弹窗。
3. 弹窗 UI 参考 ENOXEngineer 原生 DuplicateWidget：
   - 标题：`插入重复项 - 物理产品00001409 AA.1`
   - 字段：`添加前缀`
   - 复选框：`包括结构对象`
   - 字段：`合作区`
   - footer 灰色背景，按钮为 `复制` / `取消`
4. HAR `Interface/重复项.har` 中确认复制的核心接口是：

```http
POST /resources/lifecycle/duplicate/options?tenant=OnPremise&xrequestedwith=xmlhttprequest
```

5. 请求头需要带当前 `SecurityContext`。
6. 请求体示例：

```json
{
  "data": [
    {
      "physicalid": "D5D205296E16000069FF46F800000F0D",
      "name": "物理产品00001321",
      "revision": "AA.1",
      "typeDisplayName": "物理产品",
      "current": "工作中",
      "imageUrl": "https://3dspace.r2026.v6.com/3dspace/snresources/images/icons/large/I_VPMNavProduct108x144.png"
    }
  ],
  "command": "duplicate"
}
```

7. 同一个 HAR 里还存在辅助接口：
   - `POST /resources/lifecycle/duplicate/capabilites?tenant=OnPremise&xrequestedwith=xmlhttprequest`
   - `POST /resources/lifecycle/util/filterValidSCs?tenant=OnPremise&xrequestedwith=xmlhttprequest`
   - `GET /resources/lifecycle/util/getExpression?tenant=OnPremise&expression=LifecycleConfidentialityEnabled&xrequestedwith=xmlhttprequest`
8. 当前实现优先按核心 `duplicate/options` 完成复制；如果后续用户要求完整模拟原生 DuplicateWidget，再补 capabilities、合作区过滤和 include structure/prefix 能力参数映射。

## 排障建议

1. 遇到 Element Plus `el-table-v2` 样式不生效时，优先检查实际 DOM 是否是固定列、header wrapper 或 row cell 内层结构导致选择器没命中。
2. 对虚拟表格 cell 样式，通常比起全局 first-child，列配置上的 `class/headerClass` 更可靠。
3. 修改核心刷新逻辑时注意用户偏好：尽量行级刷新，不做整表闪烁式刷新。
4. 如果 IDE 显示很多 lint 错误，先区分是否与本次改动有关，不要擅自大范围格式化。
