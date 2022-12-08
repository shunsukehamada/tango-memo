import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ChildDirectory, ParentDirectory } from '../SideBar';
import { setFolderValueContext } from './EditFolderValueProvider';

type Props = {
    children: ReactNode;
};

type Directory = ParentDirectory | ChildDirectory;

type EditFolderState = {
    isEditingFolder: boolean;
    editingFolder?: Directory;
};

export const editFolderContext = createContext<EditFolderState>({ isEditingFolder: false });
export const setEditFolderContext = createContext<React.Dispatch<React.SetStateAction<EditFolderState>>>(() => {});
export const handleEditFolderContext = createContext<(folder: Directory) => void>(() => {});

const HandleEditFolderProvider: React.FC<Props> = ({ children }) => {
    const [editFolder, setEditFolder] = useState<EditFolderState>({ isEditingFolder: false });
    const setFolderValue = useContext(setFolderValueContext);

    const handleEditFolder = (folder: Directory): void => {
        setEditFolder({ isEditingFolder: true, editingFolder: folder });
        setFolderValue(folder.type === 'child' ? folder.name : folder.name);
    };

    return (
        <editFolderContext.Provider value={editFolder}>
            <setEditFolderContext.Provider value={setEditFolder}>
                <handleEditFolderContext.Provider value={handleEditFolder}>{children}</handleEditFolderContext.Provider>
            </setEditFolderContext.Provider>
        </editFolderContext.Provider>
    );
};

export default HandleEditFolderProvider;
