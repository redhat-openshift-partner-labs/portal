/*
  Warnings:

  - You are about to drop the `costs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `labs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `labs` table. All the data in the column will be lost.
  - You are about to drop the column `author_id` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `request_id` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `company_name` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cloud_provider` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cluster_id` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cluster_name` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cluster_size` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_name` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generated_name` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lease_time` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openshift_version` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_email` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_first` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_last` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_name` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `request_type` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary_email` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary_first` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary_last` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sponsor` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `labs` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `labs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `lab_id` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "costs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "requests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "sessions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "cloudcosts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audits" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "generated_name" TEXT,
    "access_time" DATETIME,
    "login_name" TEXT,
    "login_type" TEXT,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    CONSTRAINT "audits_generated_name_fkey" FOREIGN KEY ("generated_name") REFERENCES "labs" ("generated_name") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "regexts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lab_id" INTEGER,
    "extension" TEXT,
    "current_user" TEXT,
    "date" DATETIME,
    "status" TEXT,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    CONSTRAINT "regexts_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "openshift_version_mappings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "location" TEXT,
    "rosa" BOOLEAN DEFAULT false,
    "aro" BOOLEAN DEFAULT false,
    "gro" BOOLEAN DEFAULT false,
    "roks" BOOLEAN DEFAULT false,
    "created_at" DATETIME,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "denial_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lab_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "denial_notes_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_companies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "company_name" TEXT NOT NULL,
    "curated" BOOLEAN NOT NULL DEFAULT false,
    "logo_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_companies" ("created_at", "id", "logo_url", "updated_at") SELECT "created_at", "id", "logo_url", "updated_at" FROM "companies";
DROP TABLE "companies";
ALTER TABLE "new_companies" RENAME TO "companies";
CREATE UNIQUE INDEX "companies_company_name_key" ON "companies"("company_name");
CREATE TABLE "new_labs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cluster_id" TEXT NOT NULL,
    "generated_name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cluster_name" TEXT NOT NULL,
    "openshift_version" TEXT NOT NULL,
    "cluster_size" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_id" INTEGER,
    "request_type" TEXT NOT NULL,
    "partner" BOOLEAN NOT NULL DEFAULT false,
    "sponsor" TEXT NOT NULL,
    "cloud_provider" TEXT NOT NULL,
    "primary_first" TEXT NOT NULL,
    "primary_last" TEXT NOT NULL,
    "primary_email" TEXT NOT NULL,
    "secondary_first" TEXT NOT NULL,
    "secondary_last" TEXT NOT NULL,
    "secondary_email" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "always_on" BOOLEAN NOT NULL DEFAULT false,
    "project_name" TEXT NOT NULL,
    "lease_time" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "completed_at" DATETIME,
    "hold" BOOLEAN NOT NULL DEFAULT false,
    "catchall" TEXT DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "labs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_labs" ("completed_at", "created_at", "description", "id", "updated_at") SELECT "completed_at", "created_at", "description", "id", "updated_at" FROM "labs";
DROP TABLE "labs";
ALTER TABLE "new_labs" RENAME TO "labs";
CREATE UNIQUE INDEX "labs_generated_name_key" ON "labs"("generated_name");
CREATE INDEX "labs_state_idx" ON "labs"("state");
CREATE INDEX "labs_company_id_idx" ON "labs"("company_id");
CREATE INDEX "labs_start_date_idx" ON "labs"("start_date");
CREATE TABLE "new_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lab_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "note" TEXT NOT NULL,
    "immutable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notes_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notes" ("created_at", "id", "immutable") SELECT "created_at", "id", "immutable" FROM "notes";
DROP TABLE "notes";
ALTER TABLE "new_notes" RENAME TO "notes";
CREATE INDEX "notes_lab_id_idx" ON "notes"("lab_id");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "full_name" TEXT,
    "email" TEXT NOT NULL,
    "picture" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "group" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "email", "group", "id", "picture", "updated_at") SELECT "created_at", "email", "group", "id", "picture", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "audits_generated_name_idx" ON "audits"("generated_name");

-- CreateIndex
CREATE INDEX "regexts_lab_id_idx" ON "regexts"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "openshift_version_mappings_name_key" ON "openshift_version_mappings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "denial_notes_lab_id_key" ON "denial_notes"("lab_id");
