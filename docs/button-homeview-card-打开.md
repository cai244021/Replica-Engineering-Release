---
description: HomeView 卡片操作 - 打开功能
---

# HomeView 卡片操作 - 打开

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"打开"功能，用于打开产品详情页。

## 功能说明

"打开"功能从产品卡片下拉菜单中选择后，会导航到该产品的详情页。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 产品有有效的 physicalId

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('open', item)`
- 路由跳转：`router.push()`

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片右上角的下拉箭头，然后选择"打开"：

```vue
<el-dropdown-item command="open">
  <el-icon><Document /></el-icon>
  打开
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'open') {
    const physicalId = item.id || item.physicalid || item.physicalId;
    if (!physicalId) {
      ElMessage.warning('无法获取产品ID');
      return;
    }
    router.push({
      name: 'partDetail',
      params: {
        physicalId
      }
    });
  }
  // ... 其他命令处理
};
```

### 3. 路由跳转

使用 Vue Router 导航到产品详情页：

```typescript
router.push({
  name: 'partDetail',
  params: {
    physicalId
  }
});
```

## 路由配置

```typescript
{
  path: '/part-detail/:physicalId',
  name: 'partDetail',
  component: PartDetailView,
  props: true
}
```

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/router/index.ts` - 路由配置
- `src/views/PartDetailView.vue` - 产品详情页

## 注意事项

1. physicalId 可能有多种字段名（id、physicalid、physicalId），需要按优先级提取
2. 如果无法获取 physicalId，会显示警告消息并停止导航
3. 双击产品卡片也会触发相同的打开功能
