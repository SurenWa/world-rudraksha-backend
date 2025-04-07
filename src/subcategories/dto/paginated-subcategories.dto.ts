// dto/category.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class SubcategoryDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    categoryId: number;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    image: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    addedBy: string;

    // @ApiProperty()
    // products: number;

    // @ApiProperty()
    // createdAt: Date;

    // @ApiProperty()
    // updatedAt: Date;
}

export class PaginatedSubcategoriesDto {
    @ApiProperty({ type: () => [SubcategoryDto] })
    data: SubcategoryDto[];

    @ApiProperty()
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}
