import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createStorageProvider } from '#server/utils/storage'
import { integrationEnv } from './helpers/server'

const client = new S3Client({
  endpoint: integrationEnv.NUXT_STORAGE_ENDPOINT,
  region: integrationEnv.NUXT_STORAGE_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: integrationEnv.NUXT_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: integrationEnv.NUXT_STORAGE_SECRET_ACCESS_KEY
  }
})
const provider = createStorageProvider({
  storageEndpoint: integrationEnv.NUXT_STORAGE_ENDPOINT,
  storageRegion: integrationEnv.NUXT_STORAGE_REGION,
  storageBucket: integrationEnv.NUXT_STORAGE_BUCKET,
  storagePublicUrl: integrationEnv.NUXT_STORAGE_PUBLIC_URL,
  storageAccessKeyId: integrationEnv.NUXT_STORAGE_ACCESS_KEY_ID,
  storageSecretAccessKey: integrationEnv.NUXT_STORAGE_SECRET_ACCESS_KEY,
  storageForcePathStyle: true
})
const keys = [
  'integration/direct.txt',
  'integration/presigned.txt'
]

beforeAll(async () => {
  try {
    await client.send(new CreateBucketCommand({
      Bucket: integrationEnv.NUXT_STORAGE_BUCKET
    }))
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    if (!['BucketAlreadyOwnedByYou', 'BucketAlreadyExists'].includes(name)) {
      throw error
    }
  }
})

afterAll(async () => {
  await client.send(new DeleteObjectsCommand({
    Bucket: integrationEnv.NUXT_STORAGE_BUCKET,
    Delete: { Objects: keys.map(Key => ({ Key })) }
  }))
  client.destroy()
})

describe.sequential('S3-compatible storage integration', () => {
  it('stores an object through the provider contract', async () => {
    const result = await provider.put({
      key: keys[0]!,
      body: 'direct upload',
      contentType: 'text/plain'
    })

    expect(result.publicUrl).toBe(`${integrationEnv.NUXT_STORAGE_PUBLIC_URL}/${keys[0]}`)
    await expect(readObject(keys[0]!)).resolves.toBe('direct upload')
  })

  it('produces a working presigned upload URL', async () => {
    const result = await provider.presignUpload({
      key: keys[1]!,
      contentType: 'text/plain',
      expiresIn: 60
    })
    const response = await fetch(result.uploadUrl, {
      method: 'PUT',
      headers: { 'content-type': 'text/plain' },
      body: 'presigned upload'
    })

    expect(response.ok).toBe(true)
    expect(result.publicUrl).toBe(`${integrationEnv.NUXT_STORAGE_PUBLIC_URL}/${keys[1]}`)
    await expect(readObject(keys[1]!)).resolves.toBe('presigned upload')
  })
})

async function readObject(key: string) {
  const response = await client.send(new GetObjectCommand({
    Bucket: integrationEnv.NUXT_STORAGE_BUCKET,
    Key: key
  }))

  return response.Body?.transformToString()
}
