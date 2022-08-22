import ora from 'ora'
import os from 'os'
import path from 'path'
import prompts, { PromptObject } from 'prompts'
import chalk from 'chalk'
import WebSocket from 'ws'
import WebpackDevServer from 'webpack-dev-server'
import webpack, { Compiler } from 'webpack'
import fs from 'fs-extra'

import clearConsole from 'react-dev-utils/clearConsole'
import openBrowser from 'react-dev-utils/openBrowser'
import {
  choosePort,
  createCompiler,
  CreateCompilerOptions,
  prepareUrls
} from 'react-dev-utils/WebpackDevServerUtils'
import { checkBrowsers } from 'react-dev-utils/browsersHelper'

import { MKcertRunner } from '@/lib/runners/mkcert.runner'
import paths from '@/lib/compiler/variables/paths'

import { StateContext, TerminalLog } from '@/utils/log'
import { Input } from '@/utils/command.input'
import { generateSelect } from '@/utils/questions'
import { MESSAGES } from '@/ui/messages'
import {
  AbstractPackageManager,
  PackageManager,
  PackageManagerFactory
} from '@/lib/pkg-mannager'
import { GitRunner } from '@/lib/runners/git.runner'
import { EMOJIS } from '@/ui/emojis'
import { AbstractAction } from './abstract.action'

type PromptsAnswers = Record<string, any>

const isInteractive = process.stdout.isTTY
const ws: WebSocket.WebSocket | null = null

export class StartAction extends AbstractAction {
  // eslint-disable-next-line class-methods-use-this
  public async handle(inputs: Input[], options: Input[]) {
    try {
      const cwd = process.cwd()
      process.env.NODE_ENV = process.env.NODE_ENV || 'development'
      process.env.BABEL_ENV = process.env.BABEL_ENV || 'development'

      const defaultPort = options.find(
        (option) => option.name === 'port'
      )?.value
      const https = options.find((option) => option.name === 'https')?.value
      const isHttpsEnable = false

      TerminalLog.splice(0, TerminalLog.length)
    } catch (err) {
      if (err && err.message) {
        console.log(err.message)
      }
      process.exit(1)
    }
  }
}

const askForHttpsReady = async (host: string): Promise<boolean> => {
  const isExists = await fs.pathExists(paths.appHttpsConfig)
  const isHttpsConfigReady =
    fs.existsSync(paths.appHttpsKey) && fs.existsSync(paths.appHttpsCert)

  if (isHttpsConfigReady) {
    return true
  }
  if (!isExists) {
    fs.mkdirSync(paths.appHttpsConfig)
  }
  const runner = new MKcertRunner()
  const spinner = ora(`生成本地Https证书`).start()

  try {
    await runner.run(`${host}`, true, paths.appHttpsConfig).catch(() => {
      console.error(chalk.red(MESSAGES.HTTPS_INITIALIZATION_ERROR))
    })
  } catch (error) {
    console.warn('生成Https证书失败，请使用Http访问或者询问管理员')
    return false
  } finally {
    spinner.stop()
  }
  return true
}
