import ora from 'ora'
import { join } from 'path'
import chalk from 'chalk'
import WebSocket from 'ws'
import WebpackDevServer, { ServerConfiguration } from 'webpack-dev-server'
import webpack, { Compiler } from 'webpack'
import fs from 'fs-extra'
import semver from 'semver'

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
import builds from '@/lib/compiler/variables/builds'
import variables from '@/lib/compiler/variables'

import configFactory from '@/lib/compiler/webpack/webpack.dev'
import mfsu from '@/lib/compiler/webpack-plugins/mfsu'
import { ERROR_PREFIX, StateContext, TerminalLog } from '@/utils/log'
import { Input } from '@/utils/command.input'
import { MESSAGES } from '@/ui/messages'
import { AbstractAction } from './abstract.action'

const isInteractive = process.stdout.isTTY
const { appPath, appTsConfig, yarnLockFile } = paths
const { mfsu: MFSU_ENABLED } = builds
const { APP_NAME: appName, FAST_REFRESH } = variables

const ws: WebSocket.WebSocket | null = null

export class StartAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    try {
      const cwd = process.cwd()
      const host = options.find((option) => option.name === 'host')?.value
      const defaultPort = options.find(
        (option) => option.name === 'port'
      )?.value
      const https = options.find((option) => option.name === 'https')?.value
      const sslCert = options.find(
        (option) => option.name === 'ssl-cert'
      )?.value
      const sslKey = options.find((option) => option.name === 'ssl-key')?.value
      let isHttpsEnable = false
      let keyFile
      let certFile

      TerminalLog.splice(0, TerminalLog.length)

      await checkBrowsers(appPath, isInteractive)

      const DEFAULT_PORT = defaultPort ? Number(`${defaultPort}`) : 3000
      const HOST = (host || process.env.HOST || '0.0.0.0') as string

      if (!!https && !sslCert && !sslCert) {
        isHttpsEnable = await askForHttpsReady(HOST)

        if (isHttpsEnable) {
          keyFile = fs.readFileSync(join(paths.appHttpsKey(HOST)))
          certFile = fs.readFileSync(join(paths.appHttpsCert(HOST)))
        }
      } else if (!!https && sslCert && sslKey) {
        keyFile = fs.readFileSync(join(sslKey as string))
        certFile = fs.readFileSync(join(sslCert as string))
      }
      if (isHttpsEnable && !keyFile && !certFile) {
        throw new Error(
          `Https 配置参数缺失，请检查传入的 Key 和 Cert 文件是否有误，如使用默认提供的 Https 服务，请检查是否已安装 mkcert`
        )
      }
      const httpsFile = isHttpsEnable
        ? {
            key: keyFile,
            cert: certFile
          }
        : {}

      if (host || process.env.HOST) {
        console.log(
          chalk.cyan(
            `Attempting to bind to HOST environment variable: ${chalk.yellow(
              chalk.bold(host || process.env.HOST)
            )}`
          )
        )
        console.log(
          `If this was unintentional, check that you haven't mistakenly set it in your shell.`
        )
        // console.log(
        //   `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
        // )
        console.log()
      }
      const port = await choosePort(HOST, DEFAULT_PORT)

      if (!port) {
        return
      }
      const protocol = isHttpsEnable ? 'https' : 'http'
      const urls = prepareUrls(protocol, HOST, port)
      const config = await getDevConfig()
      const useTypeScript = fs.existsSync(appTsConfig)
      const useYarn = fs.existsSync(yarnLockFile)

      const compiler = createCompiler({
        appName,
        config,
        urls,
        useYarn,
        webpack,
        useTypeScript
      } as unknown as CreateCompilerOptions) as unknown as Compiler
      const serverConfig: WebpackDevServer.Configuration = {
        ...config.devServer,
        ...(isHttpsEnable && { https: httpsFile }),
        host: HOST,
        port
      }

      const devServer = new WebpackDevServer(serverConfig, compiler)
      const react = require(require.resolve('react', { paths: [appPath] }))

      devServer.startCallback(() => {
        if (isInteractive) {
          clearConsole()
        }
        if (FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
          console.log(
            chalk.yellow(
              `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
            )
          )
        }
        console.log(chalk.cyan('Starting the development server...\n'))
        openBrowser(urls.localUrlForBrowser)
      })
      // 输出日志到浏览器控制台
      StateContext.subscribe('push', (args: string) => {
        console.log('测试', args?.[0])
      })
      ;['SIGINT', 'SIGTERM'].forEach((sig) => {
        process.on(sig, () => {
          devServer.close()
          process.exit()
        })
      })
      if (process.env.CI !== 'true') {
        // Gracefully exit when stdin ends
        process.stdin.on('end', () => {
          devServer.close()
          process.exit()
        })
      }
    } catch (err) {
      console.error(err)

      if (err instanceof Error) {
        console.log(`\n${ERROR_PREFIX} ${err.message}\n`)
      } else {
        console.error(`\n${chalk.red(err)}\n`)
      }
      process.exit(1)
    }
  }
}

const getDevConfig = async () => {
  const config: webpack.Configuration = configFactory()

  if (MFSU_ENABLED) {
    await mfsu.setWebpackConfig({
      // @ts-ignore
      config
    })
  }
  return config
}

const askForHttpsReady = async (host: string): Promise<boolean> => {
  const isExists = await fs.pathExists(paths.appHttpsConfig)
  if (!isExists) {
    fs.mkdirSync(paths.appHttpsConfig)
  }
  const isHttpsConfigReady =
    fs.existsSync(paths.appHttpsKey(host)) &&
    fs.existsSync(paths.appHttpsCert(host))

  if (isHttpsConfigReady) {
    return true
  }
  const runner = new MKcertRunner()
  const spinner = ora(`生成本地Https证书`).start()

  try {
    await runner
      .run(
        `-key-file ${host}-key.pem -cert-file ${host}-cert.pem ${host} `,
        true,
        paths.appHttpsConfig
      )
      .catch(() => {
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
