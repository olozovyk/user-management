import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1712310065519 implements MigrationInterface {
  name = 'Init1712310065519';

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
            CREATE TABLE "tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(30) NOT NULL,
                "verifiedEmail" boolean NOT NULL DEFAULT false,
                "emailVerificationToken" uuid,
                "nickname" character varying(20) NOT NULL,
                "firstName" character varying(20) NOT NULL,
                "lastName" character varying(20) NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
                "rating" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_7ad75a333a7bcf6a2b5d3517ca8" UNIQUE ("emailVerificationToken"),
                CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
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
            ALTER TABLE "avatars"
            ADD CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tokens"
            ADD CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "tokens" DROP CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2"
        `);
    await queryRunner.query(`
            ALTER TABLE "avatars" DROP CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe"
        `);
    await queryRunner.query(`
            DROP TABLE "votes"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TABLE "tokens"
        `);
    await queryRunner.query(`
            DROP TABLE "avatars"
        `);
  }
}
