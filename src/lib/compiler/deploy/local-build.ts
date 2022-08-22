/* eslint-disable import/first */
import moduleAlias from 'module-alias'
import path from 'path'

const resolve = (resolvePath: string): string =>
  path.resolve(__dirname, '../../../', resolvePath)

moduleAlias.addAliases({
  '@': resolve('.')
})

moduleAlias()

import FileSizeReporter from 'react-dev-utils/FileSizeReporter'
import { TerminalLog } from '@/utils/log'
import paths from '@/lib/compiler/variables/paths'
import { build } from './build'

const { measureFileSizesBeforeBuild } = FileSizeReporter
const { appBuild } = paths

async function buildLocal() {
  const previousFileSizes = await measureFileSizesBeforeBuild(appBuild)
  process?.send(`开始打包本地组件...`)
  await build(previousFileSizes)
  process?.send('build ok')
  process.on('message', (message) => {
    TerminalLog.push(`<打包子进程（接）> message - ${message}`)
  })
}

buildLocal()
