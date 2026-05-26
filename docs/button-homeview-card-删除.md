---
description: HomeView 卡片操作 - 删除功能
---

# HomeView 卡片操作 - 删除

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"删除"功能，用于删除产品。

## 功能说明

"删除"功能允许用户删除选中的产品，删除成功后会从产品列表中移除。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 用户有删除产品的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('delete', item)`
- API：`partDetailApi.deleteProducts()`

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片下拉菜单中的"删除"：

```vue
<el-dropdown-item command="delete">删除</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'delete') {
    ElMessageBox.confirm(
      `确定要删除产品 "${item.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await partDetailApi.deleteProducts([item.id]);
        ElMessage.success('删除成功');
        // 从产品列表中移除
        productList.value = productList.value.filter(p => p.id !== item.id);
      } catch (error) {
        console.error('[HomeView] 删除产品失败:', error);
        ElMessage.error('删除失败');
      }
    }).catch(() => {
      // 用户取消删除
    });
  }
  // ... 其他命令处理
};
```

### 3. 确认删除

使用 Element Plus 的 MessageBox 显示确认对话框，用户确认后才执行删除操作。

### 4. 调用删除 API

调用删除产品 API：

```typescript
await partDetailApi.deleteProducts([item.id]);
```

### 5. 更新产品列表

删除成功后，从产品列表中移除该产品：

```typescript
productList.value = productList.value.filter(p => p.id !== item.id);
```

## API 接口

### 删除产品

- 接口：`partDetailApi.deleteProducts(ids)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：`string[]` - 产品 ID 数组
- 返回数据：删除成功确认

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 删除操作不可逆，需要用户二次确认
2. 删除前需要检查产品是否被锁定
3. 删除成功后会从产品列表中移除
4. 如果删除失败，会显示错误消息
5. 支持批量删除（传入多个 ID）
