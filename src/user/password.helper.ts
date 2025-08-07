import { CheckPasswordConfig } from './types/check.password.config';
import { pbkdf2Sync, randomBytes } from 'crypto';

export class PasswordHelper {
  static generateSaltAndHash(password: string) {
    const salt = this.generateSalt();
    const hash = this.calculatePasswordHash(password, salt);
    return { salt, hash };
  }

  static checkPassword(config: CheckPasswordConfig): boolean {
    const { password, salt, hash } = config;
    const calculatedHash = this.calculatePasswordHash(password, salt);
    return calculatedHash === hash;
  }

  private static generateSalt(): string {
    return randomBytes(64).toString('hex');
  }

  private static calculatePasswordHash(password: string, salt: string): string {
    return pbkdf2Sync(
      password,
      Buffer.from(salt, 'hex'),
      10000,
      64,
      'sha512',
    ).toString('hex');
  }
}
