---
description: PartDetailView 展开菜单 - 折叠全部功能
---

# PartDetailView 展开菜单 - 折叠全部

## 概述

本文档说明 PartDetailView 展开菜单中的"折叠全部"功能，用于折叠所有节点。

## 功能说明

"折叠全部"功能折叠产品结构中的所有节点，只显示根节点。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleExpandMenuCommand('collapseAll')`
- composable：`src/composables/expand.ts`

## 实现步骤

### 1. 点击展开菜单项

用户点击展开下拉菜单中的"折叠全部"：

```vue
<el-dropdown-item command="collapseAll" divided>
  <svg viewBox="0 0 24 24">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
  <span>折叠全部</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleExpandMenuCommand` 函数：

```typescript
const handleExpandMenuCommand = async (command: string) => {
  if (command === 'collapseAll') {
    await handleCollapseAll();
  }
};
```

### 3. 折叠所有节点

调用 `handleCollapseAll` 函数：

```typescript
const handleCollapseAll = async () => {
  expandedRowIds.value.clear();
  // 触发表格更新
  tableKey.value++;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/expand.ts` - 展开 composable

## 注意事项

1. 折叠全部只显示根节点
2. 折叠后可以通过"展开"或"展开全部"重新展开
3. 折叠操作不会影响数据，只影响显示状态
