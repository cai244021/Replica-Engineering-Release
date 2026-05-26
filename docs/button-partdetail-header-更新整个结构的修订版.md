---
description: PartDetailView 头部操作 - 更新整个结构的修订版功能
---

# PartDetailView 头部操作 - 更新整个结构的修订版

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"更新整个结构的修订版"功能，用于更新产品整个结构的修订版。

## 功能说明

"更新整个结构的修订版"功能打开确认对话框，显示将要更新的所有节点，用户确认后执行批量更新。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有更新修订版的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('updateRevisionAll')`
- 对话框：`src/views/UpdateEntireStructureRevisionConfirmDialog.vue`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"更新整个结构的修订版"：

```vue
<el-dropdown-item command="updateRevisionAll">
  <span class="part-action-menu-icon">▥</span>
  <span class="part-action-menu-label">更新整个结构的修订版</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'updateRevisionAll') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] updateRevisionAll 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleUpdateEntireStructureRevision();
  }
};
```

### 3. 获取更新整个结构修订版操作

调用 `handleUpdateEntireStructureRevision` 函数：

```typescript
const handleUpdateEntireStructureRevision = async () => {
  const rootPhysicalId = getParentPhysicalId();
  if (!rootPhysicalId) {
    ElMessage.error('未获取到根节点物理ID');
    return;
  }
  if (updateEntireStructureRevisionLoading.value) return;

  updateEntireStructureRevisionLoading.value = true;
  try {
    const response = await partDetailApi.getUpdateEntireStructureRevisionOperations(rootPhysicalId);
    updateEntireStructureRevisionConfirmations.value = response.operations?.confirmations || [];
    updateEntireStructureRevisionReplaceList.value = response.operations?.replaceList || [];
    updateEntireStructureRevisionDialogVisible.value = true;
  } catch (error) {
    console.error('[PartDetailView] 获取更新整个结构修订版操作失败:', error);
    ElMessage.error('获取更新整个结构修订版操作失败');
  } finally {
    updateEntireStructureRevisionLoading.value = false;
  }
};
```

### 4. 更新整个结构修订版确认对话框

对话框显示将要更新的节点和替换列表：

```vue
<el-dialog
  v-model="updateEntireStructureRevisionDialogVisible"
  title="更新整个结构的修订版"
  width="1000px">
  <el-tabs>
    <el-tab-pane label="确认列表">
      <el-table :data="updateEntireStructureRevisionConfirmations" border>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="currentRevision" label="当前修订版" width="120" />
        <el-table-column prop="targetRevision" label="目标修订版" width="120" />
      </el-table>
    </el-tab-pane>
    <el-tab-pane label="替换列表">
      <el-table :data="updateEntireStructureRevisionReplaceList" border>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="oldRevision" label="旧修订版" width="120" />
        <el-table-column prop="newRevision" label="新修订版" width="120" />
      </el-table>
    </el-tab-pane>
  </el-tabs>
  <template #footer>
    <el-button type="primary" @click="confirmUpdateEntireStructureRevision">确定</el-button>
    <el-button @click="updateEntireStructureRevisionDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

## API 接口

### 获取更新整个结构修订版操作

- 接口：`partDetailApi.getUpdateEntireStructureRevisionOperations(physicalId)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：`physicalId` - 根产品物理 ID
- 返回数据：
  ```typescript
  {
    operations: {
      confirmations: Array<{ title: string; currentRevision: string; targetRevision: string }>;
      replaceList: Array<{ title: string; oldRevision: string; newRevision: string }>;
    };
  }
  ```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/views/UpdateEntireStructureRevisionConfirmDialog.vue` - 更新整个结构修订版确认对话框
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 更新整个结构会影响所有子节点
2. 确认列表显示将要更新的节点
3. 替换列表显示修订版替换详情
4. 操作不可逆，需要用户仔细确认
5. 更新成功后会刷新整个产品结构
