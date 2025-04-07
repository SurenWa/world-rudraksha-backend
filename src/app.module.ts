import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { S3Service } from './s3/s3.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './s3/s3.module';
import { CategoriesModule } from './categories/categories.module';
import { CategoriesService } from './categories/categories.service';
import { SubcategoriesModule } from './subcategories/subcategories.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        S3Module,
        CategoriesModule,
        SubcategoriesModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService, S3Service, CategoriesService],
})
export class AppModule {}
