---
description: PartDetailView 结构视图 - 平铺模式
---

# PartDetailView 结构视图 - 平铺模式

## 概述

本文档说明 PartDetailView 结构视图中的"平铺"模式，用于以平铺列表显示所有节点。

## 功能说明

"平铺"模式以平铺列表显示所有节点，不显示层级缩进关系。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('flat')`
- 响应式变量：`structureViewMode`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"平铺"：

```vue
<el-dropdown-item command="flat" :class="{ 'is-selected': structureViewMode === 'flat' }">
  <svg viewBox="0 0 24 24">
    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>
  </svg>
  <span>平铺</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = (command: string) => {
  if (command === 'flat') {
    structureViewMode.value = 'flat';
    // 将树形数据扁平化
    flatData.value = flattenTreeData(expandData.value);
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 扁平化树形数据

```typescript
const flattenTreeData = (data: any[]): any[] => {
  const flat: any[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      flat.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(data);
  return flat;
};
```

### 4. 渲染平铺视图

```vue
<el-table
  v-if="structureViewMode === 'flat'"
  :data="flatData"
  row-key="rowId">
  <!-- 表格列 -->
</el-table>
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 平铺模式下不显示层级关系
2. 所有节点在同一层级显示
3. 切换回缩进模式会恢复树形结构
4. 平铺模式便于查看和筛选所有节点
