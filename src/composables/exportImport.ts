import { ref } from 'vue';
import { ElMessage } from 'element-plus';

export const useExportImport = (partInfo: any, childrenData: any, partDetailApi: any) => {
	const exportDialogVisible = ref(false);
	const exportPercentage = ref(0);
	const exportStatusText = ref('准备导出...');

	const handleExportCSV = async () => {
		if (!partInfo.value) {
			ElMessage.warning('没有可导出的数据');
			return;
		}

		exportDialogVisible.value = true;
		exportPercentage.value = 0;
		exportStatusText.value = '准备导出...';

		try {
			const rootPhysicalId = partInfo.value.resourceid || partInfo.value.physicalid || partInfo.value.id;
			if (!rootPhysicalId) {
				ElMessage.error('无法获取零件 ID');
				exportDialogVisible.value = false;
				return;
			}

			exportStatusText.value = '正在导出...';
			exportPercentage.value = 20;

			const response = await partDetailApi.exportStructure(rootPhysicalId);

			exportPercentage.value = 80;
			exportStatusText.value = '导出完成';

			if (response && response.url) {
				const link = document.createElement('a');
				link.href = response.url;
				link.download = `structure_${rootPhysicalId}.csv`;
				link.click();
				ElMessage.success('导出成功');
			} else {
				ElMessage.error('导出失败：未获取到下载链接');
			}
		} catch (error) {
			console.error('[PartDetailView] 导出 CSV 失败:', error);
			ElMessage.error('导出失败');
		} finally {
			exportPercentage.value = 100;
			setTimeout(() => {
				exportDialogVisible.value = false;
			}, 1000);
		}
	};

	return {
		exportDialogVisible,
		exportPercentage,
		exportStatusText,
		handleExportCSV
	};
};
