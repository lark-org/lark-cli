#!/usr/bin/env node
import './utils/alias'
import { Command } from 'commander'
import { CommandLoader } from './commands'

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection>', err)
  throw err
})

process.on('uncaughtException', (err) => {
  console.error('uncaughtException>', err)
  throw err
})

process.on('warning', (warning) => {
  console.log(`warning>`, warning.stack)
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
    .helpOption('-h, --help', 'Output usage information.')

  CommandLoader.load(program)

  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}
bootstrap()
