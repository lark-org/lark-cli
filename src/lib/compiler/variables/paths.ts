import {
  getProjectFilePath,
  getWorkspacePath,
  resolveApp,
  resolveModule
} from './utils'
import { getCustomConfig } from './custom-config'

const appHttpsKey = (host: string) =>
  getWorkspacePath(`./.lark/${host}-key.pem`)
const appHttpsCert = (host: string) =>
  getWorkspacePath(`./.lark/${host}-cert.pem`)
const customPaths = getCustomConfig().paths
const appHttpsConfig = getWorkspacePath('./.lark')

const paths: Record<string, any> = {
  appHttpsKey,
  appHttpsCert,
  appHttpsConfig
}
try {
  const appPackageJson = getProjectFilePath('./package.json')

  paths.appPackageJson = appPackageJson
  paths.appPath = resolveApp('.')
  paths.appTsConfig = resolveApp('tsconfig.json')
  paths.appJsConfig = resolveApp('jsconfig.json')
  paths.appNodeModules = resolveApp('node_modules')
  paths.appWebpackCache = resolveApp('node_modules/.cache')
  paths.appSrc = getProjectFilePath('./src')
  paths.appBuild = getProjectFilePath('./dist')
  paths.appPublic = getProjectFilePath('./public')

  paths.swSrc = resolveModule(resolveApp, './src/service-worker')
  paths.appIndex = resolveModule(resolveApp, './src/index')
  paths.yarnLockFile = getProjectFilePath('./yarn.lock')
  paths.appPolyfill = require.resolve('../polyfills/index.js')
  paths.appHtml = getProjectFilePath('./src/index.html')

  paths.customPaths = getCustomConfig().paths || {}

  paths.packageManager = appPackageJson
    ? require(appPackageJson).packageManager?.split('@')?.[0] || 'npm'
    : 'npm'
  // eslint-disable-next-line no-empty
} catch (error) {}

export default {
  ...paths,
  ...customPaths
}
