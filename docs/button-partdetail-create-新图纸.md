---
description: PartDetailView 创建菜单 - 新图纸功能
---

# PartDetailView 创建菜单 - 新图纸

## 概述

本文档说明 PartDetailView 创建菜单中的"新图纸"功能，用于创建新的工程图纸。

## 功能说明

"新图纸"功能为当前产品创建新的工程图纸。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有创建图纸的权限
- 当前产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('newDrawing')`
- API：`partDetailApi.createDrawing()`

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"新图纸"：

```vue
<el-dropdown-item command="newDrawing">
  <span class="create-menu-icon drawing-new-icon"></span>
  <span>新图纸</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'newDrawing') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newDrawing 点击，物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleCreateDrawing(physicalId);
  }
};
```

### 3. 创建图纸

调用 `handleCreateDrawing` 函数：

```typescript
const handleCreateDrawing = async (physicalId: string) => {
  try {
    await partDetailApi.createDrawing({
      physicalId,
      name: '图纸'
    });
    ElMessage.success('图纸创建成功');
    // 刷新结构
    await loadExpandData(physicalId);
  } catch (error) {
    console.error('[PartDetailView] 创建图纸失败:', error);
    ElMessage.error('创建图纸失败');
  }
};
```

## API 接口

### 创建图纸

- 接口：`partDetailApi.createDrawing(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    physicalId: string;
    name: string;
  }
  ```
- 返回数据：创建成功的图纸信息

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 图纸是产品的工程绘图表示
2. 默认名称为"图纸"，用户可以后续修改
3. 创建成功后会刷新产品结构
4. 需要用户有相应的权限
