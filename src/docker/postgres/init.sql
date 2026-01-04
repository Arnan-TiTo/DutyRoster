CREATE SCHEMA IF NOT EXISTS duty;

-- Optional but helpful for UUID and exclusion constraints
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
