import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @ApiProperty({
        example: '5 Mukhi Rudraksha',
        description: 'Unique name of the category',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        example: '5-mukhi-rudraksha',
        description: 'URL-friendly slug (auto-generated if not provided)',
        required: false,
    })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({
        example: 'Authentic 5 Mukhi Rudraksha from Nepal',
        description: 'Detailed description of the category',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: '5 Mukhi Rudraksha - Spiritual Benefits & Buying Guide',
        description: 'SEO meta title (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    metaTitle?: string;

    @ApiProperty({
        example:
            'Discover the spiritual benefits of authentic 5 Mukhi Rudraksha beads from Nepal',
        description: 'SEO meta description (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    metaDescription?: string;

    @ApiProperty({
        example: 'Parshu GC',
        description: 'Updated category by (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    addedBy?: string;

    @ApiProperty({
        example: ['rudraksha', 'spiritual', '5 mukhi'],
        description: 'SEO keywords array',
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    keywords?: string[];

    @ApiProperty({
        example: ['1', '2', '3'],
        description: 'Tags array',
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

/**
 * DTO for handling category update with an image upload.
 * The `data` field should be sent as a JSON string containing UpdateCategoryDto.
 */
export class UpdateCategoryWithFileDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Updated category image file (optional)',
        required: false,
    })
    @IsOptional()
    image?: Express.Multer.File;

    @ApiProperty({
        type: String,
        description:
            'Category update data as a JSON string (stringify the UpdateCategoryDto object)',
        example: JSON.stringify({
            name: '5 Mukhi Rudraksha',
            description: 'Authentic 5 Mukhi Rudraksha from Nepal',
            metaTitle: '5 Mukhi Rudraksha - Spiritual Benefits & Buying Guide',
            metaDescription:
                'Discover the spiritual benefits of authentic 5 Mukhi Rudraksha beads from Nepal',
            updatedBy: 'Admin',
            keywords: ['rudraksha', 'spiritual', '5 mukhi'],
            tags: ['1', '2', '3'],
        }),
    })
    @IsNotEmpty()
    data: string;
}
