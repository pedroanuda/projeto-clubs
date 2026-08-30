CREATE TABLE Owners_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone_numbers TEXT,
    email TEXT,
    addresses TEXT,
    about TEXT,
    register_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Owners_new (
    id,
    name,
    phone_numbers,
    email,
    addresses,
    about
)
SELECT
    id,
    name,
    phone_numbers,
    email,
    addresses,
    about
FROM Owners;

DROP TABLE Owners;

ALTER TABLE Owners_new RENAME TO Owners;

CREATE TRIGGER owners_update_date
AFTER UPDATE ON Owners
FOR EACH ROW
BEGIN
    UPDATE Owners
    SET update_date = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;