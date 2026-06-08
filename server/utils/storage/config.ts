import type { StorageConfig, StorageRuntimeConfig } from './types'

const requiredConfigKeys = [
  'endpoint',
  'bucket',
  'publicUrl',
  'accessKeyId',
  'secretAccessKey'
] as const

export function buildStorageConfig(runtimeConfig: StorageRuntimeConfig): StorageConfig {
  const endpoint = runtimeConfig.storageEndpoint
    || (runtimeConfig.r2AccountId
      ? `https://${runtimeConfig.r2AccountId}.r2.cloudflarestorage.com`
      : '')

  const config: StorageConfig = {
    provider: 's3',
    endpoint,
    region: runtimeConfig.storageRegion || 'auto',
    bucket: runtimeConfig.storageBucket || runtimeConfig.r2BucketName || '',
    publicUrl: runtimeConfig.storagePublicUrl || runtimeConfig.r2PublicUrl || '',
    accessKeyId: runtimeConfig.storageAccessKeyId || runtimeConfig.r2AccessKeyId || '',
    secretAccessKey: runtimeConfig.storageSecretAccessKey || runtimeConfig.r2SecretAccessKey || '',
    forcePathStyle: toBoolean(runtimeConfig.storageForcePathStyle)
  }

  const missing = requiredConfigKeys.filter(key => !config[key])
  if (missing.length > 0) {
    throw new Error(`Storage sozlamalari to'liq emas: ${missing.join(', ')}`)
  }

  return config
}

function toBoolean(value: boolean | string | undefined) {
  return value === true || value === 'true'
}
