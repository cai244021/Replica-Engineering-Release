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

	const openSearchFilter
		= 'flattenedtaxonomies:"types/VPMReference" OR flattenedtaxonomies:"types/VPMRepReference" OR flattenedtaxonomies:"types/ENOStrRefinementSpecification"';
	const precond = ` (flattenedtaxonomies:\"types/VPMReference\" OR (flattenedtaxonomies:\"types/VPMRepReference\"))`;
	const precondFilter = ` (flattenedtaxonomies:\"types/ENOStrRefinementSpecification\")`;
	const showTitle = openType === 'content' ? '打开内容' : openType === 'product' ? '打开产品' : openType === 'filter' ? '打开过滤器' : '打开内容'; //搜索栏上方标题

	// @ts-expect-error parent is provided by the 3DDashboard host
	parent.require(['DS/PADServices/utils/SearchUtils'], (SearchUtils: any) => {
		// use 3DDashboard APIs
		const pseSearch = {
			parent_window: null,
			title: showTitle,
			precond: options?.precond ?? (openType === 'product' ? precond : openType === 'filter' ? precondFilter : undefined),
			fts_value: options?.ftsValue ?? (openType === 'content' ? openSearchFilter : undefined),
			search_criteria_to_display: '',
			showApplyButton: false,//openType === 'product', //是否显示应用按钮
			applyButton_Nls: '打开内容并对其进行过滤', //应用按钮说明
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
		const params = appName === 'PSE' ? pseSearch : CASearch;
		SearchUtils.inAppsSearch(params);
	});
}
// }
export default dsSearchInput;
