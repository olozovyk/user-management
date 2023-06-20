import { MigrationInterface, QueryRunner } from 'typeorm';

export class Avatars1687187189706 implements MigrationInterface {
  name = 'Avatars1687187189706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "avatars" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "avatarUrl" character varying NOT NULL,
                "userId" uuid,
                CONSTRAINT "REL_b22f4499b339d4362f86c87dfb" UNIQUE ("userId"),
                CONSTRAINT "PK_224de7bae2014a1557cd9930ed7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "avatars"
            ADD CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "avatars" DROP CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe"
        `);
    await queryRunner.query(`
            DROP TABLE "avatars"
        `);
  }
}
