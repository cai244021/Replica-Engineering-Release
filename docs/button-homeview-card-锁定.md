---
description: HomeView 卡片操作 - 锁定功能
---

# HomeView 卡片操作 - 锁定

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"锁定"功能，用于锁定产品以防止其他用户修改。

## 功能说明

"锁定"功能允许用户锁定产品，锁定后其他用户无法修改该产品。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 产品当前未被锁定
- 用户有锁定产品的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('lock', item)`
- API：`partDetailApi.reserveOrUnreserve()`

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片下拉菜单中的"锁定"：

```vue
<el-dropdown-item command="lock">锁定</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'lock') {
    try {
      await partDetailApi.reserveOrUnreserve({
        operation: 'reserve',
        urls: [`model/bus/${item.id}`],
        isMultiSel: false
      });
      ElMessage.success('锁定成功');
      // 刷新产品列表
      await fetchCurrentList();
    } catch (error) {
      console.error('[HomeView] 锁定失败:', error);
      ElMessage.error('锁定失败');
    }
  }
  // ... 其他命令处理
};
```

### 3. 调用锁定 API

调用保留/释放 API：

```typescript
await partDetailApi.reserveOrUnreserve({
  operation: 'reserve',
  urls: [`model/bus/${item.id}`],
  isMultiSel: false
});
```

### 4. 刷新产品列表

锁定成功后，刷新产品列表以更新锁定状态：

```typescript
await fetchCurrentList();
```

## API 接口

### 保留/释放对象

- 接口：`partDetailApi.reserveOrUnreserve(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    operation: 'reserve' | 'unreserve';
    urls: string[];
    isMultiSel: boolean;
  }
  ```
- 返回数据：操作成功确认

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 锁定操作需要用户有相应的权限
2. 产品如果已被其他用户锁定，则无法再次锁定
3. 锁定成功后会刷新产品列表以更新状态
4. 锁定后，产品状态会显示为"已锁定"
5. 用户可以解锁自己锁定的产品
