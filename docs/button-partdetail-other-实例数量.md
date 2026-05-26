---
description: PartDetailView 其他功能 - 实例数量
---

# PartDetailView 其他功能 - 实例数量

## 概述

本文档说明 PartDetailView 的"实例数量"功能，用于设置节点的实例数量。

## 功能说明

"实例数量"功能打开对话框，允许用户为选中的节点设置实例数量。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已选中至少一个子节点
- 用户有修改实例数量的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleSelectedActionCommand('instanceQuantity')`
- 对话框：实例数量对话框

## 实现步骤

### 1. 点击选中行操作菜单项

用户点击选中行操作下拉菜单中的"实例数量"：

```vue
<el-dropdown-item
  v-if="selectedChildrenRows.length === 1"
  command="instanceQuantity">
  <span class="selected-action-icon">＋</span>
  <span>实例数量</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleSelectedActionCommand` 函数：

```typescript
const handleSelectedActionCommand = async (command: string) => {
  if (command === 'instanceQuantity') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要设置实例数量的节点');
      return;
    }
    await openInstanceQuantityDialog();
  }
};
```

### 3. 打开实例数量对话框

```typescript
const openInstanceQuantityDialog = () => {
  instanceQuantityRows.value = selectedChildrenRows.value.map(row => ({
    id: row.physicalid,
    label: row.title,
    quantity: row.quantity || 1
  }));
  instanceQuantityDialogVisible.value = true;
};
```

### 4. 实例数量对话框

```vue
<el-dialog
  v-model="instanceQuantityDialogVisible"
  title="实例数量"
  width="600px">
  <el-table :data="instanceQuantityRows" border>
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column label="数量" width="150">
      <template #default="{ row }">
        <el-input-number v-model="row.quantity" :min="1" />
      </template>
    </el-table-column>
  </el-table>
  <template #footer>
    <el-button type="primary" @click="handleConfirmInstanceQuantity">确定</el-button>
    <el-button @click="instanceQuantityDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认实例数量

```typescript
const handleConfirmInstanceQuantity = async () => {
  try {
    await partDetailApi.setInstanceQuantity(
      instanceQuantityRows.value.map(row => ({
        id: row.id,
        quantity: row.quantity
      }))
    );
    ElMessage.success('实例数量设置成功');
    instanceQuantityDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 设置实例数量失败:', error);
    ElMessage.error('设置实例数量失败');
  }
};
```

## API 接口

### 设置实例数量

- 接口：`partDetailApi.setInstanceQuantity(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    id: string;
    quantity: number;
  }[]
  ```
- 返回数据：设置成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要先选择要设置实例数量的节点
2. 实例数量必须大于 0
3. 支持批量设置多个节点的实例数量
4. 设置成功后会刷新产品结构
