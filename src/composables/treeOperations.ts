import { ElMessage } from 'element-plus';
import expandApi from '@/api/expandApi';
import type { TreeNode } from '@/api/expandApi';

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

		try {
			if (selectedRows.length === 0) {
				// 无选择：以根节点为前缀展开2层（相对前缀1层），直接替换根的子节点
				console.log('[PartDetailView] 展开根节点（无选择），层数: 2');
				const params = expandApi.buildExpandRequestParams(rootPhysicalId, null, 2);
				const response = await expandApi.expandWithParams(params);
				const newChildren = expandApi.parseExpandDataRecursive(response as any, rootPhysicalId, [rootPhysicalId]);
				(childrenData.value as TreeNode[]) = newChildren.map(n => ({ ...n, level: 0 }));
				ElMessage.success('展开成功');
				return;
			}

			console.log('[PartDetailView] 展开选中行, 选中行数:', selectedRows.length);
			// 有选择：按每个选中行的 path 作为前缀展开到下一层
			const params = expandApi.buildExpandRequestParams(rootPhysicalId, selectedRows, 2);
			const response = await expandApi.expandWithParams(params);
			selectedRows.forEach((row: TreeNode) => {
				const prefixPath = row.path || [rootPhysicalId];
				const newChildren = expandApi.parseExpandDataRecursive(response as any, rootPhysicalId, prefixPath);
				if (newChildren.length) {
					const parentLevel = row.level || 0;
					const adjustLevel = (nodes: TreeNode[]): TreeNode[] =>
						nodes.map(n => ({
							...n,
							level: (n.level || 0) + parentLevel + 1,
							children: n.children && n.children.length ? adjustLevel(n.children) : []
						}));
					row.children = adjustLevel(newChildren);
					row.hasChildren = true;
					row.isExpanded = true;
				}
			});
			ElMessage.success('展开成功');
		} catch (error) {
			console.error('[PartDetailView] 展开失败:', error);
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
			// 全部展开：若无选中行则对根节点多层展开；有选中行则对所选路径多层展开
			const targetRows = selectedRows.length > 0 ? selectedRows : null;
			const level = 10; // 默认一个较大的层数实现“全部展开”
			const params = expandApi.buildExpandRequestParams(rootPhysicalId, targetRows, level);
			const response = await expandApi.expandWithParams(params);

			if (targetRows && targetRows.length) {
				// 更新选中行的子节点（递归多层）
				targetRows.forEach((row: TreeNode) => {
					const prefixPath = row.path || [rootPhysicalId];
					const newChildren = expandApi.parseExpandDataRecursive(response as any, rootPhysicalId, prefixPath);
					if (newChildren.length) {
						const parentLevel = row.level || 0;
						const adjustLevel = (nodes: TreeNode[]): TreeNode[] =>
							nodes.map(n => ({
								...n,
								level: (n.level || 0) + parentLevel + 1,
								children: n.children && n.children.length ? adjustLevel(n.children) : []
							}));
						row.children = adjustLevel(newChildren);
						row.hasChildren = true;
						row.isExpanded = true;
					}
				});
			} else {
				// 无选中行：直接替换根的子节点
				const newChildren = expandApi.parseExpandDataRecursive(response as any, rootPhysicalId, [rootPhysicalId]);
				(childrenData.value as TreeNode[]) = newChildren.map(n => ({ ...n, level: 0 }));
			}

			ElMessage.success('全部展开成功');
		} catch (error) {
			console.error('[PartDetailView] 全部展开失败:', error);
			ElMessage.error('全部展开失败');
		}
	};

	const handleCollapseAll = async () => {
		const selectedRows = [...selectedChildrenRows.value];
		console.log('[PartDetailView] 全部折叠(本地), 选中行数:', selectedRows.length);

		// 递归折叠指定节点
		const collapseNode = (row: any) => {
			if (!row) return;
			row.isExpanded = false;
			if (Array.isArray(row.children)) {
				row.children.forEach(collapseNode);
			}
		};

		if (selectedRows.length > 0) {
			selectedRows.forEach(collapseNode);
		} else {
			// 未选择行时，折叠整棵树
			(childrenData.value || []).forEach(collapseNode);
		}

		ElMessage.success('全部折叠成功');
	};

	return {
		handleExpandMenuCommand,
		handleExpandSelected,
		handleExpandAll,
		handleCollapseAll
	};
};
