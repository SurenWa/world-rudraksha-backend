import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
    CreateCategoryDto,
    CreateCategoryWithFileDto,
} from './dto/create-category.dto';
import {
    UpdateCategoryDto,
    UpdateCategoryWithFileDto,
} from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBody,
    ApiConsumes,
    ApiCookieAuth,
    ApiOkResponse,
    ApiParam,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PaginatedCategoriesDto } from './dto/paginated-categories.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post('create-category')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @UseInterceptors(FileInterceptor('image')) // Handles file upload
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: CreateCategoryWithFileDto,
        description: 'Upload category with image and other details',
    })
    async createCategory(
        @UploadedFile() imageFile?: Express.Multer.File,
        @Body('data') data?: string, // Receive `data` as string
    ) {
        if (!data) {
            throw new BadRequestException('Category data is required');
        }

        // Parse JSON string back into CreateCategoryDto
        const createCategoryDto: CreateCategoryDto = JSON.parse(data);

        return this.categoriesService.createCategory(
            createCategoryDto,
            imageFile,
        );
    }

    @Get('get-all-categories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiOkResponse({ type: PaginatedCategoriesDto })
    async getPaginatedCategories(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search = '',
    ) {
        return this.categoriesService.getPaginatedCategories({
            page,
            limit,
            search,
        });
    }

    @Patch('update-category/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: UpdateCategoryWithFileDto,
        description:
            'Update category details and optionally upload a new image',
    })
    @ApiParam({
        name: 'id',
        description: 'Category ID to update',
        type: String,
    })
    async updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() imageFile?: Express.Multer.File,
        @Body('data') data?: string, // Receive `data` as string
    ) {
        if (!data) {
            throw new BadRequestException('Category update data is required');
        }

        // Parse JSON string into UpdateCategoryDto
        const updateCategoryDto: UpdateCategoryDto = JSON.parse(data);

        return this.categoriesService.updateCategory(
            id,
            updateCategoryDto,
            imageFile,
        );
    }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get('get-one-category/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOneCategory(id);
    }

    @Delete('delete-image/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiParam({ name: 'id', description: 'Category ID', type: Number })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                imageUrl: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Image deleted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async deleteCategoryImage(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { imageUrl: string },
    ) {
        return this.categoriesService.deleteCategoryImage(id, body.imageUrl);
    }

    @Delete('delete-category/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiParam({
        name: 'id',
        description: 'Category ID to delete',
        type: String,
    })
    async deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.deleteCategory(id);
    }
}
