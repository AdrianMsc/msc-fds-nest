import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private readonly config;
    private readonly s3;
    private readonly region;
    private readonly bucket;
    constructor(config: ConfigService);
    private ensureBucket;
    uploadCompressedImage(buffer: Buffer, componentName: string): Promise<string>;
    overwriteImage(buffer: Buffer, key: string): Promise<string>;
    deleteImageFromS3(key: string): Promise<string>;
}
