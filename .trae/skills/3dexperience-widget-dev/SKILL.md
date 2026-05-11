---
name: "3dexperience-widget-dev"
description: "3DEXPERIENCE Widget frontend development expertise covering Vue 3, Element Plus, 3DE API integration, tree structures, drag-and-drop, and BOM expansion. Invoke when working with 3DE Widget projects, adding features, or debugging 3DE-specific functionality."
---

# 3DEXPERIENCE Widget Development

This skill provides comprehensive guidance for developing 3DEXPERIENCE Widget applications.

## Project Structure

Standard 3DE Widget project structure:
```
TW_EngineeringRelease/
├── src/
│   ├── api/              # API modules
│   │   ├── expandApi.ts      # BOM expansion API
│   │   ├── partDetailApi.ts  # Part details
│   │   ├── searchApi.ts      # Product search
│   │   └── recentApi.ts      # Recent products
│   ├── assets/           # Static assets
│   ├── components/       # Vue components
│   ├── router/           # Vue Router config
│   ├── store/            # Pinia state management
│   │   └── modules/
│   │       └── baseInfo.ts   # 3DE context (URLs, SecurityContext)
│   ├── utils/            # Utilities
│   │   └── ds-request.ts     # HTTP request wrapper
│   ├── views/            # Page components
│   └── App.vue
├── package.json
└── vite.config.ts
```

## Key Technologies

- **Vue 3** with Composition API
- **Element Plus** UI library
- **Pinia** for state management
- **Vue Router** for navigation
- **SCSS** for styling
- **TypeScript** for type safety

## Core 3DE APIs

### 1. BOM Expansion API (`cvservlet/progressiveexpand/v2`)

Used to expand part structures and get child components.

```typescript
// Key fields to request
select_object: [
  'ds6w:label',           // Title
  'ds6wg:revision',       // Revision
  'ds6w:status',          // Status
  'ds6w:responsible',     // Owner
  'ds6w:reserved',        // Locked status
  'ds6w:modified',        // Modified date
  'ds6w:type',            // Type
  'ds6w:identifier',      // Name
  'ds6w:isLastRevision',  // Is last revision
  'ds6wg:EnterpriseExtension.V_PartNumber', // Part number
  'icon'                  // Icon URL
]
```

**Response Structure:**
- Nodes (VPMReference): Part information
- Relations (VPMInstance): Connection between parts
- Paths: Hierarchical structure

### 2. Part Detail API

```typescript
// Get part details by physicalId
const response = await partDetailApi.getPartDetail(physicalId);
```

### 3. Search API

```typescript
// Search products
const response = await searchApi.searchProducts(keyword, options);
```

## Common Patterns

### Tree Structure with Lazy Loading

```vue
<el-table
  ref="tableRef"
  :data="childrenData"
  row-key="id"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  lazy
  :load="loadChildren">
  
  <el-table-column prop="label" label="Title" fixed>
    <template #default="{ row }">
      <div :style="{ paddingLeft: (row.level || 0) * 20 + 'px' }">
        <!-- Expand/Collapse Icon -->
        <span v-if="row.hasChildren" @click.stop="toggleRowExpand(row)">
          <el-icon v-if="row.isExpanded"><Minus /></el-icon>
          <el-icon v-else><Plus /></el-icon>
        </span>
        <!-- Type Icon -->
        <img :src="row.icon" class="type-icon" />
        {{ row.label }}
      </div>
    </template>
  </el-table-column>
</el-table>
```

**Key Points:**
- Use `level` property for indentation
- Set child `level = parent.level + 1` when loading
- Hide default expand icons with CSS

### Drag and Drop (3DE Integration)

```typescript
// Initialize 3DE drag-and-drop
const initDragAndDrop = () => {
  const dropZone = document.getElementById('dropZone');
  
  parent.require(['DS/DataDragAndDrop/DataDragAndDrop'], 
    (DataDragAndDrop: any) => {
      DataDragAndDrop.droppable(dropZone, {
        drop: async (data: string) => {
          const jsonData = JSON.parse(data);
          const items = jsonData.data?.items || [];
          // Handle dropped items
        },
        enter: () => dropZone.classList.add('drag-over'),
        leave: () => dropZone.classList.remove('drag-over')
      });
    }
  );
};
```

### State Management (Base Info)

```typescript
// store/modules/baseInfo.ts
export const useBaseInfoStore = defineStore('baseInfo', {
  state: () => ({
    spaceUrl: '',           // 3DSpace URL
    securityContext: '',    // Security context
    currentUser: ''         // Current user
  }),
  actions: {
    async fetchSpaceUrl() { /* ... */ },
    async getCollaborativeSpace() { /* ... */ }
  }
});
```

### HTTP Request (ds-request.ts)

**IMPORTANT:** Always use relative paths, not full URLs.

```typescript
// CORRECT - Use relative path
const response = await http.post('/cvservlet/progressiveexpand/v2', params);

// WRONG - Don't concatenate full URL
const response = await http.post(`${spaceUrl}/cvservlet/...`, params);
```

## Field Mappings

### Part Information
| Display Name | API Field |
|--------------|-----------|
| 标题 | ds6w:label |
| 企业项目编号 | ds6wg:EnterpriseExtension.V_PartNumber |
| 修订版 | ds6wg:revision |
| 标题(实例) | relation.ds6w:label |
| 最新修订版 | ds6w:isLastRevision |
| 成熟度状态 | ds6w:status |
| 所有者 | ds6w:responsible |
| 锁定 | ds6w:reserved |
| 修改日期 | ds6w:modified |
| 类型 | ds6w:type |
| 名称 | ds6w:identifier |
| 图标 | icon |

### Status Colors
| Status | Color |
|--------|-------|
| IN_WORK | primary (blue) |
| RELEASED | success (green) |
| FROZEN | info (gray) |
| OBSOLETE | danger (red) |
| PRIVATE | warning (yellow) |

## Common Issues & Solutions

### 1. CORS Errors
**Cause:** URL concatenation issues
**Solution:** Use relative paths in API calls

### 2. TypeScript Errors with HTTP
**Solution:** Use type assertions
```typescript
const response = await http.post(url, params as unknown as Record<string, unknown>);
```

### 3. Tree Expand Not Working
**Solution:** Use table ref to toggle expansion
```typescript
const toggleRowExpand = (row: TreeNode) => {
  if (tableRef.value) {
    tableRef.value.toggleRowExpansion(row, !row.isExpanded);
    row.isExpanded = !row.isExpanded;
  }
};
```

### 4. Indentation Issues
**Solution:** Set level when loading children
```typescript
const childDataWithLevel = childData.map(child => ({
  ...child,
  level: (row.level || 0) + 1
}));
```

## Best Practices

1. **Always use Pinia** for 3DE context management
2. **Use relative paths** for API endpoints
3. **Implement proper error handling** with ElMessage
4. **Use TypeScript interfaces** for API responses
5. **Hide default tree icons** and implement custom ones
6. **Set proper row-key** for table performance
7. **Use lazy loading** for large BOM structures

## Build Commands

```bash
# Development
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## References

- Element Plus Table: https://element-plus.org/en-US/component/table.html
- Vue 3 Composition API: https://vuejs.org/guide/extras/composition-api-faq.html
- 3DEXPERIENCE Platform APIs
