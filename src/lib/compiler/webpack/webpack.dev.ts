import webpack from 'webpack'
import { merge as webpackMerge } from 'webpack-merge'
import redirectServedPath from 'react-dev-utils/redirectServedPathMiddleware'
import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware'
import ignoredFiles from 'react-dev-utils/ignoredFiles'
import evalSourceMapMiddleware from 'react-dev-utils/evalSourceMapMiddleware'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

import paths from '../variables/paths'
import variables from '../variables/index'
import builds from '../variables/builds'
import configFactory from './webpack.common'
import { processWebpackConfig } from '../variables/custom-config'
import mfsu from '../webpack-plugins/mfsu'

const { appPublic, appSrc } = paths
const { PUBLIC_PATH, FAST_REFRESH } = variables
const { mfsu: MFSU_ENABLED } = builds

const sockHost = process.env.WDS_SOCKET_HOST
const sockPath = process.env.WDS_SOCKET_PATH // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT

export default () =>
  processWebpackConfig(
    webpackMerge(
      configFactory({
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          FAST_REFRESH &&
            new ReactRefreshWebpackPlugin({
              overlay: false
            }),
          new CaseSensitivePathsPlugin()
        ]
      }),
      {
        mode: 'development',
        devtool: 'cheap-module-source-map',
        devServer: {
          client: {
            webSocketURL: {
              hostname: sockHost,
              pathname: sockPath,
              port: sockPort
            },
            overlay: {
              errors: true,
              warnings: false
            }
          },
          allowedHosts: 'all',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*'
          },
          // Enable gzip compression of generated files
          compress: true,
          // Silence WebpackDevServer's own logs since they're generally not useful.
          // It will still show compile warnings and errors with this setting.
          static: {
            // By default WebpackDevServer serves physical files from current directory
            // in addition to all the virtual build products that it serves from memory.
            // This is confusing because those files won’t automatically be available in
            // production build folder unless we copy them. However, copying the whole
            // project directory is dangerous because we may expose sensitive files.
            // Instead, we establish a convention that only files in `public` directory
            // get served. Our build script will copy `public` into the `build` folder.
            // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
            // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
            // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
            // Note that we only recommend to use `public` folder as an escape hatch
            // for files like `favicon.ico`, `manifest.json`, and libraries that are
            // for some reason broken when imported through webpack. If you just want to
            // use an image, put it in `src` and `import` it from JavaScript instead.
            directory: appPublic,
            publicPath: [PUBLIC_PATH],
            // By default files from `contentBase` will not trigger a page reload.
            watch: {
              // Reportedly, this avoids CPU overload on some systems.
              // https://github.com/facebook/create-react-app/issues/293
              // src/node_modules is not ignored to support absolute imports
              // https://github.com/facebook/create-react-app/issues/1065
              ignored: ignoredFiles(appSrc)
            }
          },
          devMiddleware: {
            // It is important to tell WebpackDevServer to use the same "publicPath" path as
            // we specified in the webpack config. When homepage is '.', default to serving
            // from the root.
            // remove last slash so user can land on `/test` instead of `/test/`
            publicPath: PUBLIC_PATH.slice(0, -1)
          },
          host: '0.0.0.0',
          historyApiFallback: {
            disableDotRule: true,
            index: PUBLIC_PATH
          },
          onBeforeSetupMiddleware(devServer) {
            if (MFSU_ENABLED && mfsu) {
              // eslint-disable-next-line no-restricted-syntax
              for (const middleware of mfsu.getMiddlewares()) {
                devServer.app.use(middleware)
              }
            }
            // @ts-ignore
            devServer.app.use(evalSourceMapMiddleware(devServer))
          },
          onAfterSetupMiddleware(devServer) {
            // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
            devServer.app.use(redirectServedPath(PUBLIC_PATH))

            // This service worker file is effectively a 'no-op' that will reset any
            // previous service worker registered for the same host:port combination.
            // We do this in development to avoid hitting the production cache if
            // it used the same host and port.
            // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
            devServer.app.use(noopServiceWorkerMiddleware(PUBLIC_PATH))
          }
        }
      } as webpack.Configuration
    )
  )
