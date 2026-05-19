<template>
	<el-dialog
		v-model="visible"
		width="564px"
		:show-close="true"
		:close-on-click-modal="false"
		draggable
		:style="dialogStyle"
		:align-center="false"
		class="update-entire-structure-revision-dialog">
		<template #header>
			<div class="dialog-title">
				<span class="dialog-title-icon">⇅</span>
				<span>更新整个结构的修订版确认</span>
			</div>
		</template>
		<div class="confirm-content">
			<el-table
				v-if="confirmations.length"
				:data="confirmations"
				border
				:size="'small'"
				class="confirm-table"
				:height="tableHeight">
				<el-table-column
					label="标题"
					min-width="250">
					<template #default="{ row }">
						<div class="title-cell">
							<img
								v-if="row.icon"
								:src="row.icon"
								class="row-icon"
								alt="" />
							<span>{{ row.label || '-' }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="code"
					label="修订版"
					width="108" />
				<el-table-column
					label="替换操作"
					width="194">
					<template #default="{ row }">
						{{ formatOperation(row.operation) }}
					</template>
				</el-table-column>
			</el-table>
			<div
				v-else
				class="empty-confirm-text">
				<div class="empty-confirm-card">
					<div class="empty-confirm-icon">✓</div>
					<div class="empty-confirm-title">结构已是最新修订版</div>
					<div class="empty-confirm-description">已使用最新修订版更新结构，无需执行替换操作。</div>
				</div>
			</div>
		</div>
		<template #footer>
			<el-button
				type="primary"
				@click="emitConfirm">
				确定
			</el-button>
			<el-button @click="visible = false">取消</el-button>
		</template>
		<div
			class="dialog-resize-handle"
			@mousedown="handleResizeStart"></div>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import type { UpdateEntireStructureRevisionConfirmation } from '@/api/partDetailApi';

const props = defineProps<{
	modelValue: boolean;
	confirmations: UpdateEntireStructureRevisionConfirmation[];
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'confirm'): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

const dialogSize = ref({
	width: 564,
	height: props.confirmations.length ? 560 : 360
});
const dialogStyle = computed(() => ({
	width: `${dialogSize.value.width}px`,
	height: `${dialogSize.value.height}px`
}));
const tableHeight = computed(() => Math.max(200, dialogSize.value.height - 160));
let resizing = false;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;

const operationTextMap: Record<string, string> = {
	update: '更新',
	newRevisionAndUpdate: '新修订版和更新'
};

const formatOperation = (operation?: string) => operationTextMap[operation || ''] || operation || '-';

const emitConfirm = () => {
	emit('confirm');
};

watch(
	() => props.modelValue,
	value => {
		if (!value) return;
		dialogSize.value = {
			width: 564,
			height: props.confirmations.length ? 560 : 360
		};
	}
);

const handleResizeMove = (event: MouseEvent) => {
	if (!resizing) return;
	dialogSize.value = {
		width: Math.max(480, resizeStartWidth + event.clientX - resizeStartX),
		height: Math.max(360, resizeStartHeight + event.clientY - resizeStartY)
	};
};

const handleResizeEnd = () => {
	if (!resizing) return;
	resizing = false;
	document.body.classList.remove('update-entire-structure-revision-dialog-resizing');
	window.removeEventListener('mousemove', handleResizeMove);
	window.removeEventListener('mouseup', handleResizeEnd);
};

const handleResizeStart = (event: MouseEvent) => {
	event.preventDefault();
	event.stopPropagation();
	resizing = true;
	resizeStartX = event.clientX;
	resizeStartY = event.clientY;
	resizeStartWidth = dialogSize.value.width;
	resizeStartHeight = dialogSize.value.height;
	document.body.classList.add('update-entire-structure-revision-dialog-resizing');
	window.addEventListener('mousemove', handleResizeMove);
	window.addEventListener('mouseup', handleResizeEnd);
};

onUnmounted(() => {
	handleResizeEnd();
});
</script>

<style scoped lang="scss">
.dialog-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 16px;
	font-weight: 600;
}

.dialog-title-icon {
	color: #303133;
	font-size: 16px;
}

.confirm-content {
	min-height: 200px;
}

.confirm-table {
	width: 100%;
}

.title-cell {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 0;
}

.row-icon {
	width: 24px;
	height: 24px;
	object-fit: contain;
	flex: 0 0 auto;
}

.empty-confirm-text {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	min-height: 200px;
	padding: 32px 20px 24px;
	color: #303133;
	font-size: 14px;
}

.empty-confirm-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	padding: 24px 20px;
	border: 1px solid #e1f3d8;
	border-radius: 8px;
	background: linear-gradient(180deg, #f7fff3 0%, #ffffff 100%);
	box-sizing: border-box;
}

.empty-confirm-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 42px;
	height: 42px;
	margin-bottom: 14px;
	border-radius: 50%;
	color: #ffffff;
	background-color: #67c23a;
	font-size: 24px;
	font-weight: 600;
}

.empty-confirm-title {
	margin-bottom: 8px;
	color: #303133;
	font-size: 16px;
	font-weight: 600;
}

.empty-confirm-description {
	color: #606266;
	font-size: 14px;
	line-height: 22px;
	text-align: center;
}

.dialog-resize-handle {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 14px;
	height: 14px;
	cursor: nwse-resize;
}

.dialog-resize-handle::after {
	position: absolute;
	right: 3px;
	bottom: 3px;
	width: 8px;
	height: 8px;
	border-right: 2px solid #c0c4cc;
	border-bottom: 2px solid #c0c4cc;
	content: '';
}
</style>
