import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateS3Dto } from './dto/create-s3.dto';
import { UpdateS3Dto } from './dto/update-s3.dto';
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    // private readonly bucketName =
    //     this.configService.get<string>('AWS_S3_BUCKET_NAME');
    // private readonly awsRegion = this.configService.get<string>('AWS_REGION');
    private readonly bucketName: string;
    private readonly awsRegion: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
        this.awsRegion = this.configService.get<string>('AWS_REGION');
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
                secretAccessKey: this.configService.get<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ),
            },
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<{ key: string; url: string }> {
        const fileKey = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

        const params: PutObjectCommandInput = {
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // // If folder is 'categories', make the object public
        // if (makePublic || folder === 'categories') {
        //     params.ACL = 'public-read';
        // }

        try {
            const command = new PutObjectCommand(params);
            await this.s3Client.send(command);

            // For public objects, construct the public URL directly
            const url =
                folder === 'categories'
                    ? `https://${this.bucketName}.s3.${this.awsRegion}.amazonaws.com/${fileKey}`
                    : await this.getSignedUrl(fileKey);

            return {
                key: fileKey,
                url,
            };
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    async deleteImage(imageUrl: string) {
        try {
            // Extract file key from URL
            const fileKey = imageUrl.split('.amazonaws.com/')[1];

            if (!fileKey) {
                throw new InternalServerErrorException('Invalid image URL.');
            }

            await this.deleteFile(fileKey);
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to delete image: ${error.message}`,
            );
        }
    }

    async deleteFile(fileKey: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            await this.s3Client.send(command);
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to delete file from S3: ${error.message}`,
            );
        }
    }

    private async getSignedUrl(key: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }

    create(createS3Dto: CreateS3Dto) {
        return 'This action adds a new s3';
    }

    findAll() {
        return `This action returns all s3`;
    }

    findOne(id: number) {
        return `This action returns a #${id} s3`;
    }

    update(id: number, updateS3Dto: UpdateS3Dto) {
        return `This action updates a #${id} s3`;
    }

    remove(id: number) {
        return `This action removes a #${id} s3`;
    }
}
