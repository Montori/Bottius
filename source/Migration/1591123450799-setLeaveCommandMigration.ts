import {MigrationInterface, QueryRunner} from "typeorm";

export class setLeaveCommandMigration1591123450799 implements MigrationInterface {
    name = 'setLeaveCommandMigration1591123450799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar, "leaveChannel" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_partition"("id", "guildID", "suggestChannel") SELECT "id", "guildID", "suggestChannel" FROM "partition"`);
        await queryRunner.query(`DROP TABLE "partition"`);
        await queryRunner.query(`ALTER TABLE "temporary_partition" RENAME TO "partition"`);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`ALTER TABLE "partition" RENAME TO "temporary_partition"`);
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL, "suggestChannel" varchar)`);
        await queryRunner.query(`INSERT INTO "partition"("id", "guildID", "suggestChannel") SELECT "id", "guildID", "suggestChannel" FROM "temporary_partition"`);
        await queryRunner.query(`DROP TABLE "temporary_partition"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
