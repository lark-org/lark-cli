import fs from 'fs'
import { merge as mergeWebpackConfig } from 'webpack-merge'
import { getProjectFilePath } from './utils'

let customConfig: Record<string, any> | null = null

const defaultConfig = {}

const getCustomConfig = () => {
  if (customConfig) {
    return customConfig
  }

  const larkConfig = getProjectFilePath('lark.config.js')
  try {
    // eslint-disable-next-line no-bitwise
    fs.accessSync(larkConfig, fs.constants.F_OK | fs.constants.R_OK)
    // eslint-disable-next-line
    customConfig = { ...defaultConfig, ...require(larkConfig) }
  } catch (e) {
    if (e.code === 'ENOENT') {
      // 文件不存在，使用默认配置
      customConfig = { ...defaultConfig }
    } else {
      // 文件存在，但require过程报错
      throw e
    }
  }
  return customConfig
}

let webpackConfig = null
const processWebpackConfig = (config) => {
  const customWebpackConfig = getCustomConfig().configureWebpack

  if (typeof customWebpackConfig === 'function') {
    webpackConfig = customWebpackConfig(config)
  } else if (typeof customWebpackConfig === 'object') {
    webpackConfig = customWebpackConfig
  }

  if (webpackConfig) {
    // eslint-disable-next-line no-param-reassign
    config = mergeWebpackConfig(config, webpackConfig)
  }
  return config
}

export default {
  getCustomConfig,
  processWebpackConfig
}

export { getCustomConfig, processWebpackConfig }
