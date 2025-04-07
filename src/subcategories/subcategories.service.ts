import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubcategoriesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Service: S3Service,
    ) {}

    async createSubcategory(
        createSubcategoryDto: CreateSubcategoryDto,
        imageFile?: Express.Multer.File,
    ) {
        //Check if sub category with the same slug already exists
        const existingSubategorySlug = await this.prisma.subCategory.findFirst({
            where: {
                slug: createSubcategoryDto.slug,
            },
        });

        if (existingSubategorySlug) {
            throw new BadRequestException(
                'Sub Category with the same slug already exists.',
            );
        }
        // 1. Upload image to S3 if provided
        let imageUrl = '';

        if (imageFile) {
            const uploadResult = await this.s3Service.uploadFile(
                imageFile,
                'subcategories', // Folder in S3
                //true, // Make public (since categories need public access)
            );
            imageUrl = uploadResult.url;
        }

        // 2. Auto-generate slug if not provided
        const slug = createSubcategoryDto.slug;

        // 3. Create category in database
        await this.prisma.subCategory.create({
            data: {
                ...createSubcategoryDto,
                slug,
                image: imageUrl,
                keywords: createSubcategoryDto.keywords || [],
                tags: createSubcategoryDto.tags || [],
            },
        });

        return {
            message: 'Sub Category created successfully',
        };
    }

    async findOneSubCategory(id: number) {
        const subcategory = await this.prisma.subCategory.findUnique({
            where: { id },
            include: {
                category: true, // Include all subcategories under this category
            },
        });

        if (!subcategory) {
            throw new BadRequestException('SubCategory not found');
        }

        return {
            data: subcategory,
            message: 'SubCategory retrieved successfully',
        };
    }

    // async getPaginatedSubcategories(params: {
    //     page: number;
    //     limit: number;
    //     search?: string;
    //     categoryId?: number;
    // }) {
    //     const { page, limit, search, categoryId } = params;
    //     const page1 = Number(params.page) || 1;
    //     const limit1 = Number(params.limit) || 10;
    //     const skip = (page - 1) * limit;

    //     const where: Prisma.SubCategoryWhereInput = search
    //         ? {
    //               OR: [
    //                   { name: { contains: search, mode: 'insensitive' } },
    //                   {
    //                       description: {
    //                           contains: search,
    //                           mode: 'insensitive',
    //                       },
    //                   },
    //               ],
    //           }
    //         : {};

    //     const [subcategories, total] = await Promise.all([
    //         this.prisma.subCategory.findMany({
    //             skip,
    //             take: limit1,
    //             where,
    //             orderBy: { createdAt: 'desc' },
    //             select: {
    //                 id: true,
    //                 image: true,
    //                 name: true,
    //                 slug: true,
    //                 description: true,
    //                 addedBy: true,
    //                 categoryId: true,
    //                 // Include products count if needed
    //                 // products: true,
    //             },
    //         }),
    //         this.prisma.subCategory.count({ where }),
    //     ]);

    //     return {
    //         data: subcategories,
    //         meta: {
    //             total,
    //             page: page1,
    //             limit: limit1,
    //             lastPage: Math.ceil(total / limit),
    //         },
    //     };
    // }

    async getPaginatedSubcategories(params: {
        page: number;
        limit: number;
        search?: string;
        categoryId?: number;
    }) {
        const { page, limit, search, categoryId } = params;
        const page1 = Number(params.page) || 1;
        const limit1 = Number(params.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.SubCategoryWhereInput = {};

        // Add search conditions if search term exists
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        // Add category filter if categoryId exists
        if (categoryId) {
            where.categoryId = Number(categoryId);
        }

        const [subcategories, total] = await Promise.all([
            this.prisma.subCategory.findMany({
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
                    categoryId: true,
                    // Include products count if needed
                    // products: true,
                },
            }),
            this.prisma.subCategory.count({ where }),
        ]);

        return {
            data: subcategories,
            meta: {
                total,
                page: page1,
                limit: limit1,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async updateSubcategory(
        id: number,
        updateSubcategoryDto: UpdateSubcategoryDto,
        imageFile?: Express.Multer.File,
    ) {
        // 1. Check if category exists
        const existingSubcategory = await this.prisma.subCategory.findUnique({
            where: { id },
        });

        if (!existingSubcategory) {
            throw new BadRequestException('Sub Category not found');
        }

        // 2. Check for duplicate name or slug (if updated)
        if (updateSubcategoryDto.slug) {
            const duplicateSubcategory =
                await this.prisma.subCategory.findFirst({
                    where: {
                        OR: [
                            {
                                slug: updateSubcategoryDto.slug,
                            },
                        ],
                        NOT: { id }, // Exclude the current category
                    },
                });

            if (duplicateSubcategory) {
                throw new BadRequestException(
                    'Sub Category or slug already exists',
                );
            }
        }

        // 3. Handle image update
        let imageUrl = existingSubcategory?.image;

        if (imageFile) {
            // Delete old image if it exists
            if (existingSubcategory?.image) {
                await this.deleteFile(existingSubcategory?.image);
            }

            // Upload new image
            const uploadResult = await this.s3Service.uploadFile(
                imageFile,
                'subcategories',
            );
            imageUrl = uploadResult.url;
        }

        // 4. Update category in database
        await this.prisma.subCategory.update({
            where: { id },
            data: {
                ...updateSubcategoryDto,
                slug: updateSubcategoryDto.slug,
                image: imageUrl,
                keywords: updateSubcategoryDto.keywords || [],
                tags: updateSubcategoryDto.tags || [],
            },
        });

        return { message: 'Sub Category updated successfully' };
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

    async deleteSubcategory(id: number) {
        // Find the category by ID using Prisma
        const subcategory = await this.prisma.subCategory.findUnique({
            where: { id },
        });

        // If the category is not found, throw an error
        if (!subcategory) {
            throw new BadRequestException('Category not found');
        }

        // Check if the category has an image URL (if it exists, delete it from S3)
        if (subcategory?.image) {
            try {
                // Extract the file key from the image URL
                await this.deleteFile(subcategory?.image);
            } catch (error) {
                throw new Error(
                    `Failed to delete image from S3: ${error.message}`,
                );
            }
        }

        // Now delete the category from the database using Prisma
        await this.prisma.subCategory.delete({
            where: { id },
        });

        return { message: 'Sub Category deleted successfully' };
    }

    async deleteSubCategoryImage(id: number, imageUrl: string) {
        // 1. Verify category exists
        const subcategory = await this.prisma.subCategory.findUnique({
            where: { id },
        });

        if (!subcategory) {
            throw new NotFoundException('Category not found');
        }

        // 2. Verify the image URL matches the category's image
        if (subcategory.image !== imageUrl) {
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
}
