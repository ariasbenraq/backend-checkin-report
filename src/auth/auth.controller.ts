import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // POST auth/signup

    @Post('/signup')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @HttpCode(201)
    signUp(@Body() dto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(dto);
    }
}