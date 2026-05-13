<!-- @Author: System -->
<!-- @Date: 2026-05-12 -->
<!-- @Description: 上传文档对话框 -->
<template>
	<BaseDialog
		v-model="dialogVisible"
		title="上传"
		confirm-text="上传"
		:confirm-loading="submitting"
		:destroy-on-close="true"
		@confirm="handleSubmit"
		@cancel="handleCancel">
		<div class="upload-document-form">
			<el-form
				ref="formRef"
				:model="formData"
				:rules="formRules"
				label-width="80px"
				class="document-form"
				size="default"
				label-position="left">
				<!-- 标题 -->
				<el-form-item
					label="标题"
					prop="title"
					required>
					<el-input
						v-model="formData.title"
						placeholder="请输入标题" />
				</el-form-item>

				<!-- 类型 -->
				<el-form-item
					label="类型"
					prop="type"
					required>
					<el-select
						v-model="formData.type"
						placeholder="选择类型"
						style="width: 100%">
						<el-option
							label="文档"
							value="document" />
					</el-select>
				</el-form-item>

				<!-- 合作区 -->
				<el-form-item
					label="合作区"
					prop="collaborativeSpace"
					required>
					<el-select
						v-model="formData.collaborativeSpace"
						placeholder="选择合作区"
						style="width: 100%">
						<el-option
							label="Common Space"
							value="Common Space" />
					</el-select>
				</el-form-item>

				<!-- 文件 -->
				<el-form-item
					label="文件"
					prop="file"
					required>
					<div class="file-input-wrapper">
						<el-input
							v-model="formData.fileName"
							placeholder="请选择文件"
							readonly
							class="file-name-input">
							<template #suffix>
								<el-icon
									class="file-upload-icon"
									@click="triggerFileSelect">
									<Upload />
								</el-icon>
							</template>
						</el-input>
						<input
							ref="fileInputRef"
							type="file"
							style="display: none"
							@change="handleFileChange" />
					</div>
				</el-form-item>

				<!-- 文件备注 -->
				<el-form-item
					label="文件备注"
					prop="remark">
					<el-input
						v-model="formData.remark"
						type="textarea"
						:rows="3"
						placeholder="请输入文件备注" />
				</el-form-item>

				<!-- 显示更多/显示更少 -->
				<div class="expand-section">
					<div
						class="expand-toggle"
						@click="toggleExpand">
						<el-icon class="expand-icon">
							<ArrowRight v-if="!isExpanded" />
							<ArrowDown v-else />
						</el-icon>
						<span class="expand-text">{{ isExpanded ? '显示更少' : '显示更多' }}</span>
					</div>

					<!-- 展开后的额外字段 -->
					<div
						v-show="isExpanded"
						class="expanded-fields">
						<!-- 描述 -->
						<el-form-item
							label="描述"
							prop="description">
							<el-input
								v-model="formData.description"
								type="textarea"
								:rows="3"
								placeholder="请输入描述" />
						</el-form-item>

						<!-- 协作策略 -->
						<el-form-item
							label="协作策略"
							prop="policy">
							<el-input
								v-model="formData.policy"
								placeholder="文档发布"
								disabled />
						</el-form-item>
					</div>
				</div>
			</el-form>
		</div>
	</BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Upload, ArrowRight, ArrowDown } from '@element-plus/icons-vue';
import BaseDialog from '@/components/common/BaseDialog.vue';

const props = defineProps<{
	modelValue: boolean;
	initialFile?: File | null;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'submit', data: UploadDocumentData): void;
}>();

// 对话框可见性
const dialogVisible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val)
});

// 监听对话框打开，自动填充初始文件
watch(() => props.modelValue, (newVal) => {
	if (newVal && props.initialFile) {
		formData.file = props.initialFile;
		formData.fileName = props.initialFile.name;
		// 自动填充标题（不含扩展名）
		const fileNameWithoutExt = props.initialFile.name.replace(/\.[^/.]+$/, '');
		formData.title = fileNameWithoutExt;
	}
});

// 表单引用
const formRef = ref<FormInstance>();
const fileInputRef = ref<HTMLInputElement>();

// 提交状态
const submitting = ref(false);

// 展开状态
const isExpanded = ref(false);

// 表单数据
interface UploadDocumentData {
	title: string;
	type: string;
	collaborativeSpace: string;
	file: File | null;
	fileName: string;
	remark: string;
	description: string;
	policy: string;
}

const formData = reactive<UploadDocumentData>({
	title: '',
	type: 'document',
	collaborativeSpace: 'Common Space',
	file: null,
	fileName: '',
	remark: '',
	description: '',
	policy: '文档发布'
});

// 表单验证规则
const formRules: FormRules = {
	title: [
		{ required: true, message: '请输入标题', trigger: 'blur' }
	],
	type: [
		{ required: true, message: '请选择类型', trigger: 'change' }
	],
	collaborativeSpace: [
		{ required: true, message: '请选择合作区', trigger: 'change' }
	],
	file: [
		{ required: true, message: '请选择文件', trigger: 'change' }
	]
};

// 触发文件选择
const triggerFileSelect = () => {
	fileInputRef.value?.click();
};

// 处理文件选择
const handleFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (file) {
		formData.file = file;
		formData.fileName = file.name;
		// 如果标题为空，自动填充文件名（不含扩展名）
		if (!formData.title) {
			const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
			formData.title = fileNameWithoutExt;
		}
	}
};

// 切换展开/收起
const toggleExpand = () => {
	isExpanded.value = !isExpanded.value;
};

// 重置表单
const resetForm = () => {
	formData.title = '';
	formData.type = 'document';
	formData.collaborativeSpace = 'Common Space';
	formData.file = null;
	formData.fileName = '';
	formData.remark = '';
	formData.description = '';
	formData.policy = '文档发布';
	isExpanded.value = false;
	if (fileInputRef.value) {
		fileInputRef.value.value = '';
	}
};

// 提交表单
const handleSubmit = async () => {
	if (!formRef.value) return;

	await formRef.value.validate((valid) => {
		if (valid) {
			emit('submit', { ...formData });
		}
	});
};

// 取消
const handleCancel = () => {
	dialogVisible.value = false;
	resetForm();
};

// 暴露方法给父组件
defineExpose({
	resetForm
});
</script>

<style scoped lang="scss">
.upload-document-form {
	padding: 0 10px;
}

.document-form {
	:deep(.el-form-item__label) {
		font-weight: 500;
		color: #303133;

		&::before {
			color: #f56c6c;
			margin-right: 4px;
		}
	}
}

.file-input-wrapper {
	width: 100%;
}

.file-name-input {
	:deep(.el-input__wrapper) {
		cursor: pointer;
	}
}

.file-upload-icon {
	cursor: pointer;
	color: #909399;
	font-size: 16px;

	&:hover {
		color: #409eff;
	}
}

.expand-section {
	margin-top: 10px;
}

.expand-toggle {
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 8px 0;
	color: #606266;
	font-size: 14px;

	&:hover {
		color: #409eff;
	}
}

.expand-icon {
	margin-right: 6px;
	font-size: 12px;
}

.expand-text {
	user-select: none;
}

.expanded-fields {
	padding-top: 10px;
	animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
