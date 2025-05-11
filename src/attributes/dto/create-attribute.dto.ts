// import {
//     IsArray,
//     IsNotEmpty,
//     IsOptional,
//     IsString,
//     ValidateNested,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// class AttributeValueDto {
//     @IsString()
//     @IsNotEmpty()
//     value: string;

//     @IsString()
//     @IsOptional()
//     description?: string;

//     @IsString()
//     @IsOptional()
//     image?: string;
// }

// export class CreateAttributeDto {
//     @IsString()
//     @IsNotEmpty()
//     name: string;

//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => AttributeValueDto)
//     values: AttributeValueDto[];
// }

import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AttributeValueDto {
    @ApiProperty({
        example: 'Red',
        description: 'The actual value of the attribute',
    })
    @IsString()
    @IsNotEmpty()
    value: string;

    @ApiPropertyOptional({
        example: 'Bright red color',
        description: 'Optional description of the attribute value',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/images/red.png',
        description: 'Optional image URL representing the attribute value',
    })
    @IsString()
    @IsOptional()
    image?: string;
}

export class CreateAttributeDto {
    @ApiProperty({
        example: 'Color',
        description: 'The name of the attribute',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Surendra Wagle, ADMIN',
        description: 'Added By description',
    })
    @IsString()
    @IsNotEmpty()
    addedBy: string;

    @ApiProperty({
        type: [AttributeValueDto],
        example: [
            {
                value: 'Red',
                description: 'Bright red color',
                image: 'https://example.com/images/red.png',
            },
            {
                value: 'Blue',
                description: 'Deep blue color',
                image: 'https://example.com/images/blue.png',
            },
        ],
        description: 'Array of possible values for this attribute',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeValueDto)
    values: AttributeValueDto[];
}
