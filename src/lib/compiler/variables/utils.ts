import path from 'path'
import fs from 'fs-extra'

const appDirectory = fs.realpathSync(process.cwd())

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx'
]

const resolveModule = (
  resolveFn: (path: string) => string,
  filePath: string
) => {
  const extension = moduleFileExtensions.find((ext) =>
    fs.existsSync(resolveFn(`${filePath}.${ext}`))
  )

  if (extension) {
    return resolveFn(`${filePath}.${extension}`)
  }

  return resolveFn(`${filePath}.js`)
}
const getProjectFilePath = (relativePath: string) =>
  path.resolve(process.cwd(), relativePath)

const getWorkspacePath = (relativePath: string) =>
  path.resolve(
    process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'],
    relativePath
  )

const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath)

export default {
  getProjectFilePath,
  resolveApp,
  resolveModule,
  getWorkspacePath
}

export { getWorkspacePath, getProjectFilePath, resolveApp, resolveModule }
