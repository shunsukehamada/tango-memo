import React, { createContext, ReactNode, useState } from 'react';

type Props = { children: ReactNode };

export const newFolderNameInputValueContext = createContext<string>('');
export const setNewFolderNameInputValueContext = createContext<React.Dispatch<React.SetStateAction<string>>>(() => {});

const newFolderNameInputValueProvider: React.FC<Props> = ({ children }) => {
    const [newFolderNameInputValue, setNewFolderNameInputValue] = useState('');
    return (
        <newFolderNameInputValueContext.Provider value={newFolderNameInputValue}>
            <setNewFolderNameInputValueContext.Provider value={setNewFolderNameInputValue}>
                {children}
            </setNewFolderNameInputValueContext.Provider>
        </newFolderNameInputValueContext.Provider>
    );
};

export default newFolderNameInputValueProvider;
