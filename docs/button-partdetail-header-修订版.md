---
description: PartDetailView 头部操作 - 修订版功能
---

# PartDetailView 头部操作 - 修订版

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"修订版"功能，用于查看产品的修订版历史。

## 功能说明

"修订版"功能调用达索原生的 HistoryCmd，显示产品的修订版历史记录弹窗。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有查看修订版历史的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('revision')`
- composable：`src/composables/lifecycleCommands.ts`
- OOTB 源码：`OOTBSources/HistoryCmd.js`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"修订版"：

```vue
<el-dropdown-item command="revision" divided :disabled="lifecycleCmdLoading">
  <span class="part-action-menu-icon">☷</span>
  <span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '修订版' }}</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'revision') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] revision 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openLifecycleHistoryCmd(physicalId);
  }
};
```

### 3. 打开生命周期历史命令

调用 `openLifecycleHistoryCmd` 函数：

```typescript
const openLifecycleHistoryCmd = async (physicalId: string) => {
  const topWindow = window.top || window.parent || window;
  const requireFn = topWindow.require || topWindow.requirejs || window.require;

  requireFn(['DS/LifecycleCmd/HistoryCmd'], (HistoryCmd: any) => {
    const HistoryCmdCtor = HistoryCmd?.default || HistoryCmd;
    if (typeof HistoryCmdCtor !== 'function') {
      throw new Error('DS/LifecycleCmd/HistoryCmd 不是可实例化命令类');
    }

    const targetNode = buildLifecycleTargetNode(physicalId);
    const historyCmd = new HistoryCmdCtor();
    historyCmd.execute(targetNode);
  });
};
```

### 4. 构造目标节点

```typescript
const buildLifecycleTargetNode = (physicalId: string) => {
  const objectType = pickOpenWithField(partInfo.value, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
  const displayName = pickOpenWithField(partInfo.value, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;

  return {
    getID: () => physicalId,
    id: physicalId,
    objectId: physicalId,
    physicalid: physicalId,
    physicalId,
    type: objectType,
    objectType,
    displayType: objectType,
    displayName,
    label: displayName,
    title: displayName,
    tenant: 'OnPremise',
    envId: 'OnPremise',
    serviceId: '3DSpace',
    contextId: baseInfoStore.securityContext || '',
    // ... 更多字段
  };
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/lifecycleCommands.ts` - 生命周期命令 composable
- `OOTBSources/HistoryCmd.js` - 达索 OOTB 源码

## 注意事项

1. 修订版功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 构造目标节点时需要补齐所有必需字段
3. 需要用户有相应的达索许可证
4. 弹窗显示后会自动定位到当前修订版
