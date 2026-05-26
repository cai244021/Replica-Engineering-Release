---
description: PartDetailView 头部操作 - 删除功能
---

# PartDetailView 头部操作 - 删除

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"删除"功能，用于删除当前产品。

## 功能说明

"删除"功能允许用户删除当前查看的产品，删除成功后会返回主页。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有删除产品的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('delete')`
- composable：`src/composables/headerActions.ts`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"删除"：

```vue
<el-dropdown-item command="delete" :disabled="lifecycleCmdLoading">
  <span class="part-action-menu-icon">⌫</span>
  <span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '删除' }}</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'delete') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] delete 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await executeDeleteTargets([buildLifecycleTargetNodeFromPartInfo(physicalId)], async () => {
      ElMessage.success('删除成功');
      await router.push('/');
    });
  }
};
```

### 3. 构造目标节点

构造达索生命周期命令所需的目标节点：

```typescript
const buildLifecycleTargetNodeFromPartInfo = (physicalId: string) => {
  return {
    getID: () => physicalId,
    id: physicalId,
    objectId: physicalId,
    physicalid: physicalId,
    physicalId,
    type: partInfo.value?.['ds6w:type'] || 'VPMReference',
    displayName: partInfo.value?.['ds6w:label'] || physicalId,
    // ... 更多字段
  };
};
```

### 4. 执行删除

调用删除目标函数：

```typescript
const executeDeleteTargets = async (targetNodes: any[], onDeleted: () => void | Promise<void>) => {
  const topWindow = window.top || window.parent || window;
  const requireFn = topWindow.require || topWindow.requirejs || window.require;

  requireFn(['DS/LifecycleCmd/DeleteCmd'], (DeleteCmd: any) => {
    const deleteCmd = new DeleteCmd();
    deleteCmd.execute(targetNodes, {
      onSuccess: async () => {
        await onDeleted();
      },
      onFailure: (error: any) => {
        console.error('[PartDetailView] 删除失败:', error);
        ElMessage.error('删除失败');
      }
    });
  });
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/headerActions.ts` - 头部操作 composable

## 注意事项

1. 删除操作不可逆，需要用户二次确认
2. 删除成功后会返回主页
3. 需要构造完整的达索目标节点
4. 使用达索原生 DeleteCmd 执行删除操作
