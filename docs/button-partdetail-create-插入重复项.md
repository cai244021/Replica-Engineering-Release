---
description: PartDetailView 创建菜单 - 插入重复项功能
---

# PartDetailView 创建菜单 - 插入重复项

## 概述

本文档说明 PartDetailView 创建菜单中的"插入重复项"功能，用于复制并插入现有产品到当前结构中。

## 功能说明

"插入重复项"功能复制选中的产品，并将其作为子节点插入到当前产品结构中。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有复制和插入产品的权限
- 当前产品未被锁定
- 已选中至少一个子节点

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('insertDuplicate')`
- API：`partDetailApi.insertDuplicate()`

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"插入重复项"：

```vue
<el-dropdown-item command="insertDuplicate">
  <span class="create-menu-icon insert-duplicate-icon"></span>
  <span>插入重复项</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'insertDuplicate') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要复制的产品');
      return;
    }
    const parentPhysicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] insertDuplicate 点击，父节点物理ID:', parentPhysicalId);
    if (!parentPhysicalId) {
      ElMessage.warning('未找到父节点物理ID');
      return;
    }
    await handleInsertDuplicate(parentPhysicalId);
  }
};
```

### 3. 插入重复项

调用 `handleInsertDuplicate` 函数：

```typescript
const handleInsertDuplicate = async (parentPhysicalId: string) => {
  try {
    const productIds = selectedChildrenRows.value.map(row => row.physicalid);
    await partDetailApi.insertDuplicate({
      parentPhysicalId,
      productIds
    });
    ElMessage.success('插入重复项成功');
    // 刷新结构
    await loadExpandData(parentPhysicalId);
  } catch (error) {
    console.error('[PartDetailView] 插入重复项失败:', error);
    ElMessage.error('插入重复项失败');
  }
};
```

## API 接口

### 插入重复项

- 接口：`partDetailApi.insertDuplicate(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    parentPhysicalId: string;
    productIds: string[];
  }
  ```
- 返回数据：插入成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要先选择要复制的产品
2. 支持批量复制多个产品
3. 复制的产品会自动添加后缀以区分
4. 插入成功后会刷新产品结构
5. 需要用户有相应的权限
