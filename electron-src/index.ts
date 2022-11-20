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
    const db = new sqlite3.Database(path.join(__dirname, 'db', 'sample.db'));

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
    const db = new sqlite3.Database(path.join(__dirname, 'db', 'sample.db'));
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

    return directoryStructure;
});

ipcMain.handle('get-words', (_e, folderId: number) => {});
