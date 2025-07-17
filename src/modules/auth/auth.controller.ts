import {
  Body,
  Controller,
  Post,
  Get,
  UnauthorizedException,
  BadRequestException,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../../dtos/login.dto';
import { SignupDto } from '../../dtos/signup.dto';
import { ForgotPasswordDto } from '../../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      return await this.authService.signup(signupDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto.email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('lock-account')
  async lockAccount(@Body('email') email: string) {
    try {
      return await this.authService.lockAccount(email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('unlock-account')
  async unlockAccount(
    @Body('email') email: string,
    @Body('token') token: string,
  ) {
    try {
      return await this.authService.unlockAccount(email, token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
