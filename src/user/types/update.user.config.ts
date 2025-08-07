export interface UpdateUserConfig {
  userId: string;
  name?: string;
  hash?: string;
  salt?: string;
  active?: boolean;
}