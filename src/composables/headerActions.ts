import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';

export const useHeaderActions = (
	selectedChildrenRows: Ref<any[]>,
	updateRevisionDialogVisible: Ref<boolean>,
	getParentPhysicalId: () => string,
	executeDeleteTargets: (targets: any[], callback: () => Promise<void>) => Promise<void>,
	buildLifecycleTargetNodeFromPartInfo: (physicalId: string) => any,
	handleRootOpenWith: (command: string) => void,
	partDetailApi: any,
	loadPartDetail: (physicalId: string) => Promise<void>,
	openLifecycleHistoryCmd: (physicalId: string) => void,
	handleSelectedRowNewRevision: () => Promise<void>,
	openLifecycleReviseCmd: (physicalId: string) => Promise<void>,
	openLifecycleNewBranchCmd: (physicalId: string) => Promise<void>,
	openLifecycleReviseFromCmd: (physicalId: string) => Promise<void>,
	openLifecycleDuplicateCmd: (physicalId: string) => Promise<void>,
	handleUpdateEntireStructureRevision: () => Promise<void>,
	router: any
) => {
	const handleHeaderActionCommand = async (command: string) => {
		console.log('[TW_EngineeringRelease] header action command:', command);
		if (command === 'delete') {
			const physicalId = getParentPhysicalId();
			console.log('[TW_EngineeringRelease] delete 点击，当前物理ID:', physicalId);
			if (!physicalId) {
				console.warn('[TW_EngineeringRelease] delete 点击失败：未找到当前对象物理ID');
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			await executeDeleteTargets([buildLifecycleTargetNodeFromPartInfo(physicalId)], async () => {
				ElMessage.success('删除成功');
				await router.push('/');
			});
			return;
		}
		if (command === 'compare') {
			handleRootOpenWith('compare');
			return;
		}
		if (command === 'relationship') {
			handleRootOpenWith('relationship');
			return;
		}
		if (command === 'lock') {
			const physicalId = getParentPhysicalId();
			if (!physicalId) {
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			try {
				await partDetailApi.reserveOrUnreserve({
					operation: 'reserve',
					urls: [`model/bus/${physicalId}`],
					isMultiSel: false
				});
				ElMessage.success('锁定成功');
				await loadPartDetail(physicalId);
			} catch (error) {
				console.error('[PartDetailView] 锁定失败:', error);
				ElMessage.error('锁定失败');
			}
			return;
		}
		if (command === 'unlock') {
			const physicalId = getParentPhysicalId();
			if (!physicalId) {
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			try {
				await partDetailApi.reserveOrUnreserve({
					operation: 'unreserve',
					urls: [`model/bus/${physicalId}`],
					isMultiSel: false
				});
				ElMessage.success('解锁成功');
				await loadPartDetail(physicalId);
			} catch (error) {
				console.error('[PartDetailView] 解锁失败:', error);
				ElMessage.error('解锁失败');
			}
			return;
		}
		if (command === 'revision') {
			const physicalId = getParentPhysicalId();
			console.log('[TW_EngineeringRelease] revision 点击，当前物理ID:', physicalId);
			if (!physicalId) {
				console.warn('[TW_EngineeringRelease] revision 点击失败：未找到当前对象物理ID');
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			await openLifecycleHistoryCmd(physicalId);
			return;
		}
		if (command === 'newRevision') {
			console.log('[TW_EngineeringRelease] newRevision 检查选中行数量:', selectedChildrenRows.value.length);
			console.log('[TW_EngineeringRelease] newRevision selectedChildrenRows:', JSON.stringify(selectedChildrenRows.value.slice(0, 2), null, 2));
			if (selectedChildrenRows.value.length > 0) {
				await handleSelectedRowNewRevision();
				return;
			}
			const physicalId = getParentPhysicalId();
			console.log('[TW_EngineeringRelease] newRevision 点击，当前物理ID:', physicalId);
			if (!physicalId) {
				console.warn('[TW_EngineeringRelease] newRevision 点击失败：未找到当前对象物理ID');
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			await openLifecycleReviseCmd(physicalId);
			return;
		}
		if (command === 'newBranch') {
			const physicalId = getParentPhysicalId();
			console.log('[TW_EngineeringRelease] newBranch 点击，当前物理ID:', physicalId);
			if (!physicalId) {
				console.warn('[TW_EngineeringRelease] newBranch 点击失败：未找到当前对象物理ID');
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			await openLifecycleNewBranchCmd(physicalId);
			return;
		}
		if (command === 'newRevisionSource') {
			const physicalId = getParentPhysicalId();
			console.log('[TW_EngineeringRelease] newRevisionSource 点击，当前物理ID:', physicalId);
			if (!physicalId) {
				console.warn('[TW_EngineeringRelease] newRevisionSource 点击失败：未找到当前对象物理ID');
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			await openLifecycleReviseFromCmd(physicalId);
			return;
		}
		if (command === 'copy') {
			const physicalId = getParentPhysicalId();
			console.log('[TW_EngineeringRelease] copy 点击，当前物理ID:', physicalId);
			if (!physicalId) {
				console.warn('[TW_EngineeringRelease] copy 点击失败：未找到当前对象物理ID');
				ElMessage.warning('未找到当前对象物理ID');
				return;
			}
			await openLifecycleDuplicateCmd(physicalId);
			return;
		}
		if (command === 'updateRevisionAll') {
			await handleUpdateEntireStructureRevision();
			return;
		}
		if (command === 'updateRevision') {
			updateRevisionDialogVisible.value = true;
			return;
		}
		console.log('[PartDetailView] header action command:', command);
	};

	return {
		handleHeaderActionCommand
	};
};
