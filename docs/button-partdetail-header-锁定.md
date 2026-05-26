---
description: PartDetailView 头部操作 - 锁定功能
---

# PartDetailView 头部操作 - 锁定

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"锁定"功能，用于锁定当前产品。

## 功能说明

"锁定"功能允许用户锁定当前产品，锁定后其他用户无法修改该产品。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 产品当前未被锁定
- 用户有锁定产品的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('lock')`
- API：`partDetailApi.reserveOrUnreserve()`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"锁定"：

```vue
<el-dropdown-item command="lock" divided>
  <span class="part-action-menu-icon">🔒</span>
  <span class="part-action-menu-label">锁定</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'lock') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] lock 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleLock(physicalId);
  }
};
```

### 3. 执行锁定操作

调用 `handleLock` 函数：

```typescript
const handleLock = async (physicalId: string) => {
  try {
    await partDetailApi.reserveOrUnreserve({
      operation: 'reserve',
      urls: [`model/bus/${physicalId}`],
      isMultiSel: false
    });
    ElMessage.success('锁定成功');
    // 刷新产品信息
    await loadPartDetail(physicalId);
  } catch (error) {
    console.error('[PartDetailView] 锁定失败:', error);
    ElMessage.error('锁定失败');
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

1. 锁定操作需要用户有相应的权限
2. 产品如果已被其他用户锁定，则无法再次锁定
3. 锁定成功后会刷新产品信息以更新状态
4. 锁定后，产品状态会显示为"已锁定"
5. 用户可以解锁自己锁定的产品
