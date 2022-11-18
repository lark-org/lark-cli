import chalk from 'chalk'
import { Command } from 'commander'
import { Input } from '../utils/command.input'
import { AbstractCommand } from './abstract.command'

export class ConfigCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command('config')
      .alias('c')
      .description('Set/Get for CLI Config')
      .option('-l, --list', 'get all config list')
      .option('--get <config-key>', 'get config value by key')
      .option('--s3-key <s3-key>', 'provide an aws s3 key')
      .option('--s3-secret <s3-secret>', 'provide an aws s3 secret')
      .option('--s3-bucket <s3-bucket>', 'provide an aws s3 oss bucket')
      .option('--s3-region <s3-region>', 'provide an aws s3 oss region')
      .option('--s3-cdn <s3-cdn>', 'provide an aws s3 oss cdn url')
      .option('--s3-endpoint <s3-endpoint>', 'provide an aws s3 oss endpoint')
      .allowUnknownOption(false)
      .action(async (command: Record<string, any>) => {
        const options: Input[] = []

        options.push({ name: 'list', value: command.list })
        options.push({ name: 'get', value: command.configKey })
        options.push({ name: 's3-secret', value: command.s3Secret })
        options.push({ name: 's3-key', value: command.s3Key })
        options.push({ name: 's3-bucket', value: command.s3Bucket })
        options.push({ name: 's3-region', value: command.s3Region })
        options.push({ name: 's3-cdn', value: command.s3Cdn })
        options.push({ name: 's3-endpoint', value: command.s3Endpoint })
        try {
          await this.action.handle([], options, [])
        } catch (err) {
          process.exit(0)
        }
      })
      .addHelpText(
        'after',
        `
  
  Example call:
    $ lark config --${chalk.green('<config-option> <config-value>')}`
      )
      .showHelpAfterError()
  }
}
