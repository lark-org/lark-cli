import { Command } from 'commander'
import * as chalk from 'chalk'
import { Input } from '../utils/command.input'
import { AbstractCommand } from './abstract.command'

export class CreateCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command('create <name>')
      .alias('c')
      .description('Create react application.')
      .option('-q, --quick-start', 'Create quickstart react app.')
      .option('-d, --default', 'Use default project template.')
      .option('-m, --mobile', 'Use mobile project template.')
      .option('-c, --console', 'Use console manager project template.')
      .option('-ig, --skip-git', 'Skip git repository initialization.')
      .option('-ii, --skip-install', 'Skip package installation.')
      .option(
        '-p, --package-manager [package-manager]',
        'Specify package manager.'
      )
      .action(async (name: string, opts: any) => {
        if (!name) {
          throw new Error('Please specify the project name.')
        }
        let template = ''

        if (opts.quickStart || opts.default) {
          template = 'default'
        } else if (opts.mobile) {
          template = 'mobile'
        } else if (opts.console) {
          template = 'console'
        }
        const inputs: Input[] = []
        const options: Input[] = []

        options.push({ name: 'skip-git', value: !!opts.skipGit })
        options.push({ name: 'skip-install', value: !!opts.skipInstall })
        options.push({ name: 'quick-start', value: !!opts.quickStart })
        options.push({
          name: 'package-manager',
          value: opts.packageManager
        })
        options.push({
          name: 'template',
          value: template
        })
        inputs.push({ name: 'name', value: name })

        await this.action.handle(inputs, options)
      })
      .addHelpText(
        'after',
        `
  
  Example call:
    $ lark create ${chalk.green('<project-name>')}`
      )
      .showHelpAfterError()
  }
}
