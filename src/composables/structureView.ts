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
		if (structureViewMode.value === 'leaf') {
			await handleLeafStructureView();
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
			let treeData = [] as any[];
			if (structureUsageView.value === 'reference') {
				// 参考视图：基于全展开递归聚合，并全局汇总相同零件（跨父节点）
				const aggregatedTree = expandApi.parseReferenceExpandDataRecursive(response, rootPhysicalId, [rootPhysicalId]);
				const flattened = flattenAggregatedTree(aggregatedTree);
				treeData = groupByResourceAndSumQuantity(flattened);
			} else {
				// 用法视图：按关系 occurrence 多行展示
				treeData = buildFlatUsageRowsFromResponse(response, rootPhysicalId);
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

	// 叶子视图：仅显示叶子零件
	const handleLeafStructureView = async () => {
		const rootPhysicalId = currentPhysicalId.value;
		if (!rootPhysicalId) {
			ElMessage.warning('当前没有加载零件');
			return;
		}
		childrenLoading.value = true;
		try {
			structureViewMode.value = 'leaf';
			selectedChildrenRows.value = [];
			expandingRowIds.value = new Set();
			const response = await expandApi.getFlatExpandData(rootPhysicalId);
			const leafIds = computeLeafObjectIds(response, rootPhysicalId);
			let rows = [] as any[];
			if (structureUsageView.value === 'reference') {
				const aggregatedTree = expandApi.parseReferenceExpandDataRecursive(response, rootPhysicalId, [rootPhysicalId]);
				const flattened = flattenAggregatedTree(aggregatedTree).filter((r: any) => leafIds.has(r.resourceid));
				rows = groupByResourceAndSumQuantity(flattened);
			} else {
				rows = buildFlatUsageRowsFromResponse(response, rootPhysicalId).filter((r: any) => leafIds.has(r.resourceid));
			}
			childrenData.value = filterManufacturableRows(rows);
			ElMessage.success('已切换到产品叶视图');
		} catch (error) {
			console.error('[PartDetailView] 切换产品叶视图失败:', error);
			ElMessage.error('切换产品叶视图失败');
		} finally {
			childrenLoading.value = false;
		}
	};

	// 根据 progressiveexpand 的结果，构造用法视图（occurrence多行）
	const buildFlatUsageRowsFromResponse = (response: any, rootPhysicalId: string) => {
		const results: any[] = Array.isArray(response?.results) ? response.results : [];
		const nodes = results.filter(r => r && r.resourceid && !r.from && !r.to && !('Path' in r));
		const nodeMap = new Map<string, any>();
		nodes.forEach(n => nodeMap.set(n.resourceid, n));
		const relations = results.filter(r => r && r.resourceid && r.from && r.to);
		const rows: any[] = [];
		for (const rel of relations) {
			const target = nodeMap.get(rel.to);
			if (!target || target.resourceid === rootPhysicalId) continue;
			const statusRaw = target['ds6w:status'] || '';
			let statusText = '工作中';
			if (statusRaw.includes('IN_WORK')) statusText = '工作中';
			else if (statusRaw.includes('RELEASED')) statusText = '已发布';
			else if (statusRaw.includes('FROZEN')) statusText = '已冻结';
			else if (statusRaw.includes('OBSOLETE')) statusText = '废弃';
			else if (statusRaw.includes('PRIVATE')) statusText = '私有';
			let modifiedText = '-';
			if (target['ds6w:modified']) {
				try {
					const date = new Date(target['ds6w:modified']);
					modifiedText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
				} catch {
					modifiedText = target['ds6w:modified'];
				}
			}
			rows.push({
				id: `flat-occ-${rel.resourceid}`,
				resourceid: target.resourceid,
				relationId: rel.resourceid,
				label: target['ds6w:label'] || '-',
				partNumber: target['ds6wg:EnterpriseExtension.V_PartNumber'] || '无',
				revision: target['ds6wg:revision'] || '-',
				instanceLabel: rel['ds6w:label'] || '-',
				isLastRevision: String(target['ds6w:isLastRevision'] || target.islastrevision || '').toLowerCase() === 'true',
				status: statusText,
				statusRaw,
				owner: target['ds6w:responsible'] || '-',
				reserved: target['ds6w:reserved'] === 'TRUE' || target['ds6w:reserved'] === 'true',
				reservedBy: target['ds6w:reservedBy'] || '',
				modified: modifiedText,
				globalType: target['ds6w:globalType'] || target['ds6w:type'] || '-',
				identifier: target['ds6w:identifier'] || '-',
				icon: target.icon || '',
				type_icon_url: target.type_icon_url || target.thumbnail_2d || '',
				policy: target['ds6w:policy'] || target.policy || '',
				cadMaster: target['ds6w:cadMaster'] || '',
				typeDisplayName: target['ds6w:globalType'] || target['ds6w:type'] || '',
				level: 0,
				children: [],
				isExpanded: false,
				hasChildren: false,
				path: [target.resourceid],
				isDocument: target['ds6w:type'] === 'Document' || target.type === 'Document'
			});
		}
		return rows;
	};

	// 将递归聚合后的树扁平化为列表（去重已由聚合完成，这里仅展开 children）
	const flattenAggregatedTree = (nodes: any[]): any[] => {
		const result: any[] = [];
		const stack = Array.isArray(nodes) ? [...nodes] : [];
		while (stack.length) {
			const node = stack.shift();
			if (!node) continue;
			result.push({ ...node, children: [] });
			if (Array.isArray(node.children) && node.children.length) {
				for (const child of node.children) stack.push(child);
			}
		}
		return result;
	};

	// 全局按 resourceid 聚合并累加数量
	const groupByResourceAndSumQuantity = (rows: any[]): any[] => {
		const map = new Map<string, any>();
		for (const row of rows) {
			const key = row.resourceid;
			const qty = Number(row.quantity || 0);
			if (!map.has(key)) {
				map.set(key, { ...row, quantity: String(Number.isFinite(qty) && qty > 0 ? qty : 1) });
				continue;
			}
			const existing = map.get(key);
			const current = Number(existing.quantity || 0);
			existing.quantity = String((Number.isFinite(current) ? current : 0) + (Number.isFinite(qty) && qty > 0 ? qty : 1));
		}
		return Array.from(map.values());
	};

	// 计算叶子对象：未作为任何关系的 from（且不为根）
	const computeLeafObjectIds = (response: any, rootPhysicalId: string) => {
		const results: any[] = Array.isArray(response?.results) ? response.results : [];
		const fromIds = new Set<string>();
		for (const item of results) {
			if (item && item.from && item.to) fromIds.add(String(item.from));
		}
		const leafIds = new Set<string>();
		for (const item of results) {
			if (item && item.resourceid && !item.from && !item.to && !('Path' in item)) {
				const id = String(item.resourceid);
				if (id !== rootPhysicalId && !fromIds.has(id)) leafIds.add(id);
			}
		}
		return leafIds as Set<string>;
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
		handleLeafStructureView,
		refreshCurrentStructureView
	};
};
