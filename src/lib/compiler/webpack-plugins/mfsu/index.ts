import webpack from 'webpack'
import { MFSU } from '@umijs/mfsu'

import paths from '@/lib/compiler/variables/paths'
import builds from '@/lib/compiler/variables/builds'

const mfsu = new MFSU({
  cwd: paths.appPath,
  // @ts-ignore
  implementor: webpack,
  buildDepWithESBuild: builds.transpiler === 'esbuild'
})

export default mfsu
