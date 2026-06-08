import { buildStorageConfig } from './config'
import { S3StorageProvider } from './s3'
import type { StorageProvider, StorageRuntimeConfig } from './types'

export function createStorageProvider(runtimeConfig: StorageRuntimeConfig): StorageProvider {
  const config = buildStorageConfig(runtimeConfig)

  return new S3StorageProvider(config)
}

export function getStorageProvider(): StorageProvider {
  return createStorageProvider(useRuntimeConfig())
}
