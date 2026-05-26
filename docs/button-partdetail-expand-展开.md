---
description: PartDetailView 展开菜单 - 展开功能
---

# PartDetailView 展开菜单 - 展开

## 概述

本文档说明 PartDetailView 展开菜单中的"展开"功能，用于展开选中的节点。

## 功能说明

"展开"功能展开选中节点的子节点，显示其下一级结构。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已选中至少一个节点
- 选中节点有子节点

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleExpandMenuCommand('expand')`
- composable：`src/composables/expand.ts`

## 实现步骤

### 1. 点击展开菜单项

用户点击展开下拉菜单中的"展开"：

```vue
<el-dropdown-item command="expand">
  <svg viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  <span>展开</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleExpandMenuCommand` 函数：

```typescript
const handleExpandMenuCommand = async (command: string) => {
  if (command === 'expand') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要展开的节点');
      return;
    }
    await handleExpandSelected();
  }
};
```

### 3. 展开选中节点

调用 `handleExpandSelected` 函数：

```typescript
const handleExpandSelected = async () => {
  const selectedIds = selectedChildrenRows.value.map(row => row.rowId);
  selectedIds.forEach(rowId => {
    expandedRowIds.value.add(rowId);
  });
  // 触发表格更新
  tableKey.value++;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/expand.ts` - 展开 composable

## 注意事项

1. 需要先选择要展开的节点
2. 只展开一级子节点
3. 如果节点没有子节点，展开操作无效
4. 支持批量展开多个节点
