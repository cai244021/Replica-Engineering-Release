/**
 * authoring 模块类型定义
 * 内容获取服务 - 获取产品详情
 */

/** 获取产品详情请求参数 */
export interface FetchProductRequest {
	/** 查询标签 */
	label: string;
	/** 物理ID数组 */
	physicalid: string[];
	/** 要查询的属性列表 */
	select_predicate: string[];
	/** 语言区域 */
	locale: string;
	/** 租户 */
	tenant: string;
	/** 对象类型列表 */
	types: string[];
	/** 扩展类型列表 */
	extensions: string[];
	/** 文件选择 */
	select_file: string[];
	/** PGP显示选项 */
	select_pgp: string[];
}

/** 属性项 */
export interface AttributeItem {
	name: string;
	value: string;
}

/** 产品结果 */
export interface ProductResult {
	attributes: AttributeItem[];
}

/** 获取产品详情响应 */
export interface FetchProductResponse {
	results: ProductResult[];
}

/** 完整详情查询谓词 */
export const FULL_SELECT_PREDICATE = [
	'physicalid',
	'ds6w:globalType',
	'ds6w:type',
	'ds6w:identifier',
	'ds6w:composed',
	'ds6w:label',
	'ds6wg:revision',
	'ds6w:description',
	'ds6w:responsible',
	'ds6w:reserved',
	'ds6w:cadMaster',
	'ds6w:isLastRevision',
	'ds6w:status',
	'ds6wg:EnterpriseExtension.V_PartNumber',
	'owner',
	'ds6w:reservedBy',
	'ds6w:i3dx',
	'ds6w:modified',
	'ds6w:project',
	'ds6w:created',
	'bo.pgpshowextension.V_PGP_Show'
];

/** 精简详情查询谓词 */
export const LITE_SELECT_PREDICATE = [
	'ds6w:label',
	'ds6w:type',
	'ds6wg:revision',
	'ds6w:status',
	'owner',
	'ds6w:responsible',
	'ds6w:modified',
	'ds6w:project',
	'ds6w:identifier',
	'ds6w:reserved',
	'ds6w:reservedBy',
	'ds6w:i3dx',
	'ds6w:globalType',
	'bo.pgpshowextension.V_PGP_Show'
];

/** 查询参数 */
export interface FetchProductQueryParams {
	/** 安全上下文 */
	SecurityContext?: string;
	/** 租户 */
	tenant?: string;
	/** 请求类型 */
	xrequestedwith?: string;
}
