import {
    Controller,
    //Get,
    Post,
    Body,
    //Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    InternalServerErrorException,
    UseGuards,
} from '@nestjs/common';
import { S3Service } from './s3.service';
//import { CreateS3Dto } from './dto/create-s3.dto';
//import { UpdateS3Dto } from './dto/update-s3.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

//Define the DTO class
class UploadFileDto {
    folder: string;
}

@Controller('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('upload')
    @ApiOperation({ summary: 'Upload a file to S3 with dynamic folder' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                folder: {
                    type: 'string',
                    example: 'categories',
                    description: 'Folder name where the file will be stored',
                },
                makePublic: {
                    type: 'boolean',
                    description: 'Whether to make the file public',
                },
            },
            required: ['file', 'folder'],
        },
    })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UploadFileDto,
    ) {
        return this.s3Service.uploadFile(file, body.folder);
    }

    // @Get()
    // findAll() {
    //     return this.s3Service.findAll();
    // }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.s3Service.findOne(+id);
    // }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateS3Dto: UpdateS3Dto) {
    //     return this.s3Service.update(+id, updateS3Dto);
    // }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //     return this.s3Service.remove(+id);
    // }

    @Delete('image/:imageUrl')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN') // Adjust roles as needed
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an image from S3 storage' })
    @ApiResponse({
        status: 200,
        description: 'Image deleted successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid image URL',
    })
    @ApiResponse({
        status: 500,
        description: 'Failed to delete image',
    })
    async deleteImage(@Param('imageUrl') imageUrl: string) {
        try {
            // Decode the URL parameter (since it might contain encoded characters)
            const decodedImageUrl = decodeURIComponent(imageUrl);

            await this.s3Service.deleteImage(decodedImageUrl);

            return {
                success: true,
                message: 'Image deleted successfully',
            };
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
}
