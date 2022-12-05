import React, { createContext, ReactNode, useState } from 'react';

type Props = {
    children: ReactNode;
};

export const valueContext = createContext<string>('');
export const setValueContext = createContext<React.Dispatch<React.SetStateAction<string>>>(() => {});

const SearchWordsProvider: React.FC<Props> = ({ children }) => {
    const [value, setValue] = useState<string>('');
    return (
        <valueContext.Provider value={value}>
            <setValueContext.Provider value={setValue}>{children}</setValueContext.Provider>
        </valueContext.Provider>
    );
};

export default SearchWordsProvider;
