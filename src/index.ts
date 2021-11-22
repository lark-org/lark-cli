#!/usr/bin/env node
import yargs from 'yargs'
import create from './commands/create'

// eslint-disable-next-line no-unused-expressions
yargs
  .command<{ name: string }>({
    command: 'create [name]',
    builder: {
      name: {
        description: 'project name'
      }
    },
    handler: (args) => create(args.name)
  })
  .demandCommand()
  .help()
  .version().argv
