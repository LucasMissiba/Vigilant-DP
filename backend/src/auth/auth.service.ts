import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica 2FA se habilitado
    if (user.twoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        return { requiresTwoFactor: true, userId: user.id };
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: loginDto.twoFactorCode,
      });

      if (!verified) {
        throw new UnauthorizedException('Código 2FA inválido');
      }
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async enableTwoFactor(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `VIGILANT (${process.env.TWO_FACTOR_APP_NAME || 'VIGILANT'})`,
    });

    await this.usersService.update(userId, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false, // Ativa após primeira verificação
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyTwoFactor(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);
    if (!user.twoFactorSecret) {
      throw new UnauthorizedException('2FA não configurado');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      await this.usersService.update(userId, {
        twoFactorEnabled: true,
      });
      return { verified: true };
    }

    throw new UnauthorizedException('Código 2FA inválido');
  }
}



