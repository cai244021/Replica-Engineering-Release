<template>
	<div
		id="partDetailContainer"
		class="part-detail-container">
		<!-- 零件详细信息区域（整个区域支持拖拽） -->
		<div
			id="dropZone"
			:class="['part-info-panel', { collapsed: !showHeader }]">
			<!-- 右上角控制区：模式切换 + 折叠箭头 -->
			<div class="top-right-controls">
				<div class="mode-switch-container">
					<el-button
						:size="'small'"
						circle
						class="mode-icon-btn"
						:title="queryModeStore.isDbMode ? '数据库模式 (剩余 ' + queryModeStore.countdownText + ')' : '索引模式'"
						@click="handleModeSwitch">
						<!-- 数据库模式图标：圆柱+链接 -->
						<svg
							v-if="queryModeStore.isDbMode"
							width="16"
							height="16"
							viewBox="0 0 24 24">
							<path
								fill="#777"
								d="M12 2C7 2 3 4 3 6.5v11C3 20 7 22 12 22s9-2 9-4.5v-11C21 4 17 2 12 2zm0 2c4 0 7 1.5 7 2.5S16 9 12 9 5 7.5 5 6.5 8 4 12 4zm-7 4.8c2 1.2 5 1.7 7 1.7s5-.5 7-1.7v2.5c0 1-3 2.5-7 2.5s-7-1.5-7-2.5V8.8zm0 5c2 1.2 5 1.7 7 1.7s5-.5 7-1.7v2.5c0 1-3 2.5-7 2.5s-7-1.5-7-2.5v-2.5z" />
						</svg>
						<!-- 索引模式图标：3x3 九宫格 -->
						<svg
							v-else
							width="16"
							height="16"
							viewBox="0 0 24 24">
							<path
								fill="#777"
								d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
						</svg>
					</el-button>
				</div>
				<!-- 打开详细信息占位按钮 -->
				<div class="detail-placeholder-btn">
					<el-button
						:size="'small'"
						circle
						class="info-icon-btn"
						title="打开详细信息">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor">
							<path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
						</svg>
					</el-button>
				</div>
				<div
					class="panel-toggle"
					:title="showHeader ? '收起上方详情' : '展开上方详情'"
					@click="toggleHeader">
					<span :class="[showHeader ? 'triangle-up' : 'triangle-down']"></span>
				</div>
			</div>
			<div
				v-show="!showHeader"
				class="summary-bar">
				<span class="summary-title">{{ partInfo?.['ds6w:label'] || '-' }}</span>
				<span class="summary-revision">{{ partInfo?.['ds6wg:revision'] || '' }}</span>
				<span
					class="enterprise-code-link"
					@click="openEnterpriseCodeDialogForParent">
					{{ getParentEnterpriseCode() }}
				</span>
				<el-tag
					:type="getStatusType(partInfo?.['ds6w:status'])"
					size="small"
					class="status-tag"
					@click="openMaturityDialogForParent">
					{{ formatStatus(partInfo?.['ds6w:status']) }}
				</el-tag>
				<span class="summary-owner">{{ partInfo?.['owner'] || '-' }}</span>
			</div>
			<!-- 信息区域容器（占70%） -->
			<div
				v-show="showHeader"
				class="info-container">
				<!-- 第一列：返回按钮 + 缩略图 -->
				<div class="part-column first-column">
					<el-icon
						class="back-icon"
						title="主页"
						@click="handleBack">
						<HomeFilled />
					</el-icon>
					<div class="thumbnail-container">
						<img
							:src="partInfo?.['preview_url'] || partInfo?.['thumbnail_2d'] || defaultThumbnail"
							alt="零件缩略图" />
					</div>
				</div>

				<!-- 第二列：标题+版本、企业编码、成熟度状态、所有者 -->
				<div class="part-column second-column">
					<!-- 标题和版本（放在最上面） -->
					<div class="title-row">
						<span class="title-text">{{ partInfo?.['ds6w:label'] || '-' }}</span>
						<span class="revision-text">{{ partInfo?.['ds6wg:revision'] || '' }}</span>
					</div>
					<div class="info-row">
						<span class="info-label">企业项目编号</span>
						<span
							class="enterprise-code-link"
							@click="openEnterpriseCodeDialogForParent">
							{{ getParentEnterpriseCode() }}
						</span>
					</div>
					<div class="info-row">
						<span class="info-label">成熟度状态</span>
						<el-tag
							:type="getStatusType(partInfo?.['ds6w:status'])"
							size="small"
							class="status-tag"
							@click="openMaturityDialogForParent">
							{{ formatStatus(partInfo?.['ds6w:status']) }}
						</el-tag>
						<el-icon class="dropdown-icon"><ArrowDown /></el-icon>
					</div>
					<div class="info-row">
						<span class="info-label">所有者</span>
						<span class="info-value">{{ partInfo?.['owner'] || '-' }}</span>
					</div>
				</div>

				<!-- 第三列：修改日期、类型 -->
				<div class="part-column third-column">
					<div class="info-row">
						<span class="info-label">修改日期</span>
						<span class="info-value">{{ formatDateTime(partInfo?.['ds6w:modified']) }}</span>
					</div>
					<div class="info-row">
						<span class="info-label">类型</span>
						<span class="info-value">{{ partInfo?.['ds6w:type'] || '-' }}</span>
					</div>
				</div>

				<!-- 第四列：描述 -->
				<div class="part-column fourth-column">
					<span class="description-label">{{ partInfo?.['ds6w:description'] || '无描述' }}</span>
				</div>
			</div>

			<!-- 右侧预留区域（占30%） -->
			<div
				v-show="showHeader"
				class="reserved-area"></div>
		</div>

		<!-- 子级结构表格 -->
		<div
			id="childrenDropZone"
			class="children-section">
			<div class="section-header">
				<div class="header-left">
					<span class="section-title">子级</span>
					<span class="data-count">({{ childrenData.length }})</span>
				</div>
				<div class="toolbar">
					<el-dropdown
						trigger="click"
						placement="bottom-start"
						popper-class="children-create-dropdown"
						:teleported="true"
						:disabled="isCreateMenuDisabled"
						@command="handleCreateMenuCommand">
						<span
							class="toolbar-create-trigger"
							:class="{ 'is-disabled': isCreateMenuDisabled }">
							<el-icon><Plus /></el-icon>
						</span>
						<template #dropdown>
							<div class="create-menu-panel">
								<div class="create-menu-section-title">产品</div>
								<el-dropdown-menu>
									<el-dropdown-item command="newProduct">
										<span class="create-menu-icon product-new-icon"></span>
										<span>新产品</span>
									</el-dropdown-item>
									<el-dropdown-item command="existingProduct">
										<span class="create-menu-icon product-existing-icon"></span>
										<span>现有产品</span>
									</el-dropdown-item>
									<el-dropdown-item command="insertDuplicate">
										<span class="create-menu-icon insert-duplicate-icon"></span>
										<span>插入重复项</span>
									</el-dropdown-item>
									<el-dropdown-item command="newPart">
										<span class="create-menu-icon part-new-icon"></span>
										<span>新零件</span>
									</el-dropdown-item>
									<el-dropdown-item command="newShapeRepresentation">
										<span class="create-menu-icon shape-new-icon"></span>
										<span>新变形件自</span>
									</el-dropdown-item>
									<el-dropdown-item command="materialQuantity">
										<span class="create-menu-icon material-quantity-icon"></span>
										<span>材料的新数量</span>
									</el-dropdown-item>
									<el-dropdown-item
										v-if="selectedChildrenRows.length < 2"
										command="existingMaterial">
										<span class="create-menu-icon material-existing-icon"></span>
										<span>现有原材料</span>
									</el-dropdown-item>
								</el-dropdown-menu>
								<div class="create-menu-section-title">规格文档</div>
								<el-dropdown-menu>
									<el-dropdown-item
										v-if="selectedChildrenRows.length < 2"
										command="uploadDocument">
										<span class="create-menu-icon upload-document-icon"></span>
										<span>上传文档</span>
									</el-dropdown-item>
									<el-dropdown-item
										v-if="selectedChildrenRows.length < 2"
										command="existingDocument">
										<span class="create-menu-icon existing-document-icon"></span>
										<span>现有文档</span>
									</el-dropdown-item>
								</el-dropdown-menu>
								<div class="create-menu-section-title">绘图</div>
								<el-dropdown-menu>
									<el-dropdown-item command="newDrawing">
										<span class="create-menu-icon drawing-new-icon"></span>
										<span>新工程图</span>
									</el-dropdown-item>
									<el-dropdown-item command="existingDrawing">
										<span class="create-menu-icon drawing-existing-icon"></span>
										<span>现有工程图</span>
									</el-dropdown-item>
								</el-dropdown-menu>
							</div>
						</template>
					</el-dropdown>
					<!-- 展开/折叠菜单按钮 -->
					<el-dropdown
						trigger="click"
						@command="handleExpandMenuCommand"
						popper-class="expand-menu-dropdown">
						<el-button
							size="small"
							circle
							:class="['expand-menu-btn', { 'is-active': expandMenuActive }]"
							title="展开/折叠">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round">
								<circle
									cx="5"
									cy="5"
									r="2" />
								<circle
									cx="5"
									cy="19"
									r="2" />
								<circle
									cx="12"
									cy="12"
									r="2" />
								<circle
									cx="19"
									cy="5"
									r="2" />
								<circle
									cx="19"
									cy="12"
									r="2" />
								<path d="M7 5h10" />
								<path d="M7 19l5-5" />
								<path d="M14 12l5-5" />
							</svg>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="expand">
									<svg
										class="expand-menu-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<rect
											x="2"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="2"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<path d="M10 5h4" />
										<path d="M6 8v8" />
										<path d="M18 8v8" />
										<path d="M10 19h4" />
									</svg>
									<span>展开</span>
								</el-dropdown-item>
								<el-dropdown-item command="expandAll">
									<svg
										class="expand-menu-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<rect
											x="2"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="2"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<path d="M10 5h4" />
										<path d="M6 8v8" />
										<path d="M18 8v8" />
										<path d="M10 19h4" />
										<circle
											cx="20"
											cy="20"
											r="3"
											fill="currentColor"
											stroke="none" />
										<path
											d="M20 18.5v3M18.5 20h3"
											stroke="white"
											stroke-width="1" />
									</svg>
									<span>全部展开</span>
								</el-dropdown-item>
								<el-dropdown-item command="expandN">
									<svg
										class="expand-menu-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<rect
											x="2"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="2"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<path d="M10 5h4" />
										<path d="M6 8v8" />
										<path d="M18 8v8" />
										<path d="M10 19h4" />
										<circle
											cx="20"
											cy="20"
											r="3"
											fill="currentColor"
											stroke="none" />
										<text
											x="20"
											y="21"
											text-anchor="middle"
											fill="white"
											font-size="4"
											font-weight="bold">
											N
										</text>
									</svg>
									<span>展开 N 层</span>
								</el-dropdown-item>
								<el-dropdown-item
									divided
									command="collapseAll">
									<svg
										class="expand-menu-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<rect
											x="2"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="2"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="2"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<rect
											x="14"
											y="16"
											width="8"
											height="6"
											rx="1" />
										<path d="M10 5h4" />
										<path d="M6 8v8" />
										<path d="M18 8v8" />
										<path d="M10 19h4" />
										<circle
											cx="20"
											cy="20"
											r="3"
											fill="currentColor"
											stroke="none" />
										<path
											d="M18.5 20h3"
											stroke="white"
											stroke-width="1" />
									</svg>
									<span>全部折叠</span>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
					<el-button
						size="small"
						circle
						title="导出 CSV"
						@click="handleExportCSV">
						<img
							src="@/assets/images/I_Export_CSV.png"
							style="width: 14px; height: 14px; object-fit: contain" />
					</el-button>
				</div>
			</div>
			<el-auto-resizer>
				<template #default="{ height, width }">
					<el-table-v2
						ref="tableRef"
						v-loading="childrenLoading"
						class="children-table children-table-v2"
						:columns="createChildrenTableColumns(width)"
						:data="flattenChildrenData"
						:width="width"
						:height="height"
						:row-height="30"
						:header-height="30"
						row-key="id"
						:row-class="getChildrenV2RowClass"
						:row-props="getChildrenV2RowProps"
						fixed />
				</template>
			</el-auto-resizer>
		</div>
		<!-- 导出进度对话框 -->
		<el-dialog
			v-model="exportDialogVisible"
			title="导出 CSV"
			width="400px"
			:close-on-click-modal="false">
			<div class="export-progress-content">
				<el-progress
					:percentage="exportPercentage"
					:status="exportPercentage >= 100 ? 'success' : undefined"
					:stroke-width="10" />
				<div class="export-status-text">
					{{ exportStatusText }}
				</div>
			</div>
		</el-dialog>
		<!-- 展开 N 层对话框 -->
		<el-dialog
			v-model="expandNDialogVisible"
			title="展开层级"
			width="300px"
			:close-on-click-modal="false">
			<div class="expand-n-content">
				<el-input
					v-model.number="expandNLevel"
					type="number"
					min="1"
					placeholder="请输入展开层数（例如：2）"
					style="margin-bottom: 15px" />
			</div>
			<template #footer>
				<el-button @click="expandNDialogVisible = false">取消</el-button>
				<el-button
					type="primary"
					@click="handleConfirmExpandN">
					确认
				</el-button>
			</template>
		</el-dialog>
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
		<el-dialog
			v-model="maturityDialogVisible"
			:title="maturityDialogTitle"
			width="720px"
			class="maturity-dialog"
			:show-close="true">
			<div
				v-loading="maturityLoading"
				class="maturity-content">
				<div class="maturity-graph">
					<button
						v-for="reverseRoute in reverseRoutes"
						:key="`${reverseRoute.fromState}-${reverseRoute.toState}`"
						class="reverse-route-action"
						:style="getReverseRouteStyle(reverseRoute.toState)"
						@click="handleMaturityStateClick(reverseRoute.toState)">
						<span class="reverse-route-line"></span>
						<span class="reverse-route-up-arrow"></span>
						<span class="reverse-route-label">{{ reverseRoute.label }}</span>
						<span class="reverse-route-arrow"></span>
					</button>
					<template
						v-for="(state, index) in maturityStates"
						:key="state.stateSysName">
						<div class="state-wrap">
							<button
								class="state-box"
								:class="{
									active: state.stateSysName === maturityCurrentState,
									clickable: getRouteFromCurrent(state.stateSysName)
								}"
								:style="getStateStyle(state)"
								@click="handleMaturityStateClick(state.stateSysName)">
								{{ getMaturityStateLabel(state) }}
							</button>
							<button
								v-if="getRouteFromCurrent(state.stateSysName) && !isReverseTransition(state.stateSysName)"
								class="transition-action"
								@click="handleMaturityStateClick(state.stateSysName)">
								<span class="action-arrow"></span>
								{{ getRouteFromCurrent(state.stateSysName)?.label }}
							</button>
						</div>
						<div
							v-if="index < maturityStates.length - 1"
							class="state-connector"></div>
					</template>
				</div>
				<el-checkbox v-model="includeStructureObjects">包括结构对象</el-checkbox>
			</div>
			<template #footer>
				<el-button @click="maturityDialogVisible = false">取消</el-button>
			</template>
		</el-dialog>
		<el-dialog
			v-model="duplicateDialogVisible"
			:title="`插入重复项 - ${duplicateDialogTitle}`"
			width="690px"
			class="duplicate-dialog">
			<div class="duplicate-form">
				<div class="duplicate-form-row">
					<span class="duplicate-form-label">添加前缀:</span>
					<el-input
						v-model="duplicatePrefix"
						class="duplicate-prefix-input"
						size="small" />
				</div>
				<el-checkbox v-model="duplicateIncludeStructure">包括结构对象</el-checkbox>
				<div class="duplicate-form-row">
					<span class="duplicate-form-label">合作区</span>
					<el-select
						v-model="duplicateSecurityContext"
						class="duplicate-security-select"
						size="small"
						disabled>
						<el-option
							:label="duplicateSecurityContextLabel"
							:value="duplicateSecurityContext" />
					</el-select>
				</div>
			</div>
			<template #footer>
				<el-button
					type="primary"
					:loading="duplicateSubmitting"
					@click="submitDuplicateProducts">
					复制
				</el-button>
				<el-button @click="duplicateDialogVisible = false">取消</el-button>
			</template>
		</el-dialog>
		<el-dialog
			v-model="deformDialogVisible"
			:title="`待变形 - ${deformTargets[0]?.title || ''}`"
			width="720px"
			class="deform-dialog"
			draggable
			:style="deformDialogStyle"
			:destroy-on-close="false"
			:align-center="false">
			<el-table
				:data="deformTargets"
				:size="'small'"
				style="width: 100%"
				border>
				<el-table-column
					prop="title"
					label="标题"
					min-width="200" />
				<el-table-column
					label="操作"
					width="120">
					<template #default>待变形</template>
				</el-table-column>
				<el-table-column
					prop="Deformabilty_Status"
					label="可变形性"
					width="120" />
				<el-table-column
					prop="Maturity"
					label="成熟度"
					width="100" />
				<el-table-column
					prop="revision"
					label="修订版"
					width="100" />
				<el-table-column
					prop="type"
					label="类型"
					width="140" />
			</el-table>
			<div class="deform-form-row">
				<span class="deform-form-label">添加前缀:</span>
				<el-input
					v-model="deformPrefix"
					class="deform-prefix-input"
					size="small" />
			</div>
			<template #footer>
				<el-button
					type="primary"
					:loading="deformSubmitting"
					@click="submitDeformedProducts">
					变形
				</el-button>
				<el-button @click="deformDialogVisible = false">取消</el-button>
			</template>
			<div
				class="deform-dialog-resize-handle"
				@mousedown="handleDeformDialogResizeStart"></div>
		</el-dialog>

		<!-- 上传文档对话框 -->
		<UploadDocumentDialog
			v-model="uploadDocumentDialogVisible"
			:initial-file="selectedUploadFile"
			@submit="handleUploadDocumentSubmit" />

		<!-- 新工程图对话框 -->
		<NewDrawingDialog />

		<!-- 材料数量对话框 -->
		<MaterialQuantityDialog
			v-model="materialQuantityDialogVisible"
			:material-name="selectedMaterialName"
			@confirm="handleMaterialQuantityConfirm" />

		<!-- 现有原材料对话框 -->
		<ExistingMaterialDialog
			v-model="existingMaterialDialogVisible"
			:material-name="selectedExistingMaterialName"
			:material-physical-id="pendingExistingMaterial?.materialPhysicalId"
			@confirm="handleExistingMaterialConfirm" />

		<!-- 上传进度面板 -->
		<UploadProgressPanel
			v-model="uploadProgressVisible"
			:upload-list="uploadProgressList" />
	</div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
	ArrowDown,
	Plus,
	Minus,
	View,
	Filter,
	Sort,
	Refresh,
	List,
	Download,
	Check,
	Close,
	Loading,
	HomeFilled,
	Share,
	Fold,
	ArrowRight,
	CirclePlus,
	Expand,
	ArrowLeft
} from '@element-plus/icons-vue';
import { ElCheckbox, ElIcon, ElImage, ElMessage, ElMessageBox, ElTag } from 'element-plus';
import type { Column } from 'element-plus';
import partDetailApi from '@/api/partDetailApi';
import expandApi, { type TreeNode } from '@/api/expandApi';
import { ModelerAPI } from '@/api';
import type {
	DeformableProductInfo,
	DuplicateProductItem,
	MaturityObjectParams,
	MaturityState,
	PromoteMaturityParams,
	StateTransition,
	PartInfo,
	ReparentSourceItem
} from '@/api/partDetailApi';
import { useBaseInfoStore } from '@/store';
import { useDialogStore } from '@/store/modules/dialog';
import { useQueryModeStore } from '@/store/modules/queryMode';
import dsSearchInput from '@/plugins/ds-search-input';
import enCatflNls from '@/i18n/lang/en-US/CATFLNls_en.json';
import zhCatflNls from '@/i18n/lang/zh-CN/CATFLNls_zh.json';
import UploadDocumentDialog from './UploadDocumentDialog.vue';
import NewDrawingDialog from './NewDrawingDialog.vue';
import MaterialQuantityDialog from './MaterialQuantityDialog.vue';
import ExistingMaterialDialog from './ExistingMaterialDialog.vue';
import UploadProgressPanel from '@/components/UploadProgressPanel.vue';
import type { UploadItem } from '@/components/UploadProgressPanel.vue';
import documentApi from '@/api/documentApi';

// 路由
const route = useRoute();
const router = useRouter();

// 查询模式
const queryModeStore = useQueryModeStore();
const dialogStore = useDialogStore();
const baseInfoStore = useBaseInfoStore();

// 默认缩略图
const defaultThumbnail = [
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUi',
	'IHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjVmN2ZhIi8+',
	'CjxwYXRoIGQ9Ik0zNy41IDM3LjVWMTEyLjVIMTEyLjVWMzcuNUgzNy41WiIgZmlsbD0iI2U0ZTdlZCIvPgo8cGF0aCBkPSJNNTAgNTBINjBW',
	'NjBINTBWMzBaTTY1IDY1SDc1Vjc1SDY1VjY1WiIgZmlsbD0iIzkwOTM5OSIvPgo8L3N2Zz4='
].join('');

// 数据
const partInfo = ref<PartInfo | null>(null);
const childrenData = ref<TreeNode[]>([]);
const loading = ref(false);
const childrenLoading = ref(false);
const expandingRowIds = ref<Set<string>>(new Set());
const currentPhysicalId = ref<string>('');
const tableRef = ref<any>(null);
const enterpriseTableRef = ref<any>(null);
const draggingChildRowId = ref('');
const dragOverChildRowId = ref('');

interface EnterpriseCodeRow {
	id: string;
	label: string;
	partNumber: string;
	source: 'parent' | 'child';
	status?: string;
	row?: TreeNode;
}

interface ChildDragItem {
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
	'relationId'?: string;
	'path'?: string[];
	'sourceParentRowId'?: string;
	'rowId': string;
}

interface ExistingProductSearchItem {
	'physicalid'?: string;
	'physicalId'?: string;
	'id'?: string;
	'objectId'?: string;
	'ds6w:label'?: string;
	'label'?: string;
	'name'?: string;
	'title'?: string;
	'displayName'?: string;
	'ds6wg:revision'?: string;
	'ds6w:type'?: string;
	'ds6w:status'?: string;
	'thumbnail_2d'?: string;
	'icon'?: string;
}

interface ExistingProductParentContext {
	physicalId: string;
	name: string;
	row?: TreeNode;
	children: string[];
}

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger';
type CreateMenuCommand =
	| 'newProduct'
	| 'existingProduct'
	| 'insertDuplicate'
	| 'newPart'
	| 'newShapeRepresentation'
	| 'materialQuantity'
	| 'existingMaterial'
	| 'uploadDocument'
	| 'existingDocument'
	| 'newDrawing'
	| 'existingDrawing';

const enterpriseDialogVisible = ref(false);
const exportDialogVisible = ref(false);
const exportPercentage = ref(0);
const exportStatusText = ref('准备导出...');
const enterpriseCodeRows = ref<EnterpriseCodeRow[]>([]);
const selectedChildrenRows = ref<TreeNode[]>([]);

// 展开菜单相关数据（独立功能，不混合原有逻辑）
const expandMenuActive = ref(false);
const expandNDialogVisible = ref(false);
const expandNLevel = ref(2);
const expandMenuLoading = ref(false);
const selectedEnterpriseRows = ref<EnterpriseCodeRow[]>([]);
const maturityDialogVisible = ref(false);
const maturityLoading = ref(false);
const maturityDialogTitle = ref('');
const maturityStates = ref<MaturityState[]>([]);
const maturityTransitions = ref<StateTransition[]>([]);
const maturityCurrentState = ref('');
const maturitySelectedObject = ref<MaturityObjectParams | null>(null);
const maturitySelectedSource = ref<'parent' | 'child'>('parent');
const maturitySelectedRow = ref<TreeNode | null>(null);
const includeStructureObjects = ref(false);
const duplicateDialogVisible = ref(false);
const duplicateSubmitting = ref(false);
const duplicatePrefix = ref('');
const duplicateIncludeStructure = ref(true);
const duplicateSecurityContext = ref('');
const duplicateTargets = ref<DuplicateProductItem[]>([]);
const duplicateSecurityContextLabel = computed(() => {
	const context = duplicateSecurityContext.value || baseInfoStore.securityContext || '';
	return context.split('.').pop() || 'Common Space';
});
const duplicateDialogTitle = computed(() => {
	const target = duplicateTargets.value[0];
	if (!target) return '';
	return `${target.typeDisplayName || '物理产品'}${target.name || ''} ${target.revision || ''}`.trim();
});
const deformDialogVisible = ref(false);
const deformSubmitting = ref(false);
const deformPrefix = ref('');
const deformTargets = ref<DeformableProductInfo[]>([]);
const deformDialogSize = ref({
	width: 720,
	height: 300
});
const deformDialogStyle = computed(() => ({
	width: `${deformDialogSize.value.width}px`,
	height: `${deformDialogSize.value.height}px`
}));
let deformDialogResizing = false;
let deformDialogResizeStartX = 0;
let deformDialogResizeStartY = 0;
let deformDialogResizeStartWidth = 0;
let deformDialogResizeStartHeight = 0;

// 上传文档对话框
const uploadDocumentDialogVisible = ref(false);
const uploadProgressVisible = ref(false);
const uploadProgressList = ref<UploadItem[]>([]);

// 材料数量对话框
const materialQuantityDialogVisible = ref(false);
const selectedMaterialName = ref('');
const pendingMaterialQuantity = ref<{ materialPhysicalId: string; quantityName: string; value: string; unit: string } | null>(null);

// 现有原材料对话框
const existingMaterialDialogVisible = ref(false);
const selectedExistingMaterialName = ref('');
const pendingExistingMaterial = ref<{ materialPhysicalId: string; materialName: string } | null>(null);
const columnWidths = ref<Record<string, number>>({
	selection: 50,
	label: 240,
	partNumber: 150,
	revision: 80,
	instanceLabel: 150,
	isLastRevision: 100,
	status: 100,
	owner: 150,
	reserved: 80,
	modified: 150,
	globalType: 120,
	identifier: 180
});
const reverseRoutes = computed(() =>
	maturityStates.value
		.map(state => getRouteFromCurrent(state.stateSysName))
		.filter((route): route is NonNullable<ReturnType<typeof getRouteFromCurrent>> => !!route && isReverseTransition(route.toState))
);

const HEADER_VIS_KEY = 'partDetailHeaderVisible';
const showHeader = ref(localStorage.getItem(HEADER_VIS_KEY) !== 'false');
const toggleHeader = () => {
	showHeader.value = !showHeader.value;
	localStorage.setItem(HEADER_VIS_KEY, String(showHeader.value));
};

const normalizeEnterpriseCode = (value?: string) => {
	return value && value.trim() ? value : '无';
};

const handleDeformDialogResizeMove = (event: MouseEvent) => {
	if (!deformDialogResizing) return;
	const nextWidth = Math.max(480, deformDialogResizeStartWidth + event.clientX - deformDialogResizeStartX);
	const nextHeight = Math.max(300, deformDialogResizeStartHeight + event.clientY - deformDialogResizeStartY);
	deformDialogSize.value = {
		width: nextWidth,
		height: nextHeight
	};
};

const handleDeformDialogResizeEnd = () => {
	if (!deformDialogResizing) return;
	deformDialogResizing = false;
	document.body.classList.remove('deform-dialog-resizing');
	window.removeEventListener('mousemove', handleDeformDialogResizeMove);
	window.removeEventListener('mouseup', handleDeformDialogResizeEnd);
};

const handleDeformDialogResizeStart = (event: MouseEvent) => {
	event.preventDefault();
	event.stopPropagation();
	deformDialogResizing = true;
	deformDialogResizeStartX = event.clientX;
	deformDialogResizeStartY = event.clientY;
	deformDialogResizeStartWidth = deformDialogSize.value.width;
	deformDialogResizeStartHeight = deformDialogSize.value.height;
	document.body.classList.add('deform-dialog-resizing');
	window.addEventListener('mousemove', handleDeformDialogResizeMove);
	window.addEventListener('mouseup', handleDeformDialogResizeEnd);
};

const getParentEnterpriseCode = () => {
	return normalizeEnterpriseCode(partInfo.value?.['ds6wg:EnterpriseExtension.V_PartNumber']);
};

const getChildEnterpriseCode = (row: TreeNode) => {
	return normalizeEnterpriseCode(row.partNumber);
};

const isChildrenRowSelected = (row: TreeNode) => selectedChildrenRows.value.some(item => item.id === row.id);

// 判断+号菜单是否可用（当勾选了非VPMReference类型的零件时禁用）
const isCreateMenuDisabled = computed(() => {
	if (selectedChildrenRows.value.length === 0) {
		return false;
	}
	// 检查是否有任何勾选的行不是 VPMReference 类型（使用 globalType 判断）
	return selectedChildrenRows.value.some(row => row.globalType !== 'VPMReference');
});

const isRowExpanding = (row: TreeNode) => expandingRowIds.value.has(row.id);

const getParentPhysicalId = () => partInfo.value?.resourceid || partInfo.value?.physicalid || currentPhysicalId.value;

const getParentTypeName = () => partInfo.value?.['ds6w:globalType'] || partInfo.value?.['ds6w:type'] || '';

const getChildTypeName = (row: TreeNode) => row.typeDisplayName || row.globalType || '';

const getSelectedParentContextPhysicalIds = () => {
	const selectedRows = [...selectedChildrenRows.value];
	return selectedRows.length ? selectedRows.map(row => row.resourceid).filter(Boolean) : [getParentPhysicalId()].filter(Boolean);
};

const validateChildInsertParentContext = async (contextPhysicalIds: string[]) => {
	const response = await ModelerAPI.getCADOriginsTypes({
		data: contextPhysicalIds.map(objectId => ({ objectId }))
	});
	const usages = response?.result?.V_usages || [];
	if (usages.includes('3DPart')) {
		ElMessage.error('错误: 无法插入到选定对象下');
		return false;
	}
	return true;
};

const openCreateDialogFromChildrenTable = async (command: 'newProduct' | 'newPart') => {
	const selectedRows = [...selectedChildrenRows.value];
	const contextPhysicalIds = getSelectedParentContextPhysicalIds();
	const contextRowIds = selectedRows.map(row => row.id);
	const contextTypeNames = selectedRows.length
		? selectedRows.map(row => getChildTypeName(row)).filter(Boolean)
		: [getParentTypeName()].filter(Boolean);

	if (!contextPhysicalIds.length) {
		ElMessage.warning('未获取到创建上下文');
		return;
	}

	const canCreate = await validateChildInsertParentContext(contextPhysicalIds);
	if (!canCreate) return;

	if (selectedRows.length > 1) {
		const title = command === 'newProduct' ? '插入新产品' : '插入新零件';
		const message = command === 'newProduct' ? '是否确定要在多个父项下插入新产品?' : '是否确定要在多个父项下插入新零件?';
		try {
			await ElMessageBox.confirm(message, title, {
				confirmButtonText: '确定',
				cancelButtonText: '关闭',
				showClose: true,
				closeOnClickModal: false,
				closeOnPressEscape: false
			});
		} catch (error) {
			if (error === 'cancel' || error === 'close') {
				return;
			}
			throw error;
		}
	}

	dialogStore.setCreateContext('partDetailTable', contextPhysicalIds, contextRowIds, contextTypeNames);
	if (command === 'newProduct') {
		dialogStore.openProductDialog();
		return;
	}
	dialogStore.openPartDialog();
};

const getExistingProductPhysicalId = (item: ExistingProductSearchItem) => item.physicalid || item.physicalId || item.id || item.objectId || '';

const getExistingProductName = (item: ExistingProductSearchItem) =>
	item['ds6w:label'] || item.label || item.name || item.title || item.displayName || getExistingProductPhysicalId(item);

// 工程图搜索项类型
interface ExistingDrawingSearchItem {
	'physicalid'?: string;
	'physicalId'?: string;
	'id'?: string;
	'identifier'?: string;
	'ds6w:identifier'?: string;
	'ds6w:label'?: string;
	'label'?: string;
	'name'?: string;
	'title'?: string;
}

const getExistingDrawingPhysicalId = (item: ExistingDrawingSearchItem) =>
	item.physicalid || item.physicalId || item.id || item['ds6w:identifier'] || item.identifier || '';

const getExistingDrawingName = (item: ExistingDrawingSearchItem) =>
	item['ds6w:label'] || item.label || item.name || item.title || getExistingDrawingPhysicalId(item);

const getParentChildrenIds = (row?: TreeNode) => {
	const children = row ? row.children || [] : childrenData.value;
	return children.map(child => child.relationId).filter((relationId): relationId is string => !!relationId);
};

const getExistingProductParentContexts = (): ExistingProductParentContext[] => {
	const selectedRows = [...selectedChildrenRows.value];
	if (selectedRows.length) {
		return selectedRows
			.map(row => ({
				physicalId: row.resourceid,
				name: row.instanceLabel || row.label || row.identifier || row.resourceid,
				row,
				children: getParentChildrenIds(row)
			}))
			.filter(item => !!item.physicalId);
	}

	const parentPhysicalId = getParentPhysicalId();
	if (!parentPhysicalId) return [];
	return [
		{
			physicalId: parentPhysicalId,
			name: partInfo.value?.['ds6w:identifier'] || partInfo.value?.['ds6w:label'] || parentPhysicalId,
			children: getParentChildrenIds()
		}
	];
};

const validateCurrentChildInsertParentContext = async (emptyMessage = '未获取到插入父节点') => {
	const contextPhysicalIds = getSelectedParentContextPhysicalIds();
	if (!contextPhysicalIds.length) {
		ElMessage.warning(emptyMessage);
		return false;
	}
	return validateChildInsertParentContext(contextPhysicalIds);
};

const showInsertExistingReport = async (
	results: { status: string; parent: string; instanceName?: string }[],
	parents: ExistingProductParentContext[]
) => {
	const successResults = results.filter(item => item.status === 'success');
	const parentNameMap = new Map(parents.map(parent => [parent.physicalId, parent.name]));
	const content = successResults.map(item => `成功 在 ${parentNameMap.get(item.parent) || item.parent} 下插入 ${item.instanceName}。`).join('<br />');

	await ElMessageBox.alert(content || '没有成功插入的数据。', '插入现有报告', {
		confirmButtonText: '关闭',
		dangerouslyUseHTMLString: true
	});
};

const getInsertExistingFailureMessage = (response: { results?: Array<{ messages?: string[] }> }) => {
	const messages = response.results?.flatMap(item => item.messages || []).filter(Boolean) || [];
	return [...new Set(messages)].join('；');
};

const refreshAfterExistingProductInsert = async (parents: ExistingProductParentContext[]) => {
	queryModeStore.switchToDbMode();
	const rows = parents.map(parent => parent.row).filter((row): row is TreeNode => !!row);
	if (rows.length) {
		await Promise.all(rows.map(row => reloadAndExpandRow(row)));
		return;
	}
	if (currentPhysicalId.value) {
		await loadPartDetail(currentPhysicalId.value);
	}
};

// 工程图关联报告
const showRelateDrawingReport = async (
	results: { status: string; parent: string; instanceName?: string }[],
	parents: ExistingProductParentContext[]
) => {
	const successResults = results.filter(item => item.status === 'success');
	const parentNameMap = new Map(parents.map(parent => [parent.physicalId, parent.name]));
	const content = successResults.map(item => `成功关联 ${item.instanceName} 到 ${parentNameMap.get(item.parent) || item.parent}。`).join('<br />');
	await ElMessageBox.alert(content || '没有成功关联的数据。', '关联工程图报告', {
		confirmButtonText: '关闭',
		dangerouslyUseHTMLString: true
	});
};

// 关联现有图纸到产品
const relateExistingDrawings = async (selectedDrawings: ExistingDrawingSearchItem[]) => {
	const drawings = selectedDrawings
		.map(item => ({
			physicalId: getExistingDrawingPhysicalId(item),
			name: getExistingDrawingName(item)
		}))
		.filter(item => !!item.physicalId);

	if (!drawings.length) {
		ElMessage.warning('未选择现有图纸');
		return;
	}

	const parents = getExistingProductParentContexts();
	if (!parents.length) {
		ElMessage.warning('未获取到关联父节点');
		return;
	}

	const operations = parents.flatMap(parent =>
		drawings.map(drawing => ({
			drawing,
			parent: {
				physicalId: parent.physicalId,
				children: parent.children
			}
		}))
	);

	const response = await partDetailApi.relateDrawings(operations);
	if (response.status !== 'success') {
		ElMessage.error('关联现有图纸失败');
		return;
	}

	await showRelateDrawingReport(response.results || [], parents);
	await refreshAfterExistingProductInsert(parents);
};

const insertExistingProducts = async (selectedProducts: ExistingProductSearchItem[]) => {
	const childProducts = selectedProducts
		.map(item => ({
			physicalId: getExistingProductPhysicalId(item),
			name: getExistingProductName(item)
		}))
		.filter(item => !!item.physicalId);

	if (!childProducts.length) {
		ElMessage.warning('未选择现有产品');
		return;
	}

	const parents = getExistingProductParentContexts();
	if (!parents.length) {
		ElMessage.warning('未获取到插入父节点');
		return;
	}

	const operations = parents.flatMap(parent =>
		childProducts.map(child => ({
			parent: {
				isInstanceOf: parent.physicalId,
				children: parent.children
			},
			child: {
				isInstanceOf: child.physicalId
			}
		}))
	);

	const response = await partDetailApi.insertExistingProducts(operations);
	if (response.status !== 'success') {
		ElMessage.error(getInsertExistingFailureMessage(response) || '插入现有产品失败');
		return;
	}

	await showInsertExistingReport(response.results || [], parents);
	await refreshAfterExistingProductInsert(parents);
};

const openExistingProductDialogFromChildrenTable = () => {
	dsSearchInput('', 'product', 'PSE', '', async value => {
		try {
			await insertExistingProducts(value as ExistingProductSearchItem[]);
		} catch (error) {
			console.error('[PartDetailView] 插入现有产品失败:', error);
			ElMessage.error('插入现有产品失败');
		}
	});
};

const toDuplicateProductItem = (item: ExistingProductSearchItem): DuplicateProductItem => ({
	physicalid: getExistingProductPhysicalId(item),
	name: getExistingProductName(item),
	revision: item['ds6wg:revision'] || '',
	typeDisplayName: item['ds6w:type'] || '',
	current: item['ds6w:status'] || '',
	imageUrl: item.thumbnail_2d || item.icon || ''
});

const openInsertDuplicateDialogFromChildrenTable = () => {
	dsSearchInput('', 'product', 'PSE', '', async value => {
		const targets = (value as ExistingProductSearchItem[]).map(toDuplicateProductItem).filter(item => !!item.physicalid);
		if (!targets.length) {
			ElMessage.warning('未选择重复项');
			return;
		}
		duplicateTargets.value = targets;
		duplicatePrefix.value = '';
		duplicateIncludeStructure.value = true;
		duplicateSecurityContext.value = baseInfoStore.securityContext || '';
		duplicateDialogVisible.value = true;
	});
};

const submitDuplicateProducts = async () => {
	if (!duplicateTargets.value.length) {
		ElMessage.warning('未选择重复项');
		return;
	}
	const parents = getExistingProductParentContexts();
	if (!parents.length) {
		ElMessage.warning('未获取到插入父节点');
		return;
	}
	const canInsert = await validateChildInsertParentContext(parents.map(parent => parent.physicalId));
	if (!canInsert) return;
	duplicateSubmitting.value = true;
	try {
		const duplicateResponse = await partDetailApi.duplicateStructure(
			duplicateTargets.value.map(item => ({ physicalid: item.physicalid })),
			duplicatePrefix.value,
			duplicateIncludeStructure.value
		);
		if (duplicateResponse.status && duplicateResponse.status !== 'success') {
			ElMessage.error('复制结构失败');
			return;
		}
		const duplicateResults = duplicateResponse.results?.flat() || [];
		const newRootProducts = duplicateTargets.value
			.map(target => ({
				sourcePhysicalId: target.physicalid,
				physicalId: duplicateResults.find(result => result.sourceid === target.physicalid)?.physicalid || ''
			}))
			.filter(item => !!item.physicalId);
		if (!newRootProducts.length) {
			ElMessage.error('未获取到复制后的对象');
			return;
		}
		const operations = parents.flatMap(parent =>
			newRootProducts.map(child => ({
				parent: {
					isInstanceOf: parent.physicalId,
					children: parent.children
				},
				child: {
					isInstanceOf: child.physicalId
				}
			}))
		);
		const response = await partDetailApi.insertExistingProducts(operations);
		if (response.status !== 'success') {
			ElMessage.error(getInsertExistingFailureMessage(response) || '建立重复项关系失败');
			return;
		}
		const failedResults = response.results?.filter(item => item.status !== 'success') || [];
		if (failedResults.length) {
			ElMessage.error('插入重复项失败');
			return;
		}
		duplicateDialogVisible.value = false;
		ElMessage.success('插入重复项成功');
		await refreshAfterExistingProductInsert(parents);
	} catch (error) {
		console.error('[PartDetailView] 插入重复项失败:', error);
		ElMessage.error('插入重复项失败');
	} finally {
		duplicateSubmitting.value = false;
	}
};

const handleCreateMenuCommand = async (command: CreateMenuCommand) => {
	console.log('[PartDetailView] menu command:', command);
	if (command === 'newProduct' || command === 'newPart') {
		pendingMaterialQuantity.value = null;
		await openCreateDialogFromChildrenTable(command);
		return;
	}
	if (command === 'existingProduct') {
		const canInsert = await validateCurrentChildInsertParentContext();
		if (!canInsert) return;
		openExistingProductDialogFromChildrenTable();
		return;
	}
	if (command === 'insertDuplicate') {
		const canInsert = await validateCurrentChildInsertParentContext();
		if (!canInsert) return;
		openInsertDuplicateDialogFromChildrenTable();
		return;
	}
	if (command === 'newShapeRepresentation') {
		const canInsert = await validateCurrentChildInsertParentContext();
		if (!canInsert) return;
		openNewShapeRepresentationDialogFromChildrenTable();
		return;
	}
	if (command === 'uploadDocument') {
		openUploadDocumentDialog();
		return;
	}
	if (command === 'existingDocument') {
		openAddExistingDocumentDialog();
		return;
	}
	if (command === 'newDrawing') {
		const canInsert = await validateCurrentChildInsertParentContext();
		if (!canInsert) return;

		// 获取勾选的零件物理ID列表
		const selectedRows = [...selectedChildrenRows.value];
		const physicalIds = selectedRows.length > 0 ? selectedRows.map(row => row.resourceid).filter(Boolean) : [currentPhysicalId.value].filter(Boolean);

		// 如果勾选了多个父项，弹出确认框
		if (selectedRows.length > 1) {
			try {
				await ElMessageBox.confirm('是否确定要在多个父项下插入新图纸?', '插入新工程图', {
					confirmButtonText: '确定',
					cancelButtonText: '关闭',
					showClose: true,
					closeOnClickModal: false,
					closeOnPressEscape: false
				});
			} catch (error) {
				if (error === 'cancel' || error === 'close') {
					return;
				}
				throw error;
			}
		}

		// 设置创建上下文并打开工程图弹框
		const rowIds = selectedRows.map(row => row.id);
		dialogStore.setCreateContext('partDetailTable', physicalIds, rowIds, []);
		dialogStore.openDrawingDialog();
		return;
	}
	if (command === 'existingDrawing') {
		// 打开现有工程图搜索对话框
		openExistingDrawingDialogFromChildrenTable();
		return;
	}
	if (command === 'materialQuantity') {
		const canInsert = await validateCurrentChildInsertParentContext();
		if (!canInsert) return;
		openMaterialQuantitySearchDialog();
		return;
	}
	if (command === 'existingMaterial') {
		openExistingMaterialSearchDialog();
		return;
	}
};

// 上传文档相关
const selectedUploadFile = ref<File | null>(null);

const openUploadDocumentDialog = () => {
	// 先触发文件选择
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.style.display = 'none';
	fileInput.onchange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			selectedUploadFile.value = file;
			uploadDocumentDialogVisible.value = true;
		}
		document.body.removeChild(fileInput);
	};
	document.body.appendChild(fileInput);
	fileInput.click();
};

// 添加现有文档 - 使用 dsSearchInput 打开搜索对话框
const openAddExistingDocumentDialog = () => {
	console.log('[PartDetailView] opening existing document dialog');
	// 文档类型的搜索条件
	const precond = `((flattenedtaxonomies:"types/Document" OR flattenedtaxonomies:"types/CONTROLLED DOCUMENTS") AND (NOT (flattenedtaxonomies:"types/Controlled Document Template" OR flattenedtaxonomies:"types/Rendition Document Template")))`;

	console.log('[PartDetailView] calling dsSearchInput for documents with precond:', precond);
	dsSearchInput(
		'',
		'product',
		'PSE',
		'',
		async value => {
			console.log('[PartDetailView] document search callback triggered with value:', value);
			try {
				const selected = value as any[];
				if (!selected.length) {
					ElMessage.warning('未选择文档');
					return;
				}

				// 获取选中的文档ID
				const documentIds = selected.map(item => item.id || item['ds6w:identifier'] || item.identifier).filter(Boolean);
				if (!documentIds.length) {
					ElMessage.warning('未获取到文档ID');
					return;
				}

				console.log('[PartDetailView] 选中文档:', documentIds);

				// 获取当前父节点ID
				const parentId = getParentPhysicalId();
				if (!parentId) {
					ElMessage.warning('未获取到父节点');
					return;
				}

				// 先获取 CheckinTicket 换取新鲜 CSRF Token，避免 403
				const ticketResponse = await documentApi.getCheckinTicket();
				if (!ticketResponse.success || !ticketResponse.csrf?.value) {
					ElMessage.error('获取 CSRF Token 失败，请刷新后重试');
					return;
				}
				const csrfToken = ticketResponse.csrf.value;
				console.log('[PartDetailView] 使用新鲜 CSRF Token:', csrfToken);

				// 调用关联文档API
				const response = await documentApi.relateDocuments(documentIds, parentId, csrfToken);

				if (response.success) {
					ElMessage.success(`成功关联 ${documentIds.length} 个文档`);

					// 切换到数据库模式并刷新
					await switchToDbModeAndRefresh();
				} else {
					ElMessage.error(response.error || '关联文档失败');
				}
			} catch (error: any) {
				console.error('[PartDetailView] 关联文档失败:', error);
				ElMessage.error(error?.error || error?.message || '关联文档失败');
			}
		},
		{ precond }
	);
};

// 切换到数据库模式并刷新
const switchToDbModeAndRefresh = async () => {
	try {
		// 切换到数据库模式
		queryModeStore.switchToDbMode();

		// 刷新当前零件详情
		if (currentPhysicalId.value) {
			await loadPartDetail(currentPhysicalId.value);
		}
	} catch (error) {
		console.error('[PartDetailView] 切换数据库模式并刷新失败:', error);
		ElMessage.error('刷新失败');
	}
};

// 打开现有工程图搜索对话框
const openExistingDrawingDialogFromChildrenTable = () => {
	console.log('[PartDetailView] opening existing drawing dialog');

	// 工程图类型的搜索条件
	const precond = `(flattenedtaxonomies:"types/Drawing" AND [ds6w:composed]:FALSE)`;

	console.log('[PartDetailView] 调用 dsSearchInput 搜索工程图，precond:', precond);

	dsSearchInput(
		'',
		'product',
		'PSE',
		'',
		async value => {
			try {
				await relateExistingDrawings(value as ExistingDrawingSearchItem[]);
			} catch (error) {
				console.error('[PartDetailView] 关联现有图纸失败:', error);
				ElMessage.error('关联现有图纸失败');
			}
		},
		{ precond }
	);
};

// 打开材料搜索对话框
const openMaterialQuantitySearchDialog = () => {
	console.log('[PartDetailView] opening material search dialog');

	dsSearchInput(
		'',
		'product',
		'PSE',
		'',
		async value => {
			try {
				const selected = value as any[];
				if (!selected.length) {
					ElMessage.warning('未选择材料');
					return;
				}

				const materialItem = selected[0];
				const materialPhysicalId = materialItem.id || materialItem['ds6w:identifier'] || materialItem.identifier;
				if (!materialPhysicalId) {
					ElMessage.warning('未获取到材料ID');
					return;
				}

				selectedMaterialName.value = materialItem['ds6w:label'] || materialItem.label || '材料';
				pendingMaterialQuantity.value = {
					materialPhysicalId,
					quantityName: '',
					value: '',
					unit: ''
				};
				materialQuantityDialogVisible.value = true;
			} catch (error) {
				console.error('[PartDetailView] 选择材料失败:', error);
				ElMessage.error('选择材料失败');
			}
		},
		{ query: '(flattenedtaxonomies:"types/dsc_matref_ref_Core")' }
	);
};

// 处理材料数量确认
const handleMaterialQuantityConfirm = (data: { quantityType: string; value: string; unit: string }) => {
	if (!pendingMaterialQuantity.value) return;
	pendingMaterialQuantity.value.quantityName = data.quantityType === 'DSDim_VOLUME' ? 'VOLUME' : 'MASS';
	pendingMaterialQuantity.value.value = data.value;
	pendingMaterialQuantity.value.unit = data.unit;

	// 打开新产品创建对话框
	openCreateDialogFromChildrenTable('newProduct');
};

// 打开现有原材料搜索对话框
const openExistingMaterialSearchDialog = () => {
	console.log('[PartDetailView] opening existing material search dialog');

	dsSearchInput(
		'',
		'product',
		'PSE',
		'',
		async value => {
			try {
				const selected = value as any[];
				if (!selected.length) {
					ElMessage.warning('未选择原材料');
					return;
				}

				const materialItem = selected[0];
				const materialPhysicalId = materialItem.id || materialItem['ds6w:identifier'] || materialItem.identifier;
				if (!materialPhysicalId) {
					ElMessage.warning('未获取到原材料ID');
					return;
				}

				const materialLabel = materialItem['ds6w:label'] || materialItem.label || '原材料';
				const materialRevision = materialItem.revision || materialItem['ds6wg:revision'] || '';
				const materialName = materialRevision ? `${materialLabel} ${materialRevision}` : materialLabel;
				selectedExistingMaterialName.value = materialName;
				pendingExistingMaterial.value = {
					materialPhysicalId,
					materialName
				};
				existingMaterialDialogVisible.value = true;
			} catch (error) {
				console.error('[PartDetailView] 选择原材料失败:', error);
				ElMessage.error('选择原材料失败');
			}
		},
		{ query: '(flattenedtaxonomies:"types/Raw_Material")' }
	);
};

// 处理现有原材料确认
const handleExistingMaterialConfirm = async (data: { materialPhysicalId: string; quantity?: string; unit?: string; asRequired: boolean }) => {
	if (!pendingExistingMaterial.value) return;

	try {
		// 如果勾选了行，则关联到选中行；否则关联到根节点
		let parentId: string;
		if (selectedChildrenRows.value.length > 0) {
			// 使用 resourceid（physicalId）而不是内部 id
			parentId = selectedChildrenRows.value[0].resourceid || selectedChildrenRows.value[0].id;
			console.log('[PartDetailView] 关联到选中行 resourceid:', parentId);
		} else {
			parentId = currentPhysicalId.value;
			console.log('[PartDetailView] 关联到根节点:', parentId);
		}

		if (!parentId) {
			ElMessage.warning('未获取到父节点');
			return;
		}

		// 获取 CSRF Token
		const csrfResponse = await partDetailApi.getCSRFToken();
		if (!csrfResponse.success || !csrfResponse.csrf?.value) {
			ElMessage.error('获取 CSRF Token 失败，请刷新后重试');
			return;
		}
		const csrfToken = csrfResponse.csrf.value;
		console.log('[PartDetailView] 使用新鲜 CSRF Token:', csrfToken);

		// 构建请求参数
		const params: {
			childId: string;
			quantity?: string;
			quantityUOM?: string;
			asRequired: boolean;
		} = {
			childId: data.materialPhysicalId,
			asRequired: data.asRequired
		};

		if (!data.asRequired) {
			params.quantity = data.quantity || '';
			params.quantityUOM = data.unit || '';
		}

		// 调用关联接口
		const response = await partDetailApi.createContinuousQuantity(parentId, params, csrfToken);

		if (response && (response as any).success !== false) {
			ElMessage.success('关联原材料成功');

			// 切换到数据库模式
			queryModeStore.switchToDbMode();

			// 关联成功后刷新
			if (selectedChildrenRows.value.length > 0) {
				// 勾选了行 → 强制展开勾选的行
				await Promise.all(selectedChildrenRows.value.map(row => reloadAndExpandRow(row)));
			} else {
				// 没有勾选 → 强制刷新根节点
				if (currentPhysicalId.value) {
					await loadPartDetail(currentPhysicalId.value);
				}
			}
		} else {
			ElMessage.error((response as any).error || '关联原材料失败');
		}
	} catch (error: any) {
		console.error('[PartDetailView] 关联原材料失败:', error);
		ElMessage.error(error?.error || error?.message || '关联原材料失败');
	}
};

// 导出 CSV 功能
const handleExportCSV = async () => {
	// 即使没有子节点，只要有根节点就可以导出
	if (!partInfo.value) {
		ElMessage.warning('没有可导出的数据');
		return;
	}

	exportDialogVisible.value = true;
	exportPercentage.value = 0;
	exportStatusText.value = '准备导出...';

	try {
		// 定义导出列（按顺序）
		const exportColumns: { key: string; title: string; isRoot?: boolean }[] = [
			{ key: 'level', title: '级别' },
			{ key: 'label', title: '标题' },
			{ key: 'partNumber', title: '企业项目编号' },
			{ key: 'revision', title: '修订版' },
			{ key: 'instanceLabel', title: '标题(实例)' },
			{ key: 'isLastRevision', title: '最新修订版' },
			{ key: 'status', title: '成熟度状态' },
			{ key: 'owner', title: '所有者' },
			{ key: 'reserved', title: '锁定' },
			{ key: 'modified', title: '修改日期' },
			{ key: 'globalType', title: '类型' },
			{ key: 'identifier', title: '名称' }
		];

		const headers = exportColumns.map(col => col.title);

		// 添加 BOM 以支持中文
		const BOM = '\uFEFF';

		// 构建所有行数据
		const allRows: { level: number; data: Record<string, any> }[] = [];

		// 1. 添加根节点（级别 0）
		const rootData: Record<string, any> = {
			label: partInfo.value['ds6w:label'] || '',
			partNumber: partInfo.value['ds6wg:EnterpriseExtension.V_PartNumber'] || '',
			revision: partInfo.value['ds6wg:revision'] || '',
			instanceLabel: '',
			isLastRevision: partInfo.value['ds6w:isLastRevision'] || '',
			status: partInfo.value['ds6w:status'] || '',
			owner: partInfo.value['owner'] || '',
			reserved: partInfo.value['ds6w:reserved'] || '',
			modified: partInfo.value['ds6w:modified'] || '',
			globalType: partInfo.value['ds6w:globalType'] || '',
			identifier: partInfo.value['ds6w:identifier'] || ''
		};
		allRows.push({ level: 0, data: rootData });

		// 2. 添加子节点（通过 childrenData 树结构递归计算层级）
		// 创建一个映射：节点 id -> 层级
		const nodeLevelMap = new Map<string, number>();

		// 递归遍历树形结构，记录每个节点的层级
		// childrenData 是根节点的子节点，所以层级从 1 开始
		const calculateLevels = (nodes: TreeNode[], parentLevel: number = 1) => {
			for (const node of nodes) {
				nodeLevelMap.set(node.id, parentLevel);
				if (node.children?.length) {
					calculateLevels(node.children, parentLevel + 1);
				}
			}
		};
		calculateLevels(childrenData.value);

		const childrenRows = flattenChildrenData.value.map(row => ({
			level: nodeLevelMap.get(row.id) ?? 0,
			data: {
				label: row.label || '',
				partNumber: row.partNumber || '',
				revision: row.revision || '',
				instanceLabel: row.instanceLabel || '',
				isLastRevision: row.isLastRevision ?? '',
				status: row.status || '',
				owner: row.owner || '',
				reserved: row.reserved ?? false,
				modified: row.modified || '',
				globalType: row.globalType || '',
				identifier: row.identifier || ''
			}
		}));
		allRows.push(...childrenRows);

		// 构建 CSV 行
		const csvRows: string[][] = [];
		const totalRows = allRows.length;

		for (let i = 0; i < totalRows; i++) {
			const rowInfo = allRows[i];
			const rowValues = exportColumns.map(col => {
				let value = '';
				if (col.key === 'level') {
					value = String(rowInfo.level);
				} else {
					const rawValue = rowInfo.data[col.key];
					// 处理特殊字段
					if (col.key === 'isLastRevision') {
						const boolVal = typeof rawValue === 'boolean' ? rawValue : rawValue === 'true';
						value = boolVal ? '是' : '否';
					} else if (col.key === 'reserved') {
						const boolVal = typeof rawValue === 'boolean' ? rawValue : rawValue === 'true';
						value = boolVal ? '锁定' : '已解锁';
					} else {
						value = String(rawValue ?? '');
					}
				}
				// 转义 CSV 特殊字符
				if (value.includes(',') || value.includes('"') || value.includes('\n')) {
					value = `"${value.replace(/"/g, '""')}"`;
				}
				return value;
			});
			csvRows.push(rowValues);

			// 更新进度
			if (i % 100 === 0 || i === totalRows - 1) {
				exportPercentage.value = Math.round(((i + 1) / totalRows) * 100);
				exportStatusText.value = `正在导出: ${i + 1}/${totalRows}`;
				// 让 UI 有机会更新
				await new Promise(resolve => setTimeout(resolve, 0));
			}
		}

		exportStatusText.value = '生成文件...';

		// 构建 CSV 字符串
		const headerRow = headers.join(',');
		const dataRows = csvRows.map(row => row.join(',')).join('\n');
		const csvContent = BOM + headerRow + '\n' + dataRows;

		// 创建下载
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `导出_${partInfo.value['ds6w:label'] || '数据'}_${new Date().toISOString().slice(0, 10)}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		exportPercentage.value = 100;
		exportStatusText.value = '导出完成!';

		// 延迟关闭对话框
		setTimeout(() => {
			exportDialogVisible.value = false;
			ElMessage.success('导出成功');
		}, 1000);
	} catch (error) {
		console.error('[PartDetailView] 导出 CSV 失败:', error);
		exportDialogVisible.value = false;
		ElMessage.error('导出失败: ' + (error as Error).message);
	}
};

const openNewShapeRepresentationDialogFromChildrenTable = () => {
	const precond = `(((flattenedtaxonomies:"types/VPMReference") AND (NOT (flattenedtaxonomies:"types/AxisSystemReference" OR flattenedtaxonomies:"types/VPMReferenceExtPos" OR flattenedtaxonomies:"types/ENOStrRefinementVDRPSpec"))) AND flattenedtaxonomies:"types/VPMReference" AND flattenedtaxonomies:"interfaces/PrdDeformableExtension")`;
	dsSearchInput(
		'',
		'product',
		'PSE',
		'',
		async value => {
			try {
				const selected = value as ExistingProductSearchItem[];
				const physicalIds = selected.map(getExistingProductPhysicalId).filter(Boolean);
				if (!physicalIds.length) {
					ElMessage.warning('未选择可变形产品');
					return;
				}
				const details = await Promise.all(physicalIds.map(id => partDetailApi.expandDeformableProduct(id)));
				const products = details.flatMap(r => r.results || []).filter(p => p.Deformabilty_Status === 'Deformable');
				if (!products.length) {
					ElMessage.warning('选中的产品不是可变形产品');
					return;
				}
				deformTargets.value = products;
				deformPrefix.value = '';
				deformDialogVisible.value = true;
			} catch (error) {
				console.error('[PartDetailView] 获取可变形产品详情失败:', error);
				ElMessage.error('获取可变形产品详情失败');
			}
		},
		{ precond }
	);
};

const submitDeformedProducts = async () => {
	if (!deformTargets.value.length) {
		ElMessage.warning('未选择待变形产品');
		return;
	}
	const parents = getExistingProductParentContexts();
	if (!parents.length) {
		ElMessage.warning('未获取到插入父节点');
		return;
	}
	const canInsert = await validateChildInsertParentContext(parents.map(parent => parent.physicalId));
	if (!canInsert) return;
	deformSubmitting.value = true;
	try {
		const prefix = deformPrefix.value || '';
		const createdResults = await Promise.all(
			deformTargets.value.map(product => {
				const options = prefix ? [{ nlsKey: 'Prefix:', type: 'text', value: prefix, key: 'prefix' }] : [];
				return partDetailApi.createDeformedFromDeformable([{ cestamp: product.cestamp, deformableID: product.resourceid }], options);
			})
		);

		const deformedIds = createdResults
			.flatMap(r => r.results || [])
			.filter(r => r.status === 'success')
			.map(r => r.deformedID);

		if (!deformedIds.length) {
			ElMessage.error('创建变形件失败');
			return;
		}

		const operations = parents.flatMap(parent =>
			deformedIds.map(childId => ({
				parent: {
					isInstanceOf: parent.physicalId,
					children: parent.children
				},
				child: {
					isInstanceOf: childId
				}
			}))
		);

		const response = await partDetailApi.insertExistingProducts(operations);
		if (response.status !== 'success') {
			ElMessage.error(getInsertExistingFailureMessage(response) || '插入变形件失败');
			return;
		}

		await showInsertExistingReport(response.results || [], parents);
		await refreshAfterExistingProductInsert(parents);
		deformDialogVisible.value = false;
		ElMessage.success('变形件创建并插入成功');
	} catch (error) {
		console.error('[PartDetailView] 创建变形件失败:', error);
		ElMessage.error('创建变形件失败');
	} finally {
		deformSubmitting.value = false;
	}
};

// 处理上传文档提交
const handleUploadDocumentSubmit = async (data: {
	title: string;
	type: string;
	collaborativeSpace: string;
	file: File | null;
	fileName: string;
	remark: string;
	description: string;
	policy: string;
}) => {
	console.log('[PartDetailView] 上传文档数据:', data);

	// 验证文件是否存在
	if (!data.file) {
		ElMessage.error('请选择要上传的文件');
		return;
	}

	// 获取父对象ID（当前零件的 physicalId）
	const parentId = getParentPhysicalId();
	if (!parentId) {
		ElMessage.error('无法获取父对象ID，请刷新页面后重试');
		return;
	}

	console.log('[PartDetailView] 父对象ID:', parentId);

	// 生成上传任务ID
	const uploadId = `upload_${Date.now()}`;

	// 隐藏对话框，显示上传进度面板
	uploadDocumentDialogVisible.value = false;
	uploadProgressVisible.value = true;

	// 添加到上传列表（未决状态）
	uploadProgressList.value.push({
		id: uploadId,
		fileName: data.fileName,
		status: 'pending'
	});

	// 更新状态为上传中
	const updateUploadStatus = (status: UploadItem['status']) => {
		const item = uploadProgressList.value.find(item => item.id === uploadId);
		if (item) {
			item.status = status;
		}
	};

	// 开始上传，更新状态
	updateUploadStatus('uploading');

	try {
		// 调用文档上传API
		const response = await documentApi.uploadDocument(data.file, data.title, data.description, parentId, data.remark);

		// 处理响应结果
		if (response.success) {
			// 上传成功
			updateUploadStatus('completed');
			ElMessage.success('文档上传成功');

			// 刷新当前零件详情，显示新上传的文档
			await refreshCurrentPartDetail();

			// 3秒后从列表中移除已完成的任务
			setTimeout(() => {
				uploadProgressList.value = uploadProgressList.value.filter(item => item.id !== uploadId);
				// 如果没有上传任务了，隐藏进度面板
				if (uploadProgressList.value.length === 0) {
					uploadProgressVisible.value = false;
				}
			}, 3000);
		} else {
			// 上传失败，显示对话框让用户可以重试
			updateUploadStatus('error');
			uploadDocumentDialogVisible.value = true;

			// 处理失败情况
			const errorMsg = response.error || '文档上传失败';
			console.error('[PartDetailView] 文档上传失败:', errorMsg, response.internalError);
			ElMessage.error(errorMsg);
		}
	} catch (error) {
		// 上传异常，显示对话框让用户可以重试
		updateUploadStatus('error');
		uploadDocumentDialogVisible.value = true;

		console.error('[PartDetailView] 文档上传异常:', error);
		const errorMessage = error instanceof Error ? error.message : '文档上传过程中发生错误';
		ElMessage.error(errorMessage);
	}
};

// 刷新当前零件详情
const refreshCurrentPartDetail = async () => {
	console.log('[PartDetailView] 刷新当前零件详情');

	// 切换到数据库模式以确保获取最新数据
	queryModeStore.switchToDbMode();

	// 如果有选中的子行，刷新对应的子行
	if (selectedChildrenRows.value.length > 0) {
		// 刷新选中的行
		await Promise.all(selectedChildrenRows.value.map(row => reloadAndExpandRow(row)));
	} else {
		// 刷新当前零件详情
		const physicalId = currentPhysicalId.value;
		if (physicalId) {
			await loadPartDetail(physicalId);
		}
	}
};

const setRowExpanding = (row: TreeNode, expanding: boolean) => {
	const nextIds = new Set(expandingRowIds.value);
	if (expanding) {
		nextIds.add(row.id);
	} else {
		nextIds.delete(row.id);
	}
	expandingRowIds.value = nextIds;
};

const toggleChildrenRowSelection = (row: TreeNode, checked: boolean) => {
	if (checked) {
		if (!isChildrenRowSelected(row)) {
			selectedChildrenRows.value = [...selectedChildrenRows.value, row];
		}
		return;
	}

	selectedChildrenRows.value = selectedChildrenRows.value.filter(item => item.id !== row.id);
};

const toggleAllVisibleChildrenSelection = (checked: boolean) => {
	selectedChildrenRows.value = checked ? [...flattenChildrenData.value] : [];
};

const flattenTreeNodes = (nodes: TreeNode[]): TreeNode[] =>
	nodes.flatMap(node => [node, ...(node.isExpanded && node.children?.length ? flattenTreeNodes(node.children) : [])]);

const flattenChildrenData = computed(() => flattenTreeNodes(childrenData.value));

const isAllVisibleChildrenSelected = computed(
	() => !!flattenChildrenData.value.length && flattenChildrenData.value.every(row => isChildrenRowSelected(row))
);
const isSomeVisibleChildrenSelected = computed(
	() => flattenChildrenData.value.some(row => isChildrenRowSelected(row)) && !isAllVisibleChildrenSelected.value
);

const getChildrenV2RowClass = ({ rowData, rowIndex }: { rowData: TreeNode; rowIndex: number }) =>
	[
		rowIndex % 2 === 1 ? 'even-child-row' : 'odd-child-row',
		isChildrenRowSelected(rowData) ? 'selected-child-row' : '',
		draggingChildRowId.value === rowData.id ? 'dragging-child-row' : '',
		dragOverChildRowId.value === rowData.id ? 'drag-over-child-row' : ''
	]
		.filter(Boolean)
		.join(' ');

const getChildDragRows = (row: TreeNode) => (isChildrenRowSelected(row) ? selectedChildrenRows.value : [row]);

const getChildDragObjectType = () => 'VPMReference';

let childDragSequence = 0;

const findParentRowByChildRowId = (nodes: TreeNode[], childRowId: string): TreeNode | null => {
	for (const node of nodes) {
		if (node.children?.some(child => child.id === childRowId)) {
			return node;
		}
		if (node.children?.length) {
			const parent = findParentRowByChildRowId(node.children, childRowId);
			if (parent) return parent;
		}
	}
	return null;
};

const toChildDragItem = (row: TreeNode): ChildDragItem => {
	const objectType = getChildDragObjectType();
	const displayName = `${row.label || row.identifier || row.resourceid} ${row.revision || ''}`.trim();
	const sourceParentRow = findParentRowByChildRowId(childrenData.value, row.id);

	return {
		'objectId': row.resourceid,
		'physicalId': row.resourceid,
		'physicalid': row.resourceid,
		displayName,
		'title': displayName,
		'name': row.identifier || row.label,
		'objectName': row.identifier || row.label,
		'type': objectType,
		objectType,
		'displayType': row.typeDisplayName || 'Physical Product',
		'typeName': objectType,
		'ds6w:type': objectType,
		'ds6w:label': row.label,
		'ds6wg:revision': row.revision,
		'cestamp': row.revision,
		'relationId': row.relationId,
		'path': row.path,
		'sourceParentRowId': sourceParentRow?.id,
		'rowId': row.id
	};
};

const buildChildRowDragPayload = (dragRows: TreeNode[]) => {
	const items = dragRows.map(toChildDragItem);
	const dragSourceUuid = `TW_EngineeringRelease_PartDetailView_${Date.now()}_${childDragSequence++}`;

	return {
		source: {
			uuid: dragSourceUuid,
			amd: 'TW_EngineeringRelease/PartDetailView'
		},
		data: {
			items
		}
	};
};

const setDragData = (event: DragEvent, payload: unknown) => {
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

const setChildRowDragImage = (event: DragEvent, dragRows: TreeNode[], dragRow: TreeNode) => {
	if (!event.dataTransfer) return;

	const dragImage = document.createElement('div');
	const dragTitle = dragRows.length > 1 ? `全部选定对象 (${dragRows.length})` : dragRow.label;
	dragImage.className = 'child-row-drag-image';
	dragImage.innerHTML = `<span class="child-row-drag-add">+</span><span class="child-row-drag-title">${dragTitle}</span>`;
	document.body.appendChild(dragImage);
	event.dataTransfer.setDragImage(dragImage, 12, 12);
	window.setTimeout(() => {
		document.body.removeChild(dragImage);
	}, 0);
};

const handleChildRowDragStart = (event: DragEvent, row: TreeNode) => {
	const dragRows = getChildDragRows(row);
	const payload = buildChildRowDragPayload(dragRows);
	draggingChildRowId.value = row.id;

	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'copyMove';
	}
	setDragData(event, payload);
	setChildRowDragImage(event, dragRows, row);
};

const handleChildRowDragEnd = () => {
	draggingChildRowId.value = '';
};

const getChildrenV2RowProps = ({ rowData }: { rowData: TreeNode }) => ({
	'draggable': true,
	'data-child-row-id': rowData.id,
	'onDragstart': (event: DragEvent) => handleChildRowDragStart(event, rowData),
	'onDragend': handleChildRowDragEnd
});

const startColumnResize = (event: MouseEvent, key: string) => {
	event.preventDefault();
	event.stopPropagation();

	const startX = event.clientX;
	const startWidth = columnWidths.value[key] || 80;
	const minWidth = key === 'selection' ? 44 : 70;

	const handleMouseMove = (moveEvent: MouseEvent) => {
		const nextWidth = Math.max(minWidth, startWidth + moveEvent.clientX - startX);
		columnWidths.value = {
			...columnWidths.value,
			[key]: nextWidth
		};
	};

	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		document.body.classList.remove('is-resizing-column');
	};

	document.body.classList.add('is-resizing-column');
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);
};

const createResizableHeader = (key: string, title: string) =>
	h('div', { class: 'resizable-header-cell' }, [
		h('span', { class: 'resizable-header-title' }, title),
		h('span', {
			class: 'column-resize-handle',
			onMousedown: (event: MouseEvent) => startColumnResize(event, key)
		})
	]);

const childrenTableColumns = computed<Column<TreeNode>[]>(() => [
	{
		key: 'selection',
		title: '',
		width: columnWidths.value.selection,
		fixed: true,
		align: 'center',
		headerAlign: 'center',
		class: 'selection-column-cell',
		headerClass: 'selection-column-header',
		headerCellRenderer: () =>
			h(
				'div',
				{
					class: 'resizable-header-cell selection-header-cell',
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%',
						height: '100%',
						padding: '0',
						backgroundColor: '#f2f3f5'
					}
				},
				[
					h(ElCheckbox, {
						modelValue: isAllVisibleChildrenSelected.value,
						indeterminate: isSomeVisibleChildrenSelected.value,
						onChange: (checked: string | number | boolean) => toggleAllVisibleChildrenSelection(!!checked)
					}),
					h('span', {
						class: 'column-resize-handle',
						onMousedown: (event: MouseEvent) => startColumnResize(event, 'selection')
					})
				]
			),
		cellRenderer: ({ rowData }) =>
			h(
				'div',
				{
					class: 'selection-cell',
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%',
						height: '30px',
						padding: '0',
						backgroundColor: '#f2f3f5'
					}
				},
				[
					h(ElCheckbox, {
						modelValue: isChildrenRowSelected(rowData),
						onChange: (checked: string | number | boolean) => toggleChildrenRowSelection(rowData, !!checked),
						onClick: (event: MouseEvent) => event.stopPropagation()
					})
				]
			)
	},
	{
		key: 'label',
		dataKey: 'label',
		title: '标题',
		width: columnWidths.value.label,
		fixed: true,
		headerCellRenderer: () => createResizableHeader('label', '标题'),
		cellRenderer: ({ rowData }) =>
			h(
				'div',
				{
					class: 'name-cell',
					style: { paddingLeft: `${(rowData.level || 0) * 20}px` }
				},
				[
					h(
						'span',
						{
							class: [
								rowData.hasChildren || rowData.isExpanded ? 'custom-tree-icon' : 'tree-icon-placeholder',
								isRowExpanding(rowData) ? 'is-loading' : ''
							],
							onClick: (event: MouseEvent) => {
								event.stopPropagation();
								if (!isRowExpanding(rowData) && (rowData.hasChildren || rowData.isExpanded)) toggleRowExpand(rowData);
							}
						},
						rowData.hasChildren || rowData.isExpanded
							? isRowExpanding(rowData)
								? [h(ElIcon, { class: 'expand-loading-icon' }, () => [h(Loading)])]
								: rowData.isExpanded
									? '-'
									: '+'
							: ''
					),
					h(ElImage, {
						src: rowData.icon || rowData.type_icon_url || defaultThumbnail,
						class: 'row-icon',
						fit: 'contain'
					}),
					h('span', { class: 'name-text' }, rowData.label)
				]
			)
	},
	{
		key: 'partNumber',
		dataKey: 'partNumber',
		title: '企业项目编号',
		width: columnWidths.value.partNumber,
		headerCellRenderer: () => createResizableHeader('partNumber', '企业项目编号'),
		cellRenderer: ({ rowData }) =>
			h(
				'span',
				{
					class: 'enterprise-code-link',
					onClick: () => openEnterpriseCodeDialogForChild(rowData)
				},
				getChildEnterpriseCode(rowData)
			)
	},
	{
		key: 'revision',
		dataKey: 'revision',
		title: '修订版',
		width: columnWidths.value.revision,
		headerCellRenderer: () => createResizableHeader('revision', '修订版')
	},
	{
		key: 'instanceLabel',
		dataKey: 'instanceLabel',
		title: '标题(实例)',
		width: columnWidths.value.instanceLabel,
		headerCellRenderer: () => createResizableHeader('instanceLabel', '标题(实例)')
	},
	{
		key: 'isLastRevision',
		dataKey: 'isLastRevision',
		title: '最新修订版',
		width: columnWidths.value.isLastRevision,
		headerCellRenderer: () => createResizableHeader('isLastRevision', '最新修订版'),
		cellRenderer: ({ rowData }) =>
			h(ElIcon, { color: rowData.isLastRevision ? '#67C23A' : '#F56C6C' }, () => [h(rowData.isLastRevision ? Check : Close)])
	},
	{
		key: 'status',
		dataKey: 'status',
		title: '成熟度状态',
		width: columnWidths.value.status,
		headerCellRenderer: () => createResizableHeader('status', '成熟度状态'),
		cellRenderer: ({ rowData }) =>
			h(
				ElTag,
				{
					type: getStatusType(rowData.statusRaw),
					size: 'small',
					class: 'status-tag',
					onClick: () => openMaturityDialogForChild(rowData)
				},
				() => rowData.status
			)
	},
	{
		key: 'owner',
		dataKey: 'owner',
		title: '所有者',
		width: columnWidths.value.owner,
		headerCellRenderer: () => createResizableHeader('owner', '所有者')
	},
	{
		key: 'reserved',
		dataKey: 'reserved',
		title: '锁定',
		width: columnWidths.value.reserved,
		headerCellRenderer: () => createResizableHeader('reserved', '锁定'),
		cellRenderer: ({ rowData }) => h('span', rowData.reserved ? '锁定' : '已解锁')
	},
	{
		key: 'modified',
		dataKey: 'modified',
		title: '修改日期',
		width: columnWidths.value.modified,
		headerCellRenderer: () => createResizableHeader('modified', '修改日期')
	},
	{
		key: 'globalType',
		dataKey: 'globalType',
		title: '类型',
		width: columnWidths.value.globalType,
		headerCellRenderer: () => createResizableHeader('globalType', '类型')
	},
	{
		key: 'identifier',
		dataKey: 'identifier',
		title: '名称',
		width: columnWidths.value.identifier,
		headerCellRenderer: () => createResizableHeader('identifier', '名称')
	}
]);

const createChildrenTableColumns = (tableWidth: number) => {
	const columns = childrenTableColumns.value.map(column => ({ ...column }));
	const totalWidth = columns.reduce((sum, column) => sum + Number(column.width || 0), 0);
	const extraWidth = Math.max(0, tableWidth - totalWidth);
	const lastColumn = columns[columns.length - 1];
	if (lastColumn && extraWidth > 0) {
		lastColumn.width = Number(lastColumn.width || 0) + extraWidth;
	}
	return columns;
};

const openEnterpriseCodeDialogForParent = () => {
	if (!partInfo.value) return;

	enterpriseCodeRows.value = [
		{
			id: partInfo.value.resourceid || partInfo.value.physicalid || currentPhysicalId.value || 'parent',
			label: partInfo.value['ds6w:label'] || '-',
			partNumber: partInfo.value['ds6wg:EnterpriseExtension.V_PartNumber'] || '',
			source: 'parent',
			status: partInfo.value['ds6w:status']
		}
	];
	selectedEnterpriseRows.value = [...enterpriseCodeRows.value];
	enterpriseDialogVisible.value = true;
};

const openEnterpriseCodeDialogForChild = (row: TreeNode) => {
	const rows = selectedChildrenRows.value.some(item => item.id === row.id) ? selectedChildrenRows.value : [row];

	enterpriseCodeRows.value = rows.map(item => ({
		id: item.resourceid || item.id,
		label: item.label || '-',
		partNumber: item.partNumber === '无' ? '' : item.partNumber,
		source: 'child',
		status: item.statusRaw || item.status,
		row: item
	}));
	selectedEnterpriseRows.value = [...enterpriseCodeRows.value];
	enterpriseDialogVisible.value = true;
};

const updateChildEnterpriseCode = (nodes: TreeNode[], id: string, partNumber: string): boolean => {
	for (const node of nodes) {
		if (node.id === id || node.resourceid === id) {
			node.partNumber = normalizeEnterpriseCode(partNumber);
			return true;
		}

		if (node.children?.length && updateChildEnterpriseCode(node.children, id, partNumber)) {
			return true;
		}
	}

	return false;
};

const handleEnterpriseDialogSelectionChange = (rows: EnterpriseCodeRow[]) => {
	selectedEnterpriseRows.value = rows;
};

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

	console.log(
		'[PartDetailView] 设置企业项目编号对象:',
		rows.map(row => ({
			source: row.source,
			physicalid: row.id,
			partNumber: row.partNumber,
			status: row.status
		}))
	);

	try {
		await partDetailApi.setPartNumbers(references);

		rows.forEach(row => {
			if (row.source === 'parent' && partInfo.value) {
				partInfo.value['ds6wg:EnterpriseExtension.V_PartNumber'] = row.partNumber;
				return;
			}

			if (row.source === 'child') {
				updateChildEnterpriseCode(childrenData.value, row.id, row.partNumber);
			}
		});

		enterpriseDialogVisible.value = false;
		ElMessage.success('企业项目编号已更新');
	} catch (error) {
		console.error('[PartDetailView] 设置企业项目编号失败:', error);
		ElMessage.error('设置企业项目编号失败');
	}
};

const getInternalState = (status?: string) => {
	if (!status) return 'IN_WORK';
	if (status.includes('IN_WORK') || status === '工作中') return 'IN_WORK';
	if (status.includes('FROZEN') || status.includes('冻结')) return 'FROZEN';
	if (status.includes('RELEASED') || status.includes('发布')) return 'RELEASED';
	if (status.includes('OBSOLETE') || status.includes('废弃') || status.includes('作废')) return 'OBSOLETE';
	if (status.includes('PRIVATE') || status.includes('草稿') || status.includes('私有')) return 'PRIVATE';
	return status;
};

const getMaturityStateLabel = (state: MaturityState) => {
	if (state.stateUserName) return state.stateUserName;
	if (state.stateSysName === 'PRIVATE') return '草稿';
	if (state.stateSysName === 'IN_WORK') return '工作中';
	if (state.stateSysName === 'FROZEN') return '冻结';
	if (state.stateSysName === 'RELEASED') return '已发布';
	if (state.stateSysName === 'OBSOLETE') return '作废';
	return state.stateSysName;
};

const buildMaturityObjectForParent = (): MaturityObjectParams | null => {
	if (!partInfo.value) return null;
	const physicalid = partInfo.value.resourceid || partInfo.value.physicalid || currentPhysicalId.value;
	const currentInternal = getInternalState(partInfo.value['ds6w:status']);

	return {
		physicalid,
		name: partInfo.value['ds6w:identifier'] || partInfo.value['ds6w:label'] || '',
		displayName: `${partInfo.value['ds6w:label'] || ''} ${partInfo.value['ds6wg:revision'] || ''}`.trim(),
		type: partInfo.value['ds6w:type'] || 'VPMReference',
		serviceId: '3DSpace',
		typeDisplayName: partInfo.value['ds6w:globalType'] || partInfo.value['ds6w:type'] || '物理产品',
		current: formatStatus(partInfo.value['ds6w:status']),
		current_internal: currentInternal,
		revision: partInfo.value['ds6wg:revision'] || '',
		tenant: 'OnPremise',
		imageUrl: partInfo.value.type_icon_url || '',
		cadMaster: partInfo.value['ds6w:cadMaster'] || '3DEXPERIENCE',
		locked: partInfo.value['ds6w:reserved'] === 'TRUE' || partInfo.value['ds6w:reserved'] === 'true',
		lockedBy: partInfo.value['ds6w:reservedBy'] || '',
		policy: partInfo.value['ds6w:policy'] || '',
		reservedby: partInfo.value['ds6w:reservedBy'] || '',
		coretype: 'Reference'
	};
};

const buildMaturityObjectForChild = (row: TreeNode): MaturityObjectParams => ({
	physicalid: row.resourceid || row.id,
	name: row.identifier || row.label,
	displayName: `${row.label} ${row.revision}`.trim(),
	type: row.globalType || 'VPMReference',
	serviceId: '3DSpace',
	typeDisplayName: row.typeDisplayName || row.globalType || '物理产品',
	current: row.status,
	current_internal: getInternalState(row.statusRaw || row.status),
	revision: row.revision,
	tenant: 'OnPremise',
	imageUrl: row.icon || '',
	cadMaster: row.cadMaster || '3DEXPERIENCE',
	locked: row.reserved,
	lockedBy: row.reserved ? row.owner : '',
	policy: row.policy || '',
	reservedby: row.reserved ? row.owner : '',
	coretype: 'Reference'
});

const openMaturityDialog = async (maturityObject: MaturityObjectParams, source: 'parent' | 'child', row?: TreeNode) => {
	maturityDialogVisible.value = true;
	maturityLoading.value = true;
	maturityDialogTitle.value = maturityObject.displayName || maturityObject.name;
	maturitySelectedObject.value = maturityObject;
	maturitySelectedSource.value = source;
	maturitySelectedRow.value = row || null;
	includeStructureObjects.value = false;

	try {
		const response = await partDetailApi.getStateGraph([maturityObject]);
		const policy = response.data?.policies?.[0];
		const object = response.data?.objects?.[0];
		const states = [...(policy?.maturityGraph.states || [])].sort((a, b) => a.visuorder - b.visuorder);
		const transitions = policy?.maturityGraph.transitions || [];
		const hasObsoleteTransition = transitions.some(item => item.sourceState === 'OBSOLETE' || item.targetState === 'OBSOLETE');
		const hasObsoleteState = states.some(item => item.stateSysName === 'OBSOLETE');

		if (hasObsoleteTransition && !hasObsoleteState) {
			states.push({
				stateSysName: 'OBSOLETE',
				stateUserName: '作废',
				activeColor: '#8c8c8c',
				inactiveColor: '#8c8c8c',
				visuorder: states.length + 1
			});
		}

		maturityStates.value = states;
		maturityTransitions.value = transitions;
		maturityCurrentState.value = object?.current_internal || maturityObject.current_internal;
	} catch (error) {
		console.error('[PartDetailView] 获取成熟度状态图失败:', error);
		ElMessage.error('获取成熟度状态图失败');
		maturityDialogVisible.value = false;
	} finally {
		maturityLoading.value = false;
	}
};

const openMaturityDialogForParent = () => {
	const maturityObject = buildMaturityObjectForParent();
	if (!maturityObject) return;
	openMaturityDialog(maturityObject, 'parent');
};

const openMaturityDialogForChild = (row: TreeNode) => {
	openMaturityDialog(buildMaturityObjectForChild(row), 'child', row);
};

const getRouteFromCurrent = (targetState: string) => {
	const transition = maturityTransitions.value.find(item => item.sourceState === maturityCurrentState.value && item.targetState === targetState);
	const signature = transition?.signatures?.[0];

	if (!transition || !signature) return null;

	return {
		fromState: transition.sourceState,
		toState: transition.targetState,
		signature: signature.name,
		label: signature.username
	};
};

const isReverseTransition = (targetState: string) => {
	const currentIndex = maturityStates.value.findIndex(state => state.stateSysName === maturityCurrentState.value);
	const targetIndex = maturityStates.value.findIndex(state => state.stateSysName === targetState);

	return currentIndex > -1 && targetIndex > -1 && targetIndex < currentIndex;
};

const getReverseRouteStyle = (targetState: string) => {
	if (!isReverseTransition(targetState)) return {};

	const currentIndex = maturityStates.value.findIndex(state => state.stateSysName === maturityCurrentState.value);
	const targetIndex = maturityStates.value.findIndex(state => state.stateSysName === targetState);
	const stateStepWidth = 136;
	const stateWidth = 102;

	return {
		'--reverse-route-left': `${targetIndex * stateStepWidth + stateWidth / 2}px`,
		'--reverse-route-width': `${(currentIndex - targetIndex) * stateStepWidth}px`
	};
};

const getStateStyle = (state: MaturityState) => {
	const isActive = state.stateSysName === maturityCurrentState.value;
	const backgroundColor = isActive ? state.activeColor : state.inactiveColor;
	const isWhiteObsolete = state.stateSysName === 'OBSOLETE' && (!backgroundColor || backgroundColor.toLowerCase() === '#ffffff');

	return {
		backgroundColor: isWhiteObsolete ? '#8c8c8c' : backgroundColor,
		borderColor: isWhiteObsolete ? '#8c8c8c' : backgroundColor
	};
};

const collectChildPromoteParams = (nodes: TreeNode[], route: ReturnType<typeof getRouteFromCurrent>): PromoteMaturityParams[] => {
	if (!route) return [];

	return nodes.flatMap(node => {
		const fromstate = getInternalState(node.statusRaw || node.status);
		const params: PromoteMaturityParams[] = [];

		if ((node.resourceid || node.id) && fromstate === route.fromState) {
			params.push({
				physicalid: node.resourceid || node.id,
				tostate: route.toState,
				fromstate,
				policy: node.policy || maturitySelectedObject.value?.policy || '',
				signature: route.signature
			});
		}

		return [...params, ...collectChildPromoteParams(node.children || [], route)];
	});
};

const handleMaturityStateClick = async (targetState: string) => {
	const route = getRouteFromCurrent(targetState);
	const selectedObject = maturitySelectedObject.value;

	if (!route || !selectedObject) return;

	const params: PromoteMaturityParams[] = [
		{
			physicalid: selectedObject.physicalid,
			tostate: route.toState,
			fromstate: route.fromState,
			type: selectedObject.type,
			revision: selectedObject.revision,
			policy: selectedObject.policy,
			name: selectedObject.name,
			coretype: selectedObject.coretype,
			signature: route.signature,
			cadMaster: selectedObject.cadMaster
		}
	];

	if (includeStructureObjects.value) {
		params.push(...collectChildPromoteParams(childrenData.value, route));
	}

	console.log('[PartDetailView] 修改成熟度状态参数:', JSON.stringify(params, null, 2));

	try {
		maturityLoading.value = true;
		await partDetailApi.promoteMaturity(params);
		maturityCurrentState.value = route.toState;

		if (maturitySelectedSource.value === 'parent' && partInfo.value) {
			partInfo.value['ds6w:status'] = route.toState;
		}

		if (maturitySelectedSource.value === 'child' && maturitySelectedRow.value) {
			maturitySelectedRow.value.statusRaw = route.toState;
			maturitySelectedRow.value.status = formatStatus(route.toState);
		}

		ElMessage.success('成熟度状态已更新');
		maturityDialogVisible.value = false;
	} catch (error) {
		console.error('[PartDetailView] 修改成熟度状态失败:', error);
		ElMessage.error('修改成熟度状态失败');
	} finally {
		maturityLoading.value = false;
	}
};

// 格式化日期时间
const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '-';
	try {
		const date = new Date(dateString);
		return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 下午${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
	} catch {
		return dateString;
	}
};

// 格式化状态 - 根据完整状态码映射
const formatStatus = (status?: string): string => {
	if (!status) return '工作中';
	if (status.includes('IN_WORK')) return '工作中';
	if (status.includes('FROZEN')) return '冻结';
	if (status.includes('RELEASED')) return '发布';
	if (status.includes('OBSOLETE')) return '废弃';
	if (status.includes('PRIVATE')) return '私有';
	return status;
};

// 获取状态类型
const getStatusType = (status?: string): TagType => {
	if (!status) return 'primary';
	if (status.includes('IN_WORK')) return 'primary';
	if (status.includes('RELEASED')) return 'success';
	if (status.includes('FROZEN')) return 'info';
	if (status.includes('OBSOLETE')) return 'danger';
	if (status.includes('PRIVATE')) return 'warning';
	return 'info';
};

// 加载零件详情
const loadPartDetail = async (physicalId: string) => {
	loading.value = true;
	console.log('[PartDetailView] 加载零件详情:', physicalId);

	// 判断查询模式
	const isDbMode = queryModeStore.isDbMode;
	console.log('[PartDetailView] 当前查询模式:', isDbMode ? '数据库模式' : '索引模式');

	try {
		if (isDbMode) {
			// 数据库模式：使用 enoauthoring/expand 同时获取零件详情和子级展开，同时获取关联文档
			console.log('[PartDetailView] 使用数据库模式查询');
			const [expandResponse, docs] = await Promise.all([expandApi.getExpandDataDbMode(physicalId), expandApi.getSpecificationDocuments(physicalId)]);
			console.log('[PartDetailView] DB模式 展开数据响应:', expandResponse);
			console.log('[PartDetailView] DB模式 文档数据响应:', docs);

			// 从展开响应中提取零件基本信息
			const dbPartInfo = expandApi.extractPartInfoFromDbExpand(expandResponse, physicalId);
			if (dbPartInfo) {
				// 如果已有零件信息（手动切换DB模式），只更新非图片字段，保持缩略图不变
				if (partInfo.value) {
					console.log('[PartDetailView] DB模式 保留原有零件信息，仅更新子级数据');
				} else {
					// 首次加载（如从创建页跳转），使用DB模式返回的零件信息
					partInfo.value = dbPartInfo as PartInfo;
					console.log('[PartDetailView] DB模式 零件信息:', partInfo.value);
				}
			} else {
				console.warn('[PartDetailView] DB模式 未能从展开响应中提取零件信息');
				if (!partInfo.value) partInfo.value = null;
			}

			// 保存当前 physicalId
			currentPhysicalId.value = physicalId;

			// 解析子级树形数据（产品子级）
			const productChildren = expandApi.parseExpandData(expandResponse, physicalId);
			// 解析文档数据为树形节点
			const docChildren = expandApi.parseDocumentsToTreeNodes(docs, 1, [physicalId]);
			// 合并产品子级和文档，按标题排序
			const treeData = [...productChildren, ...docChildren].sort((a, b) => (a.label || '').localeCompare(b.label || '', 'zh'));
			console.log('[PartDetailView] DB模式 解析后的树形数据:', treeData);
			childrenData.value = treeData;
		} else {
			// 索引模式：保持原有逻辑
			console.log('[PartDetailView] 使用索引模式查询');
			const response = await partDetailApi.getPartDetail(physicalId);
			console.log('[PartDetailView] 零件详情响应:', response);

			if (response && response.results && response.results.length > 0) {
				// 第一个结果是零件基本信息
				partInfo.value = response.results[0];
				console.log('[PartDetailView] 零件信息:', partInfo.value);

				// 保存当前 physicalId
				currentPhysicalId.value = physicalId;

				// 加载子级展开数据
				await loadExpandData(physicalId);
			} else {
				console.warn('[PartDetailView] 响应为空或格式不正确:', response);
				// 即使没有数据也显示页面
				partInfo.value = null;
				childrenData.value = [];
			}
		}
	} catch (error) {
		console.error('[PartDetailView] 加载零件详情失败:', error);
		ElMessage.error('加载零件详情失败');
		// 即使出错也显示页面
		partInfo.value = null;
		childrenData.value = [];
	} finally {
		loading.value = false;
	}
};

// 加载展开数据（子级）
const loadExpandData = async (physicalId: string) => {
	// 数据库模式下已在 loadPartDetail 中完成展开加载，跳过
	if (queryModeStore.isDbMode) {
		console.log('[PartDetailView] 数据库模式下跳过独立展开加载');
		return;
	}

	childrenLoading.value = true;
	console.log('[PartDetailView] 加载展开数据:', physicalId);

	try {
		const response = await expandApi.getExpandData(physicalId);
		console.log('[PartDetailView] 展开数据响应:', response);

		// 解析为树形结构
		const treeData = expandApi.parseExpandData(response, physicalId);
		console.log('[PartDetailView] 解析后的树形数据:', treeData);

		childrenData.value = treeData;
	} catch (error) {
		console.error('[PartDetailView] 加载展开数据失败:', error);
		ElMessage.error('加载子级数据失败');
		childrenData.value = [];
	} finally {
		childrenLoading.value = false;
	}
};

// 加载子节点（树形展开）
const loadChildren = async (row: TreeNode, treeNode: any, resolve: (data: TreeNode[]) => void) => {
	console.log(
		'[PartDetailView] 加载子节点:',
		row.resourceid,
		'父节点level:',
		row.level,
		'当前模式:',
		queryModeStore.isDbMode ? '数据库模式' : '索引模式'
	);

	try {
		let childData: TreeNode[] = [];

		if (queryModeStore.isDbMode) {
			// 数据库模式下同时查询子级产品和关联文档
			const [expandResponse, docs] = await Promise.all([
				expandApi.getExpandDataDbMode(row.resourceid),
				expandApi.getSpecificationDocuments(row.resourceid)
			]);

			const productChildren = expandApi.parseExpandData(expandResponse, row.resourceid);
			const docChildren = expandApi.parseDocumentsToTreeNodes(docs, (row.level || 0) + 1, row.path || [row.resourceid]);

			// 合并产品子级和文档，按标题排序
			childData = [...productChildren, ...docChildren].sort((a, b) => (a.label || '').localeCompare(b.label || '', 'zh'));
		} else {
			const response = await expandApi.getExpandData(row.resourceid);
			childData = expandApi.parseExpandData(response, row.resourceid);
		}

		// 设置子节点的 level 为父节点 level + 1
		const childDataWithLevel = childData.map(child => ({
			...child,
			level: (row.level || 0) + 1
		}));

		// 更新子节点数据
		row.children = childDataWithLevel;
		// 保留 hasChildren 为 true，确保展开/收起图标始终可交互
		row.hasChildren = true;

		resolve(childDataWithLevel);
	} catch (error) {
		console.error('[PartDetailView] 加载子节点失败:', error);
		resolve([]);
	}
};

// 切换行展开/收起
const toggleRowExpand = async (row: TreeNode) => {
	if (isRowExpanding(row)) return;

	if (row.isExpanded) {
		row.isExpanded = false;
		return;
	}

	if (!row.children?.length) {
		setRowExpanding(row, true);
		try {
			await loadChildren(row, null, childData => {
				row.children = childData;
			});
		} finally {
			setRowExpanding(row, false);
		}
	}

	row.isExpanded = true;
};

const reloadAndExpandRow = async (row: TreeNode) => {
	if (isRowExpanding(row)) return;

	setRowExpanding(row, true);
	try {
		await loadChildren(row, null, childData => {
			row.children = childData;
		});
		row.hasChildren = true;
		row.isExpanded = true;
	} finally {
		setRowExpanding(row, false);
	}
};

// ============================================================
// 展开菜单功能（独立方法，不混合原有逻辑）
// ============================================================

/**
 * 处理展开菜单命令
 * 独立方法，不混合原有 reloadAndExpandRow 逻辑
 */
const handleExpandMenuCommand = async (command: string) => {
	console.log('[PartDetailView] 展开菜单命令:', command);
	expandMenuActive.value = true;

	try {
		switch (command) {
			case 'expand':
				await handleExpandSelected();
				break;
			case 'expandAll':
				await handleExpandAll();
				break;
			case 'expandN':
				expandNDialogVisible.value = true;
				break;
			case 'collapseAll':
				await handleCollapseAll();
				break;
		}
	} catch (error) {
		console.error('[PartDetailView] 展开菜单命令执行失败:', error);
		ElMessage.error('展开操作失败');
	}
};

/**
 * 处理展开选中行
 * 独立方法，不混合原有 reloadAndExpandRow 逻辑
 */
const handleExpandSelected = async () => {
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) {
		ElMessage.warning('当前没有加载零件');
		return;
	}

	expandMenuLoading.value = true;
	try {
		// 判断是否有勾选的行
		const hasSelectedRows = selectedChildrenRows.value.length > 0;
		const selectedRows = hasSelectedRows ? selectedChildrenRows.value : null;

		console.log('[PartDetailView] 展开选中行 - 根节点:', rootPhysicalId, '选中行数:', selectedRows?.length || 0);

		// 构建请求参数
		const params = expandApi.buildExpandRequestParams(rootPhysicalId, selectedRows, 1);

		// 调用 API
		const response = await expandApi.expandWithParams(params);

		// 更新表格数据
		await updateTableDataAfterExpand(response, selectedRows);

		ElMessage.success('展开成功');
	} catch (error) {
		console.error('[PartDetailView] 展开选中行失败:', error);
		ElMessage.error('展开失败');
	} finally {
		expandMenuLoading.value = false;
	}
};

/**
 * 处理全部展开
 * 独立方法，不混合原有 reloadAndExpandRow 逻辑
 * 如果有选中的行，则只展开选中的行；否则展开根节点
 */
const handleExpandAll = async () => {
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) {
		ElMessage.warning('当前没有加载零件');
		return;
	}

	expandMenuLoading.value = true;
	try {
		// 检查是否有选中的行
		const hasSelectedRows = selectedChildrenRows.value.length > 0;
		const selectedRows = hasSelectedRows ? selectedChildrenRows.value : null;

		console.log('[PartDetailView] 全部展开 - 根节点:', rootPhysicalId, '选中行数:', selectedRows?.length || 0);

		// 使用较大的层级数实现全部展开效果
		const params = expandApi.buildExpandRequestParams(rootPhysicalId, selectedRows, 10);
		const response = await expandApi.expandWithParams(params);

		// 更新表格数据（全部展开）
		await updateTableDataAfterExpandAll(response, selectedRows);

		ElMessage.success('全部展开成功');
	} catch (error) {
		console.error('[PartDetailView] 全部展开失败:', error);
		ElMessage.error('全部展开失败');
	} finally {
		expandMenuLoading.value = false;
	}
};

/**
 * 处理确认展开 N 层
 * 独立方法，不混合原有 reloadAndExpandRow 逻辑
 */
const handleConfirmExpandN = async () => {
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) {
		ElMessage.warning('当前没有加载零件');
		return;
	}

	const level = expandNLevel.value;
	if (!level || level < 1) {
		ElMessage.warning('请输入有效的层数');
		return;
	}

	expandNDialogVisible.value = false;
	expandMenuLoading.value = true;
	try {
		console.log('[PartDetailView] 展开 N 层 - 根节点:', rootPhysicalId, '层数:', level);

		// 判断是否有勾选的行
		const hasSelectedRows = selectedChildrenRows.value.length > 0;
		const selectedRows = hasSelectedRows ? selectedChildrenRows.value : null;

		const params = expandApi.buildExpandRequestParams(rootPhysicalId, selectedRows, level);
		const response = await expandApi.expandWithParams(params);

		await updateTableDataAfterExpand(response, selectedRows);

		ElMessage.success(`展开 ${level} 层成功`);
	} catch (error) {
		console.error('[PartDetailView] 展开 N 层失败:', error);
		ElMessage.error('展开失败');
	} finally {
		expandMenuLoading.value = false;
	}
};

/**
 * 处理全部折叠
 * 独立方法，不混合原有逻辑
 */
const handleCollapseAll = async () => {
	console.log('[PartDetailView] 全部折叠');

	// 递归折叠所有节点
	const collapseNodes = (nodes: TreeNode[]) => {
		nodes.forEach(node => {
			node.isExpanded = false;
			if (node.children?.length) {
				collapseNodes(node.children);
			}
		});
	};

	collapseNodes(childrenData.value);

	// 清空展开状态集合
	expandingRowIds.value = new Set();

	ElMessage.success('全部折叠成功');
};

/**
 * 更新表格数据（展开后）- 用于【展开】按钮
 * 独立方法，将展开返回的数据合并到现有树结构中
 * 使用 parseExpandDataRecursive 递归解析数据，支持去掉前缀路径（多层展开）
 */
const updateTableDataAfterExpand = async (response: any, selectedRows: TreeNode[] | null) => {
	if (!response || !response.results) {
		console.warn('[PartDetailView] 展开响应为空');
		return;
	}

	// 解析展开数据
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) return;

	if (selectedRows && selectedRows.length > 0) {
		// 有选中行：将新数据合并到选中行的子节点（多层展开）
		for (const selectedRow of selectedRows) {
			// 设置选中行为展开状态
			selectedRow.isExpanded = true;
			selectedRow.hasChildren = true;

			// 使用选中行的 path 作为前缀路径
			const prefixPath = selectedRow.path || [rootPhysicalId];
			console.log('[PartDetailView] 更新选中行子节点 - 前缀路径:', prefixPath);

			// 使用 parseExpandDataRecursive 递归解析数据（多层展开）
			const newChildren = expandApi.parseExpandDataRecursive(response, rootPhysicalId, prefixPath);

			if (newChildren.length > 0) {
				// 递归解析的 level 是相对于去掉前缀后的路径的，需要加上父节点的 level
				const parentLevel = selectedRow.level || 0;
				const adjustLevel = (nodes: TreeNode[]): TreeNode[] => {
					return nodes.map(node => ({
						...node,
						level: node.level + parentLevel + 1,
						children: node.children && node.children.length > 0 ? adjustLevel(node.children) : []
					}));
				};
				selectedRow.children = adjustLevel(newChildren);
			}
		}
	} else {
		// 无选中行：更新根节点的子节点（多层展开）
		// 使用根节点作为前缀路径
		const prefixPath = [rootPhysicalId];
		console.log('[PartDetailView] 更新根节点子节点 - 前缀路径:', prefixPath);

		// 使用 parseExpandDataRecursive 递归解析数据（多层展开）
		const newChildren = expandApi.parseExpandDataRecursive(response, rootPhysicalId, prefixPath);

		if (newChildren.length > 0) {
			childrenData.value = newChildren.map(child => ({
				...child,
				level: 0
			}));
		}
	}
};

/**
 * 更新表格数据（全部展开后）- 用于【全部展开】按钮
 * 独立方法，将展开返回的数据合并到现有树结构中
 * 使用 parseExpandDataRecursive 递归解析多层数据（根节点和选中行都支持多层）
 */
const updateTableDataAfterExpandAll = async (response: any, selectedRows: TreeNode[] | null) => {
	if (!response || !response.results) {
		console.warn('[PartDetailView] 全部展开响应为空');
		return;
	}

	// 解析展开数据
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) return;

	if (selectedRows && selectedRows.length > 0) {
		// 有选中行：将新数据合并到选中行的子节点（多层展开）
		for (const selectedRow of selectedRows) {
			// 设置选中行为展开状态
			selectedRow.isExpanded = true;
			selectedRow.hasChildren = true;

			// 使用选中行的 path 作为前缀路径
			const prefixPath = selectedRow.path || [rootPhysicalId];
			console.log('[PartDetailView] 全部展开 - 更新选中行子节点 - 前缀路径:', prefixPath);

			// 使用 parseExpandDataRecursive 递归解析多层数据
			const newChildren = expandApi.parseExpandDataRecursive(response, rootPhysicalId, prefixPath);

			if (newChildren.length > 0) {
				// 先清空现有子节点，再赋值新子节点
				// 递归解析的 level 是相对于去掉前缀后的路径的，需要加上父节点的 level
				const parentLevel = selectedRow.level || 0;
				const adjustLevel = (nodes: TreeNode[]): TreeNode[] => {
					return nodes.map(node => ({
						...node,
						level: node.level + parentLevel + 1,
						children: node.children && node.children.length > 0 ? adjustLevel(node.children) : []
					}));
				};
				selectedRow.children = [];
				selectedRow.children = adjustLevel(newChildren);
			}
		}
	} else {
		// 无选中行：更新根节点的子节点（多层展开）
		// 使用根节点作为前缀路径
		const prefixPath = [rootPhysicalId];
		console.log('[PartDetailView] 全部展开 - 更新根节点子节点 - 前缀路径:', prefixPath);

		// 使用 parseExpandDataRecursive 递归解析多层数据
		const newChildren = expandApi.parseExpandDataRecursive(response, rootPhysicalId, prefixPath);

		if (newChildren.length > 0) {
			childrenData.value = newChildren;
		}
	}
};

const findRowsByIds = (nodes: TreeNode[], ids: string[]): TreeNode[] => {
	const idSet = new Set(ids);
	const rows: TreeNode[] = [];

	const walk = (items: TreeNode[]) => {
		items.forEach(item => {
			if (idSet.has(item.id)) {
				rows.push(item);
			}
			if (item.children?.length) {
				walk(item.children);
			}
		});
	};

	walk(nodes);
	return rows;
};

const refreshAfterTableCreate = async () => {
	if (dialogStore.createSource !== 'partDetailTable') return;

	queryModeStore.switchToDbMode();

	const rowIds = [...dialogStore.createContextRowIds];

	if (rowIds.length) {
		const rows = findRowsByIds(childrenData.value, rowIds);
		await Promise.all(rows.map(row => reloadAndExpandRow(row)));
	} else if (currentPhysicalId.value) {
		await loadPartDetail(currentPhysicalId.value);
	}

	if (!dialogStore.lastCreatedInfo?.repeat) {
		dialogStore.clearCreateContext();
	}
};
// 返回上一页
const handleBack = () => {
	router.back();
};

// 切换查询模式
const handleModeSwitch = () => {
	const wasDbMode = queryModeStore.isDbMode;
	queryModeStore.toggleMode();
	if (!wasDbMode) {
		ElMessage.info('三分钟之后就自动切换回索引模式');
		// 索引模式 → 数据库模式：重新加载数据
		if (currentPhysicalId.value) {
			loadPartDetail(currentPhysicalId.value);
		}
	}
	// 数据库模式 → 索引模式：只切换，不刷新不重新请求
};

// 初始化 3DE 拖拽功能（整个上半部分支持拖拽）
let dropZoneCleanup: (() => void) | null = null;
let childrenDropZoneCleanup: (() => void) | null = null;

interface DroppedItem {
	physicalId: string;
	title: string;
	relationId?: string;
	pathArray?: string[];
	sourceParentPath?: string[];
	sourceParentRowId?: string;
	rowId?: string;
	isInternalChildRow?: boolean;
}

interface ReparentResponse {
	status?: string;
	messages?: string[];
}

interface ChildrenDropTarget {
	physicalId: string;
	name: string;
	pathArray: string[];
	row?: TreeNode;
}

let lastChildrenDragOverEvent: DragEvent | null = null;

const getDroppedItems = (data: string): DroppedItem[] => {
	const jsonData = JSON.parse(data);
	const items = jsonData.data?.items || [];
	const isInternalChildRow = jsonData.source?.amd === 'TW_EngineeringRelease/PartDetailView';

	return items
		.map(
			(item: {
				objectId?: string;
				displayName?: string;
				title?: string;
				name?: string;
				objectName?: string;
				relationId?: string;
				path?: string[];
				sourceParentRowId?: string;
				rowId?: string;
			}) => {
				const sourceParentPath = item.path && item.path.length > 2 ? item.path.slice(0, -2) : undefined;
				return {
					physicalId: item.objectId || '',
					title: item.displayName || item.title || item.name || item.objectName || '',
					relationId: item.relationId,
					pathArray: item.relationId ? [item.relationId] : undefined,
					sourceParentPath,
					sourceParentRowId: item.sourceParentRowId,
					rowId: item.rowId,
					isInternalChildRow
				};
			}
		)
		.filter((item: DroppedItem) => !!item.physicalId);
};

const isSamePath = (left?: string[], right?: string[]) =>
	!!left?.length && !!right?.length && left.length === right.length && left.every((item, index) => item === right[index]);

const findRowByPath = (path?: string[]) => flattenChildrenData.value.find(row => isSamePath(row.path, path)) || null;

const getCatflNls = () => {
	const language = localStorage.getItem('language') || navigator.language || 'zh';
	return language.toLowerCase().startsWith('en') ? enCatflNls : zhCatflNls;
};

const getReparentErrorMessage = (response: unknown) => {
	const messages = (response as ReparentResponse)?.messages || [];
	const nls = getCatflNls() as Record<string, string>;
	const localizedMessages = messages.map(message => nls[message] || message);
	return localizedMessages.join('<br />');
};

const showReparentFailureMessage = async (response: unknown) => {
	const message = getReparentErrorMessage(response);
	await ElMessageBox.alert(message || '插入失败', '插入失败', {
		confirmButtonText: '关闭',
		dangerouslyUseHTMLString: true,
		type: 'error'
	});
};

const getMovedSourceParentRows = (droppedItems: DroppedItem[]) => {
	const rootPhysicalId = getParentPhysicalId();
	const sourceParentRowIds = droppedItems
		.map(item => item.sourceParentRowId)
		.filter((rowId): rowId is string => !!rowId)
		.filter((rowId, index, rowIds) => rowIds.indexOf(rowId) === index);
	const sourceParentPaths = droppedItems
		.map(item => item.sourceParentPath)
		.filter((path): path is string[] => !!path?.length)
		.filter((path, index, paths) => paths.findIndex(item => isSamePath(item, path)) === index);
	const sourceRows = [
		...sourceParentRowIds.map(rowId => flattenChildrenData.value.find(row => row.id === rowId) || null),
		...sourceParentPaths.map(path => findRowByPath(path))
	].filter((row): row is TreeNode => !!row);
	const hasRootSource = droppedItems.some(
		item => item.isInternalChildRow && !item.sourceParentRowId && childrenData.value.some(row => row.id === item.rowId)
	);
	const shouldReloadRoot = hasRootSource || sourceParentPaths.some(path => path.length === 1 && path[0] === rootPhysicalId);
	return {
		sourceRows,
		shouldReloadRoot
	};
};

const refreshMovedSourceAndTarget = async (droppedItems: DroppedItem[], target: ChildrenDropTarget) => {
	const rootPhysicalId = getParentPhysicalId();
	const { sourceRows, shouldReloadRoot } = getMovedSourceParentRows(droppedItems);
	const targetRowId = target.row?.id;
	const rows = [...sourceRows, target.row].filter((row): row is TreeNode => !!row);
	const uniqueRows = rows.filter((row, index, items) => items.findIndex(item => item.id === row.id) === index);

	if ((shouldReloadRoot || !target.row) && rootPhysicalId) {
		await loadPartDetail(rootPhysicalId);
	}
	if (uniqueRows.length) {
		const latestRows = uniqueRows.map(row => flattenChildrenData.value.find(item => item.id === row.id) || row);
		await Promise.all(latestRows.map(row => reloadAndExpandRow(row)));
	}
	if (targetRowId && !uniqueRows.some(row => row.id === targetRowId)) {
		const latestTargetRow = flattenChildrenData.value.find(row => row.id === targetRowId);
		if (latestTargetRow) {
			await reloadAndExpandRow(latestTargetRow);
		}
	}
};

const findChildrenDropRow = (event?: DragEvent | null) => {
	if (!event) return null;

	const rowElement = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-child-row-id]') as HTMLElement | null;
	const rowId = rowElement?.dataset.childRowId;
	return rowId ? flattenChildrenData.value.find(row => row.id === rowId) || null : null;
};

const getRootChildrenDropTarget = (): ChildrenDropTarget | null => {
	const physicalId = partInfo.value?.resourceid || partInfo.value?.physicalid || currentPhysicalId.value;
	if (!physicalId) return null;

	return {
		physicalId,
		name: `${partInfo.value?.['ds6w:label'] || '当前零件'} ${partInfo.value?.['ds6wg:revision'] || ''}`.trim(),
		pathArray: [physicalId]
	};
};

const getChildrenDropTarget = (event?: DragEvent | null): ChildrenDropTarget | null => {
	const targetRow = findChildrenDropRow(event);
	if (targetRow) {
		return {
			physicalId: targetRow.resourceid,
			name: `${targetRow.label || targetRow.identifier || targetRow.resourceid} ${targetRow.revision || ''}`.trim(),
			pathArray: targetRow.path?.length ? targetRow.path : [targetRow.resourceid],
			row: targetRow
		};
	}

	return getRootChildrenDropTarget();
};

const updateChildrenDragOverRow = (event?: DragEvent | null) => {
	const targetRow = findChildrenDropRow(event);
	dragOverChildRowId.value = targetRow?.id || '';
};

const handleChildrenDrop = async (data: string, childrenDropZone: HTMLElement, event?: DragEvent | null) => {
	console.log('[PartDetailView] 表格拖拽数据:', data);

	try {
		const droppedItems = getDroppedItems(data);
		const sourcePhysicalIds = droppedItems.map((item: DroppedItem) => item.physicalId);
		const target = getChildrenDropTarget(event || lastChildrenDragOverEvent);

		if (!sourcePhysicalIds.length) {
			ElMessage.warning('未获取到可插入的对象');
			return;
		}

		if (!target?.physicalId) {
			ElMessage.warning('未获取到插入的父节点');
			return;
		}

		const insertName = droppedItems.length > 1 ? '全部选定对象' : droppedItems[0]?.title || '选定对象';
		await ElMessageBox.confirm(`是否确定要向 物理产品${target.name} 插入 ${insertName}？`, '插入', {
			confirmButtonText: '插入',
			cancelButtonText: '取消',
			type: 'warning'
		});

		childrenLoading.value = true;
		const isInternalMove = droppedItems.every(item => item.isInternalChildRow && item.relationId);
		let reparentSourceItems: Array<string | ReparentSourceItem> = sourcePhysicalIds;
		if (isInternalMove) {
			reparentSourceItems = droppedItems.map(item => ({
				physicalId: item.physicalId,
				instance: item.relationId,
				pathArray: item.pathArray,
				mode: 'CutPaste'
			}));
		}
		const response = (await partDetailApi.reparentParts(reparentSourceItems, target.physicalId, [], target.pathArray)) as ReparentResponse;
		if (response?.status && response.status !== 'success') {
			await showReparentFailureMessage(response);
			return;
		}
		queryModeStore.switchToDbMode();
		if (isInternalMove) {
			await refreshMovedSourceAndTarget(droppedItems, target);
		} else {
			if (target.row) {
				await reloadAndExpandRow(target.row);
			} else {
				await loadPartDetail(partInfo.value?.resourceid || partInfo.value?.physicalid || currentPhysicalId.value);
			}
		}
		ElMessage.success('插入成功');
	} catch (error) {
		if (error === 'cancel' || error === 'close') {
			return;
		}

		console.error('[PartDetailView] 插入子级失败:', error);
		ElMessage.error('插入失败');
	} finally {
		childrenLoading.value = false;
		dragOverChildRowId.value = '';
		childrenDropZone.classList.remove('drag-over');
	}
};

const initDragAndDrop = () => {
	const dropZone = document.getElementById('dropZone');
	const childrenDropZone = document.getElementById('childrenDropZone');
	if (!dropZone && !childrenDropZone) return;

	// @ts-expect-error parent require is provided by 3DDashboard at runtime
	if (parent && parent.require) {
		// @ts-expect-error parent require is provided by 3DDashboard at runtime
		parent.require(['DS/DataDragAndDrop/DataDragAndDrop'], (DataDragAndDrop: any) => {
			console.log('[PartDetailView] 初始化拖拽功能');

			if (dropZone) {
				DataDragAndDrop.droppable(dropZone, {
					drop: async (data: string) => {
						console.log('[PartDetailView] 拖拽数据:', data);
						try {
							const jsonData = JSON.parse(data);
							const items = jsonData.data?.items || [];

							// 检查是否拖拽了多个对象
							if (items.length > 1) {
								ElMessage.warning('只能在单个对象上执行打开');
								dropZone.classList.remove('drag-over');
								return;
							}

							if (items.length === 1) {
								const physicalId = items[0]?.objectId;
								if (physicalId) {
									await loadPartDetail(physicalId);
									ElMessage.success('加载零件信息成功');
								}
							}
						} catch (error) {
							console.error('[PartDetailView] 解析拖拽数据失败:', error);
							ElMessage.error('解析拖拽数据失败');
						} finally {
							dropZone.classList.remove('drag-over');
						}
					},
					enter: () => {
						console.log('[PartDetailView] 拖拽进入');
						dropZone.classList.add('drag-over');
					},
					over: () => {},
					leave: () => {
						console.log('[PartDetailView] 拖拽离开');
						dropZone.classList.remove('drag-over');
					}
				});

				dropZoneCleanup = () => {
					// 清理拖拽绑定
					DataDragAndDrop.unbind(dropZone);
				};
			}

			if (childrenDropZone) {
				const handleChildrenNativeDragOver = (event: DragEvent) => {
					lastChildrenDragOverEvent = event;
					updateChildrenDragOverRow(event);
				};
				const handleChildrenNativeDrop = (event: DragEvent) => {
					lastChildrenDragOverEvent = event;
					updateChildrenDragOverRow(event);
				};
				const handleChildrenNativeDragLeave = (event: DragEvent) => {
					if (!childrenDropZone.contains(event.relatedTarget as Node | null)) {
						dragOverChildRowId.value = '';
					}
				};

				childrenDropZone.addEventListener('dragover', handleChildrenNativeDragOver);
				childrenDropZone.addEventListener('drop', handleChildrenNativeDrop);
				childrenDropZone.addEventListener('dragleave', handleChildrenNativeDragLeave);

				DataDragAndDrop.droppable(childrenDropZone, {
					drop: async (data: string) => {
						await handleChildrenDrop(data, childrenDropZone);
					},
					enter: () => {
						console.log('[PartDetailView] 拖拽进入表格');
						childrenDropZone.classList.add('drag-over');
					},
					over: () => {},
					leave: () => {
						console.log('[PartDetailView] 拖拽离开表格');
						dragOverChildRowId.value = '';
						childrenDropZone.classList.remove('drag-over');
					}
				});

				childrenDropZoneCleanup = () => {
					childrenDropZone.removeEventListener('dragover', handleChildrenNativeDragOver);
					childrenDropZone.removeEventListener('drop', handleChildrenNativeDrop);
					childrenDropZone.removeEventListener('dragleave', handleChildrenNativeDragLeave);
					DataDragAndDrop.unbind(childrenDropZone);
				};
			}
		});
	}
};
watch(
	() => dialogStore.lastCreatedVersion,
	async () => {
		if (!dialogStore.lastCreatedInfo) return;
		await refreshAfterTableCreate();

		// 如果存在待关联的材料数量信息，调用关联接口
		if (pendingMaterialQuantity.value && dialogStore.lastCreatedInfo.physicalid) {
			try {
				const { materialPhysicalId, quantityName, value, unit } = pendingMaterialQuantity.value;
				await partDetailApi.createContinousMaterialItemReference([
					{
						materialref: { physicalid: materialPhysicalId },
						quantity: { name: quantityName, value, unit },
						reference: { physicalid: dialogStore.lastCreatedInfo.physicalid }
					}
				]);
				ElMessage.success('材料关联成功');
			} catch (error) {
				console.error('[PartDetailView] 关联材料失败:', error);
				ElMessage.error('关联材料失败');
			} finally {
				pendingMaterialQuantity.value = null;
			}
		}
	}
);

watch(
	() => route.params.physicalId,
	physicalId => {
		const nextPhysicalId = physicalId as string;
		if (!nextPhysicalId || nextPhysicalId === currentPhysicalId.value) return;
		if (route.query.from === 'create') {
			queryModeStore.switchToDbMode();
		}
		loadPartDetail(nextPhysicalId);
	}
);

// 页面加载
onMounted(() => {
	// 从路由参数获取 physicalId
	const physicalId = route.params.physicalId as string;
	console.log('[PartDetailView] 路由参数 physicalId:', physicalId);

	// 如果是从创建页面跳转，自动切换到数据库模式
	if (route.query.from === 'create') {
		console.log('[PartDetailView] 检测到 from=create，自动切换到数据库模式');
		queryModeStore.switchToDbMode();
	}

	if (physicalId) {
		loadPartDetail(physicalId);
	}

	// 初始化拖拽功能
	initDragAndDrop();
});

// 页面卸载
onUnmounted(() => {
	handleDeformDialogResizeEnd();
	if (dropZoneCleanup) {
		dropZoneCleanup();
	}
	if (childrenDropZoneCleanup) {
		childrenDropZoneCleanup();
	}
});
</script>

<style lang="scss" scoped>
.part-detail-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f7fa;

	// 右上角控制区：模式切换 + 折叠箭头
	.top-right-controls {
		position: absolute;
		top: 2px;
		right: 8px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 6px;

		.panel-toggle {
			width: 24px;
			height: 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
		}

		.mode-switch-container {
			display: flex;
			align-items: center;

			.mode-icon-btn {
				font-size: 14px;
				color: #777;
				background-color: transparent;
				border-color: transparent;
				padding: 4px;

				&:hover {
					background-color: #f0f0f0;
				}
			}
		}

		.detail-placeholder-btn {
			display: flex;
			align-items: center;

			.info-icon-btn {
				font-size: 14px;
				color: #777;
				background-color: transparent;
				border-color: transparent;
				padding: 4px;

				&:hover {
					color: #409eff;
					background-color: #ecf5ff;
					border-color: #d9ecff;
				}
			}
		}
	}

	.triangle-up {
		width: 0;
		height: 0;
		border-left: 9px solid transparent;
		border-right: 9px solid transparent;
		border-bottom: 14px solid #6b7280;
	}

	.triangle-down {
		width: 0;
		height: 0;
		border-left: 9px solid transparent;
		border-right: 9px solid transparent;
		border-top: 14px solid #6b7280;
	}

	.part-info-panel {
		flex: 0 0 auto;
		display: flex;
		position: relative;
		padding: 0 16px 6px;
		background-color: #fff;
		margin: 0 16px 0;
		border-radius: 8px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		transition: all 0.3s;

		&.drag-over {
			background-color: #ecf5ff;
			border: 2px dashed #409eff;
		}

		// 信息区域容器（占70%）
		.info-container {
			display: flex;
			gap: 20px;
			flex: 1 1 auto;
			min-width: 0;
			padding-right: 96px;
			flex-wrap: nowrap;
			align-content: flex-start;
			align-items: flex-start;
			padding-top: 0;

			.part-column {
				display: flex;
				flex-direction: column;
				min-width: 0;
			}

			.first-column {
				flex: 0 0 150px;
				flex-shrink: 0;
				align-items: center;
				flex-direction: row;
				gap: 8px;

				.back-icon {
					font-size: 22px;
					color: #c0c4cc;
					cursor: pointer;
					flex-shrink: 0;

					&:hover {
						color: #409eff;
					}
				}

				.thumbnail-container {
					width: 96px;
					height: 76px;
					background-color: #f5f7fa;
					border-radius: 8px;
					overflow: hidden;
					display: flex;
					align-items: center;
					justify-content: center;

					img {
						width: 100%;
						height: 100%;
						object-fit: contain;
					}
				}
			}

			.second-column {
				flex: 1 1 220px;
				gap: 4px;
				min-width: 0;

				.title-row {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 6px;

					.title-text {
						font-size: 16px;
						font-weight: bold;
						color: #303133;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.revision-text {
						font-size: 14px;
						color: #409eff;
						font-weight: 500;
					}
				}

				.info-row {
					display: flex;
					align-items: center;
					gap: 8px;
					height: 22px;

					.info-label {
						color: #909399;
						font-size: 13px;
						min-width: 90px;
						flex-shrink: 0;
					}

					.info-value {
						color: #303133;
						font-size: 13px;
						font-weight: 500;
						min-width: 0;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.dropdown-icon {
						color: #909399;
						font-size: 12px;
						cursor: pointer;
					}
				}
			}

			.third-column {
				flex: 1 1 170px;
				gap: 4px;
				padding-top: 24px;
				min-width: 0;

				.info-row {
					display: flex;
					align-items: center;
					gap: 8px;
					height: 22px;

					.info-label {
						color: #909399;
						font-size: 13px;
						min-width: 60px;
						flex-shrink: 0;
					}

					.info-value {
						color: #303133;
						font-size: 13px;
						font-weight: 500;
						min-width: 0;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
			}

			.fourth-column {
				flex: 1 1 180px;
				min-width: 0;
				padding-left: 16px;
				border-left: 1px solid #e4e7ed;

				.description-label {
					color: #909399;
					font-size: 13px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}

		// 预留区域（占30%）
		.reserved-area {
			flex: 0 0 0;
			width: 0;
			display: flex;
			justify-content: flex-end;
			align-items: flex-start;

			.collapse-controls {
				display: flex;
				gap: 8px;
			}
		}

		.summary-bar {
			display: flex;
			align-items: center;
			gap: 12px;
			font-size: 13px;
			color: #303133;
		}

		.summary-title {
			font-weight: 600;
		}

		@media (max-width: 1200px) {
			flex-basis: auto;
			min-height: 116px;

			.info-container {
				flex-wrap: nowrap;
				gap: 12px;
				padding-right: 88px;
			}

			.info-container .first-column {
				flex-basis: 116px;

				.thumbnail-container {
					width: 84px;
					height: 72px;
				}
			}

			.info-container .second-column {
				flex: 1 1 auto;
				min-width: 0;
			}

			.info-container .third-column,
			.info-container .fourth-column,
			.reserved-area {
				display: none;
			}
		}

		@media (max-width: 640px) {
			padding: 10px 12px;

			.info-container {
				padding-right: 76px;
			}

			.info-container .first-column {
				flex-basis: 96px;
				gap: 6px;

				.thumbnail-container {
					width: 68px;
					height: 60px;
				}
			}

			.info-container .second-column .info-label {
				min-width: 76px;
			}
		}

		.summary-revision {
			color: #409eff;
		}

		&.collapsed {
			flex: 0 0 auto;
			padding: 8px 16px;
		}
	}

	.children-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		margin: 0 16px 16px;
		padding: 16px;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		overflow: hidden;

		&.drag-over {
			background-color: #ecf5ff;
			border: 2px dashed #409eff;
		}

		.section-header {
			flex: 0 0 auto;
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16px;

			.header-left {
				display: flex;
				align-items: center;
				gap: 8px;

				.section-title {
					font-size: 14px;
					font-weight: 600;
					color: #303133;
				}

				.data-count {
					font-size: 13px;
					color: #909399;
				}
			}

			.toolbar {
				display: flex;
				align-items: center;
				gap: 8px;

				.toolbar-create-trigger {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 24px;
					height: 24px;
					color: #6b7785;
					font-size: 23px;
					font-weight: 700;
					line-height: 24px;
					cursor: pointer;
					outline: none;
				}

				.toolbar-create-trigger:hover {
					color: #3d4752;
				}

				.toolbar-create-trigger.is-disabled {
					color: #c0c4cc;
					cursor: not-allowed;
					pointer-events: none;
				}
			}
		}

		.children-table {
			flex: 1;
			min-height: 0;

			:deep(.el-table__inner-wrapper) {
				height: 100%;
			}

			// 禁用展开动画，防止table抖动
			:deep(.el-table__body-wrapper) {
				transition: none !important;
			}

			:deep(.el-table__expand-icon) {
				transition: none !important;
			}

			:deep(.el-table__row) {
				transition: none !important;
			}

			:deep(.selected-child-row > td.el-table__cell) {
				background-color: #d9ecff !important;
			}

			:deep(.selected-child-row.current-row > td.el-table__cell),
			:deep(.selected-child-row:hover > td.el-table__cell) {
				background-color: #d9ecff !important;
			}

			:deep(.el-table__body td.el-table__cell:hover) {
				background-color: #e9edf3 !important;
				box-shadow: inset 0 0 0 1px #c0c4cc;
			}

			:deep(.hovered-child-header-cell) {
				background-color: #e9edf3 !important;
				box-shadow: inset 0 0 0 1px #c0c4cc;
			}

			&.children-table-v2 {
				:deep(.el-table-v2__row) {
					transition: none !important;
				}

				:deep(.el-table-v2__row.dragging-child-row) {
					opacity: 0.6;
				}

				:deep(.el-table-v2__row.even-child-row .el-table-v2__row-cell) {
					background-color: #f6f7f9;
				}

				:deep(.el-table-v2__row-cell) {
					font-weight: 400 !important;
				}

				:deep(.el-table-v2__row.selected-child-row .el-table-v2__row-cell) {
					background-color: #d9ecff !important;
				}

				:deep(.el-table-v2__row.drag-over-child-row .el-table-v2__row-cell) {
					background-color: #ecf5ff !important;
					box-shadow: inset 0 0 0 1px #409eff;
				}

				:deep(.el-table-v2__row:hover .el-table-v2__row-cell) {
					background-color: #e9edf3 !important;
				}

				:deep(.el-table-v2__row-cell:hover) {
					background-color: #e9edf3 !important;
					box-shadow: inset 0 0 0 1px #c0c4cc;
				}

				:deep(.el-table-v2__header-cell:hover) {
					background-color: #e9edf3 !important;
					box-shadow: inset 0 0 0 1px #c0c4cc;
				}

				:deep(.el-table-v2__header-cell) {
					background-color: #f2f3f5 !important;
					color: #303133;
					font-weight: 600;
				}

				:deep(.resizable-header-cell) {
					position: relative;
					display: flex;
					align-items: center;
					width: 100%;
					height: 100%;
					padding-right: 8px;
				}

				:deep(.resizable-header-title) {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				:deep(.selection-header-cell) {
					justify-content: center;
					padding-right: 0;
					background-color: #f2f3f5;
				}

				:deep(.selection-column-header),
				:deep(.selection-column-cell) {
					padding: 0 !important;
					background-color: #f2f3f5 !important;
				}

				:deep(.selection-column-header > *),
				:deep(.selection-column-cell > *) {
					width: 100%;
					height: 100%;
				}

				:deep(.el-table-v2__header-cell:first-child),
				:deep(.el-table-v2__row-cell:first-child) {
					padding: 0 !important;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #f2f3f5 !important;
				}

				:deep(.selection-cell) {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100%;
					height: 100%;
					background-color: #f2f3f5;
				}

				:deep(.selection-header-cell .el-checkbox),
				:deep(.selection-cell .el-checkbox) {
					height: 100%;
					margin-right: 0;
					display: inline-flex;
					align-items: center;
				}

				:deep(.column-resize-handle) {
					position: absolute;
					top: 0;
					right: -6px;
					z-index: 2;
					width: 12px;
					height: 100%;
					cursor: col-resize;
				}
			}
		}

		.name-cell {
			display: flex;
			align-items: center;
			height: 30px;
			line-height: 30px;
			white-space: nowrap;

			.row-icon {
				width: 16px;
				height: 16px;
				object-fit: contain;
				flex-shrink: 0;
				margin-left: 0.5em;
				vertical-align: middle;
			}

			.name-text {
				display: inline-flex;
				align-items: center;
				height: 30px;
				margin-left: 1em;
			}
		}

		.status-tag {
			cursor: pointer;
		}

		// 自定义展开图标
		.custom-tree-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 16px;
			height: 16px;
			cursor: pointer;
			border: 1px solid #909399;
			border-radius: 2px;
			background-color: #fff;
			flex-shrink: 0;
			box-sizing: border-box;
			vertical-align: middle;
			color: #303133;
			font-size: 14px;
			font-weight: 600;
			line-height: 14px;

			&:hover {
				background-color: #f5f7fa;
				border-color: #409eff;
				color: #409eff;
			}

			&.is-loading {
				color: #909399;
				cursor: default;
			}

			.expand-loading-icon {
				animation: rotating 2s linear infinite;
				font-size: 12px;
			}
		}

		// 占位符（没有子节点时）
		.tree-icon-placeholder {
			display: inline-block;
			width: 16px;
			height: 16px;
			flex-shrink: 0;
		}
	}

	.enterprise-code-link {
		color: #409eff;
		cursor: pointer;
		font-size: 13px;

		&:hover {
			color: #66b1ff;
			text-decoration: underline;
		}
	}
}

:deep(.enterprise-code-dialog) {
	.el-dialog__body {
		padding-top: 8px;
	}
}

:deep(.maturity-dialog) {
	.el-dialog__header {
		padding: 12px 16px;
		margin-right: 0;
		border-bottom: 1px solid #dcdfe6;
	}

	.el-dialog__title {
		font-size: 18px;
		font-weight: 700;
		color: #303133;
	}

	.el-dialog__body {
		padding: 0;
	}

	.el-dialog__footer {
		padding: 16px;
		background-color: #f5f5f5;
		border-top: 1px solid #dcdfe6;
	}
}

:deep(.duplicate-dialog) {
	.el-dialog__header {
		padding: 14px 16px 8px;
		margin-right: 0;
		border-bottom: 1px solid #dcdfe6;
	}

	.el-dialog__title {
		font-size: 18px;
		font-weight: 700;
		color: #303133;
	}

	.el-dialog__body {
		height: 160px;
		padding: 12px 16px;
	}

	.el-dialog__footer {
		padding: 16px;
		background-color: #f2f3f5;
		border-top: 1px solid #dcdfe6;
	}
}

.duplicate-form {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.duplicate-form-row {
	display: flex;
	align-items: center;
	gap: 14px;
}

.duplicate-form-label {
	width: 218px;
	color: #606266;
	font-weight: 600;
}

.duplicate-prefix-input {
	width: 170px;
}

.duplicate-security-select {
	width: 440px;
}

:deep(.deform-dialog) {
	position: relative;
	overflow: auto;
	min-width: 480px;
	min-height: 300px;
	margin: 0;

	&::after {
		content: '';
		position: absolute;
		bottom: 2px;
		right: 2px;
		width: 12px;
		height: 12px;
		background:
			linear-gradient(135deg, transparent 45%, #909399 45%, #909399 55%, transparent 55%),
			linear-gradient(135deg, transparent 35%, #909399 35%, #909399 45%, transparent 45%),
			linear-gradient(135deg, transparent 25%, #909399 25%, #909399 35%, transparent 35%);
		pointer-events: none;
		z-index: 10;
	}

	.el-dialog__header {
		padding: 14px 16px 8px;
		margin-right: 0;
		border-bottom: 1px solid #dcdfe6;
		cursor: move;
	}

	.el-dialog__title {
		font-size: 18px;
		font-weight: 700;
		color: #303133;
	}

	.el-dialog__body {
		padding: 12px 16px;
		overflow: auto;
	}

	.el-dialog__footer {
		padding: 16px;
		background-color: #f2f3f5;
		border-top: 1px solid #dcdfe6;
	}
}

.deform-dialog-resize-handle {
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 16px;
	height: 16px;
	cursor: nwse-resize;
	z-index: 11;
}

:global(.deform-dialog-resizing) {
	cursor: nwse-resize;
	user-select: none;
}

.deform-form-row {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-top: 12px;
}

.deform-form-label {
	width: 80px;
	color: #606266;
	font-weight: 600;
}

.deform-prefix-input {
	width: 170px;
}

.maturity-content {
	min-height: 176px;
	padding: 18px 22px 28px;
	overflow-x: auto;
	overflow-y: hidden;
	background-color: #f5f5f5;
}

.maturity-graph {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	min-width: max-content;
	min-height: 118px;
	margin-bottom: 16px;
	margin-left: auto;
	margin-right: auto;
}

.state-wrap {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.state-box {
	width: 102px;
	height: 44px;
	padding: 0 12px;
	color: #fff;
	font-size: 14px;
	font-weight: 700;
	border: 1px solid transparent;
	border-radius: 4px;
	cursor: default;
	opacity: 1;
}

.state-box.active {
	color: #fff;
	border: 2px solid #111;
	opacity: 1;
}

.state-box.clickable {
	cursor: pointer;
}

.state-connector {
	width: 34px;
	height: 2px;
	background-color: #999;
	position: relative;
}

.state-connector::after {
	content: '';
	position: absolute;
	right: -1px;
	top: -5px;
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
	border-left: 8px solid #999;
}

.transition-action {
	position: absolute;
	top: -34px;
	left: 100%;
	transform: translateX(-50%);
	display: flex;
	align-items: center;
	gap: 4px;
	color: #008bb8;
	font-size: 13px;
	background: transparent;
	border: 0;
	cursor: pointer;
	white-space: nowrap;
}

.action-arrow {
	width: 0;
	height: 0;
	border-top: 8px solid transparent;
	border-bottom: 8px solid transparent;
	border-left: 14px solid #008b2f;
}

.reverse-route-action {
	position: absolute;
	top: 94px;
	left: var(--reverse-route-left);
	width: var(--reverse-route-width);
	height: 32px;
	color: #008bb8;
	font-size: 13px;
	background: transparent;
	border: 0;
	cursor: pointer;
	z-index: 2;
}

.reverse-route-line {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 16px;
	border-right: 2px solid #777;
	border-bottom: 2px solid #777;
	border-left: 2px solid #777;
	pointer-events: none;
}

.reverse-route-line::after {
	content: '';
	position: absolute;
	right: -2px;
	top: -8px;
	width: 2px;
	height: 8px;
	background-color: #777;
}

.reverse-route-up-arrow {
	position: absolute;
	left: -5px;
	top: -8px;
	width: 0;
	height: 0;
	border-right: 6px solid transparent;
	border-bottom: 12px solid #777;
	border-left: 6px solid transparent;
}

.reverse-route-arrow {
	position: absolute;
	left: calc(50% + 54px);
	top: 18px;
	width: 0;
	height: 0;
	border-top: 8px solid transparent;
	border-right: 14px solid #008bb8;
	border-bottom: 8px solid transparent;
}

.reverse-route-label {
	position: absolute;
	left: 50%;
	top: 17px;
	transform: translateX(-50%);
	white-space: nowrap;
}

/* 非 scoped 全局样式 - 隐藏默认展开图标 */
:deep(.el-table__expand-icon) {
	display: none !important;
}
:deep(.el-table__indent) {
	display: none !important;
}
:deep(.el-table__placeholder) {
	display: none !important;
}
</style>

<!-- 全局样式：children-table-v2虚拟表格样式修正 -->
<style>
#partDetailContainer .children-table-v2 .el-table-v2__row,
#partDetailContainer .children-table-v2 .el-table-v2__row-cell {
	height: 30px !important;
}
#partDetailContainer .children-table-v2 .el-table-v2__row {
	cursor: default;
}
#partDetailContainer .children-table-v2 .el-table-v2__row.dragging-child-row {
	opacity: 0.6;
	cursor: default;
}
#partDetailContainer .children-table-v2 .el-table-v2__row.even-child-row .el-table-v2__row-cell {
	background-color: #f6f7f9;
}
.child-row-drag-image {
	position: fixed;
	top: -1000px;
	left: -1000px;
	z-index: 9999;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 260px;
	height: 28px;
	padding: 0 10px 0 6px;
	border: 1px solid #c0c4cc;
	border-radius: 4px;
	background: #fff;
	box-shadow: 0 2px 8px rgb(0 0 0 / 16%);
	color: #303133;
	font-size: 12px;
	line-height: 28px;
	pointer-events: none;
}
.child-row-drag-add {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	border: 1px solid #67c23a;
	border-radius: 2px;
	box-sizing: border-box;
	color: #67c23a;
	font-size: 14px;
	font-weight: 600;
	line-height: 14px;
}
.child-row-drag-title {
	overflow: hidden;
	max-width: 210px;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.children-create-dropdown.el-popper {
	min-width: 132px !important;
	padding: 0 !important;
	border: 1px solid #d7dce2 !important;
	border-radius: 0 !important;
	box-shadow: 0 1px 3px rgb(0 0 0 / 18%) !important;
}
.children-create-dropdown .el-popper__arrow {
	display: none !important;
}
.children-create-dropdown .create-menu-panel {
	width: 132px;
	padding: 0;
	background: #fff;
	color: #1f2d3d;
	font-size: 12px;
	line-height: 1;
}
.children-create-dropdown .create-menu-section-title {
	height: 20px;
	padding: 5px 8px 2px;
	box-sizing: border-box;
	color: #222;
	font-size: 12px;
	font-weight: 700;
	line-height: 13px;
}
.children-create-dropdown .el-dropdown-menu {
	padding: 0 !important;
	border: 0 !important;
	box-shadow: none !important;
}
.children-create-dropdown .el-dropdown-menu__item {
	display: flex !important;
	align-items: center !important;
	gap: 8px !important;
	height: 24px !important;
	padding: 0 8px 0 16px !important;
	color: #1f2d3d !important;
	font-size: 12px !important;
	line-height: 24px !important;
	white-space: nowrap !important;
}
.children-create-dropdown .el-dropdown-menu__item:not(.is-disabled):focus,
.children-create-dropdown .el-dropdown-menu__item:not(.is-disabled):hover {
	background-color: #ececec !important;
	color: #1f2d3d !important;
}
.children-create-dropdown .create-menu-icon {
	position: relative;
	display: inline-block;
	flex: 0 0 auto;
	width: 13px;
	height: 13px;
	color: #687887;
}
.children-create-dropdown .create-menu-icon::before,
.children-create-dropdown .create-menu-icon::after {
	content: '';
	position: absolute;
	box-sizing: border-box;
}
.children-create-dropdown .create-menu-icon::before {
	left: 2px;
	top: 3px;
	width: 8px;
	height: 7px;
	border: 1px solid currentColor;
	background: #fff;
}
.children-create-dropdown .create-menu-icon::after {
	right: 0;
	bottom: 1px;
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: currentColor;
	box-shadow:
		-2px -2px 0 #fff,
		-2px -2px 0 1px currentColor;
}
.children-create-dropdown .product-new-icon::before,
.children-create-dropdown .part-new-icon::before {
	border-radius: 1px;
}
.children-create-dropdown .product-existing-icon::before,
.children-create-dropdown .material-existing-icon::before,
.children-create-dropdown .existing-document-icon::before,
.children-create-dropdown .drawing-existing-icon::before {
	border-radius: 1px;
	box-shadow:
		2px 2px 0 -1px #fff,
		2px 2px 0 0 currentColor;
}
.children-create-dropdown .insert-duplicate-icon::before {
	border-radius: 50%;
}
.children-create-dropdown .insert-duplicate-icon::after {
	border-radius: 0;
}
.children-create-dropdown .shape-new-icon::before {
	width: 9px;
	height: 9px;
	border-radius: 50%;
	border-top-color: transparent;
}
.children-create-dropdown .shape-new-icon::after {
	left: 1px;
	top: 7px;
	width: 11px;
	height: 1px;
	border-radius: 0;
	background: currentColor;
	box-shadow: none;
	transform: rotate(-12deg);
}
.children-create-dropdown .material-quantity-icon::before {
	width: 9px;
	height: 9px;
	border-radius: 50%;
}
.children-create-dropdown .upload-document-icon::before,
.children-create-dropdown .existing-document-icon::before {
	left: 3px;
	top: 1px;
	width: 8px;
	height: 10px;
}
.children-create-dropdown .upload-document-icon::after {
	left: 5px;
	top: 3px;
	width: 5px;
	height: 5px;
	border-right: 1px solid currentColor;
	border-bottom: 1px solid currentColor;
	border-radius: 0;
	background: transparent;
	box-shadow: none;
	transform: rotate(-135deg);
}
.children-create-dropdown .drawing-new-icon::before,
.children-create-dropdown .drawing-existing-icon::before {
	left: 1px;
	top: 2px;
	width: 11px;
	height: 8px;
}
.children-create-dropdown .drawing-new-icon::after,
.children-create-dropdown .drawing-existing-icon::after {
	left: 3px;
	top: 5px;
	width: 7px;
	height: 1px;
	border-radius: 0;
	background: currentColor;
	box-shadow: 0 3px 0 currentColor;
}
#partDetailContainer .children-table-v2 .el-table-v2__row-cell,
#partDetailContainer .children-table-v2 .el-table-v2__header-cell {
	padding: 0 6px !important;
	line-height: 30px !important;
	font-size: 12px !important;
	font-weight: 400 !important;
	border-right: 1px solid #e4e7ed;
}
#partDetailContainer .children-table-v2 .el-table-v2__header-cell:last-child,
#partDetailContainer .children-table-v2 .el-table-v2__row-cell:last-child {
	border-right: none;
}
#partDetailContainer .children-table-v2 .enterprise-code-link {
	color: #409eff !important;
	cursor: pointer;
	font-weight: 400 !important;
}
#partDetailContainer .children-table-v2 .enterprise-code-link:hover {
	color: #66b1ff !important;
	text-decoration: underline;
}
#partDetailContainer .children-table-v2 .el-table-v2__row.selected-child-row .el-table-v2__row-cell {
	background-color: #d9ecff !important;
}
#partDetailContainer .children-table-v2 .el-table-v2__row.drag-over-child-row .el-table-v2__row-cell {
	background-color: #ecf5ff !important;
	box-shadow: inset 0 0 0 1px #409eff;
}
#partDetailContainer .children-table-v2 .el-table-v2__row:hover .el-table-v2__row-cell {
	background-color: #e9edf3 !important;
}
#partDetailContainer .children-table-v2 .el-table-v2__row-cell:hover,
#partDetailContainer .children-table-v2 .el-table-v2__header-cell:hover {
	background-color: #e9edf3 !important;
	box-shadow: inset 0 0 0 1px #c0c4cc;
}
#partDetailContainer .children-table-v2 .resizable-header-cell {
	position: relative;
	display: flex;
	align-items: center;
	width: 100%;
	height: 100%;
	padding-right: 8px;
}
#partDetailContainer .children-table-v2 .resizable-header-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
#partDetailContainer .children-table-v2 .selection-header-cell {
	justify-content: center;
}
#partDetailContainer .children-table-v2 .column-resize-handle {
	position: absolute;
	top: 0;
	right: -6px;
	z-index: 2;
	width: 12px;
	height: 100%;
	cursor: col-resize;
}
body.is-resizing-column {
	cursor: col-resize !important;
	user-select: none;
}
#partDetailContainer .children-table-v2 .name-cell {
	display: flex;
	align-items: center;
	min-height: 30px;
	height: 30px;
	line-height: 30px;
	font-size: 12px;
	white-space: nowrap;
}
#partDetailContainer .children-table-v2 .name-cell .row-icon {
	width: 20px;
	height: 20px;
	flex-shrink: 0;
	margin-left: 0.5em;
	vertical-align: middle;
}
#partDetailContainer .children-table-v2 .name-cell .name-text {
	display: inline-flex;
	align-items: center;
	height: 30px;
	margin-left: 1em;
}
#partDetailContainer .children-table-v2 .name-cell .custom-tree-icon,
#partDetailContainer .children-table-v2 .name-cell .tree-icon-placeholder {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}
#partDetailContainer .children-table-v2 .name-cell .custom-tree-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #909399;
	border-radius: 2px;
	color: #303133;
	font-size: 14px;
	font-weight: 600;
	line-height: 14px;
	box-sizing: border-box;
}
#partDetailContainer .children-table-v2 .name-cell .custom-tree-icon.is-loading {
	color: #909399;
	cursor: default;
}
#partDetailContainer .children-table-v2 .name-cell .custom-tree-icon .expand-loading-icon {
	animation: rotating 2s linear infinite;
	font-size: 12px;
}
@keyframes rotating {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

// 展开菜单按钮样式
.expand-menu-btn.is-active {
	color: #409eff !important;
	border-color: #409eff !important;
}

// 展开菜单下拉框样式
.expand-menu-dropdown {
	.el-dropdown-menu__item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 16px;
		font-size: 13px;

		.el-icon {
			font-size: 14px;
		}

		.expand-menu-icon {
			width: 16px;
			height: 16px;
			color: #606266;
			flex-shrink: 0;
		}
	}
}

// 展开 N 层对话框样式
.expand-n-content {
	padding: 10px 0;
}

// 导出进度对话框样式
.export-progress-content {
	padding: 20px 10px;
	.export-status-text {
		margin-top: 16px;
		text-align: center;
		color: #606266;
		font-size: 14px;
	}
}
</style>
