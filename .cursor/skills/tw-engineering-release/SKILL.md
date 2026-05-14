---
name: tw-engineering-release
description: TW Engineering Release 项目开发规范和 Vue 3 经验。适用 PartDetailView 表格、Element Plus el-table-v2、多选按钮逻辑、关联操作等场景。
---

# TW Engineering Release 项目开发规范

适用于 `D:\AI\TWX_PSE\TW_EngineeringRelease` 项目 Vue 3 + TypeScript + Element Plus 开发。

## 用户约定

1. **不要主动构建**：不要运行 `pnpm build`、`npm run build` 等构建命令。
2. **修改完成后提醒用户自行验证**。
3. **不要处理无关的 ESLint 历史报错**。
4. **只修改和需求直接相关的代码**。

## PartDetailView 表格

### el-table-v2 动态列宽补齐

当需要表格列不管怎么拖拽都铺满容器时：

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

模板中使用：
```vue
:columns="createChildrenTableColumns(width)"
```

### 选择列/复选框对齐

`el-table-v2` 固定列可能导致样式不生效。处理方式：

1. 列配置添加 class：
```ts
class: 'selection-column-cell',
headerClass: 'selection-column-header',
align: 'center',
headerAlign: 'center'
```

2. 内层容器使用 flex 居中：
```ts
style: {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '100%',
	height: '100%'
}
```

3. CSS 强制覆盖：
```scss
:deep(.selection-column-header),
:deep(.selection-column-cell) {
	padding: 0 !important;
	background-color: #f2f3f5 !important;
}
```

### 行级刷新偏好

用户期望：行级展开只加载当前行下一层，不应造成整页遮罩、闪烁或布局抖动。

## 多选按钮显示逻辑

### 按钮多选隐藏条件

需求：「表格勾选 >= 2 行时隐藏按钮」

```vue
<el-dropdown-item command="existingMaterial" v-if="selectedRows.length < 2">
	<span>现有原材料</span>
</el-dropdown-item>
```

**常见错误**：使用 `selectedRows.length === 0` 会导致一勾选就直接隐藏整个菜单。

### 选中行与根节点的关联操作

如果功能支持「选中行时关联到选中行，未选中时关联到根节点」：

```javascript
// 处理现有原材料确认
const handleExistingMaterialConfirm = async (data) => {
	if (!pendingMaterial.value) return;

	try {
		let parentId: string;
		if (selectedChildrenRows.value.length > 0) {
			// 关联到选中行，使用 resourceid（physicalId）
			parentId = selectedChildrenRows.value[0].resourceid || selectedChildrenRows.value[0].id;
		} else {
			// 关联到根节点
			parentId = currentPhysicalId.value;
		}

		if (!parentId) {
			ElMessage.warning('未获取到父节点');
			return;
		}
		// ... API 调用 ...

		// 关联成功后刷新
		if (selectedChildrenRows.value.length > 0) {
			// 勾选了行 → 强制展开勾选的行
			await Promise.all(
				selectedChildrenRows.value.map(row => reloadAndExpandRow(row))
			);
		} else {
			// 没有勾选 → 强制刷新根节点
			const physicalId = currentPhysicalId.value;
			if (physicalId) {
				await loadPartDetail(physicalId);
			}
		}
	}
};
```

## 对话框单行布局

参考 `MaterialQuantityDialog.vue` 的简洁布局：

```vue
<div class="dialog-form">
	<el-form label-width="0" @submit.prevent>
		<el-form-item prop="quantity">
			<el-input v-model="formData.quantity" placeholder="输入数量" style="width: 160px" />
		</el-form-item>
		<el-form-item prop="unit">
			<el-select v-model="formData.unit" placeholder="选择单位" style="width: 140px" />
		</el-form-item>
	</el-form>
	<div class="as-required-row">
		<el-checkbox v-model="asRequired" label="根据需求" @change="handleAsRequiredChange" />
	</div>
</div>
```

```css
.dialog-form :deep(.el-form) {
	display: flex;
	align-items: center;
	gap: 12px;
}

.dialog-form :deep(.el-form-item) {
	margin-bottom: 0;
}
```

## 错误本地化

### reparent 错误本地化

导入 NLS 文件：
```ts
import enCatflNls from '@/i18n/lang/en-US/CATFLNls_en.json';
import zhCatflNls from '@/i18n/lang/zh-CN/CATFLNls_zh.json';
```

根据语言选择 NLS，API 返回错误码时查找本地化文本。

### 创建错误本地化

参考 `NewProductDialog.vue` 和 `NewPartDialog.vue`：
- 优先查 `${errorCode}_Title`
- 再查 `${errorCode}_Subtitle`
- 最后使用原始错误码

## isLastRevision 大小写

`ds6w:isLastRevision` 可能返回 `TRUE`，判断时必须忽略大小写：

```ts
const isLastRev = String(node['ds6w:isLastRevision'] || '').toLowerCase() === 'true';
```

## CSRF Token 获取

3DSpace 接口使用 `http.get()`：

```javascript
const baseInfoStore = useBaseInfoStore();
if (!baseInfoStore.securityContext) {
	await baseInfoStore.getCollaborativeSpace();
}
const url = '/resources/v1/application/E6WFoundation/CSRF?tenant=OnPremise';
const response = await http.get(url, { SecurityContext: baseInfoStore.securityContext || '' });
```

注意：`dashboardGet()` 用于 3DDashboard，`get()` 用于 3DSpace。

## 拖拽移动后刷新

同一个 table 内拖拽移动后，目标行和源行原父节点都要强制刷新并展开：

1. 拖拽 payload 保留 `rowId`、`relationId`、`path`、`sourceParentRowId`、`sourceParentPath`
2. 内部移动后先找到所有源父节点
3. 如果源是 root 或目标是 root，必要时先 `loadPartDetail(rootPhysicalId)`
4. root 刷新后，从最新 `flattenChildrenData.value` 重新定位受影响行对象
5. 对源父节点和目标节点调用 `reloadAndExpandRow(row)`
6. 避免同一行重复刷新展开

## 材料名称带版本显示

从搜索结果中提取材料名称和版本：

```javascript
const materialLabel = materialItem['ds6w:label'] || materialItem.label || '原材料';
const materialRevision = materialItem.revision || materialItem['ds6wg:revision'] || '';
const materialName = materialRevision ? `${materialLabel} ${materialRevision}` : materialLabel;
```

## 排障建议

1. Element Plus `el-table-v2` 样式不生效时，优先检查实际 DOM 是否是固定列、header wrapper 或 row cell 内层结构导致选择器没命中。
2. 对虚拟表格 cell 样式，列配置上的 `class/headerClass` 比全局 first-child 更可靠。
3. 遇到 `isLastRevision` 判断问题时，检查 API 返回的是大写 `TRUE` 还是小写 `true`。

## Vue 最佳实践

### Composition API

- 优先使用 `<script setup lang="ts">`
- 非平凡 UI 工作先定义组件边界
- 路由/根视图保持精简
- 可复用逻辑放入 composables

### 响应式注意

- Store 解构会破坏响应式，使用 `storeToRefs`
- 计算属性不要有副作用
- `computed` 返回对象时要小心

### 详细参考

更详细的 Vue 调试技巧、Pinia 状态管理、测试规范等，参考：
- `.trae/skills/vue-debug-guides/SKILL.md`
- `.trae/skills/vue-pinia-best-practices/SKILL.md`
- `.trae/skills/vue-testing-best-practices/SKILL.md`
