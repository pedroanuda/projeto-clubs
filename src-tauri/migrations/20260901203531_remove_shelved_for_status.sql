ALTER TABLE Dogs ADD COLUMN status VARCHAR NOT NULL DEFAULT 'active';

UPDATE Dogs SET status = 'archived' WHERE shelved = 1;

ALTER TABLE Dogs DROP COLUMN shelved;
