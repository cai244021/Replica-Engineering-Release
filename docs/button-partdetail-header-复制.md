---
description: PartDetailView 头部操作 - 复制功能
---

# PartDetailView 头部操作 - 复制

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"复制"功能，用于复制产品。

## 功能说明

"复制"功能调用达索原生的 DuplicateCmd，创建产品的副本。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有复制产品的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('copy')`
- composable：`src/composables/lifecycleCommands.ts`
- OOTB 源码：`OOTBSources/DuplicateCmd.js`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"复制"：

```vue
<el-dropdown-item command="copy" :disabled="lifecycleCmdLoading">
  <span class="part-action-menu-icon">❐</span>
  <span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '复制' }}</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'copy') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] copy 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openLifecycleDuplicateCmd(physicalId);
  }
};
```

### 3. 打开生命周期复制命令

调用 `openLifecycleDuplicateCmd` 函数：

```typescript
const openLifecycleDuplicateCmd = async (physicalId: string) => {
  lifecycleCmdLoading.value = true;
  try {
    const topWindow = window.top || window.parent || window;
    const requireFn = topWindow.require || topWindow.requirejs || window.require;

    const [DuplicateCmd, WAFData] = await Promise.all([
      loadDassaultModule('DS/LifecycleCmd/DuplicateCmd'),
      loadDassaultModule('DS/WAFData/WAFData')
    ]);

    // Patch WAFData 请求
    applyDuplicateRequestPatch(WAFData, physicalId);

    // 调用复制命令
    const DuplicateCmdCtor = DuplicateCmd?.default || DuplicateCmd;
    if (typeof DuplicateCmdCtor !== 'function') {
      throw new Error('DS/LifecycleCmd/DuplicateCmd 不是可实例化命令类');
    }

    const targetNode = buildLifecycleTargetNode(physicalId);
    const duplicateCmd = new DuplicateCmdCtor();
    duplicateCmd.execute(targetNode);
  } catch (error) {
    console.error('[PartDetailView] 打开复制失败:', error);
    ElMessage.error('打开复制失败');
  } finally {
    lifecycleCmdLoading.value = false;
  }
};
```

### 4. Patch 复制请求

```typescript
const applyDuplicateRequestPatch = (WAFData: any, physicalId: string) => {
  const originalAuthenticatedRequest = WAFData.authenticatedRequest;
  WAFData.authenticatedRequest = function (url: string, options: any) {
    const isDuplicateRequest = url && url.includes('/duplicate');

    if (isDuplicateRequest && options?.data) {
      try {
        const requestData = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;
        if (requestData?.data) {
          const targetNode = buildLifecycleTargetNode(physicalId);
          requestData.data = [targetNode];
          options.data = JSON.stringify(requestData);
        }
      } catch (error) {
        console.error('[PartDetailView] Patch 复制请求失败:', error);
      }
    }

    return originalAuthenticatedRequest.call(this, url, options);
  };
  WAFData.__twPatchDuplicateRequest = true;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/lifecycleCommands.ts` - 生命周期命令 composable
- `OOTBSources/DuplicateCmd.js` - 达索 OOTB 源码

## 注意事项

1. 复制功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 需要构造完整的达索目标节点
3. 复制后的产品会自动添加后缀
4. 需要用户有相应的达索许可证
5. 复制成功后会刷新产品列表
