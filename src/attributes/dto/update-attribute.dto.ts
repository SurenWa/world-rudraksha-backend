import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AttributeValueDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty()
    @IsString()
    value: string;

    @ApiProperty({ required: false })
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    image?: string;
}

export class UpdateAttributeDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    addedBy: string;

    @ApiProperty({ type: [AttributeValueDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeValueDto)
    values: AttributeValueDto[];
}
