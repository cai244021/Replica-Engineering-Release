---
description: HomeView 卡片操作 - 比较功能
---

# HomeView 卡片操作 - 比较

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"比较"功能，用于比较产品的不同版本。

## 功能说明

"比较"功能调用达索原生的比较 Widget，用于比较产品的不同版本或修订版。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 产品有有效的 physicalId
- 用户有使用比较功能的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('compare', item)`
- composable：`src/composables/openWith.ts`

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片下拉菜单中的"比较"：

```vue
<el-dropdown-item command="compare">比较</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'compare') {
    const physicalId = item.id || item.physicalid || item.physicalId;
    if (!physicalId) {
      ElMessage.warning('无法获取产品ID');
      return;
    }
    
    // 调用 openWith composable
    openWith('compare', physicalId, item);
  }
  // ... 其他命令处理
};
```

### 3. 使用 openWith composable

使用 `src/composables/openWith.ts` 中的 `openWith` 函数：

```typescript
const openWith = (command: string, physicalId: string, item: any) => {
  console.log('[OpenWith] 比较功能:', command, 'physicalId:', physicalId);

  // 构造达索目标对象
  const targetNode = buildTargetNode(physicalId, item);

  // 调用达索比较命令
  callCompareCommand(targetNode);
};
```

### 4. 调用达索比较 Widget

加载并调用达索原生的比较 Widget：

```typescript
const callCompareCommand = async (targetNode: any) => {
  const topWindow = window.top || window.parent || window;
  const requireFn = topWindow.require || topWindow.requirejs || window.require;

  requireFn(['DS/CompareCommon/CompareCommon'], (CompareCommon: any) => {
    const compare = new CompareCommon();
    compare.open(targetNode);
  });
};
```

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/composables/openWith.ts` - 打开方式 composable
- `OOTBSources/CompareCommon.js` - 达索 OOTB 源码

## 注意事项

1. 比较功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 构造目标对象时需要补齐所有必需字段
3. 比较功能通常用于比较同一产品的不同修订版
4. 需要用户有相应的达索许可证
