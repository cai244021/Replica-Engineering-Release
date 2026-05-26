---
description: PartDetailView 头部操作 - 解锁功能
---

# PartDetailView 头部操作 - 解锁

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"解锁"功能，用于解锁已锁定的产品。

## 功能说明

"解锁"功能允许用户解锁自己锁定的产品，解锁后其他用户可以修改该产品。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 产品当前已被锁定
- 锁定者是当前用户

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('unlock')`
- API：`partDetailApi.reserveOrUnreserve()`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"解锁"：

```vue
<el-dropdown-item command="unlock">
  <span class="part-action-menu-icon">🔓</span>
  <span class="part-action-menu-label">解锁</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'unlock') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] unlock 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleUnlock(physicalId);
  }
};
```

### 3. 执行解锁操作

调用 `handleUnlock` 函数：

```typescript
const handleUnlock = async (physicalId: string) => {
  try {
    await partDetailApi.reserveOrUnreserve({
      operation: 'unreserve',
      urls: [`model/bus/${physicalId}`],
      isMultiSel: false
    });
    ElMessage.success('解锁成功');
    // 刷新产品信息
    await loadPartDetail(physicalId);
  } catch (error) {
    console.error('[PartDetailView] 解锁失败:', error);
    ElMessage.error('解锁失败');
  }
};
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

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 只有锁定者才能解锁产品
2. 解锁操作需要用户有相应的权限
3. 解锁成功后会刷新产品信息以更新状态
4. 解锁后，产品状态会显示为"工作中"
5. 其他用户可以在产品解锁后对其进行修改
