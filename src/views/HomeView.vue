<template>
	<div class="engineering-release-container">
		<!-- 左侧导航栏 -->
		<div :class="['sidebar', { collapsed: sidebarCollapsed }]">
			<div class="sidebar-section">
				<div class="section-title">访问您的工作</div>
				<div
					class="nav-item"
					:class="{ active: currentNav === 'recent' }"
					title="最近"
					@click="handleNavClick('recent')">
					<el-icon><Clock /></el-icon>
					<span>最近</span>
				</div>
				<div
					class="nav-item"
					:class="{ active: currentNav === 'myProducts' }"
					title="我的产品"
					@click="handleNavClick('myProducts')">
					<el-icon><Box /></el-icon>
					<span>我的产品</span>
				</div>
				<div
					class="nav-item"
					:class="{ active: currentNav === 'open' }"
					title="打开"
					@click="handleNavClick('open')">
					<el-icon><FolderOpened /></el-icon>
					<span>打开</span>
				</div>
			</div>

			<div class="sidebar-section">
				<div class="section-title">开始新活动</div>
				<div
					class="nav-item"
					title="新产品"
					@click="handleCreateProduct">
					<el-icon><Plus /></el-icon>
					<span>新产品</span>
				</div>
				<div
					class="nav-item"
					title="新零件"
					@click="handleCreatePart">
					<el-icon><CirclePlus /></el-icon>
					<span>新零件</span>
				</div>
				<div
					class="nav-item"
					title="从电子表格创建"
					@click="handleImportFromSpreadsheet">
					<el-icon><Document /></el-icon>
					<span>从电子表格创建</span>
				</div>
			</div>
		</div>

		<!-- 主内容区 -->
		<div
			id="mainContent"
			class="main-content">
			<!-- 顶部工具栏 -->
			<div class="content-header">
				<div class="header-left">
					<el-icon
						:class="['back-icon', { collapsed: sidebarCollapsed }]"
						:title="sidebarCollapsed ? '展开导航' : '收起导航'"
						@click="sidebarCollapsed = !sidebarCollapsed">
						<ArrowLeft />
					</el-icon>
					<span class="header-title">{{ headerTitle }}</span>
				</div>
				<div class="header-right">
					<el-checkbox v-model="showAll">{{ productList.length }} 项目</el-checkbox>
					<div class="view-toggle">
						<el-tooltip
							content="缩略图视图"
							placement="top">
							<el-icon
								:class="{ active: viewMode === 'grid' }"
								@click="viewMode = 'grid'">
								<Grid />
							</el-icon>
						</el-tooltip>
						<el-tooltip
							content="平铺视图"
							placement="top">
							<el-icon
								:class="{ active: viewMode === 'list' }"
								@click="viewMode = 'list'">
								<Menu />
							</el-icon>
						</el-tooltip>
					</div>
				</div>
			</div>

			<!-- 产品列表 -->
			<div
				v-loading="loading"
				class="product-list">
				<!-- 网格视图 -->
				<div
					v-if="viewMode === 'grid'"
					class="grid-view">
					<el-popover
						v-for="item in productList"
						:key="item.id"
						trigger="hover"
						placement="right"
						:width="320"
						popper-class="card-hover-popover"
						:show-after="300">
						<template #reference>
							<div
								class="product-card"
								draggable="true"
								:class="{ dragging: draggingProductId === item.id }"
								@dragstart="handleProductDragStart($event, item)"
								@dragend="handleProductDragEnd"
								@dblclick="handleRowDoubleClick(item)">
								<div class="card-thumbnail">
									<img
										:src="item.thumbnail || defaultThumbnail"
										alt="product" />
								</div>
								<div class="card-info">
									<div class="card-title">
										<el-icon class="type-icon"><Document /></el-icon>
										<span class="name">{{ item.name }}</span>
									</div>
									<div class="card-meta">
										<div class="meta-row">
											<el-tag
												:size="'small'"
												:type="getStatusType(item.status)">
												{{ item.status }}
											</el-tag>
											<span class="owner">{{ item.owner }}</span>
										</div>
										<div class="meta-row meta-row-bottom">
											<span class="date">{{ item.date }}</span>
											<el-dropdown
												class="card-dropdown"
												trigger="click"
												placement="bottom-end"
												popper-class="card-dropdown-menu"
												:teleported="true"
												:popper-options="cardDropdownPopperOptions"
												@command="(cmd: string) => handleCardCommand(cmd, item)"
												@click.stop>
												<el-icon class="dropdown-icon"><ArrowDown /></el-icon>
												<template #dropdown>
													<el-dropdown-menu>
														<el-dropdown-item command="open">
															<el-icon>
																<Document />
															</el-icon>
															打开
														</el-dropdown-item>
														<div
															class="open-with-submenu-wrapper"
															@click.stop
															@mouseenter="positionSubmenu">
															<div class="open-with-trigger">
																打开方式
																<el-icon class="submenu-arrow"><ArrowRight /></el-icon>
															</div>
															<div class="open-with-submenu">
																<div
																	class="submenu-item"
																	@click="handleOpenWithClick('3D Markup', item)">
																	<el-icon><EditPen /></el-icon>
																	<span>3D Markup</span>
																</div>
																<div
																	class="submenu-item"
																	@click="handleOpenWithClick('3D Navigate', item)">
																	<el-icon><Compass /></el-icon>
																	<span>3D Navigate</span>
																</div>
																<div
																	class="submenu-item"
																	@click="handleOpenWithClick('3DPlay', item)">
																	<el-icon><VideoPlay /></el-icon>
																	<span>3DPlay</span>
																</div>
																<div
																	class="submenu-item"
																	@click="handleOpenWithClick('Collaborative Lifecycle', item)">
																	<el-icon><Refresh /></el-icon>
																	<span>Collaborative Lifecycle</span>
																</div>
																<div
																	class="submenu-item submenu-item-divided"
																	@click="handleOpenWithClick('more', item)">
																	<el-icon><Plus /></el-icon>
																	<span>更多应用程序</span>
																</div>
															</div>
														</div>
														<el-dropdown-item command="setEnterpriseCode">设置企业项目编号</el-dropdown-item>
														<el-dropdown-item
															command="editContext"
															disabled>
															编辑配置上下文
														</el-dropdown-item>
														<el-dropdown-item command="delete">删除</el-dropdown-item>
														<el-dropdown-item
															command="revision"
															divided
															:disabled="lifecycleCmdLoading">
															<span class="part-action-menu-icon">☷</span>
															<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '修订版' }}</span>
														</el-dropdown-item>
														<el-dropdown-item
															command="newRevision"
															:disabled="lifecycleCmdLoading">
															<span class="part-action-menu-icon">↳</span>
															<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新修订版' }}</span>
														</el-dropdown-item>
														<el-dropdown-item
															command="newBranch"
															:disabled="lifecycleCmdLoading">
															<span class="part-action-menu-icon">⌘</span>
															<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新建分支' }}</span>
														</el-dropdown-item>
														<el-dropdown-item
															command="newRevisionSource"
															:disabled="lifecycleCmdLoading">
															<span class="part-action-menu-icon">⌁</span>
															<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新修订版源' }}</span>
														</el-dropdown-item>
														<el-dropdown-item
															command="copy"
															:disabled="lifecycleCmdLoading">
															<span class="part-action-menu-icon">⧉</span>
															<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '复制' }}</span>
														</el-dropdown-item>
														<el-dropdown-item command="compare">比较</el-dropdown-item>
														<el-dropdown-item
															command="maturity"
															disabled>
															成熟度
														</el-dropdown-item>
														<el-dropdown-item command="lock">锁定</el-dropdown-item>
														<el-dropdown-item command="unlock">解锁</el-dropdown-item>
														<el-dropdown-item
															command="move"
															disabled>
															移动
														</el-dropdown-item>
														<el-dropdown-item
															command="share"
															disabled>
															共享
														</el-dropdown-item>
														<el-dropdown-item command="relationship">关系</el-dropdown-item>
														<el-dropdown-item
															command="relatedChanges"
															disabled>
															相关更改
														</el-dropdown-item>
														<el-dropdown-item
															command="subscribe"
															disabled>
															订阅
														</el-dropdown-item>
														<el-dropdown-item
															command="info"
															disabled>
															信息
														</el-dropdown-item>
													</el-dropdown-menu>
												</template>
											</el-dropdown>
										</div>
									</div>
								</div>
							</div>
						</template>
						<div class="card-hover-info">
							<div class="hover-row">
								<span class="hover-label">标题</span>
								<span class="hover-value">{{ item.name }}</span>
							</div>
							<div class="hover-row">
								<span class="hover-label">修订版</span>
								<span class="hover-value">{{ item.revision }}</span>
							</div>
							<div class="hover-row">
								<span class="hover-label">类型</span>
								<span class="hover-value">{{ item.type }}</span>
							</div>
							<div class="hover-row">
								<span class="hover-label">成熟度状态</span>
								<el-tag
									:size="'small'"
									:type="getStatusType(item.status)">
									{{ item.status }}
								</el-tag>
							</div>
							<div class="hover-row">
								<span class="hover-label">所有者</span>
								<span class="hover-value">{{ item.owner }}</span>
							</div>
							<div class="hover-row">
								<span class="hover-label">企业项目编号</span>
								<span class="hover-value">{{ item.partNumber || '无' }}</span>
							</div>
							<div class="hover-row">
								<span class="hover-label">修改日期</span>
								<span class="hover-value">{{ item.date }}</span>
							</div>
							<div class="hover-row">
								<span class="hover-label">创建日期</span>
								<span class="hover-value">{{ item.createdDate }}</span>
							</div>
						</div>
					</el-popover>
				</div>

				<!-- 列表视图 -->
				<div
					v-else
					class="list-view">
					<el-table
						ref="productTableRef"
						:data="productList"
						style="width: 100%"
						stripe
						border
						row-key="id"
						:row-class-name="getProductRowClassName"
						@row-dblclick="handleRowDoubleClick">
						<el-table-column
							prop="name"
							label="名称"
							min-width="250"
							resizable>
							<template #default="{ row }">
								<div class="list-item-name">
									<img
										:src="row.thumbnail || defaultThumbnail"
										class="list-thumbnail"
										alt="thumbnail" />
									<div class="name-info">
										<div class="name-text">{{ row.name }}</div>
										<div
											v-if="row.description"
											class="description-text">
											{{ row.description }}
										</div>
									</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column
							prop="identifier"
							label="编号"
							width="180"
							resizable />
						<el-table-column
							prop="revision"
							label="版本"
							width="80"
							resizable />
						<el-table-column
							prop="status"
							label="状态"
							width="100"
							resizable>
							<template #default="{ row }">
								<el-tag
									:size="'small'"
									:type="getStatusType(row.status)">
									{{ row.status }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column
							prop="owner"
							label="所有者"
							width="150"
							resizable />
						<el-table-column
							prop="date"
							label="修改日期"
							width="120"
							resizable />
						<el-table-column
							label="操作"
							width="80"
							fixed="right"
							resizable>
							<template #default="{ row }">
								<el-dropdown
									trigger="click"
									placement="bottom-end"
									popper-class="card-dropdown-menu"
									:teleported="true"
									@command="(cmd: string) => handleCardCommand(cmd, row)">
									<el-icon class="dropdown-icon">
										<ArrowDown />
									</el-icon>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item command="open">
												<el-icon>
													<Document />
												</el-icon>
												打开
											</el-dropdown-item>
											<div
												class="open-with-submenu-wrapper"
												@click.stop
												@mouseenter="positionSubmenu">
												<div class="open-with-trigger">
													打开方式
													<el-icon class="submenu-arrow"><ArrowRight /></el-icon>
												</div>
												<div class="open-with-submenu">
													<div
														class="submenu-item"
														@click="handleOpenWithClick('3D Markup', row)">
														<el-icon><EditPen /></el-icon>
														<span>3D Markup</span>
													</div>
													<div
														class="submenu-item"
														@click="handleOpenWithClick('3D Navigate', row)">
														<el-icon><Compass /></el-icon>
														<span>3D Navigate</span>
													</div>
													<div
														class="submenu-item"
														@click="handleOpenWithClick('3DPlay', row)">
														<el-icon><VideoPlay /></el-icon>
														<span>3DPlay</span>
													</div>
													<div
														class="submenu-item"
														@click="handleOpenWithClick('Collaborative Lifecycle', row)">
														<el-icon><Refresh /></el-icon>
														<span>Collaborative Lifecycle</span>
													</div>
													<div
														class="submenu-item submenu-item-divided"
														@click="handleOpenWithClick('more', row)">
														<el-icon><Plus /></el-icon>
														<span>更多应用程序</span>
													</div>
												</div>
											</div>
											<el-dropdown-item command="setEnterpriseCode">设置企业项目编号</el-dropdown-item>
											<el-dropdown-item
												command="editContext"
												disabled>
												编辑配置上下文
											</el-dropdown-item>
											<el-dropdown-item command="delete">删除</el-dropdown-item>
											<el-dropdown-item
												command="revision"
												divided
												:disabled="lifecycleCmdLoading">
												<span class="part-action-menu-icon">☷</span>
												<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '修订版' }}</span>
											</el-dropdown-item>
											<el-dropdown-item
												command="newRevision"
												:disabled="lifecycleCmdLoading">
												<span class="part-action-menu-icon">↳</span>
												<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新修订版' }}</span>
											</el-dropdown-item>
											<el-dropdown-item
												command="newBranch"
												:disabled="lifecycleCmdLoading">
												<span class="part-action-menu-icon">⌘</span>
												<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新建分支' }}</span>
											</el-dropdown-item>
											<el-dropdown-item
												command="newRevisionSource"
												:disabled="lifecycleCmdLoading">
												<span class="part-action-menu-icon">⌁</span>
												<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '新修订版源' }}</span>
											</el-dropdown-item>
											<el-dropdown-item
												command="copy"
												:disabled="lifecycleCmdLoading">
												<span class="part-action-menu-icon">⧉</span>
												<span class="part-action-menu-label">{{ lifecycleCmdLoading ? '加载中...' : '复制' }}</span>
											</el-dropdown-item>
											<el-dropdown-item command="compare">比较</el-dropdown-item>
											<el-dropdown-item
												command="maturity"
												disabled>
												成熟度
											</el-dropdown-item>
											<el-dropdown-item command="lock">锁定</el-dropdown-item>
											<el-dropdown-item command="unlock">解锁</el-dropdown-item>
											<el-dropdown-item
												command="move"
												disabled>
												移动
											</el-dropdown-item>
											<el-dropdown-item
												command="share"
												disabled>
												共享
											</el-dropdown-item>
											<el-dropdown-item command="relationship">关系</el-dropdown-item>
											<el-dropdown-item
												command="relatedChanges"
												disabled>
												相关更改
											</el-dropdown-item>
											<el-dropdown-item
												command="subscribe"
												disabled>
												订阅
											</el-dropdown-item>
											<el-dropdown-item
												command="info"
												disabled>
												信息
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</div>

		<!-- 企业项目编号对话框 -->
		<el-dialog
			v-model="enterpriseDialogVisible"
			:title="`企业项目编号 - ${enterpriseCodeRows.length} 个对象`"
			width="790px"
			class="enterprise-code-dialog">
			<el-table
				ref="enterpriseTableRef"
				:data="enterpriseCodeRows"
				border
				height="270"
				row-key="id"
				@selection-change="handleEnterpriseDialogSelectionChange">
				<el-table-column
					type="selection"
					width="44" />
				<el-table-column
					prop="label"
					label="标题"
					min-width="260" />
				<el-table-column
					prop="partNumber"
					label="企业项目编号"
					min-width="360">
					<template #default="{ row }">
						<el-input
							v-model="row.partNumber"
							placeholder="无"
							size="small" />
					</template>
				</el-table-column>
			</el-table>
			<template #footer>
				<el-button
					type="primary"
					@click="handleSetEnterpriseCode">
					设置
				</el-button>
				<el-button @click="enterpriseDialogVisible = false">取消</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, h, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
	Clock,
	Box,
	FolderOpened,
	Plus,
	CirclePlus,
	ArrowLeft,
	Grid,
	Menu,
	Document,
	ArrowDown,
	ArrowRight,
	EditPen,
	Compass,
	VideoPlay,
	Upload
} from '@element-plus/icons-vue';
import { ElCheckbox, ElMessage, ElMessageBox } from 'element-plus';
import searchApi from '@/api/searchApi';
import recentApi from '@/api/recentApi';
import partDetailApi from '@/api/partDetailApi';
import type { DeleteReportItem } from '@/api/partDetailApi';
import { useBaseInfoStore, useDialogStore } from '@/store';
import dsSearchInput from '@/plugins/ds-search-input';
import { isDev } from '@/utils/env';
import { useLifecycleCommands } from '@/composables/lifecycleCommands';

const dialogStore = useDialogStore();

// 路由
const router = useRouter();

// Store
const baseInfoStore = useBaseInfoStore();

// 卡片下拉菜单定位选项：使用 fixed 定位避免页面扩大，动态计算最佳展开位置
const cardDropdownPopperOptions = {
	strategy: 'fixed' as const,
	modifiers: [
		{
			name: 'flip',
			options: {
				fallbackPlacements: ['bottom-end', 'top-end', 'bottom-start', 'top-start', 'right-start', 'left-start'],
				boundary: 'viewport'
			}
		},
		{
			name: 'preventOverflow',
			options: { boundary: 'viewport', padding: 8, altAxis: true, tether: false }
		}
	]
};

// 默认缩略图
// eslint-disable-next-line @stylistic/operator-linebreak
const defaultThumbnail =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iZjVmN2ZhIi8+CjxwYXRoIGQ9Ik0zNy41IDM3LjVWMTEyLjVIMTEyLjVWMzcuNUgzNy41WiIgZmlsbD0iI2U0ZTdlZCIvPgo8cGF0aCBkPSJNNTAgNTBINjBWNjBINTBWMzBaTTY1IDY1SDc1Vjc1SDY1VjY1WiIgZmlsbD0iIzkwOTM5OSIvPgo8L3N2Zz4=';

// 当前导航
const currentNav = ref('recent');
const sidebarCollapsed = ref(false);

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid');

// 显示全部
const showAll = ref(false);
const searchData = ref('');

// 加载状态
const loading = ref(false);

// 产品列表数据
const productList = ref<any[]>([]);
const productTableRef = ref<any>(null);
const draggingProductId = ref('');
const lifecyclePartInfo = ref<any>({});
const {
	lifecycleCmdLoading,
	openLifecycleHistoryCmd,
	openLifecycleReviseCmd,
	openLifecycleNewBranchCmd,
	openLifecycleDuplicateCmd,
	openLifecycleReviseFromCmd
} = useLifecycleCommands(lifecyclePartInfo, baseInfoStore);

interface ProductDragItem {
	'objectId': string;
	'physicalId': string;
	'physicalid': string;
	'displayName': string;
	'title': string;
	'name': string;
	'objectName': string;
	'type': string;
	'objectType': string;
	'displayType': string;
	'typeName': string;
	'ds6w:type': string;
	'ds6w:label': string;
	'ds6wg:revision': string;
	'cestamp'?: string;
}

let productDragSequence = 0;

const getProductDragObjectType = () => 'VPMReference';

const toProductDragItem = (product: any): ProductDragItem => {
	const objectType = getProductDragObjectType();
	const displayName = `${product.name || product.identifier || product.id} ${product.revision || ''}`.trim();

	return {
		'objectId': product.id,
		'physicalId': product.id,
		'physicalid': product.id,
		displayName,
		'title': displayName,
		'name': product.identifier || product.name,
		'objectName': product.identifier || product.name,
		'type': objectType,
		objectType,
		'displayType': product.type || 'Physical Product',
		'typeName': objectType,
		'ds6w:type': objectType,
		'ds6w:label': product.name,
		'ds6wg:revision': product.revision || '',
		'cestamp': product.revision || ''
	};
};

const buildProductDragPayload = (product: any) => ({
	source: {
		uuid: `TW_EngineeringRelease_HomeView_${Date.now()}_${productDragSequence++}`,
		amd: 'TW_EngineeringRelease/HomeView'
	},
	data: {
		items: [toProductDragItem(product)]
	}
});

const setProductDragData = (event: DragEvent, payload: unknown) => {
	const payloadText = JSON.stringify(payload);
	event.dataTransfer?.clearData();
	event.dataTransfer?.setData('text', payloadText);
	event.dataTransfer?.setData('text/plain', payloadText);
	try {
		event.dataTransfer?.setData('application/json', payloadText);
	} catch {
		return;
	}
};

const setProductDragImage = (event: DragEvent, product: any) => {
	if (!event.dataTransfer) return;

	const dragImage = document.createElement('div');
	dragImage.className = 'product-drag-image';
	dragImage.innerHTML = `<span class="product-drag-add">+</span><span class="product-drag-title">${product.name || ''}</span>`;
	document.body.appendChild(dragImage);
	event.dataTransfer.setDragImage(dragImage, 12, 12);
	window.setTimeout(() => {
		document.body.removeChild(dragImage);
	}, 0);
};

const handleProductDragStart = (event: DragEvent, product: any) => {
	draggingProductId.value = product.id;
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'copyMove';
	}
	setProductDragData(event, buildProductDragPayload(product));
	setProductDragImage(event, product);
};

const handleProductDragEnd = () => {
	draggingProductId.value = '';
};

const getProductRowClassName = ({ row }: { row: any }) => `product-draggable-row product-row-${row.id}`;

const bindListRowDragEvents = async () => {
	await nextTick();
	if (viewMode.value !== 'list') return;

	const tableElement = productTableRef.value?.$el as HTMLElement | undefined;
	if (!tableElement) return;

	productList.value.forEach(product => {
		const rowElement = tableElement.querySelector(`.product-row-${CSS.escape(String(product.id))}`) as HTMLElement | null;
		if (!rowElement || rowElement.dataset.dragBound === 'true') return;

		rowElement.draggable = true;
		rowElement.dataset.dragBound = 'true';
		rowElement.addEventListener('dragstart', event => handleProductDragStart(event as DragEvent, product));
		rowElement.addEventListener('dragend', handleProductDragEnd);
	});
};

watch([viewMode, productList], () => {
	bindListRowDragEvents();
});

// 企业项目编号对话框
interface EnterpriseCodeRow {
	id: string;
	label: string;
	partNumber: string;
	status?: string;
}

const enterpriseDialogVisible = ref(false);
const enterpriseCodeRows = ref<EnterpriseCodeRow[]>([]);
const selectedEnterpriseRows = ref<EnterpriseCodeRow[]>([]);

// 头部标题
const headerTitle = computed(() => {
	switch (currentNav.value) {
		case 'recent':
			return '最近';
		case 'myProducts':
			return '我的产品';
		case 'open':
			return '打开';
		default:
			return '最近';
	}
});

// 初始化时获取搜索 URL 和最近产品
onMounted(async () => {
	console.log('[HomeView] 初始化，获取基础信息');
	await baseInfoStore.fetchSpaceUrl();
	await baseInfoStore.fetchSearchUrl();
	console.log('[HomeView] 3DSpace URL:', baseInfoStore.spaceUrl);
	console.log('[HomeView] 搜索 URL:', baseInfoStore.searchUrl);

	// 默认加载最近产品
	if (currentNav.value === 'recent') {
		await fetchRecentProducts();
	}
});

// 处理导航点击
const handleNavClick = async (nav: string) => {
	currentNav.value = nav;
	console.log(`[HomeView] 切换到导航: ${nav}`);

	if (nav === 'myProducts') {
		// 点击"我的产品"时调用搜索接口
		await fetchMyProducts();
	} else if (nav === 'recent') {
		// 点击"最近"时获取最近访问的产品
		await fetchRecentProducts();
	} else if (nav === 'open') {
		openDsSearchDialog();
	}
};

const openDsSearchDialog = () => {
	dsSearchInput(searchData.value, 'product', 'PSE', '', function (value: Array<any>) {
		searchData.value = value.length !== 0 ? value.map(item => item['ds6w:label']).toString() : '';

		const selectedObject = value[0];
		const physicalId = selectedObject?.physicalid || selectedObject?.physicalId || selectedObject?.id || selectedObject?.objectId;

		if (!physicalId) {
			ElMessage.warning('无法获取选择对象的ID');
			return;
		}

		router.push({
			name: 'partDetail',
			params: {
				physicalId
			}
		});
	});
};

// 从 attributes 数组中提取属性值
const getAttributeValue = (attributes: any[], name: string): string => {
	const attr = attributes.find((a: any) => a.name === name);
	return attr ? attr.value : '';
};

// 获取我的产品
const fetchMyProducts = async () => {
	loading.value = true;
	console.log('[HomeView] 开始获取我的产品');

	try {
		// 确保已经获取了搜索 URL
		if (!baseInfoStore.searchUrl) {
			console.log('[HomeView] 搜索 URL 为空，先获取搜索 URL');
			await baseInfoStore.fetchSearchUrl();
		}

		console.log('[HomeView] 当前搜索 URL:', baseInfoStore.searchUrl);
		console.log('[HomeView] 当前 3DSpace URL:', baseInfoStore.spaceUrl);
		console.log('[HomeView] 当前用户:', baseInfoStore.currentUser);

		const response = await searchApi.searchMyProducts();
		console.log('[HomeView] 搜索响应:', response);

		// 处理搜索结果
		if (response && response.results && response.results.length > 0) {
			console.log('[HomeView] 搜索结果数量:', response.results.length);
			console.log('[HomeView] 第一条数据示例:', response.results[0]);

			productList.value = response.results.map((item: any, index: number) => {
				const attrs = item.attributes || [];

				// 从 attributes 数组中提取各字段
				const physicalid = getAttributeValue(attrs, 'physicalid');
				const label = getAttributeValue(attrs, 'ds6w:label');
				const description = getAttributeValue(attrs, 'ds6w:description');
				const identifier = getAttributeValue(attrs, 'ds6w:identifier');
				const revision = getAttributeValue(attrs, 'ds6wg:revision');
				const modified = getAttributeValue(attrs, 'ds6w:when/ds6w:modified') || getAttributeValue(attrs, 'ds6w:modified');
				const created = getAttributeValue(attrs, 'ds6w:when/ds6w:created') || getAttributeValue(attrs, 'ds6w:created');
				const responsible = getAttributeValue(attrs, 'ds6w:who/ds6w:responsible') || getAttributeValue(attrs, 'ds6w:responsible');
				const status = getAttributeValue(attrs, 'ds6w:what/ds6w:status') || getAttributeValue(attrs, 'ds6w:status');
				const type = getAttributeValue(attrs, 'ds6w:what/ds6w:type') || getAttributeValue(attrs, 'ds6w:type');
				const reserved = getAttributeValue(attrs, 'ds6w:what/ds6w:status/ds6w:reserved') || getAttributeValue(attrs, 'ds6w:reserved');
				const typeIconUrl = getAttributeValue(attrs, 'type_icon_url');
				const previewUrl = getAttributeValue(attrs, 'preview_url');
				const partNumber = getAttributeValue(attrs, 'ds6wg:EnterpriseExtension.V_PartNumber');

				// 格式化状态显示
				let statusText = '工作中';
				if (status) {
					if (status.includes('IN_WORK')) {
						statusText = '工作中';
					} else if (status.includes('RELEASED')) {
						statusText = '已发布';
					} else if (status.includes('FROZEN')) {
						statusText = '已冻结';
					} else {
						statusText = status;
					}
				}

				return {
					id: physicalid || index,
					name: label || '未命名',
					description: description || '',
					identifier: identifier || '',
					revision: revision || '',
					status: statusText,
					statusRaw: status || '',
					owner: responsible || baseInfoStore.currentUser,
					date: modified ? formatDate(modified) : created ? formatDate(created) : '-',
					createdDate: created ? formatDate(created) : '-',
					thumbnail: previewUrl || typeIconUrl || '',
					type: type || 'VPMReference',
					reserved: reserved === 'TRUE' || reserved === 'true',
					partNumber: partNumber || ''
				};
			});
			console.log('[HomeView] 产品列表已更新，数量:', productList.value.length);
			console.log('[HomeView] 解析后的第一条数据:', productList.value[0]);
		} else {
			console.log('[HomeView] 搜索结果为空');
			productList.value = [];
		}
	} catch (error) {
		console.error('[HomeView] 获取我的产品失败:', error);
		ElMessage.error('获取我的产品失败，请检查控制台日志');
		productList.value = [];
	} finally {
		loading.value = false;
	}
};

// 获取最近访问的产品
const fetchRecentProducts = async () => {
	loading.value = true;
	console.log('[HomeView] 开始获取最近产品');

	try {
		// 确保已经获取了 3DSpace URL
		if (!baseInfoStore.spaceUrl) {
			console.log('[HomeView] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		console.log('[HomeView] 当前 3DSpace URL:', baseInfoStore.spaceUrl);
		console.log('[HomeView] 当前 SecurityContext:', baseInfoStore.securityContext);

		const response = await recentApi.getRecentProducts();
		console.log('[HomeView] 最近产品响应:', response);

		// 处理返回结果
		if (response && response.results && response.results.length > 0) {
			console.log('[HomeView] 最近产品数量:', response.results.length);
			console.log('[HomeView] 第一条数据示例:', response.results[0]);

			productList.value = response.results.map((item: any, index: number) => {
				const attrs = item.attributes || [];

				// 从 attributes 数组中提取各字段
				const physicalid = getAttributeValue(attrs, 'physicalid');
				const label = getAttributeValue(attrs, 'ds6w:label');
				const description = getAttributeValue(attrs, 'ds6w:description');
				const identifier = getAttributeValue(attrs, 'ds6w:identifier');
				const revision = getAttributeValue(attrs, 'ds6wg:revision');
				const modified = getAttributeValue(attrs, 'ds6w:modified');
				const created = getAttributeValue(attrs, 'ds6w:created');
				const responsible = getAttributeValue(attrs, 'ds6w:responsible');
				const status = getAttributeValue(attrs, 'ds6w:status');
				const type = getAttributeValue(attrs, 'ds6w:type');
				const reserved = getAttributeValue(attrs, 'ds6w:reserved');
				const typeIconUrl = getAttributeValue(attrs, 'type_icon_url');
				const previewUrl = getAttributeValue(attrs, 'preview_url');
				const partNumber = getAttributeValue(attrs, 'ds6wg:EnterpriseExtension.V_PartNumber');

				// 格式化状态显示
				let statusText = '工作中';
				if (status) {
					if (status.includes('IN_WORK')) {
						statusText = '工作中';
					} else if (status.includes('RELEASED')) {
						statusText = '已发布';
					} else if (status.includes('FROZEN')) {
						statusText = '已冻结';
					} else {
						statusText = status;
					}
				}

				return {
					id: physicalid || index,
					name: label || '未命名',
					description: description || '',
					identifier: identifier || '',
					revision: revision || '',
					status: statusText,
					statusRaw: status || '',
					owner: responsible || baseInfoStore.currentUser,
					date: modified ? formatDate(modified) : created ? formatDate(created) : '-',
					createdDate: created ? formatDate(created) : '-',
					thumbnail: previewUrl || typeIconUrl || '',
					type: type || 'VPMReference',
					reserved: reserved === 'TRUE' || reserved === 'true',
					partNumber: partNumber || ''
				};
			});
			console.log('[HomeView] 最近产品列表已更新，数量:', productList.value.length);
			console.log('[HomeView] 解析后的第一条数据:', productList.value[0]);
		} else {
			console.log('[HomeView] 最近产品为空');
			productList.value = [];
		}
	} catch (error) {
		console.error('[HomeView] 获取最近产品失败:', error);
		ElMessage.error('获取最近产品失败，请检查控制台日志');
		productList.value = [];
	} finally {
		loading.value = false;
	}
};

// 加载默认数据（最近）
const loadDefaultData = () => {
	console.log('[HomeView] 加载默认数据');
	productList.value = [
		{
			id: '1',
			name: 'V - A',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '2',
			name: '物理产品0000005 - A',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '3',
			name: 'PPR Context0000004 - A',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '4',
			name: '物理产品0000166 - AA.1',
			status: '已发布',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '5',
			name: '物理产品0000166 - AA.2',
			status: '已发布',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '6',
			name: '总成1 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '7',
			name: '总成2 - AA.2',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '8',
			name: '总成222 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/3/',
			thumbnail: ''
		},
		{
			id: '9',
			name: '测试批量连接2 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		},
		{
			id: '10',
			name: '测试批量连接 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		},
		{
			id: '11',
			name: '测试总成0401 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		},
		{
			id: '12',
			name: '0401总成 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		},
		{
			id: '13',
			name: 'V5 - AA.1',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		},
		{
			id: '14',
			name: 'test12121212121212 - AA.1',
			status: '已发布',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		},
		{
			id: '15',
			name: 'TestProduct - A',
			status: '工作中',
			owner: 'Admin Platform',
			date: '2026/4/',
			thumbnail: ''
		}
	];
};

// 格式化日期
const formatDate = (dateString: string): string => {
	if (!dateString) return '-';
	try {
		const date = new Date(dateString);
		return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
	} catch {
		return dateString;
	}
};

// 处理创建产品
const handleCreateProduct = () => {
	dialogStore.clearCreateContext();
	dialogStore.openProductDialog();
};

// 处理创建零件
const handleCreatePart = () => {
	dialogStore.clearCreateContext();
	dialogStore.openPartDialog();
};

const handleImportFromSpreadsheet = async () => {
	try {
		const topWindow = (window.top || window.parent || window) as any;

		// 尝试通过 hash 跳转打开导入功能
		// 导入 widget 的 ID 可能是 ENOXIMPT_AP 或类似名称
		const widgetId = 'ENOXIMPT_AP';
		const encoded = encodeURIComponent(JSON.stringify({}));
		const hashSuffix = `/app:${widgetId}/content:X3DContentId=${encoded}`;

		try {
			const currentHash = topWindow.location.hash || '';
			const baseHash = currentHash.replace(/\/app:[^/]+(?:\/content:[^]*)?$/, '');
			topWindow.location.hash = (baseHash || '#/tabId:New%20Tab') + hashSuffix;
		} catch {
			(window.top || window).location.href = `${window.location.origin}/3ddashboard/#/tabId:New%20Tab${hashSuffix}`;
		}
	} catch (error) {
		console.error('[HomeView] 打开导入页面失败:', error);
		ElMessage.error('打开导入页面失败');
	}
};

// 获取状态类型
const getStatusType = (status: string) => {
	switch (status) {
		case '已发布':
			return 'success';
		case '工作中':
			return 'primary';
		case '已冻结':
			return 'info';
		default:
			return 'info';
	}
};

// ========== 打开方式 ==========

const OPEN_WITH_APP_ID: Record<string, string> = {
	'3D Markup': 'ENOR3D_AP',
	'3D Navigate': 'ENXDISC_AP',
	'3DPlay': 'X3DPLAW_AP',
	'Collaborative Lifecycle': 'ENOLCMI_AP',
	'compare': 'ENOCOMP_AP',
	'relationship': 'ENORIPE_AP'
};

const X3D_OBJECT_TAXONOMIES = [
	'PLMEntity',
	'PLMReference',
	'PLMCoreReference',
	'LPAbstractReference',
	'PHYSICALAbstractReference',
	'VPMReference',
	'3DPart',
	'XCADExtension',
	'CN_PartInfo'
];

const pickRowField = (row: any, ...keys: string[]): string => {
	for (const k of keys) {
		const v = row?.[k];
		if (v !== undefined && v !== null && v !== '') return String(v);
	}
	return '';
};

const buildX3DContentPayload = (item: any) => {
	const objectId = pickRowField(item, 'id', 'physicalid', 'mxid', 'ds6w:identifier', 'resourceid');
	const objectType = pickRowField(item, 'type', 'ds6w:type') || 'VPMReference';
	const displayName = pickRowField(item, 'name', 'ds6w:label', 'label', 'title') || objectId;

	return {
		protocol: '3DXContent',
		version: '2.0',
		source: 'X3DSEAR_AP',
		widgetId: '',
		data: {
			items: [
				{
					objectId,
					objectType,
					envId: 'OnPremise',
					serviceId: '3DSpace',
					displayName,
					displayType: objectType,
					contextId: baseInfoStore.securityContext || '',
					objectTaxonomies: X3D_OBJECT_TAXONOMIES
				}
			]
		}
	};
};

const getDashboardUrl = (): string => {
	try {
		const stored = window.localStorage.getItem('dashboardUrl');
		if (stored) return stored.replace(/\/api\/.*$/, '');
	} catch {
		/* ignore */
	}
	return `${window.location.origin}/3ddashboard`;
};

const openWithHashJump = (appName: string, item: any) => {
	const appId = OPEN_WITH_APP_ID[appName];
	if (!appId) {
		ElMessage.warning(`未知的打开方式：${appName}`);
		return;
	}

	const objectId = pickRowField(item, 'id', 'physicalid');
	if (!objectId) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	const payload = buildX3DContentPayload(item);
	const encoded = encodeURIComponent(JSON.stringify(payload));
	const hashSuffix = `/app:${appId}/content:X3DContentId=${encoded}`;

	try {
		const top: any = window.top || window.parent || window;
		const currentHash = top.location.hash || '';
		const baseHash = currentHash.replace(/\/app:[^/]+(?:\/content:[^]*)?$/, '');
		top.location.hash = (baseHash || '#/tabId:New%20Tab') + hashSuffix;
		console.log(`[工具栏] 打开方式: ${appName} → hash 跳转`);
	} catch {
		const dashboardUrl = getDashboardUrl();
		const fullUrl = `${dashboardUrl}/#/tabId:New%20Tab${hashSuffix}`;
		(window.top || window).location.href = fullUrl;
		console.log('[打开方式] 修改父 hash 失败，回退到顶层跳转');
	}
};

const openNativeCompass = async (item: any) => {
	if (isDev) {
		ElMessage.info('开发模式下无法打开原生罗盘');
		return;
	}

	const objectId = pickRowField(item, 'id', 'physicalid');
	if (!objectId) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	try {
		const topWin: any = window.top || window.parent || window;
		const ctx = topWin.requirejs?.s?.contexts?._ || topWin.require?.s?.contexts?._;

		// 设置 X3DContent
		const payload = buildX3DContentPayload(item);
		const X3DContent = ctx?.defined?.['DS/i3DXCompass/X3DContent'];
		if (X3DContent?.setX3DContent) {
			X3DContent.setX3DContent(payload);
			console.log('[更多应用程序] X3DContent.setX3DContent() 已设置');
		}

		// 打开罗盘
		const CompassManager = ctx?.defined?.['DS/Dashboard/CompassManager'];
		if (CompassManager?.open) {
			CompassManager.open();
			console.log('[更多应用程序] CompassManager.open() 成功');
		} else {
			// 备用方式：点击罗盘按钮
			topWin.document.querySelector('.compass-small')?.click();
		}
	} catch (e) {
		console.warn('[更多应用程序] 打开罗盘失败:', e);
	}
};

const positionSubmenu = (e: MouseEvent) => {
	const wrapper = e.currentTarget as HTMLElement;
	const submenu = wrapper.querySelector('.open-with-submenu') as HTMLElement;
	if (!submenu) return;

	const triggerRect = wrapper.getBoundingClientRect();
	const menuHeight = submenu.scrollHeight || 140;
	const viewportHeight = window.innerHeight;

	let top = triggerRect.top;
	// 如果向下展开会超出视口，则向上调整
	if (top + menuHeight > viewportHeight - 8) {
		top = viewportHeight - menuHeight - 8;
	}
	if (top < 8) top = 8;

	submenu.style.top = `${top}px`;
	submenu.style.left = `${triggerRect.right}px`;
};

const handleOpenWithClick = (appName: string, item: any) => {
	if (appName === 'more') {
		openNativeCompass(item);
	} else {
		openWithHashJump(appName, item);
	}
	// 关闭所有弹出的 dropdown
	document.body.click();
};

const getDeleteTargetLabel = (target: any) => target?.name || target?.title || target?.identifier || target?.id || '-';

const showDeleteReportDialog = (report: DeleteReportItem[]) => {
	ElMessageBox.alert(
		h('div', { class: 'delete-report-dialog-body' }, [
			h('div', { class: 'delete-report-count' }, `记录总数： ${report.length}`),
			h('div', { class: 'delete-report-table' }, [
				h('div', { class: 'delete-report-header' }, [
					h('span', '状态'),
					h('span', '标题'),
					h('span', '类型'),
					h('span', '修订版'),
					h('span', '成熟度状态'),
					h('span', '锁定'),
					h('span', '消息')
				]),
				...report.map(item =>
					h('div', { class: 'delete-report-row' }, [
						h('span', { class: 'delete-report-status' }, '×'),
						h(
							'span',
							{ title: String(item['attribute[PLMEntity.V_Name]'] || item.name || '') },
							String(item['attribute[PLMEntity.V_Name]'] || item.name || '-')
						),
						h('span', String(item.displaytype || item.type || '-')),
						h('span', String(item.revision || '-')),
						h('span', String(item.stateUserName || item.current || '-')),
						h('span', String(item.reserved === 'TRUE' ? '🔑' : '🔓')),
						h('span', { title: String(item.error || '') }, String(item.error || '-'))
					])
				)
			])
		]),
		'报告',
		{
			draggable: true,
			customClass: 'delete-report-message-box',
			confirmButtonText: '关闭'
		}
	);
};

const confirmDeleteProduct = async (item: any) => {
	const includeStructure = ref(false);
	const unrecoverableChecked = ref(false);

	const updateConfirmButtonDisabled = () => {
		const confirmButton = document.querySelector('.el-message-box__btns .el-button--primary') as HTMLButtonElement;
		if (confirmButton) {
			const shouldDisable = includeStructure.value && !unrecoverableChecked.value;
			confirmButton.disabled = shouldDisable;
			if (shouldDisable) {
				confirmButton.classList.add('is-disabled');
			} else {
				confirmButton.classList.remove('is-disabled');
			}
		}
	};

	await ElMessageBox({
		title: `删除 - ${getDeleteTargetLabel(item)}`,
		type: 'warning',
		draggable: true,
		showCancelButton: true,
		confirmButtonText: '删除',
		cancelButtonText: '取消',
		beforeClose: (action, instance, done) => {
			if (action === 'confirm' && includeStructure.value && !unrecoverableChecked.value) return;
			done();
		},
		message: () =>
			h('div', { class: 'delete-confirm-content' }, [
				h('div', { class: 'delete-confirm-message' }, [
					h('div', `是否要删除 ${getDeleteTargetLabel(item)}?`),
					h('div', '此操作是永久性的且无法撤消。')
				]),
				h('div', { class: 'delete-confirm-checkboxes' }, [
					h(
						ElCheckbox,
						{
							'modelValue': includeStructure.value,
							'onUpdate:modelValue': (value: unknown) => {
								includeStructure.value = value === true;
								setTimeout(() => updateConfirmButtonDisabled(), 0);
							}
						},
						() => '包括结构对象'
					),
					includeStructure.value
						? h(
								ElCheckbox,
								{
									'modelValue': unrecoverableChecked.value,
									'onUpdate:modelValue': (value: unknown) => {
										unrecoverableChecked.value = value === true;
										setTimeout(() => updateConfirmButtonDisabled(), 0);
									}
								},
								() => '我知道无法恢复删除的对象。'
							)
						: null
				])
			])
	});
	return includeStructure.value;
};

const refreshCurrentHomeView = async () => {
	if (currentNav.value === 'myProducts') {
		await fetchMyProducts();
		return;
	}
	if (currentNav.value === 'recent') {
		await fetchRecentProducts();
		return;
	}
	productList.value = productList.value.filter(product => product.id);
};

const handleDeleteProduct = async (item: any) => {
	const physicalId = item?.id || item?.physicalid || item?.physicalId;
	if (!physicalId) {
		ElMessage.warning('未找到要删除的对象 physicalid');
		return;
	}
	try {
		const includeStructure = await confirmDeleteProduct(item);
		loading.value = true;
		const accessResponse = await partDetailApi.checkDeleteAccess([physicalId]);
		const hasDeleteAccess =
			accessResponse.status !== 'failure' && (accessResponse.results || []).every((result: any) => result?.hasDeleteAccess === true);
		if (!hasDeleteAccess) {
			ElMessage.error('没有删除权限');
			if (accessResponse.report?.length) showDeleteReportDialog(accessResponse.report);
			return;
		}
		const deleteResponse = await partDetailApi.deleteStructure([physicalId], includeStructure);
		if (deleteResponse.status === 'success') {
			ElMessage.success('删除成功');
			await refreshCurrentHomeView();
			return;
		}
		if (deleteResponse.report?.length) {
			showDeleteReportDialog(deleteResponse.report);
		} else {
			ElMessage.error('删除失败');
		}
	} catch (error: any) {
		if (error === 'cancel' || error === 'close') return;
		console.error('[HomeView] 删除失败:', error);
		if (error?.report?.length) {
			showDeleteReportDialog(error.report);
		} else {
			ElMessage.error('删除失败');
		}
	} finally {
		loading.value = false;
	}
};

const setLifecyclePartInfo = (item: any) => {
	lifecyclePartInfo.value = {
		'ds6w:label': item?.name,
		'label': item?.name,
		'displayName': item?.name,
		'name': item?.identifier || item?.name,
		'ds6wg:revision': item?.revision || '',
		'revision': item?.revision || '',
		'ds6w:status': item?.statusRaw || item?.status,
		'status': item?.status,
		'ds6w:type': item?.type || 'VPMReference',
		'type': item?.type || 'VPMReference',
		'typeDisplayName': item?.type || '物理产品',
		'displayType': item?.type || '物理产品',
		'type_icon_url': item?.thumbnail || '',
		'thumbnail_2d': item?.thumbnail || ''
	};
};

const handleLifecycleCardCommand = async (command: string, item: any) => {
	const physicalId = item?.id || item?.physicalid || item?.physicalId;
	if (!physicalId) {
		ElMessage.warning('未找到当前对象物理ID');
		return;
	}
	setLifecyclePartInfo(item);
	if (command === 'revision') {
		await openLifecycleHistoryCmd(physicalId);
		return;
	}
	if (command === 'newRevision') {
		await openLifecycleReviseCmd(physicalId);
		return;
	}
	if (command === 'newBranch') {
		await openLifecycleNewBranchCmd(physicalId);
		return;
	}
	if (command === 'newRevisionSource') {
		await openLifecycleReviseFromCmd(physicalId);
		return;
	}
	if (command === 'copy') {
		await openLifecycleDuplicateCmd(physicalId);
	}
};

// 处理卡片下拉菜单命令
const handleCardCommand = async (command: string, item: any) => {
	if (command === 'open') {
		handleRowDoubleClick(item);
	} else if (command === 'setEnterpriseCode') {
		openEnterpriseCodeDialog(item);
	} else if (command === 'delete') {
		handleDeleteProduct(item);
	} else if (command === 'compare') {
		handleOpenWithClick('compare', item);
	} else if (command === 'relationship') {
		handleOpenWithClick('relationship', item);
	} else if (command === 'lock') {
		handleLockItem(item);
	} else if (command === 'unlock') {
		handleUnlockItem(item);
	} else if (['revision', 'newRevision', 'newBranch', 'newRevisionSource', 'copy'].includes(command)) {
		await handleLifecycleCardCommand(command, item);
	}
};

const handleLockItem = async (item: any) => {
	if (!item || !item.id) {
		ElMessage.warning('无法获取对象ID');
		return;
	}
	try {
		await partDetailApi.reserveOrUnreserve({
			operation: 'reserve',
			urls: [`model/bus/${item.id}`],
			isMultiSel: false
		});
		ElMessage.success('锁定成功');
		await refreshCurrentHomeView();
	} catch (error) {
		console.error('[HomeView] 锁定失败:', error);
		ElMessage.error('锁定失败');
	}
};

const handleUnlockItem = async (item: any) => {
	if (!item || !item.id) {
		ElMessage.warning('无法获取对象ID');
		return;
	}
	try {
		await partDetailApi.reserveOrUnreserve({
			operation: 'unreserve',
			urls: [`model/bus/${item.id}`],
			isMultiSel: false
		});
		ElMessage.success('解锁成功');
		await refreshCurrentHomeView();
	} catch (error) {
		console.error('[HomeView] 解锁失败:', error);
		ElMessage.error('解锁失败');
	}
};

// 打开企业项目编号对话框
const openEnterpriseCodeDialog = (item: any) => {
	enterpriseCodeRows.value = [
		{
			id: item.id || '',
			label: item.name || '-',
			partNumber: item.partNumber || '',
			status: item.statusRaw || item.status
		}
	];
	selectedEnterpriseRows.value = [...enterpriseCodeRows.value];
	enterpriseDialogVisible.value = true;
};

// 处理企业项目编号对话框选择变化
const handleEnterpriseDialogSelectionChange = (rows: EnterpriseCodeRow[]) => {
	selectedEnterpriseRows.value = rows;
};

// 设置企业项目编号
const handleSetEnterpriseCode = async () => {
	const rows = selectedEnterpriseRows.value.length ? selectedEnterpriseRows.value : enterpriseCodeRows.value;
	const notEditableRows = rows.filter(row => !row.status?.includes('IN_WORK') && row.status !== '工作中');

	if (notEditableRows.length) {
		ElMessage.warning('仅工作中状态的对象支持设置企业项目编号');
		return;
	}

	const references = rows.map(row => ({
		physicalid: row.id,
		partNumber: row.partNumber
	}));

	try {
		await partDetailApi.setPartNumbers(references);

		// 更新本地数据
		rows.forEach(row => {
			const product = productList.value.find(p => p.id === row.id);
			if (product) {
				product.partNumber = row.partNumber;
			}
		});

		enterpriseDialogVisible.value = false;
		ElMessage.success('企业项目编号已更新');
	} catch (error) {
		console.error('[HomeView] 设置企业项目编号失败:', error);
		ElMessage.error('设置企业项目编号失败');
	}
};

// 处理双击零件
const handleRowDoubleClick = (row: any) => {
	console.log('[HomeView] 双击零件:', row);
	if (row && row.id) {
		console.log('[HomeView] 跳转到零件详情页，physicalId:', row.id);
		router.push({
			name: 'partDetail',
			params: {
				physicalId: row.id
			}
		});
	} else {
		ElMessage.warning('无法获取零件ID');
	}
};

// 初始化加载默认数据
loadDefaultData();

// 初始化 3DE 拖拽功能
let dropZoneCleanup: (() => void) | null = null;

const initDragAndDrop = () => {
	const mainContent = document.getElementById('mainContent');
	if (!mainContent) return;

	// @ts-expect-error parent is provided by the 3DDashboard host
	if (parent && parent.require) {
		// @ts-expect-error parent is provided by the 3DDashboard host
		parent.require(['DS/DataDragAndDrop/DataDragAndDrop'], (DataDragAndDrop: any) => {
			console.log('[HomeView] 初始化拖拽功能');

			DataDragAndDrop.droppable(mainContent, {
				drop: async (data: string) => {
					console.log('[HomeView] 拖拽数据:', data);
					try {
						const jsonData = JSON.parse(data);
						const items = jsonData.data?.items || [];

						// 检查是否拖拽了多个对象
						if (items.length > 1) {
							ElMessage.warning('只能在单个对象上执行打开');
							mainContent.classList.remove('drag-over');
							return;
						}

						if (items.length === 1) {
							const physicalId = items[0]?.objectId;
							if (physicalId) {
								console.log('[HomeView] 拖拽零件，跳转到详情页，physicalId:', physicalId);
								router.push({
									name: 'partDetail',
									params: {
										physicalId: physicalId
									}
								});
								ElMessage.success('加载零件信息成功');
							}
						}
					} catch (error) {
						console.error('[HomeView] 解析拖拽数据失败:', error);
						ElMessage.error('解析拖拽数据失败');
					} finally {
						mainContent.classList.remove('drag-over');
					}
				},
				enter: () => {
					console.log('[HomeView] 拖拽进入');
					mainContent.classList.add('drag-over');
				},
				over: () => {},
				leave: () => {
					console.log('[HomeView] 拖拽离开');
					mainContent.classList.remove('drag-over');
				}
			});

			dropZoneCleanup = () => {
				// 清理拖拽绑定
				DataDragAndDrop.unbind(mainContent);
			};
		});
	}
};

// 页面加载时初始化拖拽
onMounted(() => {
	// 延迟初始化拖拽，确保 DOM 已渲染
	setTimeout(() => {
		initDragAndDrop();
	}, 500);
});

onUnmounted(() => {
	if (dropZoneCleanup) {
		dropZoneCleanup();
	}
});
</script>

<style lang="scss" scoped>
.engineering-release-container {
	display: flex;
	height: 100vh;
	background-color: #f5f7fa;

	// 左侧导航栏
	.sidebar {
		position: relative;
		width: 200px;
		background-color: #fff;
		border-right: 1px solid #e4e7ed;
		padding: 16px 0;
		overflow-y: auto;
		transition: width 0.2s ease;

		&.collapsed {
			width: 56px;

			.section-title,
			.nav-item span {
				display: none;
			}

			.sidebar-section {
				margin-bottom: 12px;
			}

			.nav-item {
				justify-content: center;
				padding: 12px 0;

				.el-icon {
					margin-right: 0;
					font-size: 18px;
				}

				&.active {
					border-right: 2px solid #409eff;
				}
			}
		}

		.sidebar-section {
			margin-bottom: 24px;

			.section-title {
				padding: 0 16px;
				font-size: 12px;
				color: #909399;
				margin-bottom: 8px;
				text-transform: uppercase;
			}

			.nav-item {
				display: flex;
				align-items: center;
				padding: 10px 16px;
				cursor: pointer;
				transition: all 0.3s;
				color: #606266;

				.el-icon {
					margin-right: 8px;
					font-size: 16px;
				}

				span {
					font-size: 14px;
				}

				&:hover {
					background-color: #f5f7fa;
					color: #409eff;
				}

				&.active {
					background-color: #ecf5ff;
					color: #409eff;
					border-right: 2px solid #409eff;
				}
			}
		}
	}

	// 主内容区
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: all 0.3s;

		&.drag-over {
			background-color: #ecf5ff;
			box-shadow: inset 0 0 0 2px #409eff;
		}

		// 顶部工具栏
		.content-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 12px 20px;
			background-color: #fff;
			border-bottom: 1px solid #e4e7ed;

			.header-left {
				display: flex;
				align-items: center;
				gap: 12px;

				.back-icon {
					font-size: 18px;
					color: #606266;
					cursor: pointer;
					transition: transform 0.2s ease;

					&.collapsed {
						transform: rotate(180deg);
					}

					&:hover {
						color: #409eff;
					}
				}

				.header-title {
					font-size: 16px;
					font-weight: 600;
					color: #303133;
				}
			}

			.header-right {
				display: flex;
				align-items: center;
				gap: 16px;

				.view-toggle {
					display: flex;
					gap: 8px;

					.el-icon {
						font-size: 20px;
						color: #909399;
						cursor: pointer;
						padding: 4px;
						border-radius: 4px;
						transition: all 0.3s;

						&:hover {
							background-color: #f5f7fa;
							color: #606266;
						}

						&.active {
							color: #409eff;
							background-color: #ecf5ff;
						}
					}
				}
			}
		}

		// 产品列表
		.product-list {
			flex: 1;
			padding: 20px;
			overflow-y: auto;
			background-color: #f5f7fa;

			// 网格视图
			.grid-view {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
				gap: 20px;

				.product-card {
					background-color: #fff;
					border: 1px solid #e4e7ed;
					border-radius: 4px;
					overflow: hidden;
					transition: all 0.3s;
					cursor: pointer;

					&.dragging {
						opacity: 0.6;
					}

					&:hover {
						box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
						border-color: #c0c4cc;
					}

					.card-thumbnail {
						width: 100%;
						height: 140px;
						background-color: #f5f7fa;
						display: flex;
						align-items: center;
						justify-content: center;
						overflow: hidden;

						img {
							width: 100%;
							height: 100%;
							object-fit: contain;
						}
					}

					.card-info {
						padding: 12px;

						.card-title {
							display: flex;
							align-items: center;
							gap: 6px;
							margin-bottom: 8px;
							font-size: 13px;
							color: #303133;

							.type-icon {
								font-size: 14px;
								color: #409eff;
							}

							.name {
								flex: 1;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}

							.dropdown-icon {
								font-size: 12px;
								color: #909399;
								cursor: pointer;
							}
						}

						.card-meta {
							display: flex;
							flex-direction: column;
							gap: 4px;
							font-size: 12px;
							color: #909399;

							.meta-row {
								display: flex;
								align-items: center;
								gap: 6px;
								flex-wrap: wrap;
							}

							.meta-row-bottom {
								justify-content: space-between;
							}

							.owner {
								color: #606266;
							}

							.dropdown-icon {
								font-size: 12px;
								cursor: pointer;
							}
						}
					}
				}
			}

			// 列表视图
			.list-view {
				background-color: #fff;
				border-radius: 4px;
				padding: 16px;

				.list-item-name {
					display: flex;
					align-items: center;
					gap: 12px;

					.list-thumbnail {
						width: 40px;
						height: 40px;
						object-fit: contain;
						border-radius: 4px;
						background-color: #f5f7fa;
					}

					.name-info {
						display: flex;
						flex-direction: column;
						gap: 4px;
						cursor: default;

						.name-text {
							font-size: 14px;
							color: #303133;
							font-weight: 500;
						}

						.description-text {
							font-size: 12px;
							color: #909399;
						}
					}
				}
			}
		}
	}
}
</style>

<style lang="scss">
.card-dropdown {
	position: relative;
}

.card-dropdown-menu {
	position: fixed !important;

	.el-dropdown-menu__item {
		font-size: 12px;
		padding: 0 7px;
		line-height: 23px;
		height: 23px;
	}

	.el-dropdown-menu {
		max-width: 200px;
		overflow: visible;
		padding: 0;
	}
}

.open-with-submenu-wrapper {
	position: relative;

	.open-with-trigger {
		display: flex;
		align-items: center;
		padding: 0 7px;
		font-size: 12px;
		line-height: 23px;
		cursor: pointer;
		color: var(--el-text-color-regular);
		white-space: nowrap;

		&:hover {
			background-color: var(--el-color-primary-light-9);
			color: var(--el-color-primary);
		}

		.submenu-arrow {
			margin-left: 7px;
			font-size: 12px;
		}
	}

	.open-with-submenu {
		display: none;
		position: fixed;
		left: 0;
		top: 0;
		min-width: 150px;
		background: #fff;
		border: 1px solid var(--el-border-color-light);
		border-radius: 4px;
		box-shadow: var(--el-box-shadow-light);
		padding: 4px 0;
		z-index: 2050;

		.submenu-item {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 0 7px;
			font-size: 12px;
			line-height: 23px;
			cursor: pointer;
			color: var(--el-text-color-regular);
			white-space: nowrap;

			&:hover {
				background-color: var(--el-color-primary-light-9);
				color: var(--el-color-primary);
			}
		}

		.submenu-item-divided {
			margin-top: 2px;
			border-top: 1px solid var(--el-border-color-lighter);
			padding-top: 4px;
		}
	}

	&:hover .open-with-submenu {
		display: block;
	}
}

.card-hover-popover {
	.card-hover-info {
		.hover-row {
			display: flex;
			align-items: center;
			margin-bottom: 8px;
			font-size: 13px;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.hover-label {
			width: 100px;
			text-align: right;
			color: #909399;
			margin-right: 12px;
			flex-shrink: 0;
		}

		.hover-value {
			flex: 1;
			color: #303133;
		}
	}
}

/* 删除确认对话框样式 */
.delete-confirm-content {
	.delete-confirm-checkboxes {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 15px;
	}
}
</style>
