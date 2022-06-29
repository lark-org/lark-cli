/* eslint-disable no-lonely-if */
import { readdir } from 'fs'
import { AbstractPackageManager } from './abstract.pkg-manager'
import { NpmPackageManager } from './npm.pkg-manager'
import { PackageManager } from './pkg.manager-types'
import { YarnPackageManager } from './yarn.pkg-manager'
import { PnpmPackageManager } from './pnpm.pkg-manager'

export class PackageManagerFactory {
  public static create(name: PackageManager | string): AbstractPackageManager {
    switch (name) {
      case PackageManager.NPM:
        return new NpmPackageManager()
      case PackageManager.YARN:
        return new YarnPackageManager()
      case PackageManager.PNPM:
        return new PnpmPackageManager()
      default:
        throw new Error(`Package manager ${name} is not managed.`)
    }
  }

  public static async find(): Promise<AbstractPackageManager> {
    return new Promise<AbstractPackageManager>((resolve) => {
      readdir(process.cwd(), (error, files) => {
        if (error) {
          resolve(this.create(PackageManager.NPM))
        } else {
          if (files.findIndex((filename) => filename === 'yarn.lock') > -1) {
            resolve(this.create(PackageManager.YARN))
          } else if (
            files.findIndex((filename) => filename === 'pnpm-lock.yaml') > -1
          ) {
            resolve(this.create(PackageManager.PNPM))
          } else {
            resolve(this.create(PackageManager.NPM))
          }
        }
      })
    })
  }
}
