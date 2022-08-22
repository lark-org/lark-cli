/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/catch-or-return */
import { handlebars } from 'consolidate'
import execa from 'execa'
import fs from 'fs-extra'
import ora from 'ora'
import os from 'os'
import path, { join } from 'path'
import prompts, { PromptObject } from 'prompts'
import chalk from 'chalk'
import Metalsmith from 'metalsmith'

import {
  AbstractPackageManager,
  PackageManager,
  PackageManagerFactory
} from '@/lib/pkg-mannager'
import { GitRunner } from '@/lib/runners/git.runner'
import { Input } from '../utils/command.input'
import { AbstractAction } from './abstract.action'
import { generateSelect } from '../utils/questions'
import { MESSAGES } from '../ui/messages'

import { EMOJIS } from '../ui/emojis'

type PromptsAnswers = Record<string, any>
const templateRepoUrls = {
  默认: 'https://github.com/virgoone/project-template.git'
}
const platforms = {
  Default: 'default',
  Console: 'console',
  Mobile: 'mobile'
}
const browserslist = {
  mobile: ['Android >= 4', 'iOS >= 9'],
  pc: {
    production: ['>0.2%', 'not dead', 'not op_mini all'],
    development: [
      'last 1 chrome version',
      'last 1 firefox version',
      'last 1 safari version'
    ]
  }
}

export const exit = () => process.exit(1)

const askForPackageManager = async (): Promise<PromptsAnswers> => {
  const pkgs = [
    PackageManager.NPM,
    PackageManager.YARN,
    PackageManager.PNPM
  ].map((it: string) => ({ title: it, value: it }))
  const questions: PromptObject[] = [
    generateSelect('package-manager')(MESSAGES.PACKAGE_MANAGER_QUESTION)(pkgs)
  ]
  return prompts(questions)
}

const askForProjectPort = async (): Promise<PromptsAnswers> => {
  const questions: PromptObject[] = [
    generateSelect('project-port', 'number')(MESSAGES.PROJECT_PORT_QUESTION)(
      [],
      (input: string | number): boolean =>
        typeof input === 'number' && input > 1000 && input < 65535
    )
  ]
  return prompts(questions)
}

const selectPackageManager = async (): Promise<AbstractPackageManager> => {
  const answers: PromptsAnswers = await askForPackageManager()
  return PackageManagerFactory.create(answers['package-manager'])
}

const selectProjectPort = async (): Promise<number> => {
  const answers = await askForProjectPort()
  return answers['project-port'] as number
}

const installPackages = async (
  options: Input[],
  dryRunMode: boolean,
  installDirectory: string
) => {
  const inputPackageManager: string = options.find(
    (option) => option.name === 'package-manager'
  )!.value as string

  let packageManager: AbstractPackageManager
  if (dryRunMode) {
    console.info()
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE))
    console.info()
    return
  }

  if (inputPackageManager !== undefined) {
    try {
      packageManager = PackageManagerFactory.create(inputPackageManager)
      await packageManager.install(installDirectory, inputPackageManager)
    } catch (error) {
      if (error && error.message) {
        console.error(chalk.red(error.message))
      }
    }
  } else {
    packageManager = await selectPackageManager()
    await packageManager.install(
      installDirectory,
      packageManager.name.toLowerCase()
    )
  }
}

const initializeGitRepository = async (dir: string) => {
  const runner = new GitRunner()
  await runner.run('init', true, join(process.cwd(), dir)).catch(() => {
    console.error(chalk.red(MESSAGES.GIT_INITIALIZATION_ERROR))
  })
}

const addGitCommand = async (dir: string) => {
  const runner = new GitRunner()
  await runner.run('add -A', true, join(process.cwd(), dir)).catch(() => {
    console.error(chalk.red(MESSAGES.GIT_EXECUTION_ERROR))
  })
}

export const removeDirectory = async (directoryPath: string) => {
  const name = path.basename(directoryPath)
  const spinner = ora(`Removing target directory ${name}`)
  spinner.start()
  await fs.remove(directoryPath)
  spinner.stop()
}

export const cloneGitRepo = async (gitRepoUrl: string) => {
  const gitSpinner = ora(`获取模版`)
  gitSpinner.start()
  const tmp = path.resolve(os.tmpdir(), 'lark-cli')
  await fs.remove(tmp)
  await execa('git', ['clone', gitRepoUrl, tmp, '--depth', '1'])
  await fs.remove(path.resolve(`${tmp}.git`))
  gitSpinner.stop()
  return tmp
}

const getGitUserInfo = async () => {
  const gitSpinner = ora(`获取 Git 信息`)
  gitSpinner.start()
  let author
  let email
  try {
    author = (await execa('git', ['config', '--get', 'user.name'])).stdout
    email = (await execa('git', ['config', '--get', 'user.email'])).stdout
  } catch (e) {
    console.warn('获取 Git 用户失败')
  }
  gitSpinner.stop()
  author = author ? author.toString().trim() : ''
  email = email ? `${email.toString().trim()}` : ''

  return { author, email }
}

const getTemplateInfo = async () => {
  // 选择合适模板或使用自定义模板
  let templateUrl = (
    await prompts({
      type: 'select',
      name: 'template',
      message: `选择模板`,
      choices: Object.entries(templateRepoUrls)
        .map((v) => ({
          title: v[0],
          value: v[1]
        }))
        .concat({
          title: '自定义',
          value: ''
        })
    })
  ).template

  let platform = ''
  let mobile = false

  if (!templateUrl) {
    templateUrl = (
      await prompts({
        type: 'text',
        name: 'template',
        message: '请输入自定义的模板地址'
      })
    ).template
  } else {
    platform = (
      await prompts({
        type: 'select',
        name: 'platform',
        message: `选择平台`,
        choices: Object.entries(platforms).map((v) => ({
          title: v[0],
          value: v[1]
        }))
      })
    ).platform
  }
  if (!templateUrl) {
    console.log('please input a legal template url')
  }

  if (platform && platform === platforms.Mobile) {
    mobile = true
  }

  return { templateUrl, platform, mobile }
}

const replaceProjectInLocal = async (projectName: string) => {
  const dest = path.join(process.cwd(), projectName)
  if (fs.existsSync(dest) && (await fs.stat(dest)).isDirectory()) {
    // 文件名冲突时覆盖逻辑
    const forceCover: boolean = (
      await prompts({
        type: 'select',
        name: 'cover',
        message: `文件 ${projectName} 已经存在，是否覆盖？`,
        choices: [
          {
            title: 'cover',
            value: true
          },
          {
            title: 'cancel',
            value: false
          }
        ]
      })
    ).cover
    if (!forceCover) {
      return
    }
    await removeDirectory(dest)
  }
}

const defaultTemplateInfo = {
  templateUrl: templateRepoUrls.默认,
  platform: platforms.Default,
  mobile: false
}

const create = async (projectName: string, options: Input[]) => {
  const dest = path.join(process.cwd(), projectName)
  const shouldSkipInstall = options.some(
    (option) => option.name === 'skip-install' && option.value === true
  )
  const shouldSkipGit = options.some(
    (option) => option.name === 'skip-git' && option.value === true
  )
  const quickStart = options.some(
    (option) => option.name === 'quick-start' && option.value === true
  )
  await replaceProjectInLocal(projectName)

  const { templateUrl, platform, mobile } = quickStart
    ? defaultTemplateInfo
    : await getTemplateInfo()

  const port = await selectProjectPort()
  const spinner = ora(`Generating project in ${chalk.yellow(dest)}`)

  spinner.start()
  let tempPath = ''
  try {
    tempPath = await cloneGitRepo(templateUrl)
  } catch (e) {
    console.warn(e)
    spinner.stop()
    return
  }

  const { email, author } = await getGitUserInfo()

  Metalsmith(__dirname)
    .metadata({
      name: projectName,
      author,
      email,
      port,
      mobile
    })
    .source(path.join(tempPath, platform ? `template/${platform}` : ''))
    .destination(dest)
    .use(async (files, metalsmith, callback) => {
      const keys = Object.keys(files)

      const metadata = metalsmith.metadata()
      console.log()

      await Promise.all(
        keys.map((key) => {
          console.log(chalk.green(`${EMOJIS.POINT_RIGHT} 写入 ${key}`))
          // 控制台应用不需要替换
          if (platform === platforms.Console) {
            return Promise.resolve()
          }
          const str = files[key].contents.toString()
          return new Promise((resolve, reject) => {
            // eslint-disable-next-line consistent-return
            handlebars.render(str, metadata, (err, res) => {
              if (err) {
                console.error(`${key} 模板渲染失败}`, err)
                reject(err)
              }
              // eslint-disable-next-line no-param-reassign
              files[key].contents = Buffer.from(res)
              resolve(0)
            })
          })
        })
      )
      console.log()
      callback(null, files, metalsmith)
    })
    .build(async (err) => {
      try {
        if (err) throw err
        const pkgFile = path.join(dest, 'package.json')
        // eslint-disable-next-line
        const pkg = require(pkgFile)

        pkg.name = projectName
        pkg.browserslist = mobile ? browserslist.mobile : browserslist.pc
        if (pkg.scripts.start) {
          pkg.scripts.start = `lark-cli-service start -p ${port}`
        }

        await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2))
        spinner.stopAndPersist({ symbol: '✨ ' })

        if (!shouldSkipGit) {
          await initializeGitRepository(projectName)
        }

        // 像husky这样的package需要在git init之后安装才有用
        if (!shouldSkipInstall) {
          console.log()
          await installPackages(options, quickStart as boolean, projectName)
        }

        if (!shouldSkipGit) {
          await addGitCommand(projectName)
        }
        console.log()
        console.log(
          chalk.yellow(`Thanks for installing Lark CLI ${EMOJIS.PRAY}`)
        )
        console.log()
        console.log()
      } catch (e) {
        console.warn(e)
        spinner.stop()
        exit()
      }
    })
}
export class CreateAction extends AbstractAction {
  // eslint-disable-next-line class-methods-use-this
  public async handle(inputs: Input[], options: Input[]) {
    const getApplicationNameInput = inputs.find(
      (input) => input.name === 'name'
    )

    if (!getApplicationNameInput?.value) {
      console.log('please input a legal project name')
      return
    }
    try {
      await create(getApplicationNameInput.value as string, options)
    } catch (error) {
      console.error(error)
      exit()
    }
  }
}
