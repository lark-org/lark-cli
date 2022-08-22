#!/usr/bin/env node
import './utils/alias'
import { Command } from 'commander'
import { CommandLoader } from './commands'

const bootstrap = (): void => {
  const program = new Command()

  program
    .version(
      // eslint-disable-next-line
      require('../package.json').version,
      '-v, --version'
    )
    .helpOption('-h, --help', 'Output usage information.')

  CommandLoader.load(program)

  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}
bootstrap()
