import {MigrationInterface, QueryRunner} from "typeorm";

export class CustomServerPrefixMigration1592393092043 implements MigrationInterface {
    name = 'CustomServerPrefixMigration1592393092043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole" FROM "partition"`, undefined);
        await queryRunner.query(`DROP TABLE "partition"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_partition" RENAME TO "partition"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partition" RENAME TO "temporary_partition"`, undefined);
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar)`, undefined);
        await queryRunner.query(`INSERT INTO "partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole" FROM "temporary_partition"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_partition"`, undefined);
    }

}
