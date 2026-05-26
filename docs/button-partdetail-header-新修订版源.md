---
description: PartDetailView 头部操作 - 新修订版源功能
---

# PartDetailView 头部操作 - 新修订版源

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"新修订版源"功能，用于从指定源创建新修订版。

## 功能说明

"新修订版源"功能调用达索原生的 ReviseFromCmd，从指定源对象创建新修订版。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有创建新修订版源的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('newRevisionSource')`
- composable：`src/composables/lifecycleCommands.ts`
- OOTB 源码：`OOTBSources/ReviseWidget.js`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"新修订版源"：

```vue
<el-dropdown-item command="newRevisionSource" :disabled="lifecycleCmdLoading">
  <span class="part-action-menu-icon">⌁</span>
  <span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新修订版源' }}</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'newRevisionSource') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newRevisionSource 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openLifecycleReviseFromCmd(physicalId);
  }
};
```

### 3. 打开生命周期修订版源命令

调用 `openLifecycleReviseFromCmd` 函数：

```typescript
const openLifecycleReviseFromCmd = async (physicalId: string) => {
  lifecycleCmdLoading.value = true;
  try {
    const topWindow = window.top || window.parent || window;
    const requireFn = topWindow.require || topWindow.requirejs || window.require;

    const [ReviseFromCmd, WAFData] = await Promise.all([
      loadDassaultModule('DS/LifecycleCmd/ReviseFromCmd'),
      loadDassaultModule('DS/WAFData/WAFData')
    ]);

    // Patch WAFData 请求
    applyReviseFromRequestPatch(WAFData);

    // 调用修订版源命令
    callLifecycleReviseEntry(ReviseFromCmd, physicalId, 'reviseFrom_command');
  } catch (error) {
    console.error('[PartDetailView] 打开新修订版源失败:', error);
    ElMessage.error('打开新修订版源失败');
  } finally {
    lifecycleCmdLoading.value = false;
  }
};
```

### 4. Patch ReviseFrom 请求

```typescript
const applyReviseFromRequestPatch = (WAFData: any) => {
  const originalAuthenticatedRequest = WAFData.authenticatedRequest;
  WAFData.authenticatedRequest = function (url: string, options: any) {
    const isReviseFromRequest =
      url &&
      (url.includes('/prepare_revise_checkavailability') || url.includes('/attributeList') || url.includes('/prepare_revise_maskattributes'));

    const shouldPatchReviseFromRequestData =
      url && (url.includes('/prepare_revise_checkavailability') || url.includes('/prepare_revise_maskattributes'));

    if (shouldPatchReviseFromRequestData && options?.data) {
      try {
        const requestData = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;
        if (Array.isArray(requestData?.data) && Array.isArray(currentReviseTargetNodes)) {
          // 补齐字段
          requestData.data = requestData.data.map((item: any) => {
            const source = currentReviseTargetNodes.find(node => node?.physicalid === item?.physicalid);
            if (source) {
              patchReviseFromObject(item, source);
            }
            return item;
          });
          options.data = JSON.stringify(requestData);
        }
      } catch (error) {
        console.error('[PartDetailView] Patch ReviseFrom 请求失败:', error);
      }
    }

    return originalAuthenticatedRequest.call(this, url, options);
  };
  WAFData.__twPatchReviseFromRequest = true;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/lifecycleCommands.ts` - 生命周期命令 composable
- `OOTBSources/ReviseWidget.js` - 达索 OOTB 源码

## 注意事项

1. 新修订版源功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 需要补齐 currentReviseTargetNodes 中的源对象信息
3. Patch WAFData 时必须隔离异常，不能中断原始流程
4. 需要用户有相应的达索许可证
5. 请求链路：prepare_revise_checkavailability -> attributeList -> prepare_revise_maskattributes
