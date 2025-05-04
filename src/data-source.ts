import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Certificate } from './entities/certificate.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Certificate],
  migrations: ['src/migrations/*.ts'],
});
