import React, { createContext, ReactNode, useState } from 'react';
import { isOpenStatesType } from '../SideBar';

type Props = {
    children: ReactNode;
};

export const isOpenStatesContext = createContext<isOpenStatesType>({});
export const setIsOpenStatesContext = createContext<React.Dispatch<React.SetStateAction<isOpenStatesType>>>(() => {});

const IsOpenStatesProvider: React.FC<Props> = ({ children }) => {
    const [isOpenStates, setIsOpenStates] = useState<isOpenStatesType>();
    return (
        <isOpenStatesContext.Provider value={isOpenStates}>
            <setIsOpenStatesContext.Provider value={setIsOpenStates}>{children}</setIsOpenStatesContext.Provider>
        </isOpenStatesContext.Provider>
    );
};

export default IsOpenStatesProvider;
