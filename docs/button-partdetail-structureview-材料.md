---
description: PartDetailView 结构视图 - 材料模式
---

# PartDetailView 结构视图 - 材料模式

## 概述

本文档说明 PartDetailView 结构视图中的"材料"模式，用于只显示材料类型的节点。

## 功能说明

"材料"模式只显示材料类型的节点，隐藏其他类型的节点。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('material')`
- 响应式变量：`structureViewMode`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"材料"：

```vue
<el-dropdown-item command="material" :class="{ 'is-selected': structureViewMode === 'material' }">
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
  </svg>
  <span>材料</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = (command: string) => {
  if (command === 'material') {
    structureViewMode.value = 'material';
    // 过滤材料节点
    materialData.value = filterMaterialNodes(expandData.value);
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 过滤材料节点

```typescript
const filterMaterialNodes = (data: any[]): any[] => {
  const materials: any[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.type === 'Material' || node.type === 'VPMMaterial') {
        materials.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(data);
  return materials;
};
```

### 4. 渲染材料视图

```vue
<el-table
  v-if="structureViewMode === 'material'"
  :data="materialData"
  row-key="rowId">
  <!-- 表格列 -->
</el-table>
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 材料模式只显示材料类型的节点
2. 其他类型的节点会被隐藏
3. 便于查看材料清单
4. 切换回缩进模式会恢复完整树形结构
