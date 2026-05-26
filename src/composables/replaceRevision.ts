import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { UpdateRevisionOperation } from '@/views/UpdateRevisionDialog.vue';

export const useReplaceRevision = (
	selectedChildrenRows: Ref<any[]>,
	childrenData: Ref<any[]>,
	currentPhysicalId: Ref<string>,
	partDetailApi: any,
	queryModeStore: any,
	loadPartDetail: (physicalId: string) => Promise<void>,
	replaceReportTitle: Ref<string>,
	replaceLatestReportMessages: Ref<string[]>,
	replaceLatestReportVisible: Ref<boolean>,
	replaceRevisionSelectedRows: Ref<any[]>,
	replaceRevisionDialogVisible: Ref<boolean>,
	updateRevisionSubmitting: Ref<boolean>,
	updateRevisionDialogVisible: Ref<boolean>,
	catflNlsEn: Record<string, string>,
	catflNlsZh: Record<string, string>
) => {
	const getCatflNlsMessage = (key: string) => {
		const language = localStorage.getItem('language') || navigator.language || '';
		const messages = language.toLowerCase().startsWith('en') ? catflNlsEn : catflNlsZh;
		return (messages as Record<string, string>)[key] || key;
	};

	const getReplaceFailureMessage = (response: { status?: string; results?: Array<{ status?: string; oldName?: string; messages?: string[] }> }) => {
		const failedResults = (response.results || []).filter(result => String(result.status).toLowerCase() === 'failure');
		if (String(response.status).toLowerCase() !== 'failure' && !failedResults.length) return '';
		return failedResults
			.map(result => {
				const errorCode = result.messages?.find(message => /^ERR_/.test(message));
				const message = errorCode ? getCatflNlsMessage(errorCode).replace(/<br>/g, '\n') : result.messages?.join('\n') || '替换失败';
				return `${result.oldName || ''}: ${message}`.trim();
			})
			.join('\n');
	};

	const showReplaceFailureMessage = (message: string) => {
		ElMessage({
			type: 'error',
			dangerouslyUseHTMLString: true,
			duration: 12000,
			showClose: true,
			message: message
				.split('\n')
				.filter(Boolean)
				.map(line => `<div>${line}</div>`)
				.join('')
		});
	};

	const findParentNodeByChildId = (nodes: any[], childId: string, parent?: any): any | null => {
		for (const node of nodes) {
			if (node.id === childId) return parent || null;
			const foundParent = findParentNodeByChildId(node.children || [], childId, node);
			if (foundParent) return foundParent;
		}
		return null;
	};

	const getInstanceQuantityParentPhysicalId = (row: any) => {
		const parentNode = findParentNodeByChildId(childrenData.value, row.id);
		return parentNode?.resourceid || currentPhysicalId.value;
	};

	const getRowDisplayName = (row: any) => `${row.label || row.identifier || row.resourceid} ${row.revision || ''}`.trim();

	const isLastVersionValue = (value: unknown) => String(value).toLowerCase() === 'true';

	const getLatestVersion = (versions: any[]) => versions.find(version => isLastVersionValue(version.isLastVersion));

	const handleReplaceLatestRevision = async () => {
		const rows = [...selectedChildrenRows.value];
		if (!rows.length) return;

		const operations = [];
		const ignoredMessages: string[] = [];

		try {
			for (const row of rows) {
				if (!row.resourceid || !row.relationId) {
					ElMessage.error('未获取到选中对象的物理ID或关系ID');
					return;
				}
				const parentPhysicalId = getInstanceQuantityParentPhysicalId(row);
				if (!parentPhysicalId) {
					ElMessage.error('未获取到选中对象的父ID');
					return;
				}
				const versionGraph = await partDetailApi.getVersionGraph(row.resourceid);
				const latestVersion = getLatestVersion(versionGraph.graphs?.[0]?.versions || []);
				if (!latestVersion?.id) {
					ElMessage.warning(`未找到对象 ${getRowDisplayName(row)} 的最新修订版`);
					continue;
				}
				const oldName = getRowDisplayName(row);
				const newName = `${latestVersion.label || row.label || row.identifier || latestVersion.id} ${latestVersion.code || ''}`.trim();
				if (latestVersion.id === row.resourceid) {
					ignoredMessages.push(`替换操作已被忽略，因为对象 ${oldName} 已是最新修订版。`);
					continue;
				}
				operations.push({
					hasParent: parentPhysicalId,
					instance: row.relationId,
					isInstanceOf: latestVersion.id,
					oldName,
					newName
				});
			}

			if (!operations.length) {
				if (ignoredMessages.length) {
					ElMessage.info(ignoredMessages.join('\n'));
				}
				return;
			}

			const response = await partDetailApi.replaceByLatestRevision(operations);
			const successResults = (response.results || []).filter((result: any) => String(result.status).toLowerCase() === 'success');
			replaceReportTitle.value = '替换为最新修订版报告';
			replaceLatestReportMessages.value = successResults.length
				? successResults.map((result: any) => `成功将 ${result.oldName || ''} 替换为 ${result.newName || ''}。`)
				: operations.map(operation => `成功将 ${operation.oldName} 替换为 ${operation.newName}。`);
			replaceLatestReportVisible.value = true;
			selectedChildrenRows.value = [];
			queryModeStore.switchToDbMode();
			if (currentPhysicalId.value) {
				await loadPartDetail(currentPhysicalId.value);
			}
		} catch (error) {
			console.error('[PartDetailView] 替换为最新修订版失败:', error);
			ElMessage.error('替换为最新修订版失败');
		}
	};

	const openReplaceRevisionDialog = () => {
		const rows = [...selectedChildrenRows.value];
		if (!rows.length) {
			ElMessage.warning('请先选择要替换的行');
			return;
		}
		for (const row of rows) {
			if (!row.resourceid || !row.relationId) {
				ElMessage.error('未获取到选中对象的物理ID或关系ID');
				return;
			}
		}
		replaceRevisionSelectedRows.value = rows;
		replaceRevisionDialogVisible.value = true;
	};

	const handleReplaceRevisionConfirm = async (
		operations: Array<{ hasParent: string; instance: string; isInstanceOf: string; oldName: string; newName: string }>
	) => {
		try {
			const response = await partDetailApi.replaceByLatestRevision(operations);
			const successResults = (response.results || []).filter((result: any) => String(result.status).toLowerCase() === 'success');
			replaceReportTitle.value = '替换为修订版报告';
			replaceLatestReportMessages.value = successResults.length
				? successResults.map((result: any) => `成功将 ${result.oldName || ''} 替换为 ${result.newName || ''}。`)
				: operations.map(op => `成功将 ${op.oldName} 替换为 ${op.newName}。`);
			replaceRevisionDialogVisible.value = false;
			replaceLatestReportVisible.value = true;
			selectedChildrenRows.value = [];
			queryModeStore.switchToDbMode();
			if (currentPhysicalId.value) {
				await loadPartDetail(currentPhysicalId.value);
			}
		} catch (error) {
			console.error('[PartDetailView] 替换为修订版失败:', error);
			ElMessage.error('替换为修订版失败');
		}
	};

	const handleUpdateRevisionConfirm = async (operations: UpdateRevisionOperation[]) => {
		try {
			updateRevisionSubmitting.value = true;
			const reportMessages: string[] = [];
			const newRevisionOps = operations.filter(op => op.action === 'newRevision');
			const replaceNewRevisionOps = operations.filter(op => op.action === 'replaceNewRevision');
			const replaceOps = operations.filter(op => op.action === 'replace');

			// 1. 批量新建修订版（newRevision + replaceNewRevision 合并一个请求）
			const allAddOps = [...newRevisionOps, ...replaceNewRevisionOps];
			let addResults: Array<{ copyId: string; id?: string; revision?: string; code?: string; status?: string; [key: string]: unknown }> = [];
			if (allAddOps.length) {
				const addIds = allAddOps.map(op => op.physicalId);
				const addResp = await partDetailApi.addVersions(addIds);
				console.log('[PartDetailView] 批量新建修订版响应:', addResp);
				addResults = addResp.addRequests || [];
				for (const op of allAddOps) {
					const addResult = addResults.find(r => r.copyId === op.physicalId);
					const newRevision = addResult?.revision || addResult?.code || op.newName.split(' ').pop() || '';
					const label = op.oldName.split(' ')[0] || '';
					reportMessages.push(`已成功从 ${op.oldName} 创建新修订版 ${label} ${newRevision}。`);
				}
			}

			// 2. 批量替换（replaceNewRevision 用 addResult.id + 普通 replace 合并一个请求）
			const allReplaceParams: Array<{ hasParent: string; instance: string; isInstanceOf: string; oldName: string; newName: string }> = [];
			for (const op of replaceNewRevisionOps) {
				const addResult = addResults.find(r => r.copyId === op.physicalId);
				console.log('[PartDetailView] 替换为新修订版匹配:', op.physicalId, addResult);
				if (addResult?.id) {
					allReplaceParams.push({
						hasParent: op.hasParent,
						instance: op.instance,
						isInstanceOf: addResult.id,
						oldName: op.oldName,
						newName: op.newName
					});
				}
			}
			for (const op of replaceOps) {
				allReplaceParams.push({
					hasParent: op.hasParent,
					instance: op.instance,
					isInstanceOf: op.isInstanceOf,
					oldName: op.oldName,
					newName: op.newName
				});
			}
			if (allReplaceParams.length) {
				const replaceResp = await partDetailApi.replaceByLatestRevision(allReplaceParams);
				console.log('[PartDetailView] 批量替换修订版响应:', replaceResp);
				const failureMessage = getReplaceFailureMessage(replaceResp);
				if (failureMessage) {
					showReplaceFailureMessage(failureMessage);
					const detailError = new Error(failureMessage) as Error & { detailShown?: boolean };
					detailError.detailShown = true;
					throw detailError;
				}
				for (const op of allReplaceParams) {
					reportMessages.push(`成功将 ${op.oldName} 替换为 ${op.newName}。`);
				}
			}

			replaceReportTitle.value = '更新修订版报告';
			replaceLatestReportMessages.value = reportMessages;
			updateRevisionDialogVisible.value = false;
			replaceLatestReportVisible.value = true;
			selectedChildrenRows.value = [];
			queryModeStore.switchToDbMode();
			if (currentPhysicalId.value) {
				await loadPartDetail(currentPhysicalId.value);
			}
		} catch (error) {
			console.error('[PartDetailView] 更新修订版失败:', error);
			if (!(error as Error & { detailShown?: boolean })?.detailShown) {
				ElMessage.error('更新修订版失败');
			}
		} finally {
			updateRevisionSubmitting.value = false;
		}
	};

	return {
		handleReplaceLatestRevision,
		openReplaceRevisionDialog,
		handleReplaceRevisionConfirm,
		handleUpdateRevisionConfirm,
		getReplaceFailureMessage,
		showReplaceFailureMessage,
		getCatflNlsMessage
	};
};
