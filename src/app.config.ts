import * as env from 'env-var';
import * as dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  APP_PORT: env.get('port').default('3000').asPortNumber(),
  DB: {
    HOST: env.get('dbHost').default('localhost').asString(),
    PORT: env.get('dbPort').default(5432).asPortNumber(),
    USERNAME: env.get('dbUsername').default('postgres').asString(),
    PASSWORD: env.get('dbPassword').default('postgres').asString(),
    DATABASE: env.get('dbDatabase').default('kb_db').asString(),
  },
  ENV: env.get('env').default('dev').asString(),
  JWT_SECRET: env.get('jwtSecret').default('some_secret').asString(),
  JWT_TTL: env.get('jwtTTL').default(60 * 60 * 24).asInt(),
  LOG_LEVEL: env.get('logLevel').default('debug').asString(),
  PRETTY_LOGS: env.get('prettyLogs').default('false').asBool(),
};
