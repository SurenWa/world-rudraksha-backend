// dto/attribute.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class AttributeValueDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    value: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    image: string;

    @ApiProperty()
    attributeId: number;
}

export class AttributeDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    addedBy: string;

    @ApiProperty({ type: () => [AttributeValueDto] })
    values: AttributeValueDto[];
}

export class PaginatedAttributesDto {
    @ApiProperty({ type: () => [AttributeDto] })
    data: AttributeDto[];

    @ApiProperty()
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}
