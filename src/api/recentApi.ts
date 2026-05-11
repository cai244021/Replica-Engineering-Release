import { useBaseInfoStore } from '@/store';
import { http } from '@/utils/ds-request';

// 最近记录响应
export interface RecentResponse {
	data: string; // 逗号分隔的 physicalid 列表
}

// 批量获取详情请求参数
export interface FetchDetailsParams {
	select_file: string[];
	fcs_url_mode: string;
	label: string;
	physicalid: string[];
	locale: string;
	tenant: string;
	select_predicate: string[];
}

// 批量获取详情响应
export interface FetchDetailsResponse {
	infos: {
		estimated: boolean;
		nresults: number;
		nmatches: number;
		nhits: number;
		version: string;
	};
	results: Array<{
		sort?: {
			sortValue: string;
			sortType: string;
		};
		attributes: Array<{
			format: string;
			name: string;
			type: string;
			value: string;
			field?: string;
		}>;
	}>;
}

class RecentAPI {
	/**
	 * 获取最近访问的产品ID列表
	 * @returns 逗号分隔的 physicalid 字符串
	 */
	async getRecentIds(): Promise<string> {
		const baseInfoStore = useBaseInfoStore();

		// 确保已经获取了 3DSpace URL
		if (!baseInfoStore.spaceUrl) {
			console.log('[RecentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		const spaceUrl = baseInfoStore.spaceUrl;
		// 使用相对路径，让 request 自动添加 baseURL
		const url = `/resources/AppsMngt/user/preference?name=OnPremise_xEngUserRecents`;
		const fullUrl = `${spaceUrl}${url}`;

		console.log('[RecentAPI] 获取最近记录 URL:', fullUrl);

		try {
			// 使用 getText 发送 GET 请求，获取纯文本响应
			const response = await http.getText(url);
			console.log('[RecentAPI] 最近记录原始响应:', response);

			// 处理不同的响应格式
			let data: string;
			if (typeof response === 'string') {
				data = response;
			} else if (response && typeof response === 'object') {
				// 尝试从对象中获取 data 属性
				const respObj = response as Record<string, unknown>;
				if (respObj.data && typeof respObj.data === 'string') {
					data = respObj.data;
				} else {
					data = JSON.stringify(response);
				}
			} else {
				data = '';
			}

			console.log('[RecentAPI] 解析后的最近记录:', data);
			return data;
		} catch (error) {
			console.error('[RecentAPI] 获取最近记录失败:', error);
			throw error;
		}
	}

	/**
	 * 将新创建的 physicalId 添加到用户最近记录中（排到第一位）
	 * @param physicalId 新创建的物理ID
	 */
	async addRecentId(physicalId: string): Promise<void> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[RecentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		const url = '/resources/AppsMngt/user/preference';

		try {
			// 1. GET 获取现有最近记录
			const existingIds = await http.getText(url, { name: 'OnPremise_xEngUserRecents' });
			console.log('[RecentAPI] 现有最近记录:', existingIds);

			// 2. 拼接新 ID 到最前面（去重，最多保留 20 条）
			let newValue: string;
			const newId = physicalId.toUpperCase();
			if (existingIds && String(existingIds).trim() !== '') {
				const existing = String(existingIds).trim();
				const ids = existing
					.split(',')
					.map(id => id.trim())
					.filter(id => id.length > 0 && id.toUpperCase() !== newId);
				// 最多保留 19 个旧 ID，加上新 ID 共 20 个，超出的截掉末尾
				if (ids.length > 19) {
					ids.length = 19;
				}
				newValue = newId + (ids.length > 0 ? ',' + ids.join(',') : '');
			} else {
				newValue = newId;
			}

			console.log('[RecentAPI] 更新后的最近记录:', newValue);

			// 3. PUT 设置回去（form-urlencoded）
			await http.putForm(url, {
				name: 'OnPremise_xEngUserRecents',
				value: newValue
			});

			console.log('[RecentAPI] 最近记录更新成功');
		} catch (error) {
			console.error('[RecentAPI] 添加最近记录失败:', error);
			// 添加最近记录失败不影响主流程，不抛异常
		}
	}

	/**
	 * 根据 physicalid 列表批量获取产品详情
	 * @param physicalIds physicalid 数组
	 * @returns 产品详情列表
	 */
	async fetchDetailsByIds(physicalIds: string[]): Promise<FetchDetailsResponse> {
		const baseInfoStore = useBaseInfoStore();

		// 确保已经获取了 3DSpace URL 和 SecurityContext
		if (!baseInfoStore.spaceUrl) {
			console.log('[RecentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[RecentAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const spaceUrl = baseInfoStore.spaceUrl;
		const securityContext = baseInfoStore.securityContext;
		const currentUser = baseInfoStore.currentUser || 'admin_platform';

		// 构建带 SecurityContext 的 URL（使用相对路径）
		const endpoint = '/cvservlet/fetch/v2';
		const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext || '')}`;
		const fullUrl = `${spaceUrl}${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext || '')}`;

		console.log('[RecentAPI] 批量获取详情 URL:', fullUrl);
		console.log('[RecentAPI] SecurityContext:', securityContext);
		console.log('[RecentAPI] 请求的 physicalIds:', physicalIds);

		// 构建请求参数
		const params: FetchDetailsParams = {
			select_file: ['icon', 'thumbnail_2d'],
			fcs_url_mode: 'REDIRECT',
			label: `xEngineer-${currentUser}-${Date.now()}`,
			physicalid: physicalIds,
			locale: 'zh',
			tenant: 'OnPremise',
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
				'owner',
				'ds6wg:MaterialUsageExtension.DeclaredQuantity',
				'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity',
				'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity',
				'ds6wg:raw_material.v_dimensiontype',
				'type',
				'ds6w:policy',
				'ds6w:globalType',
				'ds6w:manufacturable',
				'pathsr',
				'ds6w:isLastRevision'
			]
		};

		console.log('[RecentAPI] 请求参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>);
			console.log('[RecentAPI] 批量获取详情响应:', response);
			return response as FetchDetailsResponse;
		} catch (error) {
			console.error('[RecentAPI] 批量获取详情失败:', error);
			throw error;
		}
	}

	/**
	 * 获取最近访问的产品列表（组合接口：先获取ID列表，再获取详情）
	 * @returns 产品详情列表
	 */
	async getRecentProducts(): Promise<FetchDetailsResponse> {
		console.log('[RecentAPI] 开始获取最近产品列表');

		// 第一步：获取最近记录的ID列表
		const recentIdsString = await this.getRecentIds();
		console.log('[RecentAPI] 获取到的最近记录ID字符串:', recentIdsString);

		// 如果没有记录，返回空结果
		if (!recentIdsString || recentIdsString.trim() === '') {
			console.log('[RecentAPI] 最近记录为空');
			return {
				infos: {
					estimated: false,
					nresults: 0,
					nmatches: 0,
					nhits: 0,
					version: '1.1'
				},
				results: []
			};
		}

		// 解析 physicalid 列表（逗号分隔）
		const physicalIds = recentIdsString
			.split(',')
			.map(id => id.trim())
			.filter(id => id.length > 0);

		console.log('[RecentAPI] 解析后的 physicalIds:', physicalIds);

		// 如果没有有效的ID，返回空结果
		if (physicalIds.length === 0) {
			console.log('[RecentAPI] 没有有效的 physicalid');
			return {
				infos: {
					estimated: false,
					nresults: 0,
					nmatches: 0,
					nhits: 0,
					version: '1.1'
				},
				results: []
			};
		}

		// 第二步：根据ID列表获取详情
		return await this.fetchDetailsByIds(physicalIds);
	}
}

export default new RecentAPI();
