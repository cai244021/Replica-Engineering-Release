import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { nextTick } from 'vue';

export const useFindInStructure = (
	currentPhysicalId: Ref<string>,
	findKeyword: Ref<string>,
	findLoading: Ref<boolean>,
	findActiveKeyword: Ref<string>,
	findMatchedRowIds: Ref<string[]>,
	findCurrentIndex: Ref<number>,
	childrenData: Ref<any[]>,
	flattenChildrenData: Ref<any[]>,
	selectedChildrenRows: Ref<any[]>,
	tableRef: Ref<any>,
	expandApi: any,
	baseInfoStore: any
) => {
	const buildFindUql = (keyword: string) => {
		const escapedKeyword = keyword.replace(/"/g, '\\"');
		return [
			`ds6w_58_label:*${escapedKeyword}*`,
			`ds6wg_58_enterpriseextension_46_v_95_partnumber:*${escapedKeyword}*`,
			`ds6wg_58_revision:*${escapedKeyword}*`,
			`ds6w_58_islastrevision:*${escapedKeyword}*`,
			`ds6w_58_status:*${escapedKeyword}*`,
			`ds6w_58_responsible:*${escapedKeyword}*`,
			`ds6w_58_type:*${escapedKeyword}*`,
			`ds6w_58_identifier:*${escapedKeyword}*`
		].join(' OR ');
	};

	const buildFindInStructureParams = (rootPhysicalId: string, keyword: string) => {
		const uql = buildFindUql(keyword);
		return {
			batch: {
				expands: [
					{
						filter: {
							and: {
								filters: [
									{
										prefix_filter: {
											prefix_path: [{ physical_id_path: [rootPhysicalId] }]
										}
									},
									{
										sequence_filter: {
											sequence: [{ uql }]
										}
									}
								]
							}
						},
						root: { physical_id: rootPhysicalId },
						graph: {
							descending_condition_relation: {
								uql: 'NOT (flattenedtaxonomies:"reltypes/XCADBaseDependency") AND ((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance"))'
							},
							descending_condition_object: {
								uql: 'ds6w_58_globaltype:"ds6w:Document" OR ds6w_58_globaltype:"ds6w:Part"'
							}
						},
						aggregation_processors: [{ truncate: { sequence_filter: { sequence: [{ uql }] } } }],
						label: `FindInCtxFTS-xEngineer-${baseInfoStore.currentUser || 'USER'}-${Date.now()}`,
						parameters: { limit_max_path: 301 }
					}
				]
			},
			outputs: {
				select_object: [
					'ds6w:label',
					'ds6w:modified',
					'ds6w:created',
					'ds6w:description',
					'ds6wg:revision',
					'ds6w:cadMaster',
					'ds6w:responsible',
					'owner',
					'ds6w:status',
					'ds6w:type',
					'ds6wg:EnterpriseExtension.V_PartNumber',
					'type',
					'physicalid',
					'ds6w:policy',
					'ds6w:reservedBy',
					'ds6w:globalType',
					'ds6w:manufacturable',
					'pathsr',
					'ds6w:isLastRevision',
					'ds6w:reserved',
					'ds6w:identifier'
				],
				select_relation: ['ds6w:label', 'ds6w:type', 'physicalid', 'ro.plminstance.V_treeorder', 'ds6w:reservedBy'],
				hits: { predefined_computation: ['icons', 'urlstream|thumbnail_2d|2dthb|allrefs'] },
				format: 'entity_relation_occurrence'
			}
		};
	};

	const getPathTargetPhysicalIds = (response: { results?: Array<unknown> }) =>
		(response.results || [])
			.filter((item): item is { Path: string[] } => !!item && typeof item === 'object' && Array.isArray((item as { Path?: unknown }).Path))
			.map(item => item.Path[item.Path.length - 1])
			.filter((id): id is string => !!id);

	const expandSearchTreeNodes = (nodes: any[]) => {
		nodes.forEach(node => {
			if (node.children?.length) {
				node.isExpanded = true;
				expandSearchTreeNodes(node.children);
			}
		});
	};

	const mergeSearchTreeNodes = (currentNodes: any[], searchNodes: any[]) => {
		searchNodes.forEach(searchNode => {
			const existingNode = currentNodes.find(node => node.id === searchNode.id || node.relationId === searchNode.relationId);
			if (!existingNode) {
				currentNodes.push(searchNode);
				return;
			}
			existingNode.hasChildren = existingNode.hasChildren || searchNode.hasChildren;
			if (searchNode.children?.length) {
				existingNode.isExpanded = true;
				mergeSearchTreeNodes(existingNode.children || (existingNode.children = []), searchNode.children);
			}
		});
	};

	const rowContainsFindKeyword = (row: any, keyword: string) => {
		const normalizedKeyword = keyword.toLowerCase();
		return [row.label, row.instanceLabel].some(value =>
			String(value || '')
				.toLowerCase()
				.includes(normalizedKeyword)
		);
	};

	const scrollToFindResult = async (index: number) => {
		await nextTick();
		const rowId = findMatchedRowIds.value[index];
		const rowIndex = flattenChildrenData.value.findIndex(row => row.id === rowId);
		if (rowIndex < 0) return;
		tableRef.value?.scrollToRow?.(rowIndex, 'center');
	};

	const setFindResults = async (keyword: string, targetPhysicalIds: string[]) => {
		findActiveKeyword.value = keyword;
		await nextTick();
		findMatchedRowIds.value = flattenChildrenData.value
			.filter(row => targetPhysicalIds.includes(row.resourceid) || rowContainsFindKeyword(row, keyword))
			.map(row => row.id);
		findCurrentIndex.value = findMatchedRowIds.value.length ? 0 : -1;
		if (findCurrentIndex.value >= 0) {
			await scrollToFindResult(findCurrentIndex.value);
		}
	};

	const handleFindInStructure = async () => {
		const keyword = findKeyword.value.trim();
		const rootPhysicalId = currentPhysicalId.value;
		if (!keyword) {
			ElMessage.warning('请输入查找内容');
			return;
		}
		if (!rootPhysicalId) {
			ElMessage.error('未获取到根节点物理ID');
			return;
		}

		findLoading.value = true;
		try {
			const response = await expandApi.expandWithParams(buildFindInStructureParams(rootPhysicalId, keyword));
			const targetPhysicalIds = getPathTargetPhysicalIds(response);
			if (!response.results?.length || !targetPhysicalIds.length) {
				findActiveKeyword.value = '';
				findMatchedRowIds.value = [];
				findCurrentIndex.value = -1;
				ElMessage.warning('未找到任何选定对象的匹配项');
				return;
			}
			const searchTreeNodes = expandApi.parseExpandDataRecursive(response, rootPhysicalId, [rootPhysicalId]);
			expandSearchTreeNodes(searchTreeNodes);
			mergeSearchTreeNodes(childrenData.value, searchTreeNodes);
			await setFindResults(keyword, targetPhysicalIds);
		} catch (error) {
			console.error('[PartDetailView] 查找失败:', error);
			ElMessage.error('查找失败');
		} finally {
			findLoading.value = false;
		}
	};

	const goToPreviousFindResult = async () => {
		if (!findMatchedRowIds.value.length) return;
		findCurrentIndex.value = findCurrentIndex.value <= 0 ? findMatchedRowIds.value.length - 1 : findCurrentIndex.value - 1;
		await scrollToFindResult(findCurrentIndex.value);
	};

	const goToNextFindResult = async () => {
		if (!findMatchedRowIds.value.length) return;
		findCurrentIndex.value = findCurrentIndex.value >= findMatchedRowIds.value.length - 1 ? 0 : findCurrentIndex.value + 1;
		await scrollToFindResult(findCurrentIndex.value);
	};

	const selectAllFindResults = () => {
		if (!findMatchedRowIds.value.length) return;
		const matchedIds = new Set(findMatchedRowIds.value);
		selectedChildrenRows.value = flattenChildrenData.value.filter(row => matchedIds.has(row.id));
	};

	return {
		handleFindInStructure,
		goToPreviousFindResult,
		goToNextFindResult,
		selectAllFindResults,
		buildFindUql,
		buildFindInStructureParams,
		getPathTargetPhysicalIds,
		expandSearchTreeNodes,
		mergeSearchTreeNodes,
		rowContainsFindKeyword,
		scrollToFindResult,
		setFindResults
	};
};
