import {MigrationInterface, QueryRunner} from "typeorm";

export class LyricCommandMigration1589909914004 implements MigrationInterface {
    name = 'LyricCommandMigration1589909914004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lyrics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "songtext" varchar NOT NULL, "artist" varchar NOT NULL, "partitionId" integer, CONSTRAINT "FK_c3bc88d35bb9001ad2e8a94ec45" FOREIGN KEY ("partitionId") REFERENCES "partition" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "lyrics"`, undefined);
    }

}
