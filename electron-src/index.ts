// Native
import path, { join } from 'path';
import { format } from 'url';

// Packages
import { BrowserWindow, app, ipcMain, shell } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import sqlite3 from 'sqlite3';
import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main';

type ChildDirectory = { type: 'child'; id: number; name: string; parentId: number; url: string };
type ParentDirectory = { type: 'parent'; id: number; name: string };
type DirectoryStructure = {
    parent: ParentDirectory;
    children: ChildDirectory[];
};
type Word = {
    id: number;
    english: string;
    japanese: string;
};
type PoSsType = 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Conjunction' | 'Pronoun' | 'Preposition' | 'Interjection';
type Inputs = {
    english: string;
    japanese: string;
    annotation: string;
    folder: Folder;
    pos: PoSsType[];
};
type Folder = {
    label: string;
    value: ChildDirectory;
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

    const handleUrlOpen = (e: Electron.Event, url: string) => {
        if (url.match(/^http/)) {
            e.preventDefault();
            shell.openExternal(url);
        }
    };
    mainWindow.webContents.on('will-navigate', handleUrlOpen);
    mainWindow.webContents.on('new-window', handleUrlOpen);

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

ipcMain.handle('get-all-folders', async (): Promise<DirectoryStructure[]> => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    const parentFolders: { id: number; name: string }[] = await new Promise((resolve, reject) => {
        db.all('select * from parent_folders', (err: Error | null, rows: { id: number; name: string }[]) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
    const directoryStructure: DirectoryStructure[] = [];
    for (const parentFolder of parentFolders) {
        const folders: ChildDirectory[] = await new Promise<ChildDirectory[]>((resolve, reject) => {
            db.all(
                'select * from folders where parent_id = ?',
                parentFolder.id,
                (
                    err: Error | null,
                    rows: {
                        id: number;
                        name: string;
                        parent_id: number;
                        url: string;
                    }[]
                ) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(
                        rows.map((row) => {
                            return { ...row, parentId: row.parent_id, type: 'child' };
                        })
                    );
                }
            );
        });
        const directory: DirectoryStructure = {
            parent: { name: parentFolder.name, id: parentFolder.id, type: 'parent' },
            children: folders,
        };
        directoryStructure.push(directory);
    }

    db.close();
    return directoryStructure;
});

ipcMain.handle('get-words', async (_e, id: number): Promise<Word[]> => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    const words = await new Promise<(Word & { poss: string[] })[]>((resolve, reject) => {
        db.all('select * from words where folder_id = ?', id, async (err: Error | null, rows: Word[]) => {
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
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    const id: number = await new Promise<number>((resolve, reject) => {
        db.run(
            'insert into words(english, japanese, annotation, folder_id) values(?, ?, ?, ?)',
            [english, japanese, annotation, folder.value.id],
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

ipcMain.handle('create-new-parent-folder', async (_e: Electron.IpcMainInvokeEvent, folder: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    await new Promise<void>((resolve, reject) => {
        db.run('insert into parent_folders(name) values(?)', folder, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
    return 201;
});

ipcMain.handle('create-new-folder', async (_e, parentFolder: ParentDirectory, folder: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    await new Promise<void>((resolve, reject) => {
        db.run('insert into folders(name, parent_id) values(?, ?)', [folder, parentFolder.id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
    return 201;
});

ipcMain.on('delete-word', async (_e: IpcMainEvent, id: number) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
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
                ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
                : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
        );
        const editWord = async () => {
            db.run(
                'update words set english = ?, japanese = ?, annotation = ?, folder_id = ? where id = ?',
                [english, japanese, annotation, folder.value.id, id],
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
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    const [folderName, parentId, url] = await new Promise<[string, number, string | null]>((resolve, reject) => {
        db.get(
            'select * from folders where id = ?',
            id,
            (err: Error | null, row: { name: string; parent_id: number; id: number; url: string | null }) => {
                if (err) {
                    reject(err);
                }
                resolve([row.name, row.parent_id, row.url]);
            }
        );
    });
    return {
        label: folderName,
        // value: { parent: parentName, child: folderName, id: id },
        value: { parentId: parentId, name: folderName, id: id, url: url ? url : '', type: 'child' },
    };
});

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

ipcMain.on('delete-child-folder', async (_e: IpcMainEvent, directory: ChildDirectory) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    deleteChildFolder(db, directory.id);
});

ipcMain.on('delete-parent-folder', async (_e: IpcMainEvent, directory: ParentDirectory) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    // const [parentId, folderIds] = await getFolderIds(db, directory);
    const folderIds = await new Promise<number[]>((resolve, reject) => {
        db.all(
            'select id from folders where parent_id = ?',
            directory.id,
            (err: Error | null, rows: { id: number }[]) => {
                if (err) {
                    reject(err);
                }

                resolve(rows.map((row) => row.id));
            }
        );
    });
    db.run('delete from parent_folders where id = ?', directory.id, (err) => {
        if (err) {
            console.error(err);
        }
    });
    for (const folderId of folderIds) {
        deleteChildFolder(db, folderId);
    }
});

ipcMain.on('change-parent-folder', async (_e: IpcMainEvent, id: number, name: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    db.run('update parent_folders set name = ? where id = ?', [name, id], (err) => {
        if (err) {
            console.error(err);
        }
    });
});
ipcMain.on('change-child-folder', async (_e: IpcMainEvent, id: number, name: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    db.run('update folders set name = ? where id = ?', [name, id], (err) => {
        if (err) {
            console.error(err);
        }
    });
});

ipcMain.handle(
    'get-suggestion',
    async (_e: IpcMainInvokeEvent, value: string): Promise<{ id: number; word: string }[]> => {
        const db = new sqlite3.Database(
            isDev
                ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'suggest.db')
                : path.join(process.env['HOME']!, 'tango-memo', 'suggest.db')
        );
        const exact = await new Promise<{ id: number; word: string } | undefined>((resolve, reject) => {
            db.get(
                'select id, english from words where english = ?',
                value,
                (err: Error | null, row: { id: number; english: string } | undefined) => {
                    if (err) {
                        reject(err);
                    }
                    row ? resolve({ id: row.id, word: row.english }) : resolve(undefined);
                }
            );
        });
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
        if (exact) {
            const partials = rows
                .filter((row) => row.id !== exact?.id)
                .map((row) => {
                    return { id: row.id, word: row.english };
                });
            return [exact, ...partials];
        }
        return rows.map((row) => {
            return { id: row.id, word: row.english };
        });
    }
);

ipcMain.handle('get-word-info', async (_e: IpcMainInvokeEvent, id: number) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'suggest.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'suggest.db')
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

ipcMain.handle('set-url', async (_e: Electron.IpcMainInvokeEvent, folder: ChildDirectory, url: string) => {
    const db = new sqlite3.Database(
        isDev
            ? path.join(process.env['HOME']!, 'Documents', 'electron', 'tango-memo', 'db', 'database.db')
            : path.join(process.env['HOME']!, 'tango-memo', 'database.db')
    );
    await new Promise<void>((resolve, reject) => {
        db.run('update folders set url = ? where id = ?', [url, folder.id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
    return 201;
});
