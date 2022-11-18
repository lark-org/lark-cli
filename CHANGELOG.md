## [1.8.3](https://github.com/lark-org/lark-cli/compare/v1.8.2...v1.8.3) (2022-11-18)

### Bug Fixes

- 解决上传失败时任务未终止问题 ([bdea126](https://github.com/lark-org/lark-cli/commit/bdea1262f6d21326f97ef1529a3f8f3d5edf5842))

## [1.8.2](https://github.com/lark-org/lark-cli/compare/v1.8.1...v1.8.2) (2022-11-18)

### Bug Fixes

- upload 传递错误问题 ([eee822d](https://github.com/lark-org/lark-cli/commit/eee822db9a7c0c88fc2e48aa67b1a1f3a903ddb7))

## [1.8.1](https://github.com/lark-org/lark-cli/compare/v1.8.0...v1.8.1) (2022-11-18)

### Bug Fixes

- \_\_dev 判断导致生产构建问题 ([0966fdb](https://github.com/lark-org/lark-cli/commit/0966fdbcee9668f4120111f2812b38ede997e1ed))

# [1.8.0](https://github.com/lark-org/lark-cli/compare/v1.7.2...v1.8.0) (2022-11-18)

### Features

- **build:** 增加上传构建产物至 s3 ([faaf769](https://github.com/lark-org/lark-cli/commit/faaf769332f0ad8e883227db6aaed16cfa8e0327))

## [1.7.2](https://github.com/lark-org/lark-cli/compare/v1.7.1...v1.7.2) (2022-11-05)

### Bug Fixes

- **project:** 构建入口缺失问题 ([ada3fce](https://github.com/lark-org/lark-cli/commit/ada3fce27201c76c790a413fcf1c93ce67477544))
- 解决 pre-commit 问题 ([0f9a5c6](https://github.com/lark-org/lark-cli/commit/0f9a5c644e4f4db415b512b0fea1b87b946b493c))

## [1.7.1](https://github.com/lark-org/lark-cli/compare/v1.7.0...v1.7.1) (2022-11-05)

### Bug Fixes

- **project:** 解决因为构建类型问题导致的 build 失败问题 ([50c8b87](https://github.com/lark-org/lark-cli/commit/50c8b874274300aaf8eec9e5f01ec7d175b74180))

# [1.7.0](https://github.com/lark-org/lark-cli/compare/v1.6.0...v1.7.0) (2022-11-05)

### Features

- **handlebar:** 更换渲染模版引擎为 ejs，防止 react 语法导致渲染失败 ([e9d0a97](https://github.com/lark-org/lark-cli/commit/e9d0a979dac82ea4738f866e06cc90595fda5e44))

# [1.5.0](https://github.com/lark-org/lark-cli/compare/v1.4.0...v1.5.0) (2022-09-20)

### Bug Fixes

- ci config ([8a8149d](https://github.com/lark-org/lark-cli/commit/8a8149d4d6a62dab9043313282dca8973d8d56c9))
- module alias ([48f26c0](https://github.com/lark-org/lark-cli/commit/48f26c028197862553897575503318272db48414))
- 修改 ci trigger ([60494d0](https://github.com/lark-org/lark-cli/commit/60494d0f401349baba89273c401d0287920e6734))
- 修改 warning 时输出日志格式 ([be82135](https://github.com/lark-org/lark-cli/commit/be8213516d643a82bc1cd19330f37eba1b0ab1a6))
- 解决本地开发时启用 https 证书和 host 不绑定问题 ([fe057d5](https://github.com/lark-org/lark-cli/commit/fe057d56eaede698f5c629717c7dbfe9c6a427b4))
- 解决环境变量引入和运行时不一致问题 ([9040af8](https://github.com/lark-org/lark-cli/commit/9040af8612e0d9036b7adbc174dbc7744495eb9b))

### Features

- **cmd:** 增加全局设置命令 ([ee0d2b9](https://github.com/lark-org/lark-cli/commit/ee0d2b9f3720265ed3e21f72a8f113c7f8778091))
- 升级 CLI，增加 start 和 build 命令支持构建 React 项目 ([22a05c4](https://github.com/lark-org/lark-cli/commit/22a05c4c4933d2bb51fdf400c808e0be8b2997c4))
- 完善 start 命令和修复 https 配置问题 ([ffff2d9](https://github.com/lark-org/lark-cli/commit/ffff2d95c5b75518c614a750907fab368d0d1f66))
- 完成 build 重构 ([2f4cbe9](https://github.com/lark-org/lark-cli/commit/2f4cbe98c21040448f180764fab74d0a3313fcfb))
- 更新 CI Config ([d27800e](https://github.com/lark-org/lark-cli/commit/d27800e5ccc882590619853ed0efbe0116a83eca))

# [1.5.0](https://github.com/lark-org/lark-cli/compare/v1.4.0...v1.5.0) (2022-09-19)

### Bug Fixes

- ci config ([8a8149d](https://github.com/lark-org/lark-cli/commit/8a8149d4d6a62dab9043313282dca8973d8d56c9))
- module alias ([48f26c0](https://github.com/lark-org/lark-cli/commit/48f26c028197862553897575503318272db48414))
- 修改 ci trigger ([60494d0](https://github.com/lark-org/lark-cli/commit/60494d0f401349baba89273c401d0287920e6734))
- 修改 warning 时输出日志格式 ([be82135](https://github.com/lark-org/lark-cli/commit/be8213516d643a82bc1cd19330f37eba1b0ab1a6))
- 解决本地开发时启用 https 证书和 host 不绑定问题 ([fe057d5](https://github.com/lark-org/lark-cli/commit/fe057d56eaede698f5c629717c7dbfe9c6a427b4))
- 解决环境变量引入和运行时不一致问题 ([9040af8](https://github.com/lark-org/lark-cli/commit/9040af8612e0d9036b7adbc174dbc7744495eb9b))

### Features

- 升级 CLI，增加 start 和 build 命令支持构建 React 项目 ([22a05c4](https://github.com/lark-org/lark-cli/commit/22a05c4c4933d2bb51fdf400c808e0be8b2997c4))
- 完善 start 命令和修复 https 配置问题 ([ffff2d9](https://github.com/lark-org/lark-cli/commit/ffff2d95c5b75518c614a750907fab368d0d1f66))
- 完成 build 重构 ([2f4cbe9](https://github.com/lark-org/lark-cli/commit/2f4cbe98c21040448f180764fab74d0a3313fcfb))
- 更新 CI Config ([d27800e](https://github.com/lark-org/lark-cli/commit/d27800e5ccc882590619853ed0efbe0116a83eca))

# [1.5.0](https://github.com/lark-org/lark-cli/compare/v1.4.0...v1.5.0) (2022-09-19)

### Bug Fixes

- ci config ([8a8149d](https://github.com/lark-org/lark-cli/commit/8a8149d4d6a62dab9043313282dca8973d8d56c9))
- module alias ([48f26c0](https://github.com/lark-org/lark-cli/commit/48f26c028197862553897575503318272db48414))
- 修改 ci trigger ([60494d0](https://github.com/lark-org/lark-cli/commit/60494d0f401349baba89273c401d0287920e6734))
- 解决本地开发时启用 https 证书和 host 不绑定问题 ([fe057d5](https://github.com/lark-org/lark-cli/commit/fe057d56eaede698f5c629717c7dbfe9c6a427b4))
- 解决环境变量引入和运行时不一致问题 ([9040af8](https://github.com/lark-org/lark-cli/commit/9040af8612e0d9036b7adbc174dbc7744495eb9b))

### Features

- 升级 CLI，增加 start 和 build 命令支持构建 React 项目 ([22a05c4](https://github.com/lark-org/lark-cli/commit/22a05c4c4933d2bb51fdf400c808e0be8b2997c4))
- 完善 start 命令和修复 https 配置问题 ([ffff2d9](https://github.com/lark-org/lark-cli/commit/ffff2d95c5b75518c614a750907fab368d0d1f66))
- 完成 build 重构 ([2f4cbe9](https://github.com/lark-org/lark-cli/commit/2f4cbe98c21040448f180764fab74d0a3313fcfb))
- 更新 CI Config ([d27800e](https://github.com/lark-org/lark-cli/commit/d27800e5ccc882590619853ed0efbe0116a83eca))

# [1.5.0](https://github.com/lark-org/lark-cli/compare/v1.4.0...v1.5.0) (2022-09-19)

### Bug Fixes

- ci config ([854bba6](https://github.com/lark-org/lark-cli/commit/854bba6dd9b2b3245b972752e958bc50cf3e23d5))
- module alias ([9133dba](https://github.com/lark-org/lark-cli/commit/9133dbadeb50962c41e663580161fb363ec38ef6))
- 修改 ci trigger ([e433040](https://github.com/lark-org/lark-cli/commit/e433040f0bc5a31d346e860603a099af4aeaae19))
- 解决本地开发时启用 https 证书和 host 不绑定问题 ([2f9ecab](https://github.com/lark-org/lark-cli/commit/2f9ecabfa5db91d526659f6b732a1462e9b8b013))
- 解决环境变量引入和运行时不一致问题 ([2ce26b6](https://github.com/lark-org/lark-cli/commit/2ce26b61974093949ac994a43467c855c6a761a8))

### Features

- 升级 CLI，增加 start 和 build 命令支持构建 React 项目 ([8adad02](https://github.com/lark-org/lark-cli/commit/8adad02b6090df783be6730d6fe4e16354686b69))
- 完善 start 命令和修复 https 配置问题 ([da56716](https://github.com/lark-org/lark-cli/commit/da567165f0bde5e828d8c3995d62ed5972b6bb78))
- 完成 build 重构 ([dd499ec](https://github.com/lark-org/lark-cli/commit/dd499ec0864960d4035fdea280e91ef1651d3fd3))
- 更新 CI Config ([34f1c90](https://github.com/lark-org/lark-cli/commit/34f1c90e550149863813a983e154284f765c2f7d))

# [1.5.0](https://github.com/lark-org/lark-cli/compare/v1.4.0...v1.5.0) (2022-08-29)

### Bug Fixes

- ci config ([854bba6](https://github.com/lark-org/lark-cli/commit/854bba6dd9b2b3245b972752e958bc50cf3e23d5))
- module alias ([9133dba](https://github.com/lark-org/lark-cli/commit/9133dbadeb50962c41e663580161fb363ec38ef6))
- 修改 ci trigger ([e433040](https://github.com/lark-org/lark-cli/commit/e433040f0bc5a31d346e860603a099af4aeaae19))
- 解决环境变量引入和运行时不一致问题 ([2ce26b6](https://github.com/lark-org/lark-cli/commit/2ce26b61974093949ac994a43467c855c6a761a8))

### Features

- 升级 CLI，增加 start 和 build 命令支持构建 React 项目 ([8adad02](https://github.com/lark-org/lark-cli/commit/8adad02b6090df783be6730d6fe4e16354686b69))
- 完善 start 命令和修复 https 配置问题 ([da56716](https://github.com/lark-org/lark-cli/commit/da567165f0bde5e828d8c3995d62ed5972b6bb78))
- 完成 build 重构 ([dd499ec](https://github.com/lark-org/lark-cli/commit/dd499ec0864960d4035fdea280e91ef1651d3fd3))
- 更新 CI Config ([34f1c90](https://github.com/lark-org/lark-cli/commit/34f1c90e550149863813a983e154284f765c2f7d))

# [1.5.0](https://github.com/lark-org/lark-cli/compare/v1.4.0...v1.5.0) (2022-08-24)

### Bug Fixes

- ci config ([ae28175](https://github.com/lark-org/lark-cli/commit/ae281753b19fba167b3b5823f94955405cc52460))
- module alias ([42e430b](https://github.com/lark-org/lark-cli/commit/42e430b3d1a4bdc1b2ea44c2810edcd1327648e0))
- 修改 ci trigger ([771edd7](https://github.com/lark-org/lark-cli/commit/771edd7a400c3dfc6100341f72038a7cdd32bc1c))

### Features

- 升级 CLI，增加 start 和 build 命令支持构建 React 项目 ([03f88ad](https://github.com/lark-org/lark-cli/commit/03f88ad48a54675b8b38cd981bc0c973a91cf856))
- 完善 start 命令和修复 https 配置问题 ([10b3814](https://github.com/lark-org/lark-cli/commit/10b38147fea12e1632639d6a3b4874c2d1e66843))
- 完成 build 重构 ([636d5ab](https://github.com/lark-org/lark-cli/commit/636d5ab2cca5a7001c6e4cd92fa6f2476d95f389))
- 更新 CI Config ([8ee28de](https://github.com/lark-org/lark-cli/commit/8ee28dec99c14f806bcb04d5c78cfb956a9f4915))

# [1.4.0](https://github.com/lark-org/lark-cli/compare/v1.3.4...v1.4.0) (2022-06-29)

### Features

- 增加包管理器和修改创建项目命令 ([aae8e77](https://github.com/lark-org/lark-cli/commit/aae8e776179dfe25574fadb91ff0feb25a509ecd))

## [1.3.4](https://github.com/lark-org/lark-cli/compare/v1.3.3...v1.3.4) (2022-01-18)

### Bug Fixes

- 修复发布 npm 时未执行 build 问题 ([49316c8](https://github.com/lark-org/lark-cli/commit/49316c8537146710202e38571f1b6b5d3d81de1b))

## [1.3.3](https://github.com/lark-org/lark-cli/compare/v1.3.2...v1.3.3) (2022-01-18)

### Bug Fixes

- 修改 CI 名称 ([1ccdb93](https://github.com/lark-org/lark-cli/commit/1ccdb937d0e368e9ccfc714e765c72a160297a22))

## [1.3.2](https://github.com/lark-org/lark-cli/compare/v1.3.1...v1.3.2) (2022-01-17)

### Bug Fixes

- 解决创建项目时 模版渲染问题 ([83e88f2](https://github.com/lark-org/lark-cli/commit/83e88f261c1c78d2b3b8d071d82f6ac29acd19d3))

## [1.3.1](https://github.com/lark-org/lark-cli/compare/v1.3.0...v1.3.1) (2021-11-23)

- feat(#27): 更新 commander (#32) (49e2a23)
- Revert "chore(deps): 回退版本，因 esm loader 问题" (7a35205)
- Revert "feat: 切换 commander" (27d335e)
- feat: 切换 commander (30a1742)
- chore(deps): 回退版本，因 esm loader 问题 (c942c64)
- chore: 🤖 升级依赖 (5212760)
- chore(deps-dev): bump lint-staged from 12.0.2 to 12.0.3 (#25) (4b9cbd6)
- chore(deps-dev): bump typescript from 4.4.4 to 4.5.2 (#24) (af225c1)
- chore(deps-dev): bump lint-staged from 11.2.6 to 12.0.2 (#22) (b857c1c)
- chore(deps-dev): bump release-it from 14.11.6 to 14.11.7 (#21) (ce4478b)
- chore(deps-dev): bump eslint-config-lark from 0.1.3 to 0.1.5 (#19) (05a86b6)
- fix: 端口号默认不能更改问题 (4cf4766)
- fix: 生成的项目名字未覆盖问题 (942e4f3)

# [1.2.0](https://github.com/lark-org/lark-cli/compare/v1.1.1...v1.2.0) (2021-11-07)

### Features

- 升级项目设置 ([347b057](https://github.com/lark-org/lark-cli/commit/347b0573a00663dee90f5efe4493c1bc9c587ebc))

## [1.1.1](https://github.com/lark-org/lark-cli/compare/v1.1.0...v1.1.1) (2021-09-02)

### Bug Fixes

- https://github.com/sindresorhus/ora/issues/183 bug ([67918a3](https://github.com/lark-org/lark-cli/commit/67918a39bed4531ea1d994af3dd5eb1486bc3b39))
- npm access ([85acd13](https://github.com/lark-org/lark-cli/commit/85acd13e64ed64b1d0762b5d91eea6dbdff96fe0))

# [1.1.0](https://github.com/virgoone/lark-cli/compare/v1.0.5...v1.1.0) (2021-09-02)

### Bug Fixes

- update npmrc ([33aaf6e](https://github.com/virgoone/lark-cli/commit/33aaf6eb4fe0a5f3fe81cb004c7440a5ba89ac23))

### Features

- 转移项目 ([6988cf1](https://github.com/virgoone/lark-cli/commit/6988cf13b7e02b5604d9afc9da851b002f0fd110))

## [1.0.5](https://github.com/virgoone/lark-cli/compare/v1.0.2...v1.0.5) (2021-09-02)

### Bug Fixes

- 修改 npmrc ([91fe780](https://github.com/virgoone/lark-cli/commit/91fe780cf1419279cf42ddb898e4c163a704bd0b))
- 修改 workflow ([2977de4](https://github.com/virgoone/lark-cli/commit/2977de483e4e9b1ec46852a655e851f15e21b7e2))
- workflow yml ([08389c6](https://github.com/virgoone/lark-cli/commit/08389c68a3c61b005b7a8d311485b49c4d42ecd8))

## [1.0.4](https://github.com/virgoone/lark-cli/compare/v1.0.2...v1.0.4) (2021-09-01)

### Bug Fixes

- 修改 npmrc ([b34c3b5](https://github.com/virgoone/lark-cli/commit/b34c3b5117150d78f4fe3509c85522dc6a7d7793))
- 修改 workflow ([657e480](https://github.com/virgoone/lark-cli/commit/657e480fd67c9260da8b3f93484299380298db2f))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.2](https://github.com/virgoone/lark-cli/compare/v1.0.2-alpha.0...v1.0.2) (2020-04-03)

### Features

- 升级依赖和修复部分问题 ([3c36d45](https://github.com/virgoone/lark-cli/commit/3c36d45f0e97a47bcfe46404e2c4503bee5f5e4f))

### [1.0.2-alpha.0](https://github.com/virgoone/lark-cli/compare/v1.0.1...v1.0.2-alpha.0) (2020-04-03)

### Bug Fixes

- add log ([58a0be4](https://github.com/virgoone/lark-cli/commit/58a0be4d9bb891a659d28e1cf0e7b5172e4c5d47))

### [1.0.1](https://github.com/virgoone/lark-cli/compare/v1.0.0...v1.0.1) (2020-04-03)

### Features

- 修改提示文字和安装依赖 event ([a6abcff](https://github.com/virgoone/lark-cli/commit/a6abcffa5bc2d109d1e24c82086ce7bd63a8a073))

## 1.0.0 (2020-04-02)

### Features

- **init:** initial commit ([16c653f](https://github.com/virgoone/lark-cli/commit/16c653ff046a7df013c1a592a9282e2ceaa0a497))
