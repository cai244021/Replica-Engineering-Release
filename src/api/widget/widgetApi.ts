/**
 * widget 模块 API
 */

import BaseAPI from '../base';
import request from '@/utils/ds-request';
import type {
	DataResponse,
	ListResponse,
	CredentialsResponse,
	WidgetParams,
	UpdateWidgetInstanceRequest,
	UpdateWidgetInstanceResponse,
	ContextTreeParams,
	ContextTreeResponse
} from './widgetTypes';

class WidgetAPI extends BaseAPI {
	constructor() {
		super('');
	}

	/**
	 * 3DSpace接口: classificationAppsRequire_setting.json
	 */
	async getClassificationApps(params?: WidgetParams) {
		try {
			const response = await this.get<DataResponse>(
				'/3ddashboard/api/widget/proxy/external/ENOPSTE_AP/aHR0cHM6Ly8zZHNwYWNlLnIyMDI2LnY2LmNvbS8zZHNwYWNlL3dlYmFwcHMvRU5PUFNfYXBwL0VOT1BTX2FwcC5odG1s/2e53f246e995ef1927090f3fee7f54e424bb0085/20250926T204014Z/3dspace/webapps/ClassificationsFacet/assets/classificationAppsRequire_setting.json',
				params
			);
			return response;
		} catch (error) {
			console.error('getClassificationApps error:', error);
			throw error;
		}
	}

	/**
	 * 3DSpace接口: library_exclude_columns.json
	 */
	async getLibraryExcludeColumns(params?: WidgetParams) {
		try {
			const response = await this.get<DataResponse>(
				'/3ddashboard/api/widget/proxy/external/ENOPSTE_AP/aHR0cHM6Ly8zZHNwYWNlLnIyMDI2LnY2LmNvbS8zZHNwYWNlL3dlYmFwcHMvRU5PUFNfYXBwL0VOT1BTX2FwcC5odG1s/2e53f246e995ef1927090f3fee7f54e424bb0085/20250926T204014Z/3dspace/webapps/LibraryEditor/assets/library_exclude_columns.json',
				params
			);
			return response;
		} catch (error) {
			console.error('getLibraryExcludeColumns error:', error);
			throw error;
		}
	}

	/**
	 * 3DSpace接口: ContentAppListJson.json
	 */
	async getContentAppList(params?: WidgetParams) {
		try {
			const response = await this.get<ListResponse>(
				'/3ddashboard/api/widget/proxy/external/ENOPSTE_AP/aHR0cHM6Ly8zZHNwYWNlLnIyMDI2LnY2LmNvbS8zZHNwYWNlL3dlYmFwcHMvRU5PUFNfYXBwL0VOT1BTX2FwcC5odG1s/2e53f246e995ef1927090f3fee7f54e424bb0085/20250926T204014Z/3dspace/webapps/RouteWebAppUX/assets/json/ContentAppListJson.json',
				params
			);
			return response;
		} catch (error) {
			console.error('getContentAppList error:', error);
			throw error;
		}
	}

	/**
	 * 资源接口: getSecurityContext
	 */
	async getSecurityContext(params?: WidgetParams) {
		try {
			const response = await this.get<CredentialsResponse>('/resources/pno/person/getsecuritycontext', params);
			return response;
		} catch (error) {
			console.error('getSecurityContext error:', error);
			throw error;
		}
	}

	/**
	 * 更新 Widget 实例
	 * URL: /3ddashboard/api/widget-instances/edit
	 * Method: POST
	 * @param data 更新请求体
	 */
	async editWidgetInstance(data: UpdateWidgetInstanceRequest) {
		try {
			// 使用 dashboardPost 发送请求到 3DDashboard（与 3DSpace 不同域名）
			// 开发环境代理: /dashboard/api/widget-instances/edit -> https://3ddashboard.r2026.v6.com/3ddashboard/api/widget-instances/edit
			// 生产环境直接: https://3ddashboard.r2026.v6.com/3ddashboard/api/widget-instances/edit
			const url = '/api/widget-instances/edit';
			console.log('调用 widget-instances/edit, url:', url);
			const response = await request.dashboardPost(url, data as unknown as Record<string, unknown>);
			console.log('widget-instances/edit 返回:', response);
			return response as UpdateWidgetInstanceResponse;
		} catch (error) {
			console.error('editWidgetInstance error:', error);
			throw error;
		}
	}

	/**
	 * 获取 Widget 实例上下文树（用于获取最近产品数据）
	 * URL: /api/widget-instances/contextTree
	 * Method: GET
	 * @param params 查询参数
	 */
	async getContextTree(params: ContextTreeParams) {
		try {
			// 构建查询字符串
			const queryString = new URLSearchParams({
				contextParent: params.contextParent,
				type: params.type,
				modelId: params.modelId,
				fp: params.fp,
				depth: String(params.depth),
				lang: params.lang
			}).toString();

			const url = `/api/widget-instances/contextTree?${queryString}`;
			console.log('调用 widget-instances/contextTree, url:', url);

			// 使用 dashboardGet 发送请求到 3DDashboard
			const response = await request.dashboardGet(url);
			console.log('widget-instances/contextTree 返回:', response);
			return response as ContextTreeResponse;
		} catch (error) {
			console.error('getContextTree error:', error);
			throw error;
		}
	}
}

export default new WidgetAPI();
