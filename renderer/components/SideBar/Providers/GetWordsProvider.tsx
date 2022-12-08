import React, { createContext, ReactNode, useContext } from 'react';
import { Word } from '../../List/List';
import { setWordsContext } from '../../List/Providers/WordsProvider';

type Props = {
    children: ReactNode;
};

export const getWordsContext = createContext<(id: number) => Promise<void>>(async () => {});

const GetWordsProvider: React.FC<Props> = ({ children }) => {
    const setWords = useContext(setWordsContext);
    const getWords = async (id: number): Promise<void> => {
        const words: Word[] = await global.ipcRenderer.invoke('get-words', id);
        setWords(words);
    };
    return <getWordsContext.Provider value={getWords}>{children}</getWordsContext.Provider>;
};

export default GetWordsProvider;
