import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { directoryContext } from './DirectoryProvider';
import { handleIsOpenStatesContext } from './HandleIsOpenStatesProvider';
import { isSelectedContext } from './IsSelectedProvider';

type Props = { children: ReactNode };

export const isCreatingNewFolderContext = createContext<boolean>(false);
export const setIsCreatingNewFolderContext = createContext<React.Dispatch<React.SetStateAction<boolean>>>(() => {});

const isCreatingNewFolderProvider: React.FC<Props> = ({ children }) => {
    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
    const isSelected = useContext(isSelectedContext);
    const handleIsOpenStates = useContext(handleIsOpenStatesContext);
    const directoryStructure = useContext(directoryContext);

    const getSelectedParentIndex = () => {
        return Object.keys(isSelected).findIndex((parent) => {
            return isSelected[parent].parent || isSelected[parent].children.includes(true);
        });
    };

    useEffect(() => {
        if (!isCreatingNewFolder) return;
        const index = getSelectedParentIndex();
        handleIsOpenStates(directoryStructure[index]?.parent, true);
    }, [isCreatingNewFolder]);
    return (
        <isCreatingNewFolderContext.Provider value={isCreatingNewFolder}>
            <setIsCreatingNewFolderContext.Provider value={setIsCreatingNewFolder}>
                {children}
            </setIsCreatingNewFolderContext.Provider>
        </isCreatingNewFolderContext.Provider>
    );
};

export default isCreatingNewFolderProvider;
