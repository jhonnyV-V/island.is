// @ts-check
import { resolve } from 'path'
import { MOBILE_APP_DIR, ROOT } from './_common.mjs'
import {
  getPlatformString,
  getYarnLockHash,
  getPackageHash,
  getNodeVersionString,
  getGeneratedFileHash,
  folderSizeIsEqualOrGreaterThan,
  runCommand,
  fileSizeIsEqualOrGreaterThan,
} from './_utils.mjs'
import { ENV_KEYS, ENV_INIT_CACHE, ENV_ENABLED_CACHE } from './_const.mjs'

// When testing this is good to manipulate
const HASH_VERSION = 1

export const ENABLED_MODULES = (process[ENV_ENABLED_CACHE] ?? "").split(",").map((x) => x.trim()).filter((x) => x.length > 0).reduce((a, b) => {
  a[b] = true
  return a;
}, {})
export const keys = process.env[ENV_KEYS]
  ? JSON.parse(process.env[ENV_KEYS])
  : {}
export const cypressPath = process.env.CYPRESS_CACHE_PATH
export const cacheSuccess = JSON.parse(process.env.CACHE_SUCCESS ?? '{}')
export const initCache = process.env[ENV_INIT_CACHE] === 'true'

console.log({ keys })

if (ENABLED_MODULES["cypress"] && !cypressPath) {
  throw new Error('Cypress path is not set')
}

console.log(ENABLED_MODULES);

export const caches = [
  {
    enabled: ENABLED_MODULES["cypresss"],
    hash: async () =>
      keys['node-modules'] ??
      `node-modules-${HASH_VERSION}-${getPlatformString()}-${await getYarnLockHash()}-${await getPackageHash()}-${await getNodeVersionString()}`,
    name: 'Cache node_modules',
    id: 'node-modules',
    path: 'node_modules',
    check: async (success, path) => {
      if (!success) {
        return false
      }
      return folderSizeIsEqualOrGreaterThan(path, 1000)
    },
    init: async () => {
      const path = resolve(ROOT, './scripts/ci/10_prepare-host-deps.sh')
      await runCommand(path, ROOT)
    },
  },
  {
    enabled: ENABLED_MODULES["mobile-node-modules"],
    hash: async () =>
      keys['mobile-node-modules'] ??
      `app-node-modules-${HASH_VERSION}-${getPlatformString()}-${await getYarnLockHash()}-${await getPackageHash(
        MOBILE_APP_DIR,
      )}-${await getNodeVersionString()}`,
    name: 'Cache Mobile node_modules',
    id: 'mobile-node-modules',
    path: 'apps/native/app/node_modules',
  },
  {
    enabled: ENABLED_MODULES["generated-files"],
    hash: async () =>
      keys['generated-files'] ??
      `generated-files-${HASH_VERSION}-${getPlatformString()}-${await getGeneratedFileHash()}`,
    name: 'Cache Generated Files',
    id: 'generated-files',
    path: 'generated_files.tar.gz',
    check: async (success, path) => {
      if (!success) {
        return false
      }
      return fileSizeIsEqualOrGreaterThan(path, 1000)
    },
    init: async (path) => {
      const cmd = `tar zcvf ${path} $(./scripts/ci/get-files-touched-by.sh yarn codegen --skip-cache | xargs realpath --relative-to ${ROOT})`
      await runCommand(cmd, ROOT)
    },
  },
  {
    enabled: ENABLED_MODULES["cypress"],
    hash: async () =>
      keys['cypress'] ??
      `cypress-cache-${HASH_VERSION}-${getPlatformString()}-${await getYarnLockHash()}-${await getPackageHash()}-${await getNodeVersionString()}`,
    name: 'Cache Cypress',
    id: 'cypress',
    path: cypressPath || '',
  },
].filter((step) => step.enabled)
