import {
  getProjectFilePath,
  getWorkspacePath,
  resolveApp,
  resolveModule
} from './utils'
import { getCustomConfig } from './custom-config'

const appPath = resolveApp('.')
const appTsConfig = resolveApp('tsconfig.json')
const appJsConfig = resolveApp('jsconfig.json')
const appNodeModules = resolveApp('node_modules')
const appWebpackCache = resolveApp('node_modules/.cache')
const appSrc = getProjectFilePath('./src')
const appBuild = getProjectFilePath('./dist')
const appPublic = getProjectFilePath('./public')

const swSrc = resolveModule(resolveApp, './src/service-worker')
const appIndex = resolveModule(resolveApp, './src/index')
const appPackageJson = getProjectFilePath('./package.json')
const yarnLockFile = getProjectFilePath('./yarn.lock')
const appPolyfill = require.resolve('../polyfills/index.js')
const appHtml = getProjectFilePath('./src/index.html')

const customPaths = getCustomConfig().paths

const packageManager = appPackageJson
  ? require(appPackageJson).packageManager?.split('@')?.[0] || 'npm'
  : 'npm'

const appHttpsConfig = getWorkspacePath('./.hb-mf')

const appHttpsKey = getWorkspacePath('./.lark/localhost-key.pem')
const appHttpsCert = getWorkspacePath('./.lark/localhost.pem')
export const paths = {
  appPath,
  appIndex,
  appSrc,
  appBuild,
  appPublic,
  appHtml,
  appPolyfill,
  yarnLockFile,
  swSrc,
  appPackageJson,
  appTsConfig,
  appJsConfig,
  appWebpackCache,
  appNodeModules,
  appPackageManager: packageManager,
  appHttpsConfig,
  appHttpsKey,
  appHttpsCert,
  ...customPaths
}

export default {
  ...paths
}
