import {MigrationInterface, QueryRunner} from "typeorm";

export class setLeaveMigration1593875352305 implements MigrationInterface {
    name = 'setLeaveMigration1593875352305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, "birthdate" datetime, "vcxp" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_delayed_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "dueDate" datetime NOT NULL, "description" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_delayed_task"("id", "type", "dueDate", "description") SELECT "id", "type", "dueDate", "description" FROM "delayed_task"`);
        await queryRunner.query(`DROP TABLE "delayed_task"`);
        await queryRunner.query(`ALTER TABLE "temporary_delayed_task" RENAME TO "delayed_task"`);
        await queryRunner.query(`CREATE TABLE "temporary_partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar, "disabledCommandsList" text, "noMicList" text, "leaveChannel" varchar, "leaveMessage" varchar, "leaveMessageActive" boolean)`);
        await queryRunner.query(`INSERT INTO "temporary_partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList" FROM "partition"`);
        await queryRunner.query(`DROP TABLE "partition"`);
        await queryRunner.query(`ALTER TABLE "temporary_partition" RENAME TO "partition"`);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, "birthdate" datetime, "vcxp" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_delayed_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar CHECK( type IN ('0') ) NOT NULL, "dueDate" datetime NOT NULL, "description" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_delayed_task"("id", "type", "dueDate", "description") SELECT "id", "type", "dueDate", "description" FROM "delayed_task"`);
        await queryRunner.query(`DROP TABLE "delayed_task"`);
        await queryRunner.query(`ALTER TABLE "temporary_delayed_task" RENAME TO "delayed_task"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delayed_task" RENAME TO "temporary_delayed_task"`);
        await queryRunner.query(`CREATE TABLE "delayed_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "dueDate" datetime NOT NULL, "description" varchar)`);
        await queryRunner.query(`INSERT INTO "delayed_task"("id", "type", "dueDate", "description") SELECT "id", "type", "dueDate", "description" FROM "temporary_delayed_task"`);
        await queryRunner.query(`DROP TABLE "temporary_delayed_task"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, "birthdate" datetime, "vcxp" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`ALTER TABLE "partition" RENAME TO "temporary_partition"`);
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "xpIgnoreList" text, "birthdayChannel" varchar, "birthdayRole" varchar, "customPrefix" varchar, "disabledCommandsList" text, "noMicList" text)`);
        await queryRunner.query(`INSERT INTO "partition"("id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList") SELECT "id", "guildID", "suggestChannel", "xpIgnoreList", "birthdayChannel", "birthdayRole", "customPrefix", "disabledCommandsList", "noMicList" FROM "temporary_partition"`);
        await queryRunner.query(`DROP TABLE "temporary_partition"`);
        await queryRunner.query(`ALTER TABLE "delayed_task" RENAME TO "temporary_delayed_task"`);
        await queryRunner.query(`CREATE TABLE "delayed_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "dueDate" datetime NOT NULL, "description" varchar)`);
        await queryRunner.query(`INSERT INTO "delayed_task"("id", "type", "dueDate", "description") SELECT "id", "type", "dueDate", "description" FROM "temporary_delayed_task"`);
        await queryRunner.query(`DROP TABLE "temporary_delayed_task"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, "birthdate" datetime, "vcxp" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId", "birthdate", "vcxp" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
