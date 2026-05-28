import { ref } from 'vue';

let currentReviseTargetNodes: any[] = [];

export const useLifecycleCommands = (partInfo: any, baseInfoStore: any) => {
	const lifecycleCmdLoading = ref(false);

	const X3D_OBJECT_TAXONOMIES = ['ds6w:types/CATPart', 'ds6w:types/CATProduct', 'ds6w:types/VPMReference', 'ds6w:types/PLMProduct'];

	const pickOpenWithField = (obj: any, ...keys: string[]) => {
		for (const key of keys) {
			if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
				return obj[key];
			}
		}
		return null;
	};

	const normalizeReviseFromState = (value: unknown) => {
		if (!value) return value;
		const text = String(value);
		if (text === '工作中') return 'IN_WORK';
		if (text === '已发布') return 'RELEASED';
		return text.includes('.') ? text.split('.').pop() : text;
	};

	const patchReviseFromObject = (target: any, source: any) => {
		if (!target || !source) return;
		if (!target.displayName || target.displayName === 'undefined' || String(target.displayName).includes('undefined '))
			target.displayName = source.displayName || source.name || source.title;
		if (!target.name || target.name === 'undefined') target.name = source.name || source.displayName || source.title;
		if (!target.revision) target.revision = source.revision;
		if (!target.current) target.current = normalizeReviseFromState(source.current);
		target.current_internal = normalizeReviseFromState(target.current_internal || source.current_internal || target.current || source.current);
		if (!target.typeDisplayName || target.typeDisplayName === target.type)
			target.typeDisplayName = source.typeDisplayName || source.displayType || target.typeDisplayName;
		if (!target.displayType || target.displayType === target.type)
			target.displayType = source.displayType || source.typeDisplayName || target.displayType;
		if (!target.cadMaster) target.cadMaster = source.cadMaster;
		if (!target.imageUrl) target.imageUrl = source.imageUrl;
		if (!target.tenant) target.tenant = source.tenant || 'OnPremise';
		if (!target.policy) target.policy = source.policy;
		if (!target.options) target.options = {};
		if (!target.options['ds6w:status']) target.options['ds6w:status'] = target.current || source.current;
		if (!target.options['ds6w:type']) target.options['ds6w:type'] = target.typeDisplayName || source.typeDisplayName || source.displayType;
	};

	const applyReviseFromRequestPatch = (WAFData: any) => {
		if (WAFData.__twPatchReviseFromRequest) return;

		const originalAuthenticatedRequest = WAFData.authenticatedRequest;
		WAFData.authenticatedRequest = function (url: string, options: any) {
			const reviseFromRequestUrls = [
				'/prepare_revise_checkavailability',
				'/attributeList',
				'/prepare_revise_maskattributes',
				'/getversionnumberproposal'
			];
			const isReviseFromRequest = reviseFromRequestUrls.some(requestUrl => url?.includes(requestUrl));
			const shouldPatchReviseFromRequestData
				= url && (url.includes('/prepare_revise_checkavailability') || url.includes('/prepare_revise_maskattributes'));
			if (shouldPatchReviseFromRequestData && options?.data) {
				try {
					const requestData = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;
					if (Array.isArray(requestData?.data) && Array.isArray(currentReviseTargetNodes)) {
						const sourceById = new Map<string, any>();
						currentReviseTargetNodes.forEach(node => {
							const objectId = node?.objectId || node?.physicalid || node?.physicalId;
							if (objectId) sourceById.set(objectId, node);
						});
						requestData.data = requestData.data.map((item: any) => {
							const objectId = item?.physicalid || item?.objectId;
							const source = objectId ? sourceById.get(objectId) : null;
							if (!source) return item;
							return {
								...item,
								name: item?.name && item.name !== 'undefined' ? item.name : source.name,
								displayName:
									item?.displayName && item.displayName !== 'undefined' && !String(item.displayName).includes('undefined ')
										? item.displayName
										: source.displayName,
								typeDisplayName:
									item?.typeDisplayName && item.typeDisplayName !== item.type && item.typeDisplayName !== 'ds6w:Part'
										? item.typeDisplayName
										: source.typeDisplayName,
								current: normalizeReviseFromState(item?.current || source.current),
								current_internal: normalizeReviseFromState(item?.current_internal || source.current_internal || item?.current || source.current),
								revision: item?.revision || source.revision,
								tenant: item?.tenant || source.tenant || 'OnPremise',
								cadMaster: item?.cadMaster || source.cadMaster || '3DEXPERIENCE'
							};
						});
						options.data = JSON.stringify(requestData);
						console.log('[TW_EngineeringRelease] 修正后的 ReviseFrom 请求:', requestData);
					}
				} catch (error) {
					console.error('[TW_EngineeringRelease] 修正 ReviseFrom 请求失败:', error);
				}
			}

			const originalOnComplete = options?.onComplete;
			if (isReviseFromRequest && originalOnComplete) {
				options.onComplete = function (response: any, ...args: any[]) {
					try {
						console.log('[TW_EngineeringRelease] ReviseFrom 原始响应:', url, response);
						if (Array.isArray(response?.results) && Array.isArray(currentReviseTargetNodes)) {
							const sourceById = new Map<string, any>();
							currentReviseTargetNodes.forEach(node => {
								const objectId = node?.objectId || node?.physicalid || node?.physicalId;
								if (objectId) sourceById.set(objectId, node);
							});
							response.results.forEach((result: any) => {
								const objectId = result?.objectId || result?.physicalid;
								const source = objectId ? sourceById.get(objectId) : null;
								patchReviseFromObject(result, source);
							});
							const sourceByMajorId = new Map<string, any>();
							response.results.forEach((result: any) => {
								const majorId = result?.['majorid.lastmajorid.bestsofar.physicalid'];
								if (majorId && result?.displayName) sourceByMajorId.set(majorId, result);
							});
							response.results.forEach((result: any) => {
								const majorId = result?.['majorid.lastmajorid.bestsofar.physicalid'];
								const source = majorId ? sourceByMajorId.get(majorId) : null;
								patchReviseFromObject(result, source);
							});
							const fallbackSource = currentReviseTargetNodes[0];
							response.results.forEach((result: any) => {
								if (!result?.displayName && fallbackSource) {
									patchReviseFromObject(result, fallbackSource);
								}
							});
							console.log('[TW_EngineeringRelease] 修正后的 ReviseFrom 响应:', response.results);
						}
					} catch (error) {
						console.error('[TW_EngineeringRelease] 修正 ReviseFrom 响应失败，继续执行原始回调:', error);
					}
					return originalOnComplete.call(this, response, ...args);
				};
			}

			return originalAuthenticatedRequest.call(this, url, options);
		};
		WAFData.__twPatchReviseFromRequest = true;
	};

	const applyReviseFromWidgetPatch = (ReviseFromController: any) => {
		const ReviseFromControllerCtor = ReviseFromController?.default || ReviseFromController;
		const prototype = ReviseFromControllerCtor?.prototype;
		if (!prototype || prototype.__twPatchReviseFromVersionProposal) return;
		const originalGetVersionNumberProposal = prototype.getVersionNumberProposal;
		if (typeof originalGetVersionNumberProposal !== 'function') return;
		prototype.getVersionNumberProposal = function (physicalIds: any[], securityContext: any) {
			const normalizedPhysicalIds = Array.isArray(physicalIds) ? physicalIds : [];
			const validPhysicalIds = Array.from(
				new Set(normalizedPhysicalIds.map(id => String(id || '').trim()).filter(id => /^[0-9a-fA-F]{32}$/.test(id)))
			);
			const fallbackPhysicalId
				= currentReviseTargetNodes[0]?.physicalid || currentReviseTargetNodes[0]?.physicalId || currentReviseTargetNodes[0]?.objectId;
			if (!validPhysicalIds.length && fallbackPhysicalId) validPhysicalIds.push(fallbackPhysicalId);
			if (validPhysicalIds.length !== normalizedPhysicalIds.length) {
				console.warn('[TW_EngineeringRelease] 修正 ReviseFrom getversionnumberproposal physicalIds:', {
					original: physicalIds,
					normalized: validPhysicalIds
				});
			}
			return originalGetVersionNumberProposal.call(this, validPhysicalIds, securityContext);
		};
		prototype.__twPatchReviseFromVersionProposal = true;
	};

	const registerCompareCommonUtilsShim = (requireFn: any) => {
		const defineFn = (window as any).define || (window.top as any)?.define;
		if (!defineFn || requireFn?.defined?.('DS/CompareCommon/Utils')) return;
		defineFn('DS/CompareCommon/Utils', [], function () {
			return {
				augDroppedObject: function (droppedObject: any, _context: any, onComplete: any) {
					if (typeof onComplete === 'function') onComplete(droppedObject);
				},
				showAlertBox: function (message: any) {
					console.warn('[TW_EngineeringRelease] CompareCommon/Utils shim alert:', message);
				}
			};
		});
	};

	const callLifecycleReviseEntry = (ReviseCmd: any, physicalId: string, commandId = 'revise_command') => {
		const ReviseCmdCtor = ReviseCmd?.default || ReviseCmd;
		if (typeof ReviseCmdCtor !== 'function') {
			throw new Error('DS/LifecycleCmd/ReviseCmd 不是可实例化命令类');
		}
		console.log('[TW_EngineeringRelease] callLifecycleReviseEntry partInfo.value:', JSON.stringify(partInfo.value, null, 2));
		const objectType = pickOpenWithField(partInfo.value, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
		const objectName = pickOpenWithField(partInfo.value, 'ds6w:label', 'label', 'displayName', 'name', 'title') || physicalId;
		const revision = pickOpenWithField(partInfo.value, 'ds6wg:revision', 'revision') || '';
		const displayName = objectName;
		const typeDisplayName = pickOpenWithField(partInfo.value, 'typeDisplayName', 'displayType', 'globalType') || '物理产品';
		const current = pickOpenWithField(partInfo.value, 'ds6w:status', 'status') || '工作中';
		const currentInternal =
			
				current === '工作中'
					? 'IN_WORK'
					: current === '已发布'
						? 'RELEASED'
						: String(current).includes('.')
							? String(current).split('.').pop() || current
						: current;
		const policy = pickOpenWithField(partInfo.value, 'ds6w:policy', 'policy') || 'VPLM_SMB_Definition_MajorRev';
		const cadMaster = pickOpenWithField(partInfo.value, 'ds6w:cadMaster', 'cadMaster') || '3DEXPERIENCE';
		const imageUrl =
			pickOpenWithField(partInfo.value, 'type_icon_url', 'icon', 'thumbnail_2d') || '/snresources/images/icons/small/I_VPMNavProduct.png';

		console.log('[TW_EngineeringRelease] callLifecycleReviseEntry targetNode 字段:', {
			physicalId,
			objectName,
			revision,
			displayName,
			typeDisplayName,
			current,
			currentInternal,
			policy,
			cadMaster,
			imageUrl
		});

		const targetNode = {
			'getID': () => physicalId,
			'id': physicalId,
			'objectId': physicalId,
			'physicalid': physicalId,
			physicalId,
			'type': objectType,
			objectType,
			'displayType': typeDisplayName,
			'displayName': displayName,
			'label': displayName,
			'title': displayName,
			'name': objectName,
			'revision': revision,
			'typeDisplayName': typeDisplayName,
			'baseType': 'PLMEntity',
			'current': current,
			'current_internal': currentInternal,
			'imageUrl': imageUrl,
			'tenant': 'OnPremise',
			'envId': 'OnPremise',
			'serviceId': '3DSpace',
			'contextId': baseInfoStore.securityContext || '',
			'objectTaxonomies': X3D_OBJECT_TAXONOMIES,
			'_options': {
				relationid: physicalId
			},
			'attributes': {
				'ds6w:label': displayName,
				'ds6w:name': objectName,
				'ds6w:type': objectType,
				'PLMEntity.V_Name': objectName
			},
			'revisionModeInfo': {
				revisionMode: 'major'
			},
			'semantic': ['E'],
			'object': {
				'ds6w:label': displayName,
				'ds6w:name': objectName,
				'ds6w:type': objectType,
				'PLMEntity.V_Name': objectName,
				'attribute[PLMEntity.V_Name]': objectName,
				'displayName': displayName,
				'name': objectName,
				'label': displayName,
				'title': displayName,
				'revision': revision,
				'current': current,
				'current_internal': currentInternal,
				'cadMaster': cadMaster,
				'typeDisplayName': typeDisplayName
			},
			'options': {
				'ds6w:status': current,
				'icons': [imageUrl],
				'ds6w:type': typeDisplayName
			},
			'policy': policy,
			'cadMaster': cadMaster,
			'locked': false,
			'lockedBy': null,
			'branch': null,
			'branch.uuid': null,
			'type.kindof[PLMReference]': 'TRUE',
			'popup': true
		};

		currentReviseTargetNodes = [targetNode];

		const mockContext = {
			getSelectedNodes: () => {
				console.log('[TW_EngineeringRelease] 单选 mockContext.getSelectedNodes 返回:', JSON.stringify([targetNode], null, 2));
				return [targetNode];
			},
			getEditMode: () => false,
			getPADTreeDocument: () => ({ getXSO: () => ({ onPostAdd: () => {}, onPostRemove: () => {}, onEmpty: () => {}, get: () => [targetNode] }) }),
			getCurrentFolder: () => '{}',
			addEvent: () => {},
			selectedNodes: [targetNode]
		};

		const reviseCmd = new ReviseCmdCtor({
			ID: commandId,
			context: mockContext
		});

		if (typeof reviseCmd.execute !== 'function') {
			throw new Error('DS/LifecycleCmd/ReviseCmd 实例未暴露 execute 方法');
		}
		reviseCmd.execute([targetNode]);
	};

	const openLifecycleReviseFromCmd = async (physicalId: string) => {
		lifecycleCmdLoading.value = true;
		try {
			const topWindow = (window.top || window.parent || window) as any;
			if (!topWindow.widget) {
				const { widget } = await import('@widget-lab/3ddashboard-utils');
				topWindow.widget = widget;
				(widget as any).body = document.body;
			} else if (!topWindow.widget.body) {
				topWindow.widget.body = document.body;
			}
			const requireFn = topWindow.require || topWindow.requirejs || (window as any).require || (window as any).requirejs;
			registerCompareCommonUtilsShim(requireFn);

			const [ReviseFromCmd, WAFData, ReviseFromWidget] = await Promise.all([
				new Promise<any>((resolve, reject) => {
					requireFn(
						['DS/LifecycleCmd/ReviseFromCmd'],
						(module: any) => resolve(module),
						(error: unknown) => reject(error)
					);
				}),
				new Promise<any>((resolve, reject) => {
					requireFn(
						['DS/WAFData/WAFData'],
						(module: any) => resolve(module),
						(error: unknown) => reject(error)
					);
				}),
				new Promise<any>((resolve, reject) => {
					requireFn(
						['DS/ReviseFromWidget/ReviseFromWidget'],
						(module: any) => resolve(module),
						(error: unknown) => reject(error)
					);
				})
			]);

			applyReviseFromRequestPatch(WAFData);
			applyReviseFromWidgetPatch(ReviseFromWidget);
			callLifecycleReviseEntry(ReviseFromCmd, physicalId, 'reviseFrom_command');
			setTimeout(() => {
				lifecycleCmdLoading.value = false;
			}, 1000);
		} catch (error) {
			console.error('[TW_EngineeringRelease] openLifecycleReviseFromCmd 失败:', error);
			lifecycleCmdLoading.value = false;
		}
	};

	return {
		lifecycleCmdLoading,
		openLifecycleReviseFromCmd
	};
};
