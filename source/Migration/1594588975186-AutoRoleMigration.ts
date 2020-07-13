import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoRoleMigration1594588975186 implements MigrationInterface {
    name = 'AutoRoleMigration1594588975186'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE "auto_role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "role" varchar NOT NULL, "partitionId" integer)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auto_role"`);
    }

}
