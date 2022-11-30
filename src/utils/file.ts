import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const DEFAULT_SKIP_FILES = [
  '.DS_Store',
  'node_modules',
  '.git',
  '.idea',
  '.vscode',
  '.vscodeignore',
  '.gitkeep'
]

const DEFAULT_SKIP_FILES_END_WITH = ['.LICENSE.txt']

/**
 * 判断文件是否是文件夹
 * @param path 文件路径
 * @returns boolean
 */
export function isDirectory(path: string) {
  return statSync(path).isDirectory()
}

/**
 * 获取某个文件夹下的所有文件
 * @param base 文件路径
 * @param skipFiles 忽略的文件
 * @returns string[] 文件路径
 */
export function getAllFiles(base: string, skipFiles: string[] = []): string[] {
  const skip = [...DEFAULT_SKIP_FILES, ...skipFiles]
  return readdirSync(base)
    .filter(
      (i) => !skip.includes(i) || DEFAULT_SKIP_FILES_END_WITH.indexOf(i) < 0
    )
    .reduce((prev: string[], next) => {
      const path = `${base}/${next}`
      if (isDirectory(path)) {
        return prev.concat(getAllFiles(path))
      }
      return prev.concat(path)
    }, [])
}
