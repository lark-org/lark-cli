import chalk from 'chalk'
import { EMOJIS } from './emojis'

const PROJECT_INSTALL_MESSAGE = {
  PACKAGE_MANAGER_QUESTION: `请选择要使用的包管理器 ${EMOJIS.HEART}`,
  PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS: `正在安装... ${EMOJIS.COFFEE}`,
  PACKAGE_MANAGER_INSTALLATION_FAILED: (commandToRunManually: string) =>
    `${EMOJIS.SCREAM}  Packages installation failed!\n如果错误输入过少，请手动运行错误命令 ${commandToRunManually} 以查看更多有关错误的原因.`,
  PACKAGE_MANAGER_INSTALLATION_SUCCEED: (name: string) =>
    name !== '.'
      ? `${EMOJIS.ROCKET}  Successfully created project ${chalk.green(name)}`
      : `${EMOJIS.ROCKET}  Successfully created a new project`,
  PACKAGE_MANAGER_PRODUCTION_INSTALLATION_IN_PROGRESS: `Package installation in progress... ${EMOJIS.COFFEE}`
}

export const MESSAGES = {
  ...PROJECT_INSTALL_MESSAGE,
  GET_STARTED_INFORMATION: `${EMOJIS.POINT_RIGHT}  Get started with the following commands:`,
  CHANGE_DIR_COMMAND: (name: string) => `$ cd ${name}`,
  START_COMMAND: (name: string) => `$ ${name} run start`,
  DRY_RUN_MODE: 'Command has been executed in dry run mode, nothing changed!',
  GIT_INITIALIZATION_ERROR: 'Git 初始化失败！',
  GIT_EXECUTION_ERROR: 'Git 执行失败！',
  PROJECT_PORT_QUESTION: '请输入端口号(must be a number below 65535)',
  GIT_VERIFY_STATUS_ERROR: '本地存在未提交文件，请先提交或者还原工作区！',
  HTTPS_INITIALIZATION_ERROR: 'MKCert 初始化失败！'
}
