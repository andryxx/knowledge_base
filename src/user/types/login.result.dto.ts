import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class LoginResultDto {
  @ApiProperty({
    description: 'JWT token.',
  })
  sessionToken: string;

  constructor(partial: Partial<LoginResultDto>) {
    Object.assign(this, partial);
  }
}
