import React, { createContext, ReactNode, useState } from 'react';
import { ChildDirectory } from '../SideBar';

type Props = {
    children: ReactNode;
};

export const openedFolderContext = createContext<ChildDirectory | undefined>(undefined);
export const setOpenedFolderContext = createContext<React.Dispatch<React.SetStateAction<ChildDirectory>>>(() => {});

const OpenedFolderProvider: React.FC<Props> = ({ children }) => {
    const [openedFolder, setOpenedFolder] = useState<ChildDirectory | undefined>(undefined);
    return (
        <openedFolderContext.Provider value={openedFolder}>
            <setOpenedFolderContext.Provider value={setOpenedFolder}>{children}</setOpenedFolderContext.Provider>
        </openedFolderContext.Provider>
    );
};

export default OpenedFolderProvider;
