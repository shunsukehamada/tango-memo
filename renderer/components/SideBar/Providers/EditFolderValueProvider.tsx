import React, { createContext, ReactNode, useState } from 'react';

type Props = {
    children: ReactNode;
};

export const folderValueContext = createContext<string>('');
export const setFolderValueContext = createContext<React.Dispatch<React.SetStateAction<string>>>(() => {});

const EditFolderValueProvider: React.FC<Props> = ({ children }) => {
    const [value, setValue] = useState<string>('');

    return (
        <folderValueContext.Provider value={value}>
            <setFolderValueContext.Provider value={setValue}>{children}</setFolderValueContext.Provider>
        </folderValueContext.Provider>
    );
};

export default EditFolderValueProvider;
