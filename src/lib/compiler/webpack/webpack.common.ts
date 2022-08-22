import fs from 'fs-extra'
import path from 'path'
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin'
import webpack, { EntryObject, WebpackPluginInstance } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ModuleNotFoundPlugin from 'react-dev-utils/ModuleNotFoundPlugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'
import ForkTsCheckerWarningWebpackPlugin from 'react-dev-utils/ForkTsCheckerWarningWebpackPlugin'
import ForkTsCheckerWebpack from 'react-dev-utils/ForkTsCheckerWebpackPlugin'

import variables from '@/lib/compiler/variables'
import paths from '@/lib/compiler/variables/paths'
import builds from '@/lib/compiler/variables/builds'
import InterpolateHtmlPlugin from '@/lib/compiler/webpack-plugins/interpolate-html-plugin'
import createEnvironmentHash from '@/lib/compiler/dev-utils/createEnvironmentHash'

import modules from '../dev-utils/modules'

const resolve = require('resolve')

const postcssNormalize = require('postcss-normalize')

const reactRefreshWebpackPluginRuntimeEntry = require.resolve(
  '@pmmmwh/react-refresh-webpack-plugin'
)
const reactRefreshRuntimeEntry = require.resolve('react-refresh/runtime')

const ForkTsCheckerWebpackPlugin =
  process.env.TSC_COMPILE_ON_ERROR === 'true'
    ? ForkTsCheckerWarningWebpackPlugin
    : ForkTsCheckerWebpack

const useTailwind = fs.existsSync(
  path.join(paths.appPath, 'tailwind.config.js')
)

const { __DEV__, PUBLIC_PATH: publicPath, APP_ENV } = variables
const { transpiler, transpilerOptions } = builds
const { appIndex, appSrc, appHtml, appPolyfill } = paths

const stringified = Object.keys(variables).reduce(
  (acc: Record<string, any>, key) => {
    acc[key] = JSON.stringify(variables[key])

    return acc
  },
  {
    'process.env.APP_ENV': JSON.stringify(APP_ENV)
  }
)
const tsconfigRaw = [paths.appTsConfig, paths.appJsConfig].filter((f) =>
  fs.existsSync(f)
)
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000',
  10
)
const useTypeScript = fs.existsSync(paths.appTsConfig)

function getStyleLoaders(external?: boolean) {
  function getLoaders(module?: boolean) {
    let modulesQuery

    if (module) {
      modulesQuery = {
        modules: {
          mode: 'local',
          localIdentName: '[name]__[local]--[hash:base64:7]'
        }
      }
    }

    return [
      // eslint-disable-next-line no-nested-ternary
      __DEV__ ? require.resolve('style-loader') : MiniCssExtractPlugin.loader,
      {
        loader: require.resolve('css-loader'),
        options: {
          // turn on sourceMap will cause FOUC
          // see https://github.com/webpack-contrib/css-loader/issues/613
          sourceMap: false,
          importLoaders: 1,
          ...modulesQuery
        }
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          postcssOptions: {
            ident: 'postcss',
            config: false,
            plugins: !useTailwind
              ? [
                  require('postcss-flexbugs-fixes'),
                  require('postcss-preset-env')({
                    autoprefixer: {
                      flexbox: 'no-2009'
                    },
                    stage: 3
                  }),
                  // Adds PostCSS Normalize as the reset css with default options,
                  // so that it honors browserslist config in package.json
                  // which in turn let's users customize the target behavior as per their needs.
                  postcssNormalize()
                ]
              : [
                  require('tailwindcss'),
                  require('postcss-flexbugs-fixes'),
                  require('postcss-preset-env')({
                    autoprefixer: {
                      flexbox: 'no-2009'
                    },
                    stage: 3
                  })
                ],
            sourceMap: false
          }
        }
      }
    ]
  }

  if (!external) {
    return [
      {
        resourceQuery: /modules/,
        use: getLoaders(true)
      },
      {
        use: getLoaders()
      }
    ]
  }

  return getLoaders()
}

function getScriptLoader() {
  const esbLoader = {
    loader: require.resolve('esbuild-loader'),
    exclude: [/node_modules/],

    options: {
      loader: 'tsx',
      target: 'esnext',
      implementation: require('esbuild'),
      ...transpilerOptions
    }
  }
  const babel = {
    loader: require.resolve('babel-loader'),
    exclude: [/node_modules/],
    options: {
      babelrc: false,
      cacheDirectory: true,
      // See #6846 for context on why cacheCompression is disabled
      cacheCompression: false,
      compact: !__DEV__,
      configFile: require.resolve('@/lib/compiler/babel.config.js'),
      ...transpilerOptions
    }
  }

  if (transpiler === 'esbuild' && __DEV__) {
    return esbLoader
  }

  return babel
}
type EntryStatic = string | EntryObject | string[]

type webpackEntry = EntryStatic
export interface WebpackCommonConfig {
  entry?: webpackEntry
  plugins?: WebpackPluginInstance[]
}
const webpackConfig = ({
  entry = [],
  plugins = []
}: WebpackCommonConfig): webpack.Configuration => {
  let minify

  if (!__DEV__) {
    minify = {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    }
  }

  return {
    // entry: appIndex,
    entry: {
      // @ts-ignore
      app: [...entry, appPolyfill, appIndex]
    },
    output: {
      path: paths.appBuild,
      pathinfo: __DEV__,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: !__DEV__
        ? 'static/js/[name].[contenthash:8].js'
        : __DEV__ && 'static/js/bundle.js',
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: !__DEV__
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : __DEV__ && 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: !__DEV__
        ? (info) =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : __DEV__ &&
          ((info) =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'))
    },
    resolve: {
      modules: ['node_modules', paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      alias: {
        ...(modules.webpackAliases || {}),
        '@': appSrc,
        src: appSrc
      },
      extensions: ['.ts', '.tsx', '.jsx', '.js', '.scss', '.sass', '.less'],
      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
          reactRefreshRuntimeEntry,
          reactRefreshWebpackPluginRuntimeEntry
        ])
      ]
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.less$/,
          enforce: 'pre',
          use: [
            {
              loader: require.resolve('resolve-url-loader'),
              options: {
                sourceMap: false,
                root: appSrc
              }
            },
            {
              loader: require.resolve('less-loader'),
              options: {
                // turn on sourceMap will cause FOUC
                // see https://github.com/webpack-contrib/css-loader/issues/613
                sourceMap: true,
                lessOptions: {
                  javascriptEnabled: true,
                  implementation: require.resolve('less')
                }
              }
            }
          ]
        },
        {
          test: /\.s[ac]ss$/,
          enforce: 'pre',
          use: [
            {
              loader: require.resolve('resolve-url-loader'),
              options: {
                sourceMap: false,
                root: appSrc
              }
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                // turn on sourceMap will cause FOUC
                // see https://github.com/webpack-contrib/css-loader/issues/613
                sourceMap: true
              }
            }
          ]
        },
        {
          oneOf: [
            {
              test: [/\.avif$/],
              type: 'asset',
              mimetype: 'image/avif',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit
                }
              }
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit
                }
              }
            },
            {
              test: /\.svg$/i,
              issuer: /\.[jt]sx?$/,
              use: [
                {
                  loader: require.resolve('@svgr/webpack'),
                  options: {
                    root: appSrc,
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }]
                    },
                    titleProp: true,
                    ref: true
                  }
                },
                {
                  loader: require.resolve('file-loader'),
                  options: {
                    name: 'static/media/[name].[hash].[ext]'
                  }
                }
              ]
            },
            {
              test: /\.(ttf|eot|woff|woff2)$/,
              type: 'asset/inline'
            },
            {
              test: /\.(js|jsx|ts|tsx)$/,
              include: [appSrc],
              ...getScriptLoader()
            },
            {
              test: /\.wjs$/,
              include: [appSrc],
              use: [
                {
                  loader: require.resolve('worker-loader'),
                  options: {
                    inline: true,
                    fallback: false,
                    publicPath: '/workers/'
                  }
                },
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheDirectory: false,
                    highlightCode: true
                  }
                }
              ]
            },
            {
              test: /\.(css|s[ac]ss|less)$/,
              include: [appSrc],
              oneOf: getStyleLoaders()
            },
            {
              test: /\.(css|s[ac]ss|less)$/,
              exclude: [appSrc],
              use: getStyleLoaders(true)
            },
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource'
            }
          ]
        }
      ]
    },
    cache: {
      type: 'filesystem',
      version: createEnvironmentHash(variables),
      cacheDirectory: paths.appWebpackCache,
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
        tsconfig: tsconfigRaw
      }
    },
    stats: {
      errorDetails: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: appHtml,
        inject: !__DEV__ ? 'body' : 'head',
        minify
      }),
      new ModuleNotFoundPlugin(paths.appPath),
      new webpack.DefinePlugin(stringified),
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, variables),
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce(
            (manifest: Record<string, any>, file) => {
              // eslint-disable-next-line no-param-reassign
              manifest[file.name] = file.path
              return manifest
            },
            seed
          )
          const entrypointFiles = entrypoints.main.filter(
            (fileName) => !fileName.endsWith('.map')
          )

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles
          }
        }
      }),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      }),
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          async: __DEV__,
          typescript: {
            typescriptPath: resolve.sync('typescript', {
              basedir: paths.appNodeModules
            }),
            context: paths.appPath,
            diagnosticOptions: {
              syntactic: true
            },
            mode: 'write-references'
          },
          issue: {
            // This one is specifically to match during CI tests,
            // as micromatch doesn't match
            // '../cra-template-typescript/template/src/App.tsx'
            // otherwise.
            include: [
              { file: '../**/src/**/*.{ts,tsx}' },
              { file: '**/src/**/*.{ts,tsx}' },
              { file: '**/types/**/*.{ts,tsx}' }
            ],
            exclude: [
              { file: '**/src/**/__tests__/**' },
              { file: '**/src/**/?(*.){spec|test}.*' },
              { file: '**/src/setupProxy.*' },
              { file: '**/src/setupTests.*' }
            ]
          },
          logger: {
            infrastructure: 'silent'
          }
        }),
      ...plugins
    ].filter(Boolean),
    performance: false
  } as unknown as webpack.Configuration
}

export default webpackConfig
