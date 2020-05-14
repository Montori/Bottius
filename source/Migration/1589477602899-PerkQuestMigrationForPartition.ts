import {MigrationInterface, QueryRunner} from "typeorm";

export class PerkQuestMigrationForPartition1589477602899 implements MigrationInterface {
    name = 'PerkQuestMigrationForPartition1589477602899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL, "partitionId" integer)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_perk"("id", "reqLevel", "role") SELECT "id", "reqLevel", "role" FROM "perk"`, undefined);
        await queryRunner.query(`DROP TABLE "perk"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_perk" RENAME TO "perk"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer, "partitionId" integer, CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_quest"("id", "createdAt", "description", "assignorId") SELECT "id", "createdAt", "description", "assignorId" FROM "quest"`, undefined);
        await queryRunner.query(`DROP TABLE "quest"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_quest" RENAME TO "quest"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL, "partitionId" integer, CONSTRAINT "FK_6656282f8cab0c318bef811f7e5" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_perk"("id", "reqLevel", "role", "partitionId") SELECT "id", "reqLevel", "role", "partitionId" FROM "perk"`, undefined);
        await queryRunner.query(`DROP TABLE "perk"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_perk" RENAME TO "perk"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer, "partitionId" integer, CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_98ca8b30baaebc4c991572f6ebc" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_quest"("id", "createdAt", "description", "assignorId", "partitionId") SELECT "id", "createdAt", "description", "assignorId", "partitionId" FROM "quest"`, undefined);
        await queryRunner.query(`DROP TABLE "quest"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_quest" RENAME TO "quest"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quest" RENAME TO "temporary_quest"`, undefined);
        await queryRunner.query(`CREATE TABLE "quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer, "partitionId" integer, CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "quest"("id", "createdAt", "description", "assignorId", "partitionId") SELECT "id", "createdAt", "description", "assignorId", "partitionId" FROM "temporary_quest"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_quest"`, undefined);
        await queryRunner.query(`ALTER TABLE "perk" RENAME TO "temporary_perk"`, undefined);
        await queryRunner.query(`CREATE TABLE "perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL, "partitionId" integer)`, undefined);
        await queryRunner.query(`INSERT INTO "perk"("id", "reqLevel", "role", "partitionId") SELECT "id", "reqLevel", "role", "partitionId" FROM "temporary_perk"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_perk"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "quest" RENAME TO "temporary_quest"`, undefined);
        await queryRunner.query(`CREATE TABLE "quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer, CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "quest"("id", "createdAt", "description", "assignorId") SELECT "id", "createdAt", "description", "assignorId" FROM "temporary_quest"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_quest"`, undefined);
        await queryRunner.query(`ALTER TABLE "perk" RENAME TO "temporary_perk"`, undefined);
        await queryRunner.query(`CREATE TABLE "perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "perk"("id", "reqLevel", "role") SELECT "id", "reqLevel", "role" FROM "temporary_perk"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_perk"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), "permissionLevel" varchar CHECK( permissionLevel IN ('0','1','2','3','4','5') ) NOT NULL DEFAULT (0), "partitionId" integer, CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId") SELECT "id", "discordID", "addedDate", "lastMessage", "totalMessages", "totalPings", "headPats", "xp", "permissionLevel", "partitionId" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
    }

}
