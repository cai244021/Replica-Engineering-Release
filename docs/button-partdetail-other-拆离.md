---
description: PartDetailView 其他功能 - 拆离
---

# PartDetailView 其他功能 - 拆离

## 概述

本文档说明 PartDetailView 的"拆离"功能，用于从父节点拆离选中的子节点。

## 功能说明

"拆离"功能将选中的子节点从其父节点中移除，使其成为独立的节点。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已选中至少一个子节点
- 用户有拆离节点的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleSelectedActionCommand('unparent')`
- 对话框：`src/views/UnparentConfirmDialog.vue`

## 实现步骤

### 1. 点击选中行操作菜单项

用户点击选中行操作下拉菜单中的"拆离"：

```vue
<el-dropdown-item command="unparent">
  <span class="selected-action-icon">拆</span>
  <span>拆离</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleSelectedActionCommand` 函数：

```typescript
const handleSelectedActionCommand = async (command: string) => {
  if (command === 'unparent') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要拆离的节点');
      return;
    }
    await openUnparentConfirmDialog();
  }
};
```

### 3. 打开拆离确认对话框

```typescript
const openUnparentConfirmDialog = () => {
  unparentTargets.value = selectedChildrenRows.value.map(row => ({
    id: row.physicalid,
    label: row.title
  }));
  unparentConfirmDialogVisible.value = true;
};
```

### 4. 拆离确认对话框

```vue
<el-dialog
  v-model="unparentConfirmDialogVisible"
  title="确认拆离"
  width="500px">
  <p>确定要拆以下节点吗？</p>
  <el-table :data="unparentTargets" border>
    <el-table-column prop="label" label="标题" min-width="300" />
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmUnparent">拆离</el-button>
    <el-button @click="unparentConfirmDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认拆离

```typescript
const confirmUnparent = async () => {
  try {
    await partDetailApi.unparentNodes({
      nodes: unparentTargets.value.map(p => p.id)
    });
    ElMessage.success('拆离成功');
    unparentConfirmDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 拆离失败:', error);
    ElMessage.error('拆离失败');
  }
};
```

## API 接口

### 拆离节点

- 接口：`partDetailApi.unparentNodes(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    nodes: string[];
  }
  ```
- 返回数据：拆离成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/views/UnparentConfirmDialog.vue` - 拆离确认对话框
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要先选择要拆离的节点
2. 拆离操作不可逆，需要用户二次确认
3. 支持批量拆离多个节点
4. 拆离成功后会刷新产品结构
5. 拆离后的节点会成为独立的顶层节点
