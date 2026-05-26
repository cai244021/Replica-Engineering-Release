---
description: PartDetailView 其他功能 - 成熟度
---

# PartDetailView 其他功能 - 成熟度

## 概述

本文档说明 PartDetailView 的"成熟度"功能，用于更改产品的成熟度状态。

## 功能说明

"成熟度"功能打开对话框，显示产品的成熟度状态转换图，用户可以选择转换到新的成熟度状态。

## 前置条件

- 用户已登录 3DEXPERIENCE 平台
- 用户有更改成熟度的权限
- 产品未被锁定

## 实现位置

- 文件：`src/views/PartDetailView.vue`
- 函数：`openMaturityDialogForParent()`
- 对话框：成熟度对话框

## 实现步骤

### 1. 点击状态标签

用户点击产品详情中的状态标签：

```vue
<span class="status-tag" @click="openMaturityDialogForParent">
  {{ formatStatus(partInfo?.['ds6w:status']) }}
</span>
```

### 2. 打开成熟度对话框

```typescript
const openMaturityDialogForParent = async () => {
  const physicalId = getParentPhysicalId();
  if (!physicalId) {
    ElMessage.warning('未找到当前对象物理ID');
    return;
  }

  try {
    const response = await partDetailApi.getMaturityStates(physicalId);
    maturityStates.value = response.states || [];
    maturityCurrentState.value = response.currentState || '';
    maturityDialogVisible.value = true;
  } catch (error) {
    console.error('[PartDetailView] 获取成熟度状态失败:', error);
    ElMessage.error('获取成熟度状态失败');
  }
};
```

### 3. 成熟度对话框

```vue
<el-dialog
  v-model="maturityDialogVisible"
  title="成熟度状态"
  width="800px">
  <div class="maturity-state-diagram">
    <!-- 显示当前状态 -->
    <div class="current-state">
      当前状态: {{ getMaturityStateLabel(maturityCurrentState) }}
    </div>
    <!-- 显示状态转换图 -->
    <div class="state-transitions">
      <div
        v-for="state in maturityStates"
        :key="state.stateSysName"
        class="state-node"
        :style="getStateStyle(state)"
        @click="handleMaturityStateClick(state.stateSysName)">
        {{ getMaturityStateLabel(state) }}
      </div>
    </div>
  </div>
  <template #footer>
    <el-button @click="maturityDialogVisible = false">取消</el-button>
  </template>
</el-dialog>
```

### 4. 处理成熟度状态点击

```typescript
const handleMaturityStateClick = async (targetState: string) => {
  if (targetState === maturityCurrentState.value) return;

  try {
    await partDetailApi.changeMaturityState({
      physicalId: getParentPhysicalId(),
      targetState
    });
    ElMessage.success('成熟度状态更改成功');
    maturityDialogVisible.value = false;
    // 刷新产品信息
    await loadPartDetail(getParentPhysicalId());
  } catch (error) {
    console.error('[PartDetailView] 更改成熟度状态失败:', error);
    ElMessage.error('更改成熟度状态失败');
  }
};
```

## API 接口

### 获取成熟度状态

- 接口：`partDetailApi.getMaturityStates(physicalId)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：`physicalId` - 产品物理 ID
- 返回数据：
  ```typescript
  {
    currentState: string;
    states: Array<{
      stateSysName: string;
      stateLabel: string;
      reachable: boolean;
    }>;
  }
  ```

### 更改成熟度状态

- 接口：`partDetailApi.changeMaturityState(data)`
- 位置：`src/api/partDetailApi.ts`
- 请求参数：
  ```typescript
  {
    physicalId: string;
    targetState: string;
  }
  ```
- 返回数据：更改成功确认

## 相关文件

- `src/views/PartDetailView.vue` - 产品详情视图
- `src/api/partDetailApi.ts` - 产品详情 API

## 注意事项

1. 只能转换到可达的状态
2. 需要用户有相应的权限
3. 更改成功后会刷新产品信息
4. 状态转换图显示所有可达的状态
