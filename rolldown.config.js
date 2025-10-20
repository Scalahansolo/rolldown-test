export default {
  input: "apps/backend/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "esm",
  },
  platform: "node",
  tsconfig: "tsconfig.json",
  resolve: {
    exportsFields: [["exports"]],
  },
};
