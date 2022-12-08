import React, { createContext, ReactNode, useContext } from 'react';
import { ParentDirectory } from '../SideBar';
import { isOpenStatesContext, setIsOpenStatesContext } from './IsOpenStatesProvider';

type Props = {
    children: ReactNode;
};

export const handleIsOpenStatesContext = createContext<(parent: ParentDirectory, open?: boolean) => void>(() => {});

const HandleIsOpenStatesProvider: React.FC<Props> = ({ children }) => {
    const isOpenStates = useContext(isOpenStatesContext);
    const setIsOpenStates = useContext(setIsOpenStatesContext);

    const handleIsOpenStates = (parent: ParentDirectory, open: boolean = false): void => {
        const newStates = { ...isOpenStates };
        newStates[parent?.name] = open ? true : !newStates[parent.name];
        setIsOpenStates(newStates);
    };
    return (
        <handleIsOpenStatesContext.Provider value={handleIsOpenStates}>{children}</handleIsOpenStatesContext.Provider>
    );
};

export default HandleIsOpenStatesProvider;
