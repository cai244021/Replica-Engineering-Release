<template>
	<el-dialog
		v-model="visible"
		title="从电子表格创建"
		width="654px"
		draggable
		class="import-spreadsheet-dialog"
		:close-on-click-modal="false"
		@closed="resetDialog">
		<div class="import-spreadsheet-body">
			<button
				class="template-link"
				type="button"
				@click="downloadTemplate">
				<span class="download-icon">⇩</span>
				<span>下载模板</span>
			</button>

			<div class="upload-label">上传您的填充文件：（.csv、.xls、.xlsx）</div>
			<div class="file-picker-row">
				<el-input
					:model-value="selectedFileName"
					readonly
					class="file-name-input" />
				<el-button
					class="browse-button"
					@click="triggerFileSelect">
					浏览...
				</el-button>
				<input
					ref="fileInputRef"
					type="file"
					accept=".csv,.xls,.xlsx"
					class="hidden-file-input"
					@change="handleFileChange" />
			</div>

			<div
				v-if="validating"
				class="validation-status neutral-status">
				<span>正在验证...</span>
			</div>
			<div
				v-else-if="hasErrors"
				class="validation-status error-status">
				<span class="status-icon">✖</span>
				<button
					class="error-link"
					type="button"
					@click="errorDialogVisible = true">
					{{ errorCount }} 内容错误
				</button>
			</div>
			<div
				v-else-if="validateSuccess"
				class="validation-status success-status">
				<span class="status-icon">✔</span>
				<span>将创建 {{ rootItemCount }} 个根项目</span>
			</div>
		</div>

		<template #footer>
			<el-button
				type="primary"
				class="import-button"
				:disabled="!canImport"
				:loading="importing"
				@click="handleImport">
				导入
			</el-button>
			<el-button @click="visible = false">取消</el-button>
		</template>
	</el-dialog>

	<SpreadsheetImportErrorDialog
		v-model="errorDialogVisible"
		:errors="reportedErrors" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import spreadsheetImportApi, { type SpreadsheetImportErrorItem, type SpreadsheetImportResponse } from '@/api/spreadsheetImportApi';
import SpreadsheetImportErrorDialog from './SpreadsheetImportErrorDialog.vue';

const props = defineProps<{
	modelValue: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'import-success', rootPhysicalId: string): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

const fileInputRef = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const selectedFileName = computed(() => selectedFile.value?.name || '');
const validating = ref(false);
const importing = ref(false);
const validateResponse = ref<SpreadsheetImportResponse | null>(null);
const errorDialogVisible = ref(false);

const reportedErrors = computed<SpreadsheetImportErrorItem[]>(() => validateResponse.value?.ReportedErrors || []);
const errorCount = computed(() => validateResponse.value?.ErrorCount || String(reportedErrors.value.length));
const hasErrors = computed(() => validateResponse.value?.Action === 'Error' || reportedErrors.value.length > 0);
const validateSuccess = computed(() => !!selectedFile.value && validateResponse.value?.Action === 'Success' && !hasErrors.value);
const rootItemCount = computed(() => Number(validateResponse.value?.COUNT_ROOTITEM || 0));
const canImport = computed(() => !!selectedFile.value && validateSuccess.value && !validating.value && !importing.value);
const templateCsvContent = 'Level,Title,Type,Name,Revision,Description,Enterprise Item Number,Title (Instance)\n';

const downloadTemplate = () => {
	try {
		const blob = new Blob([templateCsvContent], { type: 'text/csv;charset=utf-8' });
		const objectUrl = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = objectUrl;
		link.download = 'Create from Spreadsheet Template.csv';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(objectUrl);
	} catch (error) {
		console.error('[ImportFromSpreadsheetDialog] 下载模板失败:', error);
		ElMessage.error('下载模板失败');
	}
};

const triggerFileSelect = () => {
	fileInputRef.value?.click();
};

const isAllowedFile = (file: File) => {
	const extension = file.name.split('.').pop()?.toLowerCase();
	return !!extension && ['csv', 'xls', 'xlsx'].includes(extension);
};

const resetValidation = () => {
	validateResponse.value = null;
	errorDialogVisible.value = false;
};

const validateFile = async (file: File) => {
	validating.value = true;
	resetValidation();
	try {
		validateResponse.value = await spreadsheetImportApi.validate(file);
	} catch (error) {
		console.error('[ImportFromSpreadsheetDialog] 验证失败:', error);
		ElMessage.error('验证失败');
	} finally {
		validating.value = false;
	}
};

const handleFileChange = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;
	if (!isAllowedFile(file)) {
		ElMessage.warning('请选择 .csv、.xls、.xlsx 文件');
		target.value = '';
		return;
	}
	selectedFile.value = file;
	await validateFile(file);
};

const handleImport = async () => {
	if (!selectedFile.value || !canImport.value) return;
	importing.value = true;
	try {
		const response = await spreadsheetImportApi.author(selectedFile.value);
		if (response.Action !== 'Success') {
			validateResponse.value = response;
			ElMessage.error('导入失败');
			return;
		}
		const rootPhysicalId = response.ROOT_PHYSICALID;
		if (!rootPhysicalId) {
			ElMessage.warning('导入成功，但未返回根对象 ID');
			visible.value = false;
			return;
		}
		ElMessage.success('导入成功');
		visible.value = false;
		emit('import-success', rootPhysicalId);
	} catch (error) {
		console.error('[ImportFromSpreadsheetDialog] 导入失败:', error);
		ElMessage.error('导入失败');
	} finally {
		importing.value = false;
	}
};

const resetDialog = () => {
	selectedFile.value = null;
	validating.value = false;
	importing.value = false;
	resetValidation();
	if (fileInputRef.value) fileInputRef.value.value = '';
};
</script>

<style scoped lang="scss">
.import-spreadsheet-body {
	min-height: 210px;
	padding: 4px 40px 12px;
}

.template-link,
.error-link {
	border: none;
	background: transparent;
	color: #0b84bd;
	cursor: pointer;
	font-size: 16px;
	padding: 0;
}

.template-link {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 26px;
}

.download-icon {
	font-size: 16px;
	font-weight: bold;
}

.upload-label {
	margin-bottom: 4px;
	color: #777;
	font-size: 13px;
}

.file-picker-row {
	display: flex;
	align-items: center;
	width: 506px;
}

.file-name-input {
	flex: 1;
}

.browse-button {
	width: 96px;
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}

.hidden-file-input {
	display: none;
}

.validation-status {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-top: 18px;
	font-size: 16px;
}

.status-icon {
	font-size: 24px;
	font-weight: bold;
}

.error-status .status-icon {
	color: #d40000;
}

.success-status {
	color: #108000;
}

.success-status .status-icon {
	color: #23a023;
}

.neutral-status {
	color: #777;
}

.import-button {
	min-width: 84px;
}

:deep(.import-spreadsheet-dialog .el-dialog__body) {
	padding-top: 12px;
}
</style>
