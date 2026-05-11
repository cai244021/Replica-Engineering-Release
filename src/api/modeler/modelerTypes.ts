/**
 * modeler 模块类型定义
 * 建模服务相关接口
 */

/** 设置3D零件模板请求数据项 */
export interface Set3DPartTemplateItem {
	type: string;
	UUID: string;
}

/** 设置3D零件模板请求参数 */
export interface Set3DPartTemplateParams {
	data: Set3DPartTemplateItem[];
}

/** 设置3D零件模板查询参数 */
export interface Set3DPartTemplateQueryParams {
	tenant?: string;
	xrequestedwith?: string;
}

/** 设置3D零件模板响应数据 */
export interface Set3DPartTemplateResponse {
	result: {
		type: string;
	};
}
