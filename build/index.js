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

exports.default11tyConfig = function (config) {
  config.addPassthroughCopy({
    [join(packageDir('@fortawesome/fontawesome-free'), 'webfonts')]: 'webfonts'
  });
  config.addPassthroughCopy('./src/modernizr-custom.js');
  config.addWatchTarget('./lib/');
  config.addWatchTarget('./src/*.ts');
  // Do not ghost events across browsers - defeats the point of m-ld
  config.setBrowserSyncConfig({ ghostMode: false });
  config.setLiquidOptions({ dynamicPartials: true });
  return {
    dir: { input: 'src' },
    templateFormats: ['liquid', 'html', 'svg', 'png', 'md', '11ty.js']
  }
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
