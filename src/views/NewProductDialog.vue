<!-- @Author: System -->
<!-- @Date: 2026-04-29 -->
<!-- @Description: 新产品创建弹框 -->
<template>
	<BaseDialog
		v-model="dialogVisible"
		title="新产品"
		:confirm-text="'创建'"
		:confirm-loading="submitting"
		:destroy-on-close="false"
		@confirm="handleSubmit"
		@cancel="handleCancel">
		<div
			v-loading="dialogLoading"
			element-loading-text="加载中..."
			element-loading-background="rgba(255, 255, 255, 0.8)"
			class="dialog-content-wrapper">
			<el-tabs
				v-model="activeTab"
				class="centered-tabs">
				<el-tab-pane name="properties">
					<template #label>
						<span class="tab-label">
							<el-icon><Document /></el-icon>
							<span>属性</span>
						</span>
					</template>
					<el-form
						ref="formRef"
						:model="formData"
						:rules="formRules"
						label-width="70px"
						class="product-form"
						size="small"
						label-position="left"
						@submit.prevent>
						<!-- 标题字段（PLMEntity.V_Name）-->
						<el-form-item
							v-if="titleAttribute"
							:label="titleAttribute.nls"
							:prop="titleAttribute.name"
							:required="titleAttribute.mandatory">
							<el-input
								v-model="formData[titleAttribute.name]"
								:placeholder="`请输入${titleAttribute.nls}`"
								:disabled="titleAttribute.isReadOnly"
								:maxlength="titleAttribute.maxlength > 0 ? titleAttribute.maxlength : undefined" />
						</el-form-item>

						<!-- 固定字段：模板 -->
						<el-form-item
							label="模板"
							prop="Template"
							required>
							<el-select
								v-model="formData.Template"
								placeholder="选择模板"
								style="width: 100%"
								class="template-select">
								<template #prefix>
									<img
										v-if="getTemplateIconUrl(selectedTemplateGroup)"
										:src="getTemplateIconUrl(selectedTemplateGroup)"
										class="template-select-icon"
										:alt="selectedTemplateGroup" />
									<el-icon
										v-else
										class="template-select-icon-fallback">
										<Box />
									</el-icon>
								</template>
								<el-option-group
									v-for="group in templateGroups"
									:key="group.label"
									:label="group.label">
									<el-option
										v-for="item in group.options"
										:key="item.value"
										:label="item.label"
										:value="item.value">
										<div class="template-option">
											<img
												v-if="getTemplateIconUrl(item.group)"
												:src="getTemplateIconUrl(item.group)"
												class="template-icon"
												:alt="item.group" />
											<el-icon
												v-else
												class="template-icon-fallback">
												<Box />
											</el-icon>
											<span>{{ item.label }}</span>
										</div>
									</el-option>
								</el-option-group>
							</el-select>
						</el-form-item>

						<!-- 固定字段：合作区（禁用显示） -->
						<el-form-item
							label="合作区"
							prop="collaborativeSpace"
							required>
							<el-input
								:model-value="selectedSpaceLabel"
								disabled
								style="width: 100%" />
						</el-form-item>

						<!-- 折叠框：其他字段 -->
						<el-collapse
							v-model="activeCollapse"
							expand-icon-position="left">
							<el-collapse-item name="more">
								<template #title>
									<span class="collapse-title">{{ activeCollapse.includes('more') ? '显示更少' : '显示更多' }}</span>
								</template>
								<!-- 动态字段：根据 publicAttributes 渲染（排除标题字段） -->
								<template
									v-for="attr in collapsedPublicAttributes"
									:key="attr.name">
									<el-form-item
										:label="attr.nls"
										:prop="attr.name">
										<!-- 纯文本显示（名称、协作策略） -->
										<span
											v-if="attr.nls === '名称' || attr.nls === '协作策略'"
											class="text-value">
											{{ getDisplayValue(attr) }}
										</span>
										<!-- 下拉选择 -->
										<el-select
											v-else-if="hasRange(attr)"
											v-model="formData[attr.name]"
											:placeholder="`选择${attr.nls}`"
											:disabled="attr.isReadOnly"
											style="width: 100%">
											<el-option
												v-for="(rangeItem, index) in attr.range"
												:key="rangeItem"
												:label="attr.rangeNLS?.[index] || rangeItem"
												:value="rangeItem" />
										</el-select>
										<!-- 多行文本 -->
										<el-input
											v-else-if="attr.multiline"
											v-model="formData[attr.name]"
											type="textarea"
											:rows="3"
											:placeholder="`请输入${attr.nls}`"
											:disabled="attr.isReadOnly"
											:maxlength="attr.maxlength > 0 ? attr.maxlength : undefined" />
										<!-- 单行文本 -->
										<el-input
											v-else
											v-model="formData[attr.name]"
											:placeholder="`请输入${attr.nls}`"
											:disabled="attr.isReadOnly"
											:maxlength="attr.maxlength > 0 ? attr.maxlength : undefined" />
									</el-form-item>
								</template>

								<!-- 动态字段：根据 volatileAttributes（除 Template 外）渲染 -->
								<template
									v-for="attr in visibleVolatileAttributes"
									:key="attr.name">
									<el-form-item
										:label="attr.nls"
										:prop="attr.name">
										<el-input
											v-model="formData[attr.name]"
											:placeholder="`请输入${attr.nls}`"
											:disabled="false"
											:maxlength="attr.validationService ? 100 : undefined" />
									</el-form-item>
								</template>
							</el-collapse-item>
						</el-collapse>
					</el-form>
				</el-tab-pane>

				<el-tab-pane name="classification">
					<template #label>
						<span class="tab-label">
							<el-icon><FolderOpened /></el-icon>
							<span>分类</span>
						</span>
					</template>
					<div class="classification-form">
						<el-form
							label-width="100px"
							size="small">
							<el-form-item label="书签文件夹">
								<el-select
									v-model="classificationData.bookmarkFolder"
									placeholder="搜索"
									style="width: 100%">
									<el-option
										label="文件夹1"
										value="folder1" />
									<el-option
										label="文件夹2"
										value="folder2" />
								</el-select>
							</el-form-item>
							<el-form-item label="库">
								<el-select
									v-model="classificationData.library"
									placeholder="搜索"
									style="width: 100%">
									<el-option
										label="库1"
										value="lib1" />
									<el-option
										label="库2"
										value="lib2" />
								</el-select>
							</el-form-item>
						</el-form>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>

		<template #footer-left>
			<el-checkbox
				v-model="formData.repeat"
				size="small">
				重复
			</el-checkbox>
		</template>
	</BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElLoading, type FormInstance, type FormRules } from 'element-plus';
import { Box, Document, FolderOpened } from '@element-plus/icons-vue';
import { VplmAPI, CollabAPI, AuthoringAPI, WidgetAPI } from '@/api';
import recentApi from '@/api/recentApi';
import { BaseDialog } from '@/components/common';
import { useBaseInfoStore } from '@/store/modules/baseInfo';
import { useDialogStore } from '@/store/modules/dialog';
import { useQueryModeStore } from '@/store/modules/queryMode';
import type { TypeInfoResponse, CreateResponse, TemplateAttribute } from '@/api/vplm/vplmTypes';
import type { CreateContentParams, CreateContentRequest, Metrics } from '@/api/collab/collabTypes';

const router = useRouter();
const baseInfoStore = useBaseInfoStore();
const queryModeStore = useQueryModeStore();

interface TemplateOption {
	value: string;
	label: string;
	group: string;
}

interface SpaceOption {
	value: string;
	label: string;
}

interface TemplateGroup {
	label: string;
	options: TemplateOption[];
}

interface VisibilityConfig {
	Template?: string[];
}

interface PublicAttribute {
	name: string;
	type: string;
	nls: string;
	value: string;
	authorizedValuesRequired?: boolean;
	visible: boolean;
	isReadOnly: boolean;
	modified?: boolean;
	mandatory?: boolean;
	maxlength: number;
	positionUI?: number;
	positionGroup?: number;
	basicAttribute?: boolean;
	multiline?: boolean;
	range?: string[];
	rangeNLS?: string[];
	forbiddenChar?: string;
	visibility?: VisibilityConfig;
}

const props = defineProps<{
	visible: boolean;
	defaultRepeat?: boolean;
}>();

const emit = defineEmits<{
	'update:visible': [value: boolean];
	'success': [productInfo?: { physicalid: string; name: string; type: string; repeat?: boolean; createType?: 'product' | 'part' | 'drawing' }];
}>();

// 全局弹框状态
const dialogStore = useDialogStore();

// 弹框实际显示状态（从全局store获取，支持跨页面保持）
const dialogVisible = computed({
	get: () => dialogStore.isProductDialog && dialogStore.visible,
	set: (val: boolean) => {
		if (!val) {
			dialogStore.closeDialog();
		} else {
			dialogStore.visible = true;
		}
	}
});

const activeTab = ref('properties');
const activeCollapse = ref<string[]>([]);
const formRef = ref<FormInstance>();
const submitting = ref(false);

// 弹框数据加载状态
const dialogLoading = ref(false);

// 动态表单数据
const formData = ref<Record<string, any>>({
	Template: '',
	collaborativeSpace: '',
	repeat: false
});

// 动态表单校验规则
const formRules = ref<FormRules>({});

// 存储 publicAttributes 供动态渲染使用
const publicAttributes = ref<PublicAttribute[]>([]);

// 判断属性是否应该显示（考虑 visibility 配置）
const shouldShowAttribute = (attr: PublicAttribute): boolean => {
	// 如果 visible 为 false，直接不显示
	if (!attr.visible) return false;

	// 如果没有 visibility 配置，直接显示
	if (!attr.visibility) return true;

	// 检查 Template 可见性配置
	if (attr.visibility.Template) {
		const currentTemplate = formData.value.Template;
		if (currentTemplate && !attr.visibility.Template.includes(currentTemplate)) {
			return false;
		}
	}

	return true;
};

// 计算可见的 publicAttributes（排除不可见字段，并考虑 visibility 配置）
const visiblePublicAttributes = computed(() => {
	return publicAttributes.value.filter(attr => shouldShowAttribute(attr));
});

// 判断 volatileAttribute 是否应该显示（考虑 visibility 配置）
const shouldShowVolatileAttribute = (attr: TemplateAttribute): boolean => {
	// 如果 visible 为 false，直接不显示
	if (!attr.visible) return false;

	// 如果没有 visibility 配置，直接显示
	if (!attr.visibility) return true;

	// 检查 Template 可见性配置
	if (attr.visibility.Template) {
		const currentTemplate = formData.value.Template;
		if (currentTemplate && !attr.visibility.Template.includes(currentTemplate)) {
			return false;
		}
	}

	return true;
};

// 计算可见的 volatileAttributes（排除 Template 和不可见字段）
const visibleVolatileAttributes = computed(() => {
	return volatileAttributes.value.filter(attr => attr.name !== 'Template' && shouldShowVolatileAttribute(attr));
});

// 判断属性是否有下拉选项
const hasRange = (attr: PublicAttribute): boolean => {
	return !!attr.range && attr.range.length > 0;
};

// 获取字段的显示值（如果有 rangeNLS，则显示对应的 label）
const getDisplayValue = (attr: PublicAttribute): string => {
	const value = formData.value[attr.name];
	if (attr.range && attr.rangeNLS) {
		const index = attr.range.indexOf(value);
		if (index !== -1 && attr.rangeNLS[index]) {
			return attr.rangeNLS[index];
		}
	}
	return value;
};

// 预加载所有CAD图标
const cadIcons = import.meta.glob('@/assets/images/icons/cadmasters/I_CADMaster*.png', {
	eager: true,
	import: 'default'
});

// 根据 group 名称获取模板图标路径
const getTemplateIconUrl = (groupName: string): string => {
	// 去掉空格后拼接文件名
	const iconType = groupName.replace(/\s/g, '');
	const key = `/src/assets/images/icons/cadmasters/I_CADMaster${iconType}.png`;
	return (cadIcons[key] as string) || '';
};

const templateGroups = ref<TemplateGroup[]>([]);
const spaceOptions = ref<SpaceOption[]>([]);

// 存储 volatileAttributes（除 Template 外）供动态渲染使用
const volatileAttributes = ref<TemplateAttribute[]>([]);

// 存储 typeInfo 数据供创建产品时使用
const typeInfoDataCache = ref<TypeInfoResponse | null>(null);

// 计算标题字段（PLMEntity.V_Name）
const titleAttribute = computed<PublicAttribute | undefined>(() => {
	return publicAttributes.value.find(attr => attr.name === 'PLMEntity.V_Name');
});

// 计算折叠区域的 publicAttributes（排除标题字段）
const collapsedPublicAttributes = computed(() => {
	return visiblePublicAttributes.value.filter(attr => attr.name !== 'PLMEntity.V_Name');
});

// 计算当前选中的合作区 label（优先取 prjtitle）
const selectedSpaceLabel = computed(() => {
	const selectedSpace = spaceOptions.value.find(item => item.value === formData.value.collaborativeSpace);
	return selectedSpace?.label || formData.value.collaborativeSpace;
});

// 计算当前选中模板对应的 group 名称
const selectedTemplateGroup = computed(() => {
	for (const group of templateGroups.value) {
		const option = group.options.find(item => item.value === formData.value.Template);
		if (option) {
			return option.group;
		}
	}
	return '';
});

const classificationData = ref({
	bookmarkFolder: '',
	library: ''
});

const oldClassificationData = ref([
	{
		name: '产品',
		children: [{ name: '物理产品' }, { name: '逻辑产品' }, { name: '系统产品' }]
	},
	{
		name: '零件',
		children: [{ name: '机械零件' }, { name: '电气零件' }]
	},
	{
		name: '工程图',
		children: [{ name: '2D 工程图' }, { name: '3D 工程图' }]
	}
]);

// 处理 publicAttributes 数据
const processPublicAttributes = (typeInfoData: TypeInfoResponse) => {
	if (!typeInfoData.result || typeInfoData.result.length === 0) return;

	const result = typeInfoData.result[0];
	const attrs = (result.attributes?.publicAttributes || []) as PublicAttribute[];
	publicAttributes.value = attrs;

	// 初始化表单数据和校验规则
	const newFormData: Record<string, any> = {
		Template: formData.value.Template,
		collaborativeSpace: formData.value.collaborativeSpace,
		repeat: formData.value.repeat
	};

	// 保留 volatileAttributes 的值（避免被覆盖）
	for (const attr of volatileAttributes.value) {
		newFormData[attr.name] = formData.value[attr.name] ?? attr.value ?? '';
	}

	const newRules: FormRules = {
		Template: [{ required: true, message: '请选择模板', trigger: 'change' }],
		collaborativeSpace: [{ required: true, message: '请选择合作区', trigger: 'change' }]
	};

	for (const attr of attrs) {
		if (!attr.visible) continue;

		// 设置默认值
		newFormData[attr.name] = attr.value ?? '';

		// 设置校验规则
		if (attr.mandatory) {
			newRules[attr.name] = [
				{
					required: true,
					message: `请输入${attr.nls}`,
					trigger: attr.range ? 'change' : 'blur'
				}
			];
		}
	}

	formData.value = newFormData;
	formRules.value = newRules;
};

// 处理模板数据
const processTemplateData = (typeInfoData: TypeInfoResponse) => {
	// 缓存 typeInfo 数据
	typeInfoDataCache.value = typeInfoData;

	if (!typeInfoData.result || typeInfoData.result.length === 0) return;

	const result = typeInfoData.result[0];
	const volatileAttrs = result.attributes?.volatileAttributes || [];
	const templateAttr = volatileAttrs.find((attr: TemplateAttribute) => attr.name === 'Template');

	if (!templateAttr) return;

	const range = templateAttr.range || [];
	const rangeNLS = templateAttr.rangeNLS || [];
	const rangeGroup = templateAttr.rangeGroup || [];

	if (range.length === 0) return;

	const groupMap = new Map<string, TemplateOption[]>();

	for (let i = 0; i < range.length; i++) {
		const templateValue = range[i];
		const templateLabel = rangeNLS[i] || templateValue;
		const groupName = rangeGroup[i] || '其他';

		if (!groupMap.has(groupName)) {
			groupMap.set(groupName, []);
		}

		groupMap.get(groupName)?.push({
			value: templateValue,
			label: templateLabel,
			group: groupName
		});
	}

	const groups: TemplateGroup[] = [];
	for (const [groupName, options] of groupMap.entries()) {
		if (options.length > 0) {
			groups.push({
				label: groupName,
				options: options
			});
		}
	}

	templateGroups.value = groups;

	// 设置默认模板值
	if (groups.length > 0 && groups[0].options.length > 0 && !formData.value.Template) {
		formData.value.Template = groups[0].options[0].value;
	}

	// 处理其他 volatileAttributes（除 Template 外）
	const otherVolatileAttrs = volatileAttrs.filter((attr: TemplateAttribute) => attr.name !== 'Template');
	volatileAttributes.value = otherVolatileAttrs;

	// 初始化 volatileAttributes 的表单数据（总是使用接口返回的 value 作为默认值）
	for (const attr of otherVolatileAttrs) {
		formData.value[attr.name] = attr.value ?? '';
	}
};

// 处理合作区数据
const processCollaborativeSpaceData = (createContextData: CreateResponse) => {
	if (!createContextData.credentials || createContextData.credentials.length === 0) return;

	const spaces: SpaceOption[] = createContextData.credentials.map(cred => ({
		value: cred.ctxname,
		label: cred.prjtitle || cred.ctxtitle || cred.ctxname
	}));

	spaceOptions.value = spaces;

	if (spaces.length > 0 && !formData.value.collaborativeSpace) {
		formData.value.collaborativeSpace = spaces[0].value;
	}
};

// 加载模板数据
const loadTemplateData = async (spaceValue: string, showLoading = true) => {
	if (!spaceValue) return;

	if (showLoading) {
		dialogLoading.value = true;
	}
	try {
		const typeInfoRes = await VplmAPI.getTypeInfo(
			{
				type: 'VPMReference',
				preferedType: 'VPMReference',
				typeName: 'assembly',
				subTypes: true,
				runUXBL: true,
				metrics: {
					UXName: 'New',
					client_app_domain: '3DEXPERIENCE 3DDashboard',
					client_app_name: 'ENOPSTR_AP'
				}
			},
			{
				SecurityContext: `ctx::${baseInfoStore.securityContext || spaceValue}`
			}
		);

		processTemplateData(typeInfoRes);
		processPublicAttributes(typeInfoRes);
	} catch (error) {
		console.error('加载模板数据失败:', error);
		ElMessage.error('加载模板数据失败');
	} finally {
		if (showLoading) {
			dialogLoading.value = false;
		}
	}
};

// 加载创建上下文
const loadCreateContext = async () => {
	const loadingInstance = ElLoading.service({
		lock: true,
		text: '加载中...',
		background: 'rgba(0, 0, 0, 0.7)'
	});
	try {
		const createContextRes = await VplmAPI.getCreateContext({
			tenant: 'OnPremise',
			type: 'VPMReference',
			xrequestedwith: 'xmlhttprequest'
		});

		processCollaborativeSpaceData(createContextRes);

		const selectedSpace = spaceOptions.value[0]?.value;
		if (selectedSpace) {
			// 在 loadCreateContext 中调用 loadTemplateData 时不显示 loading，因为外层已经有 loading
			await loadTemplateData(selectedSpace, false);
		}
	} catch (error) {
		console.error('加载创建上下文失败:', error);
		ElMessage.error('加载数据失败，请重试');
	} finally {
		loadingInstance.close();
	}
};

const handleClassClick = (data: unknown) => {
	console.log('选中分类:', data);
};

const resetForm = (useDefaultRepeat = false) => {
	formData.value = {
		Template: '',
		collaborativeSpace: '',
		repeat: useDefaultRepeat ? (props.defaultRepeat ?? false) : false
	};
	publicAttributes.value = [];
	volatileAttributes.value = [];
	typeInfoDataCache.value = null;
	activeTab.value = 'properties';
	activeCollapse.value = [];
};

// 仅重置表单数据（不清空属性列表，用于重复模式下跳转后重置）
const resetFormDataOnly = () => {
	const currentSpace = formData.value.collaborativeSpace;
	formData.value = {
		Template: '',
		collaborativeSpace: currentSpace,
		repeat: true
	};
	// 清除动态字段值但保留属性定义
	publicAttributes.value.forEach(attr => {
		formData.value[attr.name] = '';
	});
	volatileAttributes.value.forEach(attr => {
		if (attr.name !== 'Template') {
			formData.value[attr.name] = '';
		}
	});
};

const handleCancel = () => {
	dialogStore.closeDialog();
	resetForm(false);
};

const handleSubmit = async () => {
	if (!formRef.value) return;

	await formRef.value.validate(async valid => {
		if (valid) {
			submitting.value = true;
			try {
				// 检查是否有缓存的 typeInfo 数据
				if (!typeInfoDataCache.value || !typeInfoDataCache.value.result || typeInfoDataCache.value.result.length === 0) {
					ElMessage.error('缺少必要的类型信息，请重新打开弹框');
					return;
				}

				const typeInfoResult = typeInfoDataCache.value.result[0];

				// 调试：打印 typeInfo 原始数据
				console.log('【产品】typeInfo 原始数据 basicAttributes:', typeInfoResult.basicAttributes);
				console.log('【产品】typeInfo 原始数据 type:', typeInfoResult.type);
				console.log('【产品】typeInfo 原始数据 integrityToken:', typeInfoResult.integrityToken);
				console.log('【产品】typeInfo 原始数据 interfaces:', typeInfoResult.interfaces);
				console.log('【产品】typeInfo 原始数据 subTypes:', typeInfoResult.subTypes);

				// 构建 publicAttributes
				const publicAttrs = publicAttributes.value.map(attr => {
					const formValue = formData.value[attr.name];
					return {
						name: attr.name,
						type: attr.type,
						nls: attr.nls,
						value: formValue ?? attr.value ?? '',
						authorizedValuesRequired: attr.authorizedValuesRequired,
						visible: attr.visible,
						isReadOnly: attr.isReadOnly,
						modified: true,
						mandatory: attr.mandatory,
						maxlength: attr.maxlength,
						positionUI: attr.positionUI,
						positionGroup: attr.positionGroup,
						basicAttribute: attr.basicAttribute,
						multiline: attr.multiline,
						range: attr.range,
						rangeNLS: attr.rangeNLS,
						forbiddenChar: attr.forbiddenChar
					};
				});

				// 构建 filteredAttributes（从 typeInfo 中获取）
				const filteredAttrs = typeInfoResult.attributes?.filteredAttributes || [];

				// 构建 volatileAttributes（包含 Template 和其他动态字段）
				const volatileAttrs = typeInfoResult.attributes?.volatileAttributes || [];
				const volatileAttrsWithValues = volatileAttrs.map((attr: TemplateAttribute) => {
					const formValue = formData.value[attr.name];
					return {
						...attr,
						value: formValue ?? attr.value ?? '',
						modified: true
					};
				});

				// 构建 metrics 参数
				const metrics: Metrics = {
					UXName: 'New',
					client_app_domain: '3DEXPERIENCE 3DDashboard',
					client_app_name: 'ENOPSTR_AP'
				};

				// 构建 basicAttributes（从 typeInfo 响应中获取）
				const basicAttributes = typeInfoResult.basicAttributes || {
					physicalid: typeInfoResult.attributes?.filteredAttributes?.find(attr => attr.name === 'PLMReference.V_VersionID')?.value || '',
					minorOrder: '0',
					type: typeInfoResult.type,
					revision: 'AA',
					majorOrder: '0',
					policy: 'VPLM_SMB_Definition_MajorRev'
				};

				// 构建创建请求参数（包含 create 和 metrics）
				const createRequest: CreateContentRequest = {
					create: [
						{
							type: typeInfoResult.type,
							integrityToken: typeInfoResult.integrityToken,
							subTypes: typeInfoResult.subTypes,
							interfaces: typeInfoResult.interfaces || [],
							attributes: {
								internalAttributes: typeInfoResult.attributes?.internalAttributes || [],
								publicAttributes: publicAttrs,
								extensionAttributes: typeInfoResult.attributes?.extensionAttributes || [],
								filteredAttributes: filteredAttrs,
								volatileAttributes: volatileAttrsWithValues
							},
							basicAttributes
						}
					],
					metrics
				};

				// 调试：打印完整请求体，便于抓包对比
				console.log('【产品】createRequest:', JSON.stringify(createRequest, null, 2));

				// 优先调用 getcreatectx 接口获取 securityContext
				let securityContext = '';
				try {
					const createCtxResponse = await VplmAPI.getCreateContext();
					console.log('【产品】getCreateContext 响应:', createCtxResponse);
					if (createCtxResponse?.credentials && createCtxResponse.credentials.length > 0) {
						// 取第一个 credential 的 ctxname
						securityContext = createCtxResponse.credentials[0].ctxname;
						console.log('【产品】从 getcreatectx 获取到 securityContext:', securityContext);
					}
				} catch (ctxError) {
					console.warn('【产品】调用 getcreatectx 失败，将使用备用值:', ctxError);
				}

				// 如果 getcreatectx 没有获取到值，使用备用的 securityContext
				if (!securityContext) {
					securityContext = baseInfoStore.securityContext || formData.value.collaborativeSpace;
					console.log('【产品】使用备用 securityContext:', securityContext);
				}

				// 调用创建产品接口
				const response = await CollabAPI.createProduct(
					createRequest,
					{},
					{
						SecurityContext: encodeURIComponent(`ctx::${securityContext}`)
					}
				);

				console.log('创建产品响应:', JSON.parse(JSON.stringify(response)));
				if (response && response.result && response.result.length > 0) {
					const resultItem = response.result[0];
					const createdPhysicalId = resultItem.physicalid || '';
					const createdType = resultItem.type || 'VPMReference';
					console.log('创建成功，physicalid:', createdPhysicalId, 'type:', createdType);

					if (createdPhysicalId) {
						// 调用 enoauthoring/fetch/v1 获取产品详情
						let createdName = '';
						try {
							console.log('开始调用 enoauthoring/fetch/v1 获取产品详情');
							const productDetail = await AuthoringAPI.fetchProductFull(createdPhysicalId, {
								SecurityContext: `ctx::${securityContext}`,
								tenant: 'OnPremise',
								xrequestedwith: 'xmlhttprequest'
							});
							console.log('产品详情响应:', productDetail);
							if (productDetail?.results?.length > 0) {
								const data = productDetail.results[0].dataelements;
								createdName = data?.name || data?.title || '';
							}
						} catch (fetchError) {
							console.warn('获取产品详情失败:', fetchError);
						}

						console.log('开始调用 widget-instances/edit');
						// 1. 调用 widget-instances/edit 更新 Widget 状态
						try {
							const widgetRes = await WidgetAPI.editWidgetInstance({
								id: 'AKzOSOmA2XwI3AsCx00o', // Widget 实例 ID
								data: {
									x3dSharedId: '376954',
									x3dAppId: 'ENOPSTR_AP',
									x3dPlatformId: 'OnPremise',
									appId: 'ENOPSTE_AP',
									token: '2e53f246e995ef1927090f3fee7f54e424bb0085',
									lang: 'zh',
									_gpid: 'undefined',
									syncFeatures: '{"Content":true,"ViewPoint":true}',
									x3dLinkability: {
										open: false,
										appIds: [],
										implements: ['ENXOpen', 'ENXContent', 'ENXContentSync2D', 'ENXAuthoring2D', 'ENXLandingPageSync', '3DPlayDummy'],
										uses: [
											'ENXOpen',
											'ENXContent',
											'ENXEnrich',
											'ENXContentSync2D',
											'ENXContentSync3D',
											'ENXAuthoring3D',
											'ENXLandingPageSync',
											'3DPlayDummy'
										]
									},
									tenantAware: true,
									pad_tenant: 'OnPremise',
									pad_security_ctx: `ctx::${securityContext}`,
									xPref_CREDENTIAL: securityContext,
									isWorkUnderWIP: false,
									WorkUnderConfigData: '',
									ap_custoParams:
										'{"selectedExtensions":["XCADExtension","EnterpriseExtension","MaterialUsageExtension"],"selectedTypes":["VPMReference","VPMInstance","VPMRepReference","3DShape"]}',
									ap_custo: ''
								}
							});
							console.log('widget-instances/edit 调用成功:', widgetRes);
						} catch (widgetError) {
							console.warn('更新 Widget 实例状态失败:', widgetError);
							// Widget 更新失败不影响主流程
						}

						ElMessage.success('产品创建成功');
						// 保存重复状态，避免后续操作影响判断
						const isRepeatMode = formData.value.repeat;
						console.log('准备 emit success 事件:', { physicalid: createdPhysicalId, name: createdName, type: createdType, repeat: isRepeatMode });
						// 传递创建的产品信息给父组件，包含重复模式标记和创建类型
						emit('success', {
							physicalid: createdPhysicalId,
							name: createdName,
							type: createdType,
							repeat: isRepeatMode,
							createType: 'product'
						});
						console.log('success 事件已 emit');

						// 将新创建的产品添加到最近记录
						recentApi.addRecentId(createdPhysicalId);

						// 如果勾选了"重复"，不关闭弹框，等待跳转后在新页面重置
						// 如果不跳转（在首页创建），则需要重置表单
						console.log('检查重复状态:', { isRepeatMode, repeat: formData.value.repeat, dialogVisible: dialogVisible.value });
						if (!isRepeatMode) {
							// 未勾选重复，关闭弹框
							dialogStore.closeDialog();
							resetForm(false);
							// 切换到数据库模式并跳转
							queryModeStore.switchToDbMode();
							router.push({ name: 'partDetail', params: { physicalId: createdPhysicalId }, query: { from: 'create' } });
						}
						// 如果勾选了重复，保持弹框状态，让父组件决定是跳转还是重置
					} else {
						ElMessage.error('产品创建失败：未获取到产品ID');
					}
				} else {
					console.error('创建失败，响应异常:', response);
					ElMessage.error('产品创建失败：响应数据异常');
				}
			} catch (error) {
				ElMessage.error('创建失败，请重试');
				console.error(error);
			} finally {
				submitting.value = false;
			}
		}
	});
};

// 监听全局弹框状态，先加载数据，完成后显示弹框
watch(
	() => dialogStore.visible && dialogStore.isProductDialog,
	async (newVal, oldVal) => {
		console.log('dialogStore.visible changed:', { newVal, oldVal, repeat: dialogStore.repeat, isNavigating: dialogStore.isNavigating });
		if (newVal && !oldVal) {
			// 如果正在跳转中（重复模式下），不重新加载数据，避免闪烁
			if (dialogStore.isNavigating) {
				console.log('跳转中，跳过数据加载，避免闪烁');
				// 标记导航结束
				dialogStore.endNavigation();
				// 延迟一下再重置表单，让用户看到弹框已经打开
				setTimeout(() => {
					if (dialogStore.shouldResetForm) {
						resetFormDataOnly();
					}
				}, 100);
				return;
			}
			// 正常打开弹框时，先显示loading，加载完成后再显示内容
			dialogLoading.value = true;
			try {
				// 使用 store 中的 repeat 参数重置表单
				resetForm(true);
				// 加载数据
				await loadCreateContext();
			} finally {
				dialogLoading.value = false;
			}
		}
	}
);

// 监听重复模式变化，同步到全局store
watch(
	() => formData.value.repeat,
	newVal => {
		console.log('formData.repeat changed:', newVal);
		dialogStore.setRepeatMode(newVal);
	}
);

// 监听 shouldResetForm，用于重复模式下跳转后重置表单
watch(
	() => dialogStore.shouldResetForm,
	async newVal => {
		if (newVal && dialogStore.isProductDialog && dialogStore.visible) {
			console.log('触发表单重置（重复模式下跳转完成）');
			// 保存当前合作区
			const currentSpace = formData.value.collaborativeSpace;
			// 重置表单数据
			resetFormDataOnly();
			// 重新加载模板数据
			await loadTemplateData(currentSpace);
			ElMessage.success('产品创建成功，可继续创建下一个');
			// 重置标志
			dialogStore.setShouldResetForm(false);
		}
	}
);

// 监听合作区切换
watch(
	() => formData.value.collaborativeSpace,
	(newVal, oldVal) => {
		if (newVal && newVal !== oldVal && spaceOptions.value.length > 0) {
			loadTemplateData(newVal);
		}
	}
);
</script>

<style scoped lang="scss">
.dialog-content-wrapper {
	min-height: 200px;
}

.centered-tabs {
	:deep(.el-tabs__header) {
		margin-bottom: 15px;
	}

	:deep(.el-tabs__nav-wrap) {
		display: flex;
		justify-content: center;
	}

	:deep(.el-tabs__nav) {
		display: flex;
		justify-content: center;
		float: none;
	}
}

.tab-label {
	display: flex;
	align-items: center;
	gap: 6px;

	.el-icon {
		font-size: 16px;
	}
}

.product-form {
	padding: 10px 20px 0;
}

/* 折叠框样式 - 与表单对齐 */
:deep(.el-collapse) {
	border: none;

	.el-collapse-item__header {
		border-bottom: none;
		padding-left: 0;
		height: 32px;
		font-size: 14px;
		color: #606266;
		line-height: 32px;

		&:hover {
			color: #409eff;
		}
	}

	.collapse-title {
		padding-left: 0;
	}

	.el-collapse-item__wrap {
		border-bottom: none;
	}

	.el-collapse-item__content {
		padding: 10px 0 0;

		/* 内部的表单项与外部对齐 */
		.el-form-item {
			margin-bottom: 18px;

			/* 确保 label 对齐 */
			.el-form-item__label {
				padding-right: 12px;
			}
		}
	}
}

.text-value {
	display: block;
	font-size: 14px;
	color: #606266;
	line-height: 20px;
}

.template-option {
	display: flex;
	align-items: center;
	gap: 8px;

	.el-icon {
		font-size: 16px;
	}
}

.template-icon {
	width: 16px;
	height: 16px;
	object-fit: contain;
}

.template-icon-fallback {
	font-size: 16px;
	color: #909399;
}

.template-select {
	:deep(.el-select__prefix) {
		padding-right: 8px;
	}
}

.template-select-icon {
	width: 16px;
	height: 16px;
	object-fit: contain;
}

.template-select-icon-fallback {
	font-size: 16px;
	color: #909399;
}

.classification-form {
	padding: 10px 20px 0;
}
</style>
