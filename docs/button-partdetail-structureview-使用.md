---
description: PartDetailView 结构视图 - 使用视图
---

# PartDetailView 结构视图 - 使用视图

## 概述

本文档说明 PartDetailView 结构视图中的"使用"视图，用于显示产品被使用的关系。

## 功能说明

"使用"视图显示当前产品被哪些其他产品使用，即反向引用关系。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleStructureViewCommand('usage')`
- 响应式变量：`structureUsageView`

## 实现步骤

### 1. 点击结构视图菜单项

用户点击结构视图下拉菜单中的"使用"：

```vue
<el-dropdown-item command="usage" :class="{ 'is-selected': structureUsageView === 'usage' }">
  <span>使用</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleStructureViewCommand` 函数：

```typescript
const handleStructureViewCommand = async (command: string) => {
  if (command === 'usage') {
    structureUsageView.value = 'usage';
    // 加载使用关系数据
    await loadUsageData();
    // 触发表格更新
    tableKey.value++;
  }
};
```

### 3. 加载使用关系数据

```typescript
const loadUsageData = async () => {
  const physicalId = getParentPhysicalId();
  if (!physicalId) return;

  try {
    const response = await partDetailApi.getUsageRelations(physicalId);
    usageData.value = response.results || [];
  } catch (error) {
    console.error('[PartDetailView] 加载使用关系失败:', error);
    ElMessage.error('加载使用关系失败');
  }
};
```

### 4. 渲染使用视图

```vue
<el-table
  v-if="structureUsageView === 'usage'"
  :data="usageData"
  row-key="id">
  <!-- 表格列 -->
</el-table>
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 使用视图显示反向引用关系
2. 需要调用 API 获取使用关系数据
3. 切换回引用视图会恢复正向结构
4. 便于了解产品的使用情况
