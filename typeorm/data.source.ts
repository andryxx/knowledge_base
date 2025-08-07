import { DataSource, DataSourceOptions } from 'typeorm';

const isProduction = __filename.endsWith('.js');
const appConfigPath = isProduction ? '../src/app.config' : '../src/app.config';
const { appConfig } = require(appConfigPath);
const entityExtension = isProduction ? '.js' : '.ts';
const migrationExtension = isProduction ? '.js' : '.ts';
const basePath = isProduction ? 'dist' : 'src';
const migrationPath = isProduction ? 'dist/typeorm/migrations' : 'typeorm/migrations';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: appConfig.DB.HOST,
  port: appConfig.DB.PORT,
  username: appConfig.DB.USERNAME,
  password: appConfig.DB.PASSWORD,
  database: appConfig.DB.DATABASE,
  entities: [`${basePath}/**/*.entity${entityExtension}`],
  migrations: [`${migrationPath}/*${migrationExtension}`],
  synchronize: false,
  logging: false,
};

export default new DataSource(dataSourceOptions);