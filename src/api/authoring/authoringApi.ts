/**
 * authoring 模块 API
 * 内容获取服务 - 获取产品详情
 */

import BaseAPI from '../base';
import type { FetchProductRequest, FetchProductResponse, FetchProductQueryParams } from './authoringTypes';

class AuthoringAPI extends BaseAPI {
	constructor() {
		super('');
	}

	/**
	 * 获取产品详情
	 * URL: /resources/enoauthoring/fetch/v1
	 * Method: POST
	 * @param data 查询请求体
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async fetchProduct(data: FetchProductRequest, query?: FetchProductQueryParams, headers?: Record<string, string>) {
		try {
			// 手动构建查询字符串，确保空格编码为 %20 而不是 +
			const params = {
				SecurityContext: query?.SecurityContext || '',
				tenant: query?.tenant || 'OnPremise',
				xrequestedwith: query?.xrequestedwith || 'xmlhttprequest'
			};
			const queryParams = Object.entries(params)
				.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
				.join('&');

			// 添加 securitycontext 到请求头
			const requestHeaders: Record<string, string> = {
				...headers
			};
			if (query?.SecurityContext) {
				requestHeaders['securitycontext'] = encodeURIComponent(query.SecurityContext);
			}

			const response = await this.post<FetchProductResponse>(
				`/resources/enoauthoring/fetch/v1?${queryParams}`,
				data as unknown as Record<string, unknown>,
				{ headers: requestHeaders }
			);
			return response;
		} catch (error) {
			console.error('fetchProduct error:', error);
			throw error;
		}
	}

	/**
	 * 获取产品完整详情
	 * @param physicalid 物理ID
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async fetchProductFull(physicalid: string, query?: FetchProductQueryParams, headers?: Record<string, string>) {
		const label = `fetchDB-${Date.now()}`;
		const request: FetchProductRequest = {
			label,
			physicalid: [physicalid],
			select_predicate: [
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
			],
			locale: 'zh',
			tenant: 'OnPremise',
			types: ['VPMReference', 'VPMInstance', 'VPMRepReference', '3DShape'],
			extensions: ['XCADExtension', 'EnterpriseExtension', 'MaterialUsageExtension'],
			select_file: ['thumbnail_2d', 'icon'],
			select_pgp: ['Show', 'Hide']
		};
		return this.fetchProduct(request, query, headers);
	}

	/**
	 * 获取产品精简详情
	 * @param physicalid 物理ID
	 * @param query 查询参数
	 * @param headers 请求头
	 */
	async fetchProductLite(physicalid: string, query?: FetchProductQueryParams, headers?: Record<string, string>) {
		const label = `fetchDB-${Date.now()}`;
		const request: FetchProductRequest = {
			label,
			physicalid: [physicalid],
			select_predicate: [
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
			],
			locale: 'zh',
			tenant: 'OnPremise',
			types: ['VPMReference', 'VPMInstance', 'VPMRepReference', '3DShape'],
			extensions: ['XCADExtension', 'EnterpriseExtension', 'MaterialUsageExtension'],
			select_file: ['icon', 'thumbnail_2d'],
			select_pgp: ['Show', 'Hide']
		};
		return this.fetchProduct(request, query, headers);
	}
}

export default new AuthoringAPI();
