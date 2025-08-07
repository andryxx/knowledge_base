import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/app.config';

@Injectable()
export class TokenCreationService {
  sessionJwtSecret: string;
  refreshJwtSecret: string;
  sessionTTL: number;
  refreshTTL: number;

  constructor(
    private readonly jwtService: JwtService,
  ) {
    this.initializeVariables();
  }

  private initializeVariables() {
    this.sessionJwtSecret = appConfig.JWT_SECRET;
    this.sessionTTL = appConfig.JWT_TTL;
  }

  createSessionToken(userId: string): string {
    const payload = { sub: userId };

    return this.jwtService.sign(payload, {
      secret: this.sessionJwtSecret,
      expiresIn: this.sessionTTL,
    });
  }
}
