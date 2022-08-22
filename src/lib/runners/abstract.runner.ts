/* eslint-disable no-console */
import chalk from 'chalk'
import { ChildProcess, spawn, SpawnOptions } from 'child_process'

const RUNNER_EXECUTION_ERROR = (command: string) =>
  `\nFailed to execute command: ${command}`

export class AbstractRunner {
  // eslint-disable-next-line no-useless-constructor
  constructor(protected binary: string, protected args: string[] = []) {}

  public async run(
    command: string,
    collect = false,
    cwd: string = process.cwd()
  ): Promise<null | string> {
    const args: string[] = [command]
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? 'pipe' : 'inherit',
      shell: true
    }
    return new Promise<null | string>((resolve, reject) => {
      const child: ChildProcess = spawn(
        `${this.binary}`,
        [...this.args, ...args],
        options
      )
      if (collect) {
        child.stdout!.on('data', (data) =>
          resolve(data.toString().replace(/\r\n|\n/, ''))
        )
      }
      child.on('close', (code) => {
        if (code === 0) {
          resolve(null)
        } else {
          console.error(
            chalk.red(RUNNER_EXECUTION_ERROR(`${this.binary} ${command}`))
          )
          reject()
        }
      })
    })
  }

  /**
   * @param command
   * @returns The entire command that will be ran when calling `run(command)`.
   */
  public rawFullCommand(command: string): string {
    const commandArgs: string[] = [...this.args, command]
    return `${this.binary} ${commandArgs.join(' ')}`
  }
}
