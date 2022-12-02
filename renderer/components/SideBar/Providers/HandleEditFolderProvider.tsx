import React, { createContext, ReactNode, useContext, useState } from 'react';
import { setFolderValueContext } from './EditFolderValueProvider';

type Props = {
    children: ReactNode;
};

type EditFolderState = {
    isEditingFolder: boolean;
    editingFolder?: Folder;
};

type Folder = { parent: string; child?: string };

export const editFolderContext = createContext<EditFolderState>({ isEditingFolder: false });
export const setEditFolderContext = createContext<React.Dispatch<React.SetStateAction<EditFolderState>>>(() => {});
export const handleEditFolderContext = createContext<(folder: Folder) => void>(() => {});

const HandleEditFolderProvider: React.FC<Props> = ({ children }) => {
    const [editFolder, setEditFolder] = useState<EditFolderState>({ isEditingFolder: false });
    const setFolderValue = useContext(setFolderValueContext);

    const handleEditFolder = (folder: Folder): void => {
        setEditFolder({ isEditingFolder: true, editingFolder: folder });
        setFolderValue(folder.child ? folder.child : folder.parent);
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
