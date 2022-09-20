/* eslint-disable no-console */
import { Command } from 'commander'
import chalk from 'chalk'
import { BuildAction } from '@/actions/build.action'
import { StartAction } from '@/actions/start.action'
import { ConfigAction } from '@/actions/config.action'
import { CreateCommand } from './create.command'
import { CreateAction } from '../actions'
import { ERROR_PREFIX } from '../utils/log'
import { BuildCommand } from './build.command'
import { StartCommand } from './start.command'
import { ConfigCommand } from './config.command'

export class CommandLoader {
  public static load(program: Command) {
    new CreateCommand(new CreateAction()).load(program)
    new BuildCommand(new BuildAction()).load(program)
    new StartCommand(new StartAction()).load(program)
    new ConfigCommand(new ConfigAction()).load(program)

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
