import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdCreateNewFolder, MdOutlineCreateNewFolder } from 'react-icons/md';
import { VscCollapseAll, VscNewFolder } from 'react-icons/vsc';
import Collapse from './Collapse';

export type DirectoryStructure = {
    parent: string;
    children: string[];
};

type Props = {
    directoryStructure: DirectoryStructure[];
    setDirectoryStructure: React.Dispatch<React.SetStateAction<DirectoryStructure[]>>;
    getWords: (parentFolder: string, folder: string) => Promise<void>;
};

const SideBar: React.FC<Props> = ({ directoryStructure, setDirectoryStructure, getWords }: Props) => {
    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
    const [isOpenStates, setIsOpenStates] = useState<boolean[]>([]);
    const [isSelectedStates, setIsSelectedStates] = useState<boolean[]>([]);
    const [newFolderNameInputValue, setNewFolderNameInputValue] = useState('');
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
        setIsOpenStates(Array(directoryStructure.length).fill(false));
        setIsSelectedStates(Array(directoryStructure.length).fill(false));
    }, [directoryStructure]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const handleIsOpenStates = (index: number, open: boolean = false): void => {
        const newStates = [...isOpenStates];
        newStates.splice(index, 1, open ? true : !newStates[index]);
        setIsOpenStates(newStates);
    };
    const collapseAll = () => {
        setIsOpenStates([...isOpenStates].map(() => false));
    };

    const handleIsSelectedStates = (index: number): void => {
        const newStates = [...isSelectedStates].map(() => false);
        newStates.splice(index, 1, !newStates[index]);
        setIsSelectedStates(newStates);
    };

    return (
        <div className="rounded-tr-sm rounded-br-sm flex flex-row h-full py-2 relative">
            <div
                className="grow-0 shrink-0 flex border-r-2 border-solid border-gray-400 flex-row bg-white my-2"
                ref={sidebarRef}
                style={{
                    width: sidebarWidth,
                    maxWidth: '300px',
                    minWidth: '100px',
                    display: sidebarWidth <= 30 ? 'none' : 'block',
                }}
                onClick={() => {
                    setIsSelectedStates([...isSelectedStates].map(() => false));
                    setIsCreatingNewFolder(false);
                }}
            >
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-end border-y-2 border-solid border-gray-300 py-1">
                        <div
                            className="px-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCreatingNewFolder(true);
                                if (isSelectedStates.includes(true)) {
                                    const index = isSelectedStates.indexOf(true);
                                    handleIsOpenStates(index, true);
                                }
                            }}
                        >
                            <VscNewFolder size={'2em'} />
                        </div>
                        <div className="px-2 cursor-pointer" onClick={collapseAll}>
                            <VscCollapseAll size={'2em'} />
                        </div>
                    </div>
                    {directoryStructure.map((directory, index) => {
                        return (
                            <div key={directory.parent} className="w-full">
                                <div className="pl-1 pt-3 overflow-hidden flex flex-col items-start">
                                    <ul className="w-full">
                                        <Collapse
                                            summary={
                                                <div className="flex before:content-['>']">
                                                    <li className="overflow-hidden ml-1">
                                                        <span className="text-xl font-bold cursor-pointer select-none">
                                                            {directory.parent}
                                                        </span>
                                                    </li>
                                                </div>
                                            }
                                            details={
                                                <ul className="overflow-hidden">
                                                    {isCreatingNewFolder && isSelectedStates[index] && (
                                                        <div
                                                            className="ml-4 my-1 flex before:content-['>']"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <form
                                                                onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    if (
                                                                        directoryStructure[index].children.includes(
                                                                            newFolderNameInputValue
                                                                        ) ||
                                                                        newFolderNameInputValue === ''
                                                                    ) {
                                                                        return;
                                                                    }
                                                                    const newStates = [...directoryStructure];
                                                                    newStates[index].children.push(
                                                                        newFolderNameInputValue
                                                                    );
                                                                    setDirectoryStructure(newStates);
                                                                    setNewFolderNameInputValue('');
                                                                    setIsCreatingNewFolder(false);
                                                                    global.ipcRenderer.send(
                                                                        'create-new-folder',
                                                                        newStates[index].parent,
                                                                        newFolderNameInputValue
                                                                    );
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    defaultValue={newFolderNameInputValue}
                                                                    onChange={(event) =>
                                                                        setNewFolderNameInputValue(event.target.value)
                                                                    }
                                                                    className="border-2 border-solid border-gray-400 ml-1"
                                                                    autoFocus={true}
                                                                />
                                                            </form>
                                                        </div>
                                                    )}
                                                    {directory.children.map((child) => {
                                                        return (
                                                            <div
                                                                key={child}
                                                                className="ml-4 my-1 flex before:content-['>']"
                                                                onClick={() => {
                                                                    getWords(directory.parent, child);
                                                                }}
                                                            >
                                                                <li className="ml-1  cursor-pointer">
                                                                    <span className="text-lg inline-block whitespace-nowrap">
                                                                        {child}
                                                                    </span>
                                                                </li>
                                                            </div>
                                                        );
                                                    })}
                                                </ul>
                                            }
                                            isOpen={isOpenStates[index]}
                                            onClick={handleIsOpenStates}
                                            index={index}
                                            isSelected={isSelectedStates[index]}
                                            isSelectedHandler={handleIsSelectedStates}
                                        />
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                    {isCreatingNewFolder &&
                        isSelectedStates.every((state) => {
                            return !state;
                        }) && (
                            <div
                                className=" w-full  flex justify-center relative before:content-['>'] before:absolute before:left-1 before:top-2 px-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (
                                            directoryStructure
                                                .map((directory) => {
                                                    return directory.parent;
                                                })
                                                .includes(newFolderNameInputValue) ||
                                            newFolderNameInputValue === ''
                                        ) {
                                            return;
                                        }
                                        const newStates = [...directoryStructure];
                                        newStates.push({ parent: newFolderNameInputValue, children: [] });
                                        setDirectoryStructure(newStates);
                                        setNewFolderNameInputValue('');
                                        setIsCreatingNewFolder(false);
                                        global.ipcRenderer.send('create-new-parent-folder', newFolderNameInputValue);
                                    }}
                                    className="w-full m-2"
                                >
                                    <input
                                        type="text"
                                        defaultValue={newFolderNameInputValue}
                                        onChange={(event) => setNewFolderNameInputValue(event.target.value)}
                                        className="w-full border-2 border-solid border-gray-400"
                                        autoFocus={true}
                                    />
                                </form>
                            </div>
                        )}
                </div>
            </div>
            <div
                className="grow-0 shrink-0 w-2 justify-end cursor-col-resize resize-x opacity-0 hover:w-2 hover:bg-gray-400 hover:opacity-100 select-none rounded-full my-1"
                onMouseDown={startResizing}
            ></div>
            <div className="flex-1 flex flex-col bg-white h-full max-h-full z-10"></div>
        </div>
    );
};

export default SideBar;
