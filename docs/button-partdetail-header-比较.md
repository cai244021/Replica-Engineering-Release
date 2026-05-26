---
description: PartDetailView 头部操作 - 比较功能
---

# PartDetailView 头部操作 - 比较

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"比较"功能，用于比较产品的不同版本。

## 功能说明

"比较"功能调用达索原生的 Compare Widget，用于比较产品的不同版本或修订版。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有使用比较功能的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('compare')`
- composable：`src/composables/openWith.ts`
- OOTB 源码：`OOTBSources/CompareCommon.js`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"比较"：

```vue
<el-dropdown-item command="compare">
  <span class="part-action-menu-icon">↔</span>
  <span class="part-action-menu-label">比较</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'compare') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] compare 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleRootOpenWith('compare');
  }
};
```

### 3. 使用 openWith composable

调用 `handleRootOpenWith` 函数：

```typescript
const handleRootOpenWith = async (command: string) => {
  const physicalId = getParentPhysicalId();
  if (!physicalId) {
    ElMessage.warning('未找到当前对象物理ID');
    return;
  }

  const targetNode = buildTargetNode(physicalId, partInfo.value);
  openWith(command, physicalId, targetNode);
};
```

### 4. 调用达索比较 Widget

```typescript
const callCompareCommand = async (targetNode: any) => {
  const topWindow = window.top || window.parent || window;
  const requireFn = topWindow.require || topWindow.requirejs || window.require;

  requireFn(['DS/CompareCommon/CompareCommon'], (CompareCommon: any) => {
    const CompareCommonCtor = CompareCommon?.default || CompareCommon;
    if (typeof CompareCommonCtor !== 'function') {
      throw new Error('DS/CompareCommon/CompareCommon 不是可实例化命令类');
    }

    const compare = new CompareCommonCtor();
    compare.open(targetNode);
  });
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/openWith.ts` - 打开方式 composable
- `OOTBSources/CompareCommon.js` - 达索 OOTB 源码

## 注意事项

1. 比较功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 构造目标对象时需要补齐所有必需字段
3. 比较功能通常用于比较同一产品的不同修订版
4. 需要用户有相应的达索许可证
