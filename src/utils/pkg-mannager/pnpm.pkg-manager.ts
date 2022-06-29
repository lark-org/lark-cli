import { AbstractPackageManager } from './abstract.pkg-manager'
import { Runner, RunnerFactory } from '../runners'
import { PnpmRunner } from '../runners/pnpm.runner'
import { PackageManager, PackageManagerCommands } from './pkg.manager-types'

export class PnpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.PNPM) as PnpmRunner)
  }

  public get name() {
    return PackageManager.PNPM.toUpperCase()
  }

  // As of PNPM v5.3, all commands are shared with NPM v6.14.5. See: https://pnpm.js.org/en/pnpm-vs-npm
  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'install',
      update: 'update',
      remove: 'uninstall',
      saveFlag: '--save',
      saveDevFlag: '--save-dev',
      silentFlag: '--reporter=silent'
    }
  }
}
