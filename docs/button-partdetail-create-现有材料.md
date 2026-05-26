---
description: PartDetailView 创建菜单 - 现有材料功能
---

# PartDetailView 创建菜单 - 现有材料

## 概述

本文档说明 PartDetailView 创建菜单中的"现有材料"功能，用于将现有材料插入到产品结构中。

## 功能说明

"现有材料"功能打开材料选择对话框，用户可以选择现有材料并插入到产品结构中。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有插入材料的权限
- 当前产品未被锁定
- 已选中最多一个子节点

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('existingMaterial')`
- 对话框：现有材料选择对话框

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"现有材料"：

```vue
<el-dropdown-item
  v-if="selectedChildrenRows.length < 2"
  command="existingMaterial">
  <span class="create-menu-icon material-existing-icon"></span>
  <span>现有材料</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'existingMaterial') {
    if (selectedChildrenRows.value.length === 0) {
      ElMessage.warning('请先选择要添加材料的节点');
      return;
    }
    await openExistingMaterialDialog();
  }
};
```

### 3. 打开现有材料对话框

调用 `openExistingMaterialDialog` 函数：

```typescript
const openExistingMaterialDialog = () => {
  existingMaterialDialogVisible.value = true;
};
```

### 4. 现有材料对话框

对话框包含材料搜索和选择功能：

```vue
<el-dialog
  v-model="existingMaterialDialogVisible"
  title="插入现有材料"
  width="800px">
  <el-input
    v-model="existingMaterialSearchKeyword"
    placeholder="搜索材料"
    @keyup.enter="searchExistingMaterials" />
  <el-button @click="searchExistingMaterials">搜索</el-button>
  <el-table
    :data="existingMaterialSearchResults"
    border
    @selection-change="handleExistingMaterialSelectionChange">
    <el-table-column type="selection" width="44" />
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column prop="type" label="类型" width="150" />
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmInsertExistingMaterial">确定</el-button>
    <el-button @click="existingMaterialDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认插入现有材料

```typescript
const confirmInsertExistingMaterial = async () => {
  if (selectedExistingMaterials.value.length === 0) {
    ElMessage.warning('请选择要插入的材料');
    return;
  }

  try {
    const targetPhysicalId = selectedChildrenRows.value[0].physicalid;
    await partDetailApi.insertExistingMaterials({
      targetPhysicalId,
      materials: selectedExistingMaterials.value.map(m => m.id)
    });
    ElMessage.success('插入成功');
    existingMaterialDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 插入现有材料失败:', error);
    ElMessage.error('插入失败');
  }
};
```

## API 接口

### 插入现有材料

- 接口：`partDetailApi.insertExistingMaterials(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    targetPhysicalId: string;
    materials: string[];
  }
  ```
- 返回数据：插入成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 只能选择一个目标节点
2. 支持批量插入多个材料
3. 插入成功后会刷新产品结构
4. 需要验证插入的上下文是否有效
