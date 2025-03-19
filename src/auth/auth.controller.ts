import {
    Controller,
    Get,
    Post,
    Body,
    //Patch,
    //Param,
    //Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Res,
    Req,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
//import { CreateAuthDto } from './dto/create-auth.dto';
//import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
//import { Request } from 'express';
import { ApiCookieAuth } from '@nestjs/swagger';
import { RequestWithUser } from '../types/request-with-user';
//import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
//import * as argon2 from 'argon2';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const tokens = await this.authService.login(loginDto);
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === 'production',
            secure: false,
            sameSite: 'strict',
                    
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === 'production',
            secure: false,
            sameSite: 'strict',
            
        });
        return {
            message: 'Logged in successfully',
            firstName: tokens?.firstName,
            role: tokens?.role,
            
        };
    }

    @UseGuards(JwtAuthGuard) // Protect the endpoint with JwtAuthGuard
    @ApiCookieAuth()
    @Get('current-user')
    async getCurrentUser(@Req() req: RequestWithUser) {
        //console.log('req.user:', req?.user); // Log the user object
        const userId = req?.user?.userId; // Extract user ID from the token payload
        return this.authService.getCurrentUser(userId);
    }

    //@UseGuards(RefreshAuthGuard) // Protect the endpoint with RefreshAuthGuard
    // @Post('refresh')
    // async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    //     const userId = req.user.userId; // Extract user ID from the token payload
    //     const refreshToken = req.cookies['refresh_token']; // Extract refresh token from cookies
    //     if (!refreshToken) {
    //         throw new ForbiddenException('Refresh token is missing');
    //     }
    //     const tokens = await this.authService.refreshTokens(
    //         userId,
    //         refreshToken,
    //     );

    //     // Set the new tokens as HTTP-only cookies
    //     res.cookie('access_token', tokens.accessToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: 'strict',
    //     });
    //     res.cookie('refresh_token', tokens.refreshToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: 'strict',
    //     });

    //     return { message: 'Tokens refreshed successfully' };
    // }
    //@Post('refresh')
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies['refresh_token']; // Extract refresh token from cookies

        if (!refreshToken) {
            throw new ForbiddenException('Refresh token missing');
        }

        try {
            // Verify the refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            });
            
            // Find the user and validate the refresh token
            const user = await this.authService.validateRefreshToken(
                payload.sub,
            );
            
            if (!user) {
                throw new ForbiddenException('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = await this.authService.refreshTokens(
                user.id,
                refreshToken,
            );

            // Set the new tokens as HTTP-only cookies
            res.cookie('access_token', tokens.accessToken, {
                httpOnly: true,
                //secure: process.env.NODE_ENV === 'production',
                secure: false,
                sameSite: 'strict',
            });
            res.cookie('refresh_token', tokens.refreshToken, {
                httpOnly: true,
                //secure: process.env.NODE_ENV === 'production',
                secure: false,
                sameSite: 'strict',
            });

            return { message: 'Tokens refreshed successfully' };
        } catch (error) {
            //console.log("refresh token error", error)
            // Handle JWT errors (e.g., invalid, expired, or malformed token)
            if (error.name === 'TokenExpiredError') {
                throw new ForbiddenException('Refresh token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new ForbiddenException('Invalid refresh token');
            }
            throw new ForbiddenException('Access denied');
        }
    }

    @Post('validate-refresh-token')
    async validateRefreshToken(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req?.cookies?.refresh_token;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token missing');
        }

        // Verify the refresh token
        const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        });

        const user = await this.authService.validateRefreshToken(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return res.status(200).json(user);
    }

    private extractRefreshTokenFromCookie(cookieHeader: string): string | null {
        if (!cookieHeader) {
            return null;
        }

        const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
        const refreshTokenCookie = cookies.find((cookie) =>
            cookie.startsWith('refresh_token='),
        );

        if (!refreshTokenCookie) {
            return null;
        }

        return refreshTokenCookie.split('=')[1];
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiCookieAuth()
    adminOnly() {
        return 'This route is accessible only by ADMIN';
    }

    @Get('subadmin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN')
    @ApiCookieAuth()
    subadminOnly() {
        return 'This route is accessible by ADMIN and SUBADMIN';
    }

    @Get('user')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUBADMIN', 'USER')
    @ApiCookieAuth()
    userOnly() {
        return 'This route is accessible by all authenticated users';
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
    @ApiCookieAuth()
    async logout(@Req() req: RequestWithUser, @Res() res: Response) {
        const userId = req.user.userId; // Assuming the user object is attached by the JWT strategy

        // Clear the refresh token in the User model
        await this.authService.logout(userId);

        // Clear the access and refresh token cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return res.status(200).json({ message: 'Logged out successfully' });
    }

    @Post('clearTokens')
    // @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
    // @ApiCookieAuth()
    async clearTokens(@Res() res: Response) {
        //const userId = req.user.userId; // Assuming the user object is attached by the JWT strategy

        // Clear the refresh token in the User model
        //await this.authService.logout(userId);

        // Clear the access and refresh token cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return res.status(200).json({ message: 'Logged out successfully' });
    }

    // @Post()
    // create(@Body() createAuthDto: CreateAuthDto) {
    //     return this.authService.create(createAuthDto);
    // }

    // @Get()
    // findAll() {
    //     return this.authService.findAll();
    // }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.authService.findOne(+id);
    // }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    //     return this.authService.update(+id, updateAuthDto);
    // }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //     return this.authService.remove(+id);
    // }
}
