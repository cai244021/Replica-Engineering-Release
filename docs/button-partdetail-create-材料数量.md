---
description: PartDetailView 创建菜单 - 材料数量功能
---

# PartDetailView 创建菜单 - 材料数量

## 概述

本文档说明 PartDetailView 创建菜单中的"材料数量"功能，用于添加材料数量信息。

## 功能说明

"材料数量"功能为选中的节点添加材料数量属性。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有修改材料数量的权限
- 当前产品未被锁定
- 已选中至少一个子节点

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('materialQuantity')`
- 对话框：材料数量对话框

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"材料数量"：

```vue
<el-dropdown-item command="materialQuantity">
  <span class="create-menu-icon material-quantity-icon"></span>
  <span>材料数量</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'materialQuantity') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要添加材料数量的节点');
      return;
    }
    await openMaterialQuantityDialog();
  }
};
```

### 3. 打开材料数量对话框

调用 `openMaterialQuantityDialog` 函数：

```typescript
const openMaterialQuantityDialog = () => {
  materialQuantityRows.value = selectedChildrenRows.value.map(row => ({
    id: row.physicalid,
    label: row.title,
    quantity: row.quantity || 1
  }));
  materialQuantityDialogVisible.value = true;
};
```

### 4. 材料数量对话框

对话框包含材料数量表单：

```vue
<el-dialog
  v-model="materialQuantityDialogVisible"
  title="材料数量"
  width="600px">
  <el-table :data="materialQuantityRows" border>
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column label="数量" width="150">
      <template #default="{ row }">
        <el-input-number v-model="row.quantity" :min="1" />
      </template>
    </el-table-column>
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmMaterialQuantity">确定</el-button>
    <el-button @click="materialQuantityDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认材料数量

```typescript
const confirmMaterialQuantity = async () => {
  try {
    await partDetailApi.setMaterialQuantity(
      materialQuantityRows.value.map(row => ({
        id: row.id,
        quantity: row.quantity
      }))
    );
    ElMessage.success('材料数量设置成功');
    materialQuantityDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 设置材料数量失败:', error);
    ElMessage.error('设置材料数量失败');
  }
};
```

## API 接口

### 设置材料数量

- 接口：`partDetailApi.setMaterialQuantity(data)`
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

1. 需要先选择要设置材料数量的节点
2. 材料数量必须大于 0
3. 支持批量设置多个节点的材料数量
4. 设置成功后会刷新产品结构
