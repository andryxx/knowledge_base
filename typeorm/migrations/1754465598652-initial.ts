import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1754465598652 implements MigrationInterface {
    name = 'Initial1754465598652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."articles_access_enum" AS ENUM('PUBLIC', 'RESTRICTED', 'PRIVATE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "header" character varying NOT NULL, "content" character varying, "tags" text[], "access" "public"."articles_access_enum" NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "name" character varying NOT NULL, "email" character varying NOT NULL, "hash" character varying NOT NULL, "salt" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        
        const fkExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_87bb15395540ae06337a486a77a' 
            AND table_name = 'articles'
        `);
        if (fkExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_87bb15395540ae06337a486a77a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        
        const userExists = await queryRunner.query(`
            SELECT 1 FROM "users" WHERE "email" = 'admin@admin.com'
        `);
        if (userExists.length === 0) {
            await queryRunner.query(`
                INSERT INTO "users" ("id", "created_at", "updated_at", "email", "active", "name", "hash", "salt")
                VALUES (
                    '550e8400-e29b-41d4-a716-446655440000',
                    NOW(),
                    NOW(),
                    'admin@admin.com',
                    true,
                    'Default Admin',
                    'fd97e310afab843fc262f7e77c2765a0acc185ec34b54ea139a8ae5dc6b79ec0c36179903cfb40cbf9ee76cb0aa2107edd9b24e4ae4159ca9b481364dfa8b8c6',
                    'd60258f7debd9faddb5ce228e61307f587d45e384ea6b6e28ff81a1ff5d8728f7e5fd9118b52ae5c9c1972c4999f432f2fec1ada98a07971c628299cf5508ae0'
                );
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_87bb15395540ae06337a486a77a"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TYPE "public"."articles_access_enum"`);
    }

}
