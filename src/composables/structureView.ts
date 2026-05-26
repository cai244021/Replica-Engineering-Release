import type { Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export const useStructureView = (
	currentPhysicalId: Ref<string>,
	structureViewMode: Ref<'indented' | 'flat' | 'leaf' | 'material'>,
	structureUsageView: Ref<'usage' | 'reference'>,
	structureManufacturableOnly: Ref<boolean>,
	childrenLoading: Ref<boolean>,
	childrenData: Ref<any[]>,
	selectedChildrenRows: Ref<any[]>,
	expandingRowIds: Ref<Set<string>>,
	queryModeStore: any,
	expandApi: any,
	loadPartDetail: (physicalId: string) => Promise<void>,
	loadExpandData: (physicalId: string) => Promise<void>,
	filterManufacturableRows: (rows: any[]) => any[],
	filterManufacturableTree: (nodes: any[]) => any[]
) => {
	const refreshCurrentStructureView = async () => {
		if (structureManufacturableOnly.value) {
			await handleManufacturableView();
			return;
		}
		if (structureViewMode.value === 'flat') {
			await handleFlatStructureView();
			return;
		}
		await handleIndentedStructureView();
	};

	const handleManufacturableToggle = async () => {
		const nextValue = !structureManufacturableOnly.value;
		if (nextValue && queryModeStore.isDbMode) {
			try {
				await ElMessageBox.confirm(
					'可制造/可采购视图 仅在索引模式下可用。您的数据可能未反映最新的修改。\n\n是否要切换到索引模式？',
					'可制造/可采购视图',
					{
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}
				);
			} catch {
				return;
			}
			queryModeStore.switchToIndexMode();
		}
		structureManufacturableOnly.value = nextValue;
		if (structureManufacturableOnly.value) {
			await handleManufacturableView();
			return;
		}
		await refreshCurrentStructureView();
	};

	const handleManufacturableView = async () => {
		const rootPhysicalId = currentPhysicalId.value;
		if (!rootPhysicalId) {
			ElMessage.warning('当前没有加载零件');
			return;
		}
		childrenLoading.value = true;
		try {
			selectedChildrenRows.value = [];
			expandingRowIds.value = new Set();
			const params = expandApi.buildExpandRequestParams(rootPhysicalId, null, 10);
			const response = await expandApi.expandWithParams(params);
			let treeData = expandApi.parseExpandDataRecursive(response, rootPhysicalId, [rootPhysicalId]);
			if (structureUsageView.value === 'reference') {
				treeData = expandApi.parseReferenceExpandDataRecursive(response, rootPhysicalId, [rootPhysicalId]);
			}
			childrenData.value = filterManufacturableTree(treeData);
			ElMessage.success('已切换到可制造/可采购视图');
		} catch (error) {
			console.error('[PartDetailView] 切换可制造/可采购视图失败:', error);
			ElMessage.error('切换可制造/可采购视图失败');
		} finally {
			childrenLoading.value = false;
		}
	};

	const handleIndentedStructureView = async () => {
		const rootPhysicalId = currentPhysicalId.value;
		if (!rootPhysicalId) {
			ElMessage.warning('当前没有加载零件');
			return;
		}

		selectedChildrenRows.value = [];
		expandingRowIds.value = new Set();
		if (queryModeStore.isDbMode) {
			await loadPartDetail(rootPhysicalId);
			return;
		}
		await loadExpandData(rootPhysicalId);
		ElMessage.success('已切换到缩进的产品结构视图');
	};

	const handleFlatStructureView = async () => {
		const rootPhysicalId = currentPhysicalId.value;
		if (!rootPhysicalId) {
			ElMessage.warning('当前没有加载零件');
			return;
		}

		childrenLoading.value = true;
		try {
			structureViewMode.value = 'flat';
			selectedChildrenRows.value = [];
			expandingRowIds.value = new Set();
			const response = await expandApi.getFlatExpandData(rootPhysicalId);
			let treeData = expandApi.parseFlatExpandData(response, rootPhysicalId);
			if (structureUsageView.value === 'reference') {
				treeData = expandApi.parseReferenceExpandData(response, rootPhysicalId);
			}
			childrenData.value = filterManufacturableRows(treeData);
			ElMessage.success('已切换到扁平产品结构视图');
		} catch (error) {
			console.error('[PartDetailView] 切换扁平产品结构视图失败:', error);
			ElMessage.error('切换扁平产品结构视图失败');
		} finally {
			childrenLoading.value = false;
		}
	};

	const handleStructureViewCommand = async (command: string) => {
		console.log('[PartDetailView] 结构视图命令:', command);

		switch (command) {
			case 'indented':
				structureViewMode.value = 'indented';
				await refreshCurrentStructureView();
				break;
			case 'flat':
				structureViewMode.value = 'flat';
				await refreshCurrentStructureView();
				break;
			case 'leaf':
				structureViewMode.value = 'leaf';
				await refreshCurrentStructureView();
				break;
			case 'material':
				structureViewMode.value = 'material';
				await refreshCurrentStructureView();
				break;
			case 'usage':
				structureUsageView.value = 'usage';
				await refreshCurrentStructureView();
				break;
			case 'reference':
				structureUsageView.value = 'reference';
				await refreshCurrentStructureView();
				break;
			case 'manufacturableOnly':
				await handleManufacturableToggle();
				break;
		}
	};

	return {
		handleStructureViewCommand,
		handleManufacturableToggle,
		handleManufacturableView,
		handleIndentedStructureView,
		handleFlatStructureView,
		refreshCurrentStructureView
	};
};
