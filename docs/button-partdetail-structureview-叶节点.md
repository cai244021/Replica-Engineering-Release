---
description: PartDetailView 结构视图 - 叶节点模式
---

# PartDetailView 结构视图 - 叶节点模式

## 概述

本文档说明 PartDetailView 结构视图中的"叶节点"模式，用于只显示叶节点（无子节点的节点）。

## 功能说明

"叶节点"模式只显示叶节点，隐藏所有有子节点的父节点。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('leaf')`
- 响应式变量：`structureViewMode`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"叶节点"：

```vue
<el-dropdown-item command="leaf" :class="{ 'is-selected': structureViewMode === 'leaf' }">
  <svg viewBox="0 0 24 24">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
  </svg>
  <span>叶节点</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = (command: string) => {
  if (command === 'leaf') {
    structureViewMode.value = 'leaf';
    // 过滤叶节点
    leafData.value = filterLeafNodes(expandData.value);
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 过滤叶节点

```typescript
const filterLeafNodes = (data: any[]): any[] => {
  const leafs: any[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (!node.children || node.children.length === 0) {
        leafs.push(node);
      } else {
        traverse(node.children);
      }
    });
  };
  traverse(data);
  return leafs;
};
```

### 4. 渲染叶节点视图

```vue
<el-table
  v-if="structureViewMode === 'leaf'"
  :data="leafData"
  row-key="rowId">
  <!-- 表格列 -->
</el-table>
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 叶节点模式只显示没有子节点的节点
2. 父节点会被隐藏
3. 便于查看最终的零部件
4. 切换回缩进模式会恢复完整树形结构
