---
description: HomeView 卡片操作 - 设置企业项目编号功能
---

# HomeView 卡片操作 - 设置企业项目编号

## 概述

本文档说明 HomeView 产品卡片下拉菜单中的"设置企业项目编号"功能，用于批量设置产品的企业项目编号。

## 功能说明

"设置企业项目编号"功能打开一个对话框，允许用户为一个或多个产品设置企业项目编号。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品列表中已有产品
- 用户有修改产品属性的权限

## 实现位置

- 文件：`src/views/HomeView.vue`
- 函数：`handleCardCommand('setEnterpriseCode', item)`
- 对话框：企业项目编号对话框

## 实现步骤

### 1. 点击下拉菜单项

用户点击产品卡片下拉菜单中的"设置企业项目编号"：

```vue
<el-dropdown-item command="setEnterpriseCode">设置企业项目编号</el-dropdown-item>
```

### 2. 处理命令

调用 `handleCardCommand` 函数：

```typescript
const handleCardCommand = async (command: string, item: any) => {
  console.log('[HomeView] 卡片命令:', command, '产品:', item);

  if (command === 'setEnterpriseCode') {
    enterpriseCodeRows.value = [{
      id: item.id,
      label: item.name,
      partNumber: item.partNumber || ''
    }];
    enterpriseDialogVisible.value = true;
  }
  // ... 其他命令处理
};
```

### 3. 显示企业项目编号对话框

对话框包含表格和操作按钮：

```vue
<el-dialog
  v-model="enterpriseDialogVisible"
  :title="`企业项目编号 - ${enterpriseCodeRows.length} 个对象`"
  width="790px"
  class="enterprise-code-dialog">
  <el-table
    ref="enterpriseTableRef"
    :data="enterpriseCodeRows"
    border
    height="270"
    row-key="id"
    @selection-change="handleEnterpriseDialogSelectionChange">
    <el-table-column type="selection" width="44" />
    <el-table-column prop="label" label="标题" min-width="260" />
    <el-table-column prop="partNumber" label="企业项目编号" min-width="360">
      <template #default="{ row }">
        <el-input
          v-model="row.partNumber"
          placeholder="无"
          size="small" />
      </template>
    </el-table-column>
  </el-table>
  <template #footer>
    <el-button type="primary" @click="handleSetEnterpriseCode">设置</el-button>
    <el-button @click="enterpriseDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 4. 设置企业项目编号

点击"设置"按钮调用设置函数：

```typescript
const handleSetEnterpriseCode = async () => {
  if (selectedEnterpriseRows.value.length === 0) {
    ElMessage.warning('请选择要设置的对象');
    return;
  }

  try {
    await partDetailApi.setEnterpriseCode(
      selectedEnterpriseRows.value.map(row => ({
        id: row.id,
        partNumber: row.partNumber
      }))
    );
    ElMessage.success('企业项目编号设置成功');
    enterpriseDialogVisible.value = false;
    // 刷新产品列表
  } catch (error) {
    console.error('[HomeView] 设置企业项目编号失败:', error);
    ElMessage.error('设置企业项目编号失败');
  }
};
```

## API 接口

### 设置企业项目编号

- 接口：`partDetailApi.setEnterpriseCode(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    id: string;
    partNumber: string;
  }[]
  ```
- 返回数据：设置成功确认

## 相关文件

- `src/views/HomeView.vue` - 主视图组件
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 需要选择至少一个对象才能设置
2. 企业项目编号可以为空（显示为"无"）
3. 设置成功后会刷新产品列表
4. 支持批量设置多个对象的企业项目编号
