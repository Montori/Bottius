import {MigrationInterface, QueryRunner} from "typeorm";

export class PlsForTheLoveOfGodWork1592424536037 implements MigrationInterface {
    name = 'PlsForTheLoveOfGodWork1592424536037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar, "disabledCommandsList" text)`);
        await queryRunner.query(`INSERT INTO "temporary_partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix" FROM "partition"`);
        await queryRunner.query(`DROP TABLE "partition"`);
        await queryRunner.query(`ALTER TABLE "temporary_partition" RENAME TO "partition"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partition" RENAME TO "temporary_partition"`);
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar)`);
        await queryRunner.query(`INSERT INTO "partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix" FROM "temporary_partition"`);
        await queryRunner.query(`DROP TABLE "temporary_partition"`);
    }

}
