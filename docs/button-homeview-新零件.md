---
description: HomeView 导航 - 新零件功能
---

# HomeView 导航 - 新零件

## 概述

本文档说明 HomeView 左侧导航栏的"新零件"功能，用于创建新的零件。

## 功能说明

"新零件"导航项打开新零件创建对话框，用户可以在对话框中输入零件信息并创建新零件。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有创建零件的权限
- 已获取 3DSpace URL

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCreatePart()`
- 对话框组件：`src/views/NewPartDialog.vue`

## 实现步骤

### 1. 点击导航项

用户点击左侧导航栏的"新零件"项：

```vue
<div
  class="nav-item"
  title="新零件"
  @click="handleCreatePart">
  <el-icon><CirclePlus /></el-icon>
  <span>新零件</span>
</div>
```

### 2. 处理创建零件点击

调用 `handleCreatePart` 函数打开新零件对话框：

```typescript
const handleCreatePart = () => {
  dialogStore.openNewPartDialog();
};
```

### 3. 打开新零件对话框

通过 Dialog Store 打开新零件对话框：

```typescript
// src/store/modules/dialog.ts
openNewPartDialog() {
  this.newPartDialogVisible = true;
}
```

### 4. 新零件对话框实现

新零件对话框 `NewPartDialog.vue` 包含：

- 零件名称输入框
- 描述输入框
- 类型选择
- 3D 模板选择
- 确定和取消按钮

用户填写信息后点击"确定"，调用创建零件 API：

```typescript
const handleSubmit = async () => {
  submitting.value = true;
  try {
    const response = await partApi.createPart({
      name: formData.name,
      description: formData.description,
      type: formData.type,
      template: formData.template
    });
    ElMessage.success('零件创建成功');
    visible.value = false;
    // 刷新产品列表
  } catch (error) {
    ElMessage.error('零件创建失败');
  } finally {
    submitting.value = false;
  }
};
```

### 5. 保存功能

对话框还提供"保存"功能，用于保存草稿：

```typescript
const handleSave = async () => {
  saving.value = true;
  try {
    await partApi.savePartDraft(formData);
    ElMessage.success('草稿保存成功');
  } catch (error) {
    ElMessage.error('草稿保存失败');
  } finally {
    saving.value = false;
  }
};
```

## API 接口

### 创建零件

- 接口：`partApi.createPart(data)`
- 位置：`src/api/partApi.ts`
- 请求参数：
  - `name`: 零件名称
  - `description`: 零件描述
  - `type`: 零件类型
  - `template`: 3D 模板
- 返回数据：创建成功的零件信息

### 保存零件草稿

- 接口：`partApi.savePartDraft(data)`
- 位置：`src/api/partApi.ts`
- 请求参数：零件表单数据
- 返回数据：保存成功确认

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/views/NewPartDialog.vue` - 新零件对话框组件
- `src/store/modules/dialog.ts` - 对话框状态管理
- `src/api/partApi.ts` - 零件 API

## 注意事项

1. 创建零件需要用户有相应的权限
2. 零件名称不能为空
3. 可以选择 3D 模板来初始化零件
4. 创建成功后会关闭对话框并刷新产品列表
5. 支持保存草稿功能，方便后续继续编辑
