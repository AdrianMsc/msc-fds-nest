"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
function shortId8() {
    return (0, crypto_1.randomBytes)(4).toString('hex');
}
let S3Service = class S3Service {
    config;
    s3;
    region;
    bucket;
    constructor(config) {
        this.config = config;
        this.region = this.config.get('AWS_REGION') ?? '';
        this.bucket = this.config.get('AWS_S3_BUCKET_NAME') ?? '';
        const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID') ?? '';
        const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY') ?? '';
        this.s3 = new client_s3_1.S3Client({
            region: this.region,
            credentials: { accessKeyId, secretAccessKey },
        });
    }
    ensureBucket() {
        if (!this.bucket) {
            throw new Error('No S3 bucket defined in environment variables');
        }
    }
    async uploadCompressedImage(buffer, componentName) {
        this.ensureBucket();
        const sharpMod = await Promise.resolve().then(() => require('sharp'));
        const sharp = sharpMod.default ?? sharpMod;
        const compressedBuffer = await sharp(buffer)
            .resize({ width: 1024 })
            .toFormat('webp', { quality: 80 })
            .toBuffer();
        const shortId = shortId8();
        const sanitizedComponentName = componentName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9_-]/gi, '');
        const key = `components/msc-${sanitizedComponentName}-${shortId}.webp`;
        const uploadCommand = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: compressedBuffer,
            ContentType: 'image/webp',
        });
        await this.s3.send(uploadCommand);
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    async overwriteImage(buffer, key) {
        this.ensureBucket();
        const sharpMod = await Promise.resolve().then(() => require('sharp'));
        const sharp = sharpMod.default ?? sharpMod;
        const compressedBuffer = await sharp(buffer)
            .resize({ width: 1024 })
            .toFormat('webp', { quality: 80 })
            .toBuffer();
        const uploadCommand = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: compressedBuffer,
            ContentType: 'image/webp',
        });
        await this.s3.send(uploadCommand);
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    async deleteImageFromS3(key) {
        this.ensureBucket();
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.s3.send(deleteCommand);
        return `Image with key '${key}' has been deleted.`;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map