#!/usr/bin/env node
import './utils/alias'
import { Command } from 'commander'
import { CommandLoader } from './commands'
import variables from './lib/compiler/variables'

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection>', err)
  throw err
})

process.on('uncaughtException', (err) => {
  console.error('uncaughtException>', err)
  throw err
})

const bootstrap = (): void => {
  const program = new Command()

  program
    .version(
      // eslint-disable-next-line
      require('../package.json').version,
      '-v, --version'
    )
    .usage('<command> [options]')
    .hook('preAction', (thisCommand, actionCommand) => {
      const { appEnv, nodeEnv } = actionCommand.opts() || {}

      process.env.NODE_ENV = nodeEnv || 'production'
      process.env.APP_ENV =
        (appEnv as string) || process.env.APP_ENV || 'production'

      // eslint-disable-next-line no-underscore-dangle
      variables.__DEV__ = process.env.NODE_ENV === 'development'
      variables.APP_ENV = process.env.APP_ENV
      variables.SENTRY_RELEASE = `${variables.APP_ENV}-${variables.RELEASE}`
    })
    .helpOption('-h, --help', 'Output usage information.')

  CommandLoader.load(program)

  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}
bootstrap()
