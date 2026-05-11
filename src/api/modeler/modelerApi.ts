/**
 * modeler 模块 API
 * 建模服务 - 3D零件模板设置
 */

import BaseAPI from '../base';
import type {
	GetCADOriginsTypesParams,
	GetCADOriginsTypesResponse,
	Set3DPartTemplateParams,
	Set3DPartTemplateResponse,
	Set3DPartTemplateQueryParams
} from './modelerTypes';

class ModelerAPI extends BaseAPI {
	constructor() {
		super('');
	}

	/**
	 * 设置3D零件模板表达式
	 * URL: /resources/v1/modelerServices/authoring/op/set3DPartTemplateExpression
	 * Method: POST
	 * @param data 请求体
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async set3DPartTemplateExpression(data: Set3DPartTemplateParams, query?: Set3DPartTemplateQueryParams, headers?: Record<string, string>) {
		try {
			const queryParams = new URLSearchParams({
				tenant: query?.tenant || 'OnPremise',
				xrequestedwith: query?.xrequestedwith || 'xmlhttprequest'
			}).toString();

			const response = await this.post<Set3DPartTemplateResponse>(
				`/resources/v1/modelerServices/authoring/op/set3DPartTemplateExpression?${queryParams}`,
				data as unknown as Record<string, unknown>,
				{ headers }
			);
			return response;
		} catch (error) {
			console.error('set3DPartTemplateExpression error:', error);
			throw error;
		}
	}

	async getCADOriginsTypes(data: GetCADOriginsTypesParams, headers?: Record<string, string>) {
		try {
			const response = await this.post<GetCADOriginsTypesResponse>(
				'/resources/v1/modelerServices/authoring/op/getCADOriginsTypes',
				data as unknown as Record<string, unknown>,
				{ headers }
			);
			return response;
		} catch (error) {
			console.error('getCADOriginsTypes error:', error);
			throw error;
		}
	}
}

export default new ModelerAPI();
