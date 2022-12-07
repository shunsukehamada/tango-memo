import React, { createContext, ReactNode } from 'react';
import { useContextMenu } from 'react-contexify';

type Props = {
    children: ReactNode;
};

type ParentType = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string) => void;
type ChildType = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string, child: string) => void;

export const handleParentContextMenuContext = createContext<ParentType>(() => {});
export const handleChildContextMenuContext = createContext<ChildType>(() => {});

const HandleContextMenuProvider: React.FC<Props> = ({ children }) => {
    const showParent = useContextMenu({
        id: 'parent-directory',
    }).show;

    const showChild = useContextMenu({
        id: 'child-directory',
    }).show;

    const handleParentContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string) => {
        showParent({
            event,
            props: {
                parent,
            },
        });
    };
    const handleChildContextMenu = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        parent: string,
        child: string
    ) => {
        showChild({
            event,
            props: {
                parent,
                child,
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
