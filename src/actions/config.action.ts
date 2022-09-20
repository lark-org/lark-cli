/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import chalk from 'chalk'
import Table from 'cli-table3'
import { merge } from 'lodash'
import { Input } from '@/utils/command.input'
import { ERROR_PREFIX } from '@/utils/log'
import { getConfigInfo, getPrintTableData, setConfigInfo } from '@/utils/config'
import { AbstractAction } from './abstract.action'

const configNameEnum = ['ali-key', 'ali-secret', 'ali-bucket']

export class ConfigAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    try {
      const aliConfig = options.filter(
        (option) =>
          option.name === 'ali-key' ||
          option.name === 'ali-secret' ||
          option.name === 'ali-bucket'
      )
      const showList = options.find((option) => option.name === 'list')?.value
      const configName = options.find((option) => option.name === 'get')?.value
      if (aliConfig.filter((config) => !!config.value).length) {
        onSet(aliConfig)
      }
      if (showList) {
        console.log(`Show config list.\n${buildListAsTable()}`)
      }
      if (configName && configNameEnum.includes(configName as string)) {
        const configInfo = getConfigInfo()
        const tableData = getPrintTableData(configInfo)
        const configValue = tableData.find((data) => data.name === configName)

        console.log(chalk.green(`${configName}:`))
        console.log(`${configValue || null}`)
        console.log('')
      } else if (configName && !configNameEnum.includes(configName as string)) {
        console.log(`\n${ERROR_PREFIX} invalid config key\n`)
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

function buildListAsTable(): string {
  const leftMargin = '    '
  const tableConfig = {
    head: ['name', 'value'],
    chars: {
      left: leftMargin.concat('│'),
      'top-left': leftMargin.concat('┌'),
      'bottom-left': leftMargin.concat('└'),
      mid: '',
      'left-mid': '',
      'mid-mid': '',
      'right-mid': ''
    }
  }
  const table: any = new Table(tableConfig)
  const configInfo = getConfigInfo()
  const tableData = getPrintTableData(configInfo)

  for (const schematic of tableData) {
    table.push([chalk.green(schematic.name), chalk.cyan(schematic.value)])
  }
  return table.toString()
}

function onSet(options: Input[]) {
  let checkStatus = true
  options.forEach((option) => {
    const { name, value } = option

    if (!value) {
      checkStatus = false
      console.log(chalk.red(`${name} 对应的 value 不能为空！`))
      console.log(' ')
    }
  })
  if (!checkStatus) {
    process.exit(1)
  }
  const configInfo = getConfigInfo()
  const currentConfigInfo = options.reduce(
    (prev: Record<string, any>, current) => {
      prev[current.name] = current.value
      return prev
    },
    {}
  )
  const finalConfigInfo = merge(configInfo, currentConfigInfo)

  setConfigInfo(finalConfigInfo, (err) => {
    if (err) {
      process.exit(1)
    }
    console.log(chalk.green(`Set config success`))
    console.log(' ')
  })
}
