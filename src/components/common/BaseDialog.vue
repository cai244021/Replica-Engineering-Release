<template>
	<el-dialog
		v-model="visible"
		:destroy-on-close="destroyOnClose"
		:close-on-click-modal="false"
		draggable
		:style="dialogStyle"
		class="base-dialog"
		@close="handleClose">
		<template #header>
			<div class="dialog-header">
				<span class="dialog-title">{{ title }}</span>
			</div>
		</template>

		<div class="dialog-body">
			<slot />
		</div>

		<template #footer>
			<div class="dialog-footer">
				<div class="footer-left">
					<slot name="footer-left" />
				</div>
				<div class="footer-actions">
					<slot name="footer-actions">
						<el-button
							class="dialog-btn"
							size="default"
							type="primary"
							:loading="confirmLoading"
							@click="handleConfirm">
							{{ confirmText }}
						</el-button>
						<el-button
							class="dialog-btn"
							size="default"
							@click="handleCancel">
							取消
						</el-button>
					</slot>
				</div>
			</div>
		</template>
		<div
			class="base-dialog-resize-handle"
			@mousedown="handleResizeStart"></div>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';

const props = defineProps<{
	modelValue: boolean;
	title: string;
	confirmText?: string;
	confirmLoading?: boolean;
	destroyOnClose?: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'confirm'): void;
	(e: 'cancel'): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val)
});

const dialogSize = ref({
	width: 500,
	height: 520
});
const dialogStyle = computed(() => ({
	width: `${dialogSize.value.width}px`
}));
let resizing = false;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;

const handleConfirm = () => {
	emit('confirm');
};

const handleCancel = () => {
	visible.value = false;
	emit('cancel');
};

const handleClose = () => {
	emit('cancel');
};

const handleResizeMove = (event: MouseEvent) => {
	if (!resizing) return;
	const nextWidth = Math.max(500, resizeStartWidth + event.clientX - resizeStartX);
	const nextHeight = Math.max(360, resizeStartHeight + event.clientY - resizeStartY);
	dialogSize.value = {
		width: nextWidth,
		height: nextHeight
	};
};

const handleResizeEnd = () => {
	if (!resizing) return;
	resizing = false;
	document.body.classList.remove('base-dialog-resizing');
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
	document.body.classList.add('base-dialog-resizing');
	window.addEventListener('mousemove', handleResizeMove);
	window.addEventListener('mouseup', handleResizeEnd);
};

onUnmounted(() => {
	handleResizeEnd();
});
</script>

<style scoped>
.base-dialog {
	position: relative;
	min-width: 500px;
}

.base-dialog::after {
	content: '';
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 12px;
	height: 12px;
	background:
		linear-gradient(135deg, transparent 45%, #909399 45%, #909399 55%, transparent 55%),
		linear-gradient(135deg, transparent 35%, #909399 35%, #909399 45%, transparent 45%),
		linear-gradient(135deg, transparent 25%, #909399 25%, #909399 35%, transparent 35%);
	pointer-events: none;
	z-index: 10;
}

.base-dialog :deep(.el-dialog__header) {
	padding: 16px 20px;
	border-bottom: 1px solid #e4e7ed;
	margin-right: 0;
	cursor: move;
}

.base-dialog :deep(.el-dialog__body) {
	padding: 16px 20px;
	overflow-y: auto;
	max-height: 520px;
}

.base-dialog :deep(.el-dialog__footer) {
	padding: 12px 20px;
	border-top: 1px solid #e4e7ed;
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dialog-title {
	font-size: 16px;
	font-weight: 600;
	color: #303133;
}

.dialog-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.footer-left {
	display: flex;
	align-items: center;
}

.footer-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.base-dialog-resize-handle {
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 16px;
	height: 16px;
	cursor: nwse-resize;
	z-index: 11;
}

:global(.base-dialog-resizing) {
	cursor: nwse-resize;
	user-select: none;
}
</style>
