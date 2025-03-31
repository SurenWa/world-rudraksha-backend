import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Service: S3Service,
    ) {}
    async createCategory(
        createCategoryDto: CreateCategoryDto,
        imageFile?: Express.Multer.File,
    ) {
        //Check if category with the same name or slug already exists
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { name: createCategoryDto.name },
                    { slug: createCategoryDto.slug },
                ],
            },
        });

        if (existingCategory) {
            throw new BadRequestException(
                'Category with the same name or slug already exists.',
            );
        }
        // 1. Upload image to S3 if provided
        let imageUrl = '';

        if (imageFile) {
            const uploadResult = await this.s3Service.uploadFile(
                imageFile,
                'categories', // Folder in S3
                //true, // Make public (since categories need public access)
            );
            imageUrl = uploadResult.url;
        }

        // 2. Auto-generate slug if not provided
        const slug =
            createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

        // 3. Create category in database
        await this.prisma.category.create({
            data: {
                ...createCategoryDto,
                slug,
                image: imageUrl,
                keywords: createCategoryDto.keywords || [],
                tags: createCategoryDto.tags || [],
            },
        });

        return {
            message: 'Category created successfully',
        };
    }

    async getPaginatedCategories(params: {
        page: number;
        limit: number;
        search?: string;
    }) {
        const { page, limit, search } = params;
        const page1 = Number(params.page) || 1;
        const limit1 = Number(params.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.CategoryWhereInput = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      {
                          description: {
                              contains: search,
                              mode: 'insensitive',
                          },
                      },
                  ],
              }
            : {};

        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                skip,
                take: limit1,
                where,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    image: true,
                    name: true,
                    slug: true,
                    description: true,
                    addedBy: true,
                    // Include products count if needed
                    // products: true,
                },
            }),
            this.prisma.category.count({ where }),
        ]);

        return {
            data: categories,
            meta: {
                total,
                page: page1,
                limit: limit1,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async updateCategory(
        id: number,
        updateCategoryDto: UpdateCategoryDto,
        imageFile?: Express.Multer.File,
    ) {
        // 1. Check if category exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new BadRequestException('Category not found');
        }

        // 2. Check for duplicate name or slug (if updated)
        if (updateCategoryDto.name || updateCategoryDto.slug) {
            const duplicateCategory = await this.prisma.category.findFirst({
                where: {
                    OR: [
                        { name: updateCategoryDto.name || '' },
                        {
                            slug:
                                updateCategoryDto.slug ||
                                this.generateSlug(updateCategoryDto.name),
                        },
                    ],
                    NOT: { id }, // Exclude the current category
                },
            });

            if (duplicateCategory) {
                throw new BadRequestException(
                    'Category or slug already exists',
                );
            }
        }

        // 3. Handle image update
        let imageUrl = existingCategory.image;

        if (imageFile) {
            // Delete old image if it exists
            if (existingCategory.image) {
                await this.deleteFile(existingCategory.image);
            }

            // Upload new image
            const uploadResult = await this.s3Service.uploadFile(
                imageFile,
                'categories',
            );
            imageUrl = uploadResult.url;
        }

        // 4. Update category in database
        await this.prisma.category.update({
            where: { id },
            data: {
                ...updateCategoryDto,
                slug:
                    updateCategoryDto.slug ||
                    this.generateSlug(updateCategoryDto.name),
                image: imageUrl,
                keywords: updateCategoryDto.keywords || [],
                tags: updateCategoryDto.tags || [],
            },
        });

        return { message: 'Category updated successfully' };
    }

    async deleteFile(imageUrl: string) {
        try {
            // Extract file key from URL
            const fileKey = imageUrl.split('.amazonaws.com/')[1];

            if (!fileKey) {
                throw new InternalServerErrorException('Invalid image URL.');
            }

            await this.s3Service.deleteFile(fileKey);
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to delete image: ${error.message}`,
            );
        }
    }

    async deleteCategoryImage(id: number, imageUrl: string) {
        // 1. Verify category exists
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // 2. Verify the image URL matches the category's image
        if (category.image !== imageUrl) {
            throw new BadRequestException(
                'Image URL does not match category image',
            );
        }

        // 3. Delete from S3
        if (imageUrl) {
            try {
                await this.deleteImage(imageUrl);
            } catch (error: any) {
                throw new InternalServerErrorException(
                    `Failed to delete image from S3. ${error}`,
                );
            }
        }

        // 4. Update database to remove image reference
        // await this.prisma.category.update({
        //     where: { id },
        //     data: {
        //         image: null,
        //         updatedAt: new Date(),
        //     },
        // });

        return { message: 'Image deleted successfully' };
    }

    private async deleteImage(imageUrl: string) {
        try {
            // Extract file key from URL
            const fileKey = imageUrl.split('.amazonaws.com/')[1];

            if (!fileKey) {
                throw new Error('Invalid image URL format');
            }

            await this.s3Service.deleteFile(fileKey);
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .trim();
    }

    findAll() {
        return `This action returns all categories`;
    }

    async findOneCategory(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        return {
            data: category,
            message: 'Category retrieved successfully',
        };
    }

    async deleteCategory(id: number) {
        // Find the category by ID using Prisma
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        // If the category is not found, throw an error
        if (!category) {
            throw new BadRequestException('Category not found');
        }

        // Check if the category has an image URL (if it exists, delete it from S3)
        if (category.image) {
            try {
                // Extract the file key from the image URL
                await this.deleteFile(category.image);
            } catch (error) {
                throw new Error(
                    `Failed to delete image from S3: ${error.message}`,
                );
            }
        }

        // Now delete the category from the database using Prisma
        await this.prisma.category.delete({
            where: { id },
        });

        return { message: 'Category deleted successfully' };
    }
}
