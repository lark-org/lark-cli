/* eslint-disable no-console */
import { Command } from 'commander'
import * as chalk from 'chalk'
import { CreateCommand } from './create.command'
import { CreateAction } from '../actions'
import { ERROR_PREFIX } from '../utils/log'

export class CommandLoader {
  public static load(program: Command) {
    new CreateCommand(new CreateAction()).load(program)

    this.handleInvalidCommand(program)
  }

  private static handleInvalidCommand(program: Command) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' ')
      )
      console.log(
        `See ${chalk.red('--help')} for a list of available commands.\n`
      )
      process.exit(1)
    })
  }
}
