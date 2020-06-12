import {MigrationInterface, QueryRunner} from "typeorm";

export class BugMigration1591546313958 implements MigrationInterface {
    name = 'BugMigration1591546313958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "bug" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "partitionId" integer, "assignorId" integer)`);
        await queryRunner.query(`CREATE TABLE "bug_assignees_user" ("bugId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("bugId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b0bf6bdff1643cd39e140cc7fa" ON "bug_assignees_user" ("bugId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4be8b72846cc1cd929f7e8964" ON "bug_assignees_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_bug" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "partitionId" integer, "assignorId" integer, CONSTRAINT "FK_301e48d71d8bac8f5598f3a6a24" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_c2661dfa88c944e994e0bed7930" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bug"("id", "createdAt", "description", "partitionId", "assignorId") SELECT "id", "createdAt", "description", "partitionId", "assignorId" FROM "bug"`);
        await queryRunner.query(`DROP TABLE "bug"`);
        await queryRunner.query(`ALTER TABLE "temporary_bug" RENAME TO "bug"`);
        await queryRunner.query(`DROP INDEX "IDX_b0bf6bdff1643cd39e140cc7fa"`);
        await queryRunner.query(`DROP INDEX "IDX_a4be8b72846cc1cd929f7e8964"`);
        await queryRunner.query(`CREATE TABLE "temporary_bug_assignees_user" ("bugId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_b0bf6bdff1643cd39e140cc7fa0" FOREIGN KEY ("bugId") REFERENCES "bug" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a4be8b72846cc1cd929f7e89646" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("bugId", "userId"))`);
        await queryRunner.query(`INSERT INTO "temporary_bug_assignees_user"("bugId", "userId") SELECT "bugId", "userId" FROM "bug_assignees_user"`);
        await queryRunner.query(`DROP TABLE "bug_assignees_user"`);
        await queryRunner.query(`ALTER TABLE "temporary_bug_assignees_user" RENAME TO "bug_assignees_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_b0bf6bdff1643cd39e140cc7fa" ON "bug_assignees_user" ("bugId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4be8b72846cc1cd929f7e8964" ON "bug_assignees_user" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_a4be8b72846cc1cd929f7e8964"`);
        await queryRunner.query(`DROP INDEX "IDX_b0bf6bdff1643cd39e140cc7fa"`);
        await queryRunner.query(`ALTER TABLE "bug_assignees_user" RENAME TO "temporary_bug_assignees_user"`);
        await queryRunner.query(`CREATE TABLE "bug_assignees_user" ("bugId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("bugId", "userId"))`);
        await queryRunner.query(`INSERT INTO "bug_assignees_user"("bugId", "userId") SELECT "bugId", "userId" FROM "temporary_bug_assignees_user"`);
        await queryRunner.query(`DROP TABLE "temporary_bug_assignees_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_a4be8b72846cc1cd929f7e8964" ON "bug_assignees_user" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0bf6bdff1643cd39e140cc7fa" ON "bug_assignees_user" ("bugId") `);
        await queryRunner.query(`ALTER TABLE "bug" RENAME TO "temporary_bug"`);
        await queryRunner.query(`CREATE TABLE "bug" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "partitionId" integer, "assignorId" integer)`);
        await queryRunner.query(`INSERT INTO "bug"("id", "createdAt", "description", "partitionId", "assignorId") SELECT "id", "createdAt", "description", "partitionId", "assignorId" FROM "temporary_bug"`);
        await queryRunner.query(`DROP TABLE "temporary_bug"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`DROP INDEX "IDX_a4be8b72846cc1cd929f7e8964"`);
        await queryRunner.query(`DROP INDEX "IDX_b0bf6bdff1643cd39e140cc7fa"`);
        await queryRunner.query(`DROP TABLE "bug_assignees_user"`);
        await queryRunner.query(`DROP TABLE "bug"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
