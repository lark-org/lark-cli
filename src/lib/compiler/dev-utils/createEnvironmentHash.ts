import { createHash } from 'crypto'

export default (env: Record<string, any>) => {
  const hash = createHash('md5')
  hash.update(JSON.stringify(env))

  return hash.digest('hex')
}
