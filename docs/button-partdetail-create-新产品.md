---
description: PartDetailView 创建菜单 - 新产品功能
---

# PartDetailView 创建菜单 - 新产品

## 概述

本文档说明 PartDetailView 创建菜单中的"新产品"功能，用于在产品结构中创建新产品。

## 功能说明

"新产品"功能在当前产品的结构中创建一个新产品，并将其作为子节点插入。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有创建产品的权限
- 当前产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('newProduct')`
- API：`partDetailApi.createProduct()`

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"新产品"：

```vue
<el-dropdown-item command="newProduct">
  <span class="create-menu-icon product-new-icon"></span>
  <span>新产品</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'newProduct') {
    const parentPhysicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newProduct 点击，父节点物理ID:', parentPhysicalId);
    if (!parentPhysicalId) {
      ElMessage.warning('未找到父节点物理ID');
      return;
    }
    await handleCreateNewProduct(parentPhysicalId);
  }
};
```

### 3. 创建新产品

调用 `handleCreateNewProduct` 函数：

```typescript
const handleCreateNewProduct = async (parentPhysicalId: string) => {
  try {
    const response = await partDetailApi.createProduct({
      parentPhysicalId,
      name: '新',
      type: 'VPMReference'
    });
    ElMessage.success('新产品创建成功');
    // 刷新结构
    await loadExpandData(parentPhysicalId);
  } catch (error) {
    console.error('[PartDetailView] 创建新产品失败:', error);
    ElMessage.error('创建新产品失败');
  }
};
```

## API 接口

### 创建产品

- 接口：`partDetailApi.createProduct(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    parentPhysicalId: string;
    name: string;
    type: string;
  }
  ```
- 返回数据：创建成功的产品信息

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 创建的新产品会作为当前产品的子节点
2. 默认名称为"新"，用户可以后续修改
3. 默认类型为 VPMReference
4. 创建成功后会刷新产品结构
5. 需要用户有相应的权限
