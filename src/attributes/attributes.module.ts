import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
    controllers: [AttributesController],
    providers: [AttributesService, PrismaService, S3Service],
})
export class AttributesModule {}
