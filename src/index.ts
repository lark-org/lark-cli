#!/usr/bin/env node
import yargs from 'yargs'
import { create } from './commands/create'

yargs.command<{ name: string }>({
  command: 'create [name]',
  builder: {
    name: {
      description: 'project name',
    },
  },
  handler: args => create(args.name),

})
  .demandCommand()
  .help()
  .option('version', {
    alias: 'v',
  })
  .argv
