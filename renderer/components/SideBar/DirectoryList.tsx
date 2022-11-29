import React, { useEffect, useState } from 'react';
import Collapse from './Collapse';
import { DirectoryStructure, isSelectedType } from './SideBar';

type Props = {
    directoryStructure: DirectoryStructure[];
    setIsCreatingNewFolder: (value: React.SetStateAction<boolean>) => void;
    isSelected: isSelectedType;
    // setIsSelected: React.Dispatch<React.SetStateAction<isSelectedType>>
    handleChildrenSelect: (parentName: string, childIndex: number) => void;
    handleParentSelect: (parentName: string) => void;
    isOpenStates: boolean[];
    handleIsOpenStates: (index: number, open?: boolean) => void;
    isCreatingNewFolder: boolean;
    setNewFolderNameInputValue: (value: React.SetStateAction<string>) => void;
    setDirectoryStructure: (value: React.SetStateAction<DirectoryStructure[]>) => void;
    newFolderNameInputValue: string;
    getWords: (parentFolder: string, folder: string) => Promise<void>;
    setOpenedFolder: (
        value: React.SetStateAction<{
            parent: string;
            folder: string;
        }>
    ) => void;
    handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string, child?: string) => void;
};

const DirectoryList: React.FC<Props> = ({
    getWords,
    directoryStructure,
    setDirectoryStructure,
    isCreatingNewFolder,
    setIsCreatingNewFolder,
    newFolderNameInputValue,
    setNewFolderNameInputValue,
    isSelected,
    handleParentSelect,
    handleChildrenSelect,
    isOpenStates,
    setOpenedFolder,
    handleIsOpenStates,
    handleContextMenu,
}) => {
    return (
        <div>
            {directoryStructure.map((directory, index) => {
                return (
                    <div key={directory.parent} className="w-full">
                        <div className="pl-1 pt-3 overflow-hidden flex flex-col items-start">
                            <ul className="w-full">
                                <Collapse
                                    isOpen={isOpenStates[index]}
                                    onClick={handleIsOpenStates}
                                    index={index}
                                    parent={directory.parent}
                                    setIsCreatingNewFolder={setIsCreatingNewFolder}
                                    handleParentSelect={handleParentSelect}
                                    directory={directory}
                                    isSelected={isSelected}
                                    isOpenStates={isOpenStates}
                                    isCreatingNewFolder={isCreatingNewFolder}
                                    directoryStructure={directoryStructure}
                                    newFolderNameInputValue={newFolderNameInputValue}
                                    setDirectoryStructure={setDirectoryStructure}
                                    setNewFolderNameInputValue={setNewFolderNameInputValue}
                                    getWords={getWords}
                                    setOpenedFolder={setOpenedFolder}
                                    handleChildrenSelect={handleChildrenSelect}
                                    handleContextMenu={handleContextMenu}
                                />
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DirectoryList;
