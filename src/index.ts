#!/usr/bin/env node
import './utils/alias'
import { Command } from 'commander'
import { CommandLoader } from './commands'
import variables from './lib/compiler/variables'
import paths from './lib/compiler/variables/paths'
import { ERROR_PREFIX } from './utils/log'

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection>', err)
  throw err
})

process.on('uncaughtException', (err) => {
  console.error('uncaughtException>', err)
  throw err
})
const requiredVariableKeys = ['APP_NAME', 'VERSION']

const bootstrap = (): void => {
  const program = new Command()

  program
    .version(
      // eslint-disable-next-line
      require('../package.json').version,
      '-v, --version'
    )
    .option('-t, --trace', 'display trace statements for commands')
    .usage('<command> [options]')
    .hook('preAction', (thisCommand, actionCommand) => {
      if (thisCommand.opts().trace) {
        console.log(
          `About to call action handler for subcommand: ${actionCommand.name()}`
        )
        console.log('arguments: %O', actionCommand.args)
        console.log('options: %o', actionCommand.opts())
      }
      const { appEnv, nodeEnv } = actionCommand.opts() || {}

      process.env.NODE_ENV = nodeEnv || 'production'
      process.env.APP_ENV =
        (appEnv as string) || process.env.APP_ENV || 'production'

      // eslint-disable-next-line no-underscore-dangle
      variables.__DEV__ = process.env.NODE_ENV === 'development'
      variables.APP_ENV = process.env.APP_ENV
      variables.SENTRY_RELEASE = `${variables.APP_ENV}-${variables.RELEASE}`

      if (['start', 'build'].includes(actionCommand.name())) {
        if (!paths.appIndex || !paths.appHtml) {
          console.error(`\n${ERROR_PREFIX} 缺少入口文件\n`)
          process.exit(1)
        }
        let checkRequiredKey = true
        // eslint-disable-next-line no-restricted-syntax
        for (const requiredKey of requiredVariableKeys) {
          if (!variables[requiredKey]) {
            checkRequiredKey = false
            console.error(
              `\n${ERROR_PREFIX} please config required variable: ${requiredKey}\n`
            )
          }
        }
        if (!checkRequiredKey) {
          process.exit(1)
        }
      }
    })
    .helpOption('-h, --help', 'Output usage information.')

  CommandLoader.load(program)

  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}
bootstrap()
