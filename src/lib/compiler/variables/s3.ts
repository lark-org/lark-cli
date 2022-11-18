import { getConfigInfo } from '@/utils/config'
import chalk from 'chalk'
import { getCustomConfig } from './custom-config'

const customConfig = getCustomConfig()
const { s3 = {} } = customConfig
const configInfo = getConfigInfo()
const s3ConfigKeys = [
  's3-key',
  's3-secret',
  's3-bucket',
  's3-region',
  's3-endpoint',
  's3-cdn'
]
export const getS3Config = () => {
  const s3Config: Record<string, any> = {}
  s3ConfigKeys.forEach((name) => {
    const value =
      configInfo[name] ||
      s3[name] ||
      process.env[name.toUpperCase().replace('-', '_')]
    if (!value) {
      console.log(chalk.red(`${name} 对应的 value 不能为空！`))
      process.exit(1)
    }
    s3Config[name] = value
  })
  return s3Config
}
