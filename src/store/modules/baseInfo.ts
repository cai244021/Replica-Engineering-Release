import { defineStore } from 'pinia';
import { widget, requirejsPromise } from '@widget-lab/3ddashboard-utils';
import { ref } from 'vue';
import { setBaseURL, setDefaultSecurityContext, setSearchBaseURL } from '@/utils/ds-request';
import { isDev, baseApi } from '@/utils/env';

export const useBaseInfoStore = defineStore('baseInfo', {
	state: () => ({
		spaceUrl: ref<string | undefined | any>(isDev ? baseApi : undefined),
		searchUrl: ref<string | undefined | any>(isDev ? baseApi : undefined),
		securityContext: ref<string | undefined | any>(isDev ? 'VPLMProjectLeader.Company Name.Common Space' : undefined),
		// @ts-expect-error parent is provided by the 3DDashboard host
		currentUser: isDev ? 'admin_platform' : parent?.dsUserLogin
	}),
	getters: {},
	actions: {
		async fetchSpaceUrl() {
			// 开发环境下使用本地 baseApi
			if (isDev) {
				console.log('[BaseInfoStore] 开发环境使用本地 baseApi:', baseApi);
				this.spaceUrl = baseApi;
				setBaseURL(this.spaceUrl);
				return this.spaceUrl;
			}

			try {
				const i3DXCompassServices = await requirejsPromise('DS/i3DXCompassServices/i3DXCompassServices');
				return new Promise((resolve, reject): void => {
					i3DXCompassServices.getServiceUrl({
						serviceName: '3DSpace',
						platformId: widget.getValue('x3dPlatformId'),
						onComplete: URLResult => {
							console.log('[BaseInfoStore] The URL of 3DSpace:', URLResult);
							this.spaceUrl = URLResult;
							window.localStorage.setItem('spaceUrl', this.spaceUrl);
							setBaseURL(this.spaceUrl);
							resolve(this.spaceUrl);
							this.getCollaborativeSpace();
						},
						onFailure(error) {
							console.log('[BaseInfoStore] Error while fetching the 3DSpace URL:', error);
							reject();
						}
					});
				});
			} catch {
				console.log('[BaseInfoStore] 开发环境跳过 3DSpace URL 获取');
				this.spaceUrl = baseApi;
				setBaseURL(this.spaceUrl);
				return this.spaceUrl;
			}
		},
		async fetchSearchUrl() {
			// 开发环境下使用本地 baseApi 作为搜索 URL
			if (isDev) {
				console.log('[BaseInfoStore] 开发环境使用本地 baseApi 作为搜索 URL:', baseApi);
				this.searchUrl = baseApi;
				setSearchBaseURL(this.searchUrl);
				return this.searchUrl;
			}

			try {
				const i3DXCompassPlatformServices = await requirejsPromise('DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices');
				return new Promise((resolve, reject): void => {
					i3DXCompassPlatformServices.getServiceUrl({
						serviceName: '3DSearch',
						platformId: widget.getValue('x3dPlatformId'),
						onComplete: (URLResult: string) => {
							console.log('[BaseInfoStore] The URL of 3DSearch:', URLResult);
							this.searchUrl = URLResult;
							window.localStorage.setItem('searchUrl', this.searchUrl);
							setSearchBaseURL(this.searchUrl);
							resolve(this.searchUrl);
						},
						onFailure(error: string) {
							console.log('[BaseInfoStore] Error while fetching the Search URL:', error);
							// 如果获取失败，使用 3DSpace URL 作为备选
							this.searchUrl = this.spaceUrl;
							setSearchBaseURL(this.searchUrl);
							reject();
						}
					});
				});
			} catch {
				console.log('[BaseInfoStore] 获取 3DSearch URL 失败，使用 3DSpace URL 作为备选');
				this.searchUrl = this.spaceUrl;
				setSearchBaseURL(this.searchUrl);
				return this.searchUrl;
			}
		},
		async getCollaborativeSpace() {
			// 开发环境下跳过
			if (isDev) {
				console.log('[BaseInfoStore] 开发环境跳过安全上下文获取');
				return;
			}

			const securityContextURL = '/resources/pno/person/getsecuritycontext';
			const WAFData = await requirejsPromise('DS/WAFData/WAFData');
			return new Promise(resolve => {
				WAFData.authenticatedRequest(`${this.spaceUrl}${securityContextURL}`, {
					type: 'json',
					onComplete: context => {
						this.securityContext = context.SecurityContext;
						setDefaultSecurityContext(this.securityContext);
						resolve(this.securityContext);
					},
					onFailure(error) {
						console.log('[BaseInfoStore] error while fetching the security context:', error);
					}
				});
			});
		}
	}
});
