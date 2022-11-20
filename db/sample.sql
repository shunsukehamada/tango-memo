INSERT
    OR IGNORE INTO parent_folders(name)
VALUES
("folder1");

INSERT
    OR IGNORE INTO parent_folders(name)
VALUES
("folder2");

INSERT
    OR IGNORE INTO folders(name, parent_id)
values
(
        "folder1-1",
        (
            SELECT
                id
            FROM
                parent_folders
            WHERE
                name = "folder1"
        )
    );

INSERT
    OR IGNORE INTO folders(name, parent_id)
values
(
        "folder1-2",
        (
            SELECT
                id
            FROM
                parent_folders
            WHERE
                name = "folder1"
        )
    );

INSERT
    OR IGNORE INTO folders(name, parent_id)
values
(
        "folder1-3",
        (
            SELECT
                id
            FROM
                parent_folders
            WHERE
                name = "folder1"
        )
    );

INSERT
    OR IGNORE INTO folders(name, parent_id)
values
(
        "folder2-1",
        (
            SELECT
                id
            FROM
                parent_folders
            WHERE
                name = "folder2"
        )
    );

INSERT
    OR IGNORE INTO folders(name, parent_id)
values
(
        "folder2-2",
        (
            SELECT
                id
            FROM
                parent_folders
            WHERE
                name = "folder2"
        )
    );
