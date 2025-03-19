import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({
        example: 'John',
        description: 'The first name of the user',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'The last name of the user',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'The email address of the user',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'The password of the user (min 8 characters)',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: 'USER',
        description: 'The role of the user (default: USER)',
        enum: Role,
        required: false,
    })
    role?: Role;
}
