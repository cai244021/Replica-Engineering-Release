---
description: PartDetailView 创建菜单 - 新形状表示功能
---

# PartDetailView 创建菜单 - 新形状表示

## 概述

本文档说明 PartDetailView 创建菜单中的"新形状表示"功能，用于创建新的形状表示。

## 功能说明

"新形状表示"功能为当前产品创建新的形状表示（3D 形状）。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有创建形状表示的权限
- 当前产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('newShapeRepresentation')`
- API：`partDetailApi.createShapeRepresentation()`

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"新形状表示"：

```vue
<el-dropdown-item command="newShapeRepresentation">
  <span class="create-menu-icon shape-new-icon"></span>
  <span>新形状表示</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'newShapeRepresentation') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newShapeRepresentation 点击，物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleCreateShapeRepresentation(physicalId);
  }
};
```

### 3. 创建形状表示

调用 `handleCreateShapeRepresentation` 函数：

```typescript
const handleCreateShapeRepresentation = async (physicalId: string) => {
  try {
    await partDetailApi.createShapeRepresentation({
      physicalId,
      name: '形状表示'
    });
    ElMessage.success('形状表示创建成功');
    // 刷新结构
    await loadExpandData(physicalId);
  } catch (error) {
    console.error('[PartDetailView] 创建形状表示失败:', error);
    ElMessage.error('创建形状表示失败');
  }
};
```

## API 接口

### 创建形状表示

- 接口：`partDetailApi.createShapeRepresentation(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    physicalId: string;
    name: string;
  }
  ```
- 返回数据：创建成功的形状表示信息

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 形状表示是 3D 形状的可视化表示
2. 默认名称为"形状表示"，用户可以后续修改
3. 创建成功后会刷新产品结构
4. 需要用户有相应的权限
