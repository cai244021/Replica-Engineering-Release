import { useBaseInfoStore } from '@/store';
import { http } from '@/utils/ds-request';
import { requirejsPromise } from '@widget-lab/3ddashboard-utils';

// CSRF Token 响应接口
export interface CSRFResponse {
	success: boolean;
	statusCode: number;
	csrf: {
		name: string;
		value: string;
	};
	data: unknown[];
	masks: unknown[];
	definitions: unknown[];
}

// CheckinTicket 响应接口
export interface CheckinTicketResponse {
	success: boolean;
	statusCode: number;
	csrf: {
		name: string;
		value: string;
	};
	items: number;
	data: Array<{
		dataelements: {
			ticketURL: string;
			ticketparamname: string;
			ticket: string;
		};
		children: unknown[];
	}>;
	masks: unknown[];
	definitions: unknown[];
}

// FCS Stores 响应接口
export interface FCSStoresResponse {
	stores: Array<{
		name: string;
		url: string;
	}>;
}

// FCS 上传响应接口
export interface FCSUploadResponse {
	data: Array<{
		receipt: string;
	}>;
}

// 创建文档请求参数
export interface CreateDocumentParams {
	csrf: {
		name: string;
		value: string;
	};
	data: Array<{
		dataelements: {
			title: string;
			description: string;
			parentId: string;
			parentRelName: string;
			parentDirection: string;
		};
		relateddata: {
			files: Array<{
				dataelements: {
					title: string;
					comments: string;
					receipt: string;
				};
			}>;
		};
		type: string;
		tempId: string;
	}>;
}

// 创建文档响应接口
export interface CreateDocumentResponse {
	success: boolean;
	statusCode: number;
	csrf?: {
		name: string;
		value: string;
	};
	items?: number;
	data?: Array<{
		id: string;
		type: string;
		identifier: string;
		source: string;
		relativePath: string;
		tempId: string;
		cestamp: string;
		dataelements: {
			name: string;
			policy: string;
			state: string;
			stateNLS: string;
			typeNLS: string;
			revision: string;
			isLatestRevision: string;
			title: string;
			description: string;
			collabspace: string;
			collabSpaceTitle: string;
			originated: string;
			modified: string;
			comments: string;
			hasDownloadAccess: string;
			hasReviseAccess: string;
			hasModifyAccess: string;
			hasDeleteAccess: string;
			reservedby: string;
			secondaryTitle: string;
			typeicon: string;
			image: string;
			parentId: string;
		};
		relateddata: {
			files: Array<{
				id: string;
				type: string;
				identifier: string;
				source: string;
				relativePath: string;
				relId: string;
				cestamp: string;
				dataelements: {
					title: string;
					name: string;
					comments: string;
					locker: string;
					fileType: string;
					dimension: string;
					length: string;
					revision: string;
					originated: string;
					modified: string;
					fileSize: string;
					fileChecksum: string;
					format: string;
					image: string;
				};
			}>;
		};
	}>;
	masks: unknown[];
	definitions: unknown[];
	error?: string;
	internalError?: string;
}

class DocumentAPI {
	/**
	 * 步骤1: 获取 CheckinTicket
	 * 接口: PUT /3dspace/resources/v1/modeler/documents/files/CheckinTicket?tenant=OnPremise
	 * 使用写死的 CSRF Token 请求，从响应中获取新的 CSRF Token
	 */
	async getCheckinTicket(): Promise<CheckinTicketResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[DocumentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		const spaceUrl = baseInfoStore.spaceUrl;
		const url = `/resources/v1/modeler/documents/files/CheckinTicket?tenant=OnPremise`;
		const fullUrl = `${spaceUrl}${url}`;

		console.log('[DocumentAPI] 获取 CheckinTicket URL:', fullUrl);

		// 构建请求体 - CSRF Token 直接写死（按照 HAR 格式）
		const body = {
			csrf: {
				name: 'ENO_CSRF_TOKEN',
				value: '3N94-4J61-FZW2-OAJB-JOK1-2KEB-WAX0-LL7W'
			}
		};

		try {
			const response = await http.put(url, body);
			console.log('[DocumentAPI] CheckinTicket 响应:', response);
			return response as CheckinTicketResponse;
		} catch (error) {
			console.error('[DocumentAPI] 获取 CheckinTicket 失败:', error);
			throw error;
		}
	}

	/**
	 * 步骤2: 获取 FCS Stores 信息
	 * 接口: GET /3dspace/resources/fcsservices/stores
	 * 用于获取 FCS 服务器地址前缀
	 */
	async getFCSStores(): Promise<FCSStoresResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[DocumentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		const spaceUrl = baseInfoStore.spaceUrl;
		const url = `/resources/fcsservices/stores`;
		const fullUrl = `${spaceUrl}${url}`;

		console.log('[DocumentAPI] 获取 FCS Stores URL:', fullUrl);

		try {
			const response = await http.get(url);
			console.log('[DocumentAPI] FCS Stores 响应:', response);
			return response as FCSStoresResponse;
		} catch (error) {
			console.error('[DocumentAPI] 获取 FCS Stores 失败:', error);
			throw error;
		}
	}

	/**
	 * 步骤3: 上传文件到 FCS
	 * 接口: POST {ticketURL}?xrequestedwith=xmlhttprequest
	 * 使用 CheckinTicket 返回的 ticketURL 直接上传文件
	 * 注意: FCS 返回的是纯文本 receipt，不是 JSON
	 */
	async uploadFileToFCS(ticket: string, file: File, ticketURL: string): Promise<FCSUploadResponse> {
		// 直接使用 CheckinTicket 返回的 ticketURL，添加查询参数
		const uploadUrl = `${ticketURL}?xrequestedwith=xmlhttprequest`;

		console.log('[DocumentAPI] FCS 上传 URL:', uploadUrl);
		console.log('[DocumentAPI] 上传文件:', file.name, '大小:', file.size);

		// 构建 FormData
		const formData = new FormData();
		formData.append('__fcs__jobTicket', ticket);
		formData.append('file_0', file);

		try {
			// 使用原生 fetch 进行文件上传，因为需要 multipart/form-data
			const WAFData = await requirejsPromise('DS/WAFData/WAFData');

			return new Promise((resolve, reject) => {
				WAFData.authenticatedRequest(uploadUrl, {
					// 不设置 type，让 WAFData 自动处理响应类型
					method: 'POST',
					headers: {
						'X-Requested-With': 'XMLHttpRequest'
						// 注意: 不要设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
					},
					data: formData,
					onComplete: (res: unknown) => {
						console.log('[DocumentAPI] FCS 上传响应:', res);
						// FCS 返回的是纯文本 receipt，需要包装成对象
						const receipt = typeof res === 'string' ? res : String(res);
						resolve({ data: [{ receipt }] } as FCSUploadResponse);
					},
					onFailure: (error: unknown) => {
						console.error('[DocumentAPI] FCS 上传失败:', error);
						reject(error);
					}
				});
			});
		} catch (error) {
			console.error('[DocumentAPI] 上传文件到 FCS 失败:', error);
			throw error;
		}
	}

	/**
	 * 步骤4: 创建文档对象
	 * 接口: POST /3dspace/resources/v1/modeler/documents/?tenant=OnPremise
	 * 在系统中创建文档对象并关联上传的文件
	 */
	async createDocument(params: CreateDocumentParams): Promise<CreateDocumentResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[DocumentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		const spaceUrl = baseInfoStore.spaceUrl;
		const url = `/resources/v1/modeler/documents/?tenant=OnPremise`;
		const fullUrl = `${spaceUrl}${url}`;

		console.log('[DocumentAPI] 创建文档 URL:', fullUrl);
		console.log('[DocumentAPI] 创建文档参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>);
			console.log('[DocumentAPI] 创建文档响应:', response);
			return response as CreateDocumentResponse;
		} catch (error) {
			console.error('[DocumentAPI] 创建文档失败:', error);
			throw error;
		}
	}

	/**
	 * 完整的文档上传流程
	 * @param file 要上传的文件
	 * @param title 文档标题
	 * @param description 文档描述
	 * @param parentId 父对象ID
	 * @param fileComments 文件备注
	 */
	async uploadDocument(file: File, title: string, description: string, parentId: string, fileComments: string = ''): Promise<CreateDocumentResponse> {
		console.log('[DocumentAPI] 开始文档上传流程');

		try {
			// 步骤1: 获取 CheckinTicket（同时获取 CSRF Token）
			console.log('[DocumentAPI] 步骤1: 获取 CheckinTicket');
			const ticketResponse = await this.getCheckinTicket();
			if (!ticketResponse.success || !ticketResponse.data || ticketResponse.data.length === 0) {
				throw new Error('获取 CheckinTicket 失败');
			}

			// 从响应中获取新的 CSRF Token
			const csrfToken = ticketResponse.csrf.value;
			console.log('[DocumentAPI] 从 CheckinTicket 响应获取 CSRF Token:', csrfToken);

			const ticketData = ticketResponse.data[0].dataelements;
			const ticket = ticketData.ticket;
			const ticketURL = ticketData.ticketURL;
			console.log('[DocumentAPI] CheckinTicket 获取成功, ticketURL:', ticketURL);

			// 步骤2: 上传文件到 FCS（直接使用 ticketURL）
			console.log('[DocumentAPI] 步骤2: 上传文件到 FCS');
			const uploadResponse = await this.uploadFileToFCS(ticket, file, ticketURL);
			if (!uploadResponse.data || uploadResponse.data.length === 0) {
				throw new Error('文件上传到 FCS 失败');
			}
			const receipt = uploadResponse.data[0].receipt;
			console.log('[DocumentAPI] 文件上传成功, receipt:', receipt);

			// 步骤3: 创建文档对象（使用 CheckinTicket 响应中的 CSRF Token）
			console.log('[DocumentAPI] 步骤3: 创建文档对象');
			const tempId = `temp_${Date.now()}${Math.random().toString().slice(2, 17)}`;
			const createParams: CreateDocumentParams = {
				csrf: {
					name: 'ENO_CSRF_TOKEN',
					value: csrfToken
				},
				data: [
					{
						dataelements: {
							title: title,
							description: description,
							parentId: parentId,
							parentRelName: 'SpecificationDocument',
							parentDirection: 'from'
						},
						relateddata: {
							files: [
								{
									dataelements: {
										title: file.name,
										comments: fileComments,
										receipt: receipt
									}
								}
							]
						},
						type: 'Document',
						tempId: tempId
					}
				]
			};

			const createResponse = await this.createDocument(createParams);
			console.log('[DocumentAPI] 文档创建流程完成');
			return createResponse;
		} catch (error) {
			console.error('[DocumentAPI] 文档上传流程失败:', error);
			throw error;
		}
	}

	/**
	 * 关联现有文档到父对象
	 * 接口: POST /3dspace/resources/v1/modeler/documents/?parentRelName=SpecificationDocument&parentDirection=from
	 * @param documentIds 要关联的文档ID数组
	 * @param parentId 父对象ID
	 * @param csrfToken CSRF Token
	 */
	async relateDocuments(documentIds: string[], parentId: string, csrfToken: string): Promise<RelateDocumentsResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[DocumentAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		const url = `/resources/v1/modeler/documents/?parentRelName=SpecificationDocument&parentDirection=from&tenant=OnPremise`;
		const fullUrl = `${baseInfoStore.spaceUrl}${url}`;

		console.log('[DocumentAPI] 关联文档 URL:', fullUrl);
		console.log('[DocumentAPI] 关联文档 IDs:', documentIds);
		console.log('[DocumentAPI] 父对象 ID:', parentId);

		// 构建请求体
		const body = {
			csrf: {
				name: 'ENO_CSRF_TOKEN',
				value: csrfToken
			},
			data: documentIds.map(docId => ({
				id: docId,
				updateAction: 'NONE',
				relateddata: {
					parents: [
						{
							id: parentId,
							updateAction: 'CONNECT'
						}
					]
				}
			}))
		};

		try {
			const response = await http.post(url, body);
			console.log('[DocumentAPI] 关联文档响应:', response);
			return response as RelateDocumentsResponse;
		} catch (error: any) {
			console.error('[DocumentAPI] 关联文档失败:', error);
			// 如果 ds-request.ts 已解析出业务错误响应体（含 error 字段），直接返回
			if (error && typeof error === 'object' && error.error !== undefined) {
				return error as RelateDocumentsResponse;
			}
			const errorMessage = typeof error === 'string' ? error : error?.message || '关联文档失败';
			return {
				success: false,
				statusCode: 400,
				error: errorMessage,
				data: []
			} as RelateDocumentsResponse;
		}
	}
}

// 关联文档响应
export interface RelateDocumentsResponse {
	success: boolean;
	statusCode: number;
	data?: Array<{
		id: string;
		type: string;
		identifier: string;
	}>;
	error?: string;
	internalError?: string;
}

export default new DocumentAPI();
