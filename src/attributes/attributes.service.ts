import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttributesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Service: S3Service,
    ) {}

    async createAttribute(createAttributeDto: CreateAttributeDto) {
        const { name, addedBy, values } = createAttributeDto;

        await this.prisma.attribute.create({
            data: {
                name,
                addedBy,
                values: {
                    createMany: {
                        data: values.map((value) => ({
                            value: value.value,
                            description: value.description,
                            image: value.image,
                        })),
                    },
                },
            },
            include: {
                values: true,
            },
        });

        return {
            message: 'Attribute created successfully',
        };
    }

    async getPaginatedAttributes(params: {
        page: number;
        limit: number;
        search?: string;
    }) {
        const { page, limit, search } = params;
        const page1 = Number(params.page) || 1;
        const limit1 = Number(params.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.AttributeWhereInput = {};

        // Add search conditions if search term exists
        if (search) {
            where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
        }

        const [attributes, total] = await Promise.all([
            this.prisma.attribute.findMany({
                skip,
                take: limit1,
                where,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    addedBy: true,
                    values: true,
                    // Include products count if needed
                    // products: true,
                },
            }),
            this.prisma.attribute.count({ where }),
        ]);

        return {
            data: attributes,
            meta: {
                total,
                page: page1,
                limit: limit1,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async getTotalAttributes() {
        const totalAttributes = await this.prisma.attribute.findMany({
            include: {
                values: true, // ← this will include the related values
            },
        });
        return {
            data: totalAttributes,
        };
    }

    async findOneAttribute(id: number) {
        const attribute = await this.prisma.attribute.findUnique({
            where: { id },
            include: {
                values: true, // Include all subcategories under this category
            },
        });

        if (!attribute) {
            throw new BadRequestException('Attribute not found');
        }

        return {
            data: attribute,
            message: 'SubCategory retrieved successfully',
        };
    }

    // async updateAttribute(id: number, updateAttributeDto: UpdateAttributeDto) {
    //     const { name, addedBy, values } = updateAttributeDto;

    //     // First get existing attribute with values
    //     const existingAttribute = await this.prisma.attribute.findUnique({
    //         where: { id },
    //         include: { values: true },
    //     });

    //     if (!existingAttribute) {
    //         throw new NotFoundException('Attribute not found');
    //     }

    //     // Separate existing and new values
    //     const existingValues = values.filter((v) => v.id);
    //     const newValues = values.filter((v) => !v.id);

    //     // Transaction for atomic updates
    //     return this.prisma.$transaction(async (prisma) => {
    //         // Update the attribute itself
    //         await prisma.attribute.update({
    //             where: { id },
    //             data: {
    //                 name,
    //                 addedBy,
    //                 updatedAt: new Date(),
    //             },
    //         });

    //         // Update existing values
    //         await Promise.all(
    //             existingValues.map((value) =>
    //                 prisma.attributeValue.update({
    //                     where: { id: Number(value.id) },
    //                     data: {
    //                         value: value.value,
    //                         description: value.description,
    //                         image: value.image,
    //                         updatedAt: new Date(),
    //                     },
    //                 }),
    //             ),
    //         );

    //         // Create new values
    //         if (newValues.length > 0) {
    //             await prisma.attributeValue.createMany({
    //                 data: newValues.map((value) => ({
    //                     attributeId: id,
    //                     value: value.value,
    //                     description: value.description,
    //                     image: value.image,
    //                 })),
    //             });
    //         }

    //         // Get all current values after update
    //         const updatedAttribute = await prisma.attribute.findUnique({
    //             where: { id },
    //             include: { values: true },
    //         });

    //         return {
    //             message: 'Attribute updated successfully',
    //             data: updatedAttribute,
    //         };
    //     });
    // }

    async updateAttribute(id: string, updateAttributeDto: UpdateAttributeDto) {
        const attributeId = parseInt(id, 10);
        const { name, addedBy, values } = updateAttributeDto;

        return this.prisma.$transaction(async (prisma) => {
            // Update main attribute
            await prisma.attribute.update({
                where: { id: attributeId },
                data: {
                    name,
                    addedBy,
                    updatedAt: new Date(),
                },
            });

            // Get existing values to compare
            const existingValues = await prisma.attributeValue.findMany({
                where: { attributeId },
            });

            // Separate incoming values into updates and creates
            const valuesToUpdate = values.filter(
                (v) =>
                    v.id &&
                    existingValues.some((ev) => ev.id.toString() === v.id),
            );
            const valuesToCreate = values.filter(
                (v) =>
                    !v.id ||
                    !existingValues.some((ev) => ev.id.toString() === v.id),
            );

            // Update existing values
            await Promise.all(
                valuesToUpdate.map((value) =>
                    prisma.attributeValue.update({
                        where: { id: Number(value.id) },
                        data: {
                            value: value.value,
                            description: value.description || null,
                            image: value.image || null,
                            updatedAt: new Date(),
                        },
                    }),
                ),
            );

            // Create new values
            if (valuesToCreate.length > 0) {
                await prisma.attributeValue.createMany({
                    data: valuesToCreate.map((value) => ({
                        attributeId,
                        value: value.value,
                        description: value.description || null,
                        image: value.image || null,
                    })),
                });
            }

            // Return complete updated attribute
            return await prisma.attribute.findUnique({
                where: { id: attributeId },
                include: { values: true },
            });
        });
    }

    create(createAttributeDto: CreateAttributeDto) {
        return 'This action adds a new attribute';
    }

    findAll() {
        return `This action returns all attributes`;
    }

    findOne(id: number) {
        return `This action returns a #${id} attribute`;
    }

    update(id: number, updateAttributeDto: UpdateAttributeDto) {
        return `This action updates a #${id} attribute`;
    }

    remove(id: number) {
        return `This action removes a #${id} attribute`;
    }
}
