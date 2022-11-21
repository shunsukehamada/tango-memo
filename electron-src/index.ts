// Native
import path, { join } from 'path';
import { format } from 'url';

// Packages
import { BrowserWindow, app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import sqlite3 from 'sqlite3';

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
    folder: {
        label: string;
        value: { parent: string; child: string };
    };
    pos: (keyof PoSs)[];
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
    const words: Word[] = await new Promise<Word[]>((resolve, reject) => {
        db.all('select * from words where folder_id = ?', folderId, (err: Error | null, row: Word[]) => {
            if (err) {
                reject(err);
            }
            resolve(row);
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
