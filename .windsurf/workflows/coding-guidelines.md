---
description: 项目编码准则与最佳实践
tags: [guidelines, vue, typescript, 3ddashboard]
---

# 项目编码准则

## 一、语法规范

### 1.1 基础格式（由 ESLint + Prettier 强制执行）

| 规则         | 配置                                |
| ------------ | ----------------------------------- |
| 缩进         | Tab（非空格）                       |
| 引号         | 单引号 `'string'`                   |
| 分号         | 必须 `;`                            |
| 大括号风格   | `1tbs`：`if (x) {` 同行             |
| 箭头函数括号 | 避免 `(x) =>` 写为 `x =>`（单参数） |
| 尾随逗号     | 禁止 `,`                            |
| console      | 生产环境警告，开发环境允许          |

### 1.2 TypeScript 规范

- **禁止 `any` 泛滥**：`@typescript-eslint/no-explicit-any: off` 不代表可以滥用 `any`，仅在 WAFData/3DDashboard 等外部无类型 API 处使用
- **显式类型声明优先**：函数参数和返回值尽量声明类型，不要依赖推断
- **使用 `as` 断言要加注释**：说明为何需要断言

```ts
// Good
const postJson = async (path: string, body: any): Promise<any> => {
	return http.post(url, body);
};

// Bad - 缺少返回类型，编译器推断可能不对
const postJson = async (path: string, body: any) => {
	return http.post(url, body);
};
```

### 1.3 Vue 规范

- **使用 Composition API + `<script setup>`**，禁止 Options API
- **组件名 PascalCase**：`InternalConfig.vue`
- **Props 尽量显式声明类型**：
  ```ts
  const props = defineProps<{ physicalId?: string }>();
  ```
- **事件使用 kebab-case**：`@click="handleAddClick"`
- **模板中禁止复杂表达式**：提取为 `computed` 或方法
- **ref 命名语义化**：`loading` / `errorMsg` / `referencesInfo`

---

## 二、复用接口的原则

### 2.1 所有 REST 请求必须经过 `ds-request.ts`

**绝对禁止**在组件中直接使用原生 `fetch` 或 `axios`。

```ts
// ✅ 正确 - 使用项目封装的 http
import http from '@/utils/ds-request';
const response = await http.post('/resources/modeler/configuration/...', body);

// ❌ 错误 - 直接 fetch，3DDashboard 中认证会失败
const res = await fetch('/resources/...', { method: 'POST', ... });
```

### 2.2 URL 构造规则

- **相对路径**：`/resources/xxx?tenant=OnPremise`
- **不要自行拼接 baseURL**：`http.post` 内部自动附加 `spaceBaseURL`
- **tenant 固定写死**：`tenant=OnPremise`（3DDashboard 环境下）

### 2.3 请求封装层级

```
┌─────────────────────────────────────┐
│  Vue Component / Composable         │  ← 只关心业务参数
│  import http from '@/utils/ds-request' │
├─────────────────────────────────────┤
│  ds-request.ts                      │  ← 封装 WAFData.authenticatedRequest
│  处理：baseURL、SecurityContext、CSRF  │
├─────────────────────────────────────┤
│  WAFData (3DDashboard 原生)          │  ← 不要直接调用
└─────────────────────────────────────┘
```

### 2.4 新增 API 的规范

1. 如果是已有资源的同类操作，直接复用 `http.post/get/put/delete`
2. 如果接口逻辑复杂，在 `src/api/` 下新建类，**但仍然基于 `http` 封装**：
   ```ts
   import http from '@/utils/ds-request';
   export const someApi = {
   	doSomething: params => http.post('/resources/...', params)
   };
   ```

---

## 三、最小改动修复 Bug

### 3.1 核心原则：Root Cause > Workaround

- **先定位根因**：通过日志、断点、Network 面板确认问题所在
- **上游修复优先**：如果问题出在封装层（如 `ds-request.ts`），修复封装层，不要每个调用方打补丁
- **单点修复**：一个 Bug 只改一行代码是理想状态

### 3.2 禁止的操作

| 禁止                                   | 替代方案                               |
| -------------------------------------- | -------------------------------------- |
| 在 5 个组件里复制粘贴同样的 workaround | 在 `ds-request.ts` 里统一修复          |
| 用 `setTimeout` 延迟来掩盖异步问题     | 使用 `await` 或 `Promise` 正确链式调用 |
| 添加冗余的 `try/catch` 掩盖错误        | 让错误上浮，在统一的地方处理           |
| 用 `any` 绕过类型检查                  | 声明正确的类型接口                     |

### 3.3 修改前检查清单

- [ ] 这个改动是否影响其他调用方？
- [ ] 是否可以抽成一个公共函数？
- [ ] 是否添加了回归测试/验证步骤？
- [ ] 改动是否最小化（不重构无关代码）？

### 3.4 Vue 文件修改的特别注意

**IDE 自动格式化可能破坏代码**。特别是：

- 模板中的内联表达式可能被拆断
- 标签可能被意外分割（如 `</el-button>` 变成 `</` + `el-button>`）
- `||` 可能被格式化为 `|`（bitwise OR）

**防护措施**：

1. 修改后先 `pnpm build` 确认无误再提交
2. 关闭 "Format On Save" 或将其设为手动触发
3. 重大修改后比对 diff，确认只有预期改动

---

## 四、3DDashboard 环境特化准则

### 4.1 窗口与全局变量

- **不要直接访问 `window.parent`**：使用 `@widget-lab/3ddashboard-utils` 提供的封装
- **全局变量通过 `enoviaServerFilterWidget` 获取**：
  ```ts
  const pwin: any = window.parent;
  const baseURL = pwin?.enoviaServerFilterWidget?.baseURL;
  ```
- **requirejs 模块加载**：使用 `requirejsPromise` 而非直接 `window.require`

### 4.2 模块加载（OOTB 命令调用）

调用 Dassault OOTB 命令时：

1. 使用 `topWindow.require` / `window.requirejs` 加载模块
2. 应用必要的 request patch（拦截 `WAFData.authenticatedRequest`）
3. 完成后清理全局状态

```ts
const requireFn = topWindow.require || topWindow.requirejs || (window as any).require;
const [Cmd, WAFData] = await Promise.all([requireDsModule(requireFn, 'DS/LifecycleCmd/ReviseCmd'), requireDsModule(requireFn, 'DS/WAFData/WAFData')]);
applyRequestPatch(WAFData); // 项目统一封装的 patch
try {
	const cmd = new CmdCtor(widgetData);
	cmd.execute();
} finally {
	cleanupState();
}
```

### 4.3 图标与资源路径

- **图标 URL 使用 `background-image`**，而非 `<img :src>`
- **自动转换 small → large**：
  ```ts
  const largePath = iconPath.replace('/small/', '/large/').replace('.png', '108x144.png');
  const fullUrl = `${baseURL}${largePath}`;
  ```
- **样式中使用**：`:style="{ backgroundImage: \`url(${fullUrl})\` }"`

---

## 五、组件设计原则

### 5.1 单一职责

- 一个组件只做一件事
- 数据获取逻辑抽离到 composable 或 `src/api/`
- UI 状态（loading/error/空状态）在组件内处理

### 5.2 Props 设计

```ts
// 可复用组件：暴露必要参数
const props = defineProps<{
	physicalId?: string; // 外部传入时优先使用
}>();

// 内部兜底：从路由 hash 或全局变量获取
const getPhysicalId = () => {
	if (props.physicalId) return props.physicalId;
	const m = location.hash.match(/#\/part-detail\/([^/?#]+)/);
	return m ? decodeURIComponent(m[1]) : '';
};
```

### 5.3 对话框规范

- **默认支持拖拽**：`<el-dialog draggable ...>`
- **关闭时清理状态**：`@closed="resetState()"`
- **加载状态**：打开即加载， skeleton 占位

---

## 六、状态管理原则

### 6.1 Pinia Store 使用

- **按领域拆分**：`baseInfo.ts`（基础信息）、`user.ts`（用户）等
- **异步 action 使用 `async/await`**
- **状态修改只在 action 中**：不要直接修改 `store.xxx = yyy`

### 6.2 局部状态 vs 全局状态

| 局部状态（组件内 `ref`） | 全局状态（Pinia）    |
| ------------------------ | -------------------- |
| 对话框开关               | 用户信息             |
| 表单输入                 | SecurityContext      |
| 加载状态                 | spaceUrl / searchUrl |
| 列表数据（当前页）       | 全局配置             |

---

## 七、调试与日志规范

### 7.1 Console 日志格式

统一使用带项目前缀的方括号格式：

```ts
console.log('[TW_EngineeringRelease] 操作描述:', 变量);
console.log('[InternalConfig] Request URL:', url);
console.log('[PartDetailAPI] 设置企业项目编号参数:', JSON.stringify(params, null, 2));
console.error('[PartDetailView] 锁定失败:', error);
```

### 7.2 日志内容

- **输入参数**：打印请求体、关键变量
- **响应结果**：打印响应数据（避免打印超大对象）
- **错误详情**：打印完整错误对象和消息

### 7.3 调试技巧

- **开发环境**：`isDev` 判断跳过 3DSpace URL 获取，使用本地 mock
- **Network 面板**：检查 `WAFData.authenticatedRequest` 的实际请求 URL
- **Vue DevTools**：检查组件状态和 Pinia store

---

## 八、跨项目通用准则

### 8.1 代码审查（Self-Review）清单

- [ ] 我是否引入了新的依赖？（尽量避免）
- [ ] 我是否删除了未使用的 import/变量？
- [ ] 我是否在所有分支路径都处理了错误？
- [ ] 我是否验证了 TypeScript 编译通过？
- [ ] 我是否在模板中避免了复杂逻辑？

### 8.2 命名规范

| 类型       | 规范                | 示例                               |
| ---------- | ------------------- | ---------------------------------- |
| 组件       | PascalCase          | `InternalConfig.vue`               |
| composable | camelCase, use 前缀 | `useHeaderActions.ts`              |
| API 模块   | camelCase           | `partDetailApi.ts`                 |
| 常量       | UPPER_SNAKE_CASE    | `MAX_RETRY_COUNT`                  |
| 布尔变量   | 语义前缀            | `isLoading`, `hasModel`, `canEdit` |
| 事件处理   | handle 前缀         | `handleAddClick`, `handleSearch`   |

### 8.3 文件组织

```
src/
├── api/              # 远程 API 封装
├── assets/           # 静态资源
├── components/       # 通用组件（无业务逻辑）
├── composables/      # 可复用逻辑（Vue 组合式函数）
├── router/           # 路由配置
├── store/            # Pinia 状态管理
├── utils/            # 纯工具函数
├── views/            # 页面级组件（有业务逻辑）
```

### 8.4 性能注意

- **大列表使用虚拟滚动**：`el-scrollbar` 或 `vue-virtual-scroller`
- **避免频繁响应式更新**：大数据用 `shallowRef` 代替 `ref`
- **computed 缓存**：复杂计算用 `computed`，不要每次模板重新计算
- **防抖/节流**：搜索输入用 `debounce`，滚动事件用 `throttle`

### 8.5 安全注意

- **禁止在代码中硬编码密钥/Token**
- **用户输入一律转义**：模板中 `{{ userInput }}` 自动转义，但 `v-html` 要警惕
- **XSS 防范**：`v-html` 只用于可信内容

---

## 九、与 AI 协作准则

### 9.1 描述需求时

- 提供完整上下文：文件路径、当前代码、预期行为
- 区分 "怎么做" 和 "做什么"：优先描述目标，让 AI 决定实现方式
- 提供错误信息：完整的报错堆栈、控制台输出

### 9.2 代码修改后

- **立即构建验证**：`pnpm build`
- **检查 diff**：确认只有预期改动
- **关闭自动格式化**：防止 IDE 覆盖 AI 的正确修改

---

_本文档适用于所有基于 Vue 3 + TypeScript + Element Plus 的 3DDashboard 项目，可根据具体项目调整。_
