import {MigrationInterface, QueryRunner} from "typeorm";

export class PartitionMigration1589475807154 implements MigrationInterface {
    name = 'PartitionMigration1589475807154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partition" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildID" varchar NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "UQ_43c0d04d88a2beec7ed8431d7f1" UNIQUE ("discordID"))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "UQ_43c0d04d88a2beec7ed8431d7f1" UNIQUE ("discordID"))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "UQ_43c0d04d88a2beec7ed8431d7f1" UNIQUE ("discordID"))`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "UQ_43c0d04d88a2beec7ed8431d7f1" UNIQUE ("discordID"))`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), CONSTRAINT "UQ_43c0d04d88a2beec7ed8431d7f1" UNIQUE ("discordID"))`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "partition"`, undefined);
    }

}
