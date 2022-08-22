import merge from 'deepmerge'
import fs from 'fs'
import path from 'path'

import { getProjectFilePath } from '@/lib/compiler/variables/utils'

import variables from './variables'
import mfsu from './webpack-plugins/mfsu'

const { FAST_REFRESH: shouldUseReactRefresh, MFSU: shouldUseMFSURefresh } =
  variables

export default (api: any) => {
  api.cache(() => process.env.NODE_ENV)
  const { NODE_ENV, BABEL_ENV } = process.env
  const resolverOpts = {
    root: [path.relative(__dirname, process.cwd())],
    extensions: ['.js', '.jsx', '.tsx', '.ts']
  }

  let environment = []

  if ((BABEL_ENV || NODE_ENV) === 'development') {
    environment = [
      shouldUseReactRefresh && require.resolve('react-refresh/babel'),
      ['@babel/plugin-syntax-dynamic-import'],
      ...(shouldUseMFSURefresh ? mfsu.getBabelPlugins() : [])
    ].filter(Boolean)
  } else {
    environment = [
      '@babel/plugin-syntax-dynamic-import',
      'babel-plugin-transform-react-remove-prop-types',
      '@babel/plugin-transform-react-constant-elements'
    ]
  }

  const config = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript',
      '@babel/preset-react'
    ],
    plugins: [
      ...environment,
      ['babel-plugin-module-resolver', resolverOpts],
      '@babel/plugin-proposal-object-rest-spread',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      'babel-plugin-macros',
      '@babel/plugin-transform-runtime'
    ]
  }

  const projectBabelPath = getProjectFilePath('babel.config.js')

  let customBabelConfig: Record<string, any> = {}
  if (fs.existsSync(projectBabelPath)) {
    const configGetter = require(projectBabelPath)
    customBabelConfig = configGetter(config)
  }

  if (customBabelConfig.overrides) {
    delete customBabelConfig.overrides

    return customBabelConfig
  }

  const mergedConfig = merge(config, customBabelConfig)

  return mergedConfig
}
