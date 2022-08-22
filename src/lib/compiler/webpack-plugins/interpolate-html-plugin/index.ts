// This Webpack plugin lets us interpolate custom variables into `index.html`.
// Usage: `new InterpolateHtmlPlugin(HtmlWebpackPlugin, { 'MY_VARIABLE': 42 })`
// Then, you can use %MY_VARIABLE% in your `index.html`.
// It works in tandem with HtmlWebpackPlugin.
// Learn more about creating plugins like this:
// https://github.com/ampedandwired/html-webpack-plugin#events
import escapeStringRegexp from 'escape-string-regexp'

class InterpolateHtmlPlugin {
  replacements: Record<string, any>

  HtmlWebpackPlugin: any

  constructor(htmlWebpackPlugin: any, replacements: any) {
    this.HtmlWebpackPlugin = htmlWebpackPlugin
    this.replacements = replacements
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('InterpolateHtmlPlugin', (compilation) => {
      // @ts-ignore
      this.HtmlWebpackPlugin?.getHooks(compilation).beforeEmit.tap(
        'InterpolateHtmlPlugin',
        (data) => {
          // Run HTML through a series of user-specified string replacements.
          Object.keys(this.replacements).forEach((key) => {
            const value = this.replacements[key]

            // eslint-disable-next-line no-param-reassign
            data.html = data.html.replace(
              new RegExp(`%${escapeStringRegexp(key)}%`, 'g'),
              value
            )
          })
        }
      )
    })
  }
}

export default InterpolateHtmlPlugin
