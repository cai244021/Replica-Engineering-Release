import { http } from '@/utils/ds-request';
import { useBaseInfoStore } from '@/store';

// 零件详情请求参数
export interface PartDetailParams {
	select_file: string[];
	fcs_url_mode: string;
	label: string;
	physicalid: string[];
	locale: string;
	tenant: string;
	select_predicate: string[];
}

// 属性项
export interface AttributeItem {
	format: string;
	name: string;
	type: string;
	value: string;
}

// 零件信息（原始响应格式）
export interface PartInfoRaw {
	sort: {
		sortValue: string;
		sortType: string;
	};
	attributes: AttributeItem[];
}

// 零件信息（解析后的格式）
export interface PartInfo {
	'ds6w:label': string;
	'type_icon_url': string;
	'ds6w:globalType': string;
	'ds6w:cadMaster': string;
	'ds6wg:EnterpriseExtension.V_PartNumber': string;
	'ds6w:reservedBy': string;
	'ds6w:type': string;
	'ds6w:responsible': string;
	'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity': string;
	'ds6wg:revision': string;
	'thumbnail_2d': string;
	'ds6w:policy': string;
	'ds6w:modified': string;
	'owner': string;
	'resourceid': string;
	'ds6w:description': string;
	'ds6w:reserved': string;
	'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity': string;
	'ds6w:isLastRevision': string;
	'ds6w:identifier': string;
	'ds6wg:MaterialUsageExtension.DeclaredQuantity': string;
	'ds6w:manufacturable': string;
	'ds6w:status': string;
	'ds6w:created': string;
	'preview_url': string;
	'physicalid'?: string;
	[key: string]: string | undefined;
}

// 子级节点
export interface ChildNode {
	id: string;
	physicalid: string;
	label: string;
	type: string;
	revision: string;
	responsible: string;
	status: string;
	modified: string;
	thumbnail?: string;
	icon?: string;
	parentId?: string;
	children?: ChildNode[];
	level: number;
	isLeaf?: boolean;
}

// 零件详情响应
export interface PartDetailResponse {
	infos: {
		encoding: string;
		kind: string;
		version: string;
	};
	results: PartInfoRaw[];
}

export interface SetPartNumberReference {
	physicalid: string;
	OperationPerformed: 'Request';
	partNumber: string;
}

export interface SetPartNumbersParams {
	references: SetPartNumberReference[];
	SkipAllRevSameEINCheck: 'True';
}

export interface ReparentOperation {
	source: {
		instance: string;
		isInstanceOf: string;
		pathArray?: string[];
	};
	target: {
		children?: string[];
		isInstanceOf: string;
		pathArray: string[];
	};
	mode?: 'CutPaste';
}

export interface ReparentParams {
	bAllOrNothing: boolean;
	lockConnectionAsParent?: boolean;
	operations: ReparentOperation[];
	version: '1.0';
}

export interface ReparentSourceItem {
	physicalId: string;
	instance?: string;
	pathArray?: string[];
	mode?: 'CutPaste';
}

export interface InsertExistingProductOperation {
	parent: {
		isInstanceOf: string;
		children: string[];
	};
	child: {
		isInstanceOf: string;
	};
}

export interface InsertExistingProductParams {
	version: '1.0';
	bAllOrNothing: boolean;
	lockConnectionAsParent: boolean;
	operations: InsertExistingProductOperation[];
}

export interface InsertExistingProductResult {
	status: string;
	parent: string;
	child: string;
	instance?: string;
	instanceName?: string;
	messages?: string[];
}

export interface InsertExistingProductResponse {
	status: string;
	results?: InsertExistingProductResult[];
}

export interface DuplicateProductItem {
	physicalid: string;
	name: string;
	revision: string;
	typeDisplayName: string;
	current: string;
	imageUrl: string;
}

export interface DuplicateProductOptionsParams {
	data: DuplicateProductItem[];
	command: 'duplicate';
}

export interface DuplicateProductOptionsResponse {
	status?: string;
	report?: unknown[];
	results?: unknown[];
	hasExtProviders?: Array<{ physicalid: string }>;
}

export interface DuplicateStructureOption {
	key: string;
	value: string | boolean;
	usingAdvancedDuplicate?: boolean;
}

export interface DuplicateStructureParams {
	data: Array<{ physicalid: string }>;
	options: DuplicateStructureOption[];
	folderid: null;
	NLVEnabled: string;
	includeDrawings: boolean;
	keepConfig: boolean;
	excludeComposeeTypes: string[];
	notificationTimeout: number;
	metrics: {
		UXName: string;
		client_app_domain: string;
		client_app_name: string;
	};
}

export interface DuplicateStructureResult {
	physicalid: string;
	sourceid: string;
	isRoot: boolean;
}

export interface DuplicateStructureResponse {
	status?: string;
	report?: unknown[];
	results?: DuplicateStructureResult[][];
}

export interface MaturityObjectParams {
	physicalid: string;
	name: string;
	displayName: string;
	type: string;
	serviceId: string;
	typeDisplayName: string;
	current: string;
	current_internal: string;
	revision: string;
	tenant: string;
	imageUrl: string;
	cadMaster: string;
	locked: boolean;
	lockedBy: string;
	policy: string;
	reservedby: string;
	coretype?: string;
}

export interface StateTransition {
	targetState: string;
	sourceState: string;
	signatures: Array<{
		name: string;
		username: string;
	}>;
}

export interface MaturityState {
	stateSysName: string;
	stateUserName: string;
	activeColor: string;
	inactiveColor: string;
	visuorder: number;
}

export interface StateGraphResponse {
	data?: {
		objects?: Array<
			MaturityObjectParams & {
				routes?: Array<{
					fromState: string;
					toState: string;
					action: string;
					status: string;
				}>;
				current_internal?: string;
			}
		>;
		policies?: Array<{
			name: string;
			maturityGraph: {
				transitions: StateTransition[];
				states: MaturityState[];
			};
		}>;
	};
	status?: {
		code: number;
		errorMsg: string | null;
	};
}

export interface PromoteMaturityParams {
	physicalid: string;
	tostate: string;
	fromstate: string;
	type?: string;
	revision?: string;
	policy: string;
	name?: string;
	coretype?: string;
	signature: string;
	cadMaster?: string;
}

// 解析 attributes 数组为对象
export function parsePartInfo(rawData: PartInfoRaw): PartInfo {
	const partInfo: PartInfo = {
		'ds6w:label': '',
		'type_icon_url': '',
		'ds6w:globalType': '',
		'ds6w:cadMaster': '',
		'ds6wg:EnterpriseExtension.V_PartNumber': '',
		'ds6w:reservedBy': '',
		'ds6w:type': '',
		'ds6w:responsible': '',
		'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity': '',
		'ds6wg:revision': '',
		'thumbnail_2d': '',
		'ds6w:policy': '',
		'ds6w:modified': '',
		'owner': '',
		'resourceid': '',
		'ds6w:description': '',
		'ds6w:reserved': '',
		'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity': '',
		'ds6w:isLastRevision': '',
		'ds6w:identifier': '',
		'ds6wg:MaterialUsageExtension.DeclaredQuantity': '',
		'ds6w:manufacturable': '',
		'ds6w:status': '',
		'ds6w:created': '',
		'preview_url': ''
	};

	if (rawData.attributes && Array.isArray(rawData.attributes)) {
		rawData.attributes.forEach(attr => {
			partInfo[attr.name] = attr.value;
		});
	}

	return partInfo;
}

class PartDetailAPI {
	/**
	 * 获取零件详情
	 * @param physicalId 零件的 physicalid
	 * @returns 零件详情
	 */
	async getPartDetail(physicalId: string): Promise<{ infos: PartDetailResponse['infos']; results: PartInfo[] }> {
		const baseInfoStore = useBaseInfoStore();

		// 确保已经获取了 3DSpace URL 和 SecurityContext
		if (!baseInfoStore.spaceUrl) {
			console.log('[PartDetailAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[PartDetailAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const currentUser = baseInfoStore.currentUser || 'admin_platform';
		const spaceUrl = baseInfoStore.spaceUrl;
		const securityContext = baseInfoStore.securityContext;

		// 构建请求 URL（使用 cvservlet/fetch/v2 接口）
		const endpoint = '/cvservlet/fetch/v2';
		const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext || '')}`;
		const fullUrl = `${spaceUrl}${url}`;

		console.log('[PartDetailAPI] 获取零件详情 URL:', fullUrl);
		console.log('[PartDetailAPI] SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 零件 physicalId:', physicalId);

		// 构建请求参数
		const params: PartDetailParams = {
			select_file: ['icon', 'thumbnail_2d'],
			fcs_url_mode: 'REDIRECT',
			label: `xEngineer-${currentUser}-${Date.now()}`,
			physicalid: [physicalId],
			locale: 'zh',
			tenant: 'OnPremise',
			select_predicate: [
				'physicalid',
				'ds6w:label',
				'ds6w:description',
				'ds6w:identifier',
				'ds6w:modified',
				'ds6w:created',
				'ds6wg:EnterpriseExtension.V_PartNumber',
				'ds6w:type',
				'ds6w:responsible',
				'ds6wg:revision',
				'ds6w:cadMaster',
				'ds6w:reserved',
				'ds6w:reservedBy',
				'ds6w:status',
				'owner',
				'ds6wg:MaterialUsageExtension.DeclaredQuantity',
				'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity',
				'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity',
				'ds6wg:raw_material.v_dimensiontype',
				'type',
				'ds6w:policy',
				'ds6w:globalType',
				'ds6w:manufacturable',
				'pathsr',
				'ds6w:isLastRevision'
			]
		};

		console.log('[PartDetailAPI] 请求参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>);
			console.log('[PartDetailAPI] 零件详情响应:', response);

			// 解析响应数据
			const rawResponse = response as PartDetailResponse;
			const parsedResults: PartInfo[] = [];

			if (rawResponse.results && Array.isArray(rawResponse.results)) {
				rawResponse.results.forEach(item => {
					parsedResults.push(parsePartInfo(item));
				});
			}

			return {
				infos: rawResponse.infos,
				results: parsedResults
			};
		} catch (error) {
			console.error('[PartDetailAPI] 获取零件详情失败:', error);
			throw error;
		}
	}

	async setPartNumbers(references: Array<{ physicalid: string; partNumber: string }>): Promise<unknown> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[PartDetailAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[PartDetailAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext;
		const endpoint = '/resources/v1/partnumbermanagement/setPartNumbers';
		const url = `${endpoint}?tenant=OnPremise`;
		const params: SetPartNumbersParams = {
			references: references.map(item => ({
				physicalid: item.physicalid,
				OperationPerformed: 'Request',
				partNumber: item.partNumber
			})),
			SkipAllRevSameEINCheck: 'True'
		};

		console.log('[PartDetailAPI] 设置企业项目编号 URL:', url);
		console.log('[PartDetailAPI] 设置企业项目编号 SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 设置企业项目编号参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.put(url, params as unknown as Record<string, unknown>, {
				SecurityContext: securityContext || ''
			});
			console.log('[PartDetailAPI] 设置企业项目编号响应:', response);
			return response;
		} catch (error) {
			console.error('[PartDetailAPI] 设置企业项目编号失败:', error);
			throw error;
		}
	}

	async reparentParts(
		sourceItems: Array<string | ReparentSourceItem>,
		targetPhysicalId: string,
		children: string[] = [],
		targetPathArray?: string[]
	): Promise<unknown> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[PartDetailAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[PartDetailAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext || '';
		const endpoint = '/resources/product/authoring/reparent';
		const url = `${endpoint}?securityContext=${encodeURIComponent(securityContext)}&tenant=OnPremise&xrequestedwith=xmlhttprequest`;
		const operations: ReparentOperation[] = sourceItems.map(item => {
			const sourceItem = typeof item === 'string' ? { physicalId: item } : item;
			const operation: ReparentOperation = {
				source: {
					instance: sourceItem.instance || '',
					isInstanceOf: sourceItem.physicalId
				},
				target: {
					isInstanceOf: targetPhysicalId,
					pathArray: targetPathArray?.length ? targetPathArray : [targetPhysicalId]
				}
			};

			if (sourceItem.pathArray?.length) {
				operation.source.pathArray = sourceItem.pathArray;
			}
			if (sourceItem.mode) {
				operation.mode = sourceItem.mode;
			}
			if (!sourceItem.mode && children.length) {
				operation.target.children = children;
			}
			return operation;
		});
		const params: ReparentParams = {
			bAllOrNothing: true,
			lockConnectionAsParent: false,
			operations,
			version: '1.0'
		};

		console.log('[PartDetailAPI] 插入子级 URL:', url);
		console.log('[PartDetailAPI] 插入子级 SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 插入子级参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>, {
				SecurityContext: securityContext
			});
			console.log('[PartDetailAPI] 插入子级响应:', response);
			return response;
		} catch (error) {
			console.error('[PartDetailAPI] 插入子级失败:', error);
			throw error;
		}
	}

	async insertExistingProducts(operations: InsertExistingProductOperation[]): Promise<InsertExistingProductResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[PartDetailAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[PartDetailAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext || '';
		const endpoint = '/resources/product/instances/';
		const url = `${endpoint}?securityContext=${encodeURIComponent(securityContext)}`;
		const params: InsertExistingProductParams = {
			version: '1.0',
			bAllOrNothing: false,
			lockConnectionAsParent: false,
			operations
		};

		console.log('[PartDetailAPI] 插入现有产品 URL:', url);
		console.log('[PartDetailAPI] 插入现有产品 SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 插入现有产品参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>, {
				SecurityContext: securityContext
			});
			console.log('[PartDetailAPI] 插入现有产品响应:', response);
			return response as InsertExistingProductResponse;
		} catch (error) {
			console.error('[PartDetailAPI] 插入现有产品失败:', error);
			throw error;
		}
	}

	async duplicateProducts(data: DuplicateProductItem[]): Promise<DuplicateProductOptionsResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[PartDetailAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[PartDetailAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext || '';
		const endpoint = '/resources/lifecycle/duplicate/options';
		const url = `${endpoint}?tenant=OnPremise&xrequestedwith=xmlhttprequest`;
		const params: DuplicateProductOptionsParams = {
			data,
			command: 'duplicate'
		};

		console.log('[PartDetailAPI] 插入重复项 URL:', url);
		console.log('[PartDetailAPI] 插入重复项 SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 插入重复项参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>, {
				SecurityContext: securityContext
			});
			console.log('[PartDetailAPI] 插入重复项响应:', response);
			return response as DuplicateProductOptionsResponse;
		} catch (error) {
			console.error('[PartDetailAPI] 插入重复项失败:', error);
			throw error;
		}
	}

	async duplicateStructure(data: Array<{ physicalid: string }>, prefix: string, wholeStructure: boolean): Promise<DuplicateStructureResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[PartDetailAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[PartDetailAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext || '';
		const endpoint = '/resources/lifecycle/duplicate/structure';
		const url = `${endpoint}?tenant=OnPremise&xrequestedwith=xmlhttprequest`;
		const params: DuplicateStructureParams = {
			data,
			options: [
				{
					key: 'wholeStructure',
					value: wholeStructure
				},
				{
					key: 'prefix',
					value: prefix
				},
				{
					key: 'advanced',
					value: true,
					usingAdvancedDuplicate: false
				}
			],
			folderid: null,
			NLVEnabled: '',
			includeDrawings: false,
			keepConfig: false,
			excludeComposeeTypes: [],
			notificationTimeout: 600,
			metrics: {
				UXName: 'Duplicate',
				client_app_domain: '3DEXPERIENCE 3DDashboard',
				client_app_name: 'ENXENG_AP'
			}
		};

		console.log('[PartDetailAPI] 复制结构 URL:', url);
		console.log('[PartDetailAPI] 复制结构 SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 复制结构参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>, {
				SecurityContext: securityContext
			});
			console.log('[PartDetailAPI] 复制结构响应:', response);
			return response as DuplicateStructureResponse;
		} catch (error) {
			console.error('[PartDetailAPI] 复制结构失败:', error);
			throw error;
		}
	}

	async getStateGraph(data: MaturityObjectParams[]): Promise<StateGraphResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext || '';
		const endpoint = '/resources/lifecycle/maturity/getStateGraph';
		const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext)}`;
		const params = {
			data,
			metrics: {
				UXName: 'Maturity',
				client_app_domain: '3DEXPERIENCE 3DDashboard',
				client_app_name: 'ENXENG_AP'
			}
		};

		const response = await http.post(url, params, {
			SecurityContext: securityContext
		});
		return response as StateGraphResponse;
	}

	async promoteMaturity(params: PromoteMaturityParams[]): Promise<unknown> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			await baseInfoStore.getCollaborativeSpace();
		}

		const securityContext = baseInfoStore.securityContext || '';
		const endpoint = '/resources/lifecycle/maturity/promote';
		const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext)}`;
		const body = { data: params };

		console.log('[PartDetailAPI] 修改成熟度状态 URL:', url);
		console.log('[PartDetailAPI] 修改成熟度状态 SecurityContext:', securityContext);
		console.log('[PartDetailAPI] 修改成熟度状态参数:', JSON.stringify(body, null, 2));

		const response = await http.post(url, body, {
			SecurityContext: securityContext
		});
		return response;
	}
}

export default new PartDetailAPI();
