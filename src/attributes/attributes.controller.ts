import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import {
    AttributeDto,
    PaginatedAttributesDto,
} from './dto/paginated-attributes.dto';

@Controller('attributes')
export class AttributesController {
    constructor(private readonly attributesService: AttributesService) {}

    @Post('create-attribute')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    async createAttribute(@Body() createAttributeDto: CreateAttributeDto) {
        return this.attributesService.createAttribute(createAttributeDto);
    }

    @Get('get-total-attributes')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiOkResponse({ type: AttributeDto }) // Replace CategoryDto with your actual DTO
    async getTotalCategories() {
        return this.attributesService.getTotalAttributes();
    }

    @Get('get-all-attributes')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiOkResponse({ type: PaginatedAttributesDto })
    async getPaginatedAttributes(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search = '',
    ) {
        return this.attributesService.getPaginatedAttributes({
            page,
            limit,
            search,
        });
    }

    @Get('get-one-attribute/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    async findOneAttribute(@Param('id', ParseIntPipe) id: number) {
        return this.attributesService.findOneAttribute(id);
    }

    @Patch('update-attribute/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    async updateAttribute(
        @Param('id') id: string,
        @Body() updateAttributeDto: UpdateAttributeDto,
    ) {
        return this.attributesService.updateAttribute(id, updateAttributeDto);
    }

    @Post()
    create(@Body() createAttributeDto: CreateAttributeDto) {
        return this.attributesService.create(createAttributeDto);
    }

    @Get()
    findAll() {
        return this.attributesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.attributesService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateAttributeDto: UpdateAttributeDto,
    ) {
        return this.attributesService.update(+id, updateAttributeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.attributesService.remove(+id);
    }
}
