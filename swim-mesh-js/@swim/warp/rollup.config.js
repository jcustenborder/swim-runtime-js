import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

const script = "swim-warp";
const namespace = "swim";

const main = {
  input: "./lib/main/index.js",
  output: {
    file: `./dist/main/${script}.js`,
    name: namespace,
    format: "umd",
    globals: {
      "@swim/util": "swim",
      "@swim/codec": "swim",
      "@swim/mapping": "swim",
      "@swim/structure": "swim",
      "@swim/recon": "swim",
      "@swim/uri": "swim",
    },
    sourcemap: true,
    interop: false,
    extend: true,
  },
  external: [
    "@swim/util",
    "@swim/codec",
    "@swim/mapping",
    "@swim/structure",
    "@swim/recon",
    "@swim/uri",
  ],
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const test = {
  input: "./lib/test/index.js",
  output: {
    file: `./dist/test/${script}-test.js`,
    name: `${namespace}.test`,
    format: "umd",
    sourcemap: true,
    interop: false,
    extend: true,
  },
  plugins: [
    nodeResolve({moduleDirectories: ["../..", "../../../swim-core-js", "node_modules"]}),
    sourcemaps(),
  ],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

const targets = [main, test];
targets.main = main;
targets.test = test;
export default targets;
