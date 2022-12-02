import React, { createContext, ReactNode, useContext } from 'react';
import { Word } from '../List';
import { setWordsContext, wordsContext } from './WordsProvider';

type Props = {
    children: ReactNode;
};

export const editListItemContext = createContext<(word: Word, deleted?: boolean) => void>(() => {});

const EditListItemProvider: React.FC<Props> = ({ children }) => {
    const words = useContext(wordsContext);
    const setWords = useContext(setWordsContext);
    const editListItem = (word: Word, deleted: boolean = false) => {
        if (deleted) {
            const editedWords = [...words].filter((originalWord) => {
                if (originalWord.id === word.id) {
                    return false;
                }
                return true;
            });
            setWords(editedWords);
            return;
        }
        const editedWords = [...words].map((originalWord) => {
            if (originalWord.id === word.id) {
                return word;
            }
            return originalWord;
        });
        setWords(editedWords);
    };
    return <editListItemContext.Provider value={editListItem}>{children}</editListItemContext.Provider>;
};

export default EditListItemProvider;
