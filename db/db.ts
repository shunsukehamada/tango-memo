import sqlite3 from 'sqlite3';
const sampleDb = new sqlite3.Database('./sample.db');
const toeflDb = new sqlite3.Database('./toefl.db');

toeflDb.serialize(() => {
    toeflDb.all('select * from word limit 150', (err: Error | null, rows: { english: string; japanese: string }[]) => {
        if (err) {
            console.log(err);
        }
        sampleDb.serialize(() => {
            sampleDb.get(
                'select id from folders where name = "folder1-1"',
                (err: Error | null, folderId: { id: number }) => {
                    if (err) {
                        console.log(err);
                    }
                    rows.forEach((row, index) => {
                        if (index >= 50) {
                            return;
                        }
                        sampleDb.run(
                            'insert or ignore into words(english, japanese, folder_id) values(?, ?, ?)',
                            row.english,
                            row.japanese,
                            folderId.id,
                            (err: Error | null) => {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                    });
                }
            );
            sampleDb.get(
                'select id from folders where name = "folder1-2"',
                (err: Error | null, folderId: { id: number }) => {
                    if (err) {
                        console.log(err);
                    }
                    rows.forEach((row, index) => {
                        if (index < 50 || index >= 100) {
                            return;
                        }
                        sampleDb.run(
                            'insert or ignore into words(english, japanese, folder_id) values(?, ?, ?)',
                            row.english,
                            row.japanese,
                            folderId.id,
                            (err: Error | null) => {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                    });
                }
            );
            sampleDb.get(
                'select id from folders where name = "folder2-1"',
                (err: Error | null, folderId: { id: number }) => {
                    if (err) {
                        console.log(err);
                    }
                    rows.forEach((row, index) => {
                        if (index < 100) {
                            return;
                        }
                        sampleDb.run(
                            'insert or ignore into words(english, japanese, folder_id) values(?, ?, ?)',
                            row.english,
                            row.japanese,
                            folderId.id,
                            (err: Error | null) => {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                    });
                }
            );
        });
    });
});
// db.run('insert into folder() values');
