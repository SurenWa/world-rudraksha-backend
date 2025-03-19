import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({
        origin: 'http://localhost:3001', // Replace with your frontend URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // Ensure credentials are allowed
    });
    //app.use(helmet());
    app.setGlobalPrefix('api/v1', {
        exclude: ['/'], // Exclude the root route
    });
    app.use(cookieParser());
    // Swagger setup
    const config = new DocumentBuilder()
        .setTitle('Divine Rudraksha API documentation')
        .setDescription('Divine Rudraksha API documentation')
        .setVersion('1.0')
        .addTag('Divine Rudraksha')
        .addCookieAuth('access_token') // Enable cookie authentication
        //.addCookieAuth('refresh_token') // Enable cookie authentication
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
