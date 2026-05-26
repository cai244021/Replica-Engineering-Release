import { ref } from 'vue';
import { ElMessage } from 'element-plus';

interface TreeNode {
	id: string;
	resourceid?: string;
	physicalid?: string;
	children?: TreeNode[];
	expanded?: boolean;
}

export const useTreeOperations = (
	currentPhysicalId: any,
	selectedChildrenRows: any,
	childrenData: any,
	expandNDialogVisible: any,
	expandNLevel: any,
	expandMenuActive: any,
	partDetailApi: any,
	isFlatStructureView: any
) => {
	const handleExpandMenuCommand = async (command: string) => {
		if (isFlatStructureView.value) return;
		console.log('[PartDetailView] 展开菜单命令:', command);
		expandMenuActive.value = true;

		try {
			switch (command) {
				case 'expand':
					await handleExpandSelected();
					break;
				case 'expandAll':
					await handleExpandAll();
					break;
				case 'expandN':
					expandNDialogVisible.value = true;
					break;
				case 'collapseAll':
					await handleCollapseAll();
					break;
			}
		} catch (error) {
			console.error('[PartDetailView] 展开菜单命令失败:', error);
			ElMessage.error('操作失败');
		} finally {
			expandMenuActive.value = false;
		}
	};

	const handleExpandSelected = async () => {
		const rootPhysicalId = currentPhysicalId.value;
		if (!rootPhysicalId) {
			ElMessage.warning('当前没有加载零件');
			return;
		}

		const selectedRows = [...selectedChildrenRows.value];
		if (selectedRows.length === 0) {
			ElMessage.warning('请先选择要展开的行');
			return;
		}

		console.log('[PartDetailView] 展开选中行, 选中行数:', selectedRows.length);

		try {
			const expandPromises = selectedRows.map(row => {
				const physicalId = row.resourceid || row.physicalid || row.id;
				console.log('[PartDetailView] 展开行:', physicalId);
				return partDetailApi.expandStructure(physicalId);
			});

			await Promise.all(expandPromises);
			ElMessage.success('展开成功');
		} catch (error) {
			console.error('[PartDetailView] 展开选中行失败:', error);
			ElMessage.error('展开失败');
		}
	};

	const handleExpandAll = async () => {
		const rootPhysicalId = currentPhysicalId.value;
		if (!rootPhysicalId) {
			ElMessage.warning('当前没有加载零件');
			return;
		}

		const selectedRows = [...selectedChildrenRows.value];
		console.log('[PartDetailView] 全部展开, 选中行数:', selectedRows.length);

		try {
			const rowsToExpand = selectedRows.length > 0 ? selectedRows : [{ resourceid: rootPhysicalId, physicalid: rootPhysicalId, id: rootPhysicalId }];

			const expandPromises = rowsToExpand.map(row => {
				const physicalId = row.resourceid || row.physicalid || row.id;
				console.log('[PartDetailView] 展开行:', physicalId);
				return partDetailApi.expandStructure(physicalId);
			});

			await Promise.all(expandPromises);
			ElMessage.success('全部展开成功');
		} catch (error) {
			console.error('[PartDetailView] 全部展开失败:', error);
			ElMessage.error('全部展开失败');
		}
	};

	const handleCollapseAll = async () => {
		const selectedRows = [...selectedChildrenRows.value];
		console.log('[PartDetailView] 全部折叠, 选中行数:', selectedRows.length);

		try {
			const collapsePromises = selectedRows.map(row => {
				const physicalId = row.resourceid || row.physicalid || row.id;
				console.log('[PartDetailView] 折叠行:', physicalId);
				return partDetailApi.collapseStructure(physicalId);
			});

			await Promise.all(collapsePromises);
			ElMessage.success('全部折叠成功');
		} catch (error) {
			console.error('[PartDetailView] 全部折叠失败:', error);
			ElMessage.error('全部折叠失败');
		}
	};

	return {
		handleExpandMenuCommand,
		handleExpandSelected,
		handleExpandAll,
		handleCollapseAll
	};
};
