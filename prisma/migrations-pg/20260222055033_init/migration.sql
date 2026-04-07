-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "labs" (
    "id" SERIAL NOT NULL,
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
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "hold" BOOLEAN NOT NULL DEFAULT false,
    "request_id" TEXT,
    "extras" TEXT DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "full_name" TEXT,
    "email" TEXT NOT NULL,
    "picture" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "group" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cloudcosts" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cloudcosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "curated" BOOLEAN NOT NULL DEFAULT false,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "lab_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "note" TEXT NOT NULL,
    "immutable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" SERIAL NOT NULL,
    "generated_name" TEXT,
    "access_time" TIMESTAMP(3),
    "login_name" TEXT,
    "login_type" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regexts" (
    "id" SERIAL NOT NULL,
    "lab_id" INTEGER,
    "extension" TEXT,
    "current_user" TEXT,
    "date" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "regexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openshift_version_mappings" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "location" TEXT,
    "rosa" BOOLEAN DEFAULT false,
    "aro" BOOLEAN DEFAULT false,
    "gro" BOOLEAN DEFAULT false,
    "roks" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "openshift_version_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denial_notes" (
    "id" SERIAL NOT NULL,
    "lab_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "denial_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "labs_generated_name_key" ON "labs"("generated_name");

-- CreateIndex
CREATE INDEX "labs_state_idx" ON "labs"("state");

-- CreateIndex
CREATE INDEX "labs_company_id_idx" ON "labs"("company_id");

-- CreateIndex
CREATE INDEX "labs_start_date_idx" ON "labs"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_name_key" ON "companies"("company_name");

-- CreateIndex
CREATE INDEX "notes_lab_id_idx" ON "notes"("lab_id");

-- CreateIndex
CREATE INDEX "audits_generated_name_idx" ON "audits"("generated_name");

-- CreateIndex
CREATE INDEX "regexts_lab_id_idx" ON "regexts"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "openshift_version_mappings_name_key" ON "openshift_version_mappings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "denial_notes_lab_id_key" ON "denial_notes"("lab_id");

-- AddForeignKey
ALTER TABLE "labs" ADD CONSTRAINT "labs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_generated_name_fkey" FOREIGN KEY ("generated_name") REFERENCES "labs"("generated_name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regexts" ADD CONSTRAINT "regexts_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denial_notes" ADD CONSTRAINT "denial_notes_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

