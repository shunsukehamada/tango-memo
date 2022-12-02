import React, { useContext } from 'react';
import SideBar from './SideBar/SideBar';
import List, { Word } from './List/List';
import DirectoryProvider from './SideBar/Providers/DirectoryProvider';
import GetWordsProvider from './SideBar/Providers/GetWordsProvider';
import WordsProvider, { setWordsContext, wordsContext } from './List/Providers/WordsProvider';
import IsSelectedProvider from './SideBar/Providers/IsSelectedProvider';
import IsOpenStatesProvider from './SideBar/Providers/IsOpenStatesProvider';
import HandleIsOpenStatesProvider from './SideBar/Providers/HandleIsOpenStatesProvider';
import HandleSelectProvider from './SideBar/Providers/HandleSelectProvider';
import NewFolderInputValue from './SideBar/Providers/HandleSelectProvider';
import IsCreatingNewFolderProvider from './SideBar/Providers/isCreatingNewFolderProvider';
import HandleContextMenuProvider from './SideBar/Providers/HandleContextMenuProvider';
import OpenedFolderProvider from './SideBar/Providers/OpenedFolderProvider';

const Layout = () => {
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
        <OpenedFolderProvider>
            <WordsProvider>
                <div className="flex overflow-y-hidden">
                    <div className="h-screen flex items-center">
                        <DirectoryProvider>
                            <GetWordsProvider>
                                <IsSelectedProvider>
                                    <IsOpenStatesProvider>
                                        <HandleIsOpenStatesProvider>
                                            <HandleSelectProvider>
                                                <NewFolderInputValue>
                                                    <IsCreatingNewFolderProvider>
                                                        <HandleContextMenuProvider>
                                                            <SideBar />
                                                        </HandleContextMenuProvider>
                                                    </IsCreatingNewFolderProvider>
                                                </NewFolderInputValue>
                                            </HandleSelectProvider>
                                        </HandleIsOpenStatesProvider>
                                    </IsOpenStatesProvider>
                                </IsSelectedProvider>
                            </GetWordsProvider>
                        </DirectoryProvider>
                    </div>

                    <div className="flex-1">
                        <List editItems={editListItem} />
                    </div>
                </div>
            </WordsProvider>
        </OpenedFolderProvider>
    );
};

export default Layout;
