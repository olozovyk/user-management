import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUser1685531456346 implements MigrationInterface {
  name = 'DeleteUser1685531456346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "deletedAt" TIMESTAMP
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "deletedAt"
        `);
  }
}
