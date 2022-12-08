import React, { createContext, ReactNode } from 'react';
import { useContextMenu } from 'react-contexify';
import { ChildDirectory, ParentDirectory } from '../SideBar';

type Props = {
    children: ReactNode;
};

type ParentType = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, directory: ParentDirectory) => void;
type ChildType = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, directory: ChildDirectory) => void;

export const handleParentContextMenuContext = createContext<ParentType>(() => {});
export const handleChildContextMenuContext = createContext<ChildType>(() => {});

const HandleContextMenuProvider: React.FC<Props> = ({ children }) => {
    const showParent = useContextMenu({
        id: 'parent-directory',
    }).show;

    const showChild = useContextMenu({
        id: 'child-directory',
    }).show;

    const handleParentContextMenu = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        directory: ParentDirectory
    ) => {
        showParent({
            event,
            props: {
                directory,
            },
        });
    };
    const handleChildContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, directory: ChildDirectory) => {
        showChild({
            event,
            props: {
                directory,
            },
        });
    };
    return (
        <handleParentContextMenuContext.Provider value={handleParentContextMenu}>
            <handleChildContextMenuContext.Provider value={handleChildContextMenu}>
                {children}
            </handleChildContextMenuContext.Provider>
        </handleParentContextMenuContext.Provider>
    );
};
export default HandleContextMenuProvider;
