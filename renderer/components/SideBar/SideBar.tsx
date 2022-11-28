import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VscCollapseAll, VscNewFolder } from 'react-icons/vsc';
import Collapse from './Collapse';
import DirectoryList from './DirectoryList';
import Directory from './DirectoryList';

export type DirectoryStructure = {
    parent: string;
    children: string[];
};

type Props = {
    directoryStructure: DirectoryStructure[];
    setDirectoryStructure: React.Dispatch<React.SetStateAction<DirectoryStructure[]>>;
    getWords: (parentFolder: string, folder: string) => Promise<void>;
    setOpenedFolder: React.Dispatch<
        React.SetStateAction<{
            parent: string;
            folder: string;
        }>
    >;
};

export type isSelectedType = {
    [parent: DirectoryStructure['parent']]: { parent: boolean; children: boolean[] };
};
const SideBar: React.FC<Props> = ({ directoryStructure, setDirectoryStructure, getWords, setOpenedFolder }: Props) => {
    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
    const [isOpenStates, setIsOpenStates] = useState<boolean[]>([]);
    const [isSelected, setIsSelected] = useState<isSelectedType>({});
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
        const parents = directoryStructure.map((directory) => {
            return directory.parent;
        });
        const isSelectedObject: isSelectedType = {};
        for (const parent of parents) {
            const children = Array(
                directoryStructure.find((directory) => {
                    return directory.parent === parent;
                }).children.length
            ).fill(false);
            isSelectedObject[parent] = { parent: false, children };
        }
        setIsOpenStates(Array(directoryStructure.length).fill(false));
        setIsSelected(isSelectedObject);
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

    const getSelectedParentIndex = () => {
        return Object.keys(isSelected).findIndex((parent) => {
            return isSelected[parent].parent || isSelected[parent].children.includes(true);
        });
    };

    useEffect(() => {
        if (!isCreatingNewFolder) return;
        const index = getSelectedParentIndex();
        handleIsOpenStates(index, true);
    }, [isCreatingNewFolder]);

    return (
        <div className="rounded-tr-sm rounded-br-sm flex flex-row h-full  relative">
            <div
                className="grow-0 shrink-0 flex border-r-2 border-solid border-gray-400 flex-row bg-white my"
                ref={sidebarRef}
                style={{
                    width: sidebarWidth,
                    maxWidth: '300px',
                    minWidth: '100px',
                    display: sidebarWidth <= 30 ? 'none' : 'block',
                }}
                onClick={() => {
                    unselectAll();
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
                                const selectedIndex = Object.keys(isSelected)
                                    .map((parent) => {
                                        return isSelected[parent];
                                    })
                                    .findIndex((isSelectedArray) => {
                                        if (isSelectedArray.children.includes(true)) {
                                            return true;
                                        }
                                    });
                                if (selectedIndex !== -1) {
                                    handleIsOpenStates(selectedIndex, true);
                                }
                            }}
                        >
                            <VscNewFolder size={'2em'} />
                        </div>
                        <div className="px-2 cursor-pointer" onClick={collapseAll}>
                            <VscCollapseAll size={'2em'} />
                        </div>
                    </div>

                    <DirectoryList
                        getWords={getWords}
                        directoryStructure={directoryStructure}
                        setDirectoryStructure={setDirectoryStructure}
                        isCreatingNewFolder={isCreatingNewFolder}
                        setIsCreatingNewFolder={setIsCreatingNewFolder}
                        newFolderNameInputValue={newFolderNameInputValue}
                        setNewFolderNameInputValue={setNewFolderNameInputValue}
                        handleParentSelect={handleParentSelect}
                        handleChildrenSelect={handleChildrenSelect}
                        isSelected={isSelected}
                        // setIsSelected={setIsSelected}
                        isOpenStates={isOpenStates}
                        setOpenedFolder={setOpenedFolder}
                        handleIsOpenStates={handleIsOpenStates}
                    />
                    {/* {directoryStructure.map((directory, index) => {
                        return (
                            <div key={directory.parent} className="w-full">
                                <div className="pl-1 pt-3 overflow-hidden flex flex-col items-start">
                                    <ul className="w-full">
                                        <Collapse
                                            summary={
                                                <div
                                                    className={`flex ${
                                                        isOpenStates[index]
                                                            ? "before:content-['∨']"
                                                            : "before:content-['>']"
                                                    }`}
                                                    onClick={() => {
                                                        setIsCreatingNewFolder(false);
                                                        handleParentSelect(directory.parent);
                                                    }}
                                                    style={
                                                        isSelected[directory.parent]?.parent
                                                            ? {
                                                                  backgroundColor: 'rgba(100, 100, 100, 0.3)',
                                                              }
                                                            : null
                                                    }
                                                >
                                                    <li className="overflow-hidden ml-1">
                                                        <span className="text-xl font-bold cursor-pointer select-none">
                                                            {directory.parent}
                                                        </span>
                                                    </li>
                                                </div>
                                            }
                                            details={
                                                <ul className="overflow-hidden">
                                                    {isCreatingNewFolder &&
                                                        (isSelected[directory.parent].children.includes(true) ||
                                                            isSelected[directory.parent].parent) && (
                                                            <div
                                                                className="ml-4 my-1 flex before:content-['>']"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsCreatingNewFolder(false);
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
                                                                            setNewFolderNameInputValue(
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        className="border-2 border-solid border-gray-400 ml-1"
                                                                        autoFocus={true}
                                                                    />
                                                                </form>
                                                            </div>
                                                        )}
                                                    {directory.children.map((child, index) => {
                                                        return (
                                                            <div
                                                                key={child}
                                                                className="pl-4 my-1 flex before:content-['>']"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsCreatingNewFolder(false);
                                                                    getWords(directory.parent, child);
                                                                    setOpenedFolder({
                                                                        parent: directory.parent,
                                                                        folder: child,
                                                                    });
                                                                    handleChildrenSelect(directory.parent, index);
                                                                }}
                                                                style={
                                                                    isSelected[directory.parent]?.children[index]
                                                                        ? {
                                                                              backgroundColor:
                                                                                  'rgba(100, 100, 100, 0.3)',
                                                                          }
                                                                        : null
                                                                }
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
                                            parent={directory.parent}
                                        />
                                    </ul>
                                </div>
                            </div>
                        );
                    })} */}

                    {isCreatingNewFolder &&
                        Object.keys(isSelected).every((parent) => {
                            return !isSelected[parent].children.includes(true) && !isSelected[parent].parent;
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
                className="grow-0 shrink-0 w-3 justify-end cursor-col-resize resize-x opacity-0 hover:opacity-100 select-none relative right-2 group"
                onMouseDown={startResizing}
                style={
                    sidebarWidth === 30
                        ? {
                              backgroundColor: 'rgb(59 130 246)',
                          }
                        : null
                }
            >
                <div className="w-1 h-full group-hover:bg-blue-500 mx-auto"></div>
            </div>
            <div className="flex-1 flex flex-col bg-white h-full max-h-full z-10"></div>
        </div>
    );
};

export default SideBar;
