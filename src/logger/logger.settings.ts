import { stdTimeFunctions } from 'pino';
import { appConfig } from '../app.config';

export default {
  imports: [],
  inject: [],
  useFactory: () => {
    const options = {
      pinoHttp: {
        level: appConfig.LOG_LEVEL,
        timestamp: stdTimeFunctions.isoTime,
        autoLogging: {
          ignore: (req) => {
            if (req.url.includes('healthcheck')) {
              return true;
            }
            return false;
          },
        },
      },
    };

    if (appConfig.PRETTY_LOGS) {
      options['pinoHttp']['transport'] = {
        target: 'pino-pretty',
      };
    }

    return options;
  },
};
