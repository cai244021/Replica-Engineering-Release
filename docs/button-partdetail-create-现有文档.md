---
description: PartDetailView 创建菜单 - 现有文档功能
---

# PartDetailView 创建菜单 - 现有文档

## 概述

本文档说明 PartDetailView 创建菜单中的"现有文档"功能，用于将现有文档关联到产品结构中。

## 功能说明

"现有文档"功能打开文档选择对话框，用户可以选择现有文档并关联到产品结构中。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有关联文档的权限
- 当前产品未被锁定
- 已选中最多一个子节点

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('existingDocument')`
- 对话框：现有文档选择对话框

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"现有文档"：

```vue
<el-dropdown-item
  v-if="selectedChildrenRows.length < 2"
  command="existingDocument">
  <span class="create-menu-icon existing-document-icon"></span>
  <span>现有文档</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'existingDocument') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要关联文档的节点');
      return;
    }
    await openExistingDocumentDialog();
  }
};
```

### 3. 打开现有文档对话框

调用 `openExistingDocumentDialog` 函数：

```typescript
const openExistingDocumentDialog = () => {
  existingDocumentDialogVisible.value = true;
};
```

### 4. 现有文档对话框

对话框包含文档搜索和选择功能：

```vue
<el-dialog
  v-model="existingDocumentDialogVisible"
  title="关联现有文档"
  width="800px">
  <el-input
    v-model="existingDocumentSearchKeyword"
    placeholder="搜索文档"
    @keyup.enter="searchExistingDocuments" />
  <el-button @click="searchExistingDocuments">搜索</el-button>
  <el-table
    :data="existingDocumentSearchResults"
    border
    @selection-change="handleExistingDocumentSelectionChange">
    <el-table-column type="selection" width="44" />
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column prop="type" label="类型" width="150" />
    <el-table-column prop="revision" label="修订版" width="100" />
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmAttachExistingDocument">确定</el-button>
    <el-button @click="existingDocumentDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认关联现有文档

```typescript
const confirmAttachExistingDocument = async () => {
  if (selectedExistingDocuments.value.length === 0) {
    ElMessage.warning('请选择要关联的文档');
    return;
  }

  try {
    const targetPhysicalId = selectedChildrenRows.value[0].physicalid;
    await partDetailApi.attachExistingDocuments({
      targetPhysicalId,
      documents: selectedExistingDocuments.value.map(d => d.id)
    });
    ElMessage.success('关联成功');
    existingDocumentDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 关联现有文档失败:', error);
    ElMessage.error('关联失败');
  }
};
```

## API 接口

### 关联现有文档

- 接口：`partDetailApi.attachExistingDocuments(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    targetPhysicalId: string;
    documents: string[];
  }
  ```
- 返回数据：关联成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 只能选择一个目标节点
2. 支持批量关联多个文档
3. 关联成功后会刷新产品结构
4. 需要验证关联的上下文是否有效
