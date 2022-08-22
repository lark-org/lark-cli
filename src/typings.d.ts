declare module '*.json'

declare module 'bfj'

interface Lark {
  name: string
  env?: string
  version?: string
  cliVersion?: string
  buildTime?: string
  sha?: string
  performance?: Record<string, any>[]
}

declare global {
  interface Window {
    __Lark__: Lark
  }
}
