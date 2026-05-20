<template>
	<el-dialog
		v-model="visible"
		width="780px"
		:show-close="true"
		:close-on-click-modal="false"
		draggable
		class="revision-version-select-dialog">
		<template #header>
			<span>修订版</span>
		</template>
		<div class="revision-select-content">
			<el-table
				ref="tableRef"
				:data="sortedVersions"
				border
				size="small"
				class="revision-select-table"
				:height="380"
				highlight-current-row
				:row-class-name="getRowClassName"
				@current-change="handleCurrentChange">
				<el-table-column
					label="图表"
					width="80">
					<template #default="{ row, $index }">
						<div class="version-graph-cell">
							<div
								class="version-dot"
								:class="{ selected: selectedVersion?.id === row.id }"></div>
							<div
								v-if="$index < sortedVersions.length - 1"
								class="version-line"></div>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="标题"
					min-width="200">
					<template #default="{ row }">
						<div class="title-cell">
							<span>{{ row.label || '-' }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="code"
					label="修订版"
					width="80" />
				<el-table-column
					label="成熟度状态"
					width="100">
					<template #default="{ row }">
						<el-tag
							v-if="row.maturity"
							:type="getMaturityTagType(row.maturity)"
							size="small"
							effect="dark">
							{{ row.maturity_nls || row.maturity }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column
					label="创建日期"
					width="140">
					<template #default="{ row }">
						{{ formatDate(row.creation) }}
					</template>
				</el-table-column>
				<el-table-column
					label="修改日期"
					width="140">
					<template #default="{ row }">
						{{ formatDate(row.modification) }}
					</template>
				</el-table-column>
			</el-table>
		</div>
		<template #footer>
			<el-button
				type="primary"
				:disabled="!selectedVersion || selectedVersion.id === currentPhysicalId"
				@click="handleConfirm">
				确定
			</el-button>
			<el-button @click="handleCancel">取消</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { VersionGraphVersion } from '@/api/partDetailApi';

const props = defineProps<{
	modelValue: boolean;
	versions: VersionGraphVersion[];
	currentPhysicalId: string;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'confirm', version: VersionGraphVersion): void;
	(e: 'cancel'): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

const tableRef = ref();
const selectedVersion = ref<VersionGraphVersion | null>(null);

const sortedVersions = computed(() => {
	return [...props.versions].reverse();
});

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger';

const getMaturityTagType = (maturity: string): TagType => {
	switch (maturity) {
		case 'IN_WORK':
			return 'primary';
		case 'FROZEN':
			return 'info';
		case 'RELEASED':
			return 'success';
		default:
			return 'info';
	}
};

const formatDate = (dateStr?: string) => {
	if (!dateStr) return '';
	try {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${year}年${month}月${day}日...`;
	} catch {
		return dateStr;
	}
};

const isRowDisabled = (row: VersionGraphVersion) => row.id === props.currentPhysicalId;

const getRowClassName = ({ row }: { row: VersionGraphVersion }) => {
	if (isRowDisabled(row)) return 'revision-row-disabled';
	if (selectedVersion.value?.id === row.id) return 'revision-row-selected';
	return '';
};

const handleCurrentChange = (row: VersionGraphVersion | null) => {
	if (row && !isRowDisabled(row)) {
		selectedVersion.value = row;
	}
};

const handleConfirm = () => {
	if (selectedVersion.value) {
		emit('confirm', selectedVersion.value);
	}
};

const handleCancel = () => {
	emit('cancel');
	visible.value = false;
};

watch(
	() => props.modelValue,
	value => {
		if (value) {
			selectedVersion.value = null;
			nextTick(() => {
				if (sortedVersions.value.length && tableRef.value) {
					const firstRow = sortedVersions.value[0];
					selectedVersion.value = firstRow.id !== props.currentPhysicalId ? firstRow : null;
					tableRef.value.setCurrentRow(firstRow);
				}
			});
		}
	}
);
</script>

<style scoped lang="scss">
.revision-select-content {
	min-height: 200px;
}

.revision-select-table {
	width: 100%;
}

:deep(.revision-row-disabled) {
	background-color: #f5f7fa !important;
	color: #c0c4cc;
	cursor: not-allowed;

	td {
		background-color: #f5f7fa !important;
	}
}

:deep(.revision-row-selected) {
	background-color: #ecf5ff !important;

	td {
		background-color: #ecf5ff !important;
	}
}

:deep(.el-table__body tr.current-row.revision-row-disabled td) {
	background-color: #f5f7fa !important;
}

:deep(.el-table__body tr.current-row.revision-row-selected td) {
	background-color: #d9ecff !important;
}

.title-cell {
	display: flex;
	align-items: center;
	gap: 8px;
}

.version-graph-cell {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100%;
	padding: 4px 0;
}

.version-dot {
	width: 10px;
	height: 10px;
	border: 2px solid #409eff;
	border-radius: 50%;
	background-color: #ffffff;
	z-index: 1;
}

.version-dot.selected {
	background-color: #409eff;
}

.version-line {
	position: absolute;
	top: 14px;
	left: 50%;
	width: 2px;
	height: calc(100% + 10px);
	background-color: #409eff;
	transform: translateX(-50%);
}
</style>
