export interface ProjectDependency {
  name: string
  version: string
}

export interface PackageManagerCommands {
  install: string
  add: string
  update: string
  remove: string
  saveFlag: string
  saveDevFlag: string
  silentFlag: string
}

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm'
}
