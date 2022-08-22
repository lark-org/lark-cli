import { Command } from 'commander'
import { Input } from '../utils/command.input'
import { AbstractCommand } from './abstract.command'

export class StartCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command('start')
      .alias('s')
      .description('Start the development service.')
      // .option(
      //   '-e, --env [env]',
      //   'Specify development environment variables',
      //   'fat'
      // )
      .option('-h, --host [host]', 'Specify the development host', 'localhost')
      .option(
        '-p, --port [port]',
        'Specify the development port number',
        '8080'
      )
      .option('--https', 'Whether to enable https', false)
      .option('--ssl-cert <cert>', 'provide an ssl certificate')
      .option('--ssl-key <key>', 'provide an ssl key')
      .allowUnknownOption(false)
      .action(async (command: Record<string, any>) => {
        const options: Input[] = []

        options.push({ name: 'host', value: command.host })
        options.push({ name: 'port', value: command.port })
        options.push({ name: 'https', value: command.https })

        options.push({ name: 'ssl-cert', value: command.sslCert })
        options.push({ name: 'ssl-key', value: command.sslKey })

        try {
          await this.action.handle([], options, [])
        } catch (err) {
          process.exit(0)
        }
      })
  }
}
