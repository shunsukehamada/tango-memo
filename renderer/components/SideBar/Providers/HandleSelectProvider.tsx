import React, { createContext, ReactNode, useContext } from 'react';
import { isSelectedType } from '../SideBar';
import { isSelectedContext, setIsSelectedContext } from './IsSelectedProvider';

type Props = { children: ReactNode };

type handleSelectValue = {
    handleChildrenSelect: (parentName: string, childIndex: number) => void;
    handleParentSelect: (parentName: string) => void;
    unselectAll: () => void;
};
export const handleSelectContext = createContext<handleSelectValue>({} as handleSelectValue);

const HandleSelectProvider: React.FC<Props> = ({ children }) => {
    const isSelected = useContext(isSelectedContext);
    const setIsSelected = useContext(setIsSelectedContext);

    const handleChildrenSelect = (parentName: string, childIndex: number): void => {
        unselectAll();
        const newStates: isSelectedType = { ...isSelected };
        newStates[parentName].children[childIndex] = true;
        setIsSelected(newStates);
    };

    const handleParentSelect = (parentName: string) => {
        unselectAll();
        const newStates: isSelectedType = { ...isSelected };
        newStates[parentName].parent = !newStates[parentName].parent;
        setIsSelected(newStates);
    };

    const unselectAll = () => {
        const newStates: isSelectedType = { ...isSelected };
        for (const parent of Object.keys(isSelected)) {
            newStates[parent].parent = false;
            newStates[parent].children = [...isSelected[parent].children].map(() => false);
        }
        setIsSelected(newStates);
    };
    return (
        <handleSelectContext.Provider value={{ handleChildrenSelect, handleParentSelect, unselectAll }}>
            {children}
        </handleSelectContext.Provider>
    );
};

export default HandleSelectProvider;
