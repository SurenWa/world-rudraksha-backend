import {
    IsString,
    IsNumber,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsOptional,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, AvailabilityStatus } from '@prisma/client';

class VariantCombinationDto {
    @ApiProperty({
        description: 'ID of the attribute value',
        example: 1,
    })
    @IsNumber()
    attributeValueId: number;
}

class ProductVariantDto {
    // @ApiProperty({
    //     description: 'SKU of the variant',
    //     example: 'PROD-VAR-001',
    // })
    // @IsString()
    // sku: string;

    @ApiProperty({
        description: 'Price of the variant',
        example: 99.99,
    })
    @IsNumber()
    price: number;

    @ApiPropertyOptional({
        description: 'Cost price of the variant',
        example: 50.0,
    })
    @IsOptional()
    @IsNumber()
    costPrice?: number;

    @ApiProperty({
        description: 'Stock quantity of the variant',
        example: 100,
    })
    @IsNumber()
    stock: number;

    @ApiProperty({
        description: 'Array of variant combinations',
        type: [VariantCombinationDto],
    })
    @ValidateNested({ each: true })
    @Type(() => VariantCombinationDto)
    combinations: VariantCombinationDto[];
}

export class AddProductDto {
    @ApiProperty({
        description: 'URL slug for the product',
        example: 'premium-mala-beads',
    })
    @IsString()
    slug: string;

    @ApiProperty({
        description: 'Title of the product',
        example: 'Premium Mala Beads',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Type of the product',
        enum: ProductType,
        example: ProductType.MALA,
    })
    @IsEnum(ProductType)
    productType: ProductType;

    @ApiProperty({
        description: 'ID of the category',
        example: 1,
    })
    @IsNumber()
    categoryId: number;

    @ApiProperty({
        description: 'ID of the subcategory',
        example: 1,
    })
    @IsNumber()
    subcategoryId: number;

    @ApiProperty({
        description: 'Product description in JSON format',
        example: {
            description: 'Beautiful handmade mala beads...',
            benefits: 'Helps with meditation...',
            whoShouldWear: 'Meditation practitioners...',
            wearingRules: 'Wear on right hand...',
        },
    })
    description: any;

    @ApiPropertyOptional({
        description: 'Whether the product is marked as new',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    new?: boolean = false;

    @ApiPropertyOptional({
        description: 'Whether the product is on sale',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    sale?: boolean = false;

    @ApiProperty({
        description: 'Base price of the product',
        example: 89.99,
    })
    @IsNumber()
    basePrice: number;

    @ApiProperty({
        description: 'Max stock of the product',
        example: 1000,
    })
    @IsNumber()
    maxStock: number;

    @ApiProperty({
        description: 'Min stock of the product',
        example: 5,
    })
    @IsNumber()
    minStock: number;

    @ApiProperty({
        description: 'Min stock of the product',
        example: 5,
    })
    @IsNumber()
    shippingPrice: number;

    @ApiProperty({
        description: 'Type of the product',
        enum: AvailabilityStatus,
        example: AvailabilityStatus.AVAILABLE,
    })
    @IsEnum(AvailabilityStatus)
    availabilityStatus: AvailabilityStatus;

    @ApiProperty({
        description: 'Username of who added the product',
        example: 'admin',
    })
    @IsString()
    addedBy: string;

    @ApiProperty({
        description: 'Array of thumbnail image URLs',
        example: [
            'https://example.com/thumb1.jpg',
            'https://example.com/thumb2.jpg',
        ],
    })
    @IsArray()
    thumbImages: string[];

    @ApiProperty({
        description: 'Array of product image URLs',
        example: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
        ],
    })
    @IsArray()
    images: string[];

    @ApiPropertyOptional({
        description: 'Meta title for SEO',
        example: 'Premium Mala Beads for Meditation',
        required: false,
    })
    @IsOptional()
    @IsString()
    metaTitle?: string;

    @ApiPropertyOptional({
        description: 'Meta description for SEO',
        example:
            'Handcrafted premium mala beads perfect for meditation and spiritual practice.',
        required: false,
    })
    @IsOptional()
    @IsString()
    metaDescription?: string;

    @ApiPropertyOptional({
        description: 'product url for SEO',
        example: 'https://localhost:3000',
        required: false,
    })
    @IsOptional()
    @IsString()
    productUrl?: string;

    @ApiPropertyOptional({
        description: 'SEO keywords',
        example: ['mala', 'beads', 'meditation'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    keywords?: string[];

    @ApiPropertyOptional({
        description: 'Product tags',
        example: ['bestseller', 'new-arrival'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    tags?: string[];

    @ApiProperty({
        description: 'Product variants',
        type: [ProductVariantDto],
    })
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];
}
