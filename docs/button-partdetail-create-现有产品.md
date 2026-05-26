---
description: PartDetailView 创建菜单 - 现有产品功能
---

# PartDetailView 创建菜单 - 现有产品

## 概述

本文档说明 PartDetailView 创建菜单中的"现有产品"功能，用于将现有产品插入到当前产品结构中。

## 功能说明

"现有产品"功能打开搜索对话框，用户可以选择现有产品并插入到当前产品结构中。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有插入产品的权限
- 当前产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleCreateMenuCommand('existingProduct')`
- 对话框：现有产品选择对话框

## 实现步骤

### 1. 点击创建菜单项

用户点击创建下拉菜单中的"现有产品"：

```vue
<el-dropdown-item command="existingProduct">
  <span class="create-menu-icon product-existing-icon"></span>
  <span>现有产品</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCreateMenuCommand` 函数：

```typescript
const handleCreateMenuCommand = async (command: string) => {
  if (command === 'existingProduct') {
    const parentPhysicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] existingProduct 点击，父节点物理ID:', parentPhysicalId);
    if (!parentPhysicalId) {
      ElMessage.warning('未找到父节点物理ID');
      return;
    }
    await openExistingProductDialog(parentPhysicalId);
  }
};
```

### 3. 打开现有产品选择对话框

调用 `openExistingProductDialog` 函数：

```typescript
const openExistingProductDialog = async (parentPhysicalId: string) => {
  existingProductParentPhysicalId.value = parentPhysicalId;
  existingProductDialogVisible.value = true;
};
```

### 4. 现有产品选择对话框

对话框包含搜索和选择功能：

```vue
<el-dialog
  v-model="existingProductDialogVisible"
  title="插入现有产品"
  width="800px">
  <el-input
    v-model="existingProductSearchKeyword"
    placeholder="搜索产品"
    @keyup.enter="searchExistingProducts" />
  <el-button @click="searchExistingProducts">搜索</el-button>
  <el-table
    :data="existingProductSearchResults"
    border
    @selection-change="handleExistingProductSelectionChange">
    <el-table-column type="selection" width="44" />
    <el-table-column prop="label" label="标题" min-width="200" />
    <el-table-column prop="revision" label="修订版" width="100" />
  </el-table>
  <template #footer>
    <el-button type="primary" @click="confirmInsertExistingProduct">确定</el-button>
    <el-button @click="existingProductDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 5. 确认插入现有产品

```typescript
const confirmInsertExistingProduct = async () => {
  if (selectedExistingProducts.value.length === 0) {
    ElMessage.warning('请选择要插入的产品');
    return;
  }

  try {
    await partDetailApi.insertExistingProducts({
      parentPhysicalId: existingProductParentPhysicalId.value,
      products: selectedExistingProducts.value.map(p => p.id)
    });
    ElMessage.success('插入成功');
    existingProductDialogVisible.value = false;
    // 刷新结构
    await loadExpandData(existingProductParentPhysicalId.value);
  } catch (error) {
    console.error('[PartDetailView] 插入现有产品失败:', error);
    ElMessage.error('插入失败');
  }
};
```

## API 接口

### 插入现有产品

- 接口：`partDetailApi.insertExistingProducts(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    parentPhysicalId: string;
    products: string[];
  }
  ```
- 返回数据：插入成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 支持批量插入多个产品
2. 插入的产品会成为当前产品的子节点
3. 插入成功后会刷新产品结构
4. 需要验证插入的上下文是否有效
