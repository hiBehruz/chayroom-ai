import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type {
  PresignUploadInput,
  PutObjectInput,
  StorageConfig,
  StorageProvider
} from './types'

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client

  constructor(private readonly config: StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
  }

  async put(input: PutObjectInput) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType
    }))

    return { publicUrl: this.publicUrl(input.key) }
  }

  async presignUpload(input: PresignUploadInput) {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.key,
      ContentType: input.contentType
    })
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresIn ?? 900
    })

    return {
      uploadUrl,
      publicUrl: this.publicUrl(input.key)
    }
  }

  private publicUrl(key: string) {
    return `${this.config.publicUrl.replace(/\/$/, '')}/${key}`
  }
}
