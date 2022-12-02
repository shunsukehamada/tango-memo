import React, { createContext, ReactNode } from 'react';
import { useContextMenu } from 'react-contexify';

type Props = {
    children: ReactNode;
};

type ValueType = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string, child?: string) => void;

export const handleContextMenuContext = createContext<ValueType>(() => {});

const HandleContextMenuProvider: React.FC<Props> = ({ children }) => {
    const MENU_ID = 'directory';
    const { show } = useContextMenu({
        id: MENU_ID,
    });

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, parent: string, child?: string) => {
        show({
            event,
            props: {
                parent,
                child,
            },
        });
    };
    return <handleContextMenuContext.Provider value={handleContextMenu}>{children}</handleContextMenuContext.Provider>;
};
export default HandleContextMenuProvider;
