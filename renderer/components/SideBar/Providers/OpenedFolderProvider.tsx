import React, { createContext, ReactNode, useState } from 'react';

type Props = {
    children: ReactNode;
};

type openedFolderContextValueType = {
    parent: string;
    folder: string;
};

type setOpenedFolderContextValueType = React.Dispatch<
    React.SetStateAction<{
        parent: string;
        folder: string;
    }>
>;

export const openedFolderContext = createContext<openedFolderContextValueType>({} as openedFolderContextValueType);
export const setOpenedFolderContext = createContext<setOpenedFolderContextValueType>(() => {});

const OpenedFolderProvider: React.FC<Props> = ({ children }) => {
    const [openedFolder, setOpenedFolder] = useState<{ parent: string; folder: string } | null>(null);
    return (
        <openedFolderContext.Provider value={openedFolder}>
            <setOpenedFolderContext.Provider value={setOpenedFolder}>{children}</setOpenedFolderContext.Provider>
        </openedFolderContext.Provider>
    );
};

export default OpenedFolderProvider;
