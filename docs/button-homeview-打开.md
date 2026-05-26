---
description: HomeView 导航 - 打开功能
---

# HomeView 导航 - 打开

## 概述

本文档说明 HomeView 左侧导航栏的"打开"功能，用于通过达索搜索对话框打开指定的产品。

## 功能说明

"打开"导航项打开达索 3DEXPERIENCE 平台的原生搜索对话框，用户可以在对话框中搜索并选择产品，然后导航到产品详情页。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已加载 ds-search-input 插件
- 用户有搜索产品的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleNavClick('open')`
- 搜索对话框：`openDsSearchDialog()`

## 实现步骤

### 1. 点击导航项

用户点击左侧导航栏的"打开"项：

```vue
<div
  class="nav-item"
  :class="{ active: currentNav === 'open' }"
  title="打开"
  @click="handleNavClick('open')">
  <el-icon><FolderOpened /></el-icon>
  <span>打开</span>
</div>
```

### 2. 处理导航点击

调用 `handleNavClick` 函数：

```typescript
const handleNavClick = async (nav: string) => {
  currentNav.value = nav;
  console.log(`[HomeView] 切换到导航: ${nav}`);

  if (nav === 'myProducts') {
    await fetchMyProducts();
  } else if (nav === 'recent') {
    await fetchRecentProducts();
  } else if (nav === 'open') {
    openDsSearchDialog();
  }
};
```

### 3. 打开搜索对话框

调用达索搜索插件 `ds-search-input`：

```typescript
const openDsSearchDialog = () => {
  dsSearchInput(searchData.value, 'product', 'PSE', '', function (value: Array<any>) {
    searchData.value = value.length !== 0 ? value.map(item => item['ds6w:label']).toString() : '';

    const selectedObject = value[0];
    const physicalId = selectedObject?.physicalid || selectedObject?.physicalId || selectedObject?.id || selectedObject?.objectId;

    if (!physicalId) {
      ElMessage.warning('无法获取选择对象的ID');
      return;
    }

    router.push({
      name: 'partDetail',
      params: {
        physicalId
      }
    });
  });
};
```

### 4. 处理搜索结果

当用户在搜索对话框中选择产品后：

1. 提取选中对象的 physicalId
2. 验证 physicalId 是否有效
3. 使用 Vue Router 导航到产品详情页

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
- `src/plugins/ds-search-input.ts` - 达索搜索插件
- `src/views/PartDetailView.vue` - 产品详情页

## 注意事项

1. `ds-search-input` 是达索提供的搜索插件，需要确保已正确加载
2. 搜索类型为 'product'，上下文为 'PSE'
3. physicalId 可能有多种字段名（physicalid、physicalId、id、objectId），需要按优先级提取
4. 如果无法获取 physicalId，会显示警告消息并停止导航
