import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  certificateNumber: string;

  @Column()
  courseName: string;

  @CreateDateColumn()
  issuedAt: Date;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'bytea', nullable: true })
  pdfBuffer: Buffer;

  @ManyToOne(() => User, (user) => user.certificates)
  student: User;
}
