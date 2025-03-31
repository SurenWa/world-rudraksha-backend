// dto/category.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class CategoryDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

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

export class PaginatedCategoriesDto {
    @ApiProperty({ type: () => [CategoryDto] })
    data: CategoryDto[];

    @ApiProperty()
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}
