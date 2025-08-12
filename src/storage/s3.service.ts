import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

function shortId8(): string {
  return randomBytes(4).toString('hex');
}

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly region: string;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>('AWS_REGION') ?? '';
    this.bucket = this.config.get<string>('AWS_S3_BUCKET_NAME') ?? '';
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';

    this.s3 = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private ensureBucket() {
    if (!this.bucket) {
      throw new Error('No S3 bucket defined in environment variables');
    }
  }

  async uploadCompressedImage(buffer: Buffer, componentName: string): Promise<string> {
    this.ensureBucket();

    // Dynamic import to support both CJS and ESM builds
    const sharpMod = await import('sharp');
    const sharp = (sharpMod as any).default ?? sharpMod;

    const compressedBuffer = await (sharp as any)(buffer)
      .resize({ width: 1024 })
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    const shortId = shortId8();
    const sanitizedComponentName = componentName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/gi, '');

    const key = `components/msc-${sanitizedComponentName}-${shortId}.webp`;

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: compressedBuffer,
      ContentType: 'image/webp',
    });

    await this.s3.send(uploadCommand);

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async overwriteImage(buffer: Buffer, key: string): Promise<string> {
    this.ensureBucket();

    // Dynamic import to support both CJS and ESM builds
    const sharpMod = await import('sharp');
    const sharp = (sharpMod as any).default ?? sharpMod;

    const compressedBuffer = await (sharp as any)(buffer)
      .resize({ width: 1024 })
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: compressedBuffer,
      ContentType: 'image/webp',
    });

    await this.s3.send(uploadCommand);

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteImageFromS3(key: string): Promise<string> {
    this.ensureBucket();

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(deleteCommand);

    return `Image with key '${key}' has been deleted.`;
  }
}
