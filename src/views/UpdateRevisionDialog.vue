<template>
	<el-dialog
		v-model="visible"
		width="1280px"
		:show-close="true"
		:close-on-click-modal="false"
		draggable
		class="update-revision-dialog">
		<template #header>
			<span>更新修订版</span>
		</template>
		<div class="update-revision-content">
			<div class="update-revision-toolbar">
				<span>全部替换为:</span>
				<el-select
					v-model="batchAction"
					size="small"
					style="width: 180px; margin-left: 8px"
					@change="handleBatchActionChange">
					<el-option
						label="无"
						value="" />
					<el-option
						v-if="batchOptions.hasLatest"
						label="替换为最新修订版"
						value="latest" />
					<el-option
						v-if="batchOptions.hasFrozen"
						label="替换为最新的稳定版本版"
						value="frozen" />
					<el-option
						v-if="batchOptions.hasReleased"
						label="替换为最新发布的修订版"
						value="released" />
				</el-select>
			</div>
			<el-table
				v-loading="dataLoading"
				:data="visibleRows"
				border
				size="small"
				class="update-revision-table"
				:height="380">
				<el-table-column
					label="标题"
					min-width="340">
					<template #default="{ row }">
						<div
							class="title-cell"
							:style="{ paddingLeft: row.level * 20 + 'px' }">
							<span
								v-if="row.hasChildren"
								class="tree-expand-icon"
								@click="toggleExpand(row)">
								{{ expandedIds.has(row.rowId) ? '−' : '+' }}
							</span>
							<span
								v-else
								class="tree-expand-placeholder"></span>
							<img
								v-if="row.icon"
								:src="row.icon"
								class="row-icon"
								alt="" />
							<span class="title-text">{{ row.label || '-' }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="revision"
					label="修订版"
					width="80" />
				<el-table-column
					prop="statusDisplay"
					label="成熟度状态"
					width="105" />
				<el-table-column
					prop="typeDisplay"
					label="类型"
					width="100" />
				<el-table-column
					prop="owner"
					label="所有者"
					width="105" />
				<el-table-column
					label=""
					width="42">
					<template #default="{ row }">
						<div class="version-indicator">
							<div
								class="version-block"
								:class="{ active: row.availableCount >= 3 }"></div>
							<div
								class="version-block"
								:class="{ active: row.availableCount >= 2 }"></div>
							<div
								class="version-block"
								:class="{ active: row.availableCount >= 1 }"></div>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="替换操作"
					width="190">
					<template #default="{ row }">
						<el-select
							v-model="row.selectedAction"
							size="small"
							style="width: 100%"
							@change="handleRowActionChange(row)">
							<el-option
								label="无"
								value="" />
							<el-option
								v-if="row.options.hasLatest"
								label="替换为最新修订版"
								value="latest" />
							<el-option
								v-if="row.options.hasFrozen"
								label="替换为最新的稳定版本版"
								value="frozen" />
							<el-option
								v-if="row.options.hasReleased"
								label="替换为最新发布的修订版"
								value="released" />
							<el-option
								label="用修订版替换"
								value="manual" />
							<el-option
								label="新建修订版"
								value="newRevision" />
							<el-option
								label="替换为新修订版"
								value="replaceNewRevision" />
						</el-select>
					</template>
				</el-table-column>
				<el-table-column
					prop="expectedRevision"
					label="预期修订版"
					width="105" />
				<el-table-column
					prop="expectedMaturity"
					label="预期成熟度"
					width="105" />
			</el-table>
		</div>
		<template #footer>
			<el-button
				type="primary"
				:loading="submitting"
				:disabled="dataLoading || submitting || !hasAnySelection"
				@click="handleConfirm">
				确定
			</el-button>
			<el-button
				:disabled="submitting"
				@click="visible = false">
				取消
			</el-button>
		</template>
	</el-dialog>
	<RevisionVersionSelectDialog
		v-model="versionSelectVisible"
		:versions="currentRowVersions"
		:current-physical-id="currentRowPhysicalId"
		@confirm="handleVersionSelectConfirm"
		@cancel="handleVersionSelectCancel" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { VersionGraphVersion, PartInfo } from '@/api/partDetailApi';
import type { TreeNode } from '@/api/expandApi';
import partDetailApi from '@/api/partDetailApi';
import RevisionVersionSelectDialog from './RevisionVersionSelectDialog.vue';

export interface UpdateRevisionRow {
	rowId: string;
	physicalId: string;
	relationId: string;
	parentPhysicalId: string;
	label: string;
	revision: string;
	statusDisplay: string;
	typeDisplay: string;
	owner: string;
	icon: string;
	versions: VersionGraphVersion[];
	options: {
		hasLatest: boolean;
		hasFrozen: boolean;
		hasReleased: boolean;
	};
	availableCount: number;
	selectedAction: string;
	expectedRevision: string;
	expectedMaturity: string;
	targetPhysicalId: string;
	level: number;
	hasChildren: boolean;
	children: UpdateRevisionRow[];
}

const props = defineProps<{
	modelValue: boolean;
	partInfo: PartInfo | null;
	childrenData: TreeNode[];
	currentPhysicalId: string;
	submitting?: boolean;
}>();

export interface UpdateRevisionOperation {
	action: 'replace' | 'newRevision' | 'replaceNewRevision';
	physicalId: string;
	hasParent: string;
	instance: string;
	isInstanceOf: string;
	oldName: string;
	newName: string;
}

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'confirm', operations: UpdateRevisionOperation[]): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

const treeData = ref<UpdateRevisionRow[]>([]);
const expandedIds = ref<Set<string>>(new Set());
const dataLoading = ref(false);
const batchAction = ref('');
const versionSelectVisible = ref(false);
const currentRowVersions = ref<VersionGraphVersion[]>([]);
const currentRowPhysicalId = ref('');
const currentEditingRowId = ref('');

const flattenTree = (rows: UpdateRevisionRow[]): UpdateRevisionRow[] =>
	rows.flatMap(row => [row, ...(row.children?.length ? flattenTree(row.children) : [])]);

const allFlatRows = computed(() => flattenTree(treeData.value));

const flattenVisible = (rows: UpdateRevisionRow[]): UpdateRevisionRow[] =>
	rows.flatMap(row => [row, ...(row.hasChildren && expandedIds.value.has(row.rowId) ? flattenVisible(row.children) : [])]);

const visibleRows = computed(() => flattenVisible(treeData.value));

const submitting = computed(() => !!props.submitting);

const toggleExpand = (row: UpdateRevisionRow) => {
	const newSet = new Set(expandedIds.value);
	if (newSet.has(row.rowId)) {
		newSet.delete(row.rowId);
	} else {
		newSet.add(row.rowId);
	}
	expandedIds.value = newSet;
};

const hasAnySelection = computed(() =>
	allFlatRows.value.some(
		row => row.selectedAction && (row.targetPhysicalId || row.selectedAction === 'newRevision' || row.selectedAction === 'replaceNewRevision')
	)
);

const batchOptions = computed(() => {
	const rows = allFlatRows.value;
	const hasLatest = rows.some(row => row.options.hasLatest);
	const hasFrozen = rows.some(row => row.options.hasFrozen);
	const hasReleased = rows.some(row => row.options.hasReleased);
	return { hasLatest, hasFrozen, hasReleased };
});

const isLastVersionValue = (value: unknown) => String(value).toLowerCase() === 'true';

const findLatestVersion = (versions: VersionGraphVersion[], requestPhysicalId: string): VersionGraphVersion | null => {
	const latest = versions.find(v => isLastVersionValue(v.isLastVersion));
	if (!latest || latest.id === requestPhysicalId) return null;
	return latest;
};

const findLatestFrozen = (versions: VersionGraphVersion[], requestPhysicalId: string): VersionGraphVersion | null => {
	for (let i = versions.length - 1; i >= 0; i--) {
		if (versions[i].maturity === 'FROZEN' || versions[i].maturity === 'RELEASED') {
			if (versions[i].id === requestPhysicalId) return null;
			return versions[i];
		}
	}
	return null;
};

const findLatestReleased = (versions: VersionGraphVersion[], requestPhysicalId: string): VersionGraphVersion | null => {
	for (let i = versions.length - 1; i >= 0; i--) {
		if (versions[i].maturity === 'RELEASED') {
			if (versions[i].id === requestPhysicalId) return null;
			return versions[i];
		}
	}
	return null;
};

const getTargetVersion = (action: string, versions: VersionGraphVersion[], physicalId: string): VersionGraphVersion | null => {
	switch (action) {
		case 'latest':
			return findLatestVersion(versions, physicalId);
		case 'frozen':
			return findLatestFrozen(versions, physicalId);
		case 'released':
			return findLatestReleased(versions, physicalId);
		default:
			return null;
	}
};

const computeOptions = (versions: VersionGraphVersion[], physicalId: string) => {
	const hasLatest = !!findLatestVersion(versions, physicalId);
	const hasFrozen = !!findLatestFrozen(versions, physicalId);
	const hasReleased = !!findLatestReleased(versions, physicalId);
	return { hasLatest, hasFrozen, hasReleased };
};

const computeAvailableCount = (options: { hasLatest: boolean; hasFrozen: boolean; hasReleased: boolean }) => {
	return (options.hasLatest ? 1 : 0) + (options.hasFrozen ? 1 : 0) + (options.hasReleased ? 1 : 0);
};

const findRowById = (rowId: string): UpdateRevisionRow | undefined => allFlatRows.value.find(r => r.rowId === rowId);

const computeNewRevision = (versions: VersionGraphVersion[]): string => {
	if (!versions.length) return '';
	const lastVersion = versions[versions.length - 1];
	const currentCode = lastVersion.code || '';
	const dotIndex = currentCode.lastIndexOf('.');
	if (dotIndex === -1) return '';
	const prefix = currentCode.substring(0, dotIndex);
	const suffix = currentCode.substring(dotIndex + 1);
	if (lastVersion.maturity === 'RELEASED') {
		const lastChar = prefix[prefix.length - 1];
		const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
		const newPrefix = prefix.substring(0, prefix.length - 1) + nextChar;
		return `${newPrefix}.1`;
	} else {
		const nextSuffix = parseInt(suffix, 10) + 1;
		return `${prefix}.${nextSuffix}`;
	}
};

const handleRowActionChange = (row: UpdateRevisionRow) => {
	if (row.selectedAction === 'manual') {
		currentEditingRowId.value = row.rowId;
		currentRowPhysicalId.value = row.physicalId;
		openVersionSelectForRow(row);
		return;
	}
	if (row.selectedAction === 'newRevision' || row.selectedAction === 'replaceNewRevision') {
		row.expectedRevision = computeNewRevision(row.versions);
		row.expectedMaturity = '工作中';
		row.targetPhysicalId = '';
		return;
	}
	const target = getTargetVersion(row.selectedAction, row.versions, row.physicalId);
	if (target) {
		row.expectedRevision = target.code || '';
		row.expectedMaturity = target.maturity_nls || target.maturity || '';
		row.targetPhysicalId = target.id;
	} else {
		row.expectedRevision = '';
		row.expectedMaturity = '';
		row.targetPhysicalId = '';
	}
};

const openVersionSelectForRow = async (row: UpdateRevisionRow) => {
	try {
		const response = await partDetailApi.getVersionGraph(row.physicalId);
		const versions = response.graphs?.[0]?.versions || [];
		currentRowVersions.value = versions;
		versionSelectVisible.value = true;
	} catch (error) {
		console.error('[UpdateRevisionDialog] 获取版本图失败:', error);
	}
};

const handleVersionSelectConfirm = (version: VersionGraphVersion) => {
	const row = findRowById(currentEditingRowId.value);
	if (row && version) {
		row.expectedRevision = version.code || '';
		row.expectedMaturity = version.maturity_nls || version.maturity || '';
		row.targetPhysicalId = version.id;
	}
	versionSelectVisible.value = false;
};

const handleVersionSelectCancel = () => {
	const row = findRowById(currentEditingRowId.value);
	if (row) {
		row.selectedAction = '';
		row.expectedRevision = '';
		row.expectedMaturity = '';
		row.targetPhysicalId = '';
	}
	versionSelectVisible.value = false;
};

const handleBatchActionChange = () => {
	for (const row of allFlatRows.value) {
		if (batchAction.value === '') {
			row.selectedAction = '';
			row.expectedRevision = '';
			row.expectedMaturity = '';
			row.targetPhysicalId = '';
			continue;
		}
		if (batchAction.value === 'latest' && row.options.hasLatest) {
			row.selectedAction = 'latest';
			handleRowActionChange(row);
		} else if (batchAction.value === 'frozen' && row.options.hasFrozen) {
			row.selectedAction = 'frozen';
			handleRowActionChange(row);
		} else if (batchAction.value === 'released' && row.options.hasReleased) {
			row.selectedAction = 'released';
			handleRowActionChange(row);
		}
	}
};

const handleConfirm = () => {
	const operations: UpdateRevisionOperation[] = allFlatRows.value
		.filter(
			row => row.selectedAction && (row.targetPhysicalId || row.selectedAction === 'newRevision' || row.selectedAction === 'replaceNewRevision')
		)
		.map(row => {
			let action: UpdateRevisionOperation['action'] = 'replace';
			if (row.selectedAction === 'newRevision') action = 'newRevision';
			else if (row.selectedAction === 'replaceNewRevision') action = 'replaceNewRevision';
			return {
				action,
				physicalId: row.physicalId,
				hasParent: row.parentPhysicalId,
				instance: row.relationId,
				isInstanceOf: row.targetPhysicalId,
				oldName: `${row.label} ${row.revision}`.trim(),
				newName: `${row.label} ${row.expectedRevision}`.trim()
			};
		});
	if (operations.length) {
		emit('confirm', operations);
	}
};

const collectPhysicalIds = (nodes: TreeNode[]): string[] => {
	const ids: string[] = [];
	for (const node of nodes) {
		if (node.resourceid) ids.push(node.resourceid);
		if (node.children?.length) {
			ids.push(...collectPhysicalIds(node.children));
		}
	}
	return ids;
};

const expandAllIds = (rows: UpdateRevisionRow[]): string[] => {
	const ids: string[] = [];
	for (const row of rows) {
		if (row.hasChildren) {
			ids.push(row.rowId);
			ids.push(...expandAllIds(row.children));
		}
	}
	return ids;
};

const buildTreeRow = (node: TreeNode, parentPhysicalId: string, level: number, graphsMap: Map<string, VersionGraphVersion[]>): UpdateRevisionRow => {
	const versions = graphsMap.get(node.resourceid) || [];
	const options = computeOptions(versions, node.resourceid);
	const childRows = node.children?.length ? node.children.map(child => buildTreeRow(child, node.resourceid, level + 1, graphsMap)) : [];
	return {
		rowId: node.id,
		physicalId: node.resourceid,
		relationId: node.relationId || '',
		parentPhysicalId,
		label: node.label || node.identifier || '',
		revision: node.revision || '',
		statusDisplay: node.status || '',
		typeDisplay: node.globalType || '',
		owner: node.owner || '',
		icon: node.icon || node.type_icon_url || '',
		versions,
		options,
		availableCount: computeAvailableCount(options),
		selectedAction: '',
		expectedRevision: '',
		expectedMaturity: '',
		targetPhysicalId: '',
		level,
		hasChildren: childRows.length > 0,
		children: childRows
	};
};

const loadData = async () => {
	const info = props.partInfo;
	if (!info) return;

	const rootPhysicalId = info.resourceid || info.physicalid || props.currentPhysicalId;
	if (!rootPhysicalId) return;

	const childIds = collectPhysicalIds(props.childrenData);
	const allIds = [...new Set([rootPhysicalId, ...childIds])];

	try {
		dataLoading.value = true;
		const response = await partDetailApi.getVersionGraphBatch(allIds);
		const graphs = response.graphs || [];
		const graphsMap = new Map<string, VersionGraphVersion[]>();
		for (const graph of graphs) {
			if (graph.versions) {
				for (const version of graph.versions) {
					if (!graphsMap.has(version.id)) {
						graphsMap.set(version.id, graph.versions);
					}
				}
			}
		}

		const rootVersions = graphsMap.get(rootPhysicalId) || [];
		const rootOptions = computeOptions(rootVersions, rootPhysicalId);
		const childRows = props.childrenData.map(child => buildTreeRow(child, rootPhysicalId, 1, graphsMap));
		const rootCurrentVersion = rootVersions.find(v => v.id === rootPhysicalId);

		const rootRow: UpdateRevisionRow = {
			rowId: 'root',
			physicalId: rootPhysicalId,
			relationId: '',
			parentPhysicalId: '',
			label: info['ds6w:label'] || '',
			revision: info['ds6wg:revision'] || '',
			statusDisplay: rootCurrentVersion?.maturity_nls || info['ds6w:status'] || '',
			typeDisplay: info['ds6w:type'] || '',
			owner: info['owner'] || '',
			icon: info['type_icon_url'] || '',
			versions: rootVersions,
			options: rootOptions,
			availableCount: computeAvailableCount(rootOptions),
			selectedAction: '',
			expectedRevision: '',
			expectedMaturity: '',
			targetPhysicalId: '',
			level: 0,
			hasChildren: childRows.length > 0,
			children: childRows
		};

		treeData.value = [rootRow];
		expandedIds.value = new Set(expandAllIds([rootRow]));
	} catch (error) {
		console.error('[UpdateRevisionDialog] 加载版本图数据失败:', error);
	} finally {
		dataLoading.value = false;
	}
};

watch(
	() => props.modelValue,
	value => {
		if (value) {
			batchAction.value = '';
			treeData.value = [];
			expandedIds.value = new Set();
			loadData();
		}
	}
);
</script>

<style scoped lang="scss">
.update-revision-content {
	min-height: 200px;
}

.update-revision-toolbar {
	display: flex;
	align-items: center;
	margin-bottom: 12px;
	font-size: 13px;
}

.update-revision-table {
	width: 100%;
}

.title-cell {
	display: flex;
	align-items: center;
	gap: 4px;
	min-width: 0;
}

.tree-expand-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	border: 1px solid #c0c4cc;
	border-radius: 2px;
	font-size: 12px;
	line-height: 1;
	cursor: pointer;
	user-select: none;
	flex: 0 0 auto;
	background-color: #fff;
	color: #606266;
}

.tree-expand-icon:hover {
	border-color: #409eff;
	color: #409eff;
}

.tree-expand-placeholder {
	display: inline-block;
	width: 18px;
	flex: 0 0 auto;
}

.row-icon {
	width: 22px;
	height: 22px;
	object-fit: contain;
	flex: 0 0 auto;
}

.title-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.version-indicator {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.version-block {
	width: 18px;
	height: 8px;
	border-radius: 2px;
	background-color: #dcdfe6;
	transition: background-color 0.2s;
}

.version-block.active {
	background-color: #409eff;
}
</style>
