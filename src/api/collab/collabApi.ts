/**
 * collab 模块 API
 * 协作服务 - 创建产品、工程图、零件等内容
 */

import BaseAPI from '../base';
import type { CreateContentRequest, CreateContentResponse, CreateContentQueryParams } from './collabTypes';

class CollabAPI extends BaseAPI {
	constructor() {
		super('');
	}

	/**
	 * 创建内容（产品）
	 * URL: /resources/v1/collabServices/authoring/createContent/Create
	 * Method: POST
	 * @param data 创建内容请求体（包含 create 和 metrics）
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async createProduct(data: CreateContentRequest, query?: Omit<CreateContentQueryParams, 'typeName'>, headers?: Record<string, string>) {
		try {
			const queryParams = new URLSearchParams({
				tenant: query?.tenant || 'OnPremise',
				appName: query?.appName || '',
				typeName: 'assembly',
				parsed: query?.parsed || 'false',
				activeFolder: query?.activeFolder || 'false',
				xrequestedwith: query?.xrequestedwith || 'xmlhttprequest'
			}).toString();

			const response = await this.post<CreateContentResponse>(
				`/resources/v1/collabServices/authoring/createContent/Create?${queryParams}`,
				data as unknown as Record<string, unknown>,
				{ headers }
			);
			return response;
		} catch (error) {
			console.error('createProduct error:', error);
			throw error;
		}
	}

	/**
	 * 创建内容（工程图）
	 * URL: /resources/v1/collabServices/authoring/createContent/Create
	 * Method: POST
	 * @param data 创建内容请求体
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async createDrawing(data: CreateContentRequest, query?: Omit<CreateContentQueryParams, 'typeName'>, headers?: Record<string, string>) {
		try {
			const queryParams = new URLSearchParams({
				tenant: query?.tenant || 'OnPremise',
				appName: query?.appName || '',
				typeName: 'drawing',
				parsed: query?.parsed || 'false',
				activeFolder: query?.activeFolder || 'false',
				xrequestedwith: query?.xrequestedwith || 'xmlhttprequest'
			}).toString();

			const response = await this.post<CreateContentResponse>(
				`/resources/v1/collabServices/authoring/createContent/Create?${queryParams}`,
				data as unknown as Record<string, unknown>,
				{ headers }
			);
			return response;
		} catch (error) {
			console.error('createDrawing error:', error);
			throw error;
		}
	}

	/**
	 * 创建内容（零件）
	 * URL: /resources/v1/collabServices/authoring/createContent/Create
	 * Method: POST
	 * @param data 创建内容请求体
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async createComponent(data: CreateContentRequest, query?: Omit<CreateContentQueryParams, 'typeName'>, headers?: Record<string, string>) {
		try {
			const queryParams = new URLSearchParams({
				tenant: query?.tenant || 'OnPremise',
				appName: query?.appName || '',
				typeName: 'component',
				parsed: query?.parsed || 'false',
				activeFolder: query?.activeFolder || 'false',
				xrequestedwith: query?.xrequestedwith || 'xmlhttprequest'
			}).toString();

			const response = await this.post<CreateContentResponse>(
				`/resources/v1/collabServices/authoring/createContent/Create?${queryParams}`,
				data as unknown as Record<string, unknown>,
				{ headers }
			);
			return response;
		} catch (error) {
			console.error('createComponent error:', error);
			throw error;
		}
	}
}

export default new CollabAPI();
