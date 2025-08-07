import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/app.config';

@Injectable()
export class TokenVerificationService {
  sessionJwtSecret: string;

  constructor(private readonly jwtService: JwtService) {
    this.initializeVariables();
  }

  private initializeVariables() {
    this.sessionJwtSecret = appConfig.JWT_SECRET;
  }

  extractUserIdFromSessionToken(sessionToken: string): string {
    return this.extractUserIdFromToken(sessionToken, this.sessionJwtSecret);
  }

  private extractUserIdFromToken(token: string, secret: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret,
      });

      if (!payload) return null;

      return payload.sub;
    } catch {
      return null;
    }
  }
}
