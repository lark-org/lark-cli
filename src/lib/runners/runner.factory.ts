import chalk from 'chalk'
import { Runner } from './runner'
import { NpmRunner } from './npm.runner'
import { PnpmRunner } from './pnpm.runner'
import { YarnRunner } from './yarn.runner'

export class RunnerFactory {
  // eslint-disable-next-line consistent-return
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.NPM:
        return new NpmRunner()

      case Runner.YARN:
        return new YarnRunner()

      case Runner.PNPM:
        return new PnpmRunner()

      default:
        console.info(chalk.yellow(`[WARN] Unsupported runner: ${runner}`))
    }
  }
}
