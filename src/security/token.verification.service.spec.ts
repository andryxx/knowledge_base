import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenVerificationService } from './token.verification.service';
import { appConfig } from 'src/app.config';

describe('TokenVerificationService', () => {
  let tokenVerificationService: TokenVerificationService;
  let jwtService: DeepMocked<JwtService>;

  let sessionJwtSecret: string;

  const userId = 'user-id-1';
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGU5N2U3YS1iNWQ4LTQyZmItYmZlNy1iYWYzNDljYjdmZDYiLCJpYXQiOjE2OTU4ODY3MzEsImV4cCI6MTY5NTk3MzEzMX0._7CziqZUsvtB9PVYYu_w2d9KMJ7nH4zHgRi8QmKzF8U';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenVerificationService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();
    tokenVerificationService = module.get<TokenVerificationService>(
      TokenVerificationService,
    );
    jwtService = module.get(JwtService);
    sessionJwtSecret = appConfig.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(tokenVerificationService).toBeDefined();
  });

  describe('extractUserIdFromSessionToken', () => {
    it('should extract userId from a session JWT token', async () => {
      jwtService.verify.mockImplementation((token, options) => {
        expect(options.secret).toBe(sessionJwtSecret);
        expect(token).toBe(token);
        return { sub: userId };
      });

      const receivedUserId =
        tokenVerificationService.extractUserIdFromSessionToken(token);
      expect(receivedUserId).toBe(userId);
    });

    it('should return undefined in case token is not valid', async () => {
      const token = 'wrong token';

      jwtService.verify.mockReturnValueOnce(null);

      const userId =
        tokenVerificationService.extractUserIdFromSessionToken(token);

      expect(userId).toBeNull();
    });
  });
});
