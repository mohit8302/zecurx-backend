import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1750959371042 implements MigrationInterface {
  name = 'InitialMigration1750959371042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'employee', 'student')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "fullName" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'student', "is_active" boolean NOT NULL DEFAULT true, "mobile" character varying(15), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "certificate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "certificateNumber" character varying NOT NULL, "courseName" character varying NOT NULL, "issuedAt" TIMESTAMP NOT NULL DEFAULT now(), "filePath" character varying, "pdfBuffer" bytea, "studentId" uuid, CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificate" ADD CONSTRAINT "FK_a5b1acee8501273d8c777df4bc1" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certificate" DROP CONSTRAINT "FK_a5b1acee8501273d8c777df4bc1"`,
    );
    await queryRunner.query(`DROP TABLE "certificate"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
