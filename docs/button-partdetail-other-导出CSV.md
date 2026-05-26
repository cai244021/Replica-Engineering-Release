---
description: PartDetailView 其他功能 - 导出CSV
---

# PartDetailView 其他功能 - 导出CSV

## 概述

本文档说明 PartDetailView 的"导出CSV"功能，用于将产品结构导出为 CSV 文件。

## 功能说明

"导出CSV"功能将当前显示的产品结构数据导出为 CSV 格式文件，便于在 Excel 等工具中查看和分析。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleExportCSV()`

## 实现步骤

### 1. 点击导出按钮

用户点击工具栏中的"导出 CSV"按钮：

```vue
<button
  title="导出 CSV"
  @click="handleExportCSV">
  <img src="/icons/export-csv.png" />
</button>
```

### 2. 处理导出

调用 `handleExportCSV` 函数：

```typescript
const handleExportCSV = () => {
  // 获取当前显示的数据
  const currentData = structureViewMode.value === 'flat' ? flatData.value : expandData.value;

  // 构造 CSV 内容
  const csvContent = convertToCSV(currentData);

  // 创建 Blob 对象
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `product_structure_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  ElMessage.success('导出成功');
};
```

### 3. 转换为 CSV

```typescript
const convertToCSV = (data: any[]): string => {
  const headers = ['标题', '类型', '修订版', '状态', '数量'];
  const rows = data.map(item => [
    item.title || '',
    item.type || '',
    item.revision || '',
    item.status || '',
    item.quantity || 1
  ]);

  const csvRows = [headers, ...rows];
  return csvRows.map(row => row.join(',')).join('\n');
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图

## 注意事项

1. 导出的文件名包含时间戳
2. CSV 文件使用 UTF-8 编码（带 BOM）
3. 导出的数据基于当前显示的视图
4. 支持导出缩进视图和平铺视图的数据
