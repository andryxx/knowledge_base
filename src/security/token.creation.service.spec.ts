import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenCreationService } from './token.creation.service';
import { appConfig } from 'src/app.config';
import { v7 as uuidv7 } from 'uuid';

describe('TokenCreationService', () => {
  let tokenCreationService: TokenCreationService;
  let jwtService: DeepMocked<JwtService>;

  let sessionJwtSecret: string;
  let sessionTTL: number;

  const userId = uuidv7();
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGU5N2U3YS1iNWQ4LTQyZmItYmZlNy1iYWYzNDljYjdmZDYiLCJpYXQiOjE2OTU4ODY3MzEsImV4cCI6MTY5NTk3MzEzMX0._7CziqZUsvtB9PVYYu_w2d9KMJ7nH4zHgRi8QmKzF8U';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCreationService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();
    tokenCreationService =
      module.get<TokenCreationService>(TokenCreationService);
    jwtService = module.get(JwtService);
    sessionJwtSecret = appConfig.JWT_SECRET;
    sessionTTL = appConfig.JWT_TTL;
  });

  it('should be defined', () => {
    expect(tokenCreationService).toBeDefined();
  });

  describe('createSessionToken', () => {
    it('should create session JWT token for a userId', async () => {
      jwtService.sign.mockImplementation((payload, options) => {
        expect(options.secret).toBe(sessionJwtSecret);
        expect(options.expiresIn).toBe(sessionTTL);
        expect(payload['sub']).toBe(userId);
        return token;
      });

      const receivedToken = tokenCreationService.createSessionToken(userId);

      expect(receivedToken).toBe(token);
    });
  });
});
