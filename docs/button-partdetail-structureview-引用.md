---
description: PartDetailView 结构视图 - 引用视图
---

# PartDetailView 结构视图 - 引用视图

## 概述

本文档说明 PartDetailView 结构视图中的"引用"视图，用于显示产品的正向引用关系。

## 功能说明

"引用"视图显示当前产品引用的其他产品，即正向结构关系。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('reference')`
- 响应式变量：`structureUsageView`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"引用"：

```vue
<el-dropdown-item command="reference" :class="{ 'is-selected': structureUsageView === 'reference' }">
  <span>引用</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = async (command: string) => {
  if (command === 'reference') {
    structureUsageView.value = 'reference';
    // 恢复正向结构数据
    referenceData.value = expandData.value;
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 渲染引用视图

```vue
<el-table
  v-if="structureUsageView === 'reference'"
  :data="referenceData"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  row-key="rowId">
  <!-- 表格列 -->
</el-table>
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 引用视图是默认的正向结构视图
2. 显示产品引用的所有子产品
3. 与使用视图互斥
4. 切换到使用视图会显示反向关系
