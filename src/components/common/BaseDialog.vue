<template>
	<el-dialog
		v-model="visible"
		:destroy-on-close="destroyOnClose"
		:close-on-click-modal="false"
		width="500px"
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
	</el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
</script>

<style scoped>
.base-dialog :deep(.el-dialog__header) {
	padding: 16px 20px;
	border-bottom: 1px solid #e4e7ed;
	margin-right: 0;
}

.base-dialog :deep(.el-dialog__body) {
	padding: 16px 20px;
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
</style>
