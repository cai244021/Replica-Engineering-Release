/**
 * collab 模块类型定义
 * 协作服务相关接口
 */

/** 子类型信息 */
export interface SubTypeInfo {
	name: string;
	nls: string;
	package: string;
	icon: string;
}

/** 属性项 */
export interface CollabAttributeItem {
	name: string;
	type: string;
	nls: string;
	value: string | number | boolean;
	authorizedValuesRequired?: boolean;
	visible?: boolean;
	isReadOnly?: boolean;
	modified?: boolean;
	mandatory?: boolean;
	maxlength?: number;
	positionUI?: number;
	positionGroup?: number;
	basicAttribute?: boolean;
	multiline?: boolean;
	forbiddenChar?: string;
	range?: string[];
	rangeNLS?: string[];
}

/** 创建请求属性 */
export interface CreateAttributes {
	internalAttributes: unknown[];
	publicAttributes: CollabAttributeItem[];
	extensionAttributes: unknown[];
	filteredAttributes: {
		name: string;
		value: string;
		authorizedValuesRequired?: boolean;
		basicAttribute?: boolean;
	}[];
	volatileAttributes?: Record<string, unknown>[];
}

/** 指标信息 */
export interface Metrics {
	UXName: string;
	client_app_domain: string;
	client_app_name: string;
}

/** 基本属性 */
export interface CollabBasicAttributes {
	physicalid: string;
	minorOrder: string;
	type: string;
	revision: string;
	majorOrder: string;
	policy: string;
}

/** 创建项 */
export interface CreateItem {
	type: string;
	integrityToken: string;
	subTypes: SubTypeInfo[];
	interfaces: unknown[];
	attributes: CreateAttributes;
	basicAttributes?: CollabBasicAttributes;
}

/** 创建内容完整请求参数（包含 metrics） */
export interface CreateContentRequest {
	create: CreateItem[];
	metrics: Metrics;
}

/** 创建内容请求参数 */
export interface CreateContentParams {
	create: CreateItem[];
}

/** 创建内容查询参数 */
export interface CreateContentQueryParams {
	tenant?: string;
	appName?: string;
	typeName: string;
	parsed?: string;
	activeFolder?: string;
	xrequestedwith?: string;
}

/** 数据元素 */
export interface DataElements {
	objectId: string;
	name: string;
	revision: string;
	title: string;
	description: string;
	policy: string;
	owner: string;
	organization: string;
	project: string;
	state: string;
	discipline?: string;
	usage?: string;
	modified: string;
}

/** 创建内容响应数据 */
export interface CreateContentResponse {
	result: {
		type: string;
		dataelements: DataElements;
		relatedObjects: Record<string, unknown>;
	};
}
