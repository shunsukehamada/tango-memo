import React, { useContext } from 'react';
import Collapse from './Collapse';
import { directoryContext, setDirectoryContext } from './Providers/DirectoryProvider';
import { isOpenStatesType, isSelectedType } from './SideBar';

type Props = {
    setIsCreatingNewFolder: (value: React.SetStateAction<boolean>) => void;
    isSelected: isSelectedType;
    // setIsSelected: React.Dispatch<React.SetStateAction<isSelectedType>>
    handleChildrenSelect: (parentName: string, childIndex: number) => void;
    handleParentSelect: (parentName: string) => void;
    isOpenStates: isOpenStatesType;
    setIsOpenStates: React.Dispatch<React.SetStateAction<isOpenStatesType>>;
    handleIsOpenStates: (parent: string, open?: boolean) => void;
    isCreatingNewFolder: boolean;
    setNewFolderNameInputValue: (value: React.SetStateAction<string>) => void;
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
    isCreatingNewFolder,
    setIsCreatingNewFolder,
    newFolderNameInputValue,
    setNewFolderNameInputValue,
    isSelected,
    handleParentSelect,
    handleChildrenSelect,
    isOpenStates,
    setIsOpenStates,
    setOpenedFolder,
    handleIsOpenStates,
    handleContextMenu,
}) => {
    const directoryStructure = useContext(directoryContext);
    const setDirectoryStructure = useContext(setDirectoryContext);
    return (
        <div>
            {directoryStructure.map((directory, index) => {
                return (
                    <div key={directory.parent} className="w-full">
                        <div className="pl-1 pt-3 overflow-hidden flex flex-col items-start">
                            <ul className="w-full">
                                <Collapse
                                    // isOpen={isOpenStates}
                                    onClick={handleIsOpenStates}
                                    index={index}
                                    parent={directory.parent}
                                    setIsCreatingNewFolder={setIsCreatingNewFolder}
                                    handleParentSelect={handleParentSelect}
                                    directory={directory}
                                    isSelected={isSelected}
                                    isOpenStates={isOpenStates}
                                    handleIsOpenStates={handleIsOpenStates}
                                    isCreatingNewFolder={isCreatingNewFolder}
                                    newFolderNameInputValue={newFolderNameInputValue}
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
