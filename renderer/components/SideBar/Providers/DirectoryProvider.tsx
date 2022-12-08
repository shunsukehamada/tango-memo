import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { DirectoryStructure } from '../SideBar';

type Props = {
    children: ReactNode;
};

export type DirectoryContextValue = {
    readonly directoryStructure: DirectoryStructure[];
};
export type SetDirectoryContextValue = {
    readonly setDirectoryStructure: React.Dispatch<React.SetStateAction<DirectoryStructure[]>>;
};

export const directoryContext = createContext<readonly DirectoryStructure[]>([]);
export const setDirectoryContext = createContext<React.Dispatch<React.SetStateAction<DirectoryStructure[]>>>(() => {});

const DirectoryProvider: React.FC<Props> = ({ children }) => {
    const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure[]>([]);
    useEffect(() => {
        const getAllFolders = async () => {
            const allFolders = (await global.ipcRenderer.invoke('get-all-folders')) as DirectoryStructure[];
            setDirectoryStructure(allFolders);
        };
        getAllFolders();
    }, []);
    return (
        <directoryContext.Provider value={directoryStructure}>
            <setDirectoryContext.Provider value={setDirectoryStructure}>{children}</setDirectoryContext.Provider>
        </directoryContext.Provider>
    );
};

export default DirectoryProvider;
