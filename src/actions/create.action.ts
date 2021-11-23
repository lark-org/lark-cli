/* eslint-disable no-console */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/catch-or-return */
import { handlebars } from 'consolidate'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as ora from 'ora'
import * as os from 'os'
import * as path from 'path'
import * as prompts from 'prompts'
import * as chalk from 'chalk'
import * as Metalsmith from 'metalsmith'
import { Input } from '../utils/command.input'
import { installDependencies } from '../utils/dependencies'
import { AbstractAction } from './abstract.action'

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
const defaultTemplateInfo = {
  templateUrl: templateRepoUrls.默认,
  platform: platforms.Default,
  mobile: false
}

const create = async (name: string, options: Input[]) => {
  const dest = path.join(process.cwd(), name)
  if (fs.existsSync(dest) && (await fs.stat(dest)).isDirectory()) {
    // 文件名冲突时覆盖逻辑
    const forceCover: boolean = (
      await prompts({
        type: 'select',
        name: 'cover',
        message: `文件 ${name} 已经存在，是否覆盖？`,
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
  const shouldSkipInstall = options.some(
    (option) => option.name === 'skip-install' && option.value === true
  )
  const shouldSkipGit = options.some(
    (option) => option.name === 'skip-git' && option.value === true
  )
  const quickStart = options.some(
    (option) => option.name === 'quick-start' && option.value === true
  )
  const { templateUrl, platform, mobile } = quickStart
    ? defaultTemplateInfo
    : await getTemplateInfo()

  const { port } = await prompts({
    type: 'text',
    name: 'port',
    message: '输入端口号 (must be a number below 65535)',
    validate: (prev) => {
      const p = parseInt(prev, 10)
      return p > 0 && p < 65535
    }
  })

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
      name,
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

      await Promise.all(
        keys.map((key) => {
          const str = files[key].contents.toString()
          return new Promise((resolve, reject) => {
            // eslint-disable-next-line consistent-return
            handlebars.render(str, metadata, (err, res) => {
              if (err) {
                reject(err)
              }
              // eslint-disable-next-line no-param-reassign
              files[key].contents = Buffer.from(res)
              resolve(0)
            })
          })
        })
      )
      callback(null, files, metalsmith)
    })
    .build(async (err) => {
      try {
        if (err) throw err
        const pkgFile = path.join(dest, 'package.json')
        // eslint-disable-next-line
        const pkg = require(pkgFile)

        pkg.name = name
        pkg.browserslist = mobile ? browserslist.mobile : browserslist.pc
        if (pkg.scripts.start) {
          pkg.scripts.start = `lark-cli-service start -p ${port}`
        }

        await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2))
        spinner.stopAndPersist({ symbol: '✨ ' })

        if (!shouldSkipGit) {
          await execa('git', ['init'], { cwd: dest })
        }

        // 像husky这样的package需要在git init之后安装才有用
        if (!shouldSkipInstall) {
          console.log(`📦  Installing dependencies...`)
          console.log()
          await installDependencies(dest)
          console.log('dependencies has been installed')
        }

        if (!shouldSkipGit) {
          await execa('git', ['add', '-A'], { cwd: dest })
        }

        console.log()
        console.log()
        console.log(`Successfully created project ${chalk.yellow(name)}.`)
        console.log(`Get started with the following commands:\n\n`)
        console.info(chalk.cyan(` ${chalk.gray('$')} cd ${name}`))
        console.info(chalk.cyan(` ${chalk.gray('$')} yarn start`))
        console.log()
      } catch (e) {
        console.warn(e)
        spinner.stop()
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
    await create(getApplicationNameInput.value as string, options)
  }
}
