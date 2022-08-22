import { getCustomConfig } from './custom-config'

const customConfig = getCustomConfig()
const { build } = customConfig
const variables = {
  mfsu: false,
  transpiler: 'babel',
  transpilerOptions: {},
  ...build
}

export default variables
