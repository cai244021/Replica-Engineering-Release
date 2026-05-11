/**
 * widget 模块类型定义
 */

/** 3DSpace接口: classificationAppsRequire_setting.json 响应数据 */
export interface DataResponse {
	facets: {
		ipexportControl: {
			require: string;
		};
		library: {
			require: string;
		};
		bookmarks: {
			require: string;
		};
	};
}

/** 3DSpace接口: ContentAppListJson.json 响应数据 */
export interface ListResponse {
	ENOWCHA_AP: string[];
	ENOWCHG_AP: string[];
	ENOPSTR_AP: string[];
	ENXROUT_AP: string[];
}

/** 3DSpace接口: SearchcontrolCenter_TagRelationship.json 响应数据 */
export interface SearchResponse {
	Predicates_Default_AND: string[];
	Predicates_Irrelevant_AND: string[];
}

/** 3DSpace接口: ENOWidgetLinkEvents.json 响应数据 */
export interface QueryResponse {
	SyncFeaturesChange: {
		feature: string;
	};
	UnlinkBIProxy: {
		feature: string;
	};
	ViewPointSync: {
		feature: string;
		syncFeature: string;
	};
	SetViewpointSyncMaster: {
		feature: string;
		syncFeature: string;
	};
	SyncContent: {
		feature: string;
		syncFeature: string;
	};
}

/** 3DSpace接口: pseCtxMenu.json 响应数据 */
export interface CredentialsResponse {
	version: string;
	ctxMenu: string[];
}

/** 通用请求参数 */
export interface WidgetParams {
	[key: string]: unknown;
}

/** X3D Linkability 配置 */
export interface X3dLinkability {
	open: boolean;
	appIds: string[];
	implements: string[];
	uses: string[];
}

/** Widget 实例数据 */
export interface WidgetInstanceData {
	x3dSharedId: string;
	x3dAppId: string;
	x3dPlatformId: string;
	appId: string;
	token: string;
	lang: string;
	_gpid: string;
	syncFeatures: string;
	x3dLinkability: X3dLinkability;
	tenantAware: boolean;
	pad_tenant: string;
	pad_security_ctx: string;
	xPref_CREDENTIAL: string;
	isWorkUnderWIP: boolean;
	WorkUnderConfigData: string;
	ap_custoParams: string;
	ap_custo: string;
}

/** 更新 Widget 实例请求 */
export interface UpdateWidgetInstanceRequest {
	id: string;
	data: WidgetInstanceData;
}

/** Widget 实例结果 */
export interface WidgetInstanceResult {
	id: string;
	parentId: string;
	name: string;
	title: string;
	rank: number;
	coordinates: string;
	data: string;
}

/** 更新 Widget 实例响应 */
export interface UpdateWidgetInstanceResponse {
	nb_result: number;
	result: WidgetInstanceResult;
}

/** Context Tree 查询参数 */
export interface ContextTreeParams {
	contextParent: string;
	type: string;
	modelId: string;
	fp: string;
	depth: number;
	lang: string;
}

/** Context Tree 节点 */
export interface ContextTreeNode {
	id: string;
	parentId?: string;
	name: string;
	title?: string;
	type?: string;
	appId?: string;
	data?: Record<string, unknown>;
	children?: ContextTreeNode[];
	[key: string]: unknown;
}

/** Context Tree 响应 */
export interface ContextTreeResponse {
	result: ContextTreeNode[];
	nb_result?: number;
	total?: number;
}
