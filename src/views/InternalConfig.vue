<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onClickOutside } from '@vueuse/core';
import http, { getSpaceBaseURL, searchHttp } from '@/utils/ds-request';
import { Plus, Setting, Search, Delete, Check } from '@element-plus/icons-vue';

const { t, locale } = useI18n();

const props = defineProps<{ physicalId?: string; visible?: boolean }>();

const loading = ref(false);
const errorMsg = ref('');
const referencesInfo = ref<any | null>(null);
const contextInfo = ref<any[]>([]);
const enabledCriteria = ref<any[]>([]);

// 搜索框显示状态
const showSearchInput = ref(false);
const searchKeyword = ref('');
const searchLoading = ref(false);
const searchResults = ref<any[]>([]);
const searchInputRef = ref<HTMLElement | null>(null);
const searchResultsRef = ref<HTMLElement | null>(null);
const showSearchResults = ref(false);

// 设置面板显示状态
const showSettingsPanel = ref(false);

// 复选框状态
const revisionChecked = ref(false);
const variantChecked = ref(false);

// 选中的模型ID
const selectedModelId = ref<string>('');
const contentRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);

const getPhysicalId = () => {
	if (props.physicalId) return props.physicalId;
	const hash = typeof location !== 'undefined' ? location.hash : '';
	const m = hash.match(/#\/part-detail\/([^/?#]+)/);
	return m ? decodeURIComponent(m[1]) : '';
};

const baseURL = getSpaceBaseURL();

const ensureFullUrl = (url: string) => {
	if (!url) return '';
	if (url.startsWith('http')) return url;
	return `${baseURL}${url}`;
};

const postJson = async (path: string, body: any): Promise<any> => {
	const url = `/resources/${path}?tenant=OnPremise`;
	console.log('[InternalConfig] Request URL:', url);
	console.log('[InternalConfig] Request Body:', JSON.stringify(body));
	return http.post(url, body);
};

const canEdit = ref<boolean>(false);

const fetchData = async () => {
	const pid = getPhysicalId();
	if (!pid) {
		errorMsg.value = '未找到物理ID';
		return;
	}
	loading.value = true;
	errorMsg.value = '';
	referencesInfo.value = null;
	contextInfo.value = [];
	enabledCriteria.value = [];
	showSearchInput.value = false;
	showSettingsPanel.value = false;
	searchResults.value = [];
	try {
		const accessBody = {
			version: '1.0',
			commandList: ['GetAttachedModels', 'AttachModels', 'DetachModels']
		};
		const accessResp = await postJson('modeler/configuration/pandoServices/getPandOAccessInformation', accessBody);
		const ga = accessResp?.GetAttachedModels === 'Granted';
		const am = accessResp?.AttachModels === 'Granted';
		const dm = accessResp?.DetachModels === 'Granted';
		canEdit.value = !!(ga && am && dm);
		if (!canEdit.value) {
			loading.value = false;
			return;
		}

		const ctxBody = {
			version: '1.2',
			pidList: [pid],
			modelMask: 'Read',
			enabledCriteria: 'YES',
			cfgCtxt: 'YES',
			xRevisionContent: 'YES',
			isUniqueInDB: 'YES'
		};
		const ctxResp = await postJson('modeler/configuration/navigationServices/getMultipleConfigurationContextInfo', ctxBody);
		const ref0 = Array.isArray(ctxResp?.referencesInfo) ? ctxResp.referencesInfo[0] : undefined;
		referencesInfo.value = ref0 || null;
		contextInfo.value = Array.isArray(ctxResp?.contextInfo) ? ctxResp.contextInfo : [];
		enabledCriteria.value = Array.isArray(ctxResp?.enabledCriteria) ? ctxResp.enabledCriteria : [];
	} catch (e: any) {
		errorMsg.value = e?.message || String(e);
		console.error('[InternalConfig] fetchData error:', e);
	} finally {
		loading.value = false;
	}
};

onMounted(fetchData);

watch(
	() => props.physicalId,
	(newVal, oldVal) => {
		if (newVal && newVal !== oldVal) {
			fetchData();
		}
	}
);

// 监听 visible 变化，每次弹框打开时刷新数据
watch(
	() => props.visible,
	(newVal) => {
		if (newVal) {
			fetchData();
		}
	}
);

const refNotEditable = computed(() => {
	const r = referencesInfo.value;
	if (!r) return false;
	return r.isConfigurable === 'NO' || r.isCriteriaEditable === 'NO';
});

// 是否有模型数据
const hasModel = computed(() => items.value.length > 0);

// 已存在的模型 physicalid 列表（用于排除）
const existingModelIds = computed(() => {
	const ids: string[] = [];
	contextInfo.value.forEach(ci => {
		const res = ci?.content?.results?.[0] || {};
		// physicalID 在根级别，不在 basicData 中
		const physicalId = res?.physicalID;
		if (physicalId) ids.push(physicalId);
	});
	return ids;
});

// 模型名称（用于标题）
const modelName = computed(() => {
	if (items.value.length > 0) {
		return items.value[0].label;
	}
	return '';
});

const items = computed(() => {
	return contextInfo.value.map(ci => {
		const res = ci?.content?.results?.[0] || {};
		const basic = Array.isArray(res?.basicData) ? res.basicData : [];
		const pick = (name: string) => basic.find((b: any) => b?.name === name)?.value?.[0] || '';
		const label = res?.computed?.label?.value?.[0] || pick('name') || '未命名';
		const project = pick('project');
		const state = pick('current');
		const modified = pick('modified');
		const iconUrl = res?.type_icon_large_url
			? ensureFullUrl(res.type_icon_large_url)
			: ensureFullUrl(res?.type_icon_url?.replace('/small/', '/large/').replace('.png', '108x144.png') || '');
		const physicalId = res?.physicalID || '';
		return { label, project, state, modified, icon: iconUrl, physicalId };
	});
});

// 点击+号
const handleAddClick = () => {
	showSearchInput.value = !showSearchInput.value;
	if (!showSearchInput.value) {
		// 隐藏搜索框时，清空所有搜索相关内容
		searchKeyword.value = '';
		searchResults.value = [];
		showSearchResults.value = false;
	}
	// 注意：不再自动搜索，等待用户点击输入框聚焦后再搜索
};

// 点击输入框外部关闭搜索结果（但保留输入框）
onClickOutside(searchResultsRef, (event) => {
	// 如果点击的是输入框，不关闭
	const inputEl = searchInputRef.value;
	if (inputEl && (inputEl === event.target || inputEl.contains(event.target as Node))) {
		return;
	}
	// 关闭搜索结果
	showSearchResults.value = false;
});

// 点击输入框外部只隐藏搜索结果（保留输入框）
onClickOutside(searchInputRef, (event) => {
	// 如果点击的是结果列表，不关闭
	const resultsEl = searchResultsRef.value;
	if (resultsEl && (resultsEl === event.target || resultsEl.contains(event.target as Node))) {
		return;
	}
	// 只关闭搜索结果，保留输入框
	showSearchResults.value = false;
});

// 点击内容区域外部取消选中模型（排除头部按钮区域）
onClickOutside(contentRef, (event) => {
	// 如果点击的是头部区域，不取消选中
	const headerEl = headerRef.value;
	if (headerEl && (headerEl === event.target || headerEl.contains(event.target as Node))) {
		return;
	}
	selectedModelId.value = '';
});

// 点击设置
const handleSettingClick = () => {
	showSettingsPanel.value = !showSettingsPanel.value;
};

// 删除选中的模型
const handleDeleteModel = async () => {
	console.log('[InternalConfig] Delete clicked, physicalId:', props.physicalId, 'selectedModelId:', selectedModelId.value);
	if (!props.physicalId || !selectedModelId.value) {
		console.error('[InternalConfig] 缺少物理ID或模型ID');
		return;
	}

	try {
		const body = {
			version: '1.2',
			pidList: [props.physicalId],
			content: {
				attachCfgCtxt: [],
				detachCfgCtxt: [selectedModelId.value]
			}
		};

		console.log('[InternalConfig] Detach Model Request:', body);
		const res: any = await http.post(
			'/resources/modeler/configuration/authoringServices/setConfiguredObjectInfo?cfgCtxt=1&tenant=OnPremise',
			body
		);
		console.log('[InternalConfig] Detach Model Response:', res);

		if (res?.result === 'SUCCEED') {
			// 删除成功，刷新模型列表并清空选中
			await fetchData();
			selectedModelId.value = '';
		} else {
			console.error('[InternalConfig] 删除模型失败:', res);
		}
	} catch (e: any) {
		console.error('[InternalConfig] Detach Model Error:', e);
	}
};

// 构建搜索 query
const buildSearchQuery = (keyword: string) => {
	const hasModels = items.value.length > 0;
	let baseQuery = '';

	if (hasModels) {
		// 有模型时，排除已存在的模型
		const existingIds = items.value.map(it => it.physicalId).filter(Boolean);
		const excludeIds = existingIds.map(id => `NOT (physicalid:${id})`).join('');
		baseQuery = `(flattenedtaxonomies:"types/Model")AND  ( NOT current:"Inactive") AND ( NOT current: "Obsolete") ${excludeIds}`;
	} else {
		// 模型为空时，同时搜索 Model 和 Products 类型
		baseQuery = `(flattenedtaxonomies:"types/Model")AND  ( NOT current:"Inactive") AND ( NOT current: "Obsolete")   OR (flattenedtaxonomies:"types/Products")AND  ( NOT current:"Inactive") AND ( NOT current: "Obsolete")`;
	}

	// 如果输入了关键词，添加文本匹配
	if (keyword.trim()) {
		const searchText = keyword.trim();
		baseQuery = `(${baseQuery}) AND (([ds6w:label]:(${searchText})) OR ([ds6w:label]:(*${searchText}*)) OR ([name]:(${searchText})) OR ([name]:(*${searchText}*)))`;
	}

	return baseQuery;
};

// 输入框聚焦时触发搜索
const handleSearchInputFocus = () => {
	console.log('[InternalConfig] 输入框聚焦，触发搜索');
	showSearchResults.value = true;
	handleSearch();
};

// 搜索
const handleSearch = async () => {
	console.log('[InternalConfig] 搜索关键词:', searchKeyword.value);
	searchLoading.value = true;
	try {
		const query = buildSearchQuery(searchKeyword.value);
		const body = {
			with_indexing_date: true,
			with_nls: false,
			label: 'cfgLabel',
			locale: 'en',
			select_predicate: [
				'ds6w:label',
				'ds6w:type',
				'ds6w:description',
				'ds6w:identifier',
				'ds6w:modified',
				'ds6w:created',
				'ds6w:responsible',
				'ds6w:lastModifiedBy',
				'ds6wg:marketing_Name',
				'ds6wg:revision',
				'ds6w:what/ds6w:status'
			],
			select_file: ['icon', 'thumbnail_2d'],
			query: query,
			order_by: 'desc',
			order_field: 'relevance',
			nresults: 1000,
			start: '0',
			source: [],
			tenant: 'OnPremise'
		};

		console.log('[InternalConfig] Search Query:', query);
		const res: any = await searchHttp.post('/search?xrequestedwith=xmlhttprequest', body);
		console.log('[InternalConfig] Search Results:', res);

		// 解析搜索结果
		if (res?.results && Array.isArray(res.results)) {
			searchResults.value = res.results.map((item: any) => {
				const attrs = item?.attributes || [];
				const getAttr = (name: string) => attrs.find((a: any) => a?.name === name)?.value || '';
				const resourceid = getAttr('resourceid');
				const label = getAttr('ds6w:label');
				const revision = getAttr('ds6wg:revision');
				const displayName = revision ? `${label} ${revision}` : label;
				const iconUrl = getAttr('type_icon_url') || getAttr('preview_url') || '';
				return {
					resourceid,
					label,
					revision,
					displayName,
					icon: ensureFullUrl(iconUrl)
				};
			});
		} else {
			searchResults.value = [];
		}
	} catch (e: any) {
		console.error('[InternalConfig] Search Error:', e);
		searchResults.value = [];
	} finally {
		searchLoading.value = false;
	}
};

// 选择搜索结果 - 附加模型
const handleSelectResult = async (item: any) => {
	console.log('[InternalConfig] 选择模型:', item);
	if (!props.physicalId || !item.resourceid) {
		console.error('[InternalConfig] 缺少物理ID或模型ID');
		return;
	}

	try {
		const body = {
			version: '1.2',
			pidList: [props.physicalId],
			content: {
				attachCfgCtxt: [item.resourceid],
				detachCfgCtxt: []
			}
		};

		console.log('[InternalConfig] Attach Model Request:', body);
		const res: any = await http.post(
			'/resources/modeler/configuration/authoringServices/setConfiguredObjectInfo?cfgCtxt=1&tenant=OnPremise',
			body
		);
		console.log('[InternalConfig] Attach Model Response:', res);

		if (res?.result === 'SUCCEED') {
			// 附加成功，刷新模型列表
			await fetchData();
			// 关闭搜索
			showSearchInput.value = false;
			showSearchResults.value = false;
			searchKeyword.value = '';
			searchResults.value = [];
		} else {
			console.error('[InternalConfig] 附加模型失败:', res);
		}
	} catch (e: any) {
		console.error('[InternalConfig] Attach Model Error:', e);
	}
};
</script>

<template>
	<div class="cfg-wrap">
		<!-- 头部：活动条件 + 按钮 -->
		<div ref="headerRef" class="cfg-header">
			<div class="cfg-header-left">
				<span class="cfg-header-label">活动条件：</span>
				<span class="cfg-header-value">
					{{ referencesInfo && referencesInfo.revisionMode ? referencesInfo.revisionMode : t('config.defaultEffectivity') }}
				</span>
			</div>
			<div class="cfg-header-actions">
				<el-button v-if="canEdit && !refNotEditable" text class="cfg-action-btn" @click="handleAddClick">
					<el-icon><Plus /></el-icon>
				</el-button>
				<!-- 删除按钮 -->
			<el-button
					v-if="canEdit && !refNotEditable && selectedModelId"
					text
					class="cfg-action-btn"
					@click="handleDeleteModel">
					<el-icon><Delete /></el-icon>
				</el-button>
				<el-button
					v-if="canEdit && !refNotEditable && hasModel"
					text
					class="cfg-action-btn"
					@click="handleSettingClick">
					<el-icon><Setting /></el-icon>
				</el-button>
			</div>
		</div>

		<!-- 搜索框 - 独立悬浮 -->
		<div v-if="showSearchInput" ref="searchInputRef" class="cfg-search-input-wrap">
			<el-input
				v-model="searchKeyword"
				placeholder="搜索..."
				clearable
				:prefix-icon="Search"
				@focus="handleSearchInputFocus"
				@input="handleSearch"
				@clear="handleSearch">
			</el-input>
		</div>
		<!-- 搜索结果列表 - 独立悬浮 -->
		<div v-if="showSearchResults" ref="searchResultsRef" class="cfg-search-results-overlay">
			<div v-loading="searchLoading" class="cfg-search-results">
				<div
					v-for="item in searchResults"
					:key="item.resourceid"
					class="cfg-search-item"
					@click="handleSelectResult(item)">
					<img v-if="item.icon" :src="item.icon" class="cfg-search-item-icon" alt="" />
					<span class="cfg-search-item-label">{{ item.displayName }}</span>
				</div>
				<div v-if="!searchLoading && searchResults.length === 0" class="cfg-search-empty">暂无搜索结果</div>
			</div>
		</div>

		<!-- 设置面板 -->
		<div v-if="showSettingsPanel && hasModel" class="cfg-settings-panel">
			<div class="cfg-settings-row">
				<div class="cfg-settings-col">
					<div class="cfg-settings-title">变更</div>
					<el-checkbox v-model="revisionChecked" class="cfg-settings-checkbox">
						<span class="cfg-checkbox-label">模型版本</span>
					</el-checkbox>
				</div>
				<div class="cfg-settings-divider"></div>
				<div class="cfg-settings-col">
					<div class="cfg-settings-title">可变性</div>
					<el-checkbox v-model="variantChecked" class="cfg-settings-checkbox">
						<span class="cfg-checkbox-label">变体和选项</span>
					</el-checkbox>
				</div>
			</div>
		</div>

		<el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon closable class="cfg-alert" />

		<el-alert
			v-else-if="canEdit === false"
			title="无权限：需要 GetAttachedModels/AttachModels/DetachModels 均为 Granted"
			type="warning"
			show-icon
			class="cfg-alert" />

		<el-alert
			v-else-if="refNotEditable"
			title="该对象不可配置或条件不可编辑"
			type="warning"
			show-icon
			class="cfg-alert" />

		<el-skeleton v-if="loading" :rows="4" animated />

		<template v-else>
			<!-- 空状态 -->
			<div v-if="!items.length" class="cfg-empty">
				<div class="cfg-empty-img">
					<img :src="`${baseURL}/snresources/images/icons/large/I_PLCModel108x144.png`" alt="" />
				</div>
				<div class="cfg-empty-text">没有附加配置上下文</div>
			</div>

			<!-- 有数据 -->
			<div v-else ref="contentRef" class="cfg-content">
				<div
					v-for="(it, idx) in items"
					:key="idx"
					class="cfg-card"
					:class="{ 'cfg-card-selected': selectedModelId === it.physicalId }"
					@click="selectedModelId = it.physicalId">
					<div class="cfg-row">
						<div class="cfg-img-wrap">
							<img v-if="it.icon" :src="it.icon" class="cfg-img" alt="" />
							<div v-if="selectedModelId === it.physicalId" class="cfg-selected-icon">
								<el-icon><Check /></el-icon>
							</div>
						</div>
						<div class="cfg-info">
							<div class="cfg-title">{{ it.label }}</div>
							<div class="cfg-sub">
								{{ it.project }}
								<template v-if="it.project && it.state">|</template>
								{{ it.state }}
							</div>
							<div class="cfg-meta">{{ it.modified }}</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.cfg-wrap {
	padding: 0;
	min-height: 400px;
	position: relative;
}
.cfg-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding: 0 4px;
}
.cfg-header-left {
	display: flex;
	align-items: center;
	gap: 4px;
}
.cfg-header-label {
	color: #606266;
	font-size: 13px;
}
.cfg-header-value {
	color: #303133;
	font-size: 13px;
}
.cfg-header-actions {
	display: flex;
	align-items: center;
	gap: 4px;
}
.cfg-action-btn {
	font-size: 16px;
	color: #909399;
	padding: 2px;
	height: 24px;
	width: 24px;
}
.cfg-action-btn:hover {
	color: #409eff;
}

/* 搜索框容器 */
.cfg-search-input-wrap {
	margin-bottom: 12px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	background: #fff;
}

/* 搜索结果悬浮层 */
.cfg-search-results-overlay {
	position: absolute;
	top: 80px;
	left: 0;
	right: 0;
	z-index: 1000;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	background: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.cfg-search-results {
	max-height: 200px;
	overflow-y: auto;
	padding: 4px 0;
}
.cfg-search-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	cursor: pointer;
	transition: background 0.2s;
}
.cfg-search-item:hover {
	background: #f5f7fa;
}
.cfg-search-item-icon {
	width: 24px;
	height: 24px;
	object-fit: contain;
}
.cfg-search-item-label {
	font-size: 13px;
	color: #303133;
}
.cfg-search-empty {
	padding: 16px;
	text-align: center;
	color: #909399;
	font-size: 13px;
}

/* 设置面板 */
.cfg-settings-panel {
	margin-bottom: 12px;
	padding: 12px 16px;
	background: #f5f7fa;
	border-radius: 4px;
}
.cfg-settings-row {
	display: flex;
	align-items: stretch;
}
.cfg-settings-col {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8px 0;
}
.cfg-settings-divider {
	width: 1px;
	background: #dcdfe6;
	margin: 0 8px;
}
.cfg-settings-title {
	font-size: 14px;
	font-weight: 500;
	color: #303133;
	margin-bottom: 12px;
}
.cfg-settings-checkbox {
	--el-checkbox-font-size: 13px;
}
.cfg-settings-checkbox :deep(.el-checkbox__label) {
	padding-left: 6px;
}
.cfg-checkbox-label {
	color: #606266;
	font-size: 13px;
}

.cfg-alert {
	margin-bottom: 8px;
}

/* 空状态 */
.cfg-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	min-height: 180px;
}
.cfg-empty-img {
	width: 72px;
	height: 72px;
	margin-bottom: 12px;
	opacity: 0.6;
}
.cfg-empty-img img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}
.cfg-empty-text {
	color: #909399;
	font-size: 13px;
}

/* 内容区域 */
.cfg-content {
	width: 100%;
}

.cfg-card {
	padding: 10px 12px;
	border: 1px solid #e4e7ed;
	border-radius: 4px;
	background: #fff;
	margin-bottom: 8px;
	cursor: pointer;
	transition: all 0.2s;
}
.cfg-card:hover {
	border-color: #c0c4cc;
}
.cfg-card-selected {
	border-color: #409eff;
	box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.cfg-row {
	display: flex;
	align-items: flex-start;
	gap: 10px;
}
.cfg-img-wrap {
	width: 56px;
	height: 56px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f7fa;
	border-radius: 4px;
	overflow: hidden;
	position: relative;
}
.cfg-selected-icon {
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 18px;
	height: 18px;
	background: #409eff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 12px;
}
.cfg-img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}
.cfg-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 2px 0;
}
.cfg-title {
	color: #409eff;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
}
.cfg-sub {
	color: #606266;
	margin-top: 2px;
	font-size: 12px;
}
.cfg-meta {
	color: #909399;
	margin-top: 2px;
	font-size: 12px;
}
</style>
