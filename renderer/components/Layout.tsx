import React, { ReactNode, useEffect, useState } from 'react';
import SideBar, { DirectoryStructure } from './SideBar';
import List, { Word } from './List';


const Layout = () => {
    // build時は削除
    const [winReady, setWinReady] = useState(false);
    const [directoryStructureState, setDirectoryStructureState] = useState<DirectoryStructure[]>([]);
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

    return (
        <div className="flex overflow-y-hidden">
            <div className="h-screen flex items-center">
                <SideBar
                    directoryStructure={directoryStructureState}
                    setDirectoryStructure={setDirectoryStructureState}
                    getWords={getWords}
                />
            </div>
            <div className="flex-1">{winReady && <List items={words} setWords={setWords}/>}</div>
            {/* <div className="flex-1">
                <List items={words} />
            </div> */}
        </div>
    );
};

export default Layout;
