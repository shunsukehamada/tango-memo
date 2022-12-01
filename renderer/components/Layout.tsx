import React, { useContext, useState } from 'react';
import SideBar from './SideBar/SideBar';
import List, { Word } from './List/List';
import DirectoryProvider from './SideBar/Providers/DirectoryProvider';
import GetWordsProvider from './SideBar/Providers/GetWordsProvider';
import WordsProvider, { setWordsContext, wordsContext } from './List/Providers/WordsProvider';
import IsSelectedProvider from './SideBar/Providers/IsSelectedProvider';
import IsOpenStatesProvider from './SideBar/Providers/IsOpenStatesProvider';
import HandleIsOpenStatesProvider from './SideBar/Providers/HandleIsOpenStatesProvider';

const Layout = () => {
    // build時は削除
    const [openedFolder, setOpenedFolder] = useState<{ parent: string; folder: string } | null>(null);
    const words = useContext(wordsContext);
    const setWords = useContext(setWordsContext);

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
        <WordsProvider>
            <div className="flex overflow-y-hidden">
                <div className="h-screen flex items-center">
                    <DirectoryProvider>
                        <GetWordsProvider>
                            <IsSelectedProvider>
                                <IsOpenStatesProvider>
                                    <HandleIsOpenStatesProvider>
                                        <SideBar setOpenedFolder={setOpenedFolder} />
                                    </HandleIsOpenStatesProvider>
                                </IsOpenStatesProvider>
                            </IsSelectedProvider>
                        </GetWordsProvider>
                    </DirectoryProvider>
                </div>

                <div className="flex-1">
                    <List openedFolder={openedFolder} editItems={editListItem} />
                </div>
                {/* <div className="flex-1">
                    <List items={words} />
                </div> */}
            </div>
        </WordsProvider>
    );
};

export default Layout;
