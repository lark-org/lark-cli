import webpack from 'webpack'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'

import paths from '@/lib/compiler/variables/paths'
import variables from '@/lib/compiler/variables'
import configFactory from '@/lib/compiler/webpack/webpack.prod'

import FileSizeReporter, {
  OpaqueFileSizes
} from 'react-dev-utils/FileSizeReporter'
import printBuildError from 'react-dev-utils/printBuildError'
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages'
import printHostingInstructions from 'react-dev-utils/printHostingInstructions'

import { checkBrowsers } from 'react-dev-utils/browsersHelper'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import bfj from 'bfj'

const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } =
  FileSizeReporter

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

const { appPath, appBuild } = paths
const { PUBLIC_PATH } = variables

const isInteractive = process.stdout.isTTY

const useYarn = fs.existsSync(paths.yarnLockFile)

interface BuildOptions {
  analyze?: boolean
  statsJson?: boolean
}

interface BuildResult {
  stats: webpack.Stats | undefined
  previousFileSizes: OpaqueFileSizes
  warnings: string[]
}

export async function build(
  previousFileSizes: any,
  buildOptions?: BuildOptions
): Promise<BuildResult> {
  const config: webpack.Configuration = await configFactory()

  if (buildOptions?.analyze) {
    config.plugins?.push(new BundleAnalyzerPlugin())
  }
  const buildResult = await promisifyWebpackCompile(
    config,
    previousFileSizes,
    buildOptions?.statsJson
  )

  return buildResult
}

function promisifyWebpackCompile(
  config: webpack.Configuration,
  previousFileSizes: OpaqueFileSizes,
  writeStatsJson: boolean
): Promise<BuildResult> {
  console.log(`${chalk.green('Environment:')} ${process.env.APP_ENV}`)
  console.log()
  console.log('Creating an optimized production build...')
  console.log()

  const compiler = webpack(config)
  return new Promise((resolve, reject) => {
    console.log(`$Compiling...`)
    console.time(`Compiled End`)

    compiler.run((err, stats) => {
      let messages = null

      console.timeEnd(`Compiled End`)

      if (err) {
        if (!err.message) {
          return reject(err)
        }

        let errMessage = err.message

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage += `\nCompileError: Begins at CSS selector ${
            // @ts-ignore
            err?.postcssNode?.selector
          }`
        }
        // @ts-ignore
        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: []
        })
      } else {
        messages = formatWebpackMessages(
          // @ts-ignore
          stats.toJson({ all: false, warnings: true, errors: true })
        )
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }
        return reject(new Error(messages.errors.join('\n\n')))
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages?.warnings.length
      ) {
        // Ignore sourcemap warnings in CI builds. See #8227 for more info.
        const filteredWarnings = messages.warnings.filter(
          (w) => !/Failed to parse source map/.test(w)
        )
        if (filteredWarnings.length) {
          console.log(
            chalk.yellow(
              '\nTreating warnings as errors because process.env.CI = true.\n' +
                'Most CI servers set it automatically.\n'
            )
          )
          return reject(new Error(filteredWarnings.join('\n\n')))
        }
      }

      const resolveArgs: BuildResult = {
        stats,
        previousFileSizes,
        warnings: messages?.warnings
      }
      if (writeStatsJson) {
        // eslint-disable-next-line promise/no-promise-in-callback
        return bfj
          .write(`${appBuild}/bundle-stats.json`, stats?.toJson())
          .then(() => resolve(resolveArgs))
          .catch((error: Error) => reject(error))
      }

      return resolve(resolveArgs)
    })
  })
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml
  })
}

export default (buildOptions: BuildOptions) => {
  checkBrowsers(appPath, isInteractive)
    .then(() => measureFileSizesBeforeBuild(appBuild))
    .then((previousFileSizes: OpaqueFileSizes) => {
      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      fs.emptyDirSync(appBuild)
      // Merge with the public folder
      copyPublicFolder()

      // Start the webpack build
      return build(previousFileSizes, buildOptions)
    })
    .then(
      ({ stats, previousFileSizes, warnings }: BuildResult) => {
        if (warnings.length) {
          console.log(chalk.yellow('Compiled with warnings.\n'))
          console.log(warnings.join('\n\n'))
          console.log(
            `\nSearch for the ${chalk.underline(
              chalk.yellow('keywords')
            )} to learn more about each warning.`
          )
          console.log(
            `To ignore, add ${chalk.cyan(
              '// eslint-disable-next-line'
            )} to the line before.\n`
          )
        } else {
          console.log(chalk.green('Compiled successfully.\n'))
        }
        console.log('File sizes after gzip:\n')

        printFileSizesAfterBuild(
          // @ts-ignore
          stats,
          previousFileSizes,
          appBuild,
          WARN_AFTER_BUNDLE_GZIP_SIZE,
          WARN_AFTER_CHUNK_GZIP_SIZE
        )
        console.log()

        const appPackage = require(paths.appPackageJson)
        const publicUrl = PUBLIC_PATH
        // const { publicPath } = config.output;
        const buildFolder = path.relative(process.cwd(), paths.appBuild)
        printHostingInstructions(
          appPackage,
          publicUrl,
          PUBLIC_PATH,
          buildFolder,
          useYarn
        )
      },
      (err: Error) => {
        const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true'
        if (tscCompileOnError) {
          console.log(
            chalk.yellow(
              'Compiled with the following type errors (you may want to check these before deploying your app):\n'
            )
          )
          printBuildError(err)
        } else {
          console.log(chalk.red('Failed to compile.\n'))
          printBuildError(err)
          process.exit(1)
        }
      }
    )
    .catch((err: Error) => {
      if (err && err.message) {
        console.error(err.message)
      }
      process.exit(1)
    })
}