---
description: PartDetailView 创建菜单 - 上传文档功能
---

# PartDetailView 创建菜单 - 上传文档

## 概述

本文档说明 PartDetailView 创建菜单中的"上传文档"功能，用于上传文档到产品结构中。

## 功能说明

"上传文档"功能打开文件上传对话框，用户可以选择本地文件并上传到产品结构中。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有上传文档的权限
- 当前产品未被锁定
- 已选中最多一个子节点

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('uploadDocument')`
- 对话框：`src/views/UploadDocumentDialog.vue`

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"上传文档"：

```vue
<el-dropdown-item
  v-if="selectedChildrenRows.length < 2"
  command="uploadDocument">
  <span class="create-menu-icon upload-document-icon"></span>
  <span>上传文档</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'uploadDocument') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要关联文档的节点');
      return;
    }
    await openUploadDocumentDialog();
  }
};
```

### 3. 打开上传文档对话框

调用 `openUploadDocumentDialog` 函数：

```typescript
const openUploadDocumentDialog = () => {
  uploadDocumentParentPhysicalId.value = selectedChildrenRows.value[0].physicalid;
  dialogStore.openUploadDocumentDialog();
};
```

### 4. 上传文档对话框

对话框包含文件选择和上传功能：

```vue
<el-dialog
  v-model="uploadDocumentDialogVisible"
  title="上传文档"
  width="600px">
  <el-upload
    ref="uploadRef"
    :auto-upload="false"
    :on-change="handleFileChange"
    :file-list="uploadFileList"
    drag>
    <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
    <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
  </el-upload>
  <template #footer>
    <el-button type="primary" @click="handleUploadDocument">上传</el-button>
    <el-button @click="uploadDocumentDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 上传文档

```typescript
const handleUploadDocument = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  try {
    const formData = new FormData();
    uploadFileList.value.forEach(file => {
      formData.append('files', file.raw);
    });
    formData.append('parentPhysicalId', uploadDocumentParentPhysicalId.value);

    await partDetailApi.uploadDocument(formData);
    ElMessage.success('上传成功');
    uploadDocumentDialogVisible.value = false;
    uploadFileList.value = [];
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 上传文档失败:', error);
    ElMessage.error('上传失败');
  }
};
```

## API 接口

### 上传文档

- 接口：`partDetailApi.uploadDocument(formData)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：`FormData` - 包含文件和父节点 ID
- 返回数据：上传成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/views/UploadDocumentDialog.vue` - 上传文档对话框
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 只能选择一个目标节点
2. 支持批量上传多个文件
3. 上传成功后会刷新产品结构
4. 文件大小和类型可能有限制
