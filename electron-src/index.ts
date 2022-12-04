// Native
import path, { join } from 'path';
import { format } from 'url';

// Packages
import { BrowserWindow, app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import sqlite3 from 'sqlite3';
import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main';

type DirectoryStructure = {
    parent: string;
    children: string[];
};

type Word = {
    id: number;
    english: string;
    japanese: string;
};

type PoSs = {
    Noun: '名詞';
    Verb: '動詞';
    Adjective: '形容詞';
    Adverb: '副詞';
    Conjunction: '接続詞';
    Pronoun: '代名詞';
    Preposition: '前置詞';
    Interjection: '感動詞';
};

type Inputs = {
    english: string;
    japanese: string;
    annotation: string;
    folder: Folder;
    pos: (keyof PoSs)[];
};

type Folder = {
    label: string;
    value: { parent: string; child: string };
};

// Prepare the renderer once the app is ready
app.on('ready', async () => {
    await prepareNext('./renderer');

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: join(__dirname, 'preload.js'),
        },
    });

    const url = isDev
        ? 'http://localhost:8000/'
        : format({
              pathname: join(__dirname, '../renderer/out/index.html'),
              protocol: 'file:',
              slashes: true,
          });

    mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.handle('sample', async () => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );

    const words: { id: number; english: string; japanese: string }[] = await new Promise<
        { id: number; english: string; japanese: string }[]
    >((resolve, reject) => {
        db.all('select * from words limit 5', (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows as { id: number; english: string; japanese: string }[]);
        });
    });
    db.close();
    return words;
    // setTimeout(() => event.sender.send('message', 'hi from electron'), 500)
});

ipcMain.handle('get-all-folders', async () => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const parentFolders: { id: number; name: string }[] = await new Promise((resolve, reject) => {
        db.all('select * from parent_folders', (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
    const directoryStructure: DirectoryStructure[] = [];
    for (const parentFolder of parentFolders) {
        const folder: { id: number; name: string; parent_id: number }[] = await new Promise((resolve, reject) => {
            db.all('select * from folders where parent_id = ?', parentFolder.id, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
        const directory: DirectoryStructure = {
            parent: parentFolder.name,
            children: folder.map((folder) => {
                return folder.name;
            }),
        };
        directoryStructure.push(directory);
    }

    db.close();
    return directoryStructure;
});

ipcMain.handle('get-words', async (_e, parentFolder: string, folder: string): Promise<Word[]> => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const parentId: number = await new Promise<number>((resolve, reject) => {
        db.get(
            'select id from parent_folders where name = ?',
            parentFolder,
            (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            }
        );
    });
    const folderId: number = await new Promise<number>((resolve, reject) => {
        db.get(
            'select id from folders where parent_id = ? and name = ?',
            parentId,
            folder,
            (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            }
        );
    });
    const words = await new Promise<(Word & { poss: string[] })[]>((resolve, reject) => {
        db.all('select * from words where folder_id = ?', folderId, async (err: Error | null, rows: Word[]) => {
            if (err) {
                reject(err);
            }
            const words = Promise.all(
                rows.map(async (row) => {
                    return await new Promise<Word & { poss: string[] }>(async (resolve) => {
                        const posIds = await new Promise<number[]>((resolve, reject) => {
                            db.all(
                                'select poss_id from words_poss where words_id = ?',
                                row.id,
                                (err: Error | null, rows: { poss_id: number }[]) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(rows.map((row) => row.poss_id));
                                }
                            );
                        });
                        const poss = await Promise.all(
                            posIds.map(async (posId) => {
                                return await new Promise<string>((resolve) => {
                                    db.get(
                                        'select pos from poss where id = ?',
                                        posId,
                                        (err: Error | null, row: { pos: string }) => {
                                            if (err) {
                                                reject(err);
                                            }
                                            resolve(row.pos);
                                        }
                                    );
                                });
                            })
                        );
                        resolve({ ...row, poss });
                    });
                })
            );
            resolve(words);
        });
    });

    return words;
});

ipcMain.on('register-new-word', async (_e, { english, japanese, annotation, folder, pos }: Inputs) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const parentId: number = await new Promise<number>((resolve, reject) => {
        db.get(
            'select id from parent_folders where name = ?',
            folder.value.parent,
            (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            }
        );
    });
    const folderId: number = await new Promise<number>((resolve, reject) => {
        db.get(
            'select id from folders where parent_id = ? and name = ?',
            parentId,
            folder.label,
            (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            }
        );
    });
    const id: number = await new Promise<number>((resolve, reject) => {
        db.run(
            'insert into words(english, japanese, annotation, folder_id) values(?, ?, ?, ?)',
            [english, japanese, annotation, folderId],
            function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this.lastID);
            }
        );
    });
    for (const posName of pos) {
        const posId: number = await new Promise<number>((resolve, reject) => {
            db.get('select id from poss where pos = ?', posName, (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            });
        });
        db.run('insert into words_poss(words_id, poss_id) values(?, ?)', [id, posId], (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
});

ipcMain.on('create-new-parent-folder', (_e, folder: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    db.run('insert into parent_folders(name) values(?)', folder);
});

ipcMain.on('create-new-folder', async (_e, parentFolder: string, folder: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const parentId = await new Promise<number>((resolve, reject) => {
        db.get(
            'select id from parent_folders where name = ?',
            parentFolder,
            (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            }
        );
    });
    db.run('insert into folders(name, parent_id) values(?, ?)', [folder, parentId], (err) => {
        if (err) {
            console.error(err);
        }
    });
});

ipcMain.on('delete-word', async (_e: IpcMainEvent, id: number) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    db.run('delete from words where id = ?', id, (err) => {
        if (err) {
            console.error(err);
        }
    });
    db.run('delete from words_poss where words_id = ?', id, (err) => {
        if (err) {
            console.error(err);
        }
    });
});

ipcMain.on(
    'edit-word',
    async (_e: IpcMainEvent, { english, japanese, annotation, folder, pos }: Inputs, id: number) => {
        const db = new sqlite3.Database(
            isDev
                ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
                : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
        );
        const editWord = async () => {
            const parentId: number = await new Promise<number>((resolve, reject) => {
                db.get(
                    'select id from parent_folders where name = ?',
                    folder.value.parent,
                    (err: Error | null, row: { id: number }) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(row.id);
                    }
                );
            });
            const folderId: number = await new Promise<number>((resolve, reject) => {
                db.get(
                    'select id from folders where parent_id = ? and name = ?',
                    parentId,
                    folder.label,
                    (err: Error | null, row: { id: number }) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(row.id);
                    }
                );
            });
            db.run(
                'update words set english = ?, japanese = ?, annotation = ?, folder_id = ? where id = ?',
                [english, japanese, annotation, folderId, id],
                (err) => {
                    if (err) {
                        console.error(err);
                    }
                }
            );
        };

        const editWordsPossRelation = async () => {
            await new Promise<void>((resolve, reject) => {
                db.run('delete from words_poss where words_id = ?', id, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
            for (const posName of pos) {
                const posId: number = await new Promise<number>((resolve, reject) => {
                    db.get('select id from poss where pos = ?', posName, (err: Error | null, row: { id: number }) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(row.id);
                    });
                });
                db.run('insert into words_poss(words_id, poss_id) values(?, ?)', [id, posId], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        };
        editWord();
        editWordsPossRelation();
    }
);

ipcMain.handle('get-folder', async (_e: IpcMainInvokeEvent, id: number): Promise<Folder> => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const [folderName, parentId] = await new Promise<[string, number]>((resolve, reject) => {
        db.get(
            'select name, parent_id from folders where id = ?',
            id,
            (err: Error | null, row: { name: string; parent_id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve([row.name, row.parent_id]);
            }
        );
    });
    const parentName = await new Promise<string>((resolve, reject) => {
        db.get('select name from parent_folders where id = ?', parentId, (err: Error | null, row: { name: string }) => {
            if (err) {
                reject(err);
            }
            resolve(row.name);
        });
    });
    return {
        label: folderName,
        value: { parent: parentName, child: folderName },
    };
});

const getFolderId = async (db: sqlite3.Database, parentName: string, childName: string): Promise<number> => {
    const parentId: number = await new Promise<number>((resolve, reject) => {
        db.get('select id from parent_folders where name = ?', parentName, (err: Error | null, row: { id: number }) => {
            if (err) {
                reject(err);
            }
            resolve(row.id);
        });
    });
    const folderId: number = await new Promise<number>((resolve, reject) => {
        db.get(
            'select id from folders where parent_id = ? and name = ?',
            parentId,
            childName,
            (err: Error | null, row: { id: number }) => {
                if (err) {
                    reject(err);
                }
                resolve(row.id);
            }
        );
    });
    return folderId;
};

const getFolderIds = async (db: sqlite3.Database, parentName: string): Promise<[number, number[]]> => {
    const parentId: number = await new Promise<number>((resolve, reject) => {
        db.get('select id from parent_folders where name = ?', parentName, (err: Error | null, row: { id: number }) => {
            if (err) {
                reject(err);
            }
            resolve(row.id);
        });
    });
    const folderIds = await new Promise<number[]>((resolve, reject) => {
        db.all('select id from folders where parent_id = ?', parentId, (err: Error | null, rows: { id: number }[]) => {
            if (err) {
                reject(err);
            }

            resolve(rows.map((row) => row.id));
        });
    });
    return [parentId, folderIds];
};

const deleteWordsAndPos = (db: sqlite3.Database, wordId: number): void => {
    db.run('delete from words where id = ?', wordId, (err) => {
        if (err) {
            console.error(err);
        }
    });
    db.run('delete from words_poss where words_id = ?', wordId, (err) => {
        if (err) {
            console.error(err);
        }
    });
};

const deleteChildFolder = async (db: sqlite3.Database, folderId: number) => {
    db.run('delete from folders where id = ?', folderId, (err) => {
        if (err) {
            console.error(err);
        }
    });
    const wordIds = await new Promise<number[]>((resolve, reject) => {
        db.all('select id from words where folder_id = ?', folderId, (err: Error | null, rows: { id: number }[]) => {
            if (err) {
                reject(err);
            }

            resolve(rows.map((row) => row.id));
        });
    });
    for (const id of wordIds) {
        deleteWordsAndPos(db, id);
    }
};

ipcMain.on(
    'delete-child-folder',
    async (
        _e: IpcMainEvent,
        {
            parent,
            child,
        }: {
            parent: string;
            child: string;
        }
    ) => {
        const db = new sqlite3.Database(
            isDev
                ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
                : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
        );
        const folderId = await getFolderId(db, parent, child);
        deleteChildFolder(db, folderId);
    }
);

ipcMain.on('delete-parent-folder', async (_e: IpcMainEvent, { parent }) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const [parentId, folderIds] = await getFolderIds(db, parent);
    db.run('delete from parent_folders where id = ?', parentId, (err) => {
        if (err) {
            console.error(err);
        }
    });
    for (const folderId of folderIds) {
        deleteChildFolder(db, folderId);
    }
});

ipcMain.on('change-parent-folder', async (_e: IpcMainEvent, editingFolder: { parent: string }, folder: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    db.run('update parent_folders set name = ? where name = ?', [folder, editingFolder.parent], (err) => {
        if (err) {
            console.error(err);
        }
    });
});
ipcMain.on(
    'change-child-folder',
    async (_e: IpcMainEvent, { parent, child }: { parent: string; child: string }, folder: string) => {
        const db = new sqlite3.Database(
            isDev
                ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'sample.db')
                : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
        );
        const id = await getFolderId(db, parent, child);
        db.run('update folders set name = ? where id = ?', [folder, id], (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
);

ipcMain.handle('get-suggestion', async (_e: IpcMainInvokeEvent, value: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'supplement', 'suggest.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const rows = await new Promise<{ id: number; english: string }[]>((resolve, reject) => {
        db.all(
            'select id, english from words where english like ? limit 5',
            `${value}%`,
            (err: Error | null, rows: { id: number; english: string }[]) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            }
        );
    });
    return rows.map((row) => {
        return { id: row.id, word: row.english };
    });
});

ipcMain.handle('get-word-info', async (_e: IpcMainInvokeEvent, id: number) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'supplement', 'suggest.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'sample.db')
    );
    const japanese = await new Promise<string>((resolve, reject) => {
        db.get('select japanese from words where id = ?', id, (err: Error | null, row: { japanese: string }) => {
            if (err) {
                reject(err);
            }
            resolve(row.japanese);
        });
    });
    const posIds = await new Promise<number[]>((resolve, reject) => {
        db.all(
            'select poss_id from words_poss where words_id = ?',
            id,
            (err: Error | null, rows: { poss_id: number }[]) => {
                if (err) {
                    reject(err);
                }
                resolve(rows.map((row) => row.poss_id));
            }
        );
    });
    const poss = await Promise.all(
        posIds.map(async (posId) => {
            return await new Promise<string>((resolve, reject) => {
                db.get('select pos from poss where id = ?', posId, (err: Error | null, row: { pos: string }) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row.pos);
                });
            });
        })
    );
    return { japanese, poss };
});
