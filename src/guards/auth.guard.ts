import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenVerificationService } from 'src/security/token.verification.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenVerificationService: TokenVerificationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    const userId =
      this.tokenVerificationService.extractUserIdFromSessionToken(token);

    if (!userId) throw new UnauthorizedException();

    request['userId'] = userId;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) return;

    const [type, token] = authorizationHeader.split(' ');
    if (type !== 'Bearer') return;

    if (!token) return;

    return token;
  }
}
