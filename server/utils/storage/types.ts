export interface StorageRuntimeConfig {
  storageProvider?: string
  storageEndpoint?: string
  storageRegion?: string
  storageBucket?: string
  storagePublicUrl?: string
  storageAccessKeyId?: string
  storageSecretAccessKey?: string
  storageForcePathStyle?: boolean | string
  r2AccountId?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  r2BucketName?: string
  r2PublicUrl?: string
}

export interface StorageConfig {
  provider: 's3'
  endpoint: string
  region: string
  bucket: string
  publicUrl: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle: boolean
}

export interface PutObjectInput {
  key: string
  body: string | Uint8Array
  contentType: string
}

export interface PresignUploadInput {
  key: string
  contentType: string
  expiresIn?: number
}

export interface StorageProvider {
  put(input: PutObjectInput): Promise<{ publicUrl: string }>
  presignUpload(input: PresignUploadInput): Promise<{
    uploadUrl: string
    publicUrl: string
  }>
}
