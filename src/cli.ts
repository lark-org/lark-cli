import commander from 'commander'
import create from './commands/create'

const program = new commander.Command('lark')
  .command('create [name]', 'project name')
  .action((options) => create(options.name))
  .showHelpAfterError()

program.parse(process.argv)
