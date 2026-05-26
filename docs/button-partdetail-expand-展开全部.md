---
description: PartDetailView 展开菜单 - 展开全部功能
---

# PartDetailView 展开菜单 - 展开全部

## 概述

本文档说明 PartDetailView 展开菜单中的"展开全部"功能，用于展开所有节点。

## 功能说明

"展开全部"功能展开产品结构中的所有节点，显示完整的层级结构。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleExpandMenuCommand('expandAll')`
- composable：`src/composables/expand.ts`

## 实现步骤

### 1. 点击展开菜单项

用户点击展开下拉菜单中的"展开全部"：

```vue
<el-dropdown-item command="expandAll">
  <svg viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  <span>展开全部</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleExpandMenuCommand` 函数：

```typescript
const handleExpandMenuCommand = async (command: string) => {
  if (command === 'expandAll') {
    await handleExpandAll();
  }
};
```

### 3. 展开所有节点

调用 `handleExpandAll` 函数：

```typescript
const handleExpandAll = async () => {
  // 获取所有可展开的节点 ID
  const allRowIds = getAllRowIds(expandData.value);
  allRowIds.forEach(rowId => {
    expandedRowIds.value.add(rowId);
  });
  // 触发表格更新
  tableKey.value++;
};
```

### 4. 获取所有行 ID

```typescript
const getAllRowIds = (data: any[]): string[] => {
  const ids: string[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.rowId) {
        ids.push(node.rowId);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(data);
  return ids;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/expand.ts` - 展开 composable

## 注意事项

1. 展开全部可能需要加载大量数据
2. 对于大型结构，展开全部可能影响性能
3. 展开后可以通过"折叠全部"恢复默认状态
