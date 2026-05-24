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

## 修订版操作后自动刷新选中行

### 概述

在修订版弹窗中进行修订操作后，需要自动刷新表格中选中行的"是否最新版"状态。通过订阅达索的 `Lifecycle.Modification` 事件，检测 Revise 操作并刷新选中行数据。

### 实现步骤

#### 1. 订阅 Lifecycle.Modification 事件

使用 `DS/PlatformAPI/PlatformAPI` 订阅事件：

```typescript
const handleSelectedRowRevision = async () => {
	const selectedRow = selectedChildrenRows.value[0];
	if (!selectedRow) {
		ElMessage.warning('请先选中一行');
		return;
	}

	const topWindow = (window.top || window.parent || window) as any;
	const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;

	requireFn(['DS/PlatformAPI/PlatformAPI'], (PlatformAPI: any) => {
		const subscription = PlatformAPI.subscribe('Lifecycle.Modification', (eventData: any) => {
			// eventData 可能是 JSON 字符串，需要解析
			let parsedData = eventData;
			if (typeof eventData === 'string') {
				try {
					parsedData = JSON.parse(eventData);
				} catch (error) {
					console.error('[TW_EngineeringRelease] 解析 eventData 失败:', error);
					return;
				}
			}

			const refreshData = parsedData?.Refresh;
			if (!refreshData) return;

			// 检查是否有 Revise 操作
			let hasReviseOperation = false;

			// 检查 modified 数组
			const modifiedData = refreshData.modified;
			if (modifiedData && modifiedData.length > 0) {
				for (const item of modifiedData) {
					if (item?.operation === 'Revise') {
						hasReviseOperation = true;
						break;
					}
				}
			}

			// 检查 created 数组
			const createdData = refreshData.created;
			if (createdData && createdData.length > 0) {
				for (const item of createdData) {
					if (item?.operation === 'Revise') {
						hasReviseOperation = true;
						break;
					}
				}
			}

			if (hasReviseOperation) {
				refreshSelectedRow(selectedRow);
				subscription.unsubscribe();
				return;
			}
		});

		// 设置超时自动取消订阅（防止弹窗未触发事件）
		setTimeout(() => {
			try {
				subscription.unsubscribe();
			} catch (error) {
				// 忽略取消订阅错误
			}
		}, 60000);

		const physicalId = selectedRow.resourceid || selectedRow.id;
		openLifecycleHistoryCmd(physicalId);
	});
};
```

#### 2. 刷新选中行数据

调用数据库模式刷新接口，更新选中行的 `isLastRevision` 字段：

```typescript
const refreshSelectedRow = async (row: TreeNode) => {
	const physicalId = row.resourceid;
	const path = row.path || [physicalId];

	try {
		// 调用数据库模式刷新接口
		const response = await expandApi.refreshNodeByPath(path, physicalId);

		// 从响应中提取更新的节点数据
		const updatedNode = expandApi.extractPartInfoFromDbExpand(response, physicalId);
		if (updatedNode) {
			// 更新树形数据中的对应节点
			updateTreeNodeData(childrenData.value, physicalId, updatedNode);
			ElMessage.success('已刷新选中行');
		}

		// 如果节点已展开，重新加载子节点
		if (row.isExpanded) {
			await loadChildren(row, null, childData => {
				row.children = childData;
			});
		}
	} catch (error) {
		console.error('[PartDetailView] 刷新选中行失败:', error);
		ElMessage.error('刷新选中行失败');
	}
};
```

#### 3. 更新树形数据

只更新 `isLastRevision` 字段，其他字段保持不变：

```typescript
const updateTreeNodeData = (nodes: TreeNode[], physicalId: string, updatedData: Record<string, string>): boolean => {
	for (const node of nodes) {
		if (node.resourceid === physicalId) {
			// 只更新 isLastRevision 字段
			node.isLastRevision = updatedData['ds6w:isLastRevision'] === 'TRUE';
			return true;
		}
		if (node.children && node.children.length > 0) {
			if (updateTreeNodeData(node.children, physicalId, updatedData)) {
				return true;
			}
		}
	}
	return false;
};
```

#### 4. expandApi 刷新方法

在 `expandApi.ts` 中添加根据路径刷新单个节点的方法：

```typescript
/**
 * 根据路径刷新单个节点（数据库模式）
 * 用于修订版操作后刷新选中行
 * @param path 节点路径数组
 * @param targetPhysicalId 目标节点 physicalId
 * @returns 展开结构数据
 */
async refreshNodeByPath(path: string[], targetPhysicalId: string): Promise<ExpandResponse> {
	const baseInfoStore = useBaseInfoStore();

	if (!baseInfoStore.spaceUrl) {
		await baseInfoStore.fetchSpaceUrl();
	}

	if (!baseInfoStore.securityContext) {
		await baseInfoStore.getCollaborativeSpace();
	}

	const currentUser = baseInfoStore.currentUser || 'admin_platform';
	const securityContext = baseInfoStore.securityContext;

	const endpoint = '/resources/enoauthoring/expand/v2/progressive';
	const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext || '')}`;

	const label = `xEngineer-${currentUser}-${Date.now()}`;

	const params = {
		db: {
			'root_path_physicalid': [path],
			label,
			'no_type_filter_rel': ['XCADBaseDependency'],
			'type_filter_rel': ['VPMInstance', 'VPMRepInstance'],
			'q.iterative_filter_query_bo': '(flattenedtaxonomies:"types/Drawing") OR [ds6w:globalType]:"ds6w:Part"',
			'compute_select_bo': ['icon', 'thumbnail_2d'],
			'expand_iter': '0',
			'fcs_url_mode': 'REDIRECT',
			'select_bo': [
				'ds6w:label',
				'ds6w:modified',
				'ds6w:created',
				'ds6w:description',
				'ds6wg:revision',
				'ds6w:cadMaster',
				'ds6w:responsible',
				'owner',
				'ds6w:status',
				'ds6w:type',
				'ds6wg:EnterpriseExtension.V_PartNumber',
				'ds6wg:MaterialUsageExtension.DeclaredQuantity',
				'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity',
				'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity',
				'ds6wg:raw_material.v_dimensiontype',
				'type',
				'physicalid',
				'ds6w:policy',
				'ds6w:reservedBy',
				'ds6w:globalType',
				'ds6w:manufacturable',
				'pathsr',
				'ds6w:isLastRevision',
				'ds6w:reserved',
				'ds6w:identifier',
				'cestamp'
			],
			'select_rel': [
				'ds6w:label',
				'ds6w:type',
				'ds6wg:SynchroEBOMExt.V_InEBOMUser',
				'physicalid',
				'ro.plminstance.V_treeorder',
				'ds6wg:raw_material.v_dimensiontype',
				'ro.madefromquantity_length.V_ContQuantity',
				'ro.madefromquantity_mass.V_ContQuantity',
				'ro.madefromquantity_area.V_ContQuantity',
				'ro.madefromquantity_volume.V_ContQuantity',
				'ro.madefromquantity_AsRequired.AsRequired',
				'ro.MadeFromQuantity_Rectangular.Length',
				'ro.MadeFromQuantity_Rectangular.Width',
				'ro.VPMInstanceQuantity_Area.V_ContQuantity',
				'ro.VPMInstanceQuantity_Mass.V_ContQuantity',
				'ro.VPMInstanceQuantity_Volume.V_ContQuantity',
				'ro.VPMInstanceQuantity_Length.V_ContQuantity',
				'ro.VPMInstanceQuantity_AsRequired.AsRequired',
				'ro.VPMInstanceQuantity_Rectangular.Length',
				'ro.VPMInstanceQuantity_Rectangular.Width',
				'ds6w:reservedBy',
				'cestamp'
			],
			'locale': 'zh',
			'tenant': 'OnPremise',
			'paths': [path],
			'sequence_filter': [
				{
					definition: [
						{
							'type_filter_rel': ['VPMInstance', 'VPMRepInstance'],
							'q.query': 'NOT ([ds6wg:SynchroEBOMExt.V_InEBOMUser]:"FALSE" )'
						}
					]
				}
			],
			'types': ['VPMReference', 'VPMRepReference', 'VPMInstance', 'Document'],
			'extensions': ['XCADExtension', 'XP_VPMReference_Ext', 'EnterpriseExtension', 'DELFmiContQuantity_Mass', 'DELFmiContQuantity_Volume'],
			'source': 'cstorage',
			'static_mapping': false,
			'format': 'entity_relation_occurrence'
		},
		cv: {
			batch: {
				expands: [
					{
						filter: {
							and: {
								filters: [
									{
										prefix_filter: {
											prefix_path: [{ physical_id_path: path }]
										}
									},
									{
										and: {
											filters: [
												{
													sequence_filter: {
														sequence: [
															{
																uql: '((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance")) AND (NOT (ds6wg_58_synchroebomext_46_v_95_inebomuser:"FALSE" ))'
															}
														]
													}
												}
											]
										}
									}
								]
							}
						},
						root: { physical_id: targetPhysicalId },
						label,
						graph: {
							descending_condition_relation: {
								uql: 'NOT (flattenedtaxonomies:"reltypes/XCADBaseDependency") AND ((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance"))'
							},
							descending_condition_object: {
								uql: '(flattenedtaxonomies:"types/Drawing") OR ds6w_58_globaltype:"ds6w:Part"'
							}
						},
						aggregation_processors: [
							{
								truncate: {
									max_distance_from_prefix: 0,
									prefix_filter: {
										prefix_path: [{ physical_id_path: path }]
									}
								}
							}
						]
					}
				]
			},
			outputs: {
				hits: {
					predefined_computation: ['icons', 'urlstream|thumbnail_2d|2dthb|allrefs']
				},
				select_object: [
					'ds6w:label',
					'ds6w:modified',
					'ds6w:created',
					'ds6w:description',
					'ds6wg:revision',
					'ds6w:cadMaster',
					'ds6w:responsible',
					'owner',
					'ds6w:status',
					'ds6w:type',
					'ds6wg:EnterpriseExtension.V_PartNumber',
					'ds6wg:MaterialUsageExtension.DeclaredQuantity',
					'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity',
					'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity',
					'ds6wg:raw_material.v_dimensiontype',
					'type',
					'physicalid',
					'ds6w:policy',
					'ds6w:reservedBy',
					'ds6w:globalType',
					'ds6w:manufacturable',
					'pathsr',
					'ds6w:isLastRevision',
					'ds6w:reserved',
					'ds6w:identifier',
					'cestamp'
				],
				select_relation: [
					'ds6w:label',
					'ds6w:type',
					'ds6wg:SynchroEBOMExt.V_InEBOMUser',
					'physicalid',
					'ro.plminstance.V_treeorder',
					'ds6wg:raw_material.v_dimensiontype',
					'ro.madefromquantity_length.V_ContQuantity',
					'ro.madefromquantity_mass.V_ContQuantity',
					'ro.madefromquantity_area.V_ContQuantity',
					'ro.madefromquantity_volume.V_ContQuantity',
					'ro.madefromquantity_AsRequired.AsRequired',
					'ro.MadeFromQuantity_Rectangular.Length',
					'ro.MadeFromQuantity_Rectangular.Width',
					'ro.VPMInstanceQuantity_Area.V_ContQuantity',
					'ro.VPMInstanceQuantity_Mass.V_ContQuantity',
					'ro.VPMInstanceQuantity_Volume.V_ContQuantity',
					'ro.VPMInstanceQuantity_Length.V_ContQuantity',
					'ro.VPMInstanceQuantity_AsRequired.AsRequired',
					'ro.VPMInstanceQuantity_Rectangular.Length',
					'ro.VPMInstanceQuantity_Rectangular.Width',
					'ds6w:reservedBy',
					'cestamp'
				],
				format: 'entity_relation_occurrence'
			}
		}
	};

	try {
		const response = await http.post(url, params as unknown as Record<string, unknown>);
		return response as ExpandResponse;
	} catch (error) {
		console.error('[ExpandAPI] 刷新节点失败:', error);
		throw error;
	}
}
```

### 注意事项

1. **事件数据格式**: `eventData` 可能是 JSON 字符串，需要先解析
2. **操作类型检测**: 检查 `operation` 字段是否为 `Revise`，而不是匹配 physicalId
3. **超时取消**: 设置 60 秒超时自动取消订阅，防止内存泄漏
4. **字段更新**: 只更新 `isLastRevision` 字段，其他字段保持不变
5. **子节点重载**: 如果节点已展开，需要重新加载子节点

### 事件数据结构

`Lifecycle.Modification` 事件数据结构：

```json
{
  "From": "Lifecycle",
  "Refresh": {
    "created": [
      {
        "physicalid": "新版本ID",
        "sourceObjectId": "原版本ID",
        "operation": "Revise",
        "refreshPSD": true
      }
    ],
    "deleted": [],
    "modified": [
      {
        "physicalid": "原版本ID",
        "operation": "Revise"
      }
    ],
    "context": null,
    "refreshFolder": false
  },
  "AppID": null,
  "OriginID": null,
  "tenant": "OnPremise",
  "WidgetID": null
}
```

## 调用达索原生 ReviseCmd 创建新修订版

### 概述

使用 `DS/LifecycleCmd/ReviseCmd` 命令打开达索原生的修订版创建弹窗，用于创建当前零件的新版本。

### 实现步骤

#### 1. 加载 ReviseCmd 模块

```typescript
const openLifecycleReviseCmd = async (physicalId: string) => {
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
		const ReviseCmd = await new Promise<any>((resolve, reject) => {
			requireFn(
				['DS/LifecycleCmd/ReviseCmd'],
				(module: any) => resolve(module),
				(error: unknown) => reject(error)
			);
		});
		callLifecycleReviseEntry(ReviseCmd, physicalId);
	} catch (error) {
		console.error('[TW_EngineeringRelease] 打开 Lifecycle 修订版创建失败:', error);
		ElMessage.error('打开新修订版失败');
	}
};
```

#### 2. 实例化并执行 ReviseCmd

```typescript
const callLifecycleReviseEntry = (ReviseCmd: any, physicalId: string) => {
	const ReviseCmdCtor = ReviseCmd?.default || ReviseCmd;
	if (typeof ReviseCmdCtor !== 'function') {
		throw new Error('DS/LifecycleCmd/ReviseCmd 不是可实例化命令类');
	}
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
		objectTaxonomies: X3D_OBJECT_TAXONOMIES,
		_options: {
			relationid: physicalId
		}
	};

	const mockContext = {
		getSelectedNodes: () => [targetNode],
		getEditMode: () => false,
		getPADTreeDocument: () => ({ getXSO: () => ({ onPostAdd: () => {}, onPostRemove: () => {}, onEmpty: () => {}, get: () => [targetNode] }) }),
		getCurrentFolder: () => '{}',
		addEvent: () => {},
		selectedNodes: [targetNode]
	};

	const reviseCmd = new ReviseCmdCtor({
		ID: 'revise_command',
		context: mockContext
	});

	if (typeof reviseCmd.execute !== 'function') {
		throw new Error('DS/LifecycleCmd/ReviseCmd 实例未暴露 execute 方法');
	}
	reviseCmd.execute();
};
```

### 注意事项

ReviseCmd 的使用方式与 HistoryCmd 类似：
1. 需要构造符合达索格式的选择节点
2. 需要构造 mock context
3. 通过 `execute()` 方法执行命令
4. 节点格式要求与 HistoryCmd 一致

## 调用达索原生 ReviseCmd 创建新修订版（含标题修复）

### 概述

使用 `DS/LifecycleCmd/ReviseCmd` 命令打开达索原生的修订版创建弹窗，用于创建当前零件的新版本。本文档详细说明单选和多选场景下的实现方式，以及如何解决弹窗标题显示为 "undefined" 的问题。

### 问题背景

达索原生的 ReviseWidget 在单选和多选场景下，弹窗标题列可能显示为 "undefined AA.1" 而不是正确的 displayName。这是因为：

1. **单选场景**：ReviseCmd 内部调用 ReviseWidget，传入的对象可能缺少 `displayName`、`name` 等字段
2. **多选场景**：ReviseWidget 通过 `_attributeListRequest` 调用后端接口 `/resources/lifecycle/product/attributeList`，返回的数据可能包含空值
3. **数据流问题**：后端接口返回的数据会覆盖前端构造的原始节点字段

### 解决方案

#### 核心思路

1. **单选场景**：构造完整的 targetNode，包含所有必要字段；拦截 `ReviseWidget.prototype.executeCmd`，从 `options.context.getSelectedNodes` 获取最新数据修正传入对象
2. **多选场景**：构造完整的 targetNodes 数组；拦截 `WAFData.authenticatedRequest`，修正请求参数和响应数据；拦截 `ReviseWidget.prototype._attributeListRequest`，合并原始节点字段
3. **全局变量**：使用 `currentReviseTargetNodes` 存储最新的节点数据，供补丁使用

#### 单选实现

##### 1. 构造完整的 targetNode

```typescript
const callLifecycleReviseEntry = (ReviseCmd: any, physicalId: string) => {
	const ReviseCmdCtor = ReviseCmd?.default || ReviseCmd;
	if (typeof ReviseCmdCtor !== 'function') {
		throw new Error('DS/LifecycleCmd/ReviseCmd 不是可实例化命令类');
	}

	// 从 partInfo 获取完整数据
	const objectType = pickOpenWithField(partInfo.value, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
	const displayName = pickOpenWithField(partInfo.value, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;
	const objectName = pickOpenWithField(partInfo.value, 'ds6w:name', 'name', 'objectName') || displayName;
	const revision = pickOpenWithField(partInfo.value, 'ds6wg:revision', 'revision') || '';
	const current = pickOpenWithField(partInfo.value, 'ds6w:status', 'current', 'status') || '工作中';
	const currentInternal = pickOpenWithField(partInfo.value, 'current_internal', 'currentInternal') || '工作中';
	const typeDisplayName = pickOpenWithField(partInfo.value, 'typeDisplayName', 'displayType') || objectType;
	const cadMaster = pickOpenWithField(partInfo.value, 'ds6w:cadMaster', 'cadMaster') || '3DEXPERIENCE';
	const imageUrl = pickOpenWithField(partInfo.value, 'imageUrl', 'icon') || '';
	const policy = pickOpenWithField(partInfo.value, 'ds6w:policy', 'policy') || '';

	const targetNode = {
		getID: () => physicalId,
		id: physicalId,
		objectId: physicalId,
		physicalid: physicalId,
		physicalId,
		type: objectType,
		objectType,
		displayType: typeDisplayName,
		displayName,
		label: displayName,
		title: displayName,
		name: objectName,
		revision: revision,
		typeDisplayName: typeDisplayName,
		baseType: 'PLMEntity',
		current: current,
		current_internal: currentInternal,
		imageUrl: imageUrl,
		tenant: 'OnPremise',
		envId: 'OnPremise',
		serviceId: '3DSpace',
		contextId: baseInfoStore.securityContext || '',
		objectTaxonomies: X3D_OBJECT_TAXONOMIES,
		_options: {
			relationid: physicalId
		},
		attributes: {
			'ds6w:label': displayName,
			'ds6w:name': objectName,
			'ds6w:type': objectType,
			'PLMEntity.V_Name': objectName
		},
		revisionModeInfo: {
			revisionMode: 'major'
		},
		semantic: ['E'],
		object: {
			'ds6w:label': displayName,
			'ds6w:name': objectName,
			'ds6w:type': objectType,
			'PLMEntity.V_Name': objectName,
			'attribute[PLMEntity.V_Name]': objectName,
			displayName: displayName,
			name: objectName,
			label: displayName,
			title: displayName,
			revision: revision,
			current: current,
			current_internal: currentInternal,
			cadMaster: cadMaster,
			typeDisplayName: typeDisplayName
		},
		options: {
			'ds6w:status': current,
			'icons': [imageUrl],
			'ds6w:type': typeDisplayName
		},
		policy: policy,
		cadMaster: cadMaster,
		locked: false,
		lockedBy: null,
		branch: null,
		'branch.uuid': null,
		'type.kindof[PLMReference]': 'TRUE',
		popup: true
	};

	// 存储到全局变量，供补丁使用
	currentReviseTargetNodes = [targetNode];

	const mockContext = {
		getSelectedNodes: () => {
			console.log('[TW_EngineeringRelease] 单选 mockContext.getSelectedNodes 返回:', JSON.stringify([targetNode], null, 2));
			return [targetNode];
		},
		getEditMode: () => false,
		getPADTreeDocument: () => ({ getXSO: () => ({ onPostAdd: () => {}, onPostRemove: () => {}, onEmpty: () => {}, get: () => [targetNode] }) }),
		getCurrentFolder: () => '{}',
		addEvent: () => {},
		selectedNodes: [targetNode]
	};

	const reviseCmd = new ReviseCmdCtor({
		ID: 'revise_command',
		context: mockContext
	});

	if (typeof reviseCmd.execute !== 'function') {
		throw new Error('DS/LifecycleCmd/ReviseCmd 实例未暴露 execute 方法');
	}
	reviseCmd.execute();
};
```

##### 2. 加载 ReviseWidget 并应用补丁

```typescript
const openLifecycleReviseCmd = async (physicalId: string) => {
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

		requireFn(['DS/ReviseWidget/ReviseWidget', 'DS/LifecycleCmd/ReviseCmd', 'DS/WAFData/WAFData'], (ReviseWidget: any, ReviseCmd: any, WAFData: any) => {
			// 应用补丁
			applyReviseWidgetPatches(ReviseWidget, WAFData);
			callLifecycleReviseEntry(ReviseCmd, physicalId);
		});
	} catch (error) {
		console.error('[TW_EngineeringRelease] 打开 Lifecycle 修订版创建失败:', error);
		ElMessage.error('打开新修订版失败');
	}
};
```

##### 3. 应用 executeCmd 补丁

```typescript
const applyReviseWidgetPatches = (ReviseWidget: any, WAFData: any) => {
	const ReviseWidgetCtor = ReviseWidget?.default || ReviseWidget;
	const reviseWidgetPrototype = ReviseWidgetCtor?.prototype;

	// 拦截 executeCmd，从 options.context.getSelectedNodes 获取最新数据
	if (reviseWidgetPrototype && typeof reviseWidgetPrototype.executeCmd === 'function' && !reviseWidgetPrototype.__twPatchExecuteCmd) {
		const originalExecuteCmd = reviseWidgetPrototype.executeCmd;
		reviseWidgetPrototype.executeCmd = function (objects: any[], options: any, callback: any) {
			console.log('[TW_EngineeringRelease] ReviseWidget.executeCmd 传入对象:', JSON.stringify(objects, null, 2));
			// 从 options.context.getSelectedNodes 获取最新数据
			let sourceNodes = currentReviseTargetNodes;
			if (options?.context?.getSelectedNodes && typeof options.context.getSelectedNodes === 'function') {
				try {
					sourceNodes = options.context.getSelectedNodes();
					console.log('[TW_EngineeringRelease] ReviseWidget.executeCmd 从 context.getSelectedNodes 获取数据:', JSON.stringify(sourceNodes, null, 2));
				} catch (e) {
					console.warn('[TW_EngineeringRelease] ReviseWidget.executeCmd 获取 context.getSelectedNodes 失败:', e);
				}
			}
			// 确保传入的对象有正确的 name 和 displayName
			if (Array.isArray(objects) && objects.length > 0 && Array.isArray(sourceNodes)) {
				const sourceById = new Map<string, any>();
				sourceNodes.forEach(node => {
					const objectId = node?.objectId || node?.physicalid || node?.physicalId;
					if (objectId) sourceById.set(objectId, node);
				});
				objects.forEach((obj: any) => {
					const objectId = obj?.objectId || obj?.physicalid;
					const source = objectId ? sourceById.get(objectId) : null;
					if (source) {
						if (!obj.name || obj.name === 'undefined') obj.name = source.name;
						if (!obj.displayName || obj.displayName === 'undefined' || obj.displayName.includes('undefined ')) obj.displayName = source.displayName;
						if (!obj.revision) obj.revision = source.revision;
					}
				});
				console.log('[TW_EngineeringRelease] ReviseWidget.executeCmd 修正后对象:', JSON.stringify(objects, null, 2));
			}
			return originalExecuteCmd.call(this, objects, options, callback);
		};
		reviseWidgetPrototype.__twPatchExecuteCmd = true;
	}
};
```

#### 多选实现

##### 1. 构造完整的 targetNodes 数组

```typescript
const handleSelectedRowNewRevision = async () => {
	const selectedRows = selectedChildrenRows.value;
	if (!selectedRows || selectedRows.length === 0) {
		ElMessage.warning('请先选中要升版的行');
		return;
	}

	const targetNodes = selectedRows.map(row => {
		const physicalId = row.resourceid || row.physicalid || row.physicalId || row.id;
		const objectType = pickOpenWithField(row, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
		const displayName = pickOpenWithField(row, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;
		const objectName = pickOpenWithField(row, 'ds6w:name', 'name', 'objectName') || displayName;
		const revision = pickOpenWithField(row, 'ds6wg:revision', 'revision') || '';
		const current = pickOpenWithField(row, 'ds6w:status', 'current', 'status') || '工作中';
		const currentInternal = pickOpenWithField(row, 'current_internal', 'currentInternal') || '工作中';
		const typeDisplayName = pickOpenWithField(row, 'typeDisplayName', 'displayType') || objectType;
		const cadMaster = pickOpenWithField(row, 'ds6w:cadMaster', 'cadMaster') || '3DEXPERIENCE';
		const imageUrl = pickOpenWithField(row, 'imageUrl', 'icon') || '';
		const policy = pickOpenWithField(row, 'ds6w:policy', 'policy') || '';

		return {
			getID: () => physicalId,
			id: physicalId,
			objectId: physicalId,
			physicalid: physicalId,
			physicalId,
			type: objectType,
			objectType,
			displayType: typeDisplayName,
			displayName,
			label: displayName,
			title: displayName,
			name: objectName,
			revision: revision,
			typeDisplayName: typeDisplayName,
			baseType: 'PLMEntity',
			current: current,
			current_internal: currentInternal,
			imageUrl: imageUrl,
			tenant: 'OnPremise',
			envId: 'OnPremise',
			serviceId: '3DSpace',
			contextId: baseInfoStore.securityContext || '',
			objectTaxonomies: X3D_OBJECT_TAXONOMIES,
			_options: {
				relationid: row.relationId || physicalId
			},
			attributes: {
				'ds6w:label': displayName,
				'ds6w:name': objectName,
				'ds6w:type': objectType,
				'PLMEntity.V_Name': objectName
			},
			revisionModeInfo: {
				revisionMode: 'major'
			},
			semantic: ['E'],
			object: {
				'ds6w:label': displayName,
				'ds6w:name': objectName,
				'ds6w:type': objectType,
				'PLMEntity.V_Name': objectName,
				'attribute[PLMEntity.V_Name]': objectName,
				displayName: displayName,
				name: objectName,
				label: displayName,
				title: displayName,
				revision: revision,
				current: current,
				current_internal: currentInternal,
				cadMaster: cadMaster,
				typeDisplayName: typeDisplayName
			},
			options: {
				'ds6w:status': current,
				'icons': [imageUrl],
				'ds6w:type': typeDisplayName
			},
			policy: policy,
			cadMaster: cadMaster,
			locked: false,
			lockedBy: null,
			branch: null,
			'branch.uuid': null,
			'type.kindof[PLMReference]': 'TRUE',
			popup: true
		};
	});

	// 存储到全局变量，供补丁使用
	currentReviseTargetNodes = targetNodes;

	const mockContext = {
		getSelectedNodes: () => targetNodes,
		getEditMode: () => false,
		getPADTreeDocument: () => ({ getXSO: () => ({ onPostAdd: () => {}, onPostRemove: () => {}, onEmpty: () => {}, get: () => targetNodes }) }),
		getCurrentFolder: () => '{}',
		addEvent: () => {},
		selectedNodes: targetNodes
	};

	// 加载模块并应用补丁
	const topWindow = (window.top || window.parent || window) as any;
	const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;

	requireFn(['DS/ReviseWidget/ReviseWidget', 'DS/LifecycleCmd/ReviseCmd', 'DS/WAFData/WAFData'], (ReviseWidget: any, ReviseCmd: any, WAFData: any) => {
		applyReviseWidgetPatches(ReviseWidget, WAFData);
		const ReviseCmdCtor = ReviseCmd?.default || ReviseCmd;
		const reviseCmd = new ReviseCmdCtor({
			ID: 'revise_command',
			context: mockContext
		});
		reviseCmd.execute();
	});
};
```

##### 2. 应用 WAFData 补丁

```typescript
const applyReviseWidgetPatches = (ReviseWidget: any, WAFData: any) => {
	// 拦截 WAFData.authenticatedRequest，修正请求参数和响应
	if (WAFData && typeof WAFData.authenticatedRequest === 'function' && !WAFData.__twPatchReviseRequest) {
		const originalAuthenticatedRequest = WAFData.authenticatedRequest;
		WAFData.authenticatedRequest = function (url: string, options: any) {
			const isReviseRequest = url && (url.includes('/prepare_revise_checkavailability') || url.includes('/attributeList'));

			// 修正请求参数
			if (isReviseRequest && options?.data) {
				try {
					const requestData = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;
					if (Array.isArray(requestData?.data) && Array.isArray(currentReviseTargetNodes)) {
						const sourceById = new Map<string, any>();
						currentReviseTargetNodes.forEach(node => {
							const objectId = node?.objectId || node?.physicalid || node?.physicalId;
							if (objectId) sourceById.set(objectId, node);
						});
						requestData.data = requestData.data.map((item: any) => {
							const objectId = item?.physicalid;
							const source = objectId ? sourceById.get(objectId) : null;
							if (!source) return item;

							const isValidText = (value: unknown) => {
								if (value === undefined || value === null || value === '') return false;
								const text = String(value);
								return text !== 'undefined' && text !== 'null' && !text.includes('undefined ');
							};

							return {
								...item,
								name: isValidText(item?.name) ? item.name : source.name,
								displayName: isValidText(item?.displayName) ? item.displayName : source.displayName,
								typeDisplayName: item?.typeDisplayName && item.typeDisplayName !== item.type && item.typeDisplayName !== 'ds6w:Part' ? item.typeDisplayName : source.typeDisplayName,
								current: item?.current || source.current,
								current_internal: item?.current_internal === '工作中' ? 'IN_WORK' : item?.current_internal || source.current_internal,
								tenant: item?.tenant || source.tenant || 'OnPremise',
								cadMaster: item?.cadMaster || source.cadMaster || '3DEXPERIENCE'
							};
						});
						options.data = JSON.stringify(requestData);
					}
				} catch (error) {
					console.error('[TW_EngineeringRelease] 修正 revise 请求失败:', error);
				}
			}

			// 修正响应数据
			const originalOnComplete = options?.onComplete;
			if (isReviseRequest && originalOnComplete) {
				options.onComplete = function (response: any) {
					if ((url.includes('/attributeList') || url.includes('/prepare_revise_checkavailability')) && response?.results && Array.isArray(response.results) && Array.isArray(currentReviseTargetNodes)) {
						const sourceById = new Map<string, any>();
						currentReviseTargetNodes.forEach(node => {
							const objectId = node?.objectId || node?.physicalid || node?.physicalId;
							if (objectId) sourceById.set(objectId, node);
						});
						response.results.forEach((result: any) => {
							const objectId = result?.objectId || result?.physicalid;
							const source = objectId ? sourceById.get(objectId) : null;
							if (!source) return;

							const isValidText = (value: unknown) => {
								if (value === undefined || value === null || value === '') return false;
								const text = String(value);
								return text !== 'undefined' && text !== 'null' && !text.includes('undefined ');
							};

							if (!isValidText(result.displayName)) result.displayName = source.displayName || source.name || source.title;
							if (!isValidText(result.name)) result.name = source.name || source.displayName || source.title;
							if (!result.revision) result.revision = source.revision;
							if (!result.current) result.current = source.current;
							if (!result.current_internal) result.current_internal = source.current_internal;
							if (!result.typeDisplayName || result.typeDisplayName === result.type) result.typeDisplayName = source.typeDisplayName || result.typeDisplayName;
							if (!result.displayType || result.displayType === result.type) result.displayType = source.displayType || result.displayType;
							if (!result.cadMaster) result.cadMaster = source.cadMaster;
							if (!result.imageUrl) result.imageUrl = source.imageUrl;
							if (!result.options) result.options = {};
							if (!result.options['ds6w:status']) result.options['ds6w:status'] = source.current;
							if (!result.options['ds6w:type']) result.options['ds6w:type'] = source.typeDisplayName || source.displayType;
						});
					}
					return originalOnComplete.call(this, response);
				};
			}

			return originalAuthenticatedRequest.call(this, url, options);
		};
		WAFData.__twPatchReviseRequest = true;
	}
};
```

##### 3. 应用 _attributeListRequest 补丁

```typescript
const applyReviseWidgetPatches = (ReviseWidget: any, WAFData: any) => {
	const ReviseWidgetCtor = ReviseWidget?.default || ReviseWidget;
	const reviseWidgetPrototype = ReviseWidgetCtor?.prototype;

	// 拦截 _attributeListRequest，合并原始节点字段
	if (reviseWidgetPrototype && typeof reviseWidgetPrototype._attributeListRequest === 'function' && !reviseWidgetPrototype.__twMergeSelectionInfoForRevise) {
		const originalAttributeListRequest = reviseWidgetPrototype._attributeListRequest;
		reviseWidgetPrototype._attributeListRequest = function (objects: any[], securityContext: any, callback: (results: any[]) => void) {
			const isValidText = (value: unknown) => {
				if (value === undefined || value === null || value === '') return false;
				const text = String(value);
				return text !== 'undefined' && text !== 'null' && !text.includes('undefined ');
			};
			const sourceById = new Map<string, any>();
			currentReviseTargetNodes.forEach(node => {
				const objectId = node?.objectId || node?.physicalid || node?.physicalId;
				if (objectId) sourceById.set(objectId, node);
			});
			const normalizedObjects = (objects || []).map(object => {
				const objectId = object?.objectId || object?.physicalid;
				const source = objectId ? sourceById.get(objectId) : null;
				if (!source) return object;
				return {
					...object,
					displayName: isValidText(object?.displayName) ? object.displayName : source.displayName,
					name: isValidText(object?.name) ? object.name : source.name,
					revision: object?.revision || source.revision,
					current: object?.current || source.current,
					current_internal: object?.current_internal || source.current_internal,
					typeDisplayName: isValidText(object?.typeDisplayName) ? object.typeDisplayName : source.typeDisplayName,
					displayType: isValidText(object?.displayType) ? object.displayType : source.displayType,
					cadMaster: object?.cadMaster || source.cadMaster,
					imageUrl: object?.imageUrl || source.imageUrl,
					options: object?.options || {},
					'options.ds6w:status': object?.options?.['ds6w:status'] || source.current,
					'options.ds6w:type': object?.options?.['ds6w:type'] || source.typeDisplayName || source.displayType
				};
			});
			return originalAttributeListRequest.call(this, normalizedObjects, securityContext, callback);
		};
		reviseWidgetPrototype.__twMergeSelectionInfoForRevise = true;
	}
};
```

### 全局变量定义

```typescript
// 在组件顶层定义全局变量
let currentReviseTargetNodes: any[] = [];
```

### 辅助函数

```typescript
const pickOpenWithField = (row: any, ...keys: string[]): string => {
	for (const key of keys) {
		const value = row?.[key];
		if (value !== undefined && value !== null && value !== '') return String(value);
	}
	return '';
};

const X3D_OBJECT_TAXONOMIES = [
	'PLMEntity',
	'PLMReference',
	'PLMCoreReference',
	'LPAbstractReference',
	'PHYSICALAbstractReference',
	'VPMReference',
	'3DPart',
	'XCADExtension',
	'CN_PartInfo'
];
```

### 注意事项

1. **补丁标记**：使用 `__twPatchExecuteCmd`、`__twPatchReviseRequest`、`__twMergeSelectionInfoForRevise` 等标记避免重复应用补丁
2. **数据来源**：executeCmd 补丁优先从 `options.context.getSelectedNodes` 获取最新数据，确保每次调用都能获取到正确的数据
3. **字段验证**：使用 `isValidText` 函数验证字段值，避免将 "undefined"、"null" 等字符串作为有效值
4. **多选刷新**：多选刷新时使用 `Promise.all` 并行刷新所有选中行，并在完成后统一显示一次消息
5. **回调函数**：PlatformAPI.subscribe 的回调函数需要标记为 `async`，以支持 await 操作

### 完整示例

```typescript
// 在 Vue 组件中
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useBaseInfoStore } from '@/store/modules/baseInfo';

const baseInfoStore = useBaseInfoStore();
let currentReviseTargetNodes: any[] = [];

const pickOpenWithField = (row: any, ...keys: string[]): string => {
	for (const key of keys) {
		const value = row?.[key];
		if (value !== undefined && value !== null && value !== '') return String(value);
	}
	return '';
};

const X3D_OBJECT_TAXONOMIES = [
	'PLMEntity',
	'PLMReference',
	'PLMCoreReference',
	'LPAbstractReference',
	'PHYSICALAbstractReference',
	'VPMReference',
	'3DPart',
	'XCADExtension',
	'CN_PartInfo'
];

const applyReviseWidgetPatches = (ReviseWidget: any, WAFData: any) => {
	// 应用 WAFData 补丁
	// 应用 executeCmd 补丁
	// 应用 _attributeListRequest 补丁
	// ... 参考上面的实现
};

const callLifecycleReviseEntry = (ReviseCmd: any, physicalId: string) => {
	// 构造 targetNode
	// 构造 mockContext
	// 实例化并执行 ReviseCmd
	// ... 参考上面的实现
};

const openLifecycleReviseCmd = async (physicalId: string) => {
	// 加载模块并应用补丁
	// ... 参考上面的实现
};

const handleSelectedRowNewRevision = async () => {
	// 构造 targetNodes 数组
	// 加载模块并应用补丁
	// ... 参考上面的实现
};
```

## 参考资源

- 达索本地示例: `D:\AI\2026webapp\2026webapp\ENOXEngineer\ENOXEngineer.js`
- ReviseWidget 源码: `D:\AI\TWX_PSE\webapps\ReviseWidget.js`
- LifecycleCmd 源码: `D:\AI\TWX_PSE\webapps\LifecycleCmd.js`
- HistoryCmd 源码: `D:\AI\TWX_PSE\LifecycleCmd\LifecycleCmd.js`
- HistoryExplorer 源码: `D:\AI\2026webapp\2026webapp\HistoryExplorer\HistoryExplorer.js`
- ReviseCmd 源码: `D:\AI\2026webapp\2026webapp\LifecycleCmd\LifecycleCmd.js`
- D:\AI\TWX_PSE\webapps\ReviseWidget.js
