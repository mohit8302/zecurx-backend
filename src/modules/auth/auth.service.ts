import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from '../../dtos/login.dto';
import { SignupDto } from '../../dtos/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private resetPasswordTokens = new Map<
    string,
    { email: string; expires: Date }
  >();
  private emailVerificationTokens = new Map<
    string,
    { email: string; expires: Date }
  >();
  private accountUnlockTokens = new Map<
    string,
    { email: string; expires: Date }
  >();

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException(
        'Account is locked. Please reset your password.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Track failed login attempts (in a real app, you'd store this in the database)
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    const { email, fullName, password, mobile } = signupDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = this.userRepository.create({
      email,
      fullName,
      password: hashedPassword,
      mobile,
      // role defaults to 'student' based on your schema
    });

    await this.userRepository.save(newUser);

    // Generate verification token
    const verificationToken = uuidv4();
    this.emailVerificationTokens.set(verificationToken, {
      email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // In a real application, send an email with verification link
    // await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message: 'User registered successfully. Please verify your email.',
      // In a development environment, you might want to return the token directly
      verificationToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return {
        message:
          'If your email is registered, you will receive a password reset link.',
      };
    }

    // Generate reset token
    const resetToken = uuidv4();
    this.resetPasswordTokens.set(resetToken, {
      email,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });

    // In a real application, send an email with the reset link
    // await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'Password reset link sent to your email.',
      // In a development environment, you might want to return the token directly
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenData = this.resetPasswordTokens.get(token);
    if (!tokenData || tokenData.expires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: { email: tokenData.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and unlock account if it was locked
    user.password = hashedPassword;
    user.is_active = true;
    await this.userRepository.save(user);

    // Remove the used token
    this.resetPasswordTokens.delete(token);

    return { message: 'Password reset successful' };
  }

  async lockAccount(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = false;
    await this.userRepository.save(user);

    // Generate unlock token
    const unlockToken = uuidv4();
    this.accountUnlockTokens.set(unlockToken, {
      email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // In a real application, send an email with unlock link
    // await this.emailService.sendAccountUnlockEmail(email, unlockToken);

    return {
      message:
        'Account locked successfully. An unlock link has been sent to your email.',
      // In a development environment, you might want to return the token directly
      unlockToken,
    };
  }

  async unlockAccount(email: string, token: string) {
    const tokenData = this.accountUnlockTokens.get(token);
    if (
      !tokenData ||
      tokenData.expires < new Date() ||
      tokenData.email !== email
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = true;
    await this.userRepository.save(user);

    // Remove the used token
    this.accountUnlockTokens.delete(token);

    return { message: 'Account unlocked successfully' };
  }

  async verifyEmail(token: string) {
    const tokenData = this.emailVerificationTokens.get(token);
    if (!tokenData || tokenData.expires < new Date()) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    const user = await this.userRepository.findOne({
      where: { email: tokenData.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real application, you might have an email_verified field to set to true
    // user.emailVerified = true;
    await this.userRepository.save(user);

    // Remove the used token
    this.emailVerificationTokens.delete(token);

    return { message: 'Email verified successfully' };
  }

  private async handleFailedLogin(user: User) {
    // In a real application, you would:
    // 1. Increment a failed login attempts counter in the database
    // 2. Check if it exceeds a threshold (e.g., 5 attempts)
    // 3. If threshold exceeded, lock the account

    // For this example, we'll just simulate the logic
    const MAX_LOGIN_ATTEMPTS = 5;
    const failedAttempts = 1; // In a real app, you'd get this from the database

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      await this.lockAccount(user.email);
    }
  }
}
