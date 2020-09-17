const { join, dirname } = require('path');
const { promisify } = require('util');
const browserify = require('browserify');
const minify = require('minify-stream');
const concat = require('concat-stream');
const sass = require('node-sass');
const postcss = require('postcss');
const envify = require('envify');

function packageDir(module) {
  return dirname(require.resolve(module + '/package.json'));
}

exports.default11tyConfig = function (config) {
  config.addPassthroughCopy({
    [join(packageDir('@fortawesome/fontawesome-free'), 'webfonts')]: 'webfonts'
  });
  config.addPassthroughCopy('./src/modernizr-custom.js');
  config.addWatchTarget('./lib/');
  // Do not ghost events across browsers - defeats the point of m-ld
  config.setBrowserSyncConfig({ ghostMode: false });
  config.setLiquidOptions({ dynamicPartials: true });
  return {
    dir: { input: 'src' },
    templateFormats: ['liquid', 'html', 'svg', 'png', 'md', '11ty.js']
  }
}

exports.renderTs = function ({ tsPath, tsConfig }) {
  const dev = process.env.NODE_ENV == 'development';
  let b = browserify(tsPath, { debug: dev })
    .plugin('tsify', tsConfig.compilerOptions)
    .transform(envify, { global: true });

  return new Promise((resolve, reject) => {
    const demoJs = concat(resolve);
    let demoStream = b.bundle();
    if (!dev)
      demoStream = demoStream.pipe(minify({ sourceMap: false }));

    demoStream.on('error', reject);
    demoStream.pipe(demoJs);
  });
}

exports.renderScss = async function ({ scssPath }) {
  const { css } = await promisify(sass.render)({
    file: scssPath,
    includePaths: [
      packageDir('bulma'),
      join(packageDir('@fortawesome/fontawesome-free'), 'scss')
    ]
  });
  return postcss([require('autoprefixer')]).process(css);
}
