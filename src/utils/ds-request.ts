import { requirejsPromise } from '@widget-lab/3ddashboard-utils';
const spaceUrl = window.localStorage.getItem('spaceUrl');
import { isDev, baseApi } from './env';

// 3DSpace 基础 URL
let spaceBaseURL = isDev ? baseApi : spaceUrl ? spaceUrl : window.location.href.split('/webapp')[0];
// 搜索服务基础 URL
let searchBaseURL = isDev ? baseApi : spaceUrl ? spaceUrl : window.location.href.split('/webapp')[0];
let defaultSecurityContext = isDev ? 'VPLMProjectLeader.Company Name.Common Space' : '';

import { ElMessage } from 'element-plus';

export function setBaseURL(newBaseURL: any) {
	spaceBaseURL = newBaseURL;
}

export function setSearchBaseURL(newBaseURL: any) {
	searchBaseURL = newBaseURL;
}

export function setDefaultSecurityContext(securityContext: string) {
	defaultSecurityContext = securityContext;
}

const request = async (
	method: string,
	url: string,
	data: any | undefined,
	useSearchBaseURL: boolean = false,
	responseType: 'json' | 'text' = 'json',
	headers?: Record<string, string>
) => {
	const WAFData = await requirejsPromise('DS/WAFData/WAFData');
	let baseURL = useSearchBaseURL ? searchBaseURL : spaceBaseURL;

	// 如果 baseURL 是相对路径（如 /api），则使用当前窗口的 origin
	if (baseURL && baseURL.startsWith('/')) {
		baseURL = window.location.origin + baseURL;
	}

	return new Promise((resolve, reject) => {
		console.log('request baseURL:', baseURL, 'url:', url, 'useSearchBaseURL:', useSearchBaseURL, 'responseType:', responseType);
		WAFData.authenticatedRequest(`${baseURL}${url}`, {
			type: responseType,
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
				'X-3DSLogin-ticket': isDev ? 'RDgyQTgwMDg1RkY2NDcwQkI5QUFCODcxNzhDNUM0Q0Z8YWRtaW5fcGxhdGZvcm18fHx8MHw=' : '',
				...(defaultSecurityContext ? { SecurityContext: defaultSecurityContext } : {}),
				...headers
			},
			data: method == 'POST' || method == 'PUT' ? data : undefined,
			onComplete: (res: any, ...args: any[]) => {
				console.log('WAFData response:', res, 'args:', args);
				// 如果响应是字符串且需要解析为 JSON
				if (responseType === 'json' && typeof res === 'string') {
					try {
						const parsedRes = JSON.parse(res);
						resolve(parsedRes);
					} catch (e) {
						console.warn('Failed to parse response as JSON:', e);
						resolve(res);
					}
				} else {
					resolve(res);
				}
			},
			onFailure(error: any, ...args: any[]) {
				console.error('WAFData request failed:', error, args);
				// 尝试从 args 中提取 JSON 响应体（3DSpace 业务错误通常以 JSON 返回在响应体中）
				let parsedBody: any = null;
				for (const arg of args) {
					if (typeof arg === 'string') {
						try {
							const parsed = JSON.parse(arg);
							if (parsed && (parsed.error !== undefined || parsed.success === false)) {
								parsedBody = parsed;
								break;
							}
						} catch {}
					}
					if (typeof arg === 'object' && arg && (arg.error !== undefined || arg.success === false)) {
						parsedBody = arg;
						break;
					}
				}
				if (parsedBody) {
					reject(parsedBody);
				} else {
					reject(error);
				}
			}
		});
	});
};

const getParams = (obj?: Record<string, unknown>): string => {
	if (!obj) return '';
	let result = '';
	for (const item in obj) {
		if (obj[item] !== undefined && obj[item] !== null) {
			result += `&${item}=${encodeURIComponent(String(obj[item]))}`;
		}
	}
	if (result) {
		result = '?' + result.slice(1);
	}
	return result;
};

// 3DSpace 相关请求（使用 spaceBaseURL）
const get = async (url: string, params?: Record<string, unknown>) => {
	return request('GET', url + getParams(params), undefined, false);
};
const getText = async (url: string, params?: Record<string, unknown>) => {
	return request('GET', url + getParams(params), undefined, false, 'text');
};
const post = async (url: string, data?: Record<string, unknown> | unknown[], headers?: Record<string, string>) => {
	return request('POST', url, JSON.stringify(data), false, 'json', headers);
};
const put = async (url: string, data?: Record<string, unknown>, headers?: Record<string, string>) => {
	return request('PUT', url, JSON.stringify(data), false, 'json', headers);
};
const putForm = async (url: string, data?: Record<string, unknown>, headers?: Record<string, string>) => {
	const params = new URLSearchParams();
	if (data) {
		for (const key in data) {
			if (data[key] !== undefined && data[key] !== null) {
				params.append(key, String(data[key]));
			}
		}
	}
	return request('PUT', url, params.toString(), false, 'json', {
		'Content-Type': 'application/x-www-form-urlencoded',
		...headers
	});
};
const del = async (url: string, params?: Record<string, unknown>) => {
	return request('DELETE', url + getParams(params), undefined, false);
};

// 搜索服务相关请求（使用 searchBaseURL）
const searchGet = async (url: string, params?: Record<string, unknown>) => {
	return request('GET', url + getParams(params), undefined, true);
};
const searchPost = async (url: string, data?: Record<string, unknown>) => {
	return request('POST', url, JSON.stringify(data), true);
};

// 3DDashboard 相关请求（使用当前页面 origin）
const dashboardRequest = async (method: string, url: string, data?: any) => {
	const WAFData = await requirejsPromise('DS/WAFData/WAFData');
	const baseURL = window.location.origin;
	return new Promise((resolve, reject) => {
		WAFData.authenticatedRequest(`${baseURL}${url}`, {
			type: 'json',
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
				...(defaultSecurityContext ? { SecurityContext: defaultSecurityContext } : {})
			},
			data: method === 'POST' || method === 'PUT' ? JSON.stringify(data) : undefined,
			onComplete: (res: any) => resolve(res),
			onFailure: (error: any) => reject(error)
		});
	});
};

const dashboardPost = async (url: string, data?: Record<string, unknown>) => {
	return dashboardRequest('POST', url, data);
};
const dashboardGet = async (url: string) => {
	return dashboardRequest('GET', url);
};

export function getSpaceBaseURL() {
	const url = isDev ? baseApi : spaceUrl ? spaceUrl : window.location.href.split('/webapp')[0];
	if (url && url.startsWith('/')) {
		return window.location.origin + url;
	}
	return url || '';
}

export const http = { get, getText, post, put, putForm, delete: del, dashboardPost, dashboardGet };
export const searchHttp = { get: searchGet, post: searchPost };
export default http;
