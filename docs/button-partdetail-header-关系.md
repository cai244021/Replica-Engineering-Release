---
description: PartDetailView 头部操作 - 关系功能
---

# PartDetailView 头部操作 - 关系

## 概述

本文档说明 PartDetailView 头部下拉菜单中的"关系"功能，用于查看产品的关系图。

## 功能说明

"关系"功能调用达索原生的关系 Widget，用于显示产品与其他对象之间的关系。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 产品有有效的 physicalId
- 用户有查看关系的权限

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`handleHeaderActionCommand('relationship')`
- composable：`src/composables/openWith.ts`

## 实现步骤

### 1. 点击下拉菜单项

用户点击头部下拉菜单中的"关系"：

```vue
<el-dropdown-item command="relationship">
  <span class="part-action-menu-icon">⚭</span>
  <span class="part-action-menu-label">关系</span>
</el-dropdown-item>
```

### 2. 处理命令

调用 `handleHeaderActionCommand` 函数：

```typescript
const handleHeaderActionCommand = async (command: string) => {
  if (command === 'relationship') {
    const physicalId = getParentPhysicalId();
    console.log('[TW_EngineeringRelease] relationship 点击，当前物理ID:', physicalId);
    if (!physicalId) {
      ElMessage.warning('未找到当前对象物理ID');
      return;
    }
    await handleRootOpenWith('relationship');
  }
};
```

### 3. 使用 openWith composable

调用 `handleRootOpenWith` 函数：

```typescript
const handleRootOpenWith = async (command: string) => {
  const physicalId = getParentPhysicalId();
  if (!physicalId) {
    ElMessage.warning('未找到当前对象物理ID');
    return;
  }

  const targetNode = buildTargetNode(physicalId, partInfo.value);
  openWith(command, physicalId, targetNode);
};
```

### 4. 调用达索关系 Widget

```typescript
const callRelationshipCommand = async (targetNode: any) => {
  const topWindow = window.top || window.parent || window;
  const requireFn = topWindow.require || topWindow.requirejs || window.require;

  requireFn(['DS/Relationships/Relationships'], (Relationships: any) => {
    const RelationshipsCtor = Relationships?.default || Relationships;
    if (typeof RelationshipsCtor !== 'function') {
      throw new Error('DS/Relationships/Relationships 不是可实例化命令类');
    }

    const relationships = new RelationshipsCtor();
    relationships.open(targetNode);
  });
};
```

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/composables/openWith.ts` - 打开方式 composable

## 注意事项

1. 关系功能会调用达索原生 Widget，需要在 3DEXPERIENCE 环境中运行
2. 构造目标对象时需要补齐所有必需字段
3. 关系图会显示产品与其他对象的所有关系
4. 需要用户有相应的达索许可证
