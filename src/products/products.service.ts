import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddProductDto } from './dto/add-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}
    async createProduct(addProductDto: AddProductDto) {
        // Check if product with same slug exists
        const existingProduct = await this.prisma.product.findUnique({
            where: { slug: addProductDto.slug },
        });

        if (existingProduct) {
            throw new ConflictException(
                'Product with this slug already exists',
            );
        }

        // Check if category exists
        const category = await this.prisma.category.findUnique({
            where: { id: addProductDto.categoryId },
        });

        if (!category) {
            throw new NotFoundException(
                `Category with ID ${addProductDto.categoryId} not found`,
            );
        }

        // Check if subcategory exists
        const subcategory = await this.prisma.subCategory.findUnique({
            where: { id: addProductDto.subcategoryId },
        });

        if (!subcategory) {
            throw new NotFoundException(
                `Subcategory with ID ${addProductDto.subcategoryId} not found`,
            );
        }

        // Calculate total stock from variants
        const totalStock = addProductDto.variants.reduce(
            (sum, variant) => sum + variant.stock,
            0,
        );

        // Create the product with variants in a transaction
        return this.prisma.$transaction(async (prisma) => {
            const product = await prisma.product.create({
                data: {
                    title: addProductDto.title,
                    slug: addProductDto.slug,
                    productType: addProductDto.productType,
                    categoryId: addProductDto.categoryId,
                    subcategoryId: addProductDto.subcategoryId,
                    description: addProductDto.description,
                    new: addProductDto.new ?? false,
                    sale: addProductDto.sale ?? false,
                    basePrice: addProductDto.basePrice,
                    maxStock: addProductDto.maxStock,
                    minStock: addProductDto.minStock,
                    shippingPrice: addProductDto.shippingPrice,
                    addedBy: addProductDto.addedBy,
                    thumbImages: addProductDto.thumbImages,
                    images: addProductDto.images,
                    productUrl: addProductDto.productUrl,
                    currentStock: totalStock,
                    availabilityStatus: addProductDto.availabilityStatus,
                    metaTitle: addProductDto.metaTitle,
                    metaDescription: addProductDto.metaDescription,
                    keywords: addProductDto.keywords,
                    tags: addProductDto.tags,
                },
            });

            // Create variants with generated SKUs
            for (const [
                index,
                variantDto,
            ] of addProductDto.variants.entries()) {
                const sku = this.generateSku(product.id, index);
                const variant = await prisma.productVariant.create({
                    data: {
                        sku, // Use generated SKU
                        price: variantDto.price,
                        costPrice: variantDto.costPrice,
                        stock: variantDto.stock,
                        productId: product.id,
                    },
                });

                // Create variant combinations
                await prisma.variantCombination.createMany({
                    data: variantDto.combinations.map((combination) => ({
                        variantId: variant.id,
                        attributeValueId: combination.attributeValueId,
                    })),
                });
            }

            return product;
        });
    }

    async getPaginatedProducts(params: {
        page: number;
        limit: number;
        search?: string;
    }) {
        const { page, limit, search } = params;
        const page1 = Number(params.page) || 1;
        const limit1 = Number(params.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {};

        // Add search conditions if search term exists
        if (search) {
            where.OR = [{ title: { contains: search, mode: 'insensitive' } }];
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                skip,
                take: limit1,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    ProductVariant: {
                        include: {
                            combinations: {
                                include: {
                                    attributeValue: true, // Include attributeValue relation
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products,
            meta: {
                total,
                page: page1,
                limit: limit1,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    findAll() {
        return `This action returns all products`;
    }

    findOne(id: number) {
        return `This action returns a #${id} product`;
    }

    update(id: number, updateProductDto: UpdateProductDto) {
        return `This action updates a #${id} product`;
    }

    remove(id: number) {
        return `This action removes a #${id} product`;
    }

    private generateSku(productId: number, variantIndex: number): string {
        const prefix = 'PROD';
        const productCode = productId.toString().padStart(4, '0');
        const variantCode = (variantIndex + 1).toString().padStart(2, '0');
        return `${prefix}-${productCode}-${variantCode}`;
    }
}
