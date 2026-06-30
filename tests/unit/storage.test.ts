import { describe, expect, it } from 'vitest'
import { buildStorageConfig } from '#server/utils/storage/config'
import { createStorageKey } from '#server/utils/storage/key'

describe('storage configuration', () => {
  it('prefers generic storage settings over legacy R2 settings', () => {
    const config = buildStorageConfig({
      storageEndpoint: 'http://minio:9000',
      storageBucket: 'media',
      storagePublicUrl: 'http://minio:9000/media',
      storageAccessKeyId: 'minio',
      storageSecretAccessKey: 'secret',
      storageRegion: 'us-east-1',
      storageForcePathStyle: true,
      r2AccountId: 'legacy',
      r2BucketName: 'legacy'
    })

    expect(config.endpoint).toBe('http://minio:9000')
    expect(config.bucket).toBe('media')
    expect(config.forcePathStyle).toBe(true)
  })

  it('maps legacy R2 settings when generic settings are absent', () => {
    const config = buildStorageConfig({
      r2AccountId: 'account',
      r2BucketName: 'bucket',
      r2PublicUrl: 'https://media.example.com',
      r2AccessKeyId: 'key',
      r2SecretAccessKey: 'secret'
    })

    expect(config.endpoint).toBe('https://account.r2.cloudflarestorage.com')
    expect(config.region).toBe('auto')
    expect(config.bucket).toBe('bucket')
  })

  it('rejects incomplete storage configuration', () => {
    expect(() => buildStorageConfig({ storageBucket: 'media' }))
      .toThrow('Storage sozlamalari to\'liq emas')
  })
})

describe('storage keys', () => {
  it('normalizes filenames and selects the media folder', () => {
    expect(createStorageKey('image/png', 'my photo.png', 123))
      .toBe('images/123-my_photo.png')
    expect(createStorageKey('video/mp4', 'lesson 1.mp4', 123))
      .toBe('lessons/123-lesson_1.mp4')
    expect(createStorageKey('application/zip', 'airc helper.zip', 123))
      .toBe('downloads/123-airc_helper.zip')
  })
})
