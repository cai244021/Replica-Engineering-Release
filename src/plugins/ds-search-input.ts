/**
 * 搜索调用达索弹框功能
 * @param {String} searchData - 搜索条件
 * @param {String} openType - 打开类型
 *  可选值：'content'（打开内容）'product'（打开产品）'filter'（打开过滤器）'CAOpen'（CA打开搜索）'CATableOpen'（CA表格打开搜索）
 * @param {String} appName - 应用名称
 * @param {String} CaId - CA表格打开搜索时的CAID
 * *@param {Function} callback - 回调得到选择的元素
 */
interface OpenType {
	content: string;
	product: string;
	filter: string;
	CAOpen: string;
	CATableOpen: string;
}
interface AppName {
	PSE: string;
	CA: string;
	XEN: string;
}
interface SearchOptions {
	precond?: string;
	ftsValue?: string;
	query?: string;
	searchType?: 'product' | 'document' | 'drawing';
	owner?: string;
	securityContext?: string;
	drawingsOnly?: boolean;
}

function dsSearchInput(
	searchData: string,
	openType: OpenType[keyof OpenType],
	appName: AppName[keyof AppName],
	_CaId: string,
	callback: (value: Array<any>) => void,
	options?: SearchOptions
) {
	'use strict';

	const openSearchFilter = 'flattenedtaxonomies:"types/VPMReference" OR flattenedtaxonomies:"types/VPMRepReference" OR flattenedtaxonomies:"types/ENOStrRefinementSpecification"';
	const precond = ` (flattenedtaxonomies:"types/VPMReference" OR (flattenedtaxonomies:"types/VPMRepReference"))`;
	const precondFilter = ` (flattenedtaxonomies:"types/ENOStrRefinementSpecification")`;
	const showTitle = openType === 'content' ? '打开内容' : openType === 'product' ? '打开产品' : openType === 'filter' ? '打开过滤器' : '打开内容'; // 搜索栏上方标题

	// 工程图搜索配置
	const drawingSearchConfig = {
		additional_query: ' AND NOT (flattenedtaxonomies:("types/Person" OR "types/Security Context"))',
		option: {
			with_synthesis_ranged: true,
			enable_mono_sixw: false
		},
		select_predicate: [
			'ds6w:label',
			'ds6w:type',
			'ds6w:description',
			'ds6w:identifier',
			'ds6w:modified',
			'ds6w:created',
			'ds6wg:revision',
			'ds6w:status',
			'ds6w:responsible',
			'owner',
			'ds6w:responsibleUid',
			'ds6wg:filesize',
			'ds6w:i3dx',
			'ds6w:project',
			'ds6w:dataSource',
			'ds6w:community',
			'ds6w:originator',
			'dsgeo:referential',
			'ds6w:lastModifiedBy',
			'ds6w:repository',
			'dcterms:title',
			'dcterms:description',
			'ds6w:containerUid'
		],
		select_exclude_synthesis: ['ds6w:what/ds6w:topic', 'ds6w:dataSource', 'ds6w:dataSource'],
		select_snippets: ['ds6w:snippet', 'ds6w:label:snippet', 'ds6w:responsible:snippet', 'ds6w:community:snippet', 'swym:message_text:snippet']
	};

	console.log('[dsSearchInput] loading SearchUtils...');
	// @ts-expect-error parent is provided by the 3DDashboard host
	parent.require(
		['DS/PADServices/utils/SearchUtils'],
		(SearchUtils: any) => {
			console.log('[dsSearchInput] SearchUtils loaded');

			// 根据 options.searchType 决定使用哪个搜索配置
			const isDrawingSearch = options?.searchType === 'drawing' || options?.drawingsOnly;
			const currentOwner = options?.owner || 'admin_platform';
			const currentSecurityContext = options?.securityContext || 'VPLMProjectLeader.Company Name.Common Space';

			// use 3DDashboard APIs
			let defaultPrecond;
			if (openType === 'product') {
				defaultPrecond = precond;
			} else if (openType === 'filter') {
				defaultPrecond = precondFilter;
			} else {
				defaultPrecond = undefined;
			}

			const pseSearch = {
				parent_window: null,
				title: showTitle,
				precond: options?.precond ?? options?.query ?? defaultPrecond,
				fts_value: options?.ftsValue ?? (openType === 'content' ? openSearchFilter : undefined),
				search_criteria_to_display: '',
				showApplyButton: false, // openType === 'product', // 是否显示应用按钮
				applyButton_Nls: '打开内容并对其进行过滤', // 应用按钮说明
				callback: function (e: Array<any>) {
					// var t = n(e);
					// i(t)
					console.log(e);
					callback(e);
				},
				apply: function (e: any) {
					// var t = n(e, !0);
					// i(t)
					console.log(e);
				},
				cancel: function (e: any) {
					console.log(e);
				}
			};

			// 工程图搜索参数（当 searchType === 'drawing' 时使用）
			const drawingSearch = {
				parent_window: null,
				title: '打开工程图',
				precond: undefined,
				fts_value: undefined,
				search_criteria_to_display: '',
				showApplyButton: false,
				applyButton_Nls: '打开工程图',
				specific_source_parameter: {
					'3dspace': {
						option: drawingSearchConfig.option
					}
				},
				with_indexing_date: true,
				with_synthesis: true,
				with_synthesis_hierarchical: true,
				with_nls: false,
				label: `3DSearch-${currentOwner}-InContextSearch-${Date.now()}`,
				locale: 'zh-CN',
				select_predicate: drawingSearchConfig.select_predicate,
				select_file: ['icon', 'thumbnail_2d'],
				query: '(flattenedtaxonomies:"types/Drawing" AND [ds6w:composed]:FALSE)',
				refine: {},
				select_exclude_synthesis: drawingSearchConfig.select_exclude_synthesis,
				order_by: 'desc',
				order_field: 'relevance',
				select_snippets: drawingSearchConfig.select_snippets,
				nresults: 40,
				start: '0',
				source: ['3dspace'],
				tenant: 'OnPremise',
				login: {
					'3dspace': {
						SecurityContext: currentSecurityContext
					}
				},
				callback: function (e: Array<any>) {
					console.log(e);
					callback(e);
				},
				apply: function (e: any) {
					console.log(e);
				},
				cancel: function (e: any) {
					console.log(e);
				}
			};

			const CASearch = {
				parent_window: null,
				title: openType === 'CAOpen' ? '打开' : '添加建议的更改',
				precond:
					openType === 'CAOpen'
						? 'flattenedtaxonomies:"types/Change Order" OR flattenedtaxonomies:"types/Change Request" OR flattenedtaxonomies:"types/Change Action" OR flattenedtaxonomies:"types/Investigation Request"'
						: undefined,
				fts_value:
					openType === 'CAOpen'
						? 'flattenedtaxonomies:"types/Change Order" OR flattenedtaxonomies:"types/Change Request" OR flattenedtaxonomies:"types/Change Action" OR flattenedtaxonomies:"Investigation Request"'
						: undefined,
				search_criteria_to_display: '',
				showApplyButton: false, // 是否显示应用按钮
				applyButton_Nls: '', // 应用按钮说明
				callback: function (e: Array<any>) {
					// var t = n(e);
					// i(t)
					console.log(e);
					callback(e);
				},
				apply: function (e: any) {
					// var t = n(e, !0);
					// i(t)
					console.log(e);
				},
				cancel: function (e: any) {
					console.log(e);
				}
			};

			// 根据搜索类型选择参数
			let params: any;
			if (isDrawingSearch) {
				params = drawingSearch;
			} else if (appName === 'PSE') {
				params = pseSearch;
			} else {
				params = CASearch;
			}

			console.log('[dsSearchInput] calling inAppsSearch with params:', JSON.parse(JSON.stringify(params)));
			SearchUtils.inAppsSearch(params);
		},
		(error: any) => {
			console.error('[dsSearchInput] failed to load SearchUtils:', error);
		}
	);
}
// }
export default dsSearchInput;
