import chalk from 'chalk'
import SimpleGit from 'simple-git'

import { Input } from '@/utils/command.input'
import { MESSAGES } from '@/ui/messages'
import { ERROR_PREFIX } from '@/utils/log'
import compilerBuild from '@/lib/compiler/deploy/build'

import { AbstractAction } from './abstract.action'

const git = SimpleGit()

export class BuildAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    try {
      const skipVerify = options.find(
        (option) => option.name === 'skip-verify'
      )?.value

      const checkGitStatus = await checkGitFileStatus(!!skipVerify)

      if (!checkGitStatus) {
        process.exit(0)
      }

      const statsJson = options.find((option) => option.name === 'json')?.value
      const analyze = options.find((option) => option.name === 'analyze')?.value

      compilerBuild({
        statsJson: !!statsJson,
        analyze: !!analyze
      })
    } catch (error) {
      if (error instanceof Error) {
        console.log(`\n${ERROR_PREFIX} ${error.message}\n`)
      } else {
        console.error(`\n${chalk.red(error)}\n`)
      }
      process.exit(1)
    }
  }
}

/**
 * 检查当前分支是否有未提交文件
 * @param skipVerify 是否跳过检查
 * @returns {Promise<Boolean>}
 */
async function checkGitFileStatus(skipVerify = false): Promise<boolean> {
  const gitStatus = await git.status()

  if (
    gitStatus.files.filter((file) => file.index === 'M').length > 0 &&
    !skipVerify
  ) {
    console.log(`\n${ERROR_PREFIX} ${MESSAGES.GIT_VERIFY_STATUS_ERROR}\n`)
    return false
  }
  return true
}
