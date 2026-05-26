import { ref, computed } from 'vue';

interface ChildDragItem {
	objectId: string;
	objectType: string;
	revision: string;
	name: string;
	physicalId: string;
	parentPhysicalId: string;
	sequence: number;
}

export const useDragDrop = (selectedChildrenRows: any, isFlatStructureView: any, isChildrenRowSelected: (row: any) => boolean, childrenData: any) => {
	const draggingChildRowId = ref('');
	const dragOverChildRowId = ref('');

	const getChildDragRows = (row: any) => (isChildrenRowSelected(row) ? selectedChildrenRows.value : [row]);

	const getChildDragObjectType = () => 'VPMReference';

	let childDragSequence = 0;

	const findParentRowByChildRowId = (nodes: any[], childRowId: string): any | null => {
		for (const node of nodes) {
			if (node.children?.some((child: any) => child.id === childRowId)) {
				return node;
			}
			if (node.children?.length) {
				const parent = findParentRowByChildRowId(node.children, childRowId);
				if (parent) return parent;
			}
		}
		return null;
	};

	const toChildDragItem = (row: any): ChildDragItem => {
		const objectType = getChildDragObjectType();
		const parentRow = findParentRowByChildRowId(childrenData.value, row.id);
		const parentPhysicalId = parentRow?.resourceid || parentRow?.physicalid || '';
		return {
			objectId: row.resourceid || row.physicalid || row.id || '',
			objectType,
			revision: row.revision || '',
			name: row.label || row.name || '',
			physicalId: row.resourceid || row.physicalid || row.id || '',
			parentPhysicalId,
			sequence: childDragSequence++
		};
	};

	const buildChildRowDragPayload = (dragRows: any[]) => {
		const items = dragRows.map(toChildDragItem);
		return {
			data: {
				items,
				source: 'PartDetailView'
			}
		};
	};

	const setDragData = (event: DragEvent, payload: any) => {
		if (!event.dataTransfer) return;
		event.dataTransfer.setData('text/searchitems', JSON.stringify(payload));
		event.dataTransfer.setData('text/plain', JSON.stringify(payload));
	};

	const setChildRowDragImage = (event: DragEvent, dragRows: any[], dragRow: any) => {
		if (!event.dataTransfer) return;

		const dragImage = document.createElement('div');
		const dragTitle = dragRows.length > 1 ? `全部选定对象 (${dragRows.length})` : dragRow.label;
		dragImage.className = 'child-row-drag-image';
		dragImage.innerHTML = `<span class="child-row-drag-add">+</span><span class="child-row-drag-title">${dragTitle}</span>`;
		document.body.appendChild(dragImage);
		event.dataTransfer.setDragImage(dragImage, 12, 12);
		window.setTimeout(() => {
			document.body.removeChild(dragImage);
		}, 0);
	};

	const handleChildRowDragStart = (event: DragEvent, row: any) => {
		if (isFlatStructureView.value) {
			event.preventDefault();
			return;
		}
		const dragRows = getChildDragRows(row);
		const payload = buildChildRowDragPayload(dragRows);
		draggingChildRowId.value = row.id;

		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'copyMove';
		}
		setDragData(event, payload);
		setChildRowDragImage(event, dragRows, row);
	};

	const handleChildRowDragEnd = () => {
		draggingChildRowId.value = '';
	};

	const getChildrenV2RowProps = ({ rowData }: { rowData: any }) => ({
		'draggable': !isFlatStructureView.value,
		'data-child-row-id': rowData.id,
		'onDragstart': (event: DragEvent) => handleChildRowDragStart(event, rowData),
		'onDragend': handleChildRowDragEnd
	});

	return {
		draggingChildRowId,
		dragOverChildRowId,
		getChildrenV2RowProps,
		handleChildRowDragStart,
		handleChildRowDragEnd
	};
};
