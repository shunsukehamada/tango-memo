import { FormEvent, useContext, useEffect, useRef } from 'react';
import { directoryContext, setDirectoryContext } from './Providers/DirectoryProvider';
import { folderValueContext, setFolderValueContext } from './Providers/EditFolderValueProvider';
import { getWordsContext } from './Providers/GetWordsProvider';
import { handleChildContextMenuContext, handleParentContextMenuContext } from './Providers/HandleContextMenuProvider';
import { editFolderContext, setEditFolderContext } from './Providers/HandleEditFolderProvider';
import { handleIsOpenStatesContext } from './Providers/HandleIsOpenStatesProvider';
import { handleSelectContext } from './Providers/HandleSelectProvider';
import { isCreatingNewFolderContext, setIsCreatingNewFolderContext } from './Providers/isCreatingNewFolderProvider';
import { isOpenStatesContext } from './Providers/IsOpenStatesProvider';
import { isSelectedContext } from './Providers/IsSelectedProvider';
import {
    newFolderNameInputValueContext,
    setNewFolderNameInputValueContext,
} from './Providers/NewFolderNameInputValueProvider';
import { setOpenedFolderContext } from './Providers/OpenedFolderProvider';

type Props = {
    index: number;
    parent: string;
};

const Collapse: React.FC<Props> = ({ index, parent }) => {
    const directoryStructure = useContext(directoryContext);
    const setDirectoryStructure = useContext(setDirectoryContext);
    const getWords = useContext(getWordsContext);
    const isSelected = useContext(isSelectedContext);
    const isOpenStates = useContext(isOpenStatesContext);
    const handleIsOpenStates = useContext(handleIsOpenStatesContext);
    const { handleChildrenSelect, handleParentSelect } = useContext(handleSelectContext);
    const newFolderNameInputValue = useContext(newFolderNameInputValueContext);
    const setNewFolderNameInputValue = useContext(setNewFolderNameInputValueContext);
    const isCreatingNewFolder = useContext(isCreatingNewFolderContext);
    const setIsCreatingNewFolder = useContext(setIsCreatingNewFolderContext);
    const handleChildContextMenu = useContext(handleChildContextMenuContext);
    const handleParentContextMenu = useContext(handleParentContextMenuContext);
    const setOpenedFolder = useContext(setOpenedFolderContext);
    const { isEditingFolder, editingFolder } = useContext(editFolderContext);
    const setEditFolder = useContext(setEditFolderContext);
    const folderValue = useContext(folderValueContext);
    const setFolderValue = useContext(setFolderValueContext);

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (folderValue === '') {
            return;
        }
        if (!editingFolder.child) {
            if (
                [...directoryStructure]
                    .map((directory) => directory.parent)
                    .filter((parent) => parent !== editingFolder.parent)
                    .includes(folderValue)
            ) {
                return;
            }
            const newStates = [...directoryStructure].map((directory) => {
                if (directory.parent === editingFolder.parent) {
                    return { ...directory, parent: folderValue };
                }
                return directory;
            });
            global.ipcRenderer.send('change-parent-folder', editingFolder, folderValue);
            setDirectoryStructure(newStates);
        } else {
            if (
                [...directoryStructure]
                    .find((directory) => directory.parent === editingFolder.parent)
                    .children.filter((child) => child !== editingFolder.child)
                    .includes(folderValue)
            ) {
                return;
            }
            const newStates = [...directoryStructure].map((directory) => {
                if (directory.parent === editingFolder.parent) {
                    return {
                        ...directory,
                        children: directory.children.map((child) => {
                            if (child === editingFolder.child) {
                                return folderValue;
                            }
                            return child;
                        }),
                    };
                }
                return directory;
            });
            global.ipcRenderer.send('change-child-folder', editingFolder, folderValue);
            setDirectoryStructure(newStates);
        }
        setEditFolder({ isEditingFolder: false });
    };
    const ref = useRef<HTMLInputElement>();
    useEffect(() => {
        ref.current?.select();
        ref.current?.focus();
    }, [editingFolder]);
    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    handleIsOpenStates(parent);
                    setEditFolder({ isEditingFolder: false });
                }}
                className="w-full"
                onContextMenu={(e) => {
                    if (isEditingFolder && !editingFolder.child && editingFolder.parent === parent) return;
                    handleParentContextMenu(e, parent);
                }}
            >
                <div
                    className={`flex ${
                        isOpenStates && isOpenStates[parent] ? "before:content-['∨']" : "before:content-['>']"
                    }`}
                    onClick={() => {
                        setIsCreatingNewFolder(false);
                        handleParentSelect(parent);
                        handleIsOpenStates(parent, true);
                    }}
                    style={
                        isSelected[parent]?.parent
                            ? {
                                  backgroundColor: 'rgba(100, 100, 100, 0.3)',
                              }
                            : null
                    }
                >
                    {isEditingFolder && !editingFolder.child && editingFolder.parent === parent ? (
                        <li className="overflow-hidden pl-1 w-full">
                            <div className="border-2 border-solid border-blue-400 rounded-md">
                                <form
                                    onSubmit={handleSubmit}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <input
                                        type="text"
                                        className="w-full text-xl font-bold outline-none"
                                        style={{ background: 'rgba(0, 0, 0, 0)' }}
                                        value={folderValue}
                                        ref={ref}
                                        onChange={(e) => {
                                            setFolderValue(e.target.value);
                                        }}
                                    />
                                </form>
                            </div>
                        </li>
                    ) : (
                        <li className="overflow-hidden pl-1">
                            <span className="text-xl font-bold cursor-pointer select-none whitespace-nowrap">
                                {parent}
                            </span>
                        </li>
                    )}
                </div>
            </div>
            {isOpenStates && isOpenStates[parent] && (
                <div>
                    <ul className="overflow-hidden">
                        {isCreatingNewFolder &&
                            (isSelected[parent].children.includes(true) || isSelected[parent]?.parent) && (
                                <div
                                    className="ml-4 my-1 flex before:content-['>']"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCreatingNewFolder(false);
                                        setEditFolder({ isEditingFolder: false });
                                    }}
                                >
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (
                                                directoryStructure[index].children.includes(newFolderNameInputValue) ||
                                                newFolderNameInputValue === ''
                                            ) {
                                                return;
                                            }
                                            const newStates = [...directoryStructure];
                                            newStates[index].children.push(newFolderNameInputValue);
                                            setDirectoryStructure(newStates);
                                            setNewFolderNameInputValue('');
                                            setIsCreatingNewFolder(false);
                                            global.ipcRenderer.send(
                                                'create-new-folder',
                                                newStates[index]?.parent,
                                                newFolderNameInputValue
                                            );
                                        }}
                                    >
                                        <input
                                            type="text"
                                            value={newFolderNameInputValue}
                                            onChange={(event) => setNewFolderNameInputValue(event.target.value)}
                                            className="border-2 border-solid border-gray-400 ml-1 text-lg"
                                            autoFocus={true}
                                        />
                                    </form>
                                </div>
                            )}
                        {directoryStructure
                            .find((directory) => directory.parent === parent)
                            .children.map((child, index) => {
                                return (
                                    <div
                                        key={child}
                                        className="pl-4 my-1 flex before:content-['>']"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            setIsCreatingNewFolder(false);
                                            getWords(parent, child);
                                            setOpenedFolder({
                                                parent: parent,
                                                folder: child,
                                                url: directoryStructure
                                                    .find((directory) => directory.parent === parent)
                                                    .urls.find((url) => {
                                                        return url.folderName === child;
                                                    }).url,
                                            });
                                            handleChildrenSelect(parent, index);
                                            setEditFolder({ isEditingFolder: false });
                                        }}
                                        onContextMenu={(e) => {
                                            if (isEditingFolder && editingFolder.child === child) return;
                                            handleChildContextMenu(e, parent, child);
                                        }}
                                        style={
                                            isSelected[parent]?.children[index]
                                                ? {
                                                      backgroundColor: 'rgba(100, 100, 100, 0.3)',
                                                  }
                                                : null
                                        }
                                    >
                                        {isEditingFolder &&
                                        editingFolder.child === child &&
                                        editingFolder.parent === parent ? (
                                            <li className="pl-1  cursor-pointer w-full">
                                                <div className="border-2 border-solid border-blue-400 rounded-md">
                                                    <form
                                                        onSubmit={handleSubmit}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <input
                                                            type="text"
                                                            className="w-full text-lg outline-none"
                                                            style={{ background: 'rgba(0, 0, 0, 0)' }}
                                                            value={folderValue}
                                                            ref={ref}
                                                            onChange={(e) => {
                                                                setFolderValue(e.target.value);
                                                            }}
                                                        />
                                                    </form>
                                                </div>
                                            </li>
                                        ) : (
                                            <li className="ml-1  cursor-pointer">
                                                <span className="text-lg inline-block whitespace-nowrap">{child}</span>
                                            </li>
                                        )}
                                    </div>
                                );
                            })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Collapse;
