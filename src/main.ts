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
import { installGlobalErrorMessage } from './utils/elementMessage';

installGlobalErrorMessage();

const start = () => {
	disableDefaultCSS(true);
	widget.setTitle('');
	(window as any).widget = widget;
	const app = createApp(App);
	for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
		app.component(key, component);
	}
	const pinia = createPinia();

	// 浣跨敤鎸佷箙鍖栨彃浠?	pinia.use(piniaPluginPersistedstate);
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
	// @ts-ignore
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
			label: 'Credential',

			name: 'xPref_CREDENTIAL',
			options: [
				{
					label: 'Common Space - Experimenter',
					respType: 'REGULAR',
					value: 'VPLMExperimenter.Company Name.Common Space'
				},
				{
					label: 'Common Space - Project Leader',
					respType: 'REGULAR',
					value: 'VPLMProjectLeader.Company Name.Common Space'
				},
				{
					label: 'Common Space - Creator',
					respType: 'REGULAR',
					value: 'VPLMCreator.Company Name.Common Space'
				},
				{
					label: 'Common Space - Project Administrator',
					respType: 'ADMIN',
					value: 'VPLMProjectAdministrator.Company Name.Common Space'
				},
				{
					label: 'Default - Admin',
					respType: 'ADMIN',
					value: 'VPLMAdmin.Company Name.Default'
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
 * @Description: 璁剧疆鑷姩鍒锋柊鏃堕棿: -1:涓轰笉鑷姩鍒锋柊 ;鍏朵粬鏁板瓧:鑷姩鍒锋柊鏃堕棿闂撮殧涓哄垎閽?涓嶈缃?榛樿20鍒嗛挓鑷姩鍒锋柊
 */

if (widget) {
	// @ts-ignore
	widget.setMetas({
		autoRefresh: -1
	});
}
widget.addEvent('onRefresh', () => {
	window.location.reload();
	// TODO an application data refresh
	// meaning only refresh dynamic content based on remote data, or after preference changed.
	// we could reload the frame [ window.location.reload() ], but this is not a good practice, since it reset preferences
});
