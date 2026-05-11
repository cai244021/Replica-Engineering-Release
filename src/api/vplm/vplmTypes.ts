/**
 * vplm 模块类型定义
 */

/** 资源接口: getcreatectx 响应数据 */
export interface CreateResponse {
	isOOTB: string;
	credentials: {
		ctxname: string;
		ctxtitle: string;
		prjname: string;
		prjtitle: string;
		orgname: string;
		[key: string]: unknown;
	}[];
}

/** 资源接口: getadmctx 响应数据 */
export interface VplmQueryResponse {
	isOOTB: string;
	credentials: {
		ctxname: string;
		ctxtitle: string;
		prjname: string;
		prjtitle: string;
		orgname: string;
		[key: string]: unknown;
	}[];
}

/** 模板对象 */
export interface TemplateObject {
	name: string;
	nls?: string;
	filename?: string;
	fileext?: string;
	physicalid?: string;
	isfilebased?: string;
	objtype?: string;
	objname?: string;
	objrevision?: string;
}

/** 可见性配置 */
export interface VisibilityConfig {
	Template?: string[];
}

/** 模板属性 */
export interface TemplateAttribute {
	name: string;
	nls: string;
	value: string;
	range?: string[];
	rangeNLS?: string[];
	rangeGroup?: string[];
	icons?: string[];
	storeLocalPreference?: boolean;
	visible: boolean;
	mandatory?: boolean;
	positionUI?: number;
	positionGroup?: number;
	sortedOptions?: boolean;
	persistData?: {
		templateObjects: TemplateObject[];
		groups: Record<string, string[]>;
	};
	basicAttribute?: boolean;
	visibility?: VisibilityConfig;
	validationService?: string;
	modified?: boolean;
}

/** 基本属性 */
export interface BasicAttributes {
	physicalid: string;
	minorOrder: string;
	type: string;
	revision: string;
	majorOrder: string;
	policy: string;
}

/** 过滤属性项 */
export interface FilteredAttributeItem {
	name: string;
	value: string;
	authorizedValuesRequired?: boolean;
	basicAttribute?: boolean;
}

/** 资源接口: typeInfo 响应数据 */
export interface TypeInfoResponse {
	result: {
		type: string;
		integrityToken: string;
		subTypes: {
			name: string;
			nls: string;
			package: string;
			icon: string;
		}[];
		interfaces: unknown[];
		attributes: {
			internalAttributes: unknown[];
			publicAttributes: unknown[];
			extensionAttributes: unknown[];
			filteredAttributes: FilteredAttributeItem[];
			volatileAttributes: TemplateAttribute[];
		};
		basicAttributes?: BasicAttributes;
	}[];
}

/** typeInfo 请求参数 */
export interface TypeInfoParams {
	type: string;
	preferedType: string;
	typeName: string;
	subTypes: boolean;
	runUXBL: boolean;
	isAdmin?: boolean;
	metrics: {
		UXName: string;
		client_app_domain: string;
		client_app_name: string;
	};
}

/** 通用请求参数 */
export interface VplmParams {
	[key: string]: unknown;
}
