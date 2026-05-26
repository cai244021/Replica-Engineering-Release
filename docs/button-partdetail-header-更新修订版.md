---
description: PartDetailView 头部操作 - 更新修订版功能
---

# PartDetailView 头部操作 - 更新修订版

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"更新修订版"功能，用于更新产品结构中指定节点的修订版。

## 功能说明

"更新修订版"功能打开更新修订版对话框，允许用户选择要更新的节点及其新的修订版。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有更新修订版的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('updateRevision')`
- 对话框：`src/views/UpdateRevisionDialog.vue`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"更新修订版"：

```vue
<el-dropdown-item command="updateRevision">
  <span class="part-action-menu-icon">↯</span>
  <span class="part-action-menu-label">更新修订版</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'updateRevision') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] updateRevision 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openUpdateRevisionDialog(physicalId);
  }
};
```

### 3. 打开更新修订版对话框

调用 `openUpdateRevisionDialog` 函数获取更新修订版操作：

```typescript
const openUpdateRevisionDialog = async (physicalId: string) => {
  updateRevisionLoading.value = true;
  try {
    const response = await partDetailApi.getUpdateRevisionOperations(physicalId);
    updateRevisionOperations.value = response.operations || [];
    updateRevisionDialogVisible.value = true;
  } catch (error) {
    console.error('[PartDetailView] 获取更新修订版操作失败:', error);
    ElMessage.error('获取更新修订版操作失败');
  } finally {
    updateRevisionLoading.value = false;
  }
};
```

### 4. 更新修订版对话框

对话框显示可更新的节点及其可用修订版：

```vue
<el-dialog
  v-model="updateRevisionDialogVisible"
  title="更新修订版"
  width="900px">
  <el-table
    :data="updateRevisionOperations"
    border
    height="500"
    @selection-change="handleUpdateRevisionSelectionChange">
    <el-table-column type="selection" width="44" />
    <el-table-column prop="title" label="标题" min-width="200" />
    <el-table-column prop="currentRevision" label="当前修订版" width="120" />
    <el-table-column label="目标修订版" min-width="200">
      <template #default="{ row }">
        <el-select v-model="row.targetRevision" placeholder="选择修订版">
          <el-option
            v-for="rev in row.availableRevisions"
            :key="rev.id"
            :label="rev.label"
            :value="rev.id" />
        </el-select>
      </template>
    </el-table-column>
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmUpdateRevision">确定</el-button>
    <el-button @click="updateRevisionDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

## API 接口

### 获取更新修订版操作

- 接口：`partDetailApi.getUpdateRevisionOperations(physicalId)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：`physicalId` - 产品物理 ID
- 返回数据：
  ```typescript
  {
    operations: {
      id: string;
      title: string;
      currentRevision: string;
      availableRevisions: Array<{ id: string; label: string }>;
    }[];
  }
  ```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/views/UpdateRevisionDialog.vue` - 更新修订版对话框
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要选择至少一个节点才能执行更新
2. 每个节点可以选择不同的目标修订版
3. 更新操作可能会影响下游节点
4. 更新成功后会刷新产品结构
