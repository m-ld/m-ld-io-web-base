const {
  join,
  dirname,
  basename
} = require('path');
const { promisify } = require('util');
const sass = require('node-sass');
const postcss = require('postcss');
const { build } = require('tsup');
const { resolveNode } = require('@m-ld/io-js-build/esbuild');
const { readFile } = require('fs/promises');

function packageDir(module, localRequire) {
  return dirname((localRequire || require).resolve(module + '/package.json'));
}
exports.packageDir = packageDir;

exports.default11tyConfig = function (eleventy, config) {
  config ??= {};
  (config.dir ??= {}).input ??= 'src';
  (config.templateFormats ??= []).push(
    'liquid', 'html', 'svg', 'png', 'md', '11ty.js', '11ty.cjs'
  );
  if (config.fontawesome !== false) {
    eleventy.addPassthroughCopy({
      [join(packageDir('@fortawesome/fontawesome-free'), 'webfonts')]: 'webfonts'
    });
  }
  eleventy.addPassthroughCopy(join(config.dir.input, 'modernizr-custom.js'));
  eleventy.addWatchTarget('./lib/');
  eleventy.addWatchTarget(join(config.dir.input, '*.ts'));
  // Do not ghost events across browsers - defeats the point of m-ld
  eleventy.setBrowserSyncConfig({ ghostMode: false });
  eleventy.setLiquidOptions({ dynamicPartials: true });
  return config;
};

/**
 * Creates browser bundle for given TypeScript file. If process.env.NODE_ENV is
 * development, includes source maps; otherwise, minifies.
 *
 * @param {string} tsPath typescript file path
 * @param {string[]} shims any wanted resolvable non-core module
 * @param {string[]} [envVars] environment variables to substitute in the output
 * @returns {Promise<Buffer | string>} bundle file
 */
exports.renderTs = async function (
  { tsPath, shims, envVars }
) {
  const dev = process.env.NODE_ENV === 'development';
  await build({
    entry: [tsPath],
    format: 'iife',
    platform: 'browser',
    esbuildPlugins: [resolveNode(shims, envVars)],
    sourcemap: dev ? 'inline' : false,
    noExternal: [/(.*)/], // Bundle all dependencies
    minify: !dev
  });
  // Will now have built to ./dist
  return readFile(join('./dist', `${basename(tsPath, '.ts')}.global.js`));
};

exports.renderScss = async function ({ scssPath }) {
  const { css } = await promisify(sass.render)({
    file: scssPath,
    includePaths: [
      packageDir('bulma'),
      join(packageDir('@fortawesome/fontawesome-free'), 'scss')
    ]
  });
  const result = await postcss([require('autoprefixer')]).process(css);
  result.warnings().forEach(console.warn);
  return result.css;
};
