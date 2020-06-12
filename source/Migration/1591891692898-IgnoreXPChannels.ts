import {MigrationInterface, QueryRunner} from "typeorm";

export class IgnoreXPChannels1591891692898 implements MigrationInterface {
    name = 'IgnoreXPChannels1591891692898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_partition"("id", "guildID", "suggestChannel") SELECT "id", "guildID", "suggestChannel" FROM "partition"`, undefined);
        await queryRunner.query(`DROP TABLE "partition"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_partition" RENAME TO "partition"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partition" RENAME TO "temporary_partition"`, undefined);
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar)`, undefined);
        await queryRunner.query(`INSERT INTO "partition"("id", "guildID", "suggestChannel") SELECT "id", "guildID", "suggestChannel" FROM "temporary_partition"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_partition"`, undefined);
    }

}
