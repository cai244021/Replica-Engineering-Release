---
description: PartDetailView 头部操作 - 新修订版功能
---

# PartDetailView 头部操作 - 新修订版

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"新修订版"功能，用于创建产品的新修订版。

## 功能说明

"新修订版"功能调用达索原生的 ReviseCmd，创建产品的新修订版。如果有选中行，则对选中行执行新修订版操作。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有创建新修订版的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('newRevision')`
- composable：`src/composables/lifecycleCommands.ts`
- OOTB 源码：`OOTBSources/ReviseWidget.js`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"新修订版"：

```vue
<el-dropdown-item command="newRevision" :disabled="lifecycleCmdLoading">
  <span class="part-action-menu-icon">↳</span>
  <span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新修订版' }}</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'newRevision') {
    console.log('[TW_EngineeringRelease] newRevision 检查选中行数量:', selectedChildrenRows.value.length);
    if (selectedChildrenRows.value.length > 0) {
      await handleSelectedRowNewRevision();
      return;
    }
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newRevision 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openLifecycleReviseCmd(physicalId);
  }
};
```

### 3. 打开生命周期修订命令

调用 `openLifecycleReviseCmd` 函数：

```typescript
const openLifecycleReviseCmd = async (physicalId: string) => {
  lifecycleCmdLoading.value = true;
  try {
    const topWindow = window.top || window.parent || window;
    const requireFn = topWindow.require || topWindow.requirejs || window.require;

    const [ReviseWidget, ReviseCmd, WAFData] = await Promise.all([
      loadDassaultModule('DS/ReviseWidget/ReviseWidget'),
      loadDassaultModule('DS/LifecycleCmd/ReviseCmd'),
      loadDassaultModule('DS/WAFData/WAFData')
    ]);

    // Patch WAFData 请求
    applyReviseRequestPatch(WAFData, physicalId);

    // 调用修订命令
    callLifecycleReviseEntry(ReviseCmd, physicalId);
  } catch (error) {
    console.error('[PartDetailView] 打开新修订版失败:', error);
    ElMessage.error('打开新修订版失败');
  } finally {
    lifecycleCmdLoading.value = false;
  }
};
```

### 4. Patch WAFData 请求

```typescript
const applyReviseRequestPatch = (WAFData: any, physicalId: string) => {
  const originalAuthenticatedRequest = WAFData.authenticatedRequest;
  WAFData.authenticatedRequest = function (url: string, options: any) {
    const isReviseRequest = url && url.includes('/prepare_revise_checkavailability');
    if (isReviseRequest && options?.data) {
      // 补齐请求参数
      const requestData = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;
      // ... 补齐字段
    }
    return originalAuthenticatedRequest.call(this, url, options);
  };
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/lifecycleCommands.ts` - 生命周期命令 composable
- `OOTBSources/ReviseWidget.js` - 达索 OOTB 源码

## 注意事项

1. 新修订版功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 如果有选中行，则对选中行执行新修订版操作
3. 需要补齐目标节点的所有字段
4. 需要 Patch WAFData 请求以确保字段完整性
5. 需要用户有相应的达索许可证
