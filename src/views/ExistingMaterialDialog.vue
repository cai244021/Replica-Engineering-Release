<template>
	<BaseDialog
		v-model="dialogVisible"
		:title="dialogTitle"
		confirm-text="确定"
		:destroy-on-close="true"
		:confirm-loading="confirmLoading"
		@confirm="handleConfirm"
		@cancel="handleCancel">
		<div class="existing-material-form">
			<el-form
				ref="formRef"
				:model="formData"
				:rules="formRules"
				label-width="0"
				@submit.prevent>
				<el-form-item prop="quantity">
					<el-input
						v-model="formData.quantity"
						:placeholder="asRequired ? '' : '输入数量'"
						style="width: 160px"
						type="number"
						:min="0"
						:step="0.01"
						:disabled="asRequired" />
				</el-form-item>
				<el-form-item prop="unit">
					<el-select
						v-model="formData.unit"
						:placeholder="asRequired ? '' : '选择单位'"
						style="width: 140px"
						:loading="unitsLoading"
						:disabled="asRequired">
						<el-option
							v-for="item in unitOptions"
							:key="item.dbName"
							:label="item.nlsLabel"
							:value="item.dbName" />
					</el-select>
				</el-form-item>
			</el-form>
			<div class="as-required-row">
				<el-checkbox
					v-model="asRequired"
					label="根据需求(As Required)"
					@change="handleAsRequiredChange" />
			</div>
		</div>
	</BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { type FormInstance, type FormRules, ElMessage } from 'element-plus';
import { BaseDialog } from '@/components/common';
import partDetailApi from '@/api/partDetailApi';

const props = defineProps<{
	modelValue: boolean;
	materialName?: string;
	materialPhysicalId?: string;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(
		e: 'confirm',
		data: {
			materialPhysicalId: string;
			quantity?: string;
			unit?: string;
			asRequired: boolean;
		}
	): void;
	(e: 'cancel'): void;
}>();

const dialogVisible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val)
});

const dialogTitle = computed(() => {
	return props.materialName ? `${props.materialName}` : '选择原材料';
});

const formRef = ref<FormInstance>();
const formData = ref({
	quantity: '',
	unit: ''
});
const asRequired = ref(false);
const unitOptions = ref<Array<{ dbName: string; nlsLabel: string }>>([]);
const unitsLoading = ref(false);
const confirmLoading = ref(false);

const formRules: FormRules = {
	quantity: [
		{
			validator: (_rule: unknown, _value: string, callback: (error?: Error) => void) => {
				if (!asRequired.value) {
					const num = parseFloat(formData.value.quantity);
					if (!formData.value.quantity || isNaN(num) || num <= 0) {
						callback(new Error('请输入数量'));
					} else {
						callback();
					}
				} else {
					callback();
				}
			},
			trigger: 'blur'
		}
	],
	unit: [
		{
			validator: (_rule: unknown, _value: string, callback: (error?: Error) => void) => {
				if (!asRequired.value && !formData.value.unit) {
					callback(new Error('请选择单位'));
				} else {
					callback();
				}
			},
			trigger: 'change'
		}
	]
};

const loadUOMs = async () => {
	if (!props.materialPhysicalId) return;

	unitsLoading.value = true;
	try {
		const response = await partDetailApi.getRawMaterialUOMs(props.materialPhysicalId);
		if (response.success && response.result?.applicableUOMTypes?.length) {
			const allUnits: Array<{ dbName: string; nlsLabel: string }> = [];
			response.result.applicableUOMTypes.forEach(uomType => {
				if (uomType.units && Array.isArray(uomType.units)) {
					allUnits.push(...uomType.units);
				}
			});
			unitOptions.value = allUnits;
		} else {
			unitOptions.value = [];
		}
	} catch (error) {
		console.error('[ExistingMaterialDialog] 加载单位列表失败:', error);
		ElMessage.error('加载单位列表失败');
		unitOptions.value = [];
	} finally {
		unitsLoading.value = false;
	}
};

const handleAsRequiredChange = () => {
	if (asRequired.value) {
		formData.value.quantity = '';
		formData.value.unit = '';
	}
};

watch(
	() => props.modelValue,
	async val => {
		if (val) {
			formData.value = {
				quantity: '',
				unit: ''
			};
			asRequired.value = false;
			await loadUOMs();
		}
	}
);

const handleConfirm = async () => {
	if (!formRef.value) return;

	confirmLoading.value = true;
	try {
		await formRef.value.validate();

		if (!asRequired.value) {
			if (!formData.value.quantity || parseFloat(formData.value.quantity) <= 0) {
				ElMessage.warning('请输入有效的数量');
				return;
			}
			if (!formData.value.unit) {
				ElMessage.warning('请选择单位');
				return;
			}
		}

		emit('confirm', {
			materialPhysicalId: props.materialPhysicalId || '',
			quantity: asRequired.value ? undefined : formData.value.quantity,
			unit: asRequired.value ? undefined : formData.value.unit,
			asRequired: asRequired.value
		});
		dialogVisible.value = false;
	} catch (error) {
		console.error('[ExistingMaterialDialog] 表单验证失败:', error);
	} finally {
		confirmLoading.value = false;
	}
};

const handleCancel = () => {
	dialogVisible.value = false;
	emit('cancel');
};
</script>

<style scoped>
.existing-material-form {
	padding: 8px 0;
}

.existing-material-form :deep(.el-form) {
	display: flex;
	align-items: center;
	gap: 12px;
}

.existing-material-form :deep(.el-form-item) {
	margin-bottom: 0;
}

.as-required-row {
	margin-top: 12px;
}
</style>
