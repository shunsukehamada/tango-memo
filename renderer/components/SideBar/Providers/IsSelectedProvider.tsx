import React, { createContext, ReactNode, useState } from 'react';
import { isSelectedType } from '../SideBar';

type Props = {
    children: ReactNode;
};

export const isSelectedContext = createContext<isSelectedType>({});
export const setIsSelectedContext = createContext<React.Dispatch<React.SetStateAction<isSelectedType>>>(() => {});

const IsSelectedProvider: React.FC<Props> = ({ children }) => {
    const [isSelected, setIsSelected] = useState<isSelectedType>({});
    return (
        <isSelectedContext.Provider value={isSelected}>
            <setIsSelectedContext.Provider value={setIsSelected}>{children}</setIsSelectedContext.Provider>
        </isSelectedContext.Provider>
    );
};

export default IsSelectedProvider;
