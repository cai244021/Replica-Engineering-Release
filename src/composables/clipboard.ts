import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';

export const useClipboard = (selectedChildrenRows: Ref<any[]>, copiedProductRows: Ref<any[]>, copiedProductMode: Ref<'copy' | 'cut'>) => {
	const cacheSelectedProducts = (mode: 'copy' | 'cut') => {
		const rows = [...selectedChildrenRows.value];
		if (!rows.length) {
			ElMessage.warning(mode === 'cut' ? '请先选择要剪切的数据' : '请先选择要复制的数据');
			return;
		}
		copiedProductRows.value = rows;
		copiedProductMode.value = mode;
		const names = rows.map(row => row.label || row.instanceLabel || row.identifier || row.resourceid).join('、');
		ElMessage.success(`已${mode === 'cut' ? '剪切' : '复制'} ${rows.length} 个对象：${names}`);
	};

	const handleCopyProducts = () => cacheSelectedProducts('copy');

	const handleCutProducts = () => cacheSelectedProducts('cut');

	return {
		cacheSelectedProducts,
		handleCopyProducts,
		handleCutProducts
	};
};
