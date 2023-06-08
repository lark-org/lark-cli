/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-catch */
import {
  S3Client,
  PutObjectCommandInput,
  HeadBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ObjectIdentifier
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { getS3Config } from '../variables/s3'

export interface BucketS3Serialization {
  path: string

  pathWithFilename: string

  filename: string

  completedUrl: string

  baseUrl: string

  mime: string

  bucket?: string
}

export interface IBucketS3PutItemOptions {
  path: string
  ContentType?: string
  acl?: ObjectCannedACL
}

class Upload {
  private readonly s3Client: S3Client

  private readonly bucket: string

  private readonly cdnUrl: string

  constructor() {
    const s3Config = getS3Config()

    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: s3Config['s3-key'],
        secretAccessKey: s3Config['s3-secret']
      },
      region: s3Config['s3-region'],
      endpoint: s3Config['s3-endpoint']
    })
    this.cdnUrl = s3Config['s3-cdn']
    this.bucket = s3Config['s3-bucket']
  }

  async checkConnection(): Promise<Record<string, any>> {
    const command: HeadBucketCommand = new HeadBucketCommand({
      Bucket: this.bucket
    })

    try {
      const check: Record<string, any> = await this.s3Client.send(command)

      return check
    } catch (err: any) {
      throw err
    }
  }

  async listBucket(): Promise<string[]> {
    const command: ListBucketsCommand = new ListBucketsCommand({})
    const listBucket: Record<string, any> = await this.s3Client.send(command)
    return listBucket.Buckets.map((val: Record<string, any>) => val.Name)
  }

  async listItemInBucket(
    prefix?: string,
    bucket = this.bucket
  ): Promise<BucketS3Serialization[]> {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix
    })
    const listItems: Record<string, any> = await this.s3Client.send(command)

    return listItems.Contents.map((val: Record<string, any>) => {
      const lastIndex: number = val.Key.lastIndexOf('/')
      const path: string = val.Key.substring(0, lastIndex)
      const filename: string = val.Key.substring(lastIndex, val.Key.length)
      const mime: string = filename
        .substring(filename.lastIndexOf('.') + 1, filename.length)
        .toLocaleUpperCase()

      return {
        path,
        pathWithFilename: val.Key,
        filename,
        completedUrl: `${this.cdnUrl}/${val.Key}`,
        baseUrl: this.cdnUrl,
        mime,
        bucket
      }
    })
  }

  async getItemInBucket(
    filename: string,
    path?: string,
    bucket = this.bucket
  ): Promise<Record<string, any>> {
    if (path) path = path.startsWith('/') ? path.replace('/', '') : `${path}`

    const key: string = path ? `${path}/${filename}` : filename
    const command: GetObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })

    const item: Record<string, any> = await this.s3Client.send(command)

    return item.Body
  }

  async putItemInBucket(
    filename: string,
    content: string | Uint8Array | Buffer | Readable | ReadableStream | Blob,
    options?: IBucketS3PutItemOptions,
    bucket = this.bucket
  ): Promise<BucketS3Serialization> {
    let path: string = options && options.path ? options.path : undefined
    const acl: string = options && options.acl ? options.acl : 'public-read'

    if (path) path = path.startsWith('/') ? path.replace('/', '') : `${path}`

    const mime: string = filename
      .substring(filename.lastIndexOf('.') + 1, filename.length)
      .toLowerCase()
    const key: string = path ? `${path}/${filename}` : filename
    const putObjectOption: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: content,
      ACL: acl
    }
    if (options.ContentType) {
      putObjectOption.ContentType = options.ContentType
    }
    const command: PutObjectCommand = new PutObjectCommand(putObjectOption)

    await this.s3Client.send(command)

    return {
      path,
      pathWithFilename: key,
      filename,
      completedUrl: `${this.cdnUrl}/${key}`,
      baseUrl: this.cdnUrl,
      mime,
      bucket
    }
  }

  async deleteItemInBucket(
    filename: string,
    bucket = this.bucket
  ): Promise<void> {
    const command: DeleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filename
    })

    try {
      await this.s3Client.send(command)
    } catch (e) {
      throw e
    }
  }

  async deleteItemsInBucket(
    filenames: string[],
    bucket = this.bucket
  ): Promise<void> {
    const keys: ObjectIdentifier[] = filenames.map((val) => ({
      Key: val
    }))
    const command: DeleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: keys
      }
    })

    try {
      await this.s3Client.send(command)
    } catch (e) {
      throw e
    }
  }

  async deleteFolder(dir: string, bucket = this.bucket): Promise<void> {
    const commandList: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: dir
    })
    const lists = await this.s3Client.send(commandList)

    try {
      const listItems = lists.Contents.map((val) => ({
        Key: val.Key
      }))
      const commandDeleteItems: DeleteObjectsCommand = new DeleteObjectsCommand(
        {
          Bucket: bucket,
          Delete: {
            Objects: listItems
          }
        }
      )

      await this.s3Client.send(commandDeleteItems)

      const commandDelete: DeleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: dir
      })
      await this.s3Client.send(commandDelete)
    } catch (e) {
      throw e
    }
  }
}

export { Upload }
