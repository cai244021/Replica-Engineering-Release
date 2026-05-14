<template>
	<BaseDialog
		v-model="dialogVisible"
		:title="dialogTitle"
		confirm-text="确定"
		:destroy-on-close="true"
		@confirm="handleConfirm"
		@cancel="handleCancel">
		<div class="material-quantity-form">
			<el-form
				ref="formRef"
				:model="formData"
				:rules="formRules"
				label-width="0"
				@submit.prevent>
				<el-form-item prop="quantityType">
					<el-select
						v-model="formData.quantityType"
						placeholder="选择类型"
						style="width: 120px"
						@change="handleTypeChange">
						<el-option
							label="体积"
							value="DSDim_VOLUME" />
						<el-option
							label="质量"
							value="DSDim_MASS" />
					</el-select>
				</el-form-item>
				<el-form-item prop="value">
					<el-input
						v-model="formData.value"
						placeholder="输入值..."
						style="width: 160px"
						type="number"
						:min="0"
						:step="0.01" />
				</el-form-item>
				<el-form-item prop="unit">
					<el-select
						v-model="formData.unit"
						placeholder="选择单位"
						style="width: 140px">
						<el-option
							v-for="item in currentUnits"
							:key="item.value"
							:label="item.label"
							:value="item.value" />
					</el-select>
				</el-form-item>
			</el-form>
		</div>
	</BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { type FormInstance, type FormRules } from 'element-plus';
import { BaseDialog } from '@/components/common';

const props = defineProps<{
	modelValue: boolean;
	materialName?: string;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'confirm', data: { quantityType: string; value: string; unit: string; unitLabel: string }): void;
	(e: 'cancel'): void;
}>();

const dialogVisible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val)
});

const dialogTitle = computed(() => {
	return props.materialName ? `选择${props.materialName}的数量` : '选择材料数量';
});

const formRef = ref<FormInstance>();

interface FormData {
	quantityType: string;
	value: string;
	unit: string;
}

const formData = ref<FormData>({
	quantityType: 'DSDim_VOLUME',
	value: '',
	unit: ''
});

const volumeUnits = [
	{ value: 'CM3', label: 'cm³' },
	{ value: 'FOOT3', label: 'ft³' },
	{ value: 'NANOLITER', label: 'nL' },
	{ value: 'STERE', label: 'st' },
	{ value: 'UK_BUSHEL', label: 'BU_UK' },
	{ value: 'US_BUSHEL', label: 'BU_US' },
	{ value: 'US_CUP', label: 'cup' },
	{ value: 'US_PECK', label: 'pk' },
	{ value: 'US_TABLESPOON', label: 'tbsp' },
	{ value: 'US_TEASPOON', label: 'tsp' },
	{ value: 'US_WET_PINT', label: 'pt' },
	{ value: 'US_WET_QUART', label: 'qt' },
	{ value: 'INCH3', label: 'in³' },
	{ value: 'LITER', label: 'L' },
	{ value: 'METER3', label: 'm³' },
	{ value: 'MM3', label: 'mm³' },
	{ value: 'YARD_CUBE', label: 'yard³' },
	{ value: 'brl', label: 'brl' },
	{ value: 'gal', label: 'gal' },
	{ value: 'CUBIC_DECIMETER', label: 'dm³' },
	{ value: 'US_Fluid_Ounce', label: 'FO' },
	{ value: 'CENTILITER', label: 'cL' },
	{ value: 'DECILITER', label: 'dL' },
	{ value: 'MICROLITER', label: 'micL' },
	{ value: 'MILE3', label: 'mi³' },
	{ value: 'MILLILITER', label: 'mL' }
];

const massUnits = [
	{ value: 'HECTOGRAM', label: 'hg' },
	{ value: 'GRAM', label: 'g' },
	{ value: 'GRAVITY_TON', label: 'gravT' },
	{ value: 'KGFxS2_CM', label: 'kg·s²/cm' },
	{ value: 'KGFxS2_M', label: 'kg·s²/m' },
	{ value: 'KGFxS2_MM', label: 'kg·s²/mm' },
	{ value: 'KILOGRAM', label: 'kg' },
	{ value: 'LBFxS2_FT', label: 'lb·s²/ft' },
	{ value: 'LBFxS2_IN', label: 'lb·s²/in' },
	{ value: 'MG', label: 'mg' },
	{ value: 'OUNCE', label: 'oz' },
	{ value: 'POUND', label: 'lb' },
	{ value: 'SLUG', label: 'slug' },
	{ value: 'SLUG12', label: 'slinch' },
	{ value: 'TONNE', label: 'T' },
	{ value: 'DALTON', label: 'Da' },
	{ value: 'KILODALTON', label: 'kDa' },
	{ value: 'MICROGRAM', label: 'micg' },
	{ value: 'NANOGRAM', label: 'ng' },
	{ value: 'PICOGRAM', label: 'pg' },
	{ value: 'CARAT', label: 'ct' },
	{ value: 'LONGTON', label: 'lgt' },
	{ value: 'SHORTTON', label: 'sht' },
	{ value: 'TROYOUNCE', label: 'ozt' }
];

const currentUnits = computed(() => {
	return formData.value.quantityType === 'DSDim_MASS' ? massUnits : volumeUnits;
});

const handleTypeChange = () => {
	formData.value.unit = currentUnits.value[0]?.value || '';
};

watch(
	() => props.modelValue,
	val => {
		if (val) {
			formData.value = {
				quantityType: 'DSDim_VOLUME',
				value: '',
				unit: volumeUnits[0]?.value || ''
			};
		}
	}
);

const formRules: FormRules = {
	quantityType: [{ required: true, message: '请选择类型', trigger: 'change' }],
	value: [
		{ required: true, message: '请输入数值', trigger: 'blur' },
		{
			validator: (_rule, value, callback) => {
				const num = parseFloat(value);
				if (isNaN(num) || num <= 0) {
					callback(new Error('请输入大于0的实数'));
				} else {
					callback();
				}
			},
			trigger: 'blur'
		}
	],
	unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
};

const handleConfirm = async () => {
	if (!formRef.value) return;
	await formRef.value.validate(valid => {
		if (!valid) return;
		const unitItem = currentUnits.value.find(u => u.value === formData.value.unit);
		emit('confirm', {
			quantityType: formData.value.quantityType,
			value: formData.value.value,
			unit: formData.value.unit,
			unitLabel: unitItem?.label || formData.value.unit
		});
		dialogVisible.value = false;
	});
};

const handleCancel = () => {
	dialogVisible.value = false;
	emit('cancel');
};
</script>

<style scoped>
.material-quantity-form {
	padding: 8px 0;
}

.material-quantity-form :deep(.el-form) {
	display: flex;
	align-items: center;
	gap: 12px;
}

.material-quantity-form :deep(.el-form-item) {
	margin-bottom: 0;
}
</style>
