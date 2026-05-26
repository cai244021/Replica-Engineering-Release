---
description: PartDetailView 其他功能 - 复制产品
---

# PartDetailView 其他功能 - 复制产品

## 概述

本文档说明 PartDetailView 的"复制产品"功能，用于复制选中的产品。

## 功能说明

"复制产品"功能复制选中的产品到剪贴板，或复制产品结构。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已选中至少一个子节点
- 用户有复制产品的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleSelectedActionCommand('duplicate')`
- 对话框：复制对话框

## 实现步骤

### 1. 点击选中行操作菜单项

用户点击选中行操作下拉菜单中的"复制"：

```vue
<el-dropdown-item command="duplicate">
  <span class="selected-action-icon">❐</span>
  <span>复制</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleSelectedActionCommand` 函数：

```typescript
const handleSelectedActionCommand = async (command: string) => {
  if (command === 'duplicate') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要复制的产品');
      return;
    }
    await openDuplicateDialog();
  }
};
```

### 3. 打开复制对话框

```typescript
const openDuplicateDialog = () => {
  duplicateProducts.value = selectedChildrenRows.value.map(row => ({
    id: row.physicalid,
    label: row.title,
    prefix: ''
  }));
  duplicateDialogVisible.value = true;
};
```

### 4. 复制对话框

```vue
<el-dialog
  v-model="duplicateDialogVisible"
  title="复制产品"
  width="600px">
  <el-table :data="duplicateProducts" border>
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column label="前缀" width="200">
      <template #default="{ row }">
        <el-input v-model="row.prefix" placeholder="输入前缀" />
      </template>
    </el-table-column>
  </el-table>
  <template #footer>
    <el-button type="primary" @click="submitDuplicateProducts">复制</el-button>
    <el-button @click="duplicateDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 提交复制

```typescript
const submitDuplicateProducts = async () => {
  try {
    await partDetailApi.duplicateProducts({
      products: duplicateProducts.value.map(p => ({
        id: p.id,
        prefix: p.prefix
      }))
    });
    ElMessage.success('复制成功');
    duplicateDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 复制产品失败:', error);
    ElMessage.error('复制产品失败');
  }
};
```

## API 接口

### 复制产品

- 接口：`partDetailApi.duplicateProducts(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    products: Array<{
      id: string;
      prefix: string;
    }>;
  }
  ```
- 返回数据：复制成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要先选择要复制的产品
2. 可以为复制的产品添加前缀
3. 支持批量复制多个产品
4. 复制成功后会刷新产品结构
