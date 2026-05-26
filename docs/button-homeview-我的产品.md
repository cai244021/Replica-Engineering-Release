---
description: HomeView 导航 - 我的产品功能
---

# HomeView 导航 - 我的产品

## 概述

本文档说明 HomeView 左侧导航栏的"我的产品"功能，用于显示用户拥有的产品列表。

## 功能说明

"我的产品"导航项显示当前用户拥有的所有产品，通过搜索接口获取。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 已获取搜索 URL
- 用户有搜索产品的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleNavClick('myProducts')`
- 数据加载：`fetchMyProducts()`

## 实现步骤

### 1. 点击导航项

用户点击左侧导航栏的"我的产品"项：

```vue
<div
  class="nav-item"
  :class="{ active: currentNav === 'myProducts' }"
  title="我的产品"
  @click="handleNavClick('myProducts')">
  <el-icon><Box /></el-icon>
  <span>我的产品</span>
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

### 3. 获取我的产品数据

调用 `searchApi.searchMyProducts()` 搜索用户拥有的产品：

```typescript
const fetchMyProducts = async () => {
  loading.value = true;
  console.log('[HomeView] 开始获取我的产品');

  try {
    // 确保已经获取了搜索 URL
    if (!baseInfoStore.searchUrl) {
      console.log('[HomeView] 搜索 URL 为空，先获取搜索 URL');
      await baseInfoStore.fetchSearchUrl();
    }

    console.log('[HomeView] 当前搜索 URL:', baseInfoStore.searchUrl);
    console.log('[HomeView] 当前 3DSpace URL:', baseInfoStore.spaceUrl);
    console.log('[HomeView] 当前用户:', baseInfoStore.currentUser);

    const response = await searchApi.searchMyProducts();
    console.log('[HomeView] 搜索响应:', response);

    // 处理搜索结果
    if (response && response.results && response.results.length > 0) {
      productList.value = response.results.map((item: any, index: number) => {
        const attrs = item.attributes || [];

        const physicalid = getAttributeValue(attrs, 'physicalid');
        const label = getAttributeValue(attrs, 'ds6w:label');
        const status = getAttributeValue(attrs, 'ds6w:what/ds6w:status') || getAttributeValue(attrs, 'ds6w:status');

        // 格式化状态显示
        let statusText = '工作中';
        if (status) {
          if (status.includes('IN_WORK')) {
            statusText = '工作中';
          } else if (status.includes('RELEASED')) {
            statusText = '已发布';
          } else if (status.includes('FROZEN')) {
            statusText = '已冻结';
          }
        }

        return {
          id: physicalid || index,
          name: label || '未命名',
          status: statusText,
          // ... 更多字段
        };
      });
    } else {
      productList.value = [];
    }
  } catch (error) {
    console.error('[HomeView] 获取我的产品失败:', error);
    ElMessage.error('获取我的产品失败');
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

### 搜索我的产品

- 接口：`searchApi.searchMyProducts()`
- 位置：`src/api/searchApi.ts`
- 请求参数：无
- 返回数据：包含用户产品搜索结果的 attributes 数组

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/api/searchApi.ts` - 搜索 API
- `src/store/modules/baseInfo.ts` - 基础信息 Store

## 注意事项

1. 需要先获取搜索 URL 才能调用搜索接口
2. 搜索是基于当前用户的，返回用户拥有的产品
3. 状态字段会进行格式化显示（工作中、已发布、已冻结等）
