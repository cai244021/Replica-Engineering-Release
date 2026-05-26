import { ref, computed } from 'vue';

export const useDialogs = () => {
	const enterpriseDialogVisible = ref(false);
	const exportDialogVisible = ref(false);
	const exportPercentage = ref(0);
	const exportStatusText = ref('准备导出...');
	const instanceQuantityDialogVisible = ref(false);
	const instanceQuantitySubmitting = ref(false);
	const unparentDialogVisible = ref(false);
	const unparentSubmitting = ref(false);
	const unparentReportVisible = ref(false);
	const unparentSuccessMessages = ref<string[]>([]);
	const unparentFailureMessages = ref<string[]>([]);
	const replaceLatestReportVisible = ref(false);
	const replaceLatestReportMessages = ref<string[]>([]);
	const replaceReportTitle = ref('替换为最新修订版报告');
	const updateEntireStructureRevisionDialogVisible = ref(false);
	const updateEntireStructureRevisionLoading = ref(false);
	const replaceRevisionDialogVisible = ref(false);
	const updateRevisionDialogVisible = ref(false);
	const updateRevisionSubmitting = ref(false);
	const reservationDialogVisible = ref(false);
	const reservationSubmitting = ref(false);
	const treeReorderDialogVisible = ref(false);
	const treeReorderLoading = ref(false);
	const treeReorderSubmitting = ref(false);
	const expandNDialogVisible = ref(false);
	const maturityDialogVisible = ref(false);
	const maturityLoading = ref(false);
	const duplicateDialogVisible = ref(false);
	const duplicateSubmitting = ref(false);
	const deformDialogVisible = ref(false);
	const deformSubmitting = ref(false);
	const uploadDocumentDialogVisible = ref(false);
	const uploadProgressVisible = ref(false);
	const materialQuantityDialogVisible = ref(false);
	const existingMaterialDialogVisible = ref(false);

	return {
		enterpriseDialogVisible,
		exportDialogVisible,
		exportPercentage,
		exportStatusText,
		instanceQuantityDialogVisible,
		instanceQuantitySubmitting,
		unparentDialogVisible,
		unparentSubmitting,
		unparentReportVisible,
		unparentSuccessMessages,
		unparentFailureMessages,
		replaceLatestReportVisible,
		replaceLatestReportMessages,
		replaceReportTitle,
		updateEntireStructureRevisionDialogVisible,
		updateEntireStructureRevisionLoading,
		replaceRevisionDialogVisible,
		updateRevisionDialogVisible,
		updateRevisionSubmitting,
		reservationDialogVisible,
		reservationSubmitting,
		treeReorderDialogVisible,
		treeReorderLoading,
		treeReorderSubmitting,
		expandNDialogVisible,
		maturityDialogVisible,
		maturityLoading,
		duplicateDialogVisible,
		duplicateSubmitting,
		deformDialogVisible,
		deformSubmitting,
		uploadDocumentDialogVisible,
		uploadProgressVisible,
		materialQuantityDialogVisible,
		existingMaterialDialogVisible
	};
};
