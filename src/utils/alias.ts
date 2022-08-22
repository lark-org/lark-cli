import moduleAlias from 'module-alias'
import path from 'path'

const resolve = (resolvePath: string): string =>
  path.resolve(__dirname, '../', resolvePath)

moduleAlias.addAliases({
  '@': resolve('.')
})

moduleAlias()
