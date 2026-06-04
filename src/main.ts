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
import VplmAPI from './api/vplm/vplmApi';
import { setBaseURL } from './utils/ds-request';

installGlobalErrorMessage();

interface PreferenceOption {
	label: string;
	value: string;
	respType?: string;
}

interface WidgetPreference {
	disabled?: boolean;
	label: string;
	name: string;
	options?: PreferenceOption[];
	type: 'list' | 'boolean';
	value: string | boolean;
}

interface ContextCredential {
	ctxname?: string;
	ctxtitle?: string;
	prjtitle?: string;
	roletitle?: string;
	[key: string]: unknown;
}

const fallbackCredentialOptions: PreferenceOption[] = [
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
];

const getWidgetValue = (name: string) => {
	try {
		return widget.getValue(name) as string | undefined;
	} catch {
		return undefined;
	}
};

const getCredentialPreferenceValue = (options: PreferenceOption[]) => {
	const widgetData = ((widget.data as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
	const currentValue = [getWidgetValue('xPref_CREDENTIAL'), widgetData.xPref_CREDENTIAL, widgetData.SC].find(
		value => typeof value === 'string' && value.length > 0
	) as string | undefined;
	if (currentValue && options.some(option => option.value === currentValue)) return currentValue;
	return options[0]?.value || fallbackCredentialOptions[0].value;
};

const getWidgetPreferenceValue = (name: string, fallback: string) => {
	const widgetData = ((widget.data as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
	const value = getWidgetValue(name) || widgetData[name];
	return typeof value === 'string' && value.length > 0 ? value : fallback;
};

const getWidgetPreferenceBoolean = (name: string, fallback: boolean) => {
	const widgetData = ((widget.data as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
	const value = widgetData[name] ?? getWidgetValue(name);
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') return value.toLowerCase() === 'true';
	return fallback;
};

const createListPreference = (name: string, label: string, options: PreferenceOption[], fallback: string): WidgetPreference => ({
	label,
	name,
	options,
	type: 'list',
	value: getWidgetPreferenceValue(name, fallback)
});

const createBooleanPreference = (name: string, label: string, fallback: boolean): WidgetPreference => ({
	label,
	name,
	type: 'boolean',
	value: getWidgetPreferenceBoolean(name, fallback)
});

const buildPreferences = (credentialOptions: PreferenceOption[]): WidgetPreference[] => [
	{
		label: '凭据',

		name: 'xPref_CREDENTIAL',
		options: credentialOptions,
		type: 'list',
		value: getCredentialPreferenceValue(credentialOptions)
	},
	createBooleanPreference('TW_allowCreateApplicableItem', '允许创建适用项目', false),
	createBooleanPreference('ShowCreateFromSpreadsheetCmd', '显示“从电子表格创建”命令', false),
	createBooleanPreference('TW_showCadNotInBom', '显示 CAD“不在 BOM 中”的零部件', false),
	createBooleanPreference('TW_showSpecificationDocument', '在产品结构中显示“规格文档”', true),
	createBooleanPreference('TW_show3DShape', '在产品结构中显示 3DShape', false),
	createBooleanPreference(
		'TW_useIndexMode',
		'使用索引模式（禁用“使用索引模式”高级过滤器时，将禁用“产品叶”、“产品原材料”和“可制造视图”等操作）',
		true
	),
	createListPreference(
		'TW_dbAutoSwitchTimeout',
		'从数据库模式自动切换到索引模式',
		[
			{ label: '从不', value: '-1' },
			{ label: '1 分钟', value: '1' },
			{ label: '3 分钟', value: '3' },
			{ label: '5 分钟', value: '5' },
			{ label: '10 分钟', value: '10' }
		],
		'3'
	),
	createListPreference(
		'final_item_name',
		'最终项目',
		[
			{ label: '未选中（叶子项目）', value: '' },
			{ label: '选中', value: 'true' }
		],
		''
	),
	createListPreference(
		'evol_workunder_pref',
		'对模型版本集应用“待衍生的工作”操作',
		[
			{ label: '每次询问', value: 'ask_workunder_everytime' },
			{ label: '自动应用', value: 'apply_workunder_automatically' },
			{ label: '从不应用', value: 'never_apply_workunder' }
		],
		'ask_workunder_everytime'
	),
	createBooleanPreference('changeControlVisible', '显示工作范围', true),
	createListPreference(
		'changeControlPosition',
		'工作范围位置',
		[
			{ label: '右下角', value: 'bottom-right' },
			{ label: '右上角', value: 'top-right' },
			{ label: '左下角', value: 'bottom-left' },
			{ label: '左上角', value: 'top-left' }
		],
		'bottom-right'
	),
	createListPreference(
		'TW_preferredUnitMass',
		'首选单位 - 质量',
		[
			{ label: '吉尔吉斯斯坦', value: 'kg' },
			{ label: '克', value: 'g' },
			{ label: '磅', value: 'lb' }
		],
		'kg'
	),
	createListPreference(
		'TW_preferredUnitVolume',
		'首选单位 - 体积',
		[
			{ label: 'm³', value: 'm3' },
			{ label: 'cm³', value: 'cm3' },
			{ label: 'L', value: 'l' }
		],
		'm3'
	),
	createListPreference(
		'TW_preferredUnitArea',
		'首选单位 - 面积',
		[
			{ label: 'm²', value: 'm2' },
			{ label: 'cm²', value: 'cm2' },
			{ label: 'mm²', value: 'mm2' }
		],
		'm2'
	),
	createListPreference(
		'TW_preferredUnitLength',
		'首选单位 - 长度',
		[
			{ label: 'm', value: 'm' },
			{ label: 'cm', value: 'cm' },
			{ label: 'mm', value: 'mm' }
		],
		'm'
	)
];

const setWidgetPreferences = (credentialOptions = fallbackCredentialOptions) => {
	// @ts-expect-error widget preference type comes from the 3DDashboard host
	widget.setPreferences(buildPreferences(credentialOptions));
};

const mapCredentialToPreferenceOption = (credential: ContextCredential): PreferenceOption | null => {
	if (!credential.ctxname) return null;
	const label = credential.ctxtitle || credential.prjtitle || credential.ctxname;
	const respType = credential.ctxname.startsWith('VPLMAdmin') || credential.ctxname.includes('Administrator') ? 'ADMIN' : 'REGULAR';
	return {
		label,
		respType,
		value: credential.ctxname
	};
};

const requireDsModule = <T = any>(moduleName: string) =>
	new Promise<T>((resolve, reject) => {
		requirejs([moduleName], module => {
			if (module) resolve(module as T);
			else reject(new Error(`Failed to load DS module: ${moduleName}`));
		});
	});

const get3DSpaceUrl = async () => {
	const i3DXCompassServices = await requireDsModule<any>('DS/i3DXCompassServices/i3DXCompassServices');
	return new Promise<string>((resolve, reject) => {
		i3DXCompassServices.getServiceUrl({
			serviceName: '3DSpace',
			platformId: widget.getValue('x3dPlatformId'),
			onComplete: (url: string) => resolve(url),
			onFailure: (error: unknown) => reject(error)
		});
	});
};

const loadPreferencesFromDgnContext = async () => {
	if (isDev) return;
	setWidgetPreferences();

	try {
		const spaceUrl = await get3DSpaceUrl();
		setBaseURL(spaceUrl);
		const response = await VplmAPI.getDgnContext({
			tenant: 'OnPremise',
			xrequestedwith: 'xmlhttprequest'
		});
		const credentialOptions = (response.credentials || [])
			.map((credential: ContextCredential) => mapCredentialToPreferenceOption(credential))
			.filter((option: PreferenceOption | null): option is PreferenceOption => Boolean(option));
		if (!credentialOptions.length) {
			console.warn('[TW_EngineeringRelease] getDgnContext returned no credentials, using fallback preferences.');
			return;
		}
		setWidgetPreferences(credentialOptions);
		console.log('[TW_EngineeringRelease] Loaded credential preferences from getDgnContext:', credentialOptions);
	} catch (error) {
		console.error('[TW_EngineeringRelease] Failed to load credential preferences from getDgnContext:', error);
	}
};

const start = () => {
	disableDefaultCSS(true);
	widget.setTitle('');
	(window as any).widget = widget;
	const app = createApp(App);
	for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
		app.component(key, component);
	}
	const pinia = createPinia();

	// 浣跨敤鎸佷箙鍖栨彃浠?
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
loadPreferencesFromDgnContext();

/*
 * @Author: FanWenLong
 * @Date: 2025-11-19 15:31:48
 * @Description: 璁剧疆鑷姩鍒锋柊鏃堕棿: -1:涓轰笉鑷姩鍒锋柊 ;鍏朵粬鏁板瓧:鑷姩鍒锋柊鏃堕棿闂撮殧涓哄垎閽?涓嶈缃?榛樿20鍒嗛挓鑷姩鍒锋柊
 */

if (widget) {
	// @ts-expect-error widget meta type comes from the 3DDashboard host
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
