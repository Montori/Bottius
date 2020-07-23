import {MigrationInterface, QueryRunner} from "typeorm";
import { DelayedTask } from "../Entities/Persistent/DelayedTask";
import { DelayedTaskType } from "../Entities/Transient/DelayedTaskType";

export class Baseline1595524133622 implements MigrationInterface {
    name = 'Baseline1595524133622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partition" ("id" SERIAL NOT NULL, "guildID" character varying NOT NULL, "suggestChannel" character varying, "birthdayChannel" character varying, "birthdayRole" character varying, "xpIgnoreList" text array, "customPrefix" character varying, "disabledCommandsList" text array, "noMicList" text array, "tumbleWeedChannels" text array, "leaveChannel" character varying, "leaveMessage" character varying, "leaveMessageActive" boolean, CONSTRAINT "PK_3fa6dcf0fc76a1b6709aa9d1623" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "discordID" character varying NOT NULL DEFAULT '', "addedDate" TIMESTAMP NOT NULL, "lastMessage" TIMESTAMP NOT NULL, "totalMessages" integer NOT NULL DEFAULT 0, "totalPings" integer NOT NULL DEFAULT 0, "headPats" integer NOT NULL DEFAULT 0, "xp" integer NOT NULL DEFAULT 0, "vcxp" integer NOT NULL DEFAULT 0, "permissionLevel" integer NOT NULL DEFAULT 0, "birthdate" TIMESTAMP, "partitionId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "bug" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL, "description" character varying NOT NULL, "assignorId" integer, CONSTRAINT "PK_9e7f67c6911b62a81ac3e336d4b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "delayed_task" ("id" SERIAL NOT NULL, "type" integer NOT NULL, "dueDate" TIMESTAMP NOT NULL, "description" character varying, CONSTRAINT "PK_e00d2d9b3958f5f4dcc572539ab" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "lyrics" ("id" SERIAL NOT NULL, "songtext" character varying NOT NULL, "artist" character varying NOT NULL, "partitionId" integer, CONSTRAINT "PK_f7c5de22ef94f309591c5554f0f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "perk" ("id" SERIAL NOT NULL, "reqLevel" integer NOT NULL, "role" character varying NOT NULL, "partitionId" integer, CONSTRAINT "PK_4311750adf0a905f585e75176e4" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "quest" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL, "description" character varying NOT NULL, "partitionId" integer, "assignorId" integer, CONSTRAINT "PK_0d6873502a58302d2ae0b82631c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "quest_assignees_user" ("questId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_972c0279f450aaad6272bc4f3fc" PRIMARY KEY ("questId", "userId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_85601f92ea45dff00a6d968124" ON "quest_assignees_user" ("questId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2" ON "quest_assignees_user" ("userId") `, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_f0561d68a032ee2b89f6785221f" FOREIGN KEY ("partitionId") REFERENCES "partition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "bug" ADD CONSTRAINT "FK_c2661dfa88c944e994e0bed7930" FOREIGN KEY ("assignorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "lyrics" ADD CONSTRAINT "FK_c3bc88d35bb9001ad2e8a94ec45" FOREIGN KEY ("partitionId") REFERENCES "partition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "perk" ADD CONSTRAINT "FK_6656282f8cab0c318bef811f7e5" FOREIGN KEY ("partitionId") REFERENCES "partition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "quest" ADD CONSTRAINT "FK_98ca8b30baaebc4c991572f6ebc" FOREIGN KEY ("partitionId") REFERENCES "partition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "quest" ADD CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892" FOREIGN KEY ("assignorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "quest_assignees_user" ADD CONSTRAINT "FK_85601f92ea45dff00a6d9681247" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "quest_assignees_user" ADD CONSTRAINT "FK_605c8a0aed6d0e8ea6f4d52eb26" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
   
        let date = new Date();
        date.setUTCHours(0,0,0,0);
        new DelayedTask(date, DelayedTaskType.birthday).save();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quest_assignees_user" DROP CONSTRAINT "FK_605c8a0aed6d0e8ea6f4d52eb26"`, undefined);
        await queryRunner.query(`ALTER TABLE "quest_assignees_user" DROP CONSTRAINT "FK_85601f92ea45dff00a6d9681247"`, undefined);
        await queryRunner.query(`ALTER TABLE "quest" DROP CONSTRAINT "FK_93ec7d003a00d4f1feb4eb8e892"`, undefined);
        await queryRunner.query(`ALTER TABLE "quest" DROP CONSTRAINT "FK_98ca8b30baaebc4c991572f6ebc"`, undefined);
        await queryRunner.query(`ALTER TABLE "perk" DROP CONSTRAINT "FK_6656282f8cab0c318bef811f7e5"`, undefined);
        await queryRunner.query(`ALTER TABLE "lyrics" DROP CONSTRAINT "FK_c3bc88d35bb9001ad2e8a94ec45"`, undefined);
        await queryRunner.query(`ALTER TABLE "bug" DROP CONSTRAINT "FK_c2661dfa88c944e994e0bed7930"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f0561d68a032ee2b89f6785221f"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_605c8a0aed6d0e8ea6f4d52eb2"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_85601f92ea45dff00a6d968124"`, undefined);
        await queryRunner.query(`DROP TABLE "quest_assignees_user"`, undefined);
        await queryRunner.query(`DROP TABLE "quest"`, undefined);
        await queryRunner.query(`DROP TABLE "perk"`, undefined);
        await queryRunner.query(`DROP TABLE "lyrics"`, undefined);
        await queryRunner.query(`DROP TABLE "delayed_task"`, undefined);
        await queryRunner.query(`DROP TABLE "bug"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TABLE "partition"`, undefined);
    }

}
