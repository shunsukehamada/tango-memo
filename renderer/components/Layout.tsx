import React, { useEffect, useState } from 'react';
import SideBar, { DirectoryStructure } from './SideBar';
import List, { Word } from './List';

const Layout = () => {
    // build時は削除
    const [winReady, setWinReady] = useState(false);
    const [directoryStructureState, setDirectoryStructureState] = useState<DirectoryStructure[]>([]);
    const [openedFolder, setOpenedFolder] = useState<{ parent: string; folder: string } | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    useEffect(() => {
        setWinReady(true);
        const getAllFolders = async () => {
            const allFolders = await global.ipcRenderer.invoke('get-all-folders');
            setDirectoryStructureState(allFolders);
        };
        getAllFolders();
    }, []);

    const getWords = async (parentFolder: string, folder: string): Promise<void> => {
        const words: Word[] = await global.ipcRenderer.invoke('get-words', parentFolder, folder);
        setWords(words);
    };

    const editListItem = (word: Word, deleted: boolean = false) => {
        if (deleted) {
            const editedWords = [...words].filter((originalWord) => {
                if (originalWord.id === word.id) {
                    return false;
                }
                return true;
            });
            setWords(editedWords);
            return;
        }
        const editedWords = [...words].map((originalWord) => {
            if (originalWord.id === word.id) {
                return word;
            }
            return originalWord;
        });
        setWords(editedWords);
    };

    return (
        <div className="flex overflow-y-hidden">
            <div className="h-screen flex items-center">
                <SideBar
                    directoryStructure={directoryStructureState}
                    setDirectoryStructure={setDirectoryStructureState}
                    getWords={getWords}
                    setOpenedFolder={setOpenedFolder}
                />
            </div>

            <div className="flex-1">
                {winReady && (
                    <List items={words} setWords={setWords} openedFolder={openedFolder} editItems={editListItem} />
                )}
            </div>
            {/* <div className="flex-1">
                <List items={words} />
            </div> */}
        </div>
    );
};

export default Layout;
