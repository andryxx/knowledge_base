import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenVerificationService } from 'src/security/token.verification.service';
import { AuthGuard } from './auth.guard';
import { v7 as uuidv7 } from 'uuid';

describe('AuthGuard', () => {
  let mockSecurityService: DeepMocked<TokenVerificationService>;
  let authGuard: AuthGuard;

  beforeEach(async () => {
    mockSecurityService = createMock<TokenVerificationService>();
    authGuard = new AuthGuard(mockSecurityService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if token is provided and valid', async () => {
      const correctBearerToken =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MDE0MzY4My1lMjVjLTQxOTEtOGNiOC05YjY5N2ZhZWM1YzciLCJpYXQiOjE2OTYyMTU5MDAsImV4cCI6MTY5NjMwMjMwMH0.M0fbj4-xtas6kMuyUFY_w4-NeEibDLd_k_kUj3w73VM';

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: correctBearerToken,
        },
      });
      const userId = uuidv7();
      mockSecurityService.extractUserIdFromSessionToken.mockReturnValueOnce(
        userId,
      );

      expect(authGuard.canActivate(mockExecutionContext)).toBeTruthy();
    });

    it('should throw unauthorized if incorrect token is provided', async () => {
      const incorrectBearerToken =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MDE0MzY4My1lMjVjLTQxOTEtOGNiOC05YjY5N2ZhZWM1YzciLCJpYXQiOjE2OTYyMTU5MDAsImV4cCI6MTY5NjMwMjMwMH0.M0fbj4-xtas6kMuyUFY_w4-NeEibDLd_k_kUj3w73VM';

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: incorrectBearerToken,
        },
      });

      mockSecurityService.extractUserIdFromSessionToken.mockReturnValueOnce(
        null,
      );

      const canActivate = () => {
        authGuard.canActivate(mockExecutionContext);
      };

      expect(canActivate).toThrow(UnauthorizedException);
    });

    it('should throw unauthorized if authorization header is not provided', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();

      const canActivate = () => {
        authGuard.canActivate(mockExecutionContext);
      };

      expect(canActivate).toThrow(UnauthorizedException);
    });

    it('should throw unauthorized if authorization header is provided but with wrong type', async () => {
      const incorrectBearerToken =
        'Barer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MDE0MzY4My1lMjVjLTQxOTEtOGNiOC05YjY5N2ZhZWM1YzciLCJpYXQiOjE2OTYyMTU5MDAsImV4cCI6MTY5NjMwMjMwMH0.M0fbj4-xtas6kMuyUFY_w4-NeEibDLd_k_kUj3w73VM';

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: incorrectBearerToken,
        },
      });

      const canActivate = () => {
        authGuard.canActivate(mockExecutionContext);
      };

      expect(canActivate).toThrow(UnauthorizedException);
    });

    it('should throw unauthorized if authorization header is provided but without token', async () => {
      const incorrectBearerToken = 'Bearer';

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: incorrectBearerToken,
        },
      });

      const canActivate = () => {
        authGuard.canActivate(mockExecutionContext);
      };

      expect(canActivate).toThrow(UnauthorizedException);
    });
  });
});
