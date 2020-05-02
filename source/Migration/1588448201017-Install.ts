import {MigrationInterface, QueryRunner} from "typeorm";

export class Install1588448201017 implements MigrationInterface {
    name = 'Install1588448201017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "perk" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "reqLevel" integer NOT NULL, "role" varchar NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "discordID" varchar NOT NULL DEFAULT (''), "addedDate" datetime NOT NULL, "lastMessage" datetime NOT NULL, "totalMessages" integer NOT NULL DEFAULT (0), "totalPings" integer NOT NULL DEFAULT (0), "headPats" integer NOT NULL DEFAULT (0), "xp" integer NOT NULL DEFAULT (0), CONSTRAINT "UQ_43c0d04d88a2beec7ed8431d7f1" UNIQUE ("discordID"))`, undefined);
        await queryRunner.query(`CREATE TABLE "quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer)`, undefined);
        await queryRunner.query(`CREATE TABLE "quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("questId", "userId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer, CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_quest"("id", "createdAt", "description", "assignorId") SELECT "id", "createdAt", "description", "assignorId" FROM "quest"`, undefined);
        await queryRunner.query(`DROP TABLE "quest"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_quest" RENAME TO "quest"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_85601f92ea45dff00a6d9681247" FOREIGN KEY ("questId") REFERENCES "quest" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_605c8a0aed6d0e8ea6f4d52eb26" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("questId", "userId"))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_quest_assignees_user"("questId", "userId") SELECT "questId", "userId" FROM "quest_assignees_user"`, undefined);
        await queryRunner.query(`DROP TABLE "quest_assignees_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_quest_assignees_user" RENAME TO "quest_assignees_user"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`, undefined);
        await queryRunner.query(`ALTER TABLE "quest_assignees_user" RENAME TO "temporary_quest_assignees_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("questId", "userId"))`, undefined);
        await queryRunner.query(`INSERT INTO "quest_assignees_user"("questId", "userId") SELECT "questId", "userId" FROM "temporary_quest_assignees_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_quest_assignees_user"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `, undefined);
        await queryRunner.query(`ALTER TABLE "quest" RENAME TO "temporary_quest"`, undefined);
        await queryRunner.query(`CREATE TABLE "quest" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL, "description" varchar NOT NULL, "assignorId" integer)`, undefined);
        await queryRunner.query(`INSERT INTO "quest"("id", "createdAt", "description", "assignorId") SELECT "id", "createdAt", "description", "assignorId" FROM "temporary_quest"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_quest"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`, undefined);
        await queryRunner.query(`DROP TABLE "quest_assignees_user"`, undefined);
        await queryRunner.query(`DROP TABLE "quest"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TABLE "perk"`, undefined);
    }

}
