---
name: "tw-engineering-release"
description: "TW_EngineeringRelease 3DEXPERIENCE Widget 项目接口复用指南。包含所有 API 模块、请求工具、类型定义和复用场景。Invoke when modifying TW_EngineeringRelease project, adding new features, or calling 3DSpace/3DDashboard APIs."
---

# TW_EngineeringRelease 项目接口复用指南

## 1. 项目架构概览

本项目是 3DEXPERIENCE Widget 应用，技术栈：
- Vue 3 + TypeScript + Vite
- Element Plus UI
- Pinia 状态管理
- 3DDashboard Widget 环境（`@widget-lab/3ddashboard-utils`）

### 核心目录结构
```
src/
├── api/                    # 所有 API 接口
│   ├── base.ts            # BaseAPI 基类
│   ├── types.ts           # 通用类型（ApiResponse, PageParams, PageResult）
│   ├── index.ts           # API 统一导出
│   ├── api.ts             # 通用 API（占位）
│   ├── searchApi.ts       # 搜索 API（独立类）
│   ├── recentApi.ts       # 最近记录 API（独立类）
│   ├── documentApi.ts     # 文档上传 API（独立类）
│   ├── expandApi.ts       # BOM 展开 API（独立类）
│   ├── partDetailApi.ts   # 零件详情 API（独立类）
│   ├── vplm/              # VPLM 服务 API
│   ├── collab/            # 协作服务 API（创建内容）
│   ├── modeler/           # 建模服务 API
│   ├── authoring/         # 内容获取服务 API
│   └── widget/            # Widget/3DDashboard API
├── utils/
│   ├── ds-request.ts      # 核心请求工具（WAFData 封装）
│   ├── request.ts         # Axios 请求工具（备用）
│   └── env.ts             # 环境变量
├── store/
│   └── modules/
│       ├── baseInfo.ts    # 基础信息 Store（URL/SecurityContext）
│       └── queryMode.ts   # 查询模式 Store
└── views/                 # 页面/弹框组件
```

---

## 2. 请求层复用（ds-request.ts）

### 2.1 核心请求工具

文件：`src/utils/ds-request.ts`

**所有 3DSpace API 请求必须复用此工具**，它封装了：
- WAFData.authenticatedRequest 认证请求
- 自动处理 3DSpace / 3DSearch / 3DDashboard 三种 baseURL
- SecurityContext 请求头注入
- 开发环境 CSRF Token 模拟

#### 导出对象

| 对象 | 用途 | baseURL |
|------|------|---------|
| `http` | 3DSpace 请求 | spaceBaseURL |
| `searchHttp` | 搜索服务请求 | searchBaseURL |
| `dashboardPost` / `dashboardGet` | 3DDashboard 请求 | window.location.origin |

#### http 方法签名

```typescript
// GET 请求（JSON 响应）
http.get(url: string, params?: Record<string, unknown>): Promise<any>

// GET 请求（纯文本响应）
http.getText(url: string, params?: Record<string, unknown>): Promise<any>

// POST 请求
http.post(url: string, data?: Record<string, unknown> | unknown[], headers?: Record<string, string>): Promise<any>

// PUT 请求
http.put(url: string, data?: Record<string, unknown>, headers?: Record<string, string>): Promise<any>

// PUT form-urlencoded
http.putForm(url: string, data?: Record<string, unknown>, headers?: Record<string, string>): Promise<any>

// DELETE 请求
http.delete(url: string, params?: Record<string, unknown>): Promise<any>
```

#### searchHttp 方法签名

```typescript
searchHttp.get(url: string, params?: Record<string, unknown>): Promise<any>
searchHttp.post(url: string, data?: Record<string, unknown>): Promise<any>
```

**复用建议**：
- 所有新的 3DSpace 接口调用 → 使用 `http`
- 所有新的搜索接口调用 → 使用 `searchHttp`
- 所有 3DDashboard 接口调用 → 使用 `dashboardPost` / `dashboardGet`
- **不要** 直接使用 `request.ts`（Axios），除非调用外部非 3DEXPERIENCE 服务

---

## 3. API 模块复用清单

### 3.1 BaseAPI 基类（复用指数：⭐⭐⭐⭐⭐）

文件：`src/api/base.ts`

```typescript
class BaseAPI {
  protected async get<T>(url: string, params?: Record<string, unknown>): Promise<any>
  protected async post<T>(url: string, data?: Record<string, unknown>, config?: { headers?: Record<string, string> }): Promise<any>
  protected async put<T>(url: string, data?: Record<string, unknown>): Promise<any>
  protected async deleteRequest<T>(url: string, params?: Record<string, unknown>): Promise<any>
}
```

**复用场景**：所有新的 API 模块都应继承 BaseAPI，自动获得：
- 统一的 URL 前缀处理
- 类型安全的请求方法
- 一致的响应处理模式

### 3.2 VplmAPI（复用指数：⭐⭐⭐⭐⭐）

文件：`src/api/vplm/vplmApi.ts`

| 方法 | 接口路径 | 用途 | 可复用场景 |
|------|----------|------|-----------|
| `getCreateContext()` | GET `/resources/vplmte/getcreatectx` | 获取创建上下文（协作空间列表） | **任何创建操作前获取 SecurityContext** |
| `getAdmContext()` | GET `/resources/vplmte/getadmctx` | 获取管理上下文 | 需要管理员权限时 |
| `getAllContext()` | GET `/resources/vplmte/getallctx` | 获取所有上下文 | 上下文选择器 |
| `getDgnContext()` | GET `/resources/vplmte/getdgnctx` | 获取设计上下文 | 设计相关操作 |
| `getTypeInfo()` | POST `/resources/v1/collabServices/authoring/createContent/typeInfo` | 获取类型信息（属性定义） | **创建产品/零件/工程图前获取表单字段** |

**类型定义**：`src/api/vplm/vplmTypes.ts`
- `CreateResponse` - 上下文响应
- `TypeInfoResponse` - 类型信息响应（含 attributes、subTypes）
- `TypeInfoParams` - 类型信息请求参数
- `TemplateAttribute` - 属性模板定义

**复用建议**：
- 新增创建功能 → 复用 `getTypeInfo()` 动态获取表单字段
- 需要协作空间选择 → 复用 `getCreateContext()`

### 3.3 CollabAPI（复用指数：⭐⭐⭐⭐⭐）

文件：`src/api/collab/collabApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `createProduct()` | POST `/resources/v1/collabServices/authoring/createContent/Create?typeName=assembly` | 创建产品 |
| `createDrawing()` | POST `/resources/v1/collabServices/authoring/createContent/Create?typeName=drawing` | 创建工程图 |
| `createComponent()` | POST `/resources/v1/collabServices/authoring/createContent/Create?typeName=component` | 创建零件 |

**类型定义**：`src/api/collab/collabTypes.ts`
- `CreateContentRequest` - 创建请求体（create + metrics）
- `CreateContentResponse` - 创建响应
- `CreateContentQueryParams` - 查询参数（tenant, appName, typeName 等）
- `DataElements` - 创建结果数据元素

**复用建议**：
- 新增创建类型 → 参考 `createProduct/createDrawing/createComponent` 模式，修改 `typeName` 参数即可
- 统一的 `buildCreateQueryParams()` 私有方法可提取为通用工具

### 3.4 AuthoringAPI（复用指数：⭐⭐⭐⭐⭐）

文件：`src/api/authoring/authoringApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `fetchProduct()` | POST `/resources/enoauthoring/fetch/v1` | 通用产品详情获取 |
| `fetchProductFull()` | 封装 `fetchProduct()` | 获取完整产品详情（预定义字段） |
| `fetchProductLite()` | 封装 `fetchProduct()` | 获取精简产品详情（预定义字段） |

**类型定义**：`src/api/authoring/authoringTypes.ts`
- `FetchProductRequest` - 请求体（physicalid, select_predicate, types, extensions 等）
- `FetchProductResponse` - 响应
- `FULL_SELECT_PREDICATE` / `LITE_SELECT_PREDICATE` - 预定义查询字段常量

**复用建议**：
- 获取任何 3DSpace 对象详情 → 复用 `fetchProduct()`，传入自定义 `select_predicate`
- 新增详情展示 → 复用 `fetchProductFull()` 或 `fetchProductLite()`
- `FULL_SELECT_PREDICATE` 和 `LITE_SELECT_PREDICATE` 可直接复用或扩展

### 3.5 ModelerAPI（复用指数：⭐⭐⭐）

文件：`src/api/modeler/modelerApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `set3DPartTemplateExpression()` | POST `/resources/v1/modelerServices/authoring/op/set3DPartTemplateExpression` | 设置 3D 零件模板 |
| `getCADOriginsTypes()` | POST `/resources/v1/modelerServices/authoring/op/getCADOriginsTypes` | 获取 CAD 原点类型 |

### 3.6 WidgetAPI（复用指数：⭐⭐⭐⭐）

文件：`src/api/widget/widgetApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `getSecurityContext()` | GET `/resources/pno/person/getsecuritycontext` | 获取安全上下文 |
| `editWidgetInstance()` | POST `/api/widget-instances/edit` | 更新 Widget 实例（3DDashboard） |
| `getContextTree()` | GET `/api/widget-instances/contextTree` | 获取上下文树（最近产品） |

**复用建议**：
- Widget 实例操作 → 复用 `editWidgetInstance()` / `getContextTree()`
- 注意：这两个方法使用 `dashboardPost` / `dashboardGet`，不是 3DSpace 请求

### 3.7 SearchAPI（复用指数：⭐⭐⭐⭐⭐）

文件：`src/api/searchApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `searchMyProducts()` | POST `/search` | 搜索当前用户的产品（默认参数） |
| `searchWithQuery()` | 封装 `searchMyProducts()` | 使用自定义查询语句搜索 |

**类型定义**：
- `SearchParams` - 搜索参数（label, nresults, query, select_predicate, select_file 等）
- `SearchResponse` - 搜索响应（results, infos）
- `AttributeItem` - 属性项（format, name, type, value）

**复用建议**：
- 任何搜索需求 → 复用 `searchMyProducts()`，传入自定义 `query` 和 `select_predicate`
- 搜索其他类型 → 修改 `query` 参数（如 `[flattenedtaxonomies]:types/Document`）

### 3.8 RecentAPI（复用指数：⭐⭐⭐⭐）

文件：`src/api/recentApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `getRecentIds()` | GET `/resources/AppsMngt/user/preference` | 获取最近访问的 physicalid 列表 |
| `addRecentId()` | PUT `/resources/AppsMngt/user/preference` | 添加 physicalid 到最近记录 |
| `fetchDetailsByIds()` | POST `/cvservlet/fetch/v2` | 批量获取产品详情 |
| `getRecentProducts()` | 组合接口 | 获取最近产品完整列表 |

**复用建议**：
- 需要记录用户最近访问 → 复用 `addRecentId()`
- 批量获取对象详情 → 复用 `fetchDetailsByIds()`（支持最多 20 个 ID）

### 3.9 ExpandAPI（复用指数：⭐⭐⭐⭐⭐）

文件：`src/api/expandApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `getExpandData()` | POST `/cvservlet/progressiveexpand/v2` | BOM 展开（索引模式） |
| `getExpandDataDbMode()` | POST `/resources/enoauthoring/expand/v2/progressive` | BOM 展开（数据库模式） |
| `getSpecificationDocuments()` | GET `/resources/v1/modeler/documents/parentId/{id}` | 获取关联文档 |
| `parseExpandData()` | 纯前端方法 | 解析展开数据为树形结构 |
| `parseDocumentsToTreeNodes()` | 纯前端方法 | 文档数据转树节点 |

**类型定义**：
- `ExpandRequestParams` - 展开请求参数（复杂嵌套结构）
- `ExpandResponse` - 展开响应
- `TreeNode` - 树形节点（通用，含 id, label, children, level 等）

**复用建议**：
- BOM 结构展示 → 复用 `getExpandData()` 或 `getExpandDataDbMode()`
- 树形数据解析 → 复用 `parseExpandData()`
- `TreeNode` 类型可作为通用树节点类型复用

### 3.10 DocumentAPI（复用指数：⭐⭐⭐⭐）

文件：`src/api/documentApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `getCheckinTicket()` | PUT `/resources/v1/modeler/documents/files/CheckinTicket` | 获取文件上传 Ticket |
| `getFCSStores()` | GET `/resources/fcsservices/stores` | 获取 FCS 存储信息 |
| `uploadFileToFCS()` | POST `{ticketURL}` | 上传文件到 FCS |
| `createDocument()` | POST `/resources/v1/modeler/documents/` | 创建文档对象 |
| `uploadDocument()` | 组合方法 | 完整文档上传流程 |
| `relateDocuments()` | POST `/resources/v1/modeler/documents/` | 关联文档到父对象 |

**复用建议**：
- 文件上传功能 → 复用完整的 `uploadDocument()` 流程
- 关联现有文档 → 复用 `relateDocuments()`

### 3.11 PartDetailAPI（复用指数：⭐⭐⭐⭐）

文件：`src/api/partDetailApi.ts`

| 方法 | 接口路径 | 用途 |
|------|----------|------|
| `getPartDetail()` | POST `/cvservlet/fetch/v2` | 获取零件详情 |
| `setPartNumbers()` | POST `/resources/v1/partnumbermanagement/setPartNumbers` | 设置企业项目编号 |

**类型定义**：
- `PartInfo` - 零件信息（解析后的键值对）
- `PartInfoRaw` - 原始响应格式
- `parsePartInfo()` - 解析函数

---

## 4. Store 复用

### 4.1 baseInfo Store（复用指数：⭐⭐⭐⭐⭐）

文件：`src/store/modules/baseInfo.ts`

```typescript
const baseInfoStore = useBaseInfoStore();

// 状态
baseInfoStore.spaceUrl      // 3DSpace URL
baseInfoStore.searchUrl     // 3DSearch URL
baseInfoStore.securityContext // SecurityContext
baseInfoStore.currentUser   // 当前用户

// 方法
await baseInfoStore.fetchSpaceUrl();      // 获取 3DSpace URL
await baseInfoStore.fetchSearchUrl();     // 获取 3DSearch URL
await baseInfoStore.getCollaborativeSpace(); // 获取 SecurityContext
```

**复用建议**：
- **所有 API 类中都已复用此 Store** 自动获取 URL 和 SecurityContext
- 新增 API 模块时，参考现有模式：在方法开头检查并获取 `spaceUrl` 和 `securityContext`

### 4.2 queryMode Store（复用指数：⭐⭐⭐）

文件：`src/store/modules/queryMode.ts`

管理查询模式切换（索引模式 / 数据库模式）和倒计时。

---

## 5. 通用类型复用

### 5.1 通用响应类型

文件：`src/api/types.ts`

```typescript
interface ApiResponse<T = unknown> {
  msg: string | null;
  code: number;
  data: T;
}

interface PageParams {
  page: number;
  pageSize: number;
}

interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 5.2 属性项类型

多个 API 模块共用类似的属性项结构：

```typescript
// authoringTypes.ts / searchApi.ts / partDetailApi.ts
interface AttributeItem {
  format: string;
  name: string;
  type: string;
  value: string;
}
```

**复用建议**：考虑将 `AttributeItem` 提取到 `types.ts` 作为通用类型。

---

## 6. 新增功能时的复用决策树

```
需要调用 3DSpace API?
├── 是 → 使用 ds-request.ts 的 http / searchHttp
│   ├── 获取对象详情 → 复用 AuthoringAPI.fetchProduct()
│   ├── 搜索对象 → 复用 SearchAPI.searchMyProducts()
│   ├── 创建对象 → 复用 CollabAPI.createProduct/Drawing/Component
│   ├── BOM 展开 → 复用 ExpandAPI.getExpandData()
│   ├── 文件上传 → 复用 DocumentAPI.uploadDocument()
│   └── 其他 → 继承 BaseAPI 创建新模块
│
├── 需要调用 3DDashboard API?
│   └── 使用 ds-request.ts 的 dashboardPost / dashboardGet
│       ├── Widget 实例操作 → 复用 WidgetAPI
│       └── 其他 → 参考 WidgetAPI 模式
│
└── 需要获取基础信息?
    ├── 3DSpace URL → baseInfoStore.fetchSpaceUrl()
    ├── 3DSearch URL → baseInfoStore.fetchSearchUrl()
    └── SecurityContext → baseInfoStore.getCollaborativeSpace()
```

---

## 7. 接口清单汇总

### 7.1 3DSpace REST API

| # | 接口路径 | 方法 | 所属 API | 用途 |
|---|----------|------|----------|------|
| 1 | `/resources/vplmte/getcreatectx` | GET | VplmAPI | 获取创建上下文 |
| 2 | `/resources/vplmte/getadmctx` | GET | VplmAPI | 获取管理上下文 |
| 3 | `/resources/vplmte/getallctx` | GET | VplmAPI | 获取所有上下文 |
| 4 | `/resources/vplmte/getdgnctx` | GET | VplmAPI | 获取设计上下文 |
| 5 | `/resources/v1/collabServices/authoring/createContent/typeInfo` | POST | VplmAPI | 获取类型信息 |
| 6 | `/resources/v1/collabServices/authoring/createContent/Create` | POST | CollabAPI | 创建产品/零件/工程图 |
| 7 | `/resources/v1/modelerServices/authoring/op/set3DPartTemplateExpression` | POST | ModelerAPI | 设置 3D 零件模板 |
| 8 | `/resources/v1/modelerServices/authoring/op/getCADOriginsTypes` | POST | ModelerAPI | 获取 CAD 原点类型 |
| 9 | `/resources/enoauthoring/fetch/v1` | POST | AuthoringAPI | 获取产品详情 |
| 10 | `/resources/pno/person/getsecuritycontext` | GET | WidgetAPI | 获取安全上下文 |
| 11 | `/search` | POST | SearchAPI | 搜索服务 |
| 12 | `/resources/AppsMngt/user/preference` | GET/PUT | RecentAPI | 用户偏好/最近记录 |
| 13 | `/cvservlet/fetch/v2` | POST | RecentAPI / PartDetailAPI | 批量获取详情 |
| 14 | `/cvservlet/progressiveexpand/v2` | POST | ExpandAPI | BOM 展开（索引） |
| 15 | `/resources/enoauthoring/expand/v2/progressive` | POST | ExpandAPI | BOM 展开（数据库） |
| 16 | `/resources/v1/modeler/documents/files/CheckinTicket` | PUT | DocumentAPI | 获取上传 Ticket |
| 17 | `/resources/fcsservices/stores` | GET | DocumentAPI | 获取 FCS 存储 |
| 18 | `/resources/v1/modeler/documents/` | POST | DocumentAPI | 创建/关联文档 |
| 19 | `/resources/v1/modeler/documents/parentId/{id}` | GET | ExpandAPI | 获取关联文档 |
| 20 | `/resources/v1/partnumbermanagement/setPartNumbers` | POST | PartDetailAPI | 设置企业项目编号 |

### 7.2 3DDashboard API

| # | 接口路径 | 方法 | 所属 API | 用途 |
|---|----------|------|----------|------|
| 1 | `/api/widget-instances/edit` | POST | WidgetAPI | 更新 Widget 实例 |
| 2 | `/api/widget-instances/contextTree` | GET | WidgetAPI | 获取上下文树 |

---

## 8. 新增 API 模块模板

如需新增 API 模块，使用以下模板：

```typescript
// src/api/newmodule/newmoduleApi.ts
import BaseAPI from '../base';
import type { SomeRequest, SomeResponse } from './newmoduleTypes';

class NewModuleAPI extends BaseAPI {
  constructor() {
    super(''); // 或传入前缀路径
  }

  async someOperation(data: SomeRequest, headers?: Record<string, string>) {
    try {
      const response = await this.post<SomeResponse>('/resources/...', data as unknown as Record<string, unknown>, { headers });
      return response;
    } catch (error) {
      console.error('someOperation error:', error);
      throw error;
    }
  }
}

export default new NewModuleAPI();
```

```typescript
// src/api/newmodule/newmoduleTypes.ts
export interface SomeRequest {
  // 请求参数
}

export interface SomeResponse {
  // 响应数据
}
```

```typescript
// src/api/index.ts - 添加导出
export { default as NewModuleAPI } from './newmodule/newmoduleApi';
export * from './newmodule/newmoduleTypes';
```

---

## 9. 注意事项

1. **SecurityContext**：所有写操作（POST/PUT/DELETE）通常需要在 URL 或 Header 中传入 `SecurityContext`
2. **tenant 参数**：几乎所有接口都需要 `tenant=OnPremise` 查询参数
3. **xrequestedwith**：部分接口需要 `xrequestedwith=xmlhttprequest`
4. **label 字段**：搜索/展开接口需要唯一的 label，建议使用 `xEngineer-${user}-${timestamp}` 格式
5. **开发环境**：`isDev` 为 true 时使用本地代理，且使用写死的 SecurityContext
6. **错误处理**：所有 API 方法都使用 try-catch 包裹，并在控制台输出错误日志
