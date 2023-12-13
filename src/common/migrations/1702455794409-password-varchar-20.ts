import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordVarchar201702455794409 implements MigrationInterface {
  name = 'PasswordVarchar201702455794409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "password"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "password" character varying(20) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "password"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "password" character varying NOT NULL
        `);
  }
}
