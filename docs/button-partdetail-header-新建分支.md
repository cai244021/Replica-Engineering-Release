---
description: PartDetailView 头部操作 - 新建分支功能
---

# PartDetailView 头部操作 - 新建分支

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"新建分支"功能，用于创建产品的新分支。

## 功能说明

"新建分支"功能调用达索原生的 NewBranchCmd，创建产品的新分支。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有创建新分支的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('newBranch')`
- composable：`src/composables/lifecycleCommands.ts`
- OOTB 源码：`OOTBSources/NewBranchWidget.js`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"新建分支"：

```vue
<el-dropdown-item command="newBranch" :disabled="lifecycleCmdLoading">
  <span class="part-action-menu-icon">⌘</span>
  <span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新建分支' }}</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'newBranch') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newBranch 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openLifecycleNewBranchCmd(physicalId);
  }
};
```

### 3. 打开生命周期新建分支命令

调用 `openLifecycleNewBranchCmd` 函数：

```typescript
const openLifecycleNewBranchCmd = async (physicalId: string) => {
  lifecycleCmdLoading.value = true;
  try {
    const topWindow = window.top || window.parent || window;
    const requireFn = topWindow.require || topWindow.requirejs || window.require;

    const [NewBranchWidget, NewBranchCmd, WAFData] = await Promise.all([
      loadDassaultModule('DS/NewBranchWidget/NewBranchWidget'),
      loadDassaultModule('DS/LifecycleCmd/NewBranchCmd'),
      loadDassaultModule('DS/WAFData/WAFData')
    ]);

    // Patch WAFData 请求
    applyNewBranchRequestPatch(WAFData, physicalId);

    // 调用新建分支命令
    callLifecycleNewBranchEntry(NewBranchCmd, physicalId);
  } catch (error) {
    console.error('[PartDetailView] 打开新建分支失败:', error);
    ElMessage.error('打开新建分支失败');
  } finally {
    lifecycleCmdLoading.value = false;
  }
};
```

### 4. 调用生命周期新建分支入口

```typescript
const callLifecycleNewBranchEntry = (NewBranchCmd: any, physicalId: string) => {
  const NewBranchCmdCtor = NewBranchCmd?.default || NewBranchCmd;
  if (typeof NewBranchCmdCtor !== 'function') {
    throw new Error('DS/LifecycleCmd/NewBranchCmd 不是可实例化命令类');
  }

  const targetNode = buildLifecycleTargetNode(physicalId);
  const newBranchCmd = new NewBranchCmdCtor();
  newBranchCmd.execute(targetNode);
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/lifecycleCommands.ts` - 生命周期命令 composable
- `OOTBSources/NewBranchWidget.js` - 达索 OOTB 源码

## 注意事项

1. 新建分支功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 需要构造完整的达索目标节点
3. 需要用户有相应的达索许可证
4. 分支创建后会成为新的对象，需要刷新列表
