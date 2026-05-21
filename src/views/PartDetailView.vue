<template>
	<div
		id="partDetailContainer"
		v-loading="updateEntireStructureRevisionLoading"
		class="part-detail-container"
		element-loading-text="正在获取更新整个结构的修订版操作...">
		<!-- 零件详细信息区域（整个区域支持拖拽） -->
		<div
			id="dropZone"
			:class="['part-info-panel', { collapsed: !showHeader }]">
			<!-- 右上角控制区：模式切换 + 折叠箭头 -->
			<div class="top-right-controls">
				<div class="mode-switch-container">
					<el-dropdown
						popper-class="part-action-dropdown-popper"
						trigger="click"
						@command="handleHeaderActionCommand">
						<el-button
							:size="'small'"
							circle
							class="header-action-dropdown-btn"
							title="更多操作">
							<el-icon><ArrowDown /></el-icon>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu class="part-action-dropdown-menu">
								<div
									class="part-action-open-with-submenu"
									@mouseenter="headerOpenWithSubmenuVisible = true"
									@mouseleave="headerOpenWithSubmenuVisible = false">
									<div class="part-action-open-with-trigger">
										<span class="part-action-menu-icon">↪</span>
										<span class="part-action-menu-label">打开方式</span>
										<el-icon class="part-action-menu-arrow"><ArrowRight /></el-icon>
									</div>
									<div
										v-show="headerOpenWithSubmenuVisible"
										class="part-action-open-with-panel">
										<div
											class="part-action-open-with-item"
											@click="handleRootOpenWith('3D Markup')">
											<span class="part-action-menu-icon">✎</span>
											<span>3D Markup</span>
										</div>
										<div
											class="part-action-open-with-item"
											@click="handleRootOpenWith('3D Navigate')">
											<span class="part-action-menu-icon">🧭</span>
											<span>3D Navigate</span>
										</div>
										<div
											class="part-action-open-with-item"
											@click="handleRootOpenWith('3DPlay')">
											<span class="part-action-menu-icon">▶</span>
											<span>3DPlay</span>
										</div>
										<div
											class="part-action-open-with-item part-action-open-with-item-divided"
											@click="handleRootOpenWith('more')">
											<span class="part-action-menu-icon">＋</span>
											<span>更多应用程序</span>
										</div>
									</div>
								</div>
								<el-dropdown-item command="setEnterpriseNumber">
									<span class="part-action-menu-icon">▦</span>
									<span class="part-action-menu-label">设置企业项目编号</span>
								</el-dropdown-item>
								<el-dropdown-item command="delete">
									<span class="part-action-menu-icon">⌫</span>
									<span class="part-action-menu-label">删除</span>
								</el-dropdown-item>
								<el-dropdown-item command="manageBrowsingStructure">
									<span class="part-action-menu-icon">⌘</span>
									<span class="part-action-menu-label">管理浏览结构定义</span>
									<el-icon class="part-action-menu-arrow"><ArrowRight /></el-icon>
								</el-dropdown-item>
								<el-dropdown-item
									command="revision"
									divided>
									<span class="part-action-menu-icon">☷</span>
									<span class="part-action-menu-label">修订版</span>
								</el-dropdown-item>
								<el-dropdown-item command="newRevision">
									<span class="part-action-menu-icon">↳</span>
									<span class="part-action-menu-label">新修订版</span>
								</el-dropdown-item>
								<el-dropdown-item command="newBranch">
									<span class="part-action-menu-icon">⌘</span>
									<span class="part-action-menu-label">新建分支</span>
								</el-dropdown-item>
								<el-dropdown-item command="newRevisionSource">
									<span class="part-action-menu-icon">⌁</span>
									<span class="part-action-menu-label">新修订版源</span>
								</el-dropdown-item>
								<el-dropdown-item command="updateRevision">
									<span class="part-action-menu-icon">↯</span>
									<span class="part-action-menu-label">更新修订版</span>
								</el-dropdown-item>
								<el-dropdown-item command="updateRevisionAll">
									<span class="part-action-menu-icon">▥</span>
									<span class="part-action-menu-label">更新整个结构的修订版</span>
								</el-dropdown-item>
								<el-dropdown-item command="copy">
									<span class="part-action-menu-icon">⧉</span>
									<span class="part-action-menu-label">复制</span>
								</el-dropdown-item>
								<el-dropdown-item command="compare">
									<span class="part-action-menu-icon">↔</span>
									<span class="part-action-menu-label">比较</span>
								</el-dropdown-item>
								<el-dropdown-item command="maturity">
									<span class="part-action-menu-icon">♻</span>
									<span class="part-action-menu-label">成熟度</span>
								</el-dropdown-item>
								<el-dropdown-item
									command="lock"
									divided>
									<span class="part-action-menu-icon">🔒</span>
									<span class="part-action-menu-label">锁定</span>
								</el-dropdown-item>
								<el-dropdown-item command="unlock">
									<span class="part-action-menu-icon">🔓</span>
									<span class="part-action-menu-label">解锁</span>
								</el-dropdown-item>
								<el-dropdown-item command="move">
									<span class="part-action-menu-icon">⇥</span>
									<span class="part-action-menu-label">移动</span>
								</el-dropdown-item>
								<el-dropdown-item command="share">
									<span class="part-action-menu-icon">↗</span>
									<span class="part-action-menu-label">共享</span>
								</el-dropdown-item>
								<el-dropdown-item
									command="relationship"
									divided>
									<span class="part-action-menu-icon">⚭</span>
									<span class="part-action-menu-label">关系</span>
								</el-dropdown-item>
								<el-dropdown-item command="relatedChange">
									<span class="part-action-menu-icon">▤</span>
									<span class="part-action-menu-label">相关更改</span>
								</el-dropdown-item>
								<el-dropdown-item command="subscribe">
									<span class="part-action-menu-icon">☁</span>
									<span class="part-action-menu-label">订阅</span>
									<el-icon class="part-action-menu-arrow"><ArrowRight /></el-icon>
								</el-dropdown-item>
								<el-dropdown-item command="exportMenu">
									<span class="part-action-menu-icon">⇲</span>
									<span class="part-action-menu-label">导出菜单</span>
									<el-icon class="part-action-menu-arrow"><ArrowRight /></el-icon>
								</el-dropdown-item>
								<el-dropdown-item command="customTitle">
									<span class="part-action-menu-icon">⚙</span>
									<span class="part-action-menu-label">自定义标题</span>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
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
				<el-icon
					class="summary-home-icon"
					title="主页"
					@click="handleBack">
					<HomeFilled />
				</el-icon>
				<el-icon
					v-if="partDetailNavigationStack.length"
					class="summary-previous-icon"
					title="返回上一个零件"
					@click="handlePartDetailPrevious">
					<Back />
				</el-icon>
				<img
					class="summary-thumbnail"
					:src="partInfo?.['preview_url'] || partInfo?.['thumbnail_2d'] || defaultThumbnail"
					alt="零件缩略图" />
				<div class="summary-main">
					<span class="summary-title">{{ partInfo?.['ds6w:label'] || '-' }}</span>
					<span class="summary-revision">{{ partInfo?.['ds6wg:revision'] || '' }}</span>
				</div>
				<div class="summary-field">
					<span class="summary-label">企业项目编号：</span>
					<span
						class="enterprise-code-link"
						@click="openEnterpriseCodeDialogForParent">
						{{ getParentEnterpriseCode() }}
					</span>
				</div>
				<div class="summary-field">
					<span class="summary-label">成熟度状态：</span>
					<el-tag
						:type="getStatusType(partInfo?.['ds6w:status'])"
						size="small"
						class="status-tag"
						@click="openMaturityDialogForParent">
						{{ formatStatus(partInfo?.['ds6w:status']) }}
					</el-tag>
					<el-icon class="summary-dropdown-icon"><ArrowDown /></el-icon>
				</div>
				<div class="summary-field">
					<span class="summary-label">所有者：</span>
					<span class="summary-value">{{ partInfo?.['owner'] || '-' }}</span>
				</div>
				<div class="summary-field">
					<span class="summary-label">修改日期：</span>
					<span class="summary-value">{{ formatDateTime(partInfo?.['ds6w:modified']) }}</span>
				</div>
				<div class="summary-field">
					<span class="summary-label">类型：</span>
					<span class="summary-value">{{ partInfo?.['ds6w:type'] || '-' }}</span>
				</div>
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
					<el-icon
						v-if="partDetailNavigationStack.length"
						class="previous-part-icon"
						title="返回上一个零件"
						@click="handlePartDetailPrevious">
						<Back />
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
					<span class="data-count">({{ flattenChildrenData.length }})</span>
				</div>
				<div class="toolbar">
					<div
						class="selected-actions-wrap"
						:class="{ 'is-visible': selectedChildrenRows.length && !isFlatStructureView }">
						<el-dropdown
							trigger="click"
							:hide-on-click="false"
							popper-class="selected-actions-dropdown"
							@command="handleSelectedActionCommand">
							<span class="selected-actions-trigger">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round">
									<path d="M4 3l15 7-7 2-3 7z" />
									<rect
										x="14"
										y="14"
										width="6"
										height="6"
										rx="1" />
									<path d="M15.5 17l1.2 1.2 2-2.4" />
								</svg>
								<el-icon class="selected-actions-arrow"><ArrowDown /></el-icon>
								<span class="selected-actions-count">{{ selectedChildrenRows.length }}</span>
							</span>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item
										v-if="selectedChildrenRows.length === 1"
										command="openSelectedPart">
										<span class="selected-action-icon">↪</span>
										<span>打开</span>
									</el-dropdown-item>
									<div
										v-if="selectedChildrenRows.length === 1"
										class="selected-action-submenu"
										@mouseenter="selectedOpenWithSubmenuVisible = true"
										@mouseleave="selectedOpenWithSubmenuVisible = false">
										<div class="selected-action-submenu-trigger">
											<span class="selected-action-icon">↪</span>
											<span>打开方式</span>
											<el-icon><ArrowRight /></el-icon>
										</div>
										<div
											v-show="selectedOpenWithSubmenuVisible"
											class="selected-action-submenu-panel selected-action-open-with-panel">
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedOpenWith('3D Markup')">
												<span class="selected-action-icon">✎</span>
												<span>3D Markup</span>
											</div>
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedOpenWith('3D Navigate')">
												<span class="selected-action-icon">🧭</span>
												<span>3D Navigate</span>
											</div>
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedOpenWith('3DPlay')">
												<span class="selected-action-icon">▶</span>
												<span>3DPlay</span>
											</div>
											<div
												class="selected-action-submenu-item selected-action-open-with-item-divided"
												@click="handleSelectedOpenWith('more')">
												<span class="selected-action-icon">＋</span>
												<span>更多应用程序</span>
											</div>
										</div>
									</div>
									<el-dropdown-item command="setEnterpriseCode">
										<span class="selected-action-icon">↔</span>
										<span>设置企业编码</span>
									</el-dropdown-item>
									<div
										class="selected-action-submenu"
										@mouseenter="selectedReplaceSubmenuVisible = true"
										@mouseleave="selectedReplaceSubmenuVisible = false">
										<div class="selected-action-submenu-trigger">
											<span class="selected-action-icon">⇄</span>
											<span>替换为...</span>
											<el-icon><ArrowRight /></el-icon>
										</div>
										<div
											v-show="selectedReplaceSubmenuVisible"
											class="selected-action-submenu-panel">
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedActionCommand('replaceLatest')">
												<span class="selected-action-icon">⇄</span>
												<span>替换为最新修订版</span>
											</div>
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedActionCommand('replaceExisting')">
												<span class="selected-action-icon">⇄</span>
												<span>替换为现有项</span>
											</div>
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedActionCommand('replaceRevision')">
												<span class="selected-action-icon">⇄</span>
												<span>用修订版替换</span>
											</div>
											<div
												class="selected-action-submenu-item"
												@click="handleSelectedActionCommand('replaceDuplicate')">
												<span class="selected-action-icon">⇄</span>
												<span>替换为重复项</span>
											</div>
										</div>
									</div>
									<el-dropdown-item
										v-if="selectedChildrenRows.length === 1"
										command="instanceQuantity">
										<span class="selected-action-icon">＋</span>
										<span>实例数量</span>
									</el-dropdown-item>
									<el-dropdown-item command="unparent">
										<span class="selected-action-icon">拆</span>
										<span>拆离</span>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
						<span class="toolbar-divider"></span>
					</div>
					<el-tooltip
						content="剪切"
						placement="top">
						<span class="toolbar-copy-tooltip-wrapper">
							<button
								aria-label="剪切"
								class="toolbar-copy-action"
								:class="{ 'is-enabled': canCopyProductRows }"
								:disabled="!canCopyProductRows"
								@click.stop="handleCreateMenuCommand('cutProducts')">
								<el-icon><Scissor /></el-icon>
							</button>
						</span>
					</el-tooltip>
					<el-tooltip
						content="复制"
						placement="top">
						<span class="toolbar-copy-tooltip-wrapper">
							<button
								aria-label="复制"
								class="toolbar-copy-action"
								:class="{ 'is-enabled': canCopyProductRows }"
								:disabled="!canCopyProductRows"
								@click.stop="handleCreateMenuCommand('copyProducts')">
								<el-icon><CopyDocument /></el-icon>
							</button>
						</span>
					</el-tooltip>
					<el-tooltip
						content="粘贴您所选对象下复制或者剪切的对象"
						placement="top">
						<span class="toolbar-copy-tooltip-wrapper">
							<button
								aria-label="粘贴"
								class="toolbar-copy-action"
								:class="{ 'is-enabled': canPasteProductRows && !pasteProductsSubmitting }"
								:disabled="!canPasteProductRows || pasteProductsSubmitting"
								@click.stop="handleCreateMenuCommand('pasteProducts')">
								<el-icon><DocumentChecked /></el-icon>
							</button>
						</span>
					</el-tooltip>
					<el-tooltip
						content="在产品结构中搜索包含特定字符串的对象。"
						placement="top">
						<button
							ref="findButtonRef"
							aria-label="查找"
							class="toolbar-copy-action find-toolbar-action"
							@click.stop="toggleFindPanel">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path d="M10 10l-4 8" />
								<path d="M14 10l4 8" />
								<path d="M6 18h12" />
								<circle
									cx="8"
									cy="8"
									r="4" />
								<circle
									cx="16"
									cy="8"
									r="4" />
							</svg>
						</button>
					</el-tooltip>
					<Teleport to="body">
						<div
							v-if="findPopoverVisible"
							class="children-find-floating"
							:style="{ left: `${findPanelPosition.left}px`, top: `${findPanelPosition.top}px` }">
							<div class="children-find-panel">
								<div
									class="children-find-header"
									@mousedown="startFindPanelDrag">
									<span class="children-find-title">查找 - {{ findMatchedRowIds.length }} 产品</span>
									<el-icon
										class="children-find-close"
										@click="closeFindPopover">
										<Close />
									</el-icon>
								</div>
								<div class="children-find-row">
									<el-input
										v-model="findKeyword"
										size="small"
										@keyup.enter="handleFindInStructure" />
									<el-button
										size="small"
										title="查找输入字符串"
										:loading="findLoading"
										:disabled="!findKeyword.trim()"
										:class="{ 'is-find-ready': !!findKeyword.trim() }"
										@click="handleFindInStructure">
										<el-icon><Check /></el-icon>
									</el-button>
									<el-button
										size="small"
										title="查找上一个匹配单元格"
										:disabled="!findMatchedRowIds.length"
										@click="goToPreviousFindResult">
										<el-icon><ArrowUp /></el-icon>
									</el-button>
									<el-button
										size="small"
										title="查找下一个匹配单元格"
										:disabled="!findMatchedRowIds.length"
										@click="goToNextFindResult">
										<el-icon><ArrowDown /></el-icon>
									</el-button>
									<el-button
										size="small"
										title="选择所有匹配的单元格"
										:disabled="!findMatchedRowIds.length"
										@click="selectAllFindResults">
										<el-icon>
											<svg
												viewBox="0 0 1024 1024"
												xmlns="http://www.w3.org/2000/svg">
												<path
													d="M338 160h486v486H338V160z m44 44v398h398V204H382z"
													fill="currentColor" />
												<path
													d="M200 338v486h486v-64h44v108H156V294h108v44H200z"
													fill="currentColor" />
												<path
													d="M697 294L476 515l-98-98-32 32 130 130 253-253-32-32z"
													fill="currentColor" />
											</svg>
										</el-icon>
									</el-button>
								</div>
							</div>
						</div>
					</Teleport>
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
						:disabled="isFlatStructureView"
						@command="handleExpandMenuCommand"
						popper-class="expand-menu-dropdown">
						<el-button
							size="small"
							circle
							:disabled="isFlatStructureView"
							:class="['expand-menu-btn', { 'is-active': expandMenuActive, 'is-disabled': isFlatStructureView }]"
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
					<!-- 结构视图菜单按钮 -->
					<el-dropdown
						trigger="click"
						@command="handleStructureViewCommand"
						popper-class="structure-view-dropdown">
						<el-button
							size="small"
							circle
							:class="['structure-view-btn', { 'is-active': structureViewActive }]"
							title="结构视图">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path d="M4 4h7" />
								<path d="M7 4v12" />
								<path d="M7 10h6" />
								<path d="M7 16h6" />
								<path d="M12 8h3v4h-3z" />
								<path d="M12 14h3v4h-3z" />
								<circle
									cx="18"
									cy="17"
									r="2.2" />
								<path d="M18 12.5v1.2" />
								<path d="M18 20.3v1.2" />
								<path d="M13.5 17h1.2" />
								<path d="M21.3 17h1.2" />
								<path d="M14.8 13.8l.8.8" />
								<path d="M20.4 19.4l.8.8" />
								<path d="M21.2 13.8l-.8.8" />
								<path d="M15.6 19.4l-.8.8" />
							</svg>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="indented">
									<svg
										class="structure-view-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<path d="M7 5h13" />
										<path d="M7 9h13" />
										<path d="M7 13h10" />
										<path d="M7 17h7" />
										<line
											x1="3"
											y1="5"
											x2="5"
											y2="5" />
										<line
											x1="3"
											y1="9"
											x2="5"
											y2="9" />
										<line
											x1="3"
											y1="13"
											x2="5"
											y2="13" />
										<line
											x1="3"
											y1="17"
											x2="5"
											y2="17" />
									</svg>
									<span>缩进的产品结构</span>
								</el-dropdown-item>
								<el-dropdown-item command="flat">
									<svg
										class="structure-view-icon"
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
											width="20"
											height="20"
											rx="2" />
										<path d="M6 8h4" />
										<path d="M6 12h4" />
										<path d="M6 16h4" />
										<path d="M14 8h4" />
										<path d="M14 12h4" />
										<path d="M14 16h4" />
									</svg>
									<span>扁平产品结构</span>
								</el-dropdown-item>
								<el-dropdown-item command="leaf">
									<svg
										class="structure-view-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<path d="M12 2c0 0-3 5-3 9s3 6 3 6 3-2 3-6-3-9-3-9z" />
										<path d="M12 17c0 0 0 4 0 5" />
									</svg>
									<span>产品叶</span>
								</el-dropdown-item>
								<el-dropdown-item command="material">
									<svg
										class="structure-view-icon"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round">
										<rect
											x="3"
											y="3"
											width="7"
											height="7"
											rx="1" />
										<rect
											x="14"
											y="3"
											width="7"
											height="7"
											rx="1" />
										<rect
											x="14"
											y="14"
											width="7"
											height="7"
											rx="1" />
										<rect
											x="3"
											y="14"
											width="7"
											height="7"
											rx="1" />
									</svg>
									<span>产品原材料</span>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
					<el-tooltip
						content="树重新排序"
						placement="top">
						<el-button
							size="small"
							circle
							:disabled="!canOpenTreeReorder"
							:class="['tree-reorder-btn', { 'is-disabled': !canOpenTreeReorder }]"
							title="树重新排序"
							@click="openTreeReorderDialog">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round">
								<text
									x="2"
									y="7"
									font-size="6"
									fill="currentColor"
									stroke="none">
									1
								</text>
								<text
									x="2"
									y="14"
									font-size="6"
									fill="currentColor"
									stroke="none">
									2
								</text>
								<text
									x="2"
									y="21"
									font-size="6"
									fill="currentColor"
									stroke="none">
									3
								</text>
								<path d="M9 5h12" />
								<path d="M9 12h12" />
								<path d="M9 19h12" />
							</svg>
						</el-button>
					</el-tooltip>
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
						fixed
						@click="handleChildrenTableClick" />
				</template>
			</el-auto-resizer>
		</div>
		<Teleport to="body">
			<div
				v-if="treeReorderDialogVisible"
				class="tree-reorder-floating"
				:style="treeReorderDialogStyle">
				<div
					class="tree-reorder-header"
					@mousedown="startTreeReorderDrag">
					<span>树重新排序</span>
					<div class="tree-reorder-header-actions">
						<el-icon
							class="tree-reorder-header-icon"
							@click.stop="toggleTreeReorderMaximize">
							<Expand />
						</el-icon>
						<el-icon
							class="tree-reorder-header-icon"
							@click.stop="closeTreeReorderDialog">
							<Close />
						</el-icon>
					</div>
				</div>
				<div
					v-loading="treeReorderLoading"
					class="tree-reorder-body">
					<div class="tree-reorder-table-wrap">
						<table class="tree-reorder-table">
							<thead>
								<tr>
									<th>标题</th>
									<th>责任对象</th>
									<th>创建日期</th>
									<th>修改日期</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="row in treeReorderRows"
									:key="row.id"
									:class="{ 'is-selected': isTreeReorderRowSelected(row.id) }"
									@click="handleTreeReorderRowClick($event, row.id)">
									<td>{{ row.title }}</td>
									<td>{{ row.owner }}</td>
									<td>{{ row.created }}</td>
									<td>{{ row.modified }}</td>
								</tr>
							</tbody>
						</table>
						<div
							v-if="!treeReorderRows.length"
							class="tree-reorder-empty">
							无可排序的子级
						</div>
					</div>
					<div class="tree-reorder-side-actions">
						<el-button
							class="tree-reorder-move-btn"
							size="small"
							:disabled="!canMoveTreeReorderUp"
							@click="moveTreeReorderRow(-1)">
							<el-icon><ArrowUp /></el-icon>
						</el-button>
						<el-button
							class="tree-reorder-move-btn"
							size="small"
							:disabled="!canMoveTreeReorderDown"
							@click="moveTreeReorderRow(1)">
							<el-icon><ArrowDown /></el-icon>
						</el-button>
					</div>
				</div>
				<div class="tree-reorder-footer">
					<el-button
						type="primary"
						:loading="treeReorderSubmitting"
						:disabled="!treeReorderRows.length"
						@click="confirmTreeReorder">
						确定
					</el-button>
					<el-button @click="resetTreeReorder">重置树排序</el-button>
					<el-button @click="closeTreeReorderDialog">取消</el-button>
				</div>
				<div
					class="tree-reorder-resize-handle"
					@mousedown="startTreeReorderResize"></div>
			</div>
		</Teleport>
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
			v-model="instanceQuantityDialogVisible"
			:title="instanceQuantityDialogTitle"
			width="1000px"
			class="instance-quantity-dialog"
			:close-on-click-modal="false">
			<div class="instance-quantity-tabs">
				<span class="instance-quantity-tab is-active">总数量</span>
			</div>
			<div class="instance-quantity-toolbar">
				<span>编辑数量:</span>
				<el-input-number
					v-model="instanceQuantityValue"
					:min="instanceQuantityBaseRows.length"
					:size="'small'"
					@change="handleInstanceQuantityValueChange" />
				<span
					v-if="instanceQuantityAddedCount > 0"
					class="instance-quantity-added-tip">
					将添加 {{ instanceQuantityAddedCount }} 个项目
				</span>
			</div>
			<div class="instance-quantity-table-wrap">
				<el-table
					:data="instanceQuantityRows"
					border
					height="280"
					row-key="id">
					<el-table-column
						type="index"
						width="36" />
					<el-table-column
						prop="instanceLabel"
						label="标题 (实例)"
						width="240" />
					<el-table-column
						label="移除"
						width="84"
						align="center">
						<template #default="{ row }">
							<el-button
								text
								circle
								:disabled="!row.editable"
								@click="removeInstanceQuantityRow(row)">
								<el-icon><Minus /></el-icon>
							</el-button>
						</template>
					</el-table-column>
					<el-table-column
						prop="editStatus"
						label="编辑状态"
						width="110" />
					<el-table-column
						label="冻结"
						width="80" />
					<el-table-column
						prop="label"
						label="标题"
						width="180" />
					<el-table-column
						prop="partNumber"
						label="企业项目编号"
						width="140" />
					<el-table-column
						prop="revision"
						label="修订版"
						width="90" />
					<el-table-column
						prop="isLastRevision"
						label="是最新修订版"
						width="120" />
					<el-table-column
						prop="owner"
						label="所有者"
						width="120" />
					<el-table-column
						prop="reserved"
						label="锁定"
						width="90" />
					<el-table-column
						prop="modified"
						label="修改日期"
						width="150" />
					<el-table-column
						prop="globalType"
						label="类型"
						width="130" />
					<el-table-column
						prop="identifier"
						label="名称"
						width="150" />
				</el-table>
			</div>
			<template #footer>
				<el-button
					type="primary"
					:loading="instanceQuantitySubmitting"
					@click="handleConfirmInstanceQuantity">
					确定
				</el-button>
				<el-button @click="instanceQuantityDialogVisible = false">取消</el-button>
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
			:title="duplicateDialogDisplayTitle"
			width="690px"
			class="duplicate-dialog">
			<div
				v-if="duplicateTargets.length > 1"
				class="duplicate-target-list">
				<div class="duplicate-target-header">
					<span class="duplicate-target-cell duplicate-target-title">标题</span>
					<span class="duplicate-target-cell duplicate-target-type">类型</span>
					<span class="duplicate-target-cell duplicate-target-revision">修订版</span>
					<span class="duplicate-target-cell duplicate-target-state">成熟度状态</span>
				</div>
				<div
					v-for="target in duplicateTargets"
					:key="target.physicalid"
					class="duplicate-target-row">
					<span class="duplicate-target-cell duplicate-target-title">
						<img
							v-if="target.imageUrl"
							:src="target.imageUrl"
							class="duplicate-target-icon" />
						<span
							v-else
							class="duplicate-target-default-icon"></span>
						<span>{{ target.name }}</span>
					</span>
					<span class="duplicate-target-cell duplicate-target-type">{{ target.typeDisplayName || '物理产品' }}</span>
					<span class="duplicate-target-cell duplicate-target-revision">{{ target.revision }}</span>
					<span class="duplicate-target-cell duplicate-target-state">
						<el-tag
							size="small"
							type="info">
							{{ target.current || '工作中' }}
						</el-tag>
					</span>
				</div>
			</div>
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
							v-for="option in duplicateSecurityContextOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value" />
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
		<UnparentConfirmDialog
			v-model="unparentDialogVisible"
			:count="selectedChildrenRows.length"
			:loading="unparentSubmitting"
			:report-visible="unparentReportVisible"
			:success-messages="unparentSuccessMessages"
			:failure-messages="unparentFailureMessages"
			@confirm="handleConfirmUnparent" />
		<ReplaceLatestRevisionReportDialog
			v-model="replaceLatestReportVisible"
			:title="replaceReportTitle"
			:messages="replaceLatestReportMessages" />
		<UpdateEntireStructureRevisionConfirmDialog
			v-model="updateEntireStructureRevisionDialogVisible"
			:confirmations="updateEntireStructureRevisionConfirmations"
			@confirm="handleConfirmUpdateEntireStructureRevision" />
		<ReplaceRevisionDialog
			v-model="replaceRevisionDialogVisible"
			:rows="replaceRevisionSelectedRows"
			:get-parent-physical-id="getInstanceQuantityParentPhysicalId"
			@confirm="handleReplaceRevisionConfirm" />
		<UpdateRevisionDialog
			v-model="updateRevisionDialogVisible"
			:part-info="partInfo"
			:children-data="childrenData"
			:current-physical-id="currentPhysicalId"
			:submitting="updateRevisionSubmitting"
			@confirm="handleUpdateRevisionConfirm" />
	</div>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
	ArrowDown,
	ArrowUp,
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
	Back,
	CopyDocument,
	DocumentChecked,
	Loading,
	HomeFilled,
	Share,
	Fold,
	Scissor,
	ArrowRight,
	CirclePlus,
	CaretRight,
	Expand,
	ArrowLeft
} from '@element-plus/icons-vue';
import { ElCheckbox, ElIcon, ElImage, ElMessage, ElMessageBox, ElTag } from 'element-plus';
import type { Column } from 'element-plus';
import partDetailApi from '@/api/partDetailApi';
import expandApi, { type TreeNode } from '@/api/expandApi';
import { ModelerAPI, VplmAPI } from '@/api';
import type {
	DeformableProductInfo,
	DuplicateProductItem,
	MaturityObjectParams,
	MaturityState,
	PromoteMaturityParams,
	StateTransition,
	PartInfo,
	ReparentSourceItem,
	ReparentTargetItem,
	ReplaceByLatestRevisionOperation,
	UnparentResponseResult,
	UpdateEntireStructureRevisionConfirmation,
	VersionGraphVersion
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
import UnparentConfirmDialog from './UnparentConfirmDialog.vue';
import ReplaceLatestRevisionReportDialog from './ReplaceLatestRevisionReportDialog.vue';
import UpdateEntireStructureRevisionConfirmDialog from './UpdateEntireStructureRevisionConfirmDialog.vue';
import ReplaceRevisionDialog from './ReplaceRevisionDialog.vue';
import UpdateRevisionDialog from './UpdateRevisionDialog.vue';
import type { UpdateRevisionOperation } from './UpdateRevisionDialog.vue';
import catflNlsZh from '@/i18n/lang/zh-CN/CATFLNls_zh.json';
import catflNlsEn from '@/i18n/lang/en-US/CATFLNls_en.json';

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
	'current'?: string;
	'thumbnail_2d'?: string;
	'icon'?: string;
}

interface ExistingProductParentContext {
	physicalId: string;
	name: string;
	row?: TreeNode;
	children: string[];
	pathArray: string[];
}

interface DuplicateSecurityContextOption {
	value: string;
	label: string;
}

interface InstanceQuantityRow {
	id: string;
	sourceRowId?: string;
	relationId?: string;
	parentPhysicalId: string;
	childPhysicalId: string;
	instanceLabel: string;
	editable: boolean;
	editStatus: string;
	label: string;
	partNumber: string;
	revision: string;
	isLastRevision: boolean;
	status: string;
	owner: string;
	reserved: boolean;
	modified: string;
	globalType: string;
	identifier: string;
}

interface TreeReorderRow {
	id: string;
	relationId: string;
	resourceid: string;
	title: string;
	owner: string;
	created: string;
	modified: string;
	source: TreeNode;
}

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger';
type SelectedActionCommand =
	| 'openSelectedPart'
	| 'setEnterpriseCode'
	| 'instanceQuantity'
	| 'unparent'
	| 'replaceLatest'
	| 'replaceExisting'
	| 'replaceRevision'
	| 'replaceDuplicate';
type CreateMenuCommand =
	| 'cutProducts'
	| 'copyProducts'
	| 'pasteProducts'
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
const partDetailNavigationStack = ref<string[]>([]);
const findButtonRef = ref<HTMLButtonElement | null>(null);
const findPopoverVisible = ref(false);
const findPanelPosition = ref({ left: 0, top: 0 });
const findKeyword = ref('');
const findActiveKeyword = ref('');
const findLoading = ref(false);
const findMatchedRowIds = ref<string[]>([]);
const findCurrentIndex = ref(-1);
const structureViewMode = ref<'indented' | 'flat'>('indented');
const hoveredChildrenColumnKey = ref<string>('');
const instanceQuantityDialogVisible = ref(false);
const instanceQuantitySubmitting = ref(false);
const instanceQuantityRows = ref<InstanceQuantityRow[]>([]);
const instanceQuantityBaseRows = ref<InstanceQuantityRow[]>([]);
const instanceQuantitySelectedRow = ref<TreeNode | null>(null);
const instanceQuantityValue = ref(1);
const headerOpenWithSubmenuVisible = ref(false);
const selectedOpenWithSubmenuVisible = ref(false);
const selectedReplaceSubmenuVisible = ref(false);
const unparentDialogVisible = ref(false);
const unparentSubmitting = ref(false);
const unparentReportVisible = ref(false);
const unparentSuccessMessages = ref<string[]>([]);
const unparentFailureMessages = ref<string[]>([]);
const unparentSelectedRowsSnapshot = ref<TreeNode[]>([]);
const replaceLatestReportVisible = ref(false);
const replaceLatestReportMessages = ref<string[]>([]);
const replaceReportTitle = ref('替换为最新修订版报告');
const updateEntireStructureRevisionDialogVisible = ref(false);
const updateEntireStructureRevisionLoading = ref(false);
const updateEntireStructureRevisionConfirmations = ref<UpdateEntireStructureRevisionConfirmation[]>([]);
const updateEntireStructureRevisionReplaceList = ref<ReplaceByLatestRevisionOperation[]>([]);
const replaceRevisionDialogVisible = ref(false);
const replaceRevisionSelectedRows = ref<TreeNode[]>([]);
const updateRevisionDialogVisible = ref(false);
const updateRevisionSubmitting = ref(false);

// 展开菜单相关数据（独立功能，不混合原有逻辑）
const expandMenuActive = ref(false);
const structureViewActive = ref(false);
const treeReorderDialogVisible = ref(false);
const treeReorderLoading = ref(false);
const treeReorderSubmitting = ref(false);
const treeReorderRows = ref<TreeReorderRow[]>([]);
const treeReorderOriginalRows = ref<TreeReorderRow[]>([]);
const treeReorderSelectedRowIds = ref<string[]>([]);
const treeReorderParentPhysicalId = ref('');
const treeReorderParentRow = ref<TreeNode | null>(null);
const treeReorderDialogPosition = ref({ left: Math.max(20, Math.round((window.innerWidth - 1024) / 2)), top: 60 });
const treeReorderDialogSize = ref({ width: 1024, height: 560 });
const treeReorderDialogMaximized = ref(false);
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
const duplicateDialogMode = ref<'insert' | 'replace'>('insert');
const duplicateSecurityContext = ref('');
const duplicateSecurityContextOptions = ref<DuplicateSecurityContextOption[]>([]);
const duplicateTargets = ref<DuplicateProductItem[]>([]);
const replaceDuplicateSelectedRows = ref<TreeNode[]>([]);
const copiedProductRows = ref<TreeNode[]>([]);
const copiedProductMode = ref<'copy' | 'cut'>('copy');
const pasteProductsSubmitting = ref(false);
const canCopyProductRows = computed(() => !isFlatStructureView.value && selectedChildrenRows.value.length > 0);
const canPasteProductRows = computed(() => !isFlatStructureView.value && copiedProductRows.value.length > 0);
const duplicateSecurityContextLabel = computed(() => {
	const selectedOption = duplicateSecurityContextOptions.value.find(option => option.value === duplicateSecurityContext.value);
	if (selectedOption) return selectedOption.label;
	const context = duplicateSecurityContext.value || baseInfoStore.securityContext || '';
	return context.split('.').pop() || 'Common Space';
});
const duplicateDialogTitle = computed(() => {
	const target = duplicateTargets.value[0];
	if (!target) return '';
	return `${target.typeDisplayName || '物理产品'}${target.name || ''} ${target.revision || ''}`.trim();
});
const duplicateDialogDisplayTitle = computed(() =>
	duplicateTargets.value.length > 1
		? `${duplicateDialogMode.value === 'replace' ? '替换为重复项' : '插入重复项'} - ${duplicateTargets.value.length} 对象`
		: `${duplicateDialogMode.value === 'replace' ? '替换为重复项' : '插入重复项'} - ${duplicateDialogTitle.value}`
);
const instanceQuantityAddedCount = computed(() => Math.max(0, instanceQuantityRows.value.filter(row => row.editable).length));
const instanceQuantityDialogTitle = computed(() => {
	const row = instanceQuantitySelectedRow.value;
	if (!row) return '数量';
	return `数量 - ${row.label || row.identifier || ''} ${row.revision || ''} (${instanceQuantityRows.value.length})`.trim();
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
const isFlatStructureView = computed(() => structureViewMode.value === 'flat');

// 判断+号菜单是否可用（当勾选了非VPMReference类型的零件时禁用）
const isCreateMenuDisabled = computed(() => {
	if (isFlatStructureView.value) {
		return true;
	}
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

const parsePhysicalIdPath = (value?: string) => {
	if (!value) return [];
	const matchedIds = value.match(/[A-Fa-f0-9]{16,}/g);
	return matchedIds || [];
};

const mergePhysicalIdPaths = (parentPath: string[], childPath: string[]) => {
	if (!parentPath.length) return childPath;
	if (!childPath.length) return parentPath;
	const overlapIndex = childPath.findIndex(item => item === parentPath[parentPath.length - 1]);
	if (overlapIndex >= 0) {
		return [...parentPath, ...childPath.slice(overlapIndex + 1)];
	}
	return [...parentPath, ...childPath];
};

const getCurrentProductPathArray = () => {
	const parentPhysicalId = getParentPhysicalId();
	const parsedPath = parsePhysicalIdPath(partInfo.value?.pathsr);
	if (parsedPath.length) return parsedPath;
	return parentPhysicalId ? [parentPhysicalId] : [];
};

const getProductTargetPathArray = (row?: TreeNode) => {
	const currentPath = getCurrentProductPathArray();
	if (!row) return currentPath;
	const rowPath = row.path?.length ? row.path : [row.resourceid];
	return mergePhysicalIdPaths(currentPath, rowPath);
};

const getExistingProductParentContexts = (): ExistingProductParentContext[] => {
	const selectedRows = [...selectedChildrenRows.value];
	if (selectedRows.length) {
		return selectedRows
			.map(row => ({
				physicalId: row.resourceid,
				name: row.instanceLabel || row.label || row.identifier || row.resourceid,
				row,
				children: getParentChildrenIds(row),
				pathArray: getProductTargetPathArray(row)
			}))
			.filter(item => !!item.physicalId);
	}

	const parentPhysicalId = getParentPhysicalId();
	if (!parentPhysicalId) return [];
	return [
		{
			physicalId: parentPhysicalId,
			name: partInfo.value?.['ds6w:identifier'] || partInfo.value?.['ds6w:label'] || parentPhysicalId,
			children: getParentChildrenIds(),
			pathArray: getProductTargetPathArray()
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
	return [...new Set(messages)].map(getCatflMessage).join('；');
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

const refreshAfterProductPaste = async (parents: ExistingProductParentContext[], sourceRows: TreeNode[]) => {
	if (copiedProductMode.value !== 'cut') {
		await refreshAfterExistingProductInsert(parents);
		return;
	}
	queryModeStore.switchToDbMode();
	const rootPhysicalId = getParentPhysicalId();
	const targetRows = parents.map(parent => parent.row).filter((row): row is TreeNode => !!row);
	const sourceParentRows = sourceRows.map(row => findParentNodeByChildId(childrenData.value, row.id)).filter((row): row is TreeNode => !!row);
	const rows = [...targetRows, ...sourceParentRows];
	const uniqueRows = rows.filter((row, index, items) => items.findIndex(item => item.id === row.id) === index);
	const shouldReloadRoot = sourceRows.some(row => childrenData.value.some(child => child.id === row.id)) || !targetRows.length;

	if (shouldReloadRoot && rootPhysicalId) {
		await loadPartDetail(rootPhysicalId);
	}
	if (uniqueRows.length) {
		const latestRows = uniqueRows.map(row => flattenChildrenData.value.find(item => item.id === row.id) || row);
		await Promise.all(latestRows.map(row => reloadAndExpandRow(row)));
	}
};

const cacheSelectedProducts = (mode: 'copy' | 'cut') => {
	const rows = [...selectedChildrenRows.value];
	if (!rows.length) {
		ElMessage.warning(mode === 'cut' ? '请先选择要剪切的数据' : '请先选择要复制的数据');
		return;
	}
	copiedProductRows.value = rows;
	copiedProductMode.value = mode;
	const names = rows.map(row => row.label || row.instanceLabel || row.identifier || row.resourceid).join('、');
	ElMessage.success(`已${mode === 'cut' ? '剪切' : '复制'} ${rows.length} 个对象：${names}`);
};

const handleCopyProducts = () => cacheSelectedProducts('copy');

const handleCutProducts = () => cacheSelectedProducts('cut');

const getCopiedProductSourceItems = (): Array<string | ReparentSourceItem> => {
	if (copiedProductMode.value !== 'cut') {
		return copiedProductRows.value.map(row => row.resourceid).filter(Boolean);
	}
	return copiedProductRows.value
		.map(row => ({
			physicalId: row.resourceid,
			instance: row.relationId,
			pathArray: row.relationId ? [row.relationId] : [],
			mode: 'CutPaste' as const
		}))
		.filter(item => !!item.physicalId);
};

const getPasteProductTargetItems = (parents: ExistingProductParentContext[]): ReparentTargetItem[] =>
	parents.map(parent => ({
		physicalId: parent.physicalId,
		children: parent.children,
		pathArray: parent.pathArray
	}));

const handlePasteProducts = async () => {
	if (pasteProductsSubmitting.value) return;
	if (!copiedProductRows.value.length) {
		ElMessage.warning('请先复制对象');
		return;
	}
	const canInsert = await validateCurrentChildInsertParentContext('未获取到粘贴父节点');
	if (!canInsert) return;
	const parents = getExistingProductParentContexts();
	if (!parents.length) {
		ElMessage.warning('未获取到粘贴父节点');
		return;
	}
	const sourceItems = getCopiedProductSourceItems();
	const targetItems = getPasteProductTargetItems(parents);
	const sourcePhysicalIds = copiedProductRows.value.map(row => row.resourceid).filter(Boolean);
	if (!sourcePhysicalIds.length) {
		ElMessage.warning('未获取到复制对象的物理ID');
		return;
	}
	pasteProductsSubmitting.value = true;
	childrenLoading.value = true;
	try {
		const response = (await partDetailApi.reparentParts(sourceItems, targetItems)) as ReparentResponse;
		if (response?.status && response.status !== 'success') {
			await showReparentFailureMessage(response);
			return;
		}
		ElMessage.success(`粘贴 ${sourcePhysicalIds.length} 个对象成功`);
		await refreshAfterProductPaste(parents, copiedProductRows.value);
	} catch (error) {
		console.error('[PartDetailView] 粘贴失败:', error);
		await showReparentFailureMessage(error);
	} finally {
		pasteProductsSubmitting.value = false;
		childrenLoading.value = false;
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

const replaceWithExistingProduct = async (selectedProducts: ExistingProductSearchItem[]) => {
	const replacement = selectedProducts
		.map(item => ({
			physicalId: getExistingProductPhysicalId(item),
			name: getExistingProductName(item)
		}))
		.find(item => !!item.physicalId);
	if (!replacement) {
		ElMessage.warning('未选择现有产品');
		return;
	}

	const rows = [...selectedChildrenRows.value];
	if (!rows.length) {
		ElMessage.warning('未选择要替换的数据');
		return;
	}

	const operations = [];
	for (const row of rows) {
		if (!row.relationId || !row.resourceid) {
			ElMessage.error('未获取到选中对象的物理ID或关系ID');
			return;
		}
		const parentPhysicalId = getInstanceQuantityParentPhysicalId(row);
		if (!parentPhysicalId) {
			ElMessage.error('未获取到选中对象的父节点');
			return;
		}
		operations.push({
			hasParent: parentPhysicalId,
			instance: row.relationId,
			isInstanceOf: replacement.physicalId,
			oldName: row.label || row.instanceLabel || row.identifier || row.resourceid,
			newName: replacement.name
		});
	}

	const response = await partDetailApi.replaceByLatestRevision(operations);
	if (String(response.status).toLowerCase() !== 'success') {
		ElMessage.error(getInsertExistingFailureMessage(response) || '替换为现有项失败');
		return;
	}

	const successResults = (response.results || []).filter(result => String(result.status).toLowerCase() === 'success');
	replaceReportTitle.value = '替换为现有项报告';
	replaceLatestReportMessages.value = successResults.length
		? successResults.map(result => `成功将 ${result.oldName || ''} 替换为 ${result.newName || ''}。`)
		: operations.map(operation => `成功将 ${operation.oldName} 替换为 ${operation.newName}。`);
	replaceLatestReportVisible.value = true;
	selectedChildrenRows.value = [];
	queryModeStore.switchToDbMode();
	if (currentPhysicalId.value) {
		await loadPartDetail(currentPhysicalId.value);
	}
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

const openReplaceExistingProductDialog = () => {
	dsSearchInput('', 'product', 'PSE', '', async value => {
		try {
			await replaceWithExistingProduct(value as ExistingProductSearchItem[]);
		} catch (error) {
			console.error('[PartDetailView] 替换为现有项失败:', error);
			ElMessage.error('替换为现有项失败');
		}
	});
};

const getDuplicateMaturityStateLabel = (status?: string) => {
	const normalizedStatus = status || 'IN_WORK';
	if (normalizedStatus.includes('PRIVATE') || normalizedStatus.includes('草稿') || normalizedStatus.includes('私有')) return '草稿';
	if (normalizedStatus.includes('IN_WORK') || normalizedStatus.includes('工作中')) return '工作中';
	if (normalizedStatus.includes('FROZEN') || normalizedStatus.includes('冻结')) return '冻结';
	if (normalizedStatus.includes('RELEASED') || normalizedStatus.includes('发布')) return '已发布';
	if (normalizedStatus.includes('OBSOLETE') || normalizedStatus.includes('废弃') || normalizedStatus.includes('作废')) return '作废';
	return normalizedStatus;
};

const toDuplicateProductItem = (item: ExistingProductSearchItem): DuplicateProductItem => ({
	physicalid: getExistingProductPhysicalId(item),
	name: getExistingProductName(item),
	revision: item['ds6wg:revision'] || '',
	typeDisplayName: item['ds6w:type'] || '物理产品',
	current: getDuplicateMaturityStateLabel(item['ds6w:status'] || item.current),
	imageUrl: item.thumbnail_2d || item.icon || ''
});

const setDuplicateSecurityContextFallback = () => {
	duplicateSecurityContext.value = baseInfoStore.securityContext || '';
	if (!duplicateSecurityContext.value) {
		duplicateSecurityContextOptions.value = [];
		return;
	}
	duplicateSecurityContextOptions.value = [
		{
			value: duplicateSecurityContext.value,
			label: duplicateSecurityContextLabel.value
		}
	];
};

const loadDuplicateSecurityContext = async () => {
	try {
		const createContextRes = await VplmAPI.getCreateContext({
			tenant: 'OnPremise',
			type: 'VPMReference',
			xrequestedwith: 'xmlhttprequest'
		});
		const options: DuplicateSecurityContextOption[] =
			createContextRes.credentials?.map((credential: { ctxname: string; prjtitle?: string; ctxtitle?: string }) => ({
				value: credential.ctxname,
				label: credential.prjtitle || credential.ctxtitle || credential.ctxname
			})) || [];
		duplicateSecurityContextOptions.value = options;
		if (options.length) {
			const currentContext = baseInfoStore.securityContext || duplicateSecurityContext.value;
			duplicateSecurityContext.value = options.find(option => option.value === currentContext)?.value || options[0].value;
			return;
		}
		setDuplicateSecurityContextFallback();
	} catch (error) {
		console.error('[PartDetailView] 获取重复项合作区失败:', error);
		setDuplicateSecurityContextFallback();
	}
};

const openInsertDuplicateDialogFromChildrenTable = () => {
	dsSearchInput('', 'product', 'PSE', '', async value => {
		const targets = (value as ExistingProductSearchItem[]).map(toDuplicateProductItem).filter(item => !!item.physicalid);
		if (!targets.length) {
			ElMessage.warning('未选择重复项');
			return;
		}
		duplicateDialogMode.value = 'insert';
		replaceDuplicateSelectedRows.value = [];
		duplicateTargets.value = targets;
		duplicatePrefix.value = '';
		duplicateIncludeStructure.value = true;
		await loadDuplicateSecurityContext();
		duplicateDialogVisible.value = true;
	});
};

const openReplaceDuplicateDialog = async () => {
	const rows = [...selectedChildrenRows.value];
	if (!rows.length) {
		ElMessage.warning('未选择要替换的数据');
		return;
	}
	if (rows.some(row => !row.resourceid || !row.relationId)) {
		ElMessage.error('未获取到选中对象的物理ID或关系ID');
		return;
	}
	duplicateDialogMode.value = 'replace';
	replaceDuplicateSelectedRows.value = rows;
	duplicateTargets.value = rows.map(row => ({
		physicalid: row.resourceid,
		name: row.label || row.instanceLabel || row.identifier || row.resourceid,
		revision: row.revision || '',
		typeDisplayName: row.typeDisplayName || row.globalType || '物理产品',
		current: getDuplicateMaturityStateLabel(row.statusRaw || row.status),
		imageUrl: row.icon || row.type_icon_url || ''
	}));
	duplicatePrefix.value = '';
	duplicateIncludeStructure.value = true;
	await loadDuplicateSecurityContext();
	duplicateDialogVisible.value = true;
};

const refreshAfterReplaceDuplicate = async (rows: TreeNode[]) => {
	queryModeStore.switchToDbMode();
	const parentRows = rows.map(row => findParentNodeByChildId(childrenData.value, row.id)).filter((row): row is TreeNode => !!row);
	if (parentRows.length) {
		await Promise.all([...new Map(parentRows.map(row => [row.id, row])).values()].map(row => reloadAndExpandRow(row)));
		return;
	}
	if (currentPhysicalId.value) {
		await loadPartDetail(currentPhysicalId.value);
	}
};

const formatReplaceDuplicateSuccessMessage = (
	result: { oldName?: string; newName?: string; oldInstance?: string; newReference?: string },
	duplicateNameMap: Map<string, string>
) => {
	const newName = result.newName || duplicateNameMap.get(result.oldInstance || '') || result.newReference || '';
	return `成功将 ${result.oldName || ''} 替换为 ${newName}。`;
};

const submitReplaceDuplicateProducts = async () => {
	const rows = [...replaceDuplicateSelectedRows.value];
	if (!rows.length) {
		ElMessage.warning('未选择要替换的数据');
		return;
	}
	duplicateSubmitting.value = true;
	try {
		const duplicateResponse = await partDetailApi.duplicateStructure(
			rows.map(row => ({ physicalid: row.resourceid })),
			duplicatePrefix.value,
			duplicateIncludeStructure.value
		);
		if (duplicateResponse.status && String(duplicateResponse.status).toLowerCase() !== 'success') {
			const reportMessages = duplicateResponse.report?.map(item => getCatflMessage(String(item))).join('；');
			ElMessage.error(reportMessages || '复制结构失败');
			return;
		}
		const duplicateResults = duplicateResponse.results?.flat() || [];
		const operations: ReplaceByLatestRevisionOperation[] = [];
		const duplicateNameMap = new Map<string, string>();
		for (const row of rows) {
			const clonedPhysicalId = duplicateResults.find(result => result.sourceid === row.resourceid)?.physicalid || '';
			if (!clonedPhysicalId) {
				ElMessage.error(`未获取到 ${row.label || row.resourceid} 的复制对象`);
				return;
			}
			const oldName = row.label || row.instanceLabel || row.identifier || row.resourceid;
			const newName = `${duplicatePrefix.value || ''}${oldName}`;
			duplicateNameMap.set(row.relationId || row.resourceid, newName);
			const parentPhysicalId = getInstanceQuantityParentPhysicalId(row);
			if (!parentPhysicalId || !row.relationId) {
				ElMessage.error('未获取到选中对象的父节点或关系ID');
				return;
			}
			operations.push({
				hasParent: parentPhysicalId,
				instance: row.relationId,
				isInstanceOf: clonedPhysicalId,
				oldName,
				newName
			});
		}
		const response = await partDetailApi.replaceByLatestRevision(operations);
		if (String(response.status).toLowerCase() !== 'success') {
			ElMessage.error(getInsertExistingFailureMessage(response) || '替换为重复项失败');
			return;
		}
		const failedResults = response.results?.filter(result => String(result.status).toLowerCase() !== 'success') || [];
		if (failedResults.length) {
			ElMessage.error(getInsertExistingFailureMessage({ results: failedResults }) || '替换为重复项失败');
			return;
		}
		const successResults = response.results?.filter(result => String(result.status).toLowerCase() === 'success') || [];
		replaceReportTitle.value = '替换为重复项报告';
		replaceLatestReportMessages.value = successResults.length
			? successResults.map(result => formatReplaceDuplicateSuccessMessage(result, duplicateNameMap))
			: operations.map(operation => `成功将 ${operation.oldName} 替换为 ${operation.newName || operation.isInstanceOf}。`);
		replaceLatestReportVisible.value = true;
		duplicateDialogVisible.value = false;
		selectedChildrenRows.value = [];
		await refreshAfterReplaceDuplicate(rows);
	} catch (error) {
		console.error('[PartDetailView] 替换为重复项失败:', error);
		ElMessage.error('替换为重复项失败');
	} finally {
		duplicateSubmitting.value = false;
	}
};

const submitDuplicateProducts = async () => {
	if (duplicateDialogMode.value === 'replace') {
		await submitReplaceDuplicateProducts();
		return;
	}
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
	if (command === 'cutProducts') {
		handleCutProducts();
		return;
	}
	if (command === 'copyProducts') {
		handleCopyProducts();
		return;
	}
	if (command === 'pasteProducts') {
		await handlePasteProducts();
		return;
	}
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
const canOpenTreeReorder = computed(() => !isFlatStructureView.value && selectedChildrenRows.value.length <= 1);
const treeReorderSelectedIndexes = computed(() =>
	treeReorderSelectedRowIds.value
		.map(id => treeReorderRows.value.findIndex(row => row.id === id))
		.filter(index => index >= 0)
		.sort((a, b) => a - b)
);
const canMoveTreeReorderUp = computed(() => !!treeReorderSelectedIndexes.value.length && treeReorderSelectedIndexes.value[0] > 0);
const canMoveTreeReorderDown = computed(
	() =>
		!!treeReorderSelectedIndexes.value.length &&
		treeReorderSelectedIndexes.value[treeReorderSelectedIndexes.value.length - 1] < treeReorderRows.value.length - 1
);
const treeReorderDialogStyle = computed(() => ({
	left: `${treeReorderDialogMaximized.value ? 8 : treeReorderDialogPosition.value.left}px`,
	top: `${treeReorderDialogMaximized.value ? 8 : treeReorderDialogPosition.value.top}px`,
	width: `${treeReorderDialogMaximized.value ? window.innerWidth - 16 : treeReorderDialogSize.value.width}px`,
	height: `${treeReorderDialogMaximized.value ? window.innerHeight - 16 : treeReorderDialogSize.value.height}px`
}));

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
		findMatchedRowIds.value[findCurrentIndex.value] === rowData.id ? 'find-active-child-row' : '',
		draggingChildRowId.value === rowData.id ? 'dragging-child-row' : '',
		dragOverChildRowId.value === rowData.id ? 'drag-over-child-row' : ''
	]
		.filter(Boolean)
		.join(' ');

const handleChildrenTableClick = (event: MouseEvent) => {
	const target = event.target as HTMLElement | null;
	if (!target || !selectedChildrenRows.value.length) return;

	const shouldKeepSelection = !!target.closest('.el-checkbox, .selection-cell, .selection-header-cell, .column-resize-handle');
	if (shouldKeepSelection) return;

	selectedChildrenRows.value = [];
};

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
	if (isFlatStructureView.value) {
		event.preventDefault();
		return;
	}
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
	'draggable': !isFlatStructureView.value,
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
	h('div', { class: ['resizable-header-cell', hoveredChildrenColumnKey.value === key ? 'is-hovered-column' : ''] }, [
		h('span', { class: 'resizable-header-title' }, title),
		h('span', {
			class: 'column-resize-handle',
			onMousedown: (event: MouseEvent) => startColumnResize(event, key)
		})
	]);

const createChildrenCellProps = (key: string, className?: string) => ({
	class: [className || '', hoveredChildrenColumnKey.value === key ? 'is-hovered-column' : ''],
	onMouseenter: () => {
		hoveredChildrenColumnKey.value = key;
	},
	onMouseleave: () => {
		hoveredChildrenColumnKey.value = '';
	}
});

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (value: string) => {
	const keyword = findActiveKeyword.value.trim();
	if (!keyword) return value || '';
	const parts = String(value || '').split(new RegExp(`(${escapeRegExp(keyword)})`, 'gi'));
	return parts.map(part => (part.toLowerCase() === keyword.toLowerCase() ? h('span', { class: 'find-highlight-text' }, part) : part));
};

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
					class: ['resizable-header-cell selection-header-cell', hoveredChildrenColumnKey.value === 'selection' ? 'is-hovered-column' : ''],
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
		cellRenderer: ({ rowData, rowIndex }) =>
			h(
				'div',
				{
					class: ['selection-cell', isChildrenRowSelected(rowData) ? 'is-selected' : '', isFlatStructureView.value ? 'is-disabled' : ''],
					onMouseenter: () => {
						hoveredChildrenColumnKey.value = 'selection';
					},
					onMouseleave: () => {
						hoveredChildrenColumnKey.value = '';
					},
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
					h('span', { class: 'selection-row-index' }, String(rowIndex + 1)),
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
		cellRenderer: ({ rowData }) => {
			const canExpand = !isFlatStructureView.value && (rowData.hasChildren || rowData.isExpanded);
			return h(
				'div',
				{
					...createChildrenCellProps('label', 'name-cell'),
					style: { paddingLeft: `${(isFlatStructureView.value ? 0 : rowData.level || 0) * 20}px` }
				},
				[
					h(
						'span',
						{
							class: [canExpand ? 'custom-tree-icon' : 'tree-icon-placeholder', isRowExpanding(rowData) ? 'is-loading' : ''],
							onClick: (event: MouseEvent) => {
								event.stopPropagation();
								if (!isRowExpanding(rowData) && canExpand) toggleRowExpand(rowData);
							}
						},
						canExpand
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
					h('span', { class: 'name-text' }, renderHighlightedText(rowData.label))
				]
			);
		}
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
					...createChildrenCellProps('partNumber', 'enterprise-code-link'),
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
		headerCellRenderer: () => createResizableHeader('instanceLabel', '标题(实例)'),
		cellRenderer: ({ rowData }) => h('span', createChildrenCellProps('instanceLabel'), renderHighlightedText(rowData.instanceLabel))
	},
	{
		key: 'isLastRevision',
		dataKey: 'isLastRevision',
		title: '最新修订版',
		width: columnWidths.value.isLastRevision,
		headerCellRenderer: () => createResizableHeader('isLastRevision', '最新修订版'),
		cellRenderer: ({ rowData }) =>
			h('span', createChildrenCellProps('isLastRevision', 'boolean-cell'), [
				h(ElIcon, { color: rowData.isLastRevision ? '#67C23A' : '#F56C6C' }, () => [h(rowData.isLastRevision ? Check : Close)])
			])
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
					...createChildrenCellProps('status', 'status-tag'),
					type: getStatusType(rowData.statusRaw),
					size: 'small',
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
		cellRenderer: ({ rowData }) => h('span', createChildrenCellProps('reserved'), rowData.reserved ? '锁定' : '已解锁')
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
	const columns = childrenTableColumns.value.map(column => {
		const nextColumn = { ...column };
		if (!nextColumn.cellRenderer && typeof nextColumn.dataKey === 'string') {
			nextColumn.cellRenderer = ({ cellData }) =>
				h('span', createChildrenCellProps(String(nextColumn.key)), cellData == null ? '' : String(cellData));
		}
		return nextColumn;
	});
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

const openEnterpriseCodeDialogForSelectedRows = () => {
	if (!selectedChildrenRows.value.length) return;
	const firstRow = selectedChildrenRows.value[0];
	openEnterpriseCodeDialogForChild(firstRow);
};

const findParentNodeByChildId = (nodes: TreeNode[], childId: string, parent?: TreeNode): TreeNode | null => {
	for (const node of nodes) {
		if (node.id === childId) return parent || null;
		const foundParent = findParentNodeByChildId(node.children || [], childId, node);
		if (foundParent) return foundParent;
	}
	return null;
};

const getInstanceQuantityParentPhysicalId = (row: TreeNode) => {
	const parentNode = findParentNodeByChildId(childrenData.value, row.id);
	return parentNode?.resourceid || currentPhysicalId.value;
};

const createInstanceQuantityRow = (source: TreeNode, editable: boolean, index: number): InstanceQuantityRow => ({
	id: editable ? `new-${source.resourceid}-${Date.now()}-${index}` : source.id,
	sourceRowId: source.id,
	relationId: editable ? undefined : source.relationId,
	parentPhysicalId: getInstanceQuantityParentPhysicalId(source),
	childPhysicalId: source.resourceid,
	instanceLabel: editable ? 'New Instance' : source.instanceLabel || `${source.label}.${index + 1}`,
	editable,
	editStatus: editable ? '新建' : '',
	label: source.label,
	partNumber: source.partNumber,
	revision: source.revision,
	isLastRevision: source.isLastRevision,
	status: source.status,
	owner: source.owner,
	reserved: source.reserved,
	modified: source.modified,
	globalType: source.globalType,
	identifier: source.identifier
});

const openInstanceQuantityDialog = () => {
	const selectedRow = selectedChildrenRows.value[0];
	if (!selectedRow) return;
	const sameInstanceRows = flattenChildrenData.value.filter(row => row.resourceid === selectedRow.resourceid);
	const baseRows = sameInstanceRows.map((row, index) => createInstanceQuantityRow(row, false, index));
	instanceQuantitySelectedRow.value = selectedRow;
	instanceQuantityBaseRows.value = baseRows;
	instanceQuantityRows.value = [...baseRows];
	instanceQuantityValue.value = baseRows.length;
	instanceQuantityDialogVisible.value = true;
};

const handleInstanceQuantityValueChange = (value: number | undefined) => {
	const baseCount = instanceQuantityBaseRows.value.length;
	const inputCount = Number(value || baseCount);
	if (inputCount < baseCount) {
		ElMessage.warning('数量不能小于已经有的实例数量');
		instanceQuantityValue.value = baseCount;
		instanceQuantityRows.value = [...instanceQuantityBaseRows.value];
		return;
	}
	const nextCount = inputCount;
	instanceQuantityValue.value = nextCount;
	const rows = [...instanceQuantityBaseRows.value];
	const selectedRow = instanceQuantitySelectedRow.value;
	if (selectedRow) {
		for (let index = rows.length; index < nextCount; index += 1) {
			rows.push(createInstanceQuantityRow(selectedRow, true, index));
		}
	}
	instanceQuantityRows.value = rows;
};

const removeInstanceQuantityRow = (row: InstanceQuantityRow) => {
	if (!row.editable) return;
	instanceQuantityRows.value = instanceQuantityRows.value.filter(item => item.id !== row.id);
	instanceQuantityValue.value = instanceQuantityRows.value.length;
};

const openUnparentDialog = () => {
	if (selectedChildrenRows.value.some(row => !row.relationId)) {
		ElMessage.error('未获取到选中对象的关系ID');
		return;
	}
	unparentReportVisible.value = false;
	unparentSuccessMessages.value = [];
	unparentFailureMessages.value = [];
	unparentSelectedRowsSnapshot.value = [...selectedChildrenRows.value];
	unparentDialogVisible.value = true;
};

const getCatflMessage = (messageKey: string) => {
	const nls = ((navigator.language || '').toLowerCase().startsWith('zh') ? zhCatflNls : enCatflNls) as Record<string, string>;
	return (nls[messageKey] || messageKey).replace(/<br\s*\/?>/gi, '\n');
};

const getRowDisplayName = (row: TreeNode) => `${row.label || row.identifier || row.resourceid} ${row.revision || ''}`.trim();

const isLastVersionValue = (value: unknown) => String(value).toLowerCase() === 'true';

const getLatestVersion = (versions: VersionGraphVersion[]) => versions.find(version => isLastVersionValue(version.isLastVersion));

const handleReplaceLatestRevision = async () => {
	const rows = [...selectedChildrenRows.value];
	if (!rows.length) return;

	const operations = [];
	const ignoredMessages: string[] = [];

	try {
		for (const row of rows) {
			if (!row.resourceid || !row.relationId) {
				ElMessage.error('未获取到选中对象的物理ID或关系ID');
				return;
			}
			const parentPhysicalId = getInstanceQuantityParentPhysicalId(row);
			if (!parentPhysicalId) {
				ElMessage.error('未获取到选中对象的父ID');
				return;
			}
			const versionGraph = await partDetailApi.getVersionGraph(row.resourceid);
			const latestVersion = getLatestVersion(versionGraph.graphs?.[0]?.versions || []);
			if (!latestVersion?.id) {
				ElMessage.warning(`未找到对象 ${getRowDisplayName(row)} 的最新修订版`);
				continue;
			}
			const oldName = getRowDisplayName(row);
			const newName = `${latestVersion.label || row.label || row.identifier || latestVersion.id} ${latestVersion.code || ''}`.trim();
			if (latestVersion.id === row.resourceid) {
				ignoredMessages.push(`替换操作已被忽略，因为对象 ${oldName} 已是最新修订版。`);
				continue;
			}
			operations.push({
				hasParent: parentPhysicalId,
				instance: row.relationId,
				isInstanceOf: latestVersion.id,
				oldName,
				newName
			});
		}

		if (!operations.length) {
			if (ignoredMessages.length) {
				ElMessage.info(ignoredMessages.join('\n'));
			}
			return;
		}

		const response = await partDetailApi.replaceByLatestRevision(operations);
		const successResults = (response.results || []).filter(result => String(result.status).toLowerCase() === 'success');
		replaceReportTitle.value = '替换为最新修订版报告';
		replaceLatestReportMessages.value = successResults.length
			? successResults.map(result => `成功将 ${result.oldName || ''} 替换为 ${result.newName || ''}。`)
			: operations.map(operation => `成功将 ${operation.oldName} 替换为 ${operation.newName}。`);
		replaceLatestReportVisible.value = true;
		selectedChildrenRows.value = [];
		queryModeStore.switchToDbMode();
		if (currentPhysicalId.value) {
			await loadPartDetail(currentPhysicalId.value);
		}
	} catch (error) {
		console.error('[PartDetailView] 替换为最新修订版失败:', error);
		ElMessage.error('替换为最新修订版失败');
	}
};

const handleConfirmUnparent = async () => {
	const selectedRows = unparentSelectedRowsSnapshot.value.length ? unparentSelectedRowsSnapshot.value : selectedChildrenRows.value;
	const instances = selectedRows.map(row => row.relationId).filter((relationId): relationId is string => !!relationId);
	if (!instances.length) {
		ElMessage.error('未获取到选中对象的关系ID');
		return;
	}
	unparentSubmitting.value = true;
	try {
		const response = await partDetailApi.unparentInstances(instances);
		const results: UnparentResponseResult[] = response.results || [];
		const successResults = results.filter(result => String(result.status).toLowerCase() === 'success');
		const failureResults = results.filter(result => String(result.status).toLowerCase() !== 'success');
		if (String(response.status).toLowerCase() === 'success' && !successResults.length) {
			unparentSuccessMessages.value = selectedRows.map(row => `成功拆离 ${row.instanceLabel || row.label || row.relationId || ''}。`);
		} else {
			unparentSuccessMessages.value = successResults.map((result, index) => {
				const row = selectedRows.find(item => item.relationId === result.instance) || selectedRows[index];
				const parentName = result.parent || partInfo.value?.['ds6w:label'] || partInfo.value?.['ds6w:identifier'] || '父对象';
				const instanceName = result.instanceName || row?.instanceLabel || row?.label || result.instance || result.child || '实例';
				return `成功从 ${parentName} 拆离 ${instanceName}。`;
			});
		}
		unparentFailureMessages.value = failureResults.map(result => {
			const messages = result.messages?.map(getCatflMessage).join('；') || '拆离失败';
			return `${result.instance || ''} ${messages}`.trim();
		});
		unparentReportVisible.value = true;
		if (response.status === 'success' || unparentSuccessMessages.value.length) {
			selectedChildrenRows.value = [];
			queryModeStore.switchToDbMode();
			if (currentPhysicalId.value) {
				await loadPartDetail(currentPhysicalId.value);
			}
		}
	} catch (error) {
		console.error('[PartDetailView] 拆离失败:', error);
		unparentFailureMessages.value = ['拆离失败'];
		unparentReportVisible.value = true;
	} finally {
		unparentSubmitting.value = false;
	}
};

const openReplaceRevisionDialog = () => {
	const rows = [...selectedChildrenRows.value];
	if (!rows.length) {
		ElMessage.warning('请先选择要替换的行');
		return;
	}
	for (const row of rows) {
		if (!row.resourceid || !row.relationId) {
			ElMessage.error('未获取到选中对象的物理ID或关系ID');
			return;
		}
	}
	replaceRevisionSelectedRows.value = rows;
	replaceRevisionDialogVisible.value = true;
};

const handleReplaceRevisionConfirm = async (
	operations: Array<{ hasParent: string; instance: string; isInstanceOf: string; oldName: string; newName: string }>
) => {
	try {
		const response = await partDetailApi.replaceByLatestRevision(operations);
		const successResults = (response.results || []).filter(result => String(result.status).toLowerCase() === 'success');
		replaceReportTitle.value = '替换为修订版报告';
		replaceLatestReportMessages.value = successResults.length
			? successResults.map(result => `成功将 ${result.oldName || ''} 替换为 ${result.newName || ''}。`)
			: operations.map(op => `成功将 ${op.oldName} 替换为 ${op.newName}。`);
		replaceRevisionDialogVisible.value = false;
		replaceLatestReportVisible.value = true;
		selectedChildrenRows.value = [];
		queryModeStore.switchToDbMode();
		if (currentPhysicalId.value) {
			await loadPartDetail(currentPhysicalId.value);
		}
	} catch (error) {
		console.error('[PartDetailView] 替换为修订版失败:', error);
		ElMessage.error('替换为修订版失败');
	}
};

const handleSelectedActionCommand = (command: SelectedActionCommand) => {
	switch (command) {
		case 'openSelectedPart':
			handleOpenSelectedPartDetail();
			break;
		case 'setEnterpriseCode':
			openEnterpriseCodeDialogForSelectedRows();
			break;
		case 'instanceQuantity':
			openInstanceQuantityDialog();
			break;
		case 'replaceLatest':
			handleReplaceLatestRevision();
			break;
		case 'replaceExisting':
			openReplaceExistingProductDialog();
			break;
		case 'replaceRevision':
			openReplaceRevisionDialog();
			break;
		case 'replaceDuplicate':
			openReplaceDuplicateDialog();
			break;
		case 'unparent':
			openUnparentDialog();
			break;
		default:
			ElMessage.info('替换功能接口后续接入');
			break;
	}
};

const handleOpenSelectedPartDetail = async () => {
	const selectedRow = selectedChildrenRows.value[0];
	const targetPhysicalId = selectedRow?.resourceid;
	if (!targetPhysicalId) {
		ElMessage.error('未获取到选中零件的物理ID');
		return;
	}
	if (currentPhysicalId.value && currentPhysicalId.value !== targetPhysicalId) {
		partDetailNavigationStack.value.push(currentPhysicalId.value);
	}
	selectedChildrenRows.value = [];
	await loadPartDetail(targetPhysicalId);
};

const handleConfirmInstanceQuantity = async () => {
	if (instanceQuantityValue.value < instanceQuantityBaseRows.value.length) {
		ElMessage.warning('数量不能小于已经有的实例数量');
		instanceQuantityValue.value = instanceQuantityBaseRows.value.length;
		return;
	}
	handleInstanceQuantityValueChange(instanceQuantityValue.value);
	const newRows = instanceQuantityRows.value.filter(row => row.editable);
	if (!newRows.length) {
		instanceQuantityDialogVisible.value = false;
		return;
	}
	const relationId = instanceQuantityBaseRows.value[0]?.relationId || instanceQuantitySelectedRow.value?.relationId;
	if (!relationId) {
		ElMessage.error('未获取到选中对象和父对象的关系ID');
		return;
	}

	instanceQuantitySubmitting.value = true;
	try {
		const operations = newRows.map((row, index) => {
			if (index === 0) {
				return {
					parent: {
						isInstanceOf: row.parentPhysicalId,
						children: [relationId],
						cacheId: 0
					},
					child: {
						isInstanceOf: row.childPhysicalId,
						cacheId: 0
					}
				};
			}
			return {
				parent: {
					cacheId: 0
				},
				child: {
					cacheId: 0
				}
			};
		});
		console.log('[PartDetailView] 更新实例数量 operations:', operations);
		await partDetailApi.updateInstanceQuantity(operations);
		ElMessage.success('实例数量已更新');
		instanceQuantityDialogVisible.value = false;
		await switchToDbModeAndRefresh();
	} catch (error) {
		console.error('[PartDetailView] 更新实例数量失败:', error);
		ElMessage.error('更新实例数量失败');
	} finally {
		instanceQuantitySubmitting.value = false;
	}
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

const isTreeReorderPartRow = (row: TreeNode) =>
	((row as any)['ds6w:globalType'] === 'ds6w:Part' || (row as any).typeDisplayName === 'ds6w:Part') && !!row.relationId;

const toTreeReorderRows = (rows: TreeNode[]): TreeReorderRow[] =>
	rows.filter(isTreeReorderPartRow).map((row, index) => ({
		id: row.id || row.relationId || `${row.resourceid}-${index}`,
		relationId: row.relationId || '',
		resourceid: row.resourceid,
		title: row.label || row.instanceLabel || row.identifier || '-',
		owner: row.owner || '-',
		created: (row as any).created || '-',
		modified: row.modified || '-',
		source: row
	}));

const getTreeReorderChildren = async (parentRow: TreeNode | null): Promise<TreeNode[]> => {
	if (!parentRow) return childrenData.value;
	if (parentRow.children?.length) return parentRow.children;
	setRowExpanding(parentRow, true);
	try {
		return await new Promise<TreeNode[]>(resolve => {
			loadChildren(parentRow, null, childData => resolve(childData));
		});
	} finally {
		setRowExpanding(parentRow, false);
	}
};

const openTreeReorderDialog = async () => {
	if (!canOpenTreeReorder.value) return;
	const parentRow = selectedChildrenRows.value[0] || null;
	const parentPhysicalId = parentRow?.resourceid || currentPhysicalId.value;
	if (!parentPhysicalId) {
		ElMessage.error('未获取到排序父节点的物理ID');
		return;
	}

	treeReorderDialogVisible.value = true;
	treeReorderLoading.value = true;
	treeReorderParentRow.value = parentRow;
	treeReorderParentPhysicalId.value = parentPhysicalId;
	treeReorderSelectedRowIds.value = [];
	try {
		const sourceRows = await getTreeReorderChildren(parentRow);
		const rows = toTreeReorderRows(sourceRows);
		treeReorderRows.value = rows;
		treeReorderOriginalRows.value = rows.map(row => ({ ...row }));
		treeReorderSelectedRowIds.value = rows[0]?.id ? [rows[0].id] : [];
	} catch (error) {
		console.error('[PartDetailView] 打开树重新排序失败:', error);
		ElMessage.error('打开树重新排序失败');
	} finally {
		treeReorderLoading.value = false;
	}
};

const closeTreeReorderDialog = () => {
	treeReorderDialogVisible.value = false;
};

const isTreeReorderRowSelected = (rowId: string) => treeReorderSelectedRowIds.value.includes(rowId);

const handleTreeReorderRowClick = (event: MouseEvent, rowId: string) => {
	if (event.ctrlKey) {
		treeReorderSelectedRowIds.value = isTreeReorderRowSelected(rowId)
			? treeReorderSelectedRowIds.value.filter(id => id !== rowId)
			: [...treeReorderSelectedRowIds.value, rowId];
		return;
	}
	treeReorderSelectedRowIds.value = [rowId];
};

const moveTreeReorderRow = (direction: -1 | 1) => {
	const rows = [...treeReorderRows.value];
	const selectedIdSet = new Set(treeReorderSelectedRowIds.value);
	const indexes = direction < 0 ? treeReorderSelectedIndexes.value : [...treeReorderSelectedIndexes.value].reverse();
	if (!indexes.length) return;
	if (direction < 0 && indexes[0] === 0) return;
	if (direction > 0 && indexes[0] === rows.length - 1) return;
	for (const currentIndex of indexes) {
		const targetIndex = currentIndex + direction;
		if (targetIndex < 0 || targetIndex >= rows.length || selectedIdSet.has(rows[targetIndex].id)) continue;
		const [currentRow] = rows.splice(currentIndex, 1);
		rows.splice(targetIndex, 0, currentRow);
	}
	treeReorderRows.value = rows;
};

const resetTreeReorder = () => {
	treeReorderRows.value = treeReorderOriginalRows.value.map(row => ({ ...row }));
	treeReorderSelectedRowIds.value = treeReorderRows.value[0]?.id ? [treeReorderRows.value[0].id] : [];
};

const applyTreeReorderToSourceChildren = (sourceChildren: TreeNode[], reorderedPartRows: TreeReorderRow[]) => {
	const reorderedParts = [...reorderedPartRows.map(row => row.source)];
	return sourceChildren.map(row => (isTreeReorderPartRow(row) ? reorderedParts.shift() || row : row));
};

const getTreeReorderFailureMessage = (response: { status?: string; messages?: string[] }) => {
	if (String(response.status).toLowerCase() !== 'failure' && !response.messages?.length) return '';
	return (response.messages || [])
		.map(message => (message.startsWith('ERR_') ? getCatflNlsMessage(message) : message))
		.join('\n')
		.replace(/<br>/g, '\n');
};

const confirmTreeReorder = async () => {
	if (!treeReorderParentPhysicalId.value) {
		ElMessage.error('未获取到排序父节点的物理ID');
		return;
	}
	try {
		treeReorderSubmitting.value = true;
		const childIds = treeReorderRows.value.map(row => row.relationId).filter(Boolean);
		const response = await partDetailApi.reorderTree(treeReorderParentPhysicalId.value, childIds);
		if (String(response.status).toLowerCase() === 'success') {
			ElMessage.success(response.message || '树重新排序成功');
			if (treeReorderParentRow.value) {
				treeReorderParentRow.value.children = applyTreeReorderToSourceChildren(treeReorderParentRow.value.children || [], treeReorderRows.value);
			} else {
				childrenData.value = applyTreeReorderToSourceChildren(childrenData.value, treeReorderRows.value);
			}
			closeTreeReorderDialog();
			return;
		}
		const failureMessage = getTreeReorderFailureMessage(response) || '树重新排序失败';
		showReplaceFailureMessage(failureMessage);
	} catch (error: any) {
		const failureMessage = getTreeReorderFailureMessage(error) || '树重新排序失败';
		showReplaceFailureMessage(failureMessage);
	} finally {
		treeReorderSubmitting.value = false;
	}
};

const toggleTreeReorderMaximize = () => {
	treeReorderDialogMaximized.value = !treeReorderDialogMaximized.value;
};

const startTreeReorderDrag = (event: MouseEvent) => {
	if (treeReorderDialogMaximized.value) return;
	event.preventDefault();
	const startX = event.clientX;
	const startY = event.clientY;
	const startLeft = treeReorderDialogPosition.value.left;
	const startTop = treeReorderDialogPosition.value.top;
	const handleMouseMove = (moveEvent: MouseEvent) => {
		treeReorderDialogPosition.value = {
			left: Math.max(0, startLeft + moveEvent.clientX - startX),
			top: Math.max(0, startTop + moveEvent.clientY - startY)
		};
	};
	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);
};

const startTreeReorderResize = (event: MouseEvent) => {
	if (treeReorderDialogMaximized.value) return;
	event.preventDefault();
	event.stopPropagation();
	const startX = event.clientX;
	const startY = event.clientY;
	const startWidth = treeReorderDialogSize.value.width;
	const startHeight = treeReorderDialogSize.value.height;
	const handleMouseMove = (moveEvent: MouseEvent) => {
		treeReorderDialogSize.value = {
			width: Math.max(640, startWidth + moveEvent.clientX - startX),
			height: Math.max(360, startHeight + moveEvent.clientY - startY)
		};
	};
	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);
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
	if (isFlatStructureView.value) return;
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
 * 处理结构视图菜单命令
 */
const handleStructureViewCommand = async (command: string) => {
	console.log('[PartDetailView] 结构视图命令:', command);
	structureViewActive.value = true;

	switch (command) {
		case 'indented':
			await handleIndentedStructureView();
			break;
		case 'flat':
			await handleFlatStructureView();
			break;
		case 'leaf':
			ElMessage.info('切换到产品叶视图');
			// TODO: 实现产品叶视图逻辑
			break;
		case 'material':
			ElMessage.info('切换到产品原材料视图');
			// TODO: 实现产品原材料视图逻辑
			break;
	}
};

const handleIndentedStructureView = async () => {
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) {
		ElMessage.warning('当前没有加载零件');
		return;
	}

	structureViewMode.value = 'indented';
	selectedChildrenRows.value = [];
	expandingRowIds.value = new Set();
	await loadExpandData(rootPhysicalId);
	ElMessage.success('已切换到缩进的产品结构视图');
};

const handleFlatStructureView = async () => {
	const rootPhysicalId = currentPhysicalId.value;
	if (!rootPhysicalId) {
		ElMessage.warning('当前没有加载零件');
		return;
	}

	childrenLoading.value = true;
	try {
		structureViewMode.value = 'flat';
		selectedChildrenRows.value = [];
		expandingRowIds.value = new Set();
		const response = await expandApi.getFlatExpandData(rootPhysicalId);
		childrenData.value = expandApi.parseFlatExpandData(response, rootPhysicalId);
		ElMessage.success('已切换到扁平产品结构视图');
	} catch (error) {
		console.error('[PartDetailView] 切换扁平产品结构视图失败:', error);
		ElMessage.error('切换扁平产品结构视图失败');
	} finally {
		childrenLoading.value = false;
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

const buildFindUql = (keyword: string) => {
	const escapedKeyword = keyword.replace(/"/g, '\\"');
	return [
		`ds6w_58_label:*${escapedKeyword}*`,
		`ds6wg_58_enterpriseextension_46_v_95_partnumber:*${escapedKeyword}*`,
		`ds6wg_58_revision:*${escapedKeyword}*`,
		`ds6w_58_islastrevision:*${escapedKeyword}*`,
		`ds6w_58_status:*${escapedKeyword}*`,
		`ds6w_58_responsible:*${escapedKeyword}*`,
		`ds6w_58_type:*${escapedKeyword}*`,
		`ds6w_58_identifier:*${escapedKeyword}*`
	].join(' OR ');
};

const buildFindInStructureParams = (rootPhysicalId: string, keyword: string) => {
	const uql = buildFindUql(keyword);
	return {
		batch: {
			expands: [
				{
					filter: {
						and: {
							filters: [
								{
									prefix_filter: {
										prefix_path: [{ physical_id_path: [rootPhysicalId] }]
									}
								},
								{
									sequence_filter: {
										sequence: [{ uql }]
									}
								}
							]
						}
					},
					root: { physical_id: rootPhysicalId },
					graph: {
						descending_condition_relation: {
							uql: 'NOT (flattenedtaxonomies:"reltypes/XCADBaseDependency") AND ((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance"))'
						},
						descending_condition_object: {
							uql: 'ds6w_58_globaltype:"ds6w:Document" OR ds6w_58_globaltype:"ds6w:Part"'
						}
					},
					aggregation_processors: [{ truncate: { sequence_filter: { sequence: [{ uql }] } } }],
					label: `FindInCtxFTS-xEngineer-${baseInfoStore.currentUser || 'USER'}-${Date.now()}`,
					parameters: { limit_max_path: 301 }
				}
			]
		},
		outputs: {
			select_object: [
				'ds6w:label',
				'ds6w:modified',
				'ds6w:created',
				'ds6w:description',
				'ds6wg:revision',
				'ds6w:cadMaster',
				'ds6w:responsible',
				'owner',
				'ds6w:status',
				'ds6w:type',
				'ds6wg:EnterpriseExtension.V_PartNumber',
				'type',
				'physicalid',
				'ds6w:policy',
				'ds6w:reservedBy',
				'ds6w:globalType',
				'ds6w:manufacturable',
				'pathsr',
				'ds6w:isLastRevision',
				'ds6w:reserved',
				'ds6w:identifier'
			],
			select_relation: ['ds6w:label', 'ds6w:type', 'physicalid', 'ro.plminstance.V_treeorder', 'ds6w:reservedBy'],
			hits: { predefined_computation: ['icons', 'urlstream|thumbnail_2d|2dthb|allrefs'] },
			format: 'entity_relation_occurrence'
		}
	};
};

const positionFindPanelByButton = () => {
	const rect = findButtonRef.value?.getBoundingClientRect();
	if (!rect) return;
	const panelWidth = 360;
	findPanelPosition.value = {
		left: Math.max(8, rect.left + rect.width / 2 - panelWidth / 2),
		top: rect.bottom + 50
	};
};

const toggleFindPanel = async () => {
	if (!findPopoverVisible.value) {
		positionFindPanelByButton();
	}
	findPopoverVisible.value = !findPopoverVisible.value;
	await nextTick();
};

const startFindPanelDrag = (event: MouseEvent) => {
	const startX = event.clientX;
	const startY = event.clientY;
	const startLeft = findPanelPosition.value.left;
	const startTop = findPanelPosition.value.top;
	const handleMouseMove = (moveEvent: MouseEvent) => {
		findPanelPosition.value = {
			left: startLeft + moveEvent.clientX - startX,
			top: startTop + moveEvent.clientY - startY
		};
	};
	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);
};

const getPathTargetPhysicalIds = (response: { results?: Array<unknown> }) =>
	(response.results || [])
		.filter((item): item is { Path: string[] } => !!item && typeof item === 'object' && Array.isArray((item as { Path?: unknown }).Path))
		.map(item => item.Path[item.Path.length - 1])
		.filter((id): id is string => !!id);

const expandSearchTreeNodes = (nodes: TreeNode[]) => {
	nodes.forEach(node => {
		if (node.children?.length) {
			node.isExpanded = true;
			expandSearchTreeNodes(node.children);
		}
	});
};

const mergeSearchTreeNodes = (currentNodes: TreeNode[], searchNodes: TreeNode[]) => {
	searchNodes.forEach(searchNode => {
		const existingNode = currentNodes.find(node => node.id === searchNode.id || node.relationId === searchNode.relationId);
		if (!existingNode) {
			currentNodes.push(searchNode);
			return;
		}
		existingNode.hasChildren = existingNode.hasChildren || searchNode.hasChildren;
		if (searchNode.children?.length) {
			existingNode.isExpanded = true;
			mergeSearchTreeNodes(existingNode.children || (existingNode.children = []), searchNode.children);
		}
	});
};

const rowContainsFindKeyword = (row: TreeNode, keyword: string) => {
	const normalizedKeyword = keyword.toLowerCase();
	return [row.label, row.instanceLabel].some(value =>
		String(value || '')
			.toLowerCase()
			.includes(normalizedKeyword)
	);
};

const scrollToFindResult = async (index: number) => {
	await nextTick();
	const rowId = findMatchedRowIds.value[index];
	const rowIndex = flattenChildrenData.value.findIndex(row => row.id === rowId);
	if (rowIndex < 0) return;
	tableRef.value?.scrollToRow?.(rowIndex, 'center');
};

const setFindResults = async (keyword: string, targetPhysicalIds: string[]) => {
	findActiveKeyword.value = keyword;
	await nextTick();
	findMatchedRowIds.value = flattenChildrenData.value
		.filter(row => targetPhysicalIds.includes(row.resourceid) || rowContainsFindKeyword(row, keyword))
		.map(row => row.id);
	findCurrentIndex.value = findMatchedRowIds.value.length ? 0 : -1;
	if (findCurrentIndex.value >= 0) {
		await scrollToFindResult(findCurrentIndex.value);
	}
};

const handleFindInStructure = async () => {
	const keyword = findKeyword.value.trim();
	const rootPhysicalId = currentPhysicalId.value;
	if (!keyword) {
		ElMessage.warning('请输入查找内容');
		return;
	}
	if (!rootPhysicalId) {
		ElMessage.error('未获取到根节点物理ID');
		return;
	}

	findLoading.value = true;
	try {
		const response = await expandApi.expandWithParams(buildFindInStructureParams(rootPhysicalId, keyword));
		const targetPhysicalIds = getPathTargetPhysicalIds(response);
		if (!response.results?.length || !targetPhysicalIds.length) {
			findActiveKeyword.value = '';
			findMatchedRowIds.value = [];
			findCurrentIndex.value = -1;
			ElMessage.warning('未找到任何选定对象的匹配项');
			return;
		}
		const searchTreeNodes = expandApi.parseExpandDataRecursive(response, rootPhysicalId, [rootPhysicalId]);
		expandSearchTreeNodes(searchTreeNodes);
		mergeSearchTreeNodes(childrenData.value, searchTreeNodes);
		await setFindResults(keyword, targetPhysicalIds);
	} catch (error) {
		console.error('[PartDetailView] 查找失败:', error);
		ElMessage.error('查找失败');
	} finally {
		findLoading.value = false;
	}
};

const goToPreviousFindResult = async () => {
	if (!findMatchedRowIds.value.length) return;
	findCurrentIndex.value = findCurrentIndex.value <= 0 ? findMatchedRowIds.value.length - 1 : findCurrentIndex.value - 1;
	await scrollToFindResult(findCurrentIndex.value);
};

const goToNextFindResult = async () => {
	if (!findMatchedRowIds.value.length) return;
	findCurrentIndex.value = findCurrentIndex.value >= findMatchedRowIds.value.length - 1 ? 0 : findCurrentIndex.value + 1;
	await scrollToFindResult(findCurrentIndex.value);
};

const selectAllFindResults = () => {
	if (!findMatchedRowIds.value.length) return;
	const matchedIds = new Set(findMatchedRowIds.value);
	selectedChildrenRows.value = flattenChildrenData.value.filter(row => matchedIds.has(row.id));
};

const closeFindPopover = () => {
	findPopoverVisible.value = false;
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
	const selectedRows = [...selectedChildrenRows.value];
	console.log('[PartDetailView] 全部折叠, 选中行数:', selectedRows.length);

	// 递归折叠节点
	const collapseNodes = (nodes: TreeNode[]) => {
		nodes.forEach(node => {
			node.isExpanded = false;
			if (node.children?.length) {
				collapseNodes(node.children);
			}
		});
	};

	if (selectedRows.length > 0) {
		// 有勾选行时，只折叠勾选行的子结构
		selectedRows.forEach(row => {
			row.isExpanded = false;
			if (row.children?.length) {
				collapseNodes(row.children);
			}
		});
	} else {
		// 未勾选时，折叠所有节点
		collapseNodes(childrenData.value);
	}

	// 清空展开状态集合
	expandingRowIds.value = new Set();

	ElMessage.success('折叠成功');
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

const handlePartDetailPrevious = async () => {
	const previousPhysicalId = partDetailNavigationStack.value.pop();
	if (!previousPhysicalId) return;
	selectedChildrenRows.value = [];
	await loadPartDetail(previousPhysicalId);
};

const handleUpdateEntireStructureRevision = async () => {
	const rootPhysicalId = currentPhysicalId.value || partInfo.value?.physicalid || partInfo.value?.resourceid;
	if (!rootPhysicalId) {
		ElMessage.error('未获取到根节点物理ID');
		return;
	}
	if (updateEntireStructureRevisionLoading.value) return;

	updateEntireStructureRevisionLoading.value = true;
	try {
		const response = await partDetailApi.getUpdateEntireStructureRevisionOperations(rootPhysicalId);
		updateEntireStructureRevisionConfirmations.value = response.operations?.confirmations || [];
		updateEntireStructureRevisionReplaceList.value = (response.operations?.replaceList || []) as ReplaceByLatestRevisionOperation[];
		updateEntireStructureRevisionDialogVisible.value = true;
	} catch (error) {
		console.error('[PartDetailView] 获取更新整个结构修订版操作失败:', error);
		ElMessage.error('获取更新整个结构修订版操作失败');
	} finally {
		updateEntireStructureRevisionLoading.value = false;
	}
};

const handleConfirmUpdateEntireStructureRevision = async () => {
	const operations = updateEntireStructureRevisionReplaceList.value;
	if (!operations.length) {
		updateEntireStructureRevisionDialogVisible.value = false;
		return;
	}

	updateEntireStructureRevisionLoading.value = true;
	try {
		const response = await partDetailApi.replaceByLatestRevision(operations);
		if (String(response.status).toLowerCase() !== 'success') {
			ElMessage.error(getInsertExistingFailureMessage(response) || '更新整个结构的修订版失败');
			return;
		}

		const successResults = response.results?.filter(result => String(result.status).toLowerCase() === 'success') || [];
		replaceReportTitle.value = '更新整个结构的修订版报告';
		replaceLatestReportMessages.value = successResults.length
			? successResults.map(result => `成功将 ${result.oldName || ''} 替换为 ${result.newName || ''}。`)
			: operations.map(operation => `成功将 ${operation.oldName || ''} 替换为 ${operation.newName || ''}。`);
		updateEntireStructureRevisionDialogVisible.value = false;
		replaceLatestReportVisible.value = true;
		queryModeStore.switchToDbMode();
		if (currentPhysicalId.value) {
			await loadPartDetail(currentPhysicalId.value);
		}
	} catch (error) {
		console.error('[PartDetailView] 更新整个结构的修订版失败:', error);
		ElMessage.error('更新整个结构的修订版失败');
	} finally {
		updateEntireStructureRevisionLoading.value = false;
	}
};

const handleHeaderActionCommand = async (command: string) => {
	if (command === 'updateRevisionAll') {
		await handleUpdateEntireStructureRevision();
		return;
	}
	if (command === 'updateRevision') {
		updateRevisionDialogVisible.value = true;
		return;
	}
	console.log('[PartDetailView] header action command:', command);
};

const getCatflNlsMessage = (key: string) => {
	const language = localStorage.getItem('language') || navigator.language || '';
	const messages = language.toLowerCase().startsWith('en') ? catflNlsEn : catflNlsZh;
	return (messages as Record<string, string>)[key] || key;
};

const getReplaceFailureMessage = (response: { status?: string; results?: Array<{ status?: string; oldName?: string; messages?: string[] }> }) => {
	const failedResults = (response.results || []).filter(result => String(result.status).toLowerCase() === 'failure');
	if (String(response.status).toLowerCase() !== 'failure' && !failedResults.length) return '';
	return failedResults
		.map(result => {
			const errorCode = result.messages?.find(message => /^ERR_/.test(message));
			const message = errorCode ? getCatflNlsMessage(errorCode).replace(/<br>/g, '\n') : result.messages?.join('\n') || '替换失败';
			return `${result.oldName || ''}: ${message}`.trim();
		})
		.join('\n');
};

const showReplaceFailureMessage = (message: string) => {
	ElMessage({
		type: 'error',
		dangerouslyUseHTMLString: true,
		duration: 12000,
		showClose: true,
		message: message
			.split('\n')
			.filter(Boolean)
			.map(line => `<div>${line}</div>`)
			.join('')
	});
};

const OPEN_WITH_APP_ID: Record<string, string> = {
	'3D Markup': 'ENOR3D_AP',
	'3D Navigate': 'ENXDISC_AP',
	'3DPlay': 'X3DPLAW_AP'
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

const pickOpenWithField = (row: any, ...keys: string[]): string => {
	for (const key of keys) {
		const value = row?.[key];
		if (value !== undefined && value !== null && value !== '') return String(value);
	}
	return '';
};

const buildOpenWithPayload = (row: any) => {
	const objectId = pickOpenWithField(row, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	const objectType = pickOpenWithField(row, 'ds6w:type', 'type', 'objectType', 'displayType') || 'VPMReference';
	const displayName = pickOpenWithField(row, 'ds6w:label', 'label', 'displayName', 'name', 'title') || objectId;

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

const openWithHashJump = (appName: string, row: any) => {
	const appId = OPEN_WITH_APP_ID[appName];
	if (!appId) {
		ElMessage.warning(`未知的打开方式：${appName}`);
		return;
	}
	const objectId = pickOpenWithField(row, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	if (!objectId) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	const encoded = encodeURIComponent(JSON.stringify(buildOpenWithPayload(row)));
	const hashSuffix = `/app:${appId}/content:X3DContentId=${encoded}`;
	try {
		const topWindow: any = window.top || window.parent || window;
		const currentHash = topWindow.location.hash || '';
		const baseHash = currentHash.replace(/\/app:[^/]+(?:\/content:[^]*)?$/, '');
		topWindow.location.hash = (baseHash || '#/tabId:New%20Tab') + hashSuffix;
	} catch {
		(window.top || window).location.href = `${window.location.origin}/3ddashboard/#/tabId:New%20Tab${hashSuffix}`;
	}
};

const openNativeCompass = (row: any) => {
	const objectId = pickOpenWithField(row, 'resourceid', 'physicalid', 'physicalId', 'id', 'objectId', 'ds6w:identifier');
	if (!objectId) {
		ElMessage.error('无法获取对象 physicalid');
		return;
	}

	try {
		const topWindow: any = window.top || window.parent || window;
		const ctx = topWindow.requirejs?.s?.contexts?._ || topWindow.require?.s?.contexts?._;
		const X3DContent = ctx?.defined?.['DS/i3DXCompass/X3DContent'];
		const CompassManager = ctx?.defined?.['DS/Dashboard/CompassManager'];
		if (X3DContent?.setX3DContent) X3DContent.setX3DContent(buildOpenWithPayload(row));
		if (CompassManager?.open) CompassManager.open();
		else topWindow.document.querySelector('.compass-small')?.click();
	} catch (error) {
		console.warn('[PartDetailView] 打开更多应用程序失败:', error);
		ElMessage.warning('打开更多应用程序失败，请在 3DDashboard 中重试');
	}
};

const handleOpenWith = (appName: string, row: any) => {
	if (appName === 'more') openNativeCompass(row);
	else openWithHashJump(appName, row);
	document.body.click();
};

const buildRootOpenWithRow = () => ({
	...partInfo.value,
	resourceid: currentPhysicalId.value || (partInfo.value as any)?.physicalid || partInfo.value?.['ds6w:identifier'],
	physicalid: currentPhysicalId.value || (partInfo.value as any)?.physicalid || partInfo.value?.['ds6w:identifier']
});

const handleRootOpenWith = (appName: string) => {
	if (!partInfo.value || !currentPhysicalId.value) {
		ElMessage.error('未获取到当前零件信息');
		return;
	}
	handleOpenWith(appName, buildRootOpenWithRow());
};

const handleSelectedOpenWith = (appName: string) => {
	const selectedRow = selectedChildrenRows.value[0];
	if (!selectedRow) {
		ElMessage.warning('请先选择一个对象');
		return;
	}
	handleOpenWith(appName, selectedRow);
};

const handleUpdateRevisionConfirm = async (operations: UpdateRevisionOperation[]) => {
	try {
		updateRevisionSubmitting.value = true;
		const reportMessages: string[] = [];
		const newRevisionOps = operations.filter(op => op.action === 'newRevision');
		const replaceNewRevisionOps = operations.filter(op => op.action === 'replaceNewRevision');
		const replaceOps = operations.filter(op => op.action === 'replace');

		// 1. 批量新建修订版（newRevision + replaceNewRevision 合并一个请求）
		const allAddOps = [...newRevisionOps, ...replaceNewRevisionOps];
		let addResults: Array<{ copyId: string; id?: string; revision?: string; code?: string; status?: string; [key: string]: unknown }> = [];
		if (allAddOps.length) {
			const addIds = allAddOps.map(op => op.physicalId);
			const addResp = await partDetailApi.addVersions(addIds);
			console.log('[PartDetailView] 批量新建修订版响应:', addResp);
			addResults = addResp.addRequests || [];
			for (const op of allAddOps) {
				const addResult = addResults.find(r => r.copyId === op.physicalId);
				const newRevision = addResult?.revision || addResult?.code || op.newName.split(' ').pop() || '';
				const label = op.oldName.split(' ')[0] || '';
				reportMessages.push(`已成功从 ${op.oldName} 创建新修订版 ${label} ${newRevision}。`);
			}
		}

		// 2. 批量替换（replaceNewRevision 用 addResult.id + 普通 replace 合并一个请求）
		const allReplaceParams: Array<{ hasParent: string; instance: string; isInstanceOf: string; oldName: string; newName: string }> = [];
		for (const op of replaceNewRevisionOps) {
			const addResult = addResults.find(r => r.copyId === op.physicalId);
			console.log('[PartDetailView] 替换为新修订版匹配:', op.physicalId, addResult);
			if (addResult?.id) {
				allReplaceParams.push({
					hasParent: op.hasParent,
					instance: op.instance,
					isInstanceOf: addResult.id,
					oldName: op.oldName,
					newName: op.newName
				});
			}
		}
		for (const op of replaceOps) {
			allReplaceParams.push({
				hasParent: op.hasParent,
				instance: op.instance,
				isInstanceOf: op.isInstanceOf,
				oldName: op.oldName,
				newName: op.newName
			});
		}
		if (allReplaceParams.length) {
			const replaceResp = await partDetailApi.replaceByLatestRevision(allReplaceParams);
			console.log('[PartDetailView] 批量替换修订版响应:', replaceResp);
			const failureMessage = getReplaceFailureMessage(replaceResp);
			if (failureMessage) {
				showReplaceFailureMessage(failureMessage);
				const detailError = new Error(failureMessage) as Error & { detailShown?: boolean };
				detailError.detailShown = true;
				throw detailError;
			}
			for (const op of allReplaceParams) {
				reportMessages.push(`成功将 ${op.oldName} 替换为 ${op.newName}。`);
			}
		}

		replaceReportTitle.value = '更新修订版报告';
		replaceLatestReportMessages.value = reportMessages;
		updateRevisionDialogVisible.value = false;
		replaceLatestReportVisible.value = true;
		selectedChildrenRows.value = [];
		queryModeStore.switchToDbMode();
		if (currentPhysicalId.value) {
			await loadPartDetail(currentPhysicalId.value);
		}
	} catch (error) {
		console.error('[PartDetailView] 更新修订版失败:', error);
		if (!(error as Error & { detailShown?: boolean })?.detailShown) {
			ElMessage.error('更新修订版失败');
		}
	} finally {
		updateRevisionSubmitting.value = false;
	}
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
			gap: 2px;

			.header-action-dropdown-btn,
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

			.header-action-dropdown-btn {
				width: 18px;
				height: 24px;
				padding: 4px 2px;
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

				.back-icon,
				.previous-part-icon {
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
			gap: 10px;
			width: 100%;
			min-width: 0;
			padding-right: 108px;
			box-sizing: border-box;
			font-size: 14px;
			color: #303133;
		}

		.summary-home-icon,
		.summary-previous-icon {
			flex: 0 0 auto;
			color: #b8bec6;
			font-size: 18px;
			cursor: pointer;

			&:hover {
				color: #409eff;
			}
		}

		.summary-thumbnail {
			flex: 0 0 auto;
			width: 38px;
			height: 28.5px;
			object-fit: contain;
		}

		.summary-main {
			display: inline-flex;
			flex: 0 1 auto;
			align-items: center;
			gap: 4px;
			min-width: 90px;
			max-width: 220px;
			overflow: hidden;
		}

		.summary-title {
			overflow: hidden;
			color: #303133;
			font-weight: 600;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.summary-field {
			display: inline-flex;
			flex: 0 1 auto;
			align-items: center;
			gap: 2px;
			min-width: 0;
			white-space: nowrap;
		}

		.summary-label {
			flex: 0 0 auto;
			color: #606266;
		}

		.summary-value {
			max-width: 120px;
			overflow: hidden;
			color: #303133;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.summary-dropdown-icon {
			color: #909399;
			font-size: 13px;
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
			min-height: 48px;
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

				.selected-actions-wrap {
					display: inline-flex;
					align-items: center;
					gap: 10px;
					width: 61px;
					visibility: hidden;
					pointer-events: none;
				}

				.selected-actions-wrap.is-visible {
					visibility: visible;
					pointer-events: auto;
				}

				.selected-actions-trigger {
					position: relative;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 50px;
					height: 28px;
					color: #5f6b7a;
					cursor: pointer;
				}

				.selected-actions-trigger:hover {
					color: #2f6fab;
				}

				.selected-actions-arrow {
					margin-left: 2px;
					color: #1684d8;
					font-size: 15px;
				}

				.selected-actions-count {
					position: absolute;
					right: 8px;
					bottom: -2px;
					min-width: 12px;
					color: #2f6fab;
					font-size: 12px;
					line-height: 12px;
					text-align: center;
				}

				.toolbar-divider {
					width: 1px;
					height: 24px;
					background-color: #dcdfe6;
				}

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

				.toolbar-copy-tooltip-wrapper {
					display: inline-flex;
				}

				.toolbar-copy-action {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 26px;
					height: 24px;
					padding: 0;
					border: 1px solid #dcdfe6;
					border-radius: 6px;
					background: #f5f7fa;
					color: #a8abb2;
					font-size: 15px;
					line-height: 1;
					cursor: not-allowed;
					transition:
						background-color 0.15s ease,
						border-color 0.15s ease,
						color 0.15s ease,
						box-shadow 0.15s ease;
				}

				.toolbar-copy-action.is-enabled {
					background: #ecf5ff;
					border-color: #409eff;
					color: #409eff;
					cursor: pointer;
				}

				.toolbar-copy-action.is-enabled:hover {
					background: #409eff;
					color: #fff;
					box-shadow: 0 2px 6px rgb(64 158 255 / 28%);
				}

				.find-toolbar-action {
					color: #5f6b7a;
					cursor: pointer;
				}

				.find-toolbar-action:hover {
					background: #ecf5ff;
					border-color: #409eff;
					color: #409eff;
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

				:deep(.el-table-v2__row.find-active-child-row .el-table-v2__row-cell) {
					box-shadow: inset 0 0 0 1px #e6a23c;
				}

				:deep(.find-highlight-text) {
					background-color: #ffd86b;
					color: #303133;
					padding: 0 1px;
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
					position: relative;
					width: 100%;
					height: 100%;
					background-color: #f2f3f5;
				}

				:deep(.el-table-v2__row:hover .selection-cell) {
					background-color: #e5e7eb !important;
				}

				:deep(.resizable-header-cell.is-hovered-column) {
					background-color: #e5e7eb !important;
				}

				:deep(.is-hovered-column) {
					background-color: #f3f4f6;
				}

				:deep(.selection-row-index) {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					color: #606266;
					font-size: 13px;
					line-height: 1;
				}

				:deep(.selection-header-cell .el-checkbox),
				:deep(.selection-cell .el-checkbox) {
					height: 100%;
					margin-right: 0;
					display: none;
					align-items: center;
				}

				:deep(.el-table-v2__row:hover .selection-cell .selection-row-index),
				:deep(.selection-cell.is-selected .selection-row-index) {
					display: none;
				}

				:deep(.selection-header-cell .el-checkbox),
				:deep(.el-table-v2__row:hover .selection-cell .el-checkbox),
				:deep(.selection-cell.is-selected .el-checkbox) {
					display: inline-flex;
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
		min-height: 160px;
		padding: 12px 16px;
	}

	.el-dialog__footer {
		padding: 16px;
		background-color: #f2f3f5;
		border-top: 1px solid #dcdfe6;
	}
}

.duplicate-target-list {
	margin: -12px -8px 88px;
	border: 1px solid #dcdfe6;
}

.duplicate-target-header,
.duplicate-target-row {
	display: grid;
	grid-template-columns: 1fr 112px 80px 108px;
	align-items: center;
	min-height: 32px;
}

.duplicate-target-header {
	color: #303133;
	background-color: #f4f4f5;
	border-bottom: 1px solid #dcdfe6;
}

.duplicate-target-row:nth-child(odd) {
	background-color: #f5f7fa;
}

.tree-reorder-floating {
	position: fixed;
	z-index: 3200;
	display: flex;
	flex-direction: column;
	min-width: 640px;
	min-height: 360px;
	background: #f6f7f9;
	border: 1px solid #d7dce2;
	box-shadow: 0 2px 10px rgb(0 0 0 / 22%);
	box-sizing: border-box;
}

.tree-reorder-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	padding: 0 12px;
	background: #fff;
	border-bottom: 1px solid #e4e7ed;
	color: #303133;
	font-weight: 600;
	cursor: move;
	user-select: none;
}

.tree-reorder-header-actions {
	display: flex;
	align-items: center;
	gap: 14px;
}

.tree-reorder-header-icon {
	color: #7b838c;
	cursor: pointer;
	font-size: 18px;

	&:hover {
		color: #409eff;
	}
}

.tree-reorder-body {
	display: flex;
	flex: 1;
	min-height: 0;
	padding: 12px 18px;
	gap: 28px;
	background: #fff;
}

.tree-reorder-table-wrap {
	position: relative;
	flex: 1;
	min-width: 0;
	overflow: auto;
	border: 1px solid #eef0f3;
	background: #fff;
}

.tree-reorder-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;

	th {
		height: 24px;
		padding: 0 6px;
		background: #f2f3f5;
		color: #5f6b7a;
		font-weight: 400;
		text-align: left;
		border-bottom: 1px solid #e8ebef;
	}

	td {
		height: 24px;
		padding: 0 6px;
		border-bottom: 1px solid #f1f2f4;
		color: #202124;
		white-space: nowrap;
	}

	tr {
		cursor: pointer;

		&.is-selected td,
		&:hover td {
			background: #eaf4ff;
		}
	}
}

.tree-reorder-empty {
	padding: 32px 0;
	color: #909399;
	text-align: center;
}

.tree-reorder-side-actions {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 18px;
	padding-top: 40px;
}

.tree-reorder-move-btn.el-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 42px;
	height: 28px;
	margin-left: 0;
	padding: 0;

	.el-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		margin: 0;
		line-height: 1;
	}
}

.tree-reorder-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 10px 12px;
	background: #f6f7f9;
	border-top: 1px solid #e4e7ed;
}

.tree-reorder-resize-handle {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 14px;
	height: 14px;
	cursor: se-resize;

	&::after {
		position: absolute;
		right: 2px;
		bottom: 2px;
		width: 8px;
		height: 8px;
		border-right: 1px solid #b8bec6;
		border-bottom: 1px solid #b8bec6;
		content: '';
	}
}

.duplicate-target-cell {
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0 10px;
	border-right: 1px solid #dcdfe6;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.duplicate-target-cell:last-child {
	border-right: none;
}

.duplicate-target-title {
	gap: 8px;
}

.duplicate-target-icon,
.duplicate-target-default-icon {
	flex: none;
	width: 16px;
	height: 16px;
}

.duplicate-target-default-icon {
	border-radius: 3px;
	background: linear-gradient(135deg, #d7ecff 0%, #8bbbe8 100%);
	border: 1px solid #7da9d5;
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

.part-action-dropdown-popper.el-popper {
	min-width: 228px !important;
	padding: 0 !important;
	border: 1px solid #d7dce2 !important;
	border-radius: 0 !important;
	box-shadow: 0 2px 8px rgb(0 0 0 / 18%) !important;
	overflow: visible !important;
	z-index: 3000 !important;
}
.part-action-dropdown-popper .el-popper__arrow {
	display: none !important;
}
.part-action-dropdown-popper .el-dropdown-menu {
	padding: 0 !important;
	border: 0 !important;
	box-shadow: none !important;
	overflow: visible !important;
}
.part-action-dropdown-popper .el-scrollbar,
.part-action-dropdown-popper .el-scrollbar__wrap,
.part-action-dropdown-popper .el-scrollbar__view {
	overflow: visible !important;
}
.part-action-dropdown-popper .el-dropdown-menu__item {
	display: flex !important;
	align-items: center !important;
	min-width: 226px !important;
	height: 26px !important;
	padding: 0 8px !important;
	box-sizing: border-box !important;
	font-size: 13px !important;
	line-height: 26px !important;
	color: #1f2d3d !important;
}
.part-action-dropdown-popper .el-dropdown-menu__item--divided {
	margin-top: 0 !important;
	border-top: 1px solid #e4e7ed !important;
}
.part-action-dropdown-popper .el-dropdown-menu__item--divided::before {
	display: none !important;
}
.part-action-dropdown-popper .el-dropdown-menu__item:not(.is-disabled):focus,
.part-action-dropdown-popper .el-dropdown-menu__item.is-disabled {
	color: #b8bec6 !important;
	cursor: not-allowed !important;
}
.part-action-open-with-submenu {
	position: relative;
}
.part-action-open-with-trigger {
	display: flex;
	align-items: center;
	min-width: 226px;
	height: 26px;
	padding: 0 8px;
	box-sizing: border-box;
	color: #1f2d3d;
	cursor: pointer;
	font-size: 13px;
	line-height: 26px;
}
.part-action-open-with-trigger:hover,
.part-action-open-with-item:hover {
	background-color: #ecf5ff;
	color: #409eff;
}
.part-action-open-with-panel {
	position: absolute;
	top: 0;
	right: 100%;
	display: none;
	min-width: 170px;
	padding: 4px 0;
	background: #fff;
	border: 1px solid #d7dce2;
	box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
	z-index: 30;
}
.part-action-open-with-submenu:hover .part-action-open-with-panel {
	display: block;
}
.part-action-open-with-item {
	display: flex;
	align-items: center;
	height: 26px;
	padding: 0 8px;
	box-sizing: border-box;
	color: #1f2d3d;
	cursor: pointer;
	font-size: 13px;
	line-height: 26px;
	white-space: nowrap;
}
.part-action-open-with-item-divided {
	margin-top: 2px;
	border-top: 1px solid #e4e7ed;
	padding-top: 4px;
}

.children-find-floating {
	position: fixed;
	z-index: 3000;
	width: 360px !important;
	border: 1px solid #cfd3da !important;
	border-radius: 0 !important;
	background: #f1f2f4 !important;
	box-shadow: 0 2px 6px rgb(0 0 0 / 22%) !important;
}

.children-find-panel {
	padding: 0 8px 10px;
	background: #f1f2f4;
	color: #2f3540;
	font-size: 13px;
}

.children-find-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 28px;
	font-size: 14px;
	font-weight: 700;
	line-height: 28px;
	cursor: move;
	user-select: none;
}

.children-find-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.children-find-close {
	flex: 0 0 auto;
	color: #7b8088;
	font-size: 16px;
	cursor: pointer;
}

.children-find-close:hover {
	color: #409eff;
}

.children-find-row {
	display: flex;
	align-items: center;
	gap: 5px;
}

.children-find-row .el-input {
	flex: 1;
}

.children-find-row .el-input__wrapper {
	height: 28px;
	border-radius: 4px;
	box-shadow: 0 0 0 1px #409eff inset;
}

.children-find-row .el-button {
	width: 29px;
	height: 28px;
	padding: 0;
	border-radius: 4px;
	background: #eef0f3;
	color: #9097a3;
}

.children-find-row .el-button.is-find-ready {
	border-color: #409eff;
	background: #ecf5ff;
	color: #409eff;
	cursor: pointer;
}

.children-find-row .el-button.is-find-ready:hover {
	background: #409eff;
	color: #fff;
}

.children-find-options {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin-top: 11px;
	color: #4b5563;
	font-size: 14px;
	font-weight: 700;
	line-height: 18px;
}

.part-action-menu-icon {
	display: inline-flex;
	flex: 0 0 24px;
	align-items: center;
	justify-content: center;
	width: 24px;
	color: #6b7c8d;
	font-size: 14px;
}
.part-action-menu-label {
	flex: 1 1 auto;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.part-action-menu-arrow {
	flex: 0 0 auto;
	margin-left: 8px;
	color: #606266;
	font-size: 12px;
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

.selected-actions-dropdown {
	overflow: visible !important;

	.el-scrollbar,
	.el-scrollbar__wrap,
	.el-scrollbar__view,
	.el-dropdown-menu {
		overflow: visible !important;
	}

	.el-dropdown-menu__item {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 160px;
		height: 28px;
		line-height: 28px;
	}

	.selected-action-icon {
		width: 18px;
		color: #5f6b7a;
		text-align: center;
	}

	.selected-action-submenu {
		position: relative;
	}

	.selected-action-submenu-trigger {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 160px;
		height: 28px;
		padding: 0 16px;
		color: #606266;
		cursor: pointer;
		box-sizing: border-box;
	}

	.selected-action-submenu-trigger .el-icon {
		margin-left: auto;
	}

	.selected-action-submenu-panel {
		position: absolute;
		top: 0;
		left: 100%;
		display: none;
		min-width: 170px;
		padding: 4px 0;
		background: #fff;
		border: 1px solid #dcdfe6;
		box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
		z-index: 20;
	}

	.selected-action-submenu:hover .selected-action-submenu-panel {
		display: block;
	}

	.selected-action-submenu-trigger:hover,
	.selected-action-submenu-item:hover {
		background-color: #ecf5ff;
		color: #409eff;
	}

	.selected-action-submenu-item {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 28px;
		padding: 0 14px;
		color: #606266;
		cursor: pointer;
		white-space: nowrap;
		box-sizing: border-box;
	}

	.selected-action-open-with-item-divided {
		margin-top: 2px;
		border-top: 1px solid #dcdfe6;
		padding-top: 4px;
	}
}

.instance-quantity-dialog {
	.instance-quantity-tabs {
		display: flex;
		justify-content: center;
		gap: 36px;
		border-bottom: 1px solid #dcdfe6;
		margin: -8px -20px 10px;
	}

	.instance-quantity-tab {
		padding: 8px 12px;
		color: #606266;
		border-bottom: 2px solid transparent;
	}

	.instance-quantity-tab.is-active {
		color: #303133;
		border-bottom-color: #409eff;
	}

	.instance-quantity-toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.instance-quantity-added-tip {
		margin-left: auto;
		color: #606266;
	}

	.instance-quantity-table-wrap {
		overflow: auto;
		resize: both;
		min-width: 760px;
		min-height: 240px;
		max-height: 520px;
		border: 1px solid #ebeef5;
	}
}

/* 展开菜单按钮样式 */
.expand-menu-btn.is-active {
	color: #409eff !important;
	border-color: #409eff !important;
}

.expand-menu-btn.is-disabled {
	color: #c0c4cc !important;
	border-color: #dcdfe6 !important;
	background-color: #f5f7fa !important;
	cursor: not-allowed !important;
}

/* 展开菜单下拉框样式 */
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

/* 展开 N 层对话框样式 */
.expand-n-content {
	padding: 10px 0;
}

/* 导出进度对话框样式 */
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
