import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'tiger',
      database: process.env.DB_NAME || 'zecurx',
      autoLoadEntities: true,
      synchronize: true, // ❗ Set to false in production
    }),

    AuthModule,
    UsersModule,
    AttendanceModule,
    CoursesModule,
    EmployeesModule,
    PaymentsModule,
    CertificatesModule,
    WorkshopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
