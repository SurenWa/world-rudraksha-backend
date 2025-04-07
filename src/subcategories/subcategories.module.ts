import { Module } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
    controllers: [SubcategoriesController],
    providers: [SubcategoriesService, PrismaService, S3Service],
})
export class SubcategoriesModule {}
