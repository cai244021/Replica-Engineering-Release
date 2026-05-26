---
description: PartDetailView 展开菜单 - 展开N层功能
---

# PartDetailView 展开菜单 - 展开N层

## 概述

本文档说明 PartDetailView 展开菜单中的"展开N层"功能，用于展开指定层级的节点。

## 功能说明

"展开N层"功能打开对话框，用户可以指定展开的层级数，系统会展开到指定层级。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品结构已加载

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleExpandMenuCommand('expandN')`
- 对话框：展开N层对话框

## 实现步骤

### 1. 点击展开菜单项

用户点击展开下拉菜单中的"展开N层"：

```vue
<el-dropdown-item command="expandN">
  <svg viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  <span>展开N层</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleExpandMenuCommand` 函数：

```typescript
const handleExpandMenuCommand = async (command: string) => {
  if (command === 'expandN') {
    expandNDialogVisible.value = true;
    expandNLevel.value = 1;
  }
};
```

### 3. 展开N层对话框

对话框包含层级选择：

```vue
<el-dialog
  v-model="expandNDialogVisible"
  title="展开N层"
  width="400px">
  <el-form>
    <el-form-item label="展开层级">
      <el-input-number
        v-model="expandNLevel"
        :min="1"
        :max="10" />
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="expandNDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="handleConfirmExpandN">确认</el-button>
  </template>
</el-dialog>
```

### 4. 确认展开N层

```typescript
const handleConfirmExpandN = async () => {
  const level = expandNLevel.value;
  const allRowIds = getRowIdsByLevel(expandData.value, level);
  allRowIds.forEach(rowId => {
    expandedRowIds.value.add(rowId);
  });
  expandNDialogVisible.value = false;
  // 触发表格更新
  tableKey.value++;
};
```

### 5. 获取指定层级的行 ID

```typescript
const getRowIdsByLevel = (data: any[], targetLevel: number): string[] => {
  const ids: string[] = [];
  const traverse = (nodes: any[], currentLevel: number) => {
    if (currentLevel > targetLevel) return;

    nodes.forEach(node => {
      if (currentLevel < targetLevel && node.rowId) {
        ids.push(node.rowId);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children, currentLevel + 1);
      }
    });
  };
  traverse(data, 0);
  return ids;
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/expand.ts` - 展开 composable

## 注意事项

1. 展开层级范围为 1-10 层
2. 对于大型结构，展开多层可能影响性能
3. 展开后可以通过"折叠全部"恢复默认状态
