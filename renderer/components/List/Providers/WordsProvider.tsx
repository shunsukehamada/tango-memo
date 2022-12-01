import React, { createContext, ReactNode, useState } from 'react';
import { Word } from '../List';

type Props = {
    children: ReactNode;
};

export const wordsContext = createContext<Word[]>([]);
export const setWordsContext = createContext<React.Dispatch<React.SetStateAction<Word[]>>>(() => {});

const WordsProvider: React.FC<Props> = ({ children }) => {
    const [words, setWords] = useState<Word[]>([]);
    return (
        <wordsContext.Provider value={words}>
            <setWordsContext.Provider value={setWords}>{children}</setWordsContext.Provider>
        </wordsContext.Provider>
    );
};

export default WordsProvider;
