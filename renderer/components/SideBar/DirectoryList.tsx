import React, { useContext } from 'react';
import Collapse from './Collapse';
import { directoryContext } from './Providers/DirectoryProvider';

type Props = {
    setIsCreatingNewFolder: (value: React.SetStateAction<boolean>) => void;
    handleChildrenSelect: (parentName: string, childIndex: number) => void;
    handleParentSelect: (parentName: string) => void;
    isCreatingNewFolder: boolean;
    setNewFolderNameInputValue: (value: React.SetStateAction<string>) => void;
    newFolderNameInputValue: string;
    setOpenedFolder: (
        value: React.SetStateAction<{
            parent: string;
            folder: string;
        }>
    ) => void;
    handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string, child?: string) => void;
};

const DirectoryList: React.FC<Props> = ({
    isCreatingNewFolder,
    setIsCreatingNewFolder,
    newFolderNameInputValue,
    setNewFolderNameInputValue,
    handleParentSelect,
    handleChildrenSelect,
    setOpenedFolder,
    handleContextMenu,
}) => {
    const directoryStructure = useContext(directoryContext);
    return (
        <div>
            {directoryStructure.map((directory, index) => {
                return (
                    <div key={directory.parent} className="w-full">
                        <div className="pl-1 pt-3 overflow-hidden flex flex-col items-start">
                            <ul className="w-full">
                                <Collapse
                                    index={index}
                                    parent={directory.parent}
                                    setIsCreatingNewFolder={setIsCreatingNewFolder}
                                    handleParentSelect={handleParentSelect}
                                    directory={directory}
                                    isCreatingNewFolder={isCreatingNewFolder}
                                    newFolderNameInputValue={newFolderNameInputValue}
                                    setNewFolderNameInputValue={setNewFolderNameInputValue}
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
