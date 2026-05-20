<template>
	<el-dialog
		v-model="visible"
		width="680px"
		:show-close="true"
		:close-on-click-modal="false"
		draggable
		class="replace-latest-report-dialog">
		<template #header>
			<span>{{ title }}</span>
		</template>
		<div class="replace-latest-report-content">
			<div class="replace-latest-report-tabs">
				<span class="replace-latest-report-tab is-active">成功 ({{ messages.length }})</span>
			</div>
			<div class="replace-latest-report-messages">
				<div
					v-for="message in messages"
					:key="message"
					class="replace-latest-report-line">
					{{ message }}
				</div>
			</div>
		</div>
		<template #footer>
			<el-button
				type="primary"
				@click="visible = false">
				关闭
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	modelValue: boolean;
	messages: string[];
	title?: string;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});
</script>

<style scoped lang="scss">
.replace-latest-report-content {
	min-height: 120px;
}

.replace-latest-report-tabs {
	display: flex;
	justify-content: center;
	border-bottom: 1px solid #dcdfe6;
}

.replace-latest-report-tab {
	padding: 10px 24px;
	color: #303133;
	border-bottom: 2px solid transparent;
}

.replace-latest-report-tab.is-active {
	border-bottom-color: #409eff;
}

.replace-latest-report-messages {
	padding: 10px 28px;
	line-height: 22px;
}
</style>
