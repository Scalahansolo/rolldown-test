import swc from '@rollup/plugin-swc';

export default {
  input: 'apps/backend/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  resolve: {
    exportsFields: [['exports']]
  },
  experimental: {
    enableComposingJsPlugins: true
  },
  plugins: [
    swc({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true
        },
        target: 'es2022'
      }
    })
  ]
};