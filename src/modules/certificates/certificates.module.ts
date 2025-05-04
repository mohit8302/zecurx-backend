import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate } from '../../entities/certificate.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, User]), // ✅ Register Repositories
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService], // Optional: if used in other modules
})
export class CertificatesModule {}
