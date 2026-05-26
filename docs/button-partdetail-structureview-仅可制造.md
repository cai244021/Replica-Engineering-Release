---
description: PartDetailView 结构视图 - 仅可制造
---

# PartDetailView 结构视图 - 仅可制造

## 概述

本文档说明 PartDetailView 结构视图中的"仅可制造"模式，用于只显示可制造的节点。

## 功能说明

"仅可制造"模式只标记为可制造的节点，隐藏其他节点。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('manufacturableOnly')`
- 响应式变量：`structureManufacturableOnly`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"仅可制造"：

```vue
<el-dropdown-item command="manufacturableOnly" :class="{ 'is-selected': structureManufacturableOnly }">
  <span>仅可制造</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = (command: string) => {
  if (command === 'manufacturableOnly') {
    structureManufacturableOnly.value = !structureManufacturableOnly.value;
    // 过滤可制造节点
    if (structureManufacturableOnly.value) {
      filteredData.value = filterManufacturableNodes(expandData.value);
    } else {
      filteredData.value = expandData.value;
    }
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 过滤可制造节点

```typescript
const filterManufacturableNodes = (data: any[]): any[] => {
  const manufacturable: any[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.manufacturable === true || node.isManufacturable === true) {
        manufacturable.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(data);
  return manufacturable;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 仅可制造模式是开关选项
2. 只显示标记为可制造的节点
3. 再次点击会取消过滤
4. 便于生成制造清单
