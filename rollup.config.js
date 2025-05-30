const typescript = require("rollup-plugin-typescript2");
const pkg = require("./package.json");

module.exports = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  external: [...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript({
      typescript: require("typescript"),
      useTsconfigDeclarationDir: true,
    }),
  ],
};
