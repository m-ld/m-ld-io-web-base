const { join, dirname } = require('path');
const { promisify } = require('util');
const browserify = require('browserify');
const { minify } = require('terser');
const concat = require('concat-stream');
const sass = require('node-sass');
const postcss = require('postcss');
const envify = require('envify');

function packageDir(module, localRequire) {
  return dirname((localRequire || require).resolve(module + '/package.json'));
}
exports.packageDir = packageDir;

exports.default11tyConfig = function (eleventy, config) {
  config ??= {};
  (config.dir ??= {}).input ??= 'src';
  (config.templateFormats ??= []).push('liquid', 'html', 'svg', 'png', 'md', '11ty.js', '11ty.cjs');
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
}

exports.renderTs = async function ({ tsPath, tsConfig }) {
  const dev = process.env.NODE_ENV === 'development';
  const b = browserify(tsPath, { debug: dev, ignoreMissing: true })
    .plugin('tsify', tsConfig.compilerOptions)
    .transform(envify, { global: true });

  return new Promise(async (resolve, reject) => {
    const demoStream = b.bundle();
    demoStream.on('error', reject);
    demoStream.pipe(concat(resolve));
  }).then(async js => dev ? js : (await minify(js.toString())).code);
}

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
}
