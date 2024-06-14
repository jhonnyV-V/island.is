import { json, service, ServiceBuilder } from '../../../../../infra/src/dsl/dsl'
import {
  Base,
  Client,
  NationalRegistryAuthB2C,
  RskProcuring,
} from '../../../../../infra/src/dsl/xroad'
// eslint-disable-next-line
import { UserProfileScope } from '../../../../../libs/auth/scopes/src/lib/userProfile.scope'

const namespace = 'identity-server'
const imageName = 'services-auth-ids-api'

const REDIS_NODE_CONFIG = {
  dev: json([
    'clustercfg.general-redis-cluster-group.5fzau3.euw1.cache.amazonaws.com:6379',
  ]),
  staging: json([
    'clustercfg.general-redis-cluster-group.ab9ckb.euw1.cache.amazonaws.com:6379',
  ]),
  prod: json([
    'clustercfg.general-redis-cluster-group.dnugi2.euw1.cache.amazonaws.com:6379',
  ]),
}

export const serviceSetup = (): ServiceBuilder<'services-auth-ids-api'> => {
  return service('services-auth-ids-api')
    .namespace(namespace)
    .image(imageName)
    .env({
      IDENTITY_SERVER_CLIENT_ID: '@island.is/clients/auth-api',
      IDENTITY_SERVER_ISSUER_URL: {
        dev: 'https://identity-server.dev01.devland.is',
        staging: 'https://identity-server.staging01.devland.is',
        prod: 'https://innskra.island.is',
      },
      PUBLIC_URL: {
        dev: 'https://identity-server.dev01.devland.is/api',
        staging: 'https://identity-server.staging01.devland.is/api',
        prod: 'https://innskra.island.is/api',
      },
      USER_PROFILE_CLIENT_URL: {
        dev: 'http://web-service-portal-api.service-portal.svc.cluster.local',
        staging:
          'http://web-service-portal-api.service-portal.svc.cluster.local',
        prod: 'https://service-portal-api.internal.island.is',
      },
      USER_PROFILE_CLIENT_SCOPE: json([UserProfileScope.read]),
      XROAD_NATIONAL_REGISTRY_SERVICE_PATH: {
        dev: 'IS-DEV/GOV/10001/SKRA-Protected/Einstaklingar-v1',
        staging: 'IS-TEST/GOV/6503760649/SKRA-Protected/Einstaklingar-v1',
        prod: 'IS/GOV/6503760649/SKRA-Protected/Einstaklingar-v1',
      },
      XROAD_NATIONAL_REGISTRY_REDIS_NODES: REDIS_NODE_CONFIG,
      COMPANY_REGISTRY_REDIS_NODES: REDIS_NODE_CONFIG,
      XROAD_RSK_PROCURING_REDIS_NODES: REDIS_NODE_CONFIG,
      COMPANY_REGISTRY_XROAD_PROVIDER_ID: {
        dev: 'IS-DEV/GOV/10006/Skatturinn/ft-v1',
        staging: 'IS-TEST/GOV/5402696029/Skatturinn/ft-v1',
        prod: 'IS/GOV/5402696029/Skatturinn/ft-v1',
      },
      XROAD_TJODSKRA_API_PATH: '/SKRA-Protected/Einstaklingar-v1',
      XROAD_TJODSKRA_MEMBER_CODE: {
        prod: '6503760649',
        dev: '10001',
        staging: '6503760649',
      },
      NOVA_ACCEPT_UNAUTHORIZED: {
        dev: 'true',
        staging: 'false',
        prod: 'false',
      },
      PASSKEY_CORE_RP_ID: 'island.is',
      PASSKEY_CORE_RP_NAME: 'Island.is',
      PASSKEY_CORE_CHALLENGE_TTL_MS: '120000',
      REDIS_NODES: REDIS_NODE_CONFIG,
    })
    .secrets({
      IDENTITY_SERVER_CLIENT_SECRET:
        '/k8s/services-auth/IDENTITY_SERVER_CLIENT_SECRET',
      NOVA_URL: '/k8s/services-auth/NOVA_URL',
      NOVA_USERNAME: '/k8s/services-auth/NOVA_USERNAME',
      NOVA_PASSWORD: '/k8s/services-auth/NOVA_PASSWORD',
      PASSKEY_CORE_ALLOWED_ORIGINS:
        '/k8s/services-auth/PASSKEY_CORE_ALLOWED_ORIGINS',
      PASSKEY_CORE_MAX_AGE_DAYS: '/k8s/services-auth/PASSKEY_CORE_MAX_AGE_DAYS',
      NATIONAL_REGISTRY_B2C_CLIENT_SECRET:
        '/k8s/services-auth/NATIONAL_REGISTRY_B2C_CLIENT_SECRET',
    })
    .xroad(Base, Client, RskProcuring, NationalRegistryAuthB2C)
    .readiness('/health/check')
    .liveness('/liveness')
    .db({ name: 'servicesauth', extensions: ['uuid-ossp'] })
    .migrations()
    .seed()
    .resources({
      limits: {
        cpu: '800m',
        memory: '768Mi',
      },
      requests: {
        cpu: '400m',
        memory: '512Mi',
      },
    })
    .replicaCount({
      default: 2,
      min: 2,
      max: 15,
    })
}

const cleanupId = 'services-auth-ids-api-cleanup'
// run daily at 3am
const schedule = { schedule: '0 3 * * *' }

export const cleanupSetup = (): ServiceBuilder<typeof cleanupId> =>
  service(cleanupId)
    .namespace(namespace)
    .image(imageName)
    .command('node')
    .args('main.js', '--job=cleanup')
    .resources({
      limits: {
        cpu: '400m',
        memory: '512Mi',
      },
      requests: {
        cpu: '100m',
        memory: '256Mi',
      },
    })
    .db({ name: 'servicesauth', extensions: ['uuid-ossp'] })
    .env({
      IDENTITY_SERVER_ISSUER_URL: {
        dev: 'https://identity-server.dev01.devland.is',
        staging: 'https://identity-server.staging01.devland.is',
        prod: 'https://innskra.island.is',
      },
    })
    .extraAttributes({
      dev: schedule,
      staging: schedule,
      prod: schedule,
    })
