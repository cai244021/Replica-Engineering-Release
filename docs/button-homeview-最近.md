---
description: HomeView 导航 - 最近功能
---

# HomeView 导航 - 最近

## 概述

本文档说明 HomeView 左侧导航栏的"最近"功能，用于显示用户最近访问的产品列表。

## 功能说明

"最近"导航项显示用户最近访问的产品，方便快速重新打开之前查看过的产品。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已获取 3DSpace URL
- 用户有最近访问产品的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleNavClick('recent')`
- 数据加载：`fetchRecentProducts()`

## 实现步骤

### 1. 点击导航项

用户点击左侧导航栏的"最近"项：

```vue
<div
  class="nav-item"
  :class="{ active: currentNav === 'recent' }"
  title="最近"
  @click="handleNavClick('recent')">
  <el-icon><Clock /></el-icon>
  <span>最近</span>
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

### 3. 获取最近产品数据

调用 `recentApi.getRecentProducts()` 获取最近访问的产品列表：

```typescript
const fetchRecentProducts = async () => {
  loading.value = true;
  console.log('[HomeView] 开始获取最近产品');

  try {
    // 确保已经获取了 3DSpace URL
    if (!baseInfoStore.spaceUrl) {
      console.log('[HomeView] 3DSpace URL 为空，先获取 URL');
      await baseInfoStore.fetchSpaceUrl();
    }

    console.log('[HomeView] 当前 3DSpace URL:', baseInfoStore.spaceUrl);
    console.log('[HomeView] 当前 SecurityContext:', baseInfoStore.securityContext);

    const response = await recentApi.getRecentProducts();
    console.log('[HomeView] 最近产品响应:', response);

    // 处理返回结果
    if (response && response.results && response.results.length > 0) {
      productList.value = response.results.map((item: any, index: number) => {
        const attrs = item.attributes || [];

        const physicalid = getAttributeValue(attrs, 'physicalid');
        const label = getAttributeValue(attrs, 'ds6w:label');
        // ... 更多字段提取

        return {
          id: physicalid || index,
          name: label || '未命名',
          // ... 更多字段
        };
      });
    } else {
      productList.value = [];
    }
  } catch (error) {
    console.error('[HomeView] 获取最近产品失败:', error);
    ElMessage.error('获取最近产品失败');
    productList.value = [];
  } finally {
    loading.value = false;
  }
};
```

### 4. 显示产品列表

产品列表会显示在网格视图或列表视图中，用户可以：

- 查看产品缩略图、名称、版本、状态、所有者等信息
- 双击产品卡片打开详情页
- 右键点击产品卡片显示操作菜单

## API 接口

### 获取最近产品

- 接口：`recentApi.getRecentProducts()`
- 位置：`src/api/recentApi.ts`
- 请求参数：无
- 返回数据：包含最近访问产品的 attributes 数组

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/api/recentApi.ts` - 最近产品 API
- `src/store/modules/baseInfo.ts` - 基础信息 Store

## 注意事项

1. 需要先获取 3DSpace URL 才能调用最近产品接口
2. 如果没有最近访问的产品，列表会显示为空
3. 产品信息从 attributes 数组中提取，字段名称遵循 6W 标签规范
