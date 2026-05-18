<template>
	<el-dialog
		v-model="visible"
		:width="reportVisible ? 680 : 510"
		:show-close="true"
		:close-on-click-modal="false"
		class="unparent-dialog">
		<template #header>
			<span>{{ reportVisible ? '拆离报告' : `拆离 - ${count} objects` }}</span>
		</template>
		<div
			v-if="!reportVisible"
			class="unparent-confirm-content">
			<el-icon class="unparent-warning-icon"><WarningFilled /></el-icon>
			<div class="unparent-confirm-main">
				<div class="unparent-confirm-text">
					是否要拆离
					<span class="unparent-object-count">{{ count }} objects?</span>
				</div>
				<el-checkbox v-model="dontShowAgain">不再显示此消息.</el-checkbox>
			</div>
		</div>
		<div
			v-else
			class="unparent-report-content">
			<div class="unparent-report-tabs">
				<span
					v-if="successMessages.length"
					class="unparent-report-tab is-active">
					成功 ({{ successMessages.length }})
				</span>
				<span
					v-if="failureMessages.length"
					class="unparent-report-tab"
					:class="{ 'is-active': !successMessages.length }">
					失败 ({{ failureMessages.length }})
				</span>
			</div>
			<div class="unparent-report-messages">
				<div
					v-if="!successMessages.length && !failureMessages.length"
					class="unparent-report-line">
					没有可显示的拆离结果。
				</div>
				<div
					v-for="message in successMessages"
					:key="`success-${message}`"
					class="unparent-report-line">
					{{ message }}
				</div>
				<div
					v-for="message in failureMessages"
					:key="`failure-${message}`"
					class="unparent-report-line is-failure">
					{{ message }}
				</div>
			</div>
		</div>
		<template #footer>
			<template v-if="!reportVisible">
				<el-button
					type="primary"
					:loading="loading"
					@click="emit('confirm')">
					拆离
				</el-button>
				<el-button @click="visible = false">取消</el-button>
			</template>
			<el-button
				v-else
				type="primary"
				@click="visible = false">
				关闭
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';

const props = defineProps<{
	modelValue: boolean;
	count: number;
	loading?: boolean;
	reportVisible?: boolean;
	successMessages: string[];
	failureMessages: string[];
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'confirm'): void;
}>();

const dontShowAgain = ref(false);
const visible = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});
</script>

<style scoped lang="scss">
.unparent-confirm-content {
	display: flex;
	align-items: flex-start;
	gap: 18px;
	min-height: 130px;
	padding: 16px 12px;
}

.unparent-warning-icon {
	font-size: 48px;
	color: #e6a23c;
}

.unparent-confirm-main {
	display: flex;
	flex-direction: column;
	gap: 36px;
	padding-top: 12px;
}

.unparent-confirm-text {
	color: #303133;
	font-size: 14px;
}

.unparent-object-count {
	color: #1684d8;
}

.unparent-report-content {
	min-height: 150px;
}

.unparent-report-tabs {
	display: flex;
	justify-content: center;
	border-bottom: 1px solid #dcdfe6;
}

.unparent-report-tab {
	padding: 10px 24px;
	color: #303133;
	border-bottom: 2px solid transparent;
}

.unparent-report-tab.is-active {
	border-bottom-color: #409eff;
}

.unparent-report-messages {
	padding: 10px 28px;
	line-height: 22px;
}

.unparent-report-line.is-failure {
	color: #f56c6c;
	white-space: pre-line;
}
</style>
