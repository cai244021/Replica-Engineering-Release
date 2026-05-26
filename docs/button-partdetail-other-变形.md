---
description: PartDetailView 其他功能 - 变形
---

# PartDetailView 其他功能 - 变形

## 概述

本文档说明 PartDetailView 的"变形"功能，用于创建变形产品。

## 功能说明

"变形"功能打开对话框，允许用户为选中的产品添加前缀，创建变形版本。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已选中至少一个子节点
- 用户有创建变形产品的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleSelectedActionCommand('deform')`
- composable：`src/composables/deformDialog.ts`
- 对话框：变形对话框

## 实现步骤

### 1. 点击选中行操作菜单项

用户点击选中行操作下拉菜单中的"变形"：

```vue
<el-dropdown-item command="deform">
  <span class="selected-action-icon">⌘</span>
  <span>变形</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleSelectedActionCommand` 函数：

```typescript
const handleSelectedActionCommand = async (command: string) => {
  if (command === 'deform') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要变形的产品');
      return;
    }
    await openDeformDialog();
  }
};
```

### 3. 打开变形对话框

```typescript
const openDeformDialog = () => {
  deformTargets.value = selectedChildrenRows.value.map(row => ({
    id: row.physicalid,
    label: row.title
  }));
  deformPrefix.value = '';
  deformDialogVisible.value = true;
};
```

### 4. 变形对话框

```vue
<el-dialog
  v-model="deformDialogVisible"
  title="变形"
  width="600px">
  <el-form>
    <el-form-item label="前缀">
      <el-input v-model="deformPrefix" placeholder="输入变形前缀" />
    </el-form-item>
  </el-form>
  <el-table :data="deformTargets" border>
    <el-table-column prop="label" label="标题" min-width="300" />
  </el-table>
  <template #footer>
    <el-button type="primary" @click="submitDeformedProducts">变形</el-button>
    <el-button @click="deformDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 提交变形

```typescript
const submitDeformedProducts = async () => {
  try {
    await partDetailApi.createDeformedProducts({
      prefix: deformPrefix.value,
      products: deformTargets.value.map(p => p.id)
    });
    ElMessage.success('变形成功');
    deformDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 变形失败:', error);
    ElMessage.error('变形失败');
  }
};
```

## API 接口

### 创建变形产品

- 接口：`partDetailApi.createDeformedProducts(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    prefix: string;
    products: string[];
  }
  ```
- 返回数据：创建成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/deformDialog.ts` - 变形对话框 composable
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要先选择要变形的产品
2. 前缀会添加到产品名称前
3. 支持批量变形多个产品
4. 变形成功后会刷新产品结构
5. 需要验证插入的上下文是否有效
