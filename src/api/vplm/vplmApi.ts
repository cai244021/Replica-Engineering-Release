/**
 * vplm 模块 API
 */

import BaseAPI from '../base';
import type { CreateResponse, VplmQueryResponse, VplmParams, TypeInfoResponse, TypeInfoParams } from './vplmTypes';

class VplmAPI extends BaseAPI {
	constructor() {
		super('');
	}

	/**
	 * 资源接口: getcreatectx
	 * URL: /3dspace/resources/vplmte/getcreatectx
	 * Method: GET
	 */
	async getCreateContext(params?: VplmParams) {
		try {
			const response = await this.get<CreateResponse>('/resources/vplmte/getcreatectx', params);
			return response;
		} catch (error) {
			console.error('getCreateContext error:', error);
			throw error;
		}
	}

	/**
	 * 资源接口: getadmctx
	 * URL: /3dspace/resources/vplmte/getadmctx
	 * Method: GET
	 */
	async getAdmContext(params?: VplmParams) {
		try {
			const response = await this.get<VplmQueryResponse>('/resources/vplmte/getadmctx', params);
			return response;
		} catch (error) {
			console.error('getAdmContext error:', error);
			throw error;
		}
	}

	/**
	 * 资源接口: getallctx
	 * URL: /3dspace/resources/vplmte/getallctx
	 * Method: GET
	 */
	async getAllContext(params?: VplmParams) {
		try {
			const response = await this.get<VplmQueryResponse>('/resources/vplmte/getallctx', params);
			return response;
		} catch (error) {
			console.error('getAllContext error:', error);
			throw error;
		}
	}

	/**
	 * 资源接口: getdgnctx
	 * URL: /3dspace/resources/vplmte/getdgnctx
	 * Method: GET
	 */
	async getDgnContext(params?: VplmParams) {
		try {
			const response = await this.get<VplmQueryResponse>('/resources/vplmte/getdgnctx', params);
			return response;
		} catch (error) {
			console.error('getDgnContext error:', error);
			throw error;
		}
	}

	/**
	 * 资源接口: typeInfo
	 * URL: /3dspace/resources/v1/collabServices/authoring/createContent/typeInfo
	 * Method: POST
	 */
	async getTypeInfo(data: TypeInfoParams, headers?: Record<string, string>) {
		try {
			const response = await this.post<TypeInfoResponse>(
				'/resources/v1/collabServices/authoring/createContent/typeInfo',
				data as unknown as Record<string, unknown>,
				{ headers }
			);
			return response;
		} catch (error) {
			console.error('getTypeInfo error:', error);
			throw error;
		}
	}
}

export default new VplmAPI();
