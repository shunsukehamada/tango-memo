import React, { useContext } from 'react';
import Collapse from './Collapse';
import { directoryContext } from './Providers/DirectoryProvider';

type Props = {
    setIsCreatingNewFolder: (value: React.SetStateAction<boolean>) => void;
    isCreatingNewFolder: boolean;
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
                                    directory={directory}
                                    isCreatingNewFolder={isCreatingNewFolder}
                                    setOpenedFolder={setOpenedFolder}
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
