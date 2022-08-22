import { HtmlTagObject } from 'html-webpack-plugin'
import { Compilation } from 'webpack'

function getHtmlWebpackOptions(pluginArgs) {
  return pluginArgs && pluginArgs.plugin && pluginArgs.plugin.options
    ? pluginArgs.plugin.options
    : {}
}

function getCompilationOptions(compilation: Compilation) {
  return compilation && compilation.options ? compilation.options : {}
}

function getPublicPath({ compilationOptions }: { compilationOptions: any }) {
  const { output } = compilationOptions

  if (output && output.publicPath) {
    return output.publicPath
  }
  return ''
}

function getResourceName(options: any, tag: HtmlTagObject) {
  let name = tag.attributes && tag.attributes.href
  const publicPath = getPublicPath(options)

  if (!name || typeof name !== 'string') {
    return
  }
  if (publicPath) {
    name = name.replace(publicPath, '')
  }
  if (options.htmlWebpackOptions.hash) {
    // eslint-disable-next-line prefer-destructuring
    name = name.split('?', 1)[0]
  }

  // eslint-disable-next-line consistent-return
  return name
}

function applyCustomAttribute(options: any, tag: HtmlTagObject) {
  const { custom = [] } = options
  const name = getResourceName(options, tag)
  const alter = { ...tag }

  if (name && tag.tagName === 'link') {
    custom.forEach((option) => {
      if (name.match(option.test)) {
        if (!alter.attributes) {
          alter.attributes = {}
        }
        alter.attributes[option.attribute] = option.value
      }
    })
  }

  return alter
}

export default class StyleExtHtmlWebpackPlugin {
  options: any

  compilationCallback: any

  alterAssetTagsCallback: any

  constructor(htmlWebpackPlugin: any, options = {}) {
    this.options = options

    this.compilationCallback = (compilation: Compilation) => {
      htmlWebpackPlugin
        // @ts-ignore
        .getHooks(compilation)
        .alterAssetTags.tap(
          'StyleExtHtmlWebpackPlugin',
          this.alterAssetTagsCallback.bind(this, compilation)
        )
    }
    this.alterAssetTagsCallback = (compilation, pluginArgs, callback) => {
      const { custom = [] } = this.options
      const htmlWebpackOptions = getHtmlWebpackOptions(pluginArgs)
      const compilationOptions = getCompilationOptions(compilation)
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const options = {
        ...this.options,
        htmlWebpackOptions,
        compilationOptions
      }

      if (custom.length) {
        pluginArgs.assetTags.styles.forEach((tag) => {
          applyCustomAttribute(options, tag)
        })
      }

      if (callback) {
        callback(null, pluginArgs)
      }
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      'StyleExtHtmlWebpackPlugin',
      this.compilationCallback
    )
  }
}
