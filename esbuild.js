#!/usr/bin/env node

const esbuild = require('esbuild');
const yargs = require('yargs');

const argv = yargs(process.argv.slice(2)).argv;
let ctx = esbuild.context({
  entryPoints: ['update.js'],
  entryNames: argv.dev ? `[dir]/[name].development` : `[dir]/[name].min`,
  outbase: 'src',
  bundle: true,
  minify: !argv.dev,
  outdir: 'dist',
  loader: { '.js': 'jsx' },
  banner: {
    js: "const update = function(instance, properties, context) {"
  },
  footer: {
    js: "}"
  }
}).then(async (build) => {
  await build.rebuild();
  await build.dispose()
  console.log('done?');
})
// await ctx.watch()
// console.log('watching...')