import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoRoleMigration1597592997444 implements MigrationInterface {
    name = 'AutoRoleMigration1597592997444'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE "auto_role" ("id" SERIAL NOT NULL, "roleID" character varying NOT NULL, "partitionId" integer, CONSTRAINT "PK_441fce736ed015962a3a81183e1" PRIMARY KEY ("id"))');
      await queryRunner.query('ALTER TABLE "auto_role" ADD CONSTRAINT "FK_f0f0423985168faa12ab236f26a" FOREIGN KEY ("partitionId") REFERENCES "partition"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "auto_role" DROP CONSTRAINT "FK_f0f0423985168faa12ab236f26a"');
      await queryRunner.query('DROP TABLE "auto_role"');
    }
}
