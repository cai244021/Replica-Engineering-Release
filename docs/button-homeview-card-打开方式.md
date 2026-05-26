---
description: HomeView 卡片操作 - 打开方式功能
---

# HomeView 卡片操作 - 打开方式

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"打开方式"功能，用于使用不同的达索应用程序打开产品。

## 功能说明

"打开方式"子菜单提供多种达索应用程序选项，用户可以选择合适的应用程序打开产品进行编辑或查看。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 产品有有效的 physicalId
- 用户有使用相应应用程序的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleOpenWithClick(command, item)`
- composable：`src/composables/openWith.ts`

## 实现步骤

### 1. 点击打开方式子菜单

用户点击产品卡片下拉菜单中的"打开方式"，显示子菜单：

```vue
<div class="open-with-submenu-wrapper" @click.stop @mouseenter="positionSubmenu">
  <div class="open-with-trigger">
    打开方式
    <el-icon class="submenu-arrow"><ArrowRight /></el-icon>
  </div>
  <div class="open-with-submenu">
    <div class="submenu-item" @click="handleOpenWithClick('3D Markup', item)">
      <el-icon><EditPen /></el-icon>
      <span>3D Markup</span>
    </div>
    <div class="submenu-item" @click="handleOpenWithClick('3D Navigate', item)">
      <el-icon><Compass /></el-icon>
      <span>3D Navigate</span>
    </div>
    <div class="submenu-item" @click="handleOpenWithClick('3DPlay', item)">
      <el-icon><VideoPlay /></el-icon>
      <span>3DPlay</span>
    </div>
    <div class="submenu-item" @click="handleOpenWithClick('Collaborative Lifecycle', item)">
      <el-icon><Refresh /></el-icon>
      <span>Collaborative Lifecycle</span>
    </div>
    <div class="submenu-item submenu-item-divided" @click="handleOpenWithClick('more', item)">
      <el-icon><Plus /></el-icon>
      <span>更多应用程序</span>
    </div>
  </div>
</div>
```

### 2. 处理打开方式点击

调用 `handleOpenWithClick` 函数：

```typescript
const handleOpenWithClick = (command: string, item: any) => {
  console.log('[HomeView] 打开方式:', command, '产品:', item);
  
  const physicalId = item.id || item.physicalid || item.physicalId;
  if (!physicalId) {
    ElMessage.warning('无法获取产品ID');
    return;
  }

  // 调用 openWith composable
  openWith(command, physicalId, item);
};
```

### 3. 使用 openWith composable

使用 `src/composables/openWith.ts` 中的 `openWith` 函数处理打开方式逻辑：

```typescript
const openWith = (command: string, physicalId: string, item: any) => {
  console.log('[OpenWith] 打开方式:', command, 'physicalId:', physicalId);

  if (command === 'more') {
    // 打开达索"更多应用程序"对话框
    openMoreAppsDialog(physicalId);
    return;
  }

  // 构造达索目标对象
  const targetNode = buildTargetNode(physicalId, item);

  // 调用达索打开方式命令
  callOpenWithCommand(command, targetNode);
};
```

### 4. 支持的打开方式

#### 3D Markup
- 用于 3D 标注和批注
- 命令：`3D Markup`

#### 3D Navigate
- 用于 3D 导航和浏览
- 命令：`3D Navigate`

#### 3DPlay
- 用于 3D 播放和演示
- 命令：`3DPlay`

#### Collaborative Lifecycle
- 用于协作生命周期管理
- 命令：`Collaborative Lifecycle`

#### 更多应用程序
- 打开达索原生应用程序选择对话框
- 命令：`more`

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/composables/openWith.ts` - 打开方式 composable
- `OOTBSources/CompareCommon.js` - 达索 OOTB 源码

## 注意事项

1. 不同的打开方式需要不同的达索应用程序许可证
2. 打开方式会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
3. "更多应用程序"会打开达索原生对话框，提供更多应用程序选项
4. 构造目标对象时需要补齐所有必需字段（physicalId、type、displayName 等）
