import { searchHttp } from '@/utils/ds-request';
import { useBaseInfoStore } from '@/store';

// 搜索请求参数接口
export interface SearchParams {
	label: string;
	nresults: number;
	order_by: string;
	order_field: string;
	query: string;
	select_predicate: string[];
	select_file: string[];
	start: string;
	tenant: string;
	with_indexing_date: boolean;
	with_nls: boolean;
	source: string[];
}

// 属性项接口
export interface AttributeItem {
	format: string;
	name: string;
	type: string;
	value: string;
	field?: string;
}

// 搜索结果项接口（原始格式）
export interface SearchResultItem {
	attributes: AttributeItem[];
}

// 搜索响应接口
export interface SearchResponse {
	results: SearchResultItem[];
	infos: {
		estimated: boolean;
		nresults: number;
		nmatches: number;
		nhits: number;
		version: string;
		next_start?: string;
		sources?: any[];
	};
}

class SearchAPI {
	/**
	 * 搜索我的产品
	 * @param params 搜索参数
	 * @returns 搜索结果
	 */
	async searchMyProducts(params: Partial<SearchParams> = {}): Promise<SearchResponse> {
		const baseInfoStore = useBaseInfoStore();

		// 获取当前用户信息
		const currentUser = baseInfoStore.currentUser || 'admin_platform';

		// 默认搜索参数
		const defaultParams: SearchParams = {
			label: `xEngineer-${currentUser}-${Date.now()}`,
			nresults: 40,
			order_by: 'desc',
			order_field: 'ds6w:modified',
			query: `[flattenedtaxonomies]:types/VPMReference AND [owner]:${currentUser}`,
			select_predicate: [
				'physicalid',
				'ds6w:label',
				'ds6w:description',
				'ds6w:identifier',
				'ds6w:modified',
				'ds6w:created',
				'ds6wg:EnterpriseExtension.V_PartNumber',
				'ds6w:type',
				'ds6w:responsible',
				'ds6wg:revision',
				'ds6w:cadMaster',
				'ds6w:reserved',
				'ds6w:reservedBy',
				'ds6w:status',
				'ds6w:cadMaster'
			],
			select_file: ['icon', 'thumbnail_2d'],
			start: '0',
			tenant: 'OnPremise',
			with_indexing_date: true,
			with_nls: true,
			source: ['3dspace']
		};

		// 合并用户传入的参数
		const finalParams = { ...defaultParams, ...params };

		// 获取搜索服务 URL
		const searchUrl = baseInfoStore.searchUrl;
		console.log('[SearchAPI] 当前搜索服务 URL:', searchUrl);
		console.log('[SearchAPI] 当前 3DSpace URL:', baseInfoStore.spaceUrl);

		// 构建完整的接口地址
		// 搜索接口地址是 /search（不是 /3dsearch/search）
		const searchEndpoint = '/search';
		const fullUrl = `${searchUrl || baseInfoStore.spaceUrl}${searchEndpoint}`;
		console.log('[SearchAPI] 完整请求地址:', fullUrl);
		console.log('[SearchAPI] 请求参数:', JSON.stringify(finalParams, null, 2));

		try {
			const response = await searchHttp.post(searchEndpoint, finalParams as unknown as Record<string, unknown>);
			console.log('[SearchAPI] 搜索响应:', response);
			return response as SearchResponse;
		} catch (error) {
			console.error('[SearchAPI] 搜索请求失败:', error);
			throw error;
		}
	}

	/**
	 * 使用自定义查询搜索产品
	 * @param query 自定义查询语句
	 * @param params 其他参数
	 * @returns 搜索结果
	 */
	async searchWithQuery(query: string, params: Partial<SearchParams> = {}): Promise<SearchResponse> {
		return this.searchMyProducts({
			...params,
			query
		});
	}
}

export default new SearchAPI();
