---
description: PartDetailView 创建菜单 - 新零件功能
---

# PartDetailView 创建菜单 - 新零件

## 概述

本文档说明 PartDetailView 创建菜单中的"新零件"功能，用于在产品结构中创建新零件。

## 功能说明

"新零件"功能在当前产品的结构中创建一个新零件，并将其作为子节点插入。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有创建零件的权限
- 当前产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('newPart')`
- 对话框：`src/views/NewPartDialog.vue`
- API：`partDetailApi.createPart()`

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"新零件"：

```vue
<el-dropdown-item command="newPart">
  <span class="create-menu-icon part-new-icon"></span>
  <span>新零件</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'newPart') {
    const parentPhysicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] newPart 点击，父节点物理ID:', parentPhysicalId);
    if (!parentPhysicalId) {
      ElMessage.warning('未找到父节点物理ID');
      return;
    }
    await openNewPartDialog(parentPhysicalId);
  }
};
```

### 3. 打开新零件对话框

调用 `openNewPartDialog` 函数：

```typescript
const openNewPartDialog = async (parentPhysicalId: string) => {
  newPartParentPhysicalId.value = parentPhysicalId;
  dialogStore.openNewPartDialog();
};
```

### 4. 新零件对话框

对话框包含零件信息表单：

```vue
<el-dialog
  v-model="newPartDialogVisible"
  title="新零件"
  width="600px">
  <el-form :model="newPartFormData">
    <el-form-item label="名称">
      <el-input v-model="newPartFormData.name" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="newPartFormData.description" type="textarea" />
    </el-form-item>
    <el-form-item label="3D 模板">
      <el-select v-model="newPartFormData.template">
        <el-option label="无" value="" />
        <!-- 更多模板选项 -->
      </el-select>
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button type="primary" @click="handleCreateNewPart">创建</el-button>
    <el-button @click="newPartDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 创建新零件

```typescript
const handleCreateNewPart = async () => {
  try {
    await partDetailApi.createPart({
      parentPhysicalId: newPartParentPhysicalId.value,
      name: newPartFormData.value.name,
      description: newPartFormData.value.description,
      template: newPartFormData.value.template
    });
    ElMessage.success('新零件创建成功');
    newPartDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(newPartParentPhysicalId.value);
  } catch (error) {
    console.error('[PartDetailView] 创建新零件失败:', error);
    ElMessage.error('创建新零件失败');
  }
};
```

## API 接口

### 创建零件

- 接口：`partDetailApi.createPart(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    parentPhysicalId: string;
    name: string;
    description: string;
    template: string;
  }
  ```
- 返回数据：创建成功的零件信息

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/views/NewPartDialog.vue` - 新零件对话框
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 创建的新零件会作为当前产品的子节点
2. 可以选择 3D 模板来初始化零件
3. 创建成功后会刷新产品结构
4. 需要用户有相应的权限
