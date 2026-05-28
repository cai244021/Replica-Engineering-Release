<template>
	<el-dialog
		v-model="visible"
		title="电子表格内容错误报告"
		width="920px"
		class="spreadsheet-import-error-dialog"
		:close-on-click-modal="false">
		<div class="error-report-tip">注意：-以下报告仅显示上传电子表格的错误行。要解决以下问题，请在电子表格中执行所需更改然后重新导入</div>
		<el-table
			:data="errors"
			border
			height="292"
			class="error-report-table">
			<el-table-column
				type="selection"
				width="36" />
			<el-table-column
				type="index"
				width="36" />
			<el-table-column
				prop="RowNumber"
				label="电子表格行号"
				width="216" />
			<el-table-column
				prop="Error Description"
				label="错误描述"
				min-width="220" />
			<el-table-column
				prop="Column Name"
				label="列名称"
				width="218" />
			<el-table-column
				prop="Column Value"
				label="列值"
				width="218" />
		</el-table>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SpreadsheetImportErrorItem } from '@/api/spreadsheetImportApi';

const props = defineProps<{
	modelValue: boolean;
	errors: SpreadsheetImportErrorItem[];
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
.error-report-tip {
	margin-bottom: 16px;
	color: #777;
	font-size: 13px;
}

.error-report-table {
	width: 100%;
}

:deep(.spreadsheet-import-error-dialog .el-dialog__body) {
	padding-top: 8px;
}
</style>
