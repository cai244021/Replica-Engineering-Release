<!-- @Author: System -->
<!-- @Date: 2026-05-13 -->
<!-- @Description: 上传进度面板组件 -->
<template>
	<transition name="slide-up">
		<div
			v-if="visible"
			class="upload-progress-panel">
			<div
				class="upload-progress-header"
				@click="toggleExpand">
				<span class="upload-title">上传</span>
				<div class="upload-actions">
					<el-icon class="expand-icon">
						<ArrowUp v-if="isExpanded" />
						<ArrowDown v-else />
					</el-icon>
				</div>
			</div>
			<div
				v-show="isExpanded"
				class="upload-progress-list">
				<div
					v-for="item in uploadList"
					:key="item.id"
					class="upload-progress-item">
					<span class="file-name">{{ item.fileName }}</span>
					<span
						class="upload-status"
						:class="getStatusClass(item.status)">
						{{ getStatusText(item.status) }}
					</span>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface UploadItem {
	id: string;
	fileName: string;
	status: UploadStatus;
	progress?: number;
}

const props = defineProps<{
	modelValue: boolean;
	uploadList: UploadItem[];
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
}>();

const isExpanded = ref(true);

const visible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val)
});

const toggleExpand = () => {
	isExpanded.value = !isExpanded.value;
};

const getStatusText = (status: UploadStatus): string => {
	const statusMap: Record<UploadStatus, string> = {
		'pending': '未决',
		'uploading': '上传中',
		'completed': '上传完成',
		'error': '上传失败'
	};
	return statusMap[status];
};

const getStatusClass = (status: UploadStatus): string => {
	return `status-${status}`;
};
</script>

<style scoped lang="scss">
.upload-progress-panel {
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 300px;
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	z-index: 2000;
	overflow: hidden;
}

.upload-progress-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	background: #f5f7fa;
	border-bottom: 1px solid #e4e7ed;
	cursor: pointer;
	user-select: none;

	&:hover {
		background: #ebeef5;
	}
}

.upload-title {
	font-size: 14px;
	font-weight: 500;
	color: #303133;
}

.upload-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.expand-icon {
	font-size: 14px;
	color: #909399;
	cursor: pointer;

	&:hover {
		color: #606266;
	}
}

.upload-progress-list {
	max-height: 200px;
	overflow-y: auto;
	padding: 8px 0;
}

.upload-progress-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 16px;
	border-bottom: 1px solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}
}

.file-name {
	font-size: 13px;
	color: #303133;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 12px;
}

.upload-status {
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 4px;
	white-space: nowrap;

	&.status-pending {
		color: #909399;
		background: #f4f4f5;
	}

	&.status-uploading {
		color: #409eff;
		background: #ecf5ff;
	}

	&.status-completed {
		color: #67c23a;
		background: #f0f9eb;
	}

	&.status-error {
		color: #f56c6c;
		background: #fef0f0;
	}
}

// 滑入动画
.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
	transform: translateY(100%);
	opacity: 0;
}
</style>
