import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSubcategoryDto {
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
        example: 1,
        description: 'CategoryId',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    categoryId: number;

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
export class UpdateSubcategoryWithFileDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Updated sub category image file',
        required: false,
    })
    @IsOptional()
    image: Express.Multer.File;

    @ApiProperty({
        type: String,
        description:
            'Sub Category data as a JSON string (stringify the Sub CreateCategoryDto object)',
        example: JSON.stringify({
            name: '1 Mukhi Rudraksha',
            slug: 'nepali-1-mukhi-rudraksha',
            categoryId: 1,
            description:
                'Authentic 1 Mukhi Rudraksha from Nepal.Authentic 1 Mukhi Rudraksha from Nepal.Authentic 1 Mukhi Rudraksha from Nepal',
            metaTitle: '1 Mukhi Rudraksha - Spiritual Benefits & Buying Guide',
            metaDescription:
                'Discover the spiritual benefits of authentic 5 Mukhi Rudraksha beads from Nepal.iscover the spiritual benefits of authentic 5 Mukhi Rudraksha beads from Nepal.iscover the spiritual benefits of authentic 5 Mukhi Rudraksha beads from Nepal',
            addedBy: 'Parshu GC',
            keywords: ['rudraksha', 'spiritual', '5 mukhi'],
            tags: ['1', '2', '3'],
        }),
    })
    data: string;
}
