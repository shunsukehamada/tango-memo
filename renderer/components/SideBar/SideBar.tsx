import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Item, ItemParams, Menu } from 'react-contexify';
import { VscCollapseAll, VscEdit, VscNewFolder, VscTrash } from 'react-icons/vsc';
import { directoryContext, setDirectoryContext } from './Providers/DirectoryProvider';
import DirectoryList from './DirectoryList';
import { isSelectedContext, setIsSelectedContext } from './Providers/IsSelectedProvider';
import { isOpenStatesContext, setIsOpenStatesContext } from './Providers/IsOpenStatesProvider';
import { handleIsOpenStatesContext } from './Providers/HandleIsOpenStatesProvider';
import { handleSelectContext } from './Providers/HandleSelectProvider';
import {
    newFolderNameInputValueContext,
    setNewFolderNameInputValueContext,
} from './Providers/NewFolderNameInputValueProvider';
import { isCreatingNewFolderContext, setIsCreatingNewFolderContext } from './Providers/isCreatingNewFolderProvider';
import { handleEditFolderContext, setEditFolderContext } from './Providers/HandleEditFolderProvider';

export type DirectoryStructure = {
    readonly parent: string;
    readonly children: string[];
};

export type isSelectedType = {
    [parent: DirectoryStructure['parent']]: { parent: boolean; children: boolean[] };
};

export type isOpenStatesType = {
    [parent: DirectoryStructure['parent']]: boolean;
};

const SideBar: React.FC = () => {
    const directoryStructure = useContext(directoryContext);
    const setDirectoryStructure = useContext(setDirectoryContext);
    const isSelected = useContext(isSelectedContext);
    const setIsSelected = useContext(setIsSelectedContext);
    const isOpenStates = useContext(isOpenStatesContext);
    const setIsOpenStates = useContext(setIsOpenStatesContext);
    const handleIsOpenStates = useContext(handleIsOpenStatesContext);
    const { unselectAll } = useContext(handleSelectContext);
    const newFolderNameInputValue = useContext(newFolderNameInputValueContext);
    const setNewFolderNameInputValue = useContext(setNewFolderNameInputValueContext);
    const isCreatingNewFolder = useContext(isCreatingNewFolderContext);
    const setIsCreatingNewFolder = useContext(setIsCreatingNewFolderContext);
    const setEditFolder = useContext(setEditFolderContext);
    const handleEditFolder = useContext(handleEditFolderContext);

    const [isDeletingFolder, setIsDeletingFolder] = useState<boolean>(false);
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
        const parents = [...directoryStructure].map((directory) => {
            return directory.parent;
        });
        const isSelectedObject: isSelectedType = {};
        for (const parent of parents) {
            const children = Array(
                [...directoryStructure].find((directory) => {
                    return directory.parent === parent;
                }).children.length
            ).fill(false);
            isSelectedObject[parent] = { parent: false, children };
        }
        setIsSelected(isSelectedObject);
    }, [directoryStructure]);

    useEffect(() => {
        if (isDeletingFolder) {
            setIsDeletingFolder(false);
        }
    }, [isDeletingFolder]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const collapseAll = () => {
        const newStates = {};
        for (const parent of Object.keys(isOpenStates)) {
            newStates[parent] = false;
        }
        setIsOpenStates(newStates);
    };

    const deleteFolder = (parent: string, child?: string) => {
        if (!child) {
            const newDirectoryStructure = [...directoryStructure].filter((directory) => directory.parent !== parent);
            setDirectoryStructure(newDirectoryStructure);
            return;
        }
        const newDirectoryStructure: DirectoryStructure[] = [...directoryStructure].map((directory) => {
            if (directory.parent !== parent) return directory;

            const deletedChildren = directory.children.filter((_child) => _child !== child);

            return { parent: directory.parent, children: deletedChildren };
        });
        setDirectoryStructure(newDirectoryStructure);
    };

    const handleItemClick = ({ id, props }: ItemParams<{ parent: string; child?: string }>) => {
        if (id === 'delete') {
            if (confirm(`${props.child ? `${props.parent}/${props.child}` : props.parent}を削除しますか?`)) {
                setIsDeletingFolder(true);
                props.child
                    ? global.ipcRenderer.send('delete-child-folder', props)
                    : global.ipcRenderer.send('delete-parent-folder', props);
                deleteFolder(props.parent, props.child);
            }
            return;
        }
        if (id === 'edit') {
            handleEditFolder(props);
            return;
        }
    };
    return (
        <div className="rounded-tr-sm rounded-br-sm flex flex-row h-full  relative">
            <div
                className="grow-0 shrink-0 flex border-r-2 border-solid border-gray-400 flex-row"
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
                    setEditFolder({ isEditingFolder: false });
                }}
            >
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-end border-y-2 border-solid border-gray-300 py-1">
                        <div
                            className="px-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditFolder({ isEditingFolder: false });
                                setIsCreatingNewFolder(true);
                                const selectedIndex = Object.keys(isSelected)
                                    .map((parent) => {
                                        return isSelected[parent];
                                    })
                                    .findIndex((isSelectedArray) => {
                                        if (isSelectedArray.children.includes(true)) {
                                            return true;
                                        }
                                        return false;
                                    });
                                if (selectedIndex !== -1) {
                                    handleIsOpenStates(directoryStructure[selectedIndex].parent, true);
                                }
                            }}
                        >
                            <VscNewFolder size={'2em'} />
                        </div>

                        <div
                            className="px-2 cursor-pointer"
                            onClick={() => {
                                collapseAll();
                                setEditFolder({ isEditingFolder: false });
                            }}
                        >
                            <VscCollapseAll size={'2em'} />
                        </div>
                    </div>
                    <DirectoryList />

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
                                        value={newFolderNameInputValue}
                                        onChange={(event) => setNewFolderNameInputValue(event.target.value)}
                                        className="w-full border-2 border-solid border-gray-400 text-xl font-bold"
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
            <div className="flex-1 flex flex-col h-full max-h-full z-10"></div>
            <Menu id={'directory'}>
                <Item id="delete" onClick={handleItemClick}>
                    <VscTrash />
                    削除
                </Item>
                <Item id="edit" onClick={handleItemClick}>
                    <VscEdit />
                    編集
                </Item>
            </Menu>
        </div>
    );
};

export default SideBar;
