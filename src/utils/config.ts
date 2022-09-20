import fs from 'fs-extra'
import ini from 'ini'
import { getWorkspacePath } from '@/lib/compiler/variables/utils'

const configFile = getWorkspacePath('./.lark/.larkrc')

export function getConfigInfo(): Record<string, any> {
  return fs.existsSync(configFile)
    ? ini.decode(fs.readFileSync(configFile, 'utf-8'))
    : {}
}

export function setConfigInfo(
  configInfo: string,
  callback: (err: Error) => void
) {
  fs.writeFile(configFile, ini.encode(configInfo), callback)
}

export function getPrintTableData(data: Record<string, string>) {
  const tableData = Object.keys(data).map((name, index) => {
    const value = data[name]
    return {
      name,
      value
    }
  })
  return tableData
}
