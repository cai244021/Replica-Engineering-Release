---
description: HomeView 卡片操作 - 解锁功能
---

# HomeView 卡片操作 - 解锁

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"解锁"功能，用于解锁已锁定的产品。

## 功能说明

"解锁"功能允许用户解锁自己锁定的产品，解锁后其他用户可以修改该产品。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 产品当前已被锁定
- 锁定者是当前用户

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('unlock', item)`
- API：`partDetailApi.reserveOrUnreserve()`

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片下拉菜单中的"解锁"：

```vue
<el-dropdown-item command="unlock">解锁</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'unlock') {
    try {
      await partDetailApi.reserveOrUnreserve({
        operation: 'unreserve',
        urls: [`model/bus/${item.id}`],
        isMultiSel: false
      });
      ElMessage.success('解锁成功');
      // 刷新产品列表
      await fetchCurrentList();
    } catch (error) {
      console.error('[HomeView] 解锁失败:', error);
      ElMessage.error('解锁失败');
    }
  }
  // ... 其他命令处理
};
```

### 3. 调用解锁 API

调用保留/释放 API：

```typescript
await partDetailApi.reserveOrUnreserve({
  operation: 'unreserve',
  urls: [`model/bus/${item.id}`],
  isMultiSel: false
});
```

### 4. 刷新产品列表

解锁成功后，刷新产品列表以更新锁定状态：

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

1. 只有锁定者才能解锁产品
2. 解锁操作需要用户有相应的权限
3. 解锁成功后会刷新产品列表以更新状态
4. 解锁后，产品状态会显示为"工作中"
5. 其他用户可以在产品解锁后对其进行修改
