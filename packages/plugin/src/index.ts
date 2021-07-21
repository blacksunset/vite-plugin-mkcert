import { createLogger, Plugin } from 'vite'

import { PLUGIN_NAME } from './lib/constant'
import { getLocalV4Ips } from './lib/util'
import Mkcert, { MkcertOptions } from './mkcert'

export type ViteCertificateOptions = MkcertOptions

const plugin = (options?: ViteCertificateOptions): Plugin => {
  return {
    name: PLUGIN_NAME,
    apply: 'serve',
    config: async config => {
      if (!config.server?.https) {
        return
      }

      const { logLevel } = config
      const logger = createLogger(logLevel, {
        prefix: PLUGIN_NAME
      })
      const ips = getLocalV4Ips()
      const mkcert = Mkcert.create({
        logger,
        ...options
      })

      await mkcert.init()

      const hostnames = Array.from(new Set(['localhost', ...ips, ...(options?.hostnames || [])]))
      const certificate = await mkcert.install(hostnames)

      return {
        server: {
          https: {
            ...certificate
          }
        }
      }
    }
  }
}

export default plugin
