import { widget, disableDefaultCSS, requirejs, onVisibilityChange } from '@widget-lab/3ddashboard-utils';
import './assets/styles/main.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import i18n from './i18n';

import App from './App.vue';
import router from './router';
import { isDev } from './utils/env';

const start = () => {
	disableDefaultCSS(true);
	widget.setTitle('');
	const app = createApp(App);
	for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
		app.component(key, component);
	}
	const pinia = createPinia();

	// 使用持久化插件
	pinia.use(piniaPluginPersistedstate);
	app.use(pinia);
	app.use(ElementPlus);
	app.use(router);
	app.use(i18n);
	app.mount('app');
	requirejs(['DS/PlatformAPI/PlatformAPI'], (/* PlatformAPI */) => {
		// use 3DDashboard APIs
	});

	onVisibilityChange((/* visibility */) => {
		// widget (or fullpage) visibility has changed
		// you can enable/disable periodic data refresh based on visibility
	});
};

/**
 * Entry point for both standalone & 3DDashboard modes
 */
widget.addEvent('onLoad', () => {
	start();
});
widget.addEvent('onRefresh', () => {
	// TODO an application data refresh
	// meaning only refresh dynamic content based on remote data, or after preference changed.
	// we could reload the frame [ window.location.reload() ], but this is not a good practice, since it reset preferences
});
if (!isDev) {
	//@ts-ignore
	widget.setPreferences([
		{
			disabled: true,
			label: '3DEXPERIENCE Platform',

			name: 'xPref_3DEXPERIENCE_PLATFORM',
			options: [
				{
					label: 'onPremises',
					value: 'OnPremise'
				}
			],
			type: 'list',
			value: 'OnPremise'
		},
		{
			label: '凭据',

			name: 'xPref_CREDENTIAL',
			options: [
				{
					label: 'Common Space ● 供稿人',
					respType: 'REGULAR',
					value: 'VPLMExperimenter.Company Name.Common Space'
				},
				{
					label: 'Common Space ● 领导',
					respType: 'REGULAR',
					value: 'VPLMProjectLeader.Company Name.Common Space'
				},
				{
					label: 'Common Space ● 作者',
					respType: 'REGULAR',
					value: 'VPLMCreator.Company Name.Common Space'
				},
				{
					label: 'Common Space ● 所有者',
					respType: 'ADMIN',
					value: 'VPLMProjectAdministrator.Company Name.Common Space'
				},
				{
					label: 'Default ● 管理员',
					respType: 'ADMIN',
					value: '"VPLMAdmin.Company Name.Default'
				}
			],
			type: 'list',
			value: 'VPLMExperimenter.Company Name.Common Space'
		}
	]);
}

/*
 * @Author: FanWenLong
 * @Date: 2025-11-19 15:31:48
 * @Description: 设置自动刷新时间: -1:为不自动刷新 ;其他数字:自动刷新时间间隔为分钟;不设置:默认20分钟自动刷新
 */

widget &&
	// @ts-ignore
	widget.setMetas &&
	// @ts-ignore
	widget.setMetas({
		autoRefresh: -1
	});
widget.addEvent('onRefresh', () => {
	window.location.reload();
	// TODO an application data refresh
	// meaning only refresh dynamic content based on remote data, or after preference changed.
	// we could reload the frame [ window.location.reload() ], but this is not a good practice, since it reset preferences
});
