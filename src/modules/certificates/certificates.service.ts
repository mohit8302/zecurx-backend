import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../../entities/certificate.entity';
import { User } from '../../entities/user.entity';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certRepo: Repository<Certificate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateCertificate(
    userId: string,
    courseName: string,
  ): Promise<Buffer> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const certificateNumber = `ZXC${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;

    const templateBytes = await readFile('src/templates/cert.pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const white = rgb(1, 1, 1);

    // ✨ Course Name in red box (centered)
    // Measure text width dynamically

    // Define font sizes
    // Constants
    const blue = rgb(0, 0.2, 0.6);

    const courseFontSize = 26;
    const nameFontSize = 20;
    const certNoFontSize = 10;

    const issueDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    // Draw Certificate Number (top-right corner, value only)
    const certTextWidth = helveticaBold.widthOfTextAtSize(
      certificateNumber,
      certNoFontSize,
    );
    page.drawText(certificateNumber, {
      x: width - certTextWidth - 30,
      y: height - 35,
      size: certNoFontSize,
      font: helveticaBold,
      color: white,
    });

    // Course name in white box (centered + blue + big)
    const courseWidth = helveticaBold.widthOfTextAtSize(
      courseName,
      courseFontSize,
    );
    page.drawText(courseName, {
      x: (width - courseWidth) / 2,
      y: height - 200,
      size: courseFontSize,
      font: helveticaBold,
      color: blue,
    });
    page.drawText(courseName, {
      x: (width - courseWidth) / 2,
      y: height - 430,
      size: courseFontSize,
      font: helveticaBold,
      color: white,
    });
    page.drawText(`: ${issueDate}`, {
      x: 152,
      y: 72,
      size: 9,
      font: helveticaBold,
      color: white,
    });

    // Student name (centered below white box)
    const nameWidth = helveticaBold.widthOfTextAtSize(
      user.fullName,
      nameFontSize,
    );
    page.drawText(user.fullName, {
      x: (width - nameWidth) / 2,
      y: height - 350,
      size: nameFontSize,
      font: helveticaBold,
      color: white,
    });

    const pdfBytes = await pdfDoc.save();
    const fileBuffer = Buffer.from(pdfBytes);

    const filename = `certificate-${user.fullName.replace(/\s/g, '-')}-${Date.now()}.pdf`;

    const cert = this.certRepo.create({
      certificateNumber,
      courseName,
      student: user,
      pdfBuffer: fileBuffer,
    });
    await this.certRepo.save(cert);

    return fileBuffer;
  }
  async verifyCertificate(certificateNumber: string) {
    const cert = await this.certRepo.findOne({
      where: { certificateNumber },
      relations: ['student'],
    });

    if (!cert) return null;

    return {
      studentName: cert.student.fullName,
      courseName: cert.courseName,
      issuedAt: cert.issuedAt,
      certificateNumber: cert.certificateNumber,
    };
  }
  async getCertificateFile(
    certificateNumber: string,
  ): Promise<{ buffer: Buffer; filename: string } | null> {
    const cert = await this.certRepo.findOne({
      where: { certificateNumber },
      relations: ['student'],
    });

    if (!cert || !cert.pdfBuffer) return null;

    return {
      buffer: cert.pdfBuffer,
      filename: `${cert.student.fullName.replace(/\s/g, '_')}-certificate.pdf`,
    };
  }
  async generateCertificateByName(
    name: string,
    courseName: string,
  ): Promise<Buffer> {
    const user = await this.userRepo.findOne({ where: { fullName: name } });
    if (!user) throw new Error('User not found');

    return this.generateCertificate(user.id, courseName);
  }
}
