import {MigrationInterface, QueryRunner} from "typeorm";
import { DelayedTask } from "../Material/DelayedTask";
import { DelayedTaskType } from "../Material/DelayedTaskType";

export class DelayedTaskMigration1592336279436 implements MigrationInterface {
    name = 'DelayedTaskMigration1592336279436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delayed_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar CHECK( type IN ('0') ) NOT NULL, "dueDate" datetime NOT NULL, "description" varchar)`, undefined);
        let date = new Date();
        date.setUTCHours(0,0,0,0);
        new DelayedTask(date, DelayedTaskType.birthday).save();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "delayed_task"`, undefined);
    }

}
