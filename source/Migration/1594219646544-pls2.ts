import {MigrationInterface, QueryRunner} from "typeorm";

export class pls21594219646544 implements MigrationInterface {
    name = 'pls21594219646544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "birthdayChannel" varchar, "birthdayRole" varchar, "xpIgnoreList" text, "customPrefix" varchar, "disabledCommandsList" text, "noMicList" text)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "vcxp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "birthdate" datetime, "botcoin" integer NOT NULL DEFAULT (1000), "partitionId" integer)`);
        await queryRunner.query(`CREATE TABLE "bug" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer)`);
        await queryRunner.query(`CREATE TABLE "delayed_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar CHECK( type IN ('0') ) NOT NULL, "dueDate" datetime NOT NULL, "description" varchar)`);
        await queryRunner.query(`CREATE TABLE "fidget_spinner" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "guildID" varchar NOT NULL DEFAULT (''), "color" varchar NOT NULL, "material" varchar NOT NULL, "highscore" integer NOT NULL, "spins" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "lyrics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "songtext" varchar NOT NULL, "artist" varchar NOT NULL, "partitionId" integer)`);
        await queryRunner.query(`CREATE TABLE "perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL, "partitionId" integer)`);
        await queryRunner.query(`CREATE TABLE "quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "partitionId" integer, "assignorId" integer)`);
        await queryRunner.query(`CREATE TABLE "quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("questId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "vcxp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "birthdate" datetime, "botcoin" integer NOT NULL DEFAULT (1000), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "vcxp", "permissionLevel", "birthdate", "botcoin", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "vcxp", "permissionLevel", "birthdate", "botcoin", "partitionId" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_bug" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer, CONSTRAINT "FK_c2661dfa88c944e994e0bed7930" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bug"("id", "createdAt", "description", "assignorId") SELECT "id", "createdAt", "description", "assignorId" FROM "bug"`);
        await queryRunner.query(`DROP TABLE "bug"`);
        await queryRunner.query(`ALTER TABLE "temporary_bug" RENAME TO "bug"`);
        await queryRunner.query(`CREATE TABLE "temporary_lyrics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "songtext" varchar NOT NULL, "artist" varchar NOT NULL, "partitionId" integer, CONSTRAINT "FK_c3bc88d35bb9001ad2e8a94ec45" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_lyrics"("id", "songtext", "artist", "partitionId") SELECT "id", "songtext", "artist", "partitionId" FROM "lyrics"`);
        await queryRunner.query(`DROP TABLE "lyrics"`);
        await queryRunner.query(`ALTER TABLE "temporary_lyrics" RENAME TO "lyrics"`);
        await queryRunner.query(`CREATE TABLE "temporary_perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL, "partitionId" integer, CONSTRAINT "FK_6656282f8cab0c318bef811f7e5" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_perk"("id", "reqLevel", "role", "partitionId") SELECT "id", "reqLevel", "role", "partitionId" FROM "perk"`);
        await queryRunner.query(`DROP TABLE "perk"`);
        await queryRunner.query(`ALTER TABLE "temporary_perk" RENAME TO "perk"`);
        await queryRunner.query(`CREATE TABLE "temporary_quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "partitionId" integer, "assignorId" integer, CONSTRAINT "FK_98ca8b30baaebc4c991572f6ebc" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_quest"("id", "createdAt", "description", "partitionId", "assignorId") SELECT "id", "createdAt", "description", "partitionId", "assignorId" FROM "quest"`);
        await queryRunner.query(`DROP TABLE "quest"`);
        await queryRunner.query(`ALTER TABLE "temporary_quest" RENAME TO "quest"`);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`);
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`);
        await queryRunner.query(`CREATE TABLE "temporary_quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_85601f92ea45dff00a6d9681247" FOREIGN KEY ("questId") REFERENCES "quest" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_605c8a0aed6d0e8ea6f4d52eb26" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("questId", "userId"))`);
        await queryRunner.query(`INSERT INTO "temporary_quest_assignees_user"("questId", "userId") SELECT "questId", "userId" FROM "quest_assignees_user"`);
        await queryRunner.query(`DROP TABLE "quest_assignees_user"`);
        await queryRunner.query(`ALTER TABLE "temporary_quest_assignees_user" RENAME TO "quest_assignees_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`);
        await queryRunner.query(`ALTER TABLE "quest_assignees_user" RENAME TO "temporary_quest_assignees_user"`);
        await queryRunner.query(`CREATE TABLE "quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("questId", "userId"))`);
        await queryRunner.query(`INSERT INTO "quest_assignees_user"("questId", "userId") SELECT "questId", "userId" FROM "temporary_quest_assignees_user"`);
        await queryRunner.query(`DROP TABLE "temporary_quest_assignees_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `);
        await queryRunner.query(`ALTER TABLE "quest" RENAME TO "temporary_quest"`);
        await queryRunner.query(`CREATE TABLE "quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "partitionId" integer, "assignorId" integer)`);
        await queryRunner.query(`INSERT INTO "quest"("id", "createdAt", "description", "partitionId", "assignorId") SELECT "id", "createdAt", "description", "partitionId", "assignorId" FROM "temporary_quest"`);
        await queryRunner.query(`DROP TABLE "temporary_quest"`);
        await queryRunner.query(`ALTER TABLE "perk" RENAME TO "temporary_perk"`);
        await queryRunner.query(`CREATE TABLE "perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL, "partitionId" integer)`);
        await queryRunner.query(`INSERT INTO "perk"("id", "reqLevel", "role", "partitionId") SELECT "id", "reqLevel", "role", "partitionId" FROM "temporary_perk"`);
        await queryRunner.query(`DROP TABLE "temporary_perk"`);
        await queryRunner.query(`ALTER TABLE "lyrics" RENAME TO "temporary_lyrics"`);
        await queryRunner.query(`CREATE TABLE "lyrics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "songtext" varchar NOT NULL, "artist" varchar NOT NULL, "partitionId" integer)`);
        await queryRunner.query(`INSERT INTO "lyrics"("id", "songtext", "artist", "partitionId") SELECT "id", "songtext", "artist", "partitionId" FROM "temporary_lyrics"`);
        await queryRunner.query(`DROP TABLE "temporary_lyrics"`);
        await queryRunner.query(`ALTER TABLE "bug" RENAME TO "temporary_bug"`);
        await queryRunner.query(`CREATE TABLE "bug" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer)`);
        await queryRunner.query(`INSERT INTO "bug"("id", "createdAt", "description", "assignorId") SELECT "id", "createdAt", "description", "assignorId" FROM "temporary_bug"`);
        await queryRunner.query(`DROP TABLE "temporary_bug"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "vcxp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "birthdate" datetime, "botcoin" integer NOT NULL DEFAULT (1000), "partitionId" integer)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "vcxp", "permissionLevel", "birthdate", "botcoin", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "vcxp", "permissionLevel", "birthdate", "botcoin", "partitionId" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`);
        await queryRunner.query(`DROP TABLE "quest_assignees_user"`);
        await queryRunner.query(`DROP TABLE "quest"`);
        await queryRunner.query(`DROP TABLE "perk"`);
        await queryRunner.query(`DROP TABLE "lyrics"`);
        await queryRunner.query(`DROP TABLE "fidget_spinner"`);
        await queryRunner.query(`DROP TABLE "delayed_task"`);
        await queryRunner.query(`DROP TABLE "bug"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "partition"`);
    }

}
