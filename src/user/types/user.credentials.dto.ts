export class UserCredentialsDto {
  userId: string;
  hash: string;
  salt: string;
  active: boolean;

  constructor(partial: Partial<UserCredentialsDto>) {
    Object.assign(this, partial);
  }
}
