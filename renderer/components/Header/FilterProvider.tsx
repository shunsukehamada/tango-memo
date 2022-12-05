import React, { createContext, ReactNode, useState } from 'react';
import { PoSsType } from '../../pages/register';

type Props = {
    children: ReactNode;
};

type filterContextType = { [pos in PoSsType]: boolean };

export const filterContext = createContext<filterContextType>({
    Noun: false,
    Verb: false,
    Adjective: false,
    Adverb: false,
    Conjunction: false,
    Pronoun: false,
    Preposition: false,
    Interjection: false,
});
export const setFilterContext = createContext<React.Dispatch<React.SetStateAction<filterContextType>>>(() => {});

const FilterProvider: React.FC<Props> = ({ children }) => {
    const [filterStates, setFilterStates] = useState<filterContextType>({
        Noun: false,
        Verb: false,
        Adjective: false,
        Adverb: false,
        Conjunction: false,
        Pronoun: false,
        Preposition: false,
        Interjection: false,
    });
    return (
        <filterContext.Provider value={filterStates}>
            <setFilterContext.Provider value={setFilterStates}>{children}</setFilterContext.Provider>
        </filterContext.Provider>
    );
};

export default FilterProvider;
