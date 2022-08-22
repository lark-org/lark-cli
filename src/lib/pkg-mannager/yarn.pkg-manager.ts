import { AbstractPackageManager } from './abstract.pkg-manager'
import { Runner, RunnerFactory } from '../runners'
import { YarnRunner } from '../runners/yarn.runner'
import { PackageManager, PackageManagerCommands } from './pkg.manager-types'

export class YarnPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.YARN) as YarnRunner)
  }

  public get name() {
    return PackageManager.YARN.toUpperCase()
  }

  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'add',
      update: 'upgrade',
      remove: 'remove',
      saveFlag: '',
      saveDevFlag: '-D',
      silentFlag: '--silent'
    }
  }
}
