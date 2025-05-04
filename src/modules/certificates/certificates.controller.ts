import { Controller, Get, Query, Res, NotFoundException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Response } from 'express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('generate')
  async generate(
    @Query('userId') userId: string,
    @Query('course') course: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.certificatesService.generateCertificate(
      userId,
      course,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${userId}-certificate.pdf"`,
    });

    res.send(pdfBuffer);
  }
  @Get('verify')
  async verify(@Query('code') certificateNumber: string) {
    const result =
      await this.certificatesService.verifyCertificate(certificateNumber);
    if (!result) {
      throw new NotFoundException('Certificate not found');
    }
    return result;
  }
}
