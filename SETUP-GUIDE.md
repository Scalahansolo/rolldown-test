# Rolldown Backend Bundling Setup Guide

This guide explains how to set up a monorepo with TypeScript, workspace packages, and Rolldown for backend bundling. This pattern scales from small POCs to large production repositories.

## Overview

This setup provides:
- **Development**: Fast TypeScript execution with SWC and watch mode
- **Production**: Optimized bundles with Rolldown
- **Monorepo**: Clean workspace packages with proper exports
- **No configuration overhead**: Relies on package.json `exports` field instead of manual aliases

## Project Structure

```
your-repo/
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # pnpm workspace definition
├── rolldown.config.js        # Rolldown bundler config
├── tsconfig.json             # TypeScript config (minimal)
├── .swcrc                    # SWC transpiler config
├── apps/
│   └── backend/
│       ├── package.json      # Backend app dependencies
│       └── index.ts          # Entry point
└── packages/
    ├── common/
    │   ├── package.json      # Simple barrel export
    │   └── index.ts
    ├── utils/
    │   ├── package.json      # Wildcard exports
    │   ├── math.ts
    │   └── string.ts
    └── helpers/
        ├── package.json      # Mixed exports (wildcard + named)
        ├── format.ts
        ├── array.ts
        └── validation/
            ├── index.ts
            ├── email.ts
            └── phone.ts
```

## Step-by-Step Setup

### 1. Initialize Root Workspace

**package.json:**
```json
{
  "name": "your-repo",
  "version": "1.0.0",
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "rolldown -c",
    "dev": "node --import @swc-node/register/esm-register --watch apps/backend/index.ts"
  },
  "devDependencies": {
    "@swc-node/register": "^1.11.1",
    "@swc/core": "^1.13.5",
    "@types/node": "^24.8.1",
    "rolldown": "^1.0.0-beta.44",
    "typescript": "^5.9.3"
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2. Configure TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

**Key points:**
- `moduleResolution: "bundler"` - Defers resolution to runtime/bundler
- No `paths` configuration needed - use package.json exports instead

### 3. Configure SWC

**.swcrc:**
```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": false
    },
    "target": "es2022"
  },
  "module": {
    "type": "es6"
  }
}
```

### 4. Configure Rolldown

**rolldown.config.js:**
```javascript
export default {
  input: 'apps/backend/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  resolve: {
    exportsFields: [['exports']]
  }
};
```

**Key points:**
- `exportsFields: [['exports']]` - Respects package.json exports field
- No aliases needed - all resolution happens through exports

### 5. Package Export Patterns

#### Pattern 1: Simple Barrel Export

For packages with a single entry point:

**packages/common/package.json:**
```json
{
  "name": "@your-org/common",
  "version": "1.0.0",
  "type": "module",
  "main": "index.ts",
  "types": "index.ts",
  "exports": {
    ".": "./index.ts"
  }
}
```

**Usage:**
```typescript
import { hello } from '@your-org/common';
```

#### Pattern 2: Wildcard Exports

For packages with multiple independent modules:

**packages/utils/package.json:**
```json
{
  "name": "@your-org/utils",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    "./*": "./*.ts"
  }
}
```

**Usage:**
```typescript
import { add } from '@your-org/utils/math';
import { capitalize } from '@your-org/utils/string';
```

#### Pattern 3: Mixed Exports (Wildcard + Named)

For packages with both root-level modules and nested folders:

**packages/helpers/package.json:**
```json
{
  "name": "@your-org/helpers",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    "./*": "./*.ts",
    "./validation": "./validation/index.ts"
  }
}
```

**Usage:**
```typescript
// Direct module imports (wildcard)
import { formatDate } from '@your-org/helpers/format';
import { chunk } from '@your-org/helpers/array';

// Named folder export
import { isValidEmail, formatPhone } from '@your-org/helpers/validation';
```

### 6. Backend App Setup

**apps/backend/package.json:**
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.ts",
  "dependencies": {
    "@your-org/common": "workspace:*",
    "@your-org/utils": "workspace:*",
    "@your-org/helpers": "workspace:*"
  }
}
```

**apps/backend/index.ts:**
```typescript
import { hello } from '@your-org/common';
import { add } from '@your-org/utils/math';
import { isValidEmail } from '@your-org/helpers/validation';

console.log(hello());
console.log('Math:', add(5, 3));
console.log('Valid:', isValidEmail('test@example.com'));
```

## Development Workflow

### Development Mode
```bash
pnpm run dev
```
- Uses `@swc-node/register` for fast TypeScript execution
- Watch mode automatically restarts on file changes
- Full support for workspace packages via pnpm linking
- Handles ESM-only packages, circular dependencies, extensionless imports

### Production Build
```bash
pnpm run build
node dist/bundle.js
```
- Rolldown bundles all code into a single file
- Tree-shaking and optimization applied
- All workspace dependencies bundled
- External dependencies remain external (can be configured)

## Applying to Large Repos

### 1. Audit Existing Packages

For each package in your monorepo:

1. Add `"type": "module"` to package.json
2. Define appropriate `exports` field based on package structure
3. Use workspace protocol for internal dependencies: `"workspace:*"`

### 2. Migration Strategy

**Incremental approach:**
1. Start with leaf packages (no internal dependencies)
2. Add exports fields to their package.json
3. Move up the dependency tree
4. Test each package's exports work in dev and build

**For large packages:**
- Use wildcard exports initially: `"./*": "./*.ts"`
- Later, explicitly define commonly-used exports for better documentation
- Mix patterns as needed

### 3. Handle Special Cases

**Conditional Exports (Development vs Production):**
```json
{
  "exports": {
    ".": {
      "development": "./dev.ts",
      "default": "./index.ts"
    }
  }
}
```

**Multiple Entry Points:**
```json
{
  "exports": {
    ".": "./index.ts",
    "./client": "./client.ts",
    "./server": "./server.ts",
    "./utils/*": "./utils/*.ts"
  }
}
```

**Nested Folders:**
```json
{
  "exports": {
    "./*": "./*.ts",
    "./database": "./database/index.ts",
    "./api": "./api/index.ts"
  }
}
```

### 4. Rolldown Configuration for Multiple Apps

For repos with multiple backend apps:

**rolldown.config.js:**
```javascript
export default [
  {
    input: 'apps/api/index.ts',
    output: {
      file: 'dist/api.js',
      format: 'esm'
    },
    resolve: {
      exportsFields: [['exports']]
    }
  },
  {
    input: 'apps/worker/index.ts',
    output: {
      file: 'dist/worker.js',
      format: 'esm'
    },
    resolve: {
      exportsFields: [['exports']]
    }
  }
];
```

### 5. Common Pitfalls

**Problem: Circular dependencies**
- Solution: Both SWC and Rolldown handle these gracefully in ESM
- Keep circular deps within the same package when possible

**Problem: Extensionless imports fail in dev mode**
- Solution: Use `@swc-node/register`, not `@swc/register`
- The newer package properly handles extensionless imports

**Problem: External dependencies bundled into output**
- Solution: Configure `external` in Rolldown:
```javascript
{
  external: ['pg', 'redis', 'aws-sdk']
}
```

**Problem: TypeScript can't find workspace packages**
- Solution: Run `pnpm install` to link workspace packages
- Ensure `moduleResolution: "bundler"` in tsconfig.json
- Don't use TypeScript `paths` - rely on runtime resolution

## Performance Considerations

### Development
- **SWC** transpiles TypeScript extremely fast
- **@swc-node/register** adds minimal overhead
- **--watch** mode is built into Node.js (fast, reliable)
- For very large repos, consider `tsx` as an alternative (slightly slower but more features)

### Production
- **Rolldown** is significantly faster than webpack/esbuild for large codebases
- Bundle splitting not needed for backend (single entry point)
- Tree-shaking automatically removes unused code
- Consider code splitting only for serverless functions

## Testing the Setup

Create a test checklist:

- [ ] Dev mode starts and runs correctly
- [ ] Changes trigger watch mode restart
- [ ] All workspace packages resolve correctly
- [ ] External ESM-only packages work (e.g., p-limit)
- [ ] Circular dependencies don't cause errors
- [ ] Production build completes without warnings
- [ ] Bundled output runs successfully
- [ ] Bundle size is reasonable

## Troubleshooting

### Issue: "Cannot find module" in dev mode
- Check package.json `exports` field is correct
- Run `pnpm install` to ensure workspace linking
- Verify package name matches between exports and imports

### Issue: Rolldown can't resolve workspace package
- Ensure `exportsFields: [['exports']]` is in rolldown config
- Check package.json exports field uses correct paths
- Verify file extensions match (use .ts consistently)

### Issue: TypeScript errors but code runs fine
- This is expected - TypeScript doesn't fully understand runtime resolution
- Consider `skipLibCheck: true` for fewer errors
- Focus on runtime behavior, not TypeScript errors

## Advanced: Per-Environment Bundles

For different deployment targets:

**rolldown.config.js:**
```javascript
const targets = ['production', 'staging', 'development'];

export default targets.map(target => ({
  input: 'apps/backend/index.ts',
  output: {
    file: `dist/bundle.${target}.js`,
    format: 'esm'
  },
  resolve: {
    exportsFields: [['exports']],
    conditionNames: [target, 'default']
  }
}));
```

**package.json:**
```json
{
  "exports": {
    ".": {
      "production": "./index.prod.ts",
      "staging": "./index.staging.ts",
      "development": "./index.dev.ts",
      "default": "./index.ts"
    }
  }
}
```

## Summary

This setup provides:
- ✅ Fast development with SWC
- ✅ Optimized production bundles with Rolldown
- ✅ Clean package organization with exports
- ✅ No manual alias configuration
- ✅ Scales to repos with hundreds of packages
- ✅ Full TypeScript support
- ✅ ESM-first approach

The key principle: **Let package.json exports drive all module resolution**. This single source of truth works across dev, build, and deployment.
