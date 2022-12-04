import React, { createContext, ReactNode, useContext } from 'react';
import { Word } from '../../List/List';
import { setWordsContext } from '../../List/Providers/WordsProvider';

type Props = {
    children: ReactNode;
};

export const getWordsContext = createContext<(parentFolder: string, folder: string) => Promise<void>>(async () => {});

const GetWordsProvider: React.FC<Props> = ({ children }) => {
    const setWords = useContext(setWordsContext);
    const getWords = async (parentFolder: string, folder: string): Promise<void> => {
        const words: Word[] = await global.ipcRenderer.invoke('get-words', parentFolder, folder);
        console.log(words);
        setWords(words);
    };
    return <getWordsContext.Provider value={getWords}>{children}</getWordsContext.Provider>;
};

export default GetWordsProvider;
