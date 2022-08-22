import webpack from 'webpack'
import { MFSU } from '@umijs/mfsu'

import paths from '@/lib/compiler/variables/paths'
import builds from '@/lib/compiler/variables/builds'

// @ts-ignore
const mfsu = new MFSU({
  cwd: paths.appPath,
  implementor: webpack,
  buildDepWithESBuild: builds.transpiler === 'esbuild'
})

export default mfsu
