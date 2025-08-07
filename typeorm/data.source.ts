import { appConfig } from '../src/app.config';
import { DataSource, DataSourceOptions } from 'typeorm';

const isProduction = __filename.endsWith('.js');
const entityExtension = isProduction ? '.js' : '.ts';
const migrationExtension = isProduction ? '.js' : '.ts';
const basePath = isProduction ? 'dist' : 'src';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: appConfig.DB.HOST,
  port: appConfig.DB.PORT,
  username: appConfig.DB.USERNAME,
  password: appConfig.DB.PASSWORD,
  database: appConfig.DB.DATABASE,
  entities: [`${basePath}/**/*.entity${entityExtension}`],
  migrations: [`typeorm/migrations/*${migrationExtension}`],
  synchronize: false,
  logging: false,
};

export default new DataSource(dataSourceOptions);