import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

export const useDeformDialog = (
	deformDialogVisible: Ref<boolean>,
	deformSubmitting: Ref<boolean>,
	deformTargets: Ref<any[]>,
	deformPrefix: Ref<string>,
	partDetailApi: any,
	getExistingProductParentContexts: () => any[],
	validateChildInsertParentContext: (ids: string[]) => Promise<boolean>,
	getInsertExistingFailureMessage: (response: any) => string,
	showInsertExistingReport: (results: any[], parents: any[]) => Promise<void>,
	refreshAfterExistingProductInsert: (parents: any[]) => Promise<void>
) => {
	const deformDialogSize = ref({
		width: 720,
		height: 300
	});

	const deformDialogStyle = computed(() => ({
		width: `${deformDialogSize.value.width}px`,
		height: `${deformDialogSize.value.height}px`
	}));

	let deformDialogResizing = false;
	let deformDialogResizeStartX = 0;
	let deformDialogResizeStartY = 0;
	let deformDialogResizeStartWidth = 0;
	let deformDialogResizeStartHeight = 0;

	const handleDeformDialogResizeMove = (event: MouseEvent) => {
		if (!deformDialogResizing) return;
		const nextWidth = Math.max(480, deformDialogResizeStartWidth + event.clientX - deformDialogResizeStartX);
		const nextHeight = Math.max(300, deformDialogResizeStartHeight + event.clientY - deformDialogResizeStartY);
		deformDialogSize.value = {
			width: nextWidth,
			height: nextHeight
		};
	};

	const handleDeformDialogResizeEnd = () => {
		if (!deformDialogResizing) return;
		deformDialogResizing = false;
		document.body.classList.remove('deform-dialog-resizing');
		window.removeEventListener('mousemove', handleDeformDialogResizeMove);
		window.removeEventListener('mouseup', handleDeformDialogResizeEnd);
	};

	const handleDeformDialogResizeStart = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		deformDialogResizing = true;
		deformDialogResizeStartX = event.clientX;
		deformDialogResizeStartY = event.clientY;
		deformDialogResizeStartWidth = deformDialogSize.value.width;
		deformDialogResizeStartHeight = deformDialogSize.value.height;
		document.body.classList.add('deform-dialog-resizing');
		window.addEventListener('mousemove', handleDeformDialogResizeMove);
		window.addEventListener('mouseup', handleDeformDialogResizeEnd);
	};

	const submitDeformedProducts = async () => {
		if (!deformTargets.value.length) {
			ElMessage.warning('未选择待变形产品');
			return;
		}
		const parents = getExistingProductParentContexts();
		if (!parents.length) {
			ElMessage.warning('未获取到插入父节点');
			return;
		}
		const canInsert = await validateChildInsertParentContext(parents.map(parent => parent.physicalId));
		if (!canInsert) return;
		deformSubmitting.value = true;
		try {
			const prefix = deformPrefix.value || '';
			const createdResults = await Promise.all(
				deformTargets.value.map(product => {
					const options = prefix ? [{ nlsKey: 'Prefix:', type: 'text', value: prefix, key: 'prefix' }] : [];
					return partDetailApi.createDeformedFromDeformable([{ cestamp: product.cestamp, deformableID: product.resourceid }], options);
				})
			);

			const deformedIds = createdResults
				.flatMap(r => r.results || [])
				.filter(r => r.status === 'success')
				.map(r => r.deformedID);

			if (!deformedIds.length) {
				ElMessage.error('创建变形件失败');
				return;
			}

			const operations = parents.flatMap(parent =>
				deformedIds.map(childId => ({
					parent: {
						isInstanceOf: parent.physicalId,
						children: parent.children
					},
					child: {
						isInstanceOf: childId
					}
				}))
			);

			const response = await partDetailApi.insertExistingProducts(operations);
			if (response.status !== 'success') {
				ElMessage.error(getInsertExistingFailureMessage(response) || '插入变形件失败');
				return;
			}

			await showInsertExistingReport(response.results || [], parents);
			await refreshAfterExistingProductInsert(parents);
			deformDialogVisible.value = false;
			ElMessage.success('变形件创建并插入成功');
		} catch (error) {
			console.error('[PartDetailView] 创建变形件失败:', error);
			ElMessage.error('创建变形件失败');
		} finally {
			deformSubmitting.value = false;
		}
	};

	return {
		deformDialogSize,
		deformDialogStyle,
		handleDeformDialogResizeMove,
		handleDeformDialogResizeEnd,
		handleDeformDialogResizeStart,
		submitDeformedProducts
	};
};
