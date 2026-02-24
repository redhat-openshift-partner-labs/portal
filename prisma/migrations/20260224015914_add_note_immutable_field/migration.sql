-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "request_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER,
    "immutable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_notes" ("author_id", "content", "created_at", "id", "request_id") SELECT "author_id", "content", "created_at", "id", "request_id" FROM "notes";
DROP TABLE "notes";
ALTER TABLE "new_notes" RENAME TO "notes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
