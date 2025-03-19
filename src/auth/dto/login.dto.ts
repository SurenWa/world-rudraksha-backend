import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'cirrusminor2@gmail.com',
        description: 'The email address of the user',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'Makalu@9841',
        description: 'The password of the user',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
