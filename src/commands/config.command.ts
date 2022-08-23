import { Command } from 'commander'
import { Input } from '../utils/command.input'
import { AbstractCommand } from './abstract.command'

export class ConfigCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command('config')
      .alias('c')
      .description('Set/Get for CLI Config')
      .option('--ali-key <ali-key>', 'provide an ali key')
      .option('--ali-secret <ali-secret>', 'provide an ali secret')
      .option('--ali-bucket <ali-bucket>', 'provide an ali oss bucket')
      .allowUnknownOption(false)
      .action(async (command: Record<string, any>) => {
        const options: Input[] = []

        options.push({ name: 'ali-secret', value: command.aliSecret })
        options.push({ name: 'ali-key', value: command.aliKey })
        options.push({ name: 'ali-bucket', value: command.aliBucket })

        try {
          await this.action.handle([], options, [])
        } catch (err) {
          process.exit(0)
        }
      })
  }
}
