import chalk from 'chalk'
import paths from '@/lib/compiler/variables/paths'

const checkDeps = require('check-dependencies')

const { depsWereOk, error } = checkDeps.sync()

if (!depsWereOk) {
  ;[
    ...error.slice(0, -1),
    `Invoke ${chalk.green(paths.appPackageManager)} to sync local dependencies`
  ].forEach((e) => {
    console.log(e)
    console.log()
  })
  process.exit(1)
}
