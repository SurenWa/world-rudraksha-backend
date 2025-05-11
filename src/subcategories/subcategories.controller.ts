import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import {
    CreateSubcategoryDto,
    CreateSubcategoryWithFileDto,
} from './dto/create-subcategory.dto';
import {
    UpdateSubcategoryDto,
    UpdateSubcategoryWithFileDto,
} from './dto/update-subcategory.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
    ApiBody,
    ApiConsumes,
    ApiCookieAuth,
    ApiOkResponse,
    ApiParam,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    PaginatedSubcategoriesDto,
    SubcategoryDto,
} from './dto/paginated-subcategories.dto';

@Controller('subcategories')
export class SubcategoriesController {
    constructor(private readonly subcategoriesService: SubcategoriesService) {}

    @Post('create-sub-category')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @UseInterceptors(FileInterceptor('image')) // Handles file upload
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: CreateSubcategoryWithFileDto,
        description: 'Upload sub category with image and other details',
    })
    async createSubcategory(
        @UploadedFile() imageFile?: Express.Multer.File,
        @Body('data') data?: string, // Receive `data` as string
    ) {
        if (!data) {
            throw new BadRequestException('Category data is required');
        }

        // Parse JSON string back into CreateCategoryDto
        const createSubcategoryDto: CreateSubcategoryDto = JSON.parse(data);

        return this.subcategoriesService.createSubcategory(
            createSubcategoryDto,
            imageFile,
        );
    }

    @Get('get-total-subcategories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiOkResponse({ type: SubcategoryDto }) // Replace CategoryDto with your actual DTO
    async getTotalCategories() {
        return this.subcategoriesService.getTotalSubCategories();
    }

    @Get('get-all-subcategories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiOkResponse({ type: PaginatedSubcategoriesDto })
    async getPaginatedSubcategories(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('categoryId') categoryId?: number,
        @Query('search') search = '',
    ) {
        return this.subcategoriesService.getPaginatedSubcategories({
            page,
            limit,
            categoryId,
            search,
        });
    }

    @Patch('update-sub-category/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: UpdateSubcategoryWithFileDto,
        description:
            'Update sub category details and optionally upload a new image',
    })
    @ApiParam({
        name: 'id',
        description: 'Sub Category ID to update',
        type: String,
    })
    async updateSubcategory(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() imageFile?: Express.Multer.File,
        @Body('data') data?: string, // Receive `data` as string
    ) {
        if (!data) {
            throw new BadRequestException(
                'Sub Category update data is required',
            );
        }

        // Parse JSON string into UpdateCategoryDto
        const updateSubcategoryDto: UpdateSubcategoryDto = JSON.parse(data);

        return this.subcategoriesService.updateSubcategory(
            id,
            updateSubcategoryDto,
            imageFile,
        );
    }

    @Get('get-one-sub-category/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subcategoriesService.findOneSubCategory(id);
    }

    @Delete('delete-sub-category/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiParam({
        name: 'id',
        description: 'Sub Category ID to delete',
        type: String,
    })
    async deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.subcategoriesService.deleteSubcategory(id);
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
        return this.subcategoriesService.deleteSubCategoryImage(
            id,
            body.imageUrl,
        );
    }
}
