import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';

// Load environment variables
ConfigModule.forRoot();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'tiger',
  database: process.env.DB_NAME || 'zecurx',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Set to false when using migrations
  ssl: process.env.DATABASE_URL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});
