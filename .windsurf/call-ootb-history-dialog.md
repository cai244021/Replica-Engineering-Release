---
description: 调用达索原生 HistoryCmd 展示修订版历史记录弹窗
---

# 调用达索原生 HistoryCmd 展示修订版历史记录弹窗

## 概述

本文档说明如何在 Vue 3 + TypeScript 项目中调用达索 3DEXPERIENCE 平台原生的 `DS/LifecycleCmd/HistoryCmd` 命令，展示对象的修订版历史记录弹窗。

## 前置条件

- 项目运行在 3DDashboard 环境中
- 已安装 `@widget-lab/3ddashboard-utils` 包
- 可以通过 requirejs 加载达索 AMD 模块

## 实现步骤

### 1. 确保 widget 对象全局可用

达索原生模块依赖全局 `widget` 对象，需要在应用启动时将其挂载到 `window.top`。

```typescript
// main.ts
import { widget } from '@widget-lab/3ddashboard-utils';

const start = () => {
	disableDefaultCSS(true);
	widget.setTitle('');
	// 挂载 widget 到全局 window.top
	(window.top || window.parent || window as any).widget = widget;
	// 确保 widget 有 body 属性
	(widget as any).body = document.body;
	const app = createApp(App);
	// ...
};
```

### 2. 加载 HistoryCmd 模块

使用 requirejs 从 top window 加载达索 AMD 模块：

```typescript
const requireDashboardModule = <T = any>(moduleName: string): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		const topWindow = (window.top || window.parent || window) as any;
		const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;
		if (!requireFn) {
			reject(new Error('未找到 3DDashboard require 方法'));
			return;
		}
		requireFn(
			[moduleName],
			(module: T) => resolve(module),
			(error: unknown) => reject(error)
		);
	});
};
```

### 3. 构造符合达索格式的选择节点

达索选择节点需要特定的字段和方法：

```typescript
const objectType = pickOpenWithField(partInfo.value, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
const displayName = pickOpenWithField(partInfo.value, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;

const targetNode = {
	// 达索节点需要 getID() 方法
	getID: () => physicalId,
	id: physicalId,
	objectId: physicalId,
	physicalid: physicalId,
	physicalId,
	type: objectType,
	objectType,
	displayType: objectType,
	displayName,
	label: displayName,
	title: displayName,
	tenant: 'OnPremise',
	envId: 'OnPremise',
	serviceId: '3DSpace',
	contextId: baseInfoStore.securityContext || '',
	objectTaxonomies: ['PLMEntity', 'PLMReference', 'PLMCoreReference', 'LPAbstractReference', 'PHYSICALAbstractReference', 'VPMReference', '3DPart', 'XCADExtension', 'CN_PartInfo'],
	// 达索节点需要 _options 字段
	_options: {
		relationid: physicalId
	}
};
```

#### 辅助函数示例

`pickOpenWithField` 辅助函数用于从对象中提取字段值：

```typescript
const pickOpenWithField = (row: any, ...keys: string[]): string => {
	for (const key of keys) {
		const value = row?.[key];
		if (value !== undefined && value !== null && value !== '') return String(value);
	}
	return '';
};
```

#### 从表格行构造节点示例

如果从表格行数据构造节点：

```typescript
const buildTargetNodeFromRow = (row: any, baseInfoStore: any) => {
	const physicalId = row.resourceid || row.physicalid || row.physicalId || row.id;
	const objectType = pickOpenWithField(row, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
	const displayName = pickOpenWithField(row, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;

	return {
		getID: () => physicalId,
		id: physicalId,
		objectId: physicalId,
		physicalid: physicalId,
		physicalId,
		type: objectType,
		objectType,
		displayType: objectType,
		displayName,
		label: displayName,
		title: displayName,
		tenant: 'OnPremise',
		envId: 'OnPremise',
		serviceId: '3DSpace',
		contextId: baseInfoStore.securityContext || '',
		objectTaxonomies: ['PLMEntity', 'PLMReference', 'PLMCoreReference', 'LPAbstractReference', 'PHYSICALAbstractReference', 'VPMReference', '3DPart', 'XCADExtension', 'CN_PartInfo'],
		_options: {
			relationid: row.relationId || physicalId
		}
	};
};
```

### 4. 构造 mock context

HistoryCmd 通过 context 获取选择节点，需要构造 mock context：

```typescript
const mockContext = {
	getSelectedNodes: () => [targetNode],
	getEditMode: () => false,
	getPADTreeDocument: () => ({ 
		getXSO: () => ({ 
			onPostAdd: () => {}, 
			onPostRemove: () => {}, 
			onEmpty: () => {}, 
			get: () => [targetNode] 
		}) 
	}),
	getCurrentFolder: () => '{}',
	addEvent: () => {},
	selectedNodes: [targetNode]
};
```

### 5. 实例化并执行 HistoryCmd

```typescript
const HistoryCmd = await requireDashboardModule('DS/LifecycleCmd/HistoryCmd');
const HistoryCmdCtor = HistoryCmd?.default || HistoryCmd;

const historyCmd = new HistoryCmdCtor({
	ID: 'history_command',
	context: mockContext
});

if (typeof historyCmd.execute === 'function') {
	historyCmd.execute();
} else {
	throw new Error('DS/LifecycleCmd/HistoryCmd 实例未暴露 execute 方法');
}
```

## 完整示例

### 示例 1: Vue 组件中的完整使用

```vue
<template>
	<el-button @click="handleRevisionClick">修订版</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useBaseInfoStore } from '@/store/modules/baseInfo';

const baseInfoStore = useBaseInfoStore();
const partInfo = ref<any>(null);

const pickOpenWithField = (row: any, ...keys: string[]): string => {
	for (const key of keys) {
		const value = row?.[key];
		if (value !== undefined && value !== null && value !== '') return String(value);
	}
	return '';
};

const openLifecycleHistoryCmd = async (physicalId: string) => {
	try {
		// 1. 确保 widget 可用
		const topWindow = (window.top || window.parent || window) as any;
		if (!topWindow.widget) {
			const { widget } = await import('@widget-lab/3ddashboard-utils');
			topWindow.widget = widget;
			(widget as any).body = document.body;
		} else if (!topWindow.widget.body) {
			topWindow.widget.body = document.body;
		}

		// 2. 加载 HistoryCmd 模块
		const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;
		const HistoryCmd = await new Promise<any>((resolve, reject) => {
			requireFn(
				['DS/LifecycleCmd/HistoryCmd'],
				(module: any) => resolve(module),
				(error: unknown) => reject(error)
			);
		});

		// 3. 构造选择节点
		const objectType = pickOpenWithField(partInfo.value, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
		const displayName = pickOpenWithField(partInfo.value, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;

		const targetNode = {
			getID: () => physicalId,
			id: physicalId,
			objectId: physicalId,
			physicalid: physicalId,
			physicalId,
			type: objectType,
			objectType,
			displayType: objectType,
			displayName,
			label: displayName,
			title: displayName,
			tenant: 'OnPremise',
			envId: 'OnPremise',
			serviceId: '3DSpace',
			contextId: baseInfoStore.securityContext || '',
			objectTaxonomies: ['PLMEntity', 'PLMReference', 'PLMCoreReference', 'LPAbstractReference', 'PHYSICALAbstractReference', 'VPMReference', '3DPart', 'XCADExtension', 'CN_PartInfo'],
			_options: {
				relationid: physicalId
			}
		};

		// 4. 构造 mock context
		const mockContext = {
			getSelectedNodes: () => [targetNode],
			getEditMode: () => false,
			getPADTreeDocument: () => ({ 
				getXSO: () => ({ 
					onPostAdd: () => {}, 
					onPostRemove: () => {}, 
					onEmpty: () => {}, 
					get: () => [targetNode] 
				}) 
			}),
			getCurrentFolder: () => '{}',
			addEvent: () => {},
			selectedNodes: [targetNode]
		};

		// 5. 实例化并执行
		const HistoryCmdCtor = HistoryCmd?.default || HistoryCmd;
		const historyCmd = new HistoryCmdCtor({
			ID: 'history_command',
			context: mockContext
		});

		if (typeof historyCmd.execute === 'function') {
			historyCmd.execute();
		} else {
			throw new Error('DS/LifecycleCmd/HistoryCmd 实例未暴露 execute 方法');
		}
	} catch (error) {
		console.error('[打开 Lifecycle 历史记录失败:', error);
		ElMessage.error('打开修订版失败');
	}
};

const handleRevisionClick = () => {
	const physicalId = partInfo.value?.resourceid || partInfo.value?.physicalid;
	if (!physicalId) {
		ElMessage.warning('未找到当前对象物理ID');
		return;
	}
	openLifecycleHistoryCmd(physicalId);
};
</script>
```

### 示例 2: 从表格选中行打开修订版

```typescript
const handleSelectedRowRevision = async (selectedRows: any[]) => {
	if (selectedRows.length === 0) {
		ElMessage.warning('请先选择要查看修订版的行');
		return;
	}

	if (selectedRows.length > 1) {
		ElMessage.warning('修订版功能一次只能查看一个对象');
		return;
	}

	const row = selectedRows[0];
	const physicalId = row.resourceid || row.physicalid || row.physicalId || row.id;

	if (!physicalId) {
		ElMessage.warning('选中行未找到物理ID');
		return;
	}

	try {
		const topWindow = (window.top || window.parent || window) as any;
		if (!topWindow.widget) {
			const { widget } = await import('@widget-lab/3ddashboard-utils');
			topWindow.widget = widget;
			(widget as any).body = document.body;
		}

		const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;
		const HistoryCmd = await new Promise<any>((resolve, reject) => {
			requireFn(
				['DS/LifecycleCmd/HistoryCmd'],
				(module: any) => resolve(module),
				(error: unknown) => reject(error)
			);
		});

		const objectType = pickOpenWithField(row, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
		const displayName = pickOpenWithField(row, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;

		const targetNode = {
			getID: () => physicalId,
			id: physicalId,
			objectId: physicalId,
			physicalid: physicalId,
			physicalId,
			type: objectType,
			objectType,
			displayType: objectType,
			displayName,
			label: displayName,
			title: displayName,
			tenant: 'OnPremise',
			envId: 'OnPremise',
			serviceId: '3DSpace',
			contextId: baseInfoStore.securityContext || '',
			objectTaxonomies: ['PLMEntity', 'PLMReference', 'PLMCoreReference', 'LPAbstractReference', 'PHYSICALAbstractReference', 'VPMReference', '3DPart', 'XCADExtension', 'CN_PartInfo'],
			_options: {
				relationid: row.relationId || physicalId
			}
		};

		const mockContext = {
			getSelectedNodes: () => [targetNode],
			getEditMode: () => false,
			getPADTreeDocument: () => ({ 
				getXSO: () => ({ 
					onPostAdd: () => {}, 
					onPostRemove: () => {}, 
					onEmpty: () => {}, 
					get: () => [targetNode] 
				}) 
			}),
			getCurrentFolder: () => '{}',
			addEvent: () => {},
			selectedNodes: [targetNode]
		};

		const HistoryCmdCtor = HistoryCmd?.default || HistoryCmd;
		const historyCmd = new HistoryCmdCtor({
			ID: 'history_command',
			context: mockContext
		});

		if (typeof historyCmd.execute === 'function') {
			historyCmd.execute();
		} else {
			throw new Error('DS/LifecycleCmd/HistoryCmd 实例未暴露 execute 方法');
		}
	} catch (error) {
		console.error('[打开修订版失败:', error);
		ElMessage.error('打开修订版失败');
	}
};
```

### 示例 3: 封装为可复用的 Hook

```typescript
// composables/useLifecycleHistory.ts
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useBaseInfoStore } from '@/store/modules/baseInfo';

export function useLifecycleHistory() {
	const baseInfoStore = useBaseInfoStore();
	const isLoading = ref(false);

	const pickOpenWithField = (row: any, ...keys: string[]): string => {
		for (const key of keys) {
			const value = row?.[key];
			if (value !== undefined && value !== null && value !== '') return String(value);
		}
		return '';
	};

	const openHistoryDialog = async (physicalId: string, sourceData?: any) => {
		if (isLoading.value) return;

		isLoading.value = true;
		try {
			const topWindow = (window.top || window.parent || window) as any;
			if (!topWindow.widget) {
				const { widget } = await import('@widget-lab/3ddashboard-utils');
				topWindow.widget = widget;
				(widget as any).body = document.body;
			} else if (!topWindow.widget.body) {
				topWindow.widget.body = document.body;
			}

			const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;
			const HistoryCmd = await new Promise<any>((resolve, reject) => {
				requireFn(
					['DS/LifecycleCmd/HistoryCmd'],
					(module: any) => resolve(module),
					(error: unknown) => reject(error)
				);
			});

			const row = sourceData || {};
			const objectType = pickOpenWithField(row, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
			const displayName = pickOpenWithField(row, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;

			const targetNode = {
				getID: () => physicalId,
				id: physicalId,
				objectId: physicalId,
				physicalid: physicalId,
				physicalId,
				type: objectType,
				objectType,
				displayType: objectType,
				displayName,
				label: displayName,
				title: displayName,
				tenant: 'OnPremise',
				envId: 'OnPremise',
				serviceId: '3DSpace',
				contextId: baseInfoStore.securityContext || '',
				objectTaxonomies: ['PLMEntity', 'PLMReference', 'PLMCoreReference', 'LPAbstractReference', 'PHYSICALAbstractReference', 'VPMReference', '3DPart', 'XCADExtension', 'CN_PartInfo'],
				_options: {
					relationid: row.relationId || physicalId
				}
			};

			const mockContext = {
				getSelectedNodes: () => [targetNode],
				getEditMode: () => false,
				getPADTreeDocument: () => ({ 
					getXSO: () => ({ 
						onPostAdd: () => {}, 
						onPostRemove: () => {}, 
						onEmpty: () => {}, 
						get: () => [targetNode] 
					}) 
				}),
				getCurrentFolder: () => '{}',
				addEvent: () => {},
				selectedNodes: [targetNode]
			};

			const HistoryCmdCtor = HistoryCmd?.default || HistoryCmd;
			const historyCmd = new HistoryCmdCtor({
				ID: 'history_command',
				context: mockContext
			});

			if (typeof historyCmd.execute === 'function') {
				historyCmd.execute();
			} else {
				throw new Error('DS/LifecycleCmd/HistoryCmd 实例未暴露 execute 方法');
			}
		} catch (error) {
			console.error('[打开修订版失败:', error);
			ElMessage.error('打开修订版失败');
		} finally {
			isLoading.value = false;
		}
	};

	return {
		isLoading,
		openHistoryDialog
	};
}

// 使用示例
// const { isLoading, openHistoryDialog } = useLifecycleHistory();
// openHistoryDialog(physicalId, rowData);
```

## 常见问题

### Q: 报错 `ReferenceError: widget is not defined`

**原因**: 达索模块内部使用全局 `widget` 对象，但未正确挂载。

**解决**: 确保 `widget` 挂载到 `window.top` 或 `window.parent`，并且有 `body` 属性。

### Q: 报错 `INSUFFICIENT SELECTION INFO FROM APP:undefined`

**原因**: 选择节点格式不符合达索期望，缺少必要字段或方法。

**解决**: 确保节点有 `getID()` 方法、`_options` 字段，以及完整的 `tenant`、`envId`、`serviceId`、`contextId` 等字段。

### Q: 弹窗显示但物理ID未传递

**原因**: 节点的 `physicalid`、`objectId` 等字段不正确。

**解决**: 检查节点构造，确保 `physicalid`、`objectId`、`id` 都设置为正确的物理ID。

## 参考资源

- 达索本地示例: `C:\Users\Think\Desktop\继峰\webapp~\ENOXEngineer\ENOXEngineer.js`
- HistoryCmd 源码: `D:\AI\TWX_PSE\LifecycleCmd\LifecycleCmd.js`
- HistoryExplorer 源码: `C:\Users\Think\Desktop\继峰\webapp~\HistoryExplorer\HistoryExplorer.js`
