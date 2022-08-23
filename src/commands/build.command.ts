import variables from '@/lib/compiler/variables'
import { Command } from 'commander'
import { Input } from '../utils/command.input'
import { AbstractCommand } from './abstract.command'

export class BuildCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command('build')
      .alias('b')
      .description('Build a project with options')
      .option(
        '--app-env [app-env]',
        'Specify APP_ENV environment variables',
        'production'
      )
      .option(
        '--node-env [node-env]',
        'Specify NODE_ENV environment variables',
        'production'
      )
      .option('--json', 'Output webpack build stats json.', false)
      .option('--analyze', 'Output webpack analyze result.', false)
      .option('--skip-verify', 'Skip git verify.', false)
      .allowUnknownOption(false)
      .action(async (command: Record<string, any>) => {
        const options: Input[] = []

        const APP_ENV = command.appEnv
        const NODE_ENV = command.nodeEnv

        process.env.APP_ENV =
          (APP_ENV as string) || process.env.APP_ENV || 'production'
        process.env.NODE_ENV =
          (NODE_ENV as string) || process.env.NODE_ENV || 'production'
        process.env.CI = process.env.CI || 'false'

        // eslint-disable-next-line no-underscore-dangle
        variables.__DEV__ = process.env.NODE_ENV === 'development'
        variables.APP_ENV = process.env.APP_ENV

        options.push({ name: 'analyze', value: command.analyze })
        options.push({ name: 'json', value: command.json })
        options.push({ name: 'skip-verify', value: !!command.skipVerify })

        options.push({ name: 'node-env', value: command.nodeEnv })
        options.push({ name: 'app-env', value: command.appEnv })

        try {
          await this.action.handle([], options, [])
        } catch (err) {
          process.exit(0)
        }
      })
  }
}
