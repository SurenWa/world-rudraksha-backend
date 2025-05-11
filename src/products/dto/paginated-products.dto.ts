import { ApiProperty } from '@nestjs/swagger';

class ProductVariantCombinationDto {
    @ApiProperty()
    attributeValueId: number;
}

class ProductVariantDto {
    @ApiProperty()
    sku: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    costPrice: number;

    @ApiProperty()
    stock: number;

    @ApiProperty({ type: () => [ProductVariantCombinationDto] })
    combinations: ProductVariantCombinationDto[];
}

export class ProductDto {
    @ApiProperty()
    slug: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    productType: string;

    @ApiProperty()
    categoryId: number;

    @ApiProperty()
    subcategoryId: number;

    @ApiProperty()
    description: string;

    @ApiProperty()
    new: boolean;

    @ApiProperty()
    sale: boolean;

    @ApiProperty()
    basePrice: number;

    @ApiProperty()
    maxStock: number;

    @ApiProperty()
    minStock: number;

    @ApiProperty()
    shippingPrice: number;

    @ApiProperty()
    availabilityStatus: string;

    @ApiProperty()
    addedBy: string;

    @ApiProperty({ type: () => [String] })
    thumbImages: string[];

    @ApiProperty({ type: () => [String] })
    images: string[];

    @ApiProperty()
    metaTitle: string;

    @ApiProperty()
    metaDescription: string;

    @ApiProperty({ type: () => [String] })
    keywords: string[];

    @ApiProperty({ type: () => [String] })
    tags: string[];

    @ApiProperty({ type: () => [ProductVariantDto] })
    variants: ProductVariantDto[];
}

export class PaginatedProductsDto {
    @ApiProperty({ type: () => [ProductDto] })
    data: ProductDto[];

    @ApiProperty()
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}
