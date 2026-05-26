import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';

const OPEN_WITH_APP_ID: Record<string, string> = {
	'3D Markup': 'ENOR3D_AP',
	'3D Navigate': 'ENXDISC_AP',
	'3DPlay': 'X3DPLAW_AP',
	'Collaborative Lifecycle': 'ENOLCMI_AP',
	'compare': 'ENOCOMP_AP',
	'relationship': 'ENORIPE_AP'
};

export const X3D_OBJECT_TAXONOMIES = [
	'PLMEntity',
	'PLMReference',
	'PLMCoreReference',
	'LPAbstractReference',
	'PHYSICALAbstractReference',
	'VPMReference',
	'3DPart',
	'XCADExtension',
	'CN_PartInfo'
];

export const pickOpenWithField = (row: any, ...keys: string[]): string => {
	for (const key of keys) {
		const value = row?.[key];
		if (value !== undefined && value !== null && value !== '') return String(value);
	}
	return '';
};

const buildOpenWithPayload = (row: any, securityContext: string) => {
	const objectId = pickOpenWithField(row, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	const objectType = pickOpenWithField(row, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
	const displayName = pickOpenWithField(row, 'ds6w:label', 'label', 'displayName', 'name', 'title') || objectId;

	return {
		protocol: '3DXContent',
		version: '2.0',
		source: 'X3DSEAR_AP',
		widgetId: '',
		data: {
			items: [
				{
					objectId,
					objectType,
					envId: 'OnPremise',
					serviceId: '3DSpace',
					displayName,
					displayType: objectType,
					contextId: securityContext || '',
					objectTaxonomies: X3D_OBJECT_TAXONOMIES
				}
			]
		}
	};
};

const openWithHashJump = (appName: string, row: any, securityContext: string) => {
	const appId = OPEN_WITH_APP_ID[appName];
	if (!appId) {
		ElMessage.warning(`未知的打开方式：${appName}`);
		return;
	}
	const objectId = pickOpenWithField(row, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	if (!objectId) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	const encoded = encodeURIComponent(JSON.stringify(buildOpenWithPayload(row, securityContext)));
	const hashSuffix = `/app:${appId}/content:X3DContentId=${encoded}`;
	try {
		const topWindow: any = window.top || window.parent || window;
		const currentHash = topWindow.location.hash || '';
		const baseHash = currentHash.replace(/\/app:[^/]+(?:\/content:[^]*)?$/, '');
		topWindow.location.hash = (baseHash || '#/tabId:New%20Tab') + hashSuffix;
	} catch {
		(window.top || window).location.href = `${window.location.origin}/3ddashboard/#/tabId:New%20Tab${hashSuffix}`;
	}
};

const openWithHashJumpForCompare = (row1: any, row2: any, securityContext: string) => {
	const appId = OPEN_WITH_APP_ID['compare'];
	if (!appId) {
		ElMessage.warning('未知的打开方式：compare');
		return;
	}
	const objectId1 = pickOpenWithField(row1, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	const objectId2 = pickOpenWithField(row2, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	if (!objectId1 || !objectId2) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	const payload1 = buildOpenWithPayload(row1, securityContext);
	const payload2 = buildOpenWithPayload(row2, securityContext);
	const combinedPayload = {
		...payload1,
		data: {
			items: [...payload1.data.items, ...payload2.data.items]
		}
	};

	const encoded = encodeURIComponent(JSON.stringify(combinedPayload));
	const hashSuffix = `/app:${appId}/content:X3DContentId=${encoded}`;
	try {
		const topWindow: any = window.top || window.parent || window;
		const currentHash = topWindow.location.hash || '';
		const baseHash = currentHash.replace(/\/app:[^/]+(?:\/content:[^]*)?$/, '');
		topWindow.location.hash = (baseHash || '#/tabId:New%20Tab') + hashSuffix;
	} catch {
		(window.top || window).location.href = `${window.location.origin}/3ddashboard/#/tabId:New%20Tab${hashSuffix}`;
	}
};

const openNativeCompass = (row: any, securityContext: string) => {
	const objectId = pickOpenWithField(row, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	if (!objectId) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	try {
		const topWindow: any = window.top || window.parent || window;
		const ctx = topWindow.requirejs?.s?.contexts?._ || topWindow.require?.s?.contexts?._;
		const X3DContent = ctx?.defined?.['DS/i3DXCompass/X3DContent'];
		const CompassManager = ctx?.defined?.['DS/Dashboard/CompassManager'];
		if (X3DContent?.setX3DContent) X3DContent.setX3DContent(buildOpenWithPayload(row, securityContext));
		if (CompassManager?.open) CompassManager.open();
		else topWindow.document.querySelector('.compass-small')?.click();
	} catch (error) {
		console.warn('[PartDetailView] 打开更多应用程序失败:', error);
		ElMessage.warning('打开更多应用程序失败，请在 3DDashboard 中重试');
	}
};

export const useOpenWith = (partInfo: Ref<any>, currentPhysicalId: Ref<string>, selectedChildrenRows: Ref<any[]>, securityContext: Ref<string>) => {
	const handleOpenWith = (appName: string, row: any) => {
		if (appName === 'more') openNativeCompass(row, securityContext.value);
		else openWithHashJump(appName, row, securityContext.value);
		document.body.click();
	};

	const buildRootOpenWithRow = () => ({
		...partInfo.value,
		resourceid: currentPhysicalId.value || (partInfo.value as any)?.physicalid || partInfo.value?.['ds6w:identifier'],
		physicalid: currentPhysicalId.value || (partInfo.value as any)?.physicalid || partInfo.value?.['ds6w:identifier']
	});

	const handleRootOpenWith = (appName: string) => {
		if (!partInfo.value || !currentPhysicalId.value) {
			ElMessage.error('未获取到当前零件信息');
			return;
		}
		handleOpenWith(appName, buildRootOpenWithRow());
	};

	const handleSelectedOpenWith = (appName: string) => {
		const selectedRow = selectedChildrenRows.value[0];
		if (!selectedRow) {
			ElMessage.warning('请先选择一个对象');
			return;
		}
		handleOpenWith(appName, selectedRow);
	};

	const handleSelectedCompare = () => {
		const count = selectedChildrenRows.value.length;
		if (count !== 2) {
			ElMessage.warning('请选择两个对象进行比较');
			return;
		}
		openWithHashJumpForCompare(selectedChildrenRows.value[0], selectedChildrenRows.value[1], securityContext.value);
	};

	return {
		handleOpenWith,
		handleRootOpenWith,
		handleSelectedOpenWith,
		handleSelectedCompare
	};
};
