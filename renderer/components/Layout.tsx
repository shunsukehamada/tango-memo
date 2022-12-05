import React, { useState } from 'react';
import SideBar from './SideBar/SideBar';
import List, { View } from './List/List';
import DirectoryProvider from './SideBar/Providers/DirectoryProvider';
import GetWordsProvider from './SideBar/Providers/GetWordsProvider';
import WordsProvider from './List/Providers/WordsProvider';
import IsSelectedProvider from './SideBar/Providers/IsSelectedProvider';
import IsOpenStatesProvider from './SideBar/Providers/IsOpenStatesProvider';
import HandleIsOpenStatesProvider from './SideBar/Providers/HandleIsOpenStatesProvider';
import HandleSelectProvider from './SideBar/Providers/HandleSelectProvider';
import NewFolderNameInputValueProvider from './SideBar/Providers/NewFolderNameInputValueProvider';
import IsCreatingNewFolderProvider from './SideBar/Providers/isCreatingNewFolderProvider';
import HandleContextMenuProvider from './SideBar/Providers/HandleContextMenuProvider';
import OpenedFolderProvider from './SideBar/Providers/OpenedFolderProvider';
import EditFolderProvider from './SideBar/Providers/EditFolderValueProvider';
import HandleEditFolderProvider from './SideBar/Providers/HandleEditFolderProvider';
import Header from './Header';
import FilterProvider from './Header/FilterProvider';
import SearchWordsProvider from './Header/SearchWordsProvider';

const Layout = () => {
    const [view, setView] = useState<View>('list');
    const [isHidden, setIsHidden] = useState(false);

    return (
        <OpenedFolderProvider>
            <WordsProvider>
                <FilterProvider>
                    <SearchWordsProvider>
                        <Header view={view} setView={setView} isHidden={isHidden} setIsHidden={setIsHidden} />
                        <div className="flex overflow-y-hidden">
                            <div className="h-screen flex items-center">
                                <DirectoryProvider>
                                    <GetWordsProvider>
                                        <IsSelectedProvider>
                                            <IsOpenStatesProvider>
                                                <HandleIsOpenStatesProvider>
                                                    <HandleSelectProvider>
                                                        <NewFolderNameInputValueProvider>
                                                            <IsCreatingNewFolderProvider>
                                                                <HandleContextMenuProvider>
                                                                    <EditFolderProvider>
                                                                        <HandleEditFolderProvider>
                                                                            <SideBar />
                                                                        </HandleEditFolderProvider>
                                                                    </EditFolderProvider>
                                                                </HandleContextMenuProvider>
                                                            </IsCreatingNewFolderProvider>
                                                        </NewFolderNameInputValueProvider>
                                                    </HandleSelectProvider>
                                                </HandleIsOpenStatesProvider>
                                            </IsOpenStatesProvider>
                                        </IsSelectedProvider>
                                    </GetWordsProvider>
                                </DirectoryProvider>
                            </div>

                            <div className="flex-1">
                                <List view={view} setView={setView} isHidden={isHidden} />
                            </div>
                        </div>
                    </SearchWordsProvider>
                </FilterProvider>
            </WordsProvider>
        </OpenedFolderProvider>
    );
};

export default Layout;
