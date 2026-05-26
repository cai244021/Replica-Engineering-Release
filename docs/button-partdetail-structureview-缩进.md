---
description: PartDetailView 结构视图 - 缩进模式
---

# PartDetailView 结构视图 - 缩进模式

## 概述

本文档说明 PartDetailView 结构视图中的"缩进"模式，用于以缩进树形结构显示产品层级。

## 功能说明

"缩进"模式以缩进树形结构显示产品层级，每个子节点通过缩进表示其层级关系。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('indented')`
- 响应式变量：`structureViewMode`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"缩进"：

```vue
<el-dropdown-item command="indented" :class="{ 'is-selected': structureViewMode === 'indented' }">
  <svg viewBox="0 0 24 24">
    <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/>
  </svg>
  <span>缩进</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = (command: string) => {
  if (command === 'indented') {
    structureViewMode.value = 'indented';
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 渲染缩进视图

表格根据 `structureViewMode` 渲染不同的视图：

```vue
<el-table
  v-if="structureViewMode === 'indented'"
  :data="expandData"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  row-key="rowId"
  :default-expand-all="false"
  :expand-row-keys="Array.from(expandedRowIds)">
  <!-- 表格列 -->
</el-table>
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 缩进模式是默认的结构视图模式
2. 缩进层级通过 padding-left 实现
3. 支持展开/折叠节点
4. 切换视图模式会触发表格更新
