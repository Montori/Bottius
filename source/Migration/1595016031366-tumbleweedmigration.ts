import {MigrationInterface, QueryRunner} from "typeorm";

export class tumbleweedmigration1595016031366 implements MigrationInterface {
    name = 'tumbleweedmigration1595016031366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar, "disabledCommandsList" text, "noMicList" text, "leaveChannel" varchar, "leaveMessage" varchar, "leaveMessageActive" boolean, "tumbleWeedChannels" text)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList", "leaveChannel", "leaveMessage", "leaveMessageActive") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList", "leaveChannel", "leaveMessage", "leaveMessageActive" FROM "partition"`, undefined);
        await queryRunner.query(`DROP TABLE "partition"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_partition" RENAME TO "partition"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partition" RENAME TO "temporary_partition"`, undefined);
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar, "disabledCommandsList" text, "noMicList" text, "leaveChannel" varchar, "leaveMessage" varchar, "leaveMessageActive" boolean)`, undefined);
        await queryRunner.query(`INSERT INTO "partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList", "leaveChannel", "leaveMessage", "leaveMessageActive") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList", "leaveChannel", "leaveMessage", "leaveMessageActive" FROM "temporary_partition"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_partition"`, undefined);
    }

}
