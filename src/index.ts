#!/usr/bin/env node
import { Command } from 'commander'

import chalk from 'chalk'
import create from './commands/create'

const bootstrap = (): void => {
  const program = new Command()

  program
    .command('create <name>')
    .description('Create react application.')
    .action((name: string, command: Command) => {
      if (!name) {
        throw new Error('Please specify the project name.')
      }
      create(name, command)
    })
    .addHelpText(
      'after',
      `
  
  Example call:
    $ lark create ${chalk.green('<project-name>')}`
    )
    .showHelpAfterError()
  program
    .version(
      // eslint-disable-next-line
      require('../package.json').version,
      '-v, --version',
      'Output the current version.'
    )
    .helpOption('-h, --help', 'Output usage information.')
    .parse(process.argv)
}
bootstrap()
