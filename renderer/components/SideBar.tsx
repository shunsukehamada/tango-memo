import React, { useCallback, useEffect, useRef, useState } from 'react';
import Collapse from './Collapse';

type DirectoryStructure = {
    parent: string;
    children: string[];
};

type Props = {
    directoryStructure: DirectoryStructure[];
};

const SideBar: React.FC<Props> = ({ directoryStructure }: Props) => {
    const sidebarRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(268);
    const startResizing = useCallback((mouseDownEvent: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                if (mouseMoveEvent.clientX <= 50) {
                    setSidebarWidth(30);
                    return;
                }
                setSidebarWidth(mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left);
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div className="min-h-screen rounded-tr-sm rounded-br-sm flex flex-row h-screen">
            <div
                className="grow-0, shrink-0 flex border-2 border-solid border-gray-400 flex-row bg-white"
                ref={sidebarRef}
                style={{
                    width: sidebarWidth,
                    maxWidth: '300px',
                    minWidth: '100px',
                    display: sidebarWidth <= 30 && 'none',
                }}
                onMouseDown={(e) => e.preventDefault()}
            >
                <div className="flex-1 overflow-hidden">
                    {directoryStructure.map((directory) => {
                        return (
                            <div key={directory.parent} className="w-full">
                                <div className="pl-3 pt-3 overflow-hidden flex flex-col items-start">
                                    <ul>
                                        <Collapse
                                            summary={
                                                <li className="overflow-hidden">
                                                    <span className="text-xl font-bold cursor-pointer select-none">
                                                        {directory.parent}
                                                    </span>
                                                </li>
                                            }
                                            details={
                                                <ul className="overflow-hidden">
                                                    {directory.children.map((child) => {
                                                        return (
                                                            <li key={child} className="ml-5 my-1 cursor-pointer">
                                                                <span className="text-lg inline-block whitespace-nowrap">
                                                                    {child}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            }
                                        />
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div
                className="grow-0 shrink-0 w-2 justify-end cursor-col-resize resize-x opacity-0 hover:w-2 hover:bg-gray-400 hover:opacity-100 select-none"
                onMouseDown={startResizing}
            ></div>
            <div className="flex-1 flex flex-col bg-white h-screen max-h-full z-10"></div>
        </div>
    );
};

export default SideBar;
