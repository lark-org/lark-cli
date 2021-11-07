import chalk from 'chalk'

export const l = (msg: string): void =>
  console.log(`${chalk.green('[Lark]')} - ${msg}`)

export const w = (msg: string): void =>
  console.warn(`${chalk.yellow('[Lark]')} - ${msg}`)

export default {
  l,
  w
}
