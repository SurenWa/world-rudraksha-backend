import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
    controllers: [CategoriesController],
    providers: [CategoriesService, PrismaService, S3Service],
})
export class CategoriesModule {}
