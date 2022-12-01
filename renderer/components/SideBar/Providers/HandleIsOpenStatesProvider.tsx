import React, { createContext, ReactNode, useContext } from 'react';
import { isOpenStatesContext, setIsOpenStatesContext } from './IsOpenStatesProvider';

type Props = {
    children: ReactNode;
};

export const handleIsOpenStatesContext = createContext<(parent: string, open?: boolean) => void>(() => {});

const HandleIsOpenStatesProvider: React.FC<Props> = ({ children }) => {
    const isOpenStates = useContext(isOpenStatesContext);
    const setIsOpenStates = useContext(setIsOpenStatesContext);
    const handleIsOpenStates = (parent: string, open: boolean = false): void => {
        const newStates = { ...isOpenStates };
        newStates[parent] = open ? true : !newStates[parent];
        setIsOpenStates(newStates);
    };
    return (
        <handleIsOpenStatesContext.Provider value={handleIsOpenStates}>{children}</handleIsOpenStatesContext.Provider>
    );
};

export default HandleIsOpenStatesProvider;
