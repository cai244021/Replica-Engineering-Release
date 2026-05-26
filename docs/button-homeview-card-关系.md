---
description: HomeView 卡片操作 - 关系功能
---

# HomeView 卡片操作 - 关系

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"关系"功能，用于查看产品的关系图。

## 功能说明

"关系"功能调用达索原生的关系 Widget，用于显示产品与其他对象之间的关系。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 产品有有效的 physicalId
- 用户有查看关系的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('relationship', item)`
- composable：`src/composables/openWith.ts`

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片下拉菜单中的"关系"：

```vue
<el-dropdown-item command="relationship">关系</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'relationship') {
    const physicalId = item.id || item.physicalid || item.physicalId;
    if (!physicalId) {
      ElMessage.warning('无法获取产品ID');
      return;
    }
    
    // 调用 openWith composable
    openWith('relationship', physicalId, item);
  }
  // ... 其他命令处理
};
```

### 3. 使用 openWith composable

使用 `src/composables/openWith.ts` 中的 `openWith` 函数：

```typescript
const openWith = (command: string, physicalId: string, item: any) => {
  console.log('[OpenWith] 关系功能:', command, 'physicalId:', physicalId);

  // 构造达索目标对象
  const targetNode = buildTargetNode(physicalId, item);

  // 调用达索关系命令
  callRelationshipCommand(targetNode);
};
```

### 4. 调用达索关系 Widget

加载并调用达索原生的关系 Widget：

```typescript
const callRelationshipCommand = async (targetNode: any) => {
  const topWindow = window.top || window.parent || window;
  const requireFn = topWindow.require || topWindow.requirejs || window.require;

  requireFn(['DS/Relationships/Relationships'], (Relationships: any) => {
    const relationships = new Relationships();
    relationships.open(targetNode);
  });
};
```

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/composables/openWith.ts` - 打开方式 composable

## 注意事项

1. 关系功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 构造目标对象时需要补齐所有必需字段
3. 关系图会显示产品与其他对象的所有关系
4. 需要用户有相应的达索许可证
