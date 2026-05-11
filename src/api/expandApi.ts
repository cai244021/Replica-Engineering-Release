import { http } from '@/utils/ds-request';
import { useBaseInfoStore } from '@/store';

// 展开请求参数
export interface ExpandRequestParams {
	batch: {
		expands: Array<{
			filter: {
				and: {
					filters: Array<any>;
				};
			};
			root: {
				physical_id: string;
			};
			label: string;
			graph: {
				descending_condition_relation: {
					uql: string;
				};
				descending_condition_object: {
					uql: string;
				};
			};
			aggregation_processors: Array<any>;
		}>;
	};
	outputs: {
		hits: {
			predefined_computation: string[];
		};
		select_object: string[];
		select_relation: string[];
		format: string;
	};
}

// 节点信息（VPMReference - 零件）
export interface ExpandNode {
	'resourceid': string;
	'ds6w:label': string;
	'ds6w:modified': string;
	'ds6w:created': string;
	'ds6w:description': string;
	'ds6wg:revision': string;
	'ds6w:cadMaster': string;
	'ds6w:responsible': string;
	'owner': string;
	'ds6w:status': string;
	'ds6w:type': string;
	'ds6wg:EnterpriseExtension.V_PartNumber': string;
	'type': string;
	'ds6w:policy': string;
	'ds6w:globalType': string;
	'ds6w:manufacturable': string;
	'ds6w:isLastRevision': string;
	'ds6w:reserved': string;
	'ds6w:identifier': string;
	'islastrevision': string;
	'policy': string;
	'current': string;
	'icon': string;
	'type_icon_url'?: string; // 类型图标URL（DB模式返回）
	'thumbnail_2d'?: string; // 缩略图（DB模式返回）
}

// 关系信息（VPMInstance - 实例）
export interface ExpandRelation {
	'resourceid': string;
	'ds6w:label': string;
	'ds6w:type': string;
	'ro.plminstance.V_treeorder': string;
	'type': string;
	'from': string; // 父节点ID
	'to': string; // 子节点ID
}

// Path 信息
export interface ExpandPath {
	Path: string[];
}

// 展开响应
export interface ExpandResponse {
	infos: {
		encoding: string;
		kind: string;
		version: string;
	};
	results: (ExpandNode | ExpandRelation | ExpandPath)[];
}

// 树形节点
export interface TreeNode {
	id: string;
	resourceid: string;
	relationId?: string; // 关系ID（VPMInstance）
	label: string; // 标题 - 零件的 ds6w:label
	partNumber: string; // 企业项目编号
	revision: string; // 修订版
	instanceLabel: string; // 标题(实例) - 关系的 ds6w:label
	isLastRevision: boolean; // 最新修订版
	status: string; // 成熟度状态
	statusRaw: string; // 原始状态值（用于颜色）
	owner: string; // 所有者
	reserved: boolean; // 锁定状态
	modified: string; // 修改日期
	globalType: string; // 类型
	identifier: string; // 名称
	icon: string; // 图标
	type_icon_url?: string; // 类型图标URL（icon为空时回退使用）
	policy?: string;
	cadMaster?: string;
	typeDisplayName?: string;
	level: number;
	children: TreeNode[];
	isExpanded: boolean;
	hasChildren: boolean;
	path: string[];
}

class ExpandAPI {
	/**
	 * 获取零件展开结构（子级）- 索引模式
	 * @param physicalId 零件的 physicalid
	 * @returns 展开结构数据
	 */
	async getExpandData(physicalId: string): Promise<ExpandResponse> {
		const baseInfoStore = useBaseInfoStore();

		// 确保已经获取了 3DSpace URL 和 SecurityContext
		if (!baseInfoStore.spaceUrl) {
			console.log('[ExpandAPI] 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[ExpandAPI] SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const currentUser = baseInfoStore.currentUser || 'admin_platform';
		const securityContext = baseInfoStore.securityContext;

		// 构建请求 URL（只使用相对路径，ds-request 会自动添加 baseURL）
		const endpoint = '/cvservlet/progressiveexpand/v2';
		const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext || '')}&output_format=cvjson`;

		console.log('[ExpandAPI] 获取展开数据 URL:', url);
		console.log('[ExpandAPI] 零件 physicalId:', physicalId);

		// 构建请求参数
		const params: ExpandRequestParams = {
			batch: {
				expands: [
					{
						filter: {
							and: {
								filters: [
									{
										prefix_filter: {
											prefix_path: [
												{
													physical_id_path: [physicalId]
												}
											]
										}
									},
									{
										and: {
											filters: [
												{
													sequence_filter: {
														sequence: [
															{
																uql: '((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance") OR (flattenedtaxonomies:"reltypes/SpecificationDocument")) AND (NOT (ds6wg_58_synchroebomext_46_v_95_inebomuser:"FALSE" ))'
															}
														]
													}
												}
											]
										}
									}
								]
							}
						},
						root: {
							physical_id: physicalId
						},
						label: `xEngineer-${currentUser}-${Date.now()}`,
						graph: {
							descending_condition_relation: {
								uql: 'NOT (flattenedtaxonomies:"reltypes/XCADBaseDependency") AND ((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance") OR (flattenedtaxonomies:"reltypes/SpecificationDocument"))'
							},
							descending_condition_object: {
								uql: '(flattenedtaxonomies:"types/Drawing") OR ds6w_58_globaltype:"ds6w:Part" OR (flattenedtaxonomies:"types/Document") OR (flattenedtaxonomies:"types/CONTROLLED DOCUMENTS")'
							}
						},
						aggregation_processors: [
							{
								truncate: {
									max_distance_from_prefix: 1,
									prefix_filter: {
										prefix_path: [
											{
												physical_id_path: [physicalId]
											}
										]
									}
								}
							}
						]
					}
				]
			},
			outputs: {
				hits: {
					predefined_computation: ['icons', 'urlstream|thumbnail_2d|2dthb|allrefs']
				},
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
					'ds6wg:MaterialUsageExtension.DeclaredQuantity',
					'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity',
					'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity',
					'ds6wg:raw_material.v_dimensiontype',
					'type',
					'physicalid',
					'ds6w:policy',
					'ds6w:reservedBy',
					'ds6w:globalType',
					'ds6w:manufacturable',
					'pathsr',
					'ds6w:isLastRevision',
					'ds6w:reserved',
					'ds6w:identifier',
					'ds6w:docextension',
					'islastrevision',
					'policy',
					'current'
				],
				select_relation: [
					'ds6w:label',
					'ds6w:type',
					'ds6wg:SynchroEBOMExt.V_InEBOMUser',
					'physicalid',
					'ro.plminstance.V_treeorder',
					'ds6wg:raw_material.v_dimensiontype',
					'ro.madefromquantity_length.V_ContQuantity',
					'ro.madefromquantity_mass.V_ContQuantity',
					'ro.madefromquantity_area.V_ContQuantity',
					'ro.madefromquantity_volume.V_ContQuantity',
					'ro.madefromquantity_AsRequired.AsRequired',
					'ro.MadeFromQuantity_Rectangular.Length',
					'ro.MadeFromQuantity_Rectangular.Width',
					'ro.VPMInstanceQuantity_Area.V_ContQuantity',
					'ro.VPMInstanceQuantity_Mass.V_ContQuantity',
					'ro.VPMInstanceQuantity_Volume.V_ContQuantity',
					'ro.VPMInstanceQuantity_Length.V_ContQuantity',
					'ro.VPMInstanceQuantity_AsRequired.AsRequired',
					'ro.VPMInstanceQuantity_Rectangular.Length',
					'ro.VPMInstanceQuantity_Rectangular.Width',
					'ds6w:reservedBy',
					'type'
				],
				format: 'entity_relation_occurrence'
			}
		};

		console.log('[ExpandAPI] 请求参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>);

			console.log('[ExpandAPI] 展开数据响应:', response);
			return response as ExpandResponse;
		} catch (error) {
			console.error('[ExpandAPI] 获取展开数据失败:', error);
			throw error;
		}
	}

	/**
	 * 获取零件展开结构（子级）- 数据库模式
	 * 用于创建完成后立即查询（此时索引尚未更新）
	 * @param physicalId 零件的 physicalid
	 * @returns 展开结构数据
	 */
	async getExpandDataDbMode(physicalId: string): Promise<ExpandResponse> {
		const baseInfoStore = useBaseInfoStore();

		if (!baseInfoStore.spaceUrl) {
			console.log('[ExpandAPI] DB模式 3DSpace URL 为空，先获取 URL');
			await baseInfoStore.fetchSpaceUrl();
		}

		if (!baseInfoStore.securityContext) {
			console.log('[ExpandAPI] DB模式 SecurityContext 为空，先获取');
			await baseInfoStore.getCollaborativeSpace();
		}

		const currentUser = baseInfoStore.currentUser || 'admin_platform';
		const securityContext = baseInfoStore.securityContext;

		// 数据库模式使用 enoauthoring/expand 接口
		const endpoint = '/resources/enoauthoring/expand/v2/progressive';
		const url = `${endpoint}?tenant=OnPremise&SecurityContext=${encodeURIComponent(securityContext || '')}`;

		console.log('[ExpandAPI] DB模式 获取展开数据 URL:', url);
		console.log('[ExpandAPI] DB模式 零件 physicalId:', physicalId);

		const label = `xEngineer-${currentUser}-${Date.now()}`;

		// 构建数据库模式请求参数（同时包含 db + cv 块）
		/* eslint-disable */
		const params = {
			db: {
				root_path_physicalid: [[physicalId]],
				label,
				no_type_filter_rel: ['XCADBaseDependency'],
				type_filter_rel: ['VPMInstance', 'VPMRepInstance'],
				'q.iterative_filter_query_bo': '(flattenedtaxonomies:"types/Drawing") OR [ds6w:globalType]:"ds6w:Part"',
				compute_select_bo: ['icon', 'thumbnail_2d'],
				expand_iter: '1',
				fcs_url_mode: 'REDIRECT',
				select_bo: [
					'ds6w:label','ds6w:modified','ds6w:created','ds6w:description','ds6wg:revision','ds6w:cadMaster',
					'ds6w:responsible','owner','ds6w:status','ds6w:type','ds6wg:EnterpriseExtension.V_PartNumber',
					'ds6wg:MaterialUsageExtension.DeclaredQuantity','ds6wg:DELFmiContQuantity_Mass.V_ContQuantity',
					'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity','ds6wg:raw_material.v_dimensiontype','type',
					'physicalid','ds6w:policy','ds6w:reservedBy','ds6w:globalType','ds6w:manufacturable','pathsr',
					'ds6w:isLastRevision','ds6w:reserved','ds6w:identifier','cestamp'
				],
				select_rel: [
					'ds6w:label','ds6w:type','ds6wg:SynchroEBOMExt.V_InEBOMUser','physicalid','ro.plminstance.V_treeorder',
					'ds6wg:raw_material.v_dimensiontype','ro.madefromquantity_length.V_ContQuantity',
					'ro.madefromquantity_mass.V_ContQuantity','ro.madefromquantity_area.V_ContQuantity',
					'ro.madefromquantity_volume.V_ContQuantity','ro.madefromquantity_AsRequired.AsRequired',
					'ro.MadeFromQuantity_Rectangular.Length','ro.MadeFromQuantity_Rectangular.Width',
					'ro.VPMInstanceQuantity_Area.V_ContQuantity','ro.VPMInstanceQuantity_Mass.V_ContQuantity',
					'ro.VPMInstanceQuantity_Volume.V_ContQuantity','ro.VPMInstanceQuantity_Length.V_ContQuantity',
					'ro.VPMInstanceQuantity_AsRequired.AsRequired','ro.VPMInstanceQuantity_Rectangular.Length',
					'ro.VPMInstanceQuantity_Rectangular.Width','ds6w:reservedBy','cestamp'
				],
				locale: 'zh',
				tenant: 'OnPremise',
				paths: [[physicalId]],
				sequence_filter: [{
					definition: [{
						type_filter_rel: ['VPMInstance', 'VPMRepInstance'],
						'q.query': 'NOT ([ds6wg:SynchroEBOMExt.V_InEBOMUser]:"FALSE" )'
					}]
				}],
				types: ['VPMReference', 'VPMRepReference', 'VPMInstance', 'Document'],
				extensions: ['XCADExtension', 'XP_VPMReference_Ext', 'EnterpriseExtension', 'DELFmiContQuantity_Mass', 'DELFmiContQuantity_Volume'],
				source: 'cstorage',
				static_mapping: false,
				format: 'entity_relation_occurrence'
			},
			cv: {
				batch: {
					expands: [{
						filter: {
							and: {
								filters: [
									{
										prefix_filter: {
											prefix_path: [{ physical_id_path: [physicalId] }]
										}
									},
									{
										and: {
											filters: [{
												sequence_filter: {
													sequence: [{
														uql: '((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance")) AND (NOT (ds6wg_58_synchroebomext_46_v_95_inebomuser:"FALSE" ))'
													}]
												}
											}]
										}
									}
								]
							}
						},
						root: { physical_id: physicalId },
						label,
						graph: {
							descending_condition_relation: {
								uql: 'NOT (flattenedtaxonomies:"reltypes/XCADBaseDependency") AND ((flattenedtaxonomies:"reltypes/VPMInstance") OR (flattenedtaxonomies:"reltypes/VPMRepInstance"))'
							},
							descending_condition_object: {
								uql: '(flattenedtaxonomies:"types/Drawing") OR ds6w_58_globaltype:"ds6w:Part"'
							}
						},
						aggregation_processors: [{
							truncate: {
								max_distance_from_prefix: 1,
								prefix_filter: {
									prefix_path: [{ physical_id_path: [physicalId] }]
								}
							}
						}]
					}]
				},
				outputs: {
					hits: {
						predefined_computation: ['icons', 'urlstream|thumbnail_2d|2dthb|allrefs']
					},
					select_object: [
						'ds6w:label','ds6w:modified','ds6w:created','ds6w:description','ds6wg:revision',
						'ds6w:cadMaster','ds6w:responsible','owner','ds6w:status','ds6w:type',
						'ds6wg:EnterpriseExtension.V_PartNumber','ds6wg:MaterialUsageExtension.DeclaredQuantity',
						'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity','ds6wg:DELFmiContQuantity_Volume.V_ContQuantity',
						'ds6wg:raw_material.v_dimensiontype','type','physicalid','ds6w:policy',
						'ds6w:reservedBy','ds6w:globalType','ds6w:manufacturable','pathsr',
						'ds6w:isLastRevision','ds6w:reserved','ds6w:identifier','cestamp'
					],
					select_relation: [
						'ds6w:label','ds6w:type','ds6wg:SynchroEBOMExt.V_InEBOMUser','physicalid',
						'ro.plminstance.V_treeorder','ds6wg:raw_material.v_dimensiontype',
						'ro.madefromquantity_length.V_ContQuantity','ro.madefromquantity_mass.V_ContQuantity',
						'ro.madefromquantity_area.V_ContQuantity','ro.madefromquantity_volume.V_ContQuantity',
						'ro.madefromquantity_AsRequired.AsRequired','ro.MadeFromQuantity_Rectangular.Length',
						'ro.MadeFromQuantity_Rectangular.Width','ro.VPMInstanceQuantity_Area.V_ContQuantity',
						'ro.VPMInstanceQuantity_Mass.V_ContQuantity','ro.VPMInstanceQuantity_Volume.V_ContQuantity',
						'ro.VPMInstanceQuantity_Length.V_ContQuantity','ro.VPMInstanceQuantity_AsRequired.AsRequired',
						'ro.VPMInstanceQuantity_Rectangular.Length','ro.VPMInstanceQuantity_Rectangular.Width',
						'ds6w:reservedBy','cestamp'
					],
					format: 'entity_relation_occurrence'
				}
			}
		};
		/* eslint-enable */

		console.log('[ExpandAPI] DB模式 请求参数:', JSON.stringify(params, null, 2));

		try {
			const response = await http.post(url, params as unknown as Record<string, unknown>);

			console.log('[ExpandAPI] DB模式 展开数据响应:', response);
			return response as ExpandResponse;
		} catch (error) {
			console.error('[ExpandAPI] DB模式 获取展开数据失败:', error);
			throw error;
		}
	}

	/**
	 * 从数据库模式展开响应中提取零件基本信息
	 * @param response 数据库模式展开接口响应
	 * @param physicalId 零件 physicalId
	 * @returns 零件信息对象
	 */
	extractPartInfoFromDbExpand(response: ExpandResponse, physicalId: string): Record<string, string> | null {
		if (!response || !response.results || response.results.length === 0) {
			return null;
		}

		// 在 results 中找到根节点（resourceid 匹配且不是关系对象）
		const rootNode = response.results.find(item => {
			if ('Path' in item) return false;
			const record = item as unknown as Record<string, unknown>;
			// 排除关系对象（有 from 和 to 字段）
			if (record.from && record.to) return false;
			return record.resourceid === physicalId;
		}) as unknown as Record<string, string> | undefined;

		if (!rootNode) {
			console.warn('[ExpandAPI] DB模式 未找到根节点:', physicalId);
			return null;
		}

		console.log('[ExpandAPI] DB模式 提取到的根节点:', rootNode);

		// 将 ExpandNode 字段映射为 PartInfo 格式
		return {
			'ds6w:label': rootNode['ds6w:label'] || '',
			'type_icon_url': rootNode['icon'] || rootNode['thumbnail_2d'] || '',
			'ds6w:globalType': rootNode['ds6w:globalType'] || '',
			'ds6w:cadMaster': rootNode['ds6w:cadMaster'] || '',
			'ds6wg:EnterpriseExtension.V_PartNumber': rootNode['ds6wg:EnterpriseExtension.V_PartNumber'] || '',
			'ds6w:reservedBy': rootNode['ds6w:reservedBy'] || '',
			'ds6w:type': rootNode['ds6w:type'] || '',
			'ds6w:responsible': rootNode['ds6w:responsible'] || '',
			'ds6wg:DELFmiContQuantity_Mass.V_ContQuantity': '',
			'ds6wg:revision': rootNode['ds6wg:revision'] || '',
			'thumbnail_2d': rootNode['icon'] || rootNode['thumbnail_2d'] || '',
			'ds6w:policy': rootNode['ds6w:policy'] || rootNode.policy || '',
			'ds6w:modified': rootNode['ds6w:modified'] || '',
			'owner': rootNode['owner'] || '',
			'resourceid': rootNode.resourceid || physicalId,
			'ds6w:description': rootNode['ds6w:description'] || '',
			'ds6w:reserved': rootNode['ds6w:reserved'] || '',
			'ds6wg:DELFmiContQuantity_Volume.V_ContQuantity': '',
			'ds6w:isLastRevision': rootNode['ds6w:isLastRevision'] || rootNode.islastrevision || '',
			'ds6w:identifier': rootNode['ds6w:identifier'] || '',
			'ds6wg:MaterialUsageExtension.DeclaredQuantity': '',
			'ds6w:manufacturable': rootNode['ds6w:manufacturable'] || '',
			'ds6w:status': rootNode['ds6w:status'] || '',
			'ds6w:created': rootNode['ds6w:created'] || '',
			'preview_url': '',
			'physicalid': rootNode.resourceid || physicalId
		};
	}

	/**
	 * 解析展开数据为树形结构
	 * @param response 展开接口响应
	 * @param rootPhysicalId 根节点 physicalId
	 * @returns 树形结构数据
	 */
	parseExpandData(response: ExpandResponse, rootPhysicalId: string): TreeNode[] {
		if (!response || !response.results || response.results.length === 0) {
			return [];
		}

		// 分离节点、关系和路径
		const nodes: Map<string, ExpandNode> = new Map();
		const relations: Map<string, ExpandRelation> = new Map();
		const paths: string[][] = [];

		response.results.forEach(item => {
			if ('Path' in item) {
				// 这是路径数据
				paths.push(item.Path);
			} else if ('resourceid' in item) {
				// 判断是节点还是关系
				const record = item as any;
				if (record.from && record.to) {
					// 这是关系（VPMInstance）
					relations.set(record.resourceid, record as ExpandRelation);
				} else {
					// 这是节点（VPMReference）
					nodes.set(record.resourceid, record as ExpandNode);
				}
			}
		});

		console.log('[ExpandAPI] 解析节点数量:', nodes.size);
		console.log('[ExpandAPI] 解析关系数量:', relations.size);
		console.log('[ExpandAPI] 解析路径数量:', paths.length);

		// 构建树形结构
		const treeNodes: TreeNode[] = [];

		// 找到所有直接子节点（路径中第二个位置是关系ID，第三个是子节点ID）
		const childPaths = paths.filter(path => path.length >= 3 && path[0] === rootPhysicalId);

		childPaths.forEach(path => {
			const relationId = path[1]; // 关系ID（VPMInstance）
			const childId = path[2]; // 子节点ID（VPMReference）

			const node = nodes.get(childId);
			const relation = relations.get(relationId);

			if (node) {
				const treeNode = this.createTreeNode(node, relation, 0, path);
				treeNodes.push(treeNode);
			}
		});

		return treeNodes;
	}

	/**
	 * 创建树节点
	 */
	private createTreeNode(node: ExpandNode, relation: ExpandRelation | undefined, level: number, path: string[]): TreeNode {
		// 格式化状态
		const statusRaw = node['ds6w:status'] || '';
		let statusText = '工作中';
		if (statusRaw.includes('IN_WORK')) {
			statusText = '工作中';
		} else if (statusRaw.includes('RELEASED')) {
			statusText = '已发布';
		} else if (statusRaw.includes('FROZEN')) {
			statusText = '已冻结';
		} else if (statusRaw.includes('OBSOLETE')) {
			statusText = '废弃';
		} else if (statusRaw.includes('PRIVATE')) {
			statusText = '私有';
		}

		// 格式化日期
		let modifiedText = '-';
		if (node['ds6w:modified']) {
			try {
				const date = new Date(node['ds6w:modified']);
				modifiedText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
			} catch {
				modifiedText = node['ds6w:modified'];
			}
		}

		// 判断是否最新修订版
		const isLastRev = String(node['ds6w:isLastRevision'] || node.islastrevision || '').toLowerCase() === 'true';

		// 判断是否锁定
		const isReserved = node['ds6w:reserved'] === 'TRUE' || node['ds6w:reserved'] === 'true';

		return {
			id: relation?.resourceid || path.join('/'),
			resourceid: node.resourceid,
			relationId: relation?.resourceid,
			label: node['ds6w:label'] || '-', // 标题 - 零件的 ds6w:label
			partNumber: node['ds6wg:EnterpriseExtension.V_PartNumber'] || '无', // 企业项目编号
			revision: node['ds6wg:revision'] || '-', // 修订版
			instanceLabel: relation?.['ds6w:label'] || '-', // 标题(实例) - 关系的 ds6w:label
			isLastRevision: isLastRev, // 最新修订版
			status: statusText, // 成熟度状态（显示文本）
			statusRaw: statusRaw, // 原始状态值（用于颜色）
			owner: node['ds6w:responsible'] || '-', // 所有者
			reserved: isReserved, // 锁定状态
			modified: modifiedText, // 修改日期
			globalType: node['ds6w:type'] || '-', // 类型
			identifier: node['ds6w:identifier'] || '-', // 名称
			icon: node.icon || '', // 图标
			type_icon_url: node.type_icon_url || node.thumbnail_2d || '', // 类型图标回退
			policy: node['ds6w:policy'] || node.policy || '',
			cadMaster: node['ds6w:cadMaster'] || '',
			typeDisplayName: node['ds6w:globalType'] || node['ds6w:type'] || '',
			level,
			children: [],
			isExpanded: false,
			hasChildren: true, // 默认可展开，实际展开时再判断
			path
		};
	}
}

export const expandApi = new ExpandAPI();
export default expandApi;
