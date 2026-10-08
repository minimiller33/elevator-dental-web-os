CREATE TABLE IF NOT EXISTS answers (
 item_id TEXT PRIMARY KEY,
 answer TEXT NOT NULL DEFAULT '',
 links TEXT NOT NULL DEFAULT '[]',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','complete','not_applicable')),
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS files (
 id TEXT PRIMARY KEY,
 item_id TEXT NOT NULL,
 name TEXT NOT NULL,
 size INTEGER NOT NULL,
 mime TEXT NOT NULL,
 object_key TEXT NOT NULL UNIQUE,
 upload_id TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('uploading','ready','removed','failed')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS files_item ON files(item_id, state);
CREATE TABLE IF NOT EXISTS parts (
 file_id TEXT NOT NULL REFERENCES files(id),
 part_number INTEGER NOT NULL,
 etag TEXT NOT NULL,
 size INTEGER NOT NULL,
 PRIMARY KEY(file_id,part_number)
);
CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY,
 created_at TEXT NOT NULL,
 completed INTEGER NOT NULL,
 total INTEGER NOT NULL,
 snapshot TEXT NOT NULL
);
