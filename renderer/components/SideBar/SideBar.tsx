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
import DeleteModal, { handleConfirm, ModalResolveType } from '../DeleteModal';
import SetUrlModal from '../SetUrlModal';

export type ChildDirectory = { type: 'child'; id: number | undefined; name: string; parentId: number; url: string };
export type ParentDirectory = { type: 'parent'; id: number | undefined; name: string };
export type DirectoryStructure = {
    parent: ParentDirectory;
    children: ChildDirectory[];
};

export type URL = {
    folderId: number;
    folderName: string;
    url: string;
};

export type isSelectedType = {
    [parent: string]: { parent: boolean; children: boolean[] };
};

export type isOpenStatesType = {
    [parent: string]: boolean;
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
    const [isShow, setIsShow] = useState<boolean>(false);
    const [modalResolve, setModalResolve] = useState<ModalResolveType | undefined>();
    const [deleteDirectory, setDeleteDirectory] = useState<string>('');
    const [isShowSetUrlModal, setIsShowSetUrlModal] = useState<boolean>(false);
    const [setUrlFolder, setSetUrlFolder] = useState<ChildDirectory>({} as ChildDirectory);

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
            isSelectedObject[parent.name] = { parent: false, children };
        }
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

    const collapseAll = () => {
        const newStates = {};
        for (const parent of Object.keys(isOpenStates)) {
            newStates[parent] = false;
        }
        setIsOpenStates(newStates);
    };

    const deleteFolder = (deletedDirectory: ParentDirectory | ChildDirectory) => {
        if (deletedDirectory.type === 'parent') {
            const newDirectoryStructure = [...directoryStructure].filter((directory) => {
                return directory.parent.id !== deletedDirectory.id;
            });
            setDirectoryStructure(newDirectoryStructure);
            return;
        }
        const newDirectoryStructure: DirectoryStructure[] = [...directoryStructure].map((directory) => {
            if (directory.parent.id !== deletedDirectory.parentId) return directory;

            const deletedChildren = directory.children.filter((_child) => _child.name !== deletedDirectory.name);

            return { ...directory, children: deletedChildren };
        });
        setDirectoryStructure(newDirectoryStructure);
    };

    const handleParentItemClick = async ({ id, props }: ItemParams<{ directory: ParentDirectory }>) => {
        if (id === 'delete') {
            setDeleteDirectory(props.directory.name);
            const ok = await handleConfirm(setIsShow, setModalResolve);
            if (ok) {
                global.ipcRenderer.send('delete-parent-folder', props.directory);
                deleteFolder(props.directory);
            }
            setDeleteDirectory('');
            return;
        }
        if (id === 'edit') {
            handleEditFolder(props.directory);
            return;
        }
    };
    const handleChildItemClick = async ({ id, props }: ItemParams<{ directory: ChildDirectory }>) => {
        if (id === 'delete') {
            setDeleteDirectory(
                `${
                    directoryStructure.find((directory) => directory.parent.id === props.directory.parentId).parent.name
                }/${props.directory.name}`
            );
            const ok = await handleConfirm(setIsShow, setModalResolve);
            if (ok) {
                global.ipcRenderer.send('delete-child-folder', props.directory);
                deleteFolder(props.directory);
            }
            setDeleteDirectory('');
            return;
        }
        if (id === 'url') {
            setUrl(props.directory);
            return;
        }
        if (id === 'edit') {
            handleEditFolder(props.directory);
            return;
        }
        return;
    };
    const setUrl = (directory: ChildDirectory) => {
        setIsShowSetUrlModal(true);
        setSetUrlFolder(directory);
    };
    return (
        <div className="rounded-tr-sm rounded-br-sm flex flex-row h-full  relative">
            <DeleteModal
                isShow={isShow}
                close={() => {
                    setIsShow(false);
                }}
                resolve={modalResolve}
                deleteValue={deleteDirectory}
            />
            <SetUrlModal
                isShow={isShowSetUrlModal}
                close={() => {
                    setIsShowSetUrlModal(false);
                }}
                folder={setUrlFolder}
            ></SetUrlModal>
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
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (
                                            directoryStructure
                                                .map((directory) => {
                                                    return directory.parent.name;
                                                })
                                                .includes(newFolderNameInputValue) ||
                                            newFolderNameInputValue === ''
                                        ) {
                                            return;
                                        }
                                        const newStates = [...directoryStructure];
                                        newStates.push({
                                            parent: { name: newFolderNameInputValue, id: undefined, type: 'parent' },
                                            children: [],
                                        });
                                        setDirectoryStructure(newStates);
                                        setNewFolderNameInputValue('');
                                        setIsCreatingNewFolder(false);
                                        const status = (await global.ipcRenderer.invoke(
                                            'create-new-parent-folder',
                                            newFolderNameInputValue
                                        )) as number;
                                        if (status === 201) {
                                            const allFolders = (await global.ipcRenderer.invoke(
                                                'get-all-folders'
                                            )) as DirectoryStructure[];
                                            setDirectoryStructure(allFolders);
                                        }
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
            <Menu id={'parent-directory'}>
                <Item id="delete" onClick={handleParentItemClick}>
                    <VscTrash />
                    <span className="ml-3">削除...</span>
                </Item>
                <Item id="edit" onClick={handleParentItemClick}>
                    <VscEdit />
                    <span className="ml-3">編集...</span>
                </Item>
            </Menu>
            <Menu id={'child-directory'}>
                <Item id="delete" onClick={handleChildItemClick}>
                    <VscTrash />
                    <span className="ml-3">削除...</span>
                </Item>
                <Item id="url" onClick={handleChildItemClick}>
                    <VscEdit />
                    <span className="ml-3">urlを登録...</span>
                </Item>
                <Item id="edit" onClick={handleChildItemClick}>
                    <VscEdit />
                    <span className="ml-3">編集...</span>
                </Item>
            </Menu>
        </div>
    );
};

export default SideBar;
