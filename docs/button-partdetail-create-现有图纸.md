---
description: PartDetailView 创建菜单 - 现有图纸功能
---

# PartDetailView 创建菜单 - 现有图纸

## 概述

本文档说明 PartDetailView 创建菜单中的"现有图纸"功能，用于将现有图纸关联到产品结构中。

## 功能说明

"现有图纸"功能打开图纸选择对话框，用户可以选择现有图纸并关联到产品结构中。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有关联图纸的权限
- 当前产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('existingDrawing')`
- 对话框：现有图纸选择对话框

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"现有图纸"：

```vue
<el-dropdown-item command="existingDrawing">
  <span class="create-menu-icon drawing-existing-icon"></span>
  <span>现有图纸</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'existingDrawing') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] existingDrawing 点击，物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await openExistingDrawingDialog(physicalId);
  }
};
```

### 3. 打开现有图纸对话框

调用 `openExistingDrawingDialog` 函数：

```typescript
const openExistingDrawingDialog = (physicalId: string) => {
  existingDrawingParentPhysicalId.value = physicalId;
  existingDrawingDialogVisible.value = true;
};
```

### 4. 现有图纸对话框

对话框包含图纸搜索和选择功能：

```vue
<el-dialog
  v-model="existingDrawingDialogVisible"
  title="关联现有图纸"
  width="800px">
  <el-input
    v-model="existingDrawingSearchKeyword"
    placeholder="搜索图纸"
    @keyup.enter="searchExistingDrawings" />
  <el-button @click="searchExistingDrawings">搜索</el-button>
  <el-table
    :data="existingDrawingSearchResults"
    border
    @selection-change="handleExistingDrawingSelectionChange">
    <el-table-column type="selection" width="44" />
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column prop="type" label="类型" width="150" />
    <el-table-column prop="revision" label="修订版" width="100" />
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmAttachExistingDrawing">确定</el-button>
    <el-button @click="existingDrawingDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认关联现有图纸

```typescript
const confirmAttachExistingDrawing = async () => {
  if (selectedExistingDrawings.value.length === 0) {
    ElMessage.warning('请选择要关联的图纸');
    return;
  }

  try {
    await partDetailApi.attachExistingDrawings({
      targetPhysicalId: existingDrawingParentPhysicalId.value,
      drawings: selectedExistingDrawings.value.map(d => d.id)
    });
    ElMessage.success('关联成功');
    existingDrawingDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(existingDrawingParentPhysicalId.value);
  } catch (error) {
    console.error('[PartDetailView] 关联现有图纸失败:', error);
    ElMessage.error('关联失败');
  }
};
```

## API 接口

### 关联现有图纸

- 接口：`partDetailApi.attachExistingDrawings(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    targetPhysicalId: string;
    drawings: string[];
  }
  ```
- 返回数据：关联成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 支持批量关联多个图纸
2. 关联成功后会刷新产品结构
3. 需要验证关联的上下文是否有效
