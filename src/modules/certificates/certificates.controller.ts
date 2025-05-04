import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  NotFoundException,
  Param,
  Body,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Response } from 'express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate')
  async generate(
    @Body('name') name: string,
    @Body('courseName') courseName: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer =
        await this.certificatesService.generateCertificateByName(
          name,
          courseName,
        );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name.replace(
          /\s/g,
          '-',
        )}-certificate.pdf"`,
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new NotFoundException(
        error.message || 'Error generating certificate',
      );
    }
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

  @Get('download/:certNo')
  async download(@Param('certNo') certNo: string, @Res() res: Response) {
    const file = await this.certificatesService.getCertificateFile(certNo);
    if (!file) {
      throw new NotFoundException('Certificate not found');
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });

    res.send(file.buffer);
  }
}
