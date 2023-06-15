import { MigrationInterface, QueryRunner } from 'typeorm';

export class Rating1686842304928 implements MigrationInterface {
  name = 'Rating1686842304928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "votes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "voteValue" integer,
                "userId" uuid NOT NULL,
                "targetUserId" uuid NOT NULL,
                CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "rating" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_5169384e31d0989699a318f3ca4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_ecb743e4f5f06bd76be74b80e05" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_ecb743e4f5f06bd76be74b80e05"
        `);
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_5169384e31d0989699a318f3ca4"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "rating"
        `);
    await queryRunner.query(`
            DROP TABLE "votes"
        `);
  }
}
