/*
  Warnings:

  - You are about to drop the column `catchall` on the `labs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "extras" TEXT DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "labs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_labs" ("always_on", "cloud_provider", "cluster_id", "cluster_name", "cluster_size", "company_id", "company_name", "completed_at", "created_at", "description", "end_date", "generated_name", "hold", "id", "lease_time", "notes", "openshift_version", "partner", "primary_email", "primary_first", "primary_last", "project_name", "region", "request_type", "secondary_email", "secondary_first", "secondary_last", "sponsor", "start_date", "state", "updated_at") SELECT "always_on", "cloud_provider", "cluster_id", "cluster_name", "cluster_size", "company_id", "company_name", "completed_at", "created_at", "description", "end_date", "generated_name", "hold", "id", "lease_time", "notes", "openshift_version", "partner", "primary_email", "primary_first", "primary_last", "project_name", "region", "request_type", "secondary_email", "secondary_first", "secondary_last", "sponsor", "start_date", "state", "updated_at" FROM "labs";
DROP TABLE "labs";
ALTER TABLE "new_labs" RENAME TO "labs";
CREATE UNIQUE INDEX "labs_generated_name_key" ON "labs"("generated_name");
CREATE INDEX "labs_state_idx" ON "labs"("state");
CREATE INDEX "labs_company_id_idx" ON "labs"("company_id");
CREATE INDEX "labs_start_date_idx" ON "labs"("start_date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
