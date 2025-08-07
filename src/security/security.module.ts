import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenVerificationService } from './token.verification.service';
import { TokenCreationService } from './token.creation.service';
import { appConfig } from '../app.config';

@Global()
@Module({
  providers: [TokenVerificationService, TokenCreationService],
  imports: [
    JwtModule.register({
      secret: appConfig.JWT_SECRET,
      signOptions: { expiresIn: appConfig.JWT_TTL + 's' },
    }),
  ],
  exports: [TokenVerificationService, TokenCreationService],
})
export class SecurityModule {}
