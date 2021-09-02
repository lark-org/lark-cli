/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/catch-or-return */
import chalk from 'chalk'
import { handlebars } from 'consolidate'
import execa from 'execa'
import fs from 'fs-extra'
import Metalsmith from 'metalsmith'
import ora from 'ora'
import os from 'os'
import path from 'path'
import prompts from 'prompts'
import { installDependencies } from '../utils/dependencies'
import { l } from '../utils/log'

const templateRepoUrls = {
  默认: 'https://github.com/virgoone/project-template.git'
}
const platforms = {
  Default: 'default',
  Console: 'console'
}
const browserslist = {
  mobile: ['Android >= 4', 'iOS >= 9'],
  pc: ['last 1 version', '> 1%', 'IE 10']
}

export const removeDirectory = async (directoryPath: string) => {
  const name = path.basename(directoryPath)
  const spinner = ora(`Removing target directory ${name}`)
  spinner.start()
  await fs.remove(directoryPath)
  spinner.stop()
}

export const cloneGitRepo = async (gitRepoUrl: string) => {
  const tmp = path.resolve(os.tmpdir(), 'lark-cli')
  await fs.remove(tmp)
  await execa('git', ['clone', gitRepoUrl, tmp, '--depth', '1'])
  await fs.remove(path.resolve(`${tmp}.git`))
  return tmp
}

export const create = async (name: string) => {
  if (!name) {
    l('please input a legal project name')
    return
  }

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

  if (platform && platform === platforms.Default) {
    mobile = (
      await prompts({
        type: 'select',
        name: 'mobile',
        message: `是否移动端`,
        choices: [
          { title: '是', value: true },
          { title: '否', value: false }
        ]
      })
    ).mobile
  }

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

  let author
  let email
  try {
    author = (await execa('git', ['config', '--get', 'user.name'])).stdout
    email = (await execa('git', ['config', '--get', 'user.email'])).stdout
  } catch (e) {
    console.warn('获取 Git 用户失败')
  }
  author = author ? author.toString().trim() : ''
  email = email ? ` <${email.toString().trim()}> ` : ''

  Metalsmith(__dirname)
    .metadata({
      name,
      author,
      email,
      port,
      mobile
    })
    .source(path.join(tempPath, platform ? `template/${platform}` : 'template'))
    .destination(dest)
    .use((files, metalsmith, callback) => {
      const keys = Object.keys(files)
      const metadata = metalsmith.metadata()

      Promise.all(
        keys.map((key) => {
          const str = files[key].contents.toString()
          return new Promise((resolve) => {
            // eslint-disable-next-line consistent-return
            handlebars.render(str, metadata, (err, res) => {
              if (err) {
                return resolve(err)
              }
              // eslint-disable-next-line no-param-reassign
              files[key].contents = Buffer.from(res)
              resolve(0)
            })
          })
        })
        // eslint-disable-next-line promise/always-return
      ).then(() => {
        callback(null, files, metalsmith)
      })
    })
    .build(async (err) => {
      try {
        if (err) throw err
        const pkgFile = path.join(dest, 'package.json')
        // eslint-disable-next-line
        const pkg = require(pkgFile)
        pkg.browserslist = mobile ? browserslist.mobile : browserslist.pc
        await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2))
        spinner.stopAndPersist({ symbol: '✨ ' })
        l(`📦  Installing dependencies...`)
        await execa('git', ['init'], { cwd: dest })
        // 像husky这样的package需要在git init之后安装才有用
        await installDependencies(dest)
        l('dependencies has been installed')
        await execa('git', ['add', '-A'], { cwd: dest })
        await execa('git', ['commit', '-m', 'feat(init): initial commit'], {
          cwd: dest
        })
        l(`Successfully created project ${chalk.yellow(name)}.`)
        l(`Get started with the following commands:\n\n`)
        l(chalk.cyan(` ${chalk.gray('$')} cd ${name}`))
        l(chalk.cyan(` ${chalk.gray('$')} yarn start`))
      } catch (e) {
        console.warn(e)
        spinner.stop()
      }
    })
}
