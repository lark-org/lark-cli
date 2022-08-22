/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-console */
import chalk from 'chalk'
import { EventEmitter } from 'events'

export const ERROR_PREFIX = chalk.bgRgb(210, 0, 75).bold.rgb(0, 0, 0)(' Error ')
export const INFO_PREFIX = chalk.bgRgb(60, 190, 100).bold.rgb(0, 0, 0)(' Info ')

class EventLog extends EventEmitter {
  logs = []

  proxyLogs: string[]

  constructor() {
    super()
    const that = this
    this.proxyLogs = new Proxy(this.logs, {
      get(target, prop) {
        const val = target[prop]
        if (typeof val === 'function') {
          if (['push', 'unshift'].includes(prop as string)) {
            // eslint-disable-next-line func-names
            return function () {
              that.emit(prop as string, arguments)
              return Array.prototype[prop].apply(target, arguments)
            }
          }
          return val.bind(target)
        }
        return val
      }
    })
  }

  public subscribe(name: string, callback: (args: string) => void) {
    this.on(name, callback)
  }
}

export const StateContext = new EventLog()

export const TerminalLog: string[] = StateContext.proxyLogs
