import { useContext, useEffect, useRef } from 'react';
import { directoryContext, setDirectoryContext } from './Providers/DirectoryProvider';
import { folderValueContext, setFolderValueContext } from './Providers/EditFolderValueProvider';
import { getWordsContext } from './Providers/GetWordsProvider';
import { handleContextMenuContext } from './Providers/HandleContextMenuProvider';
import { editFolderContext, setEditFolderContext } from './Providers/HandleEditFolderProvider';
import { handleIsOpenStatesContext } from './Providers/HandleIsOpenStatesProvider';
import { handleSelectContext } from './Providers/HandleSelectProvider';
import { isCreatingNewFolderContext, setIsCreatingNewFolderContext } from './Providers/isCreatingNewFolderProvider';
import { isOpenStatesContext } from './Providers/IsOpenStatesProvider';
import { isSelectedContext } from './Providers/IsSelectedProvider';
import {
    newFolderNameInputValueContext,
    setNewFolderNameInputValueContext,
} from './Providers/newFolderNameInputValueProvider';
import { setOpenedFolderContext } from './Providers/OpenedFolderProvider';
import { DirectoryStructure } from './SideBar';

// TODO: directoryを削除
type Props = {
    index: number;
    parent: string;
    directory: DirectoryStructure;
};

const Collapse: React.FC<Props> = ({ index, parent, directory }) => {
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
    const handleContextMenu = useContext(handleContextMenuContext);
    const setOpenedFolder = useContext(setOpenedFolderContext);
    const { isEditingFolder, editingFolder } = useContext(editFolderContext);
    const setEditFolder = useContext(setEditFolderContext);
    const folderValue = useContext(folderValueContext);
    const setFolderValue = useContext(setFolderValueContext);

    const ref = useRef<HTMLInputElement>();
    useEffect(() => {
        ref.current?.select();
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
                    handleContextMenu(e, parent);
                }}
            >
                <div
                    className={`flex ${
                        isOpenStates && isOpenStates[parent] ? "before:content-['∨']" : "before:content-['>']"
                    }`}
                    onClick={() => {
                        setIsCreatingNewFolder(false);
                        handleParentSelect(directory?.parent);
                        handleIsOpenStates(parent, true);
                    }}
                    style={
                        isSelected[directory?.parent]?.parent
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
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
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
                            <span className="text-xl font-bold cursor-pointer select-none">{directory?.parent}</span>
                        </li>
                    )}
                </div>
            </div>
            {isOpenStates && isOpenStates[parent] && (
                <div>
                    <ul className="overflow-hidden">
                        {isCreatingNewFolder &&
                            (isSelected[directory?.parent].children.includes(true) ||
                                isSelected[directory?.parent]?.parent) && (
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
                                            defaultValue={newFolderNameInputValue}
                                            onChange={(event) => setNewFolderNameInputValue(event.target.value)}
                                            className="border-2 border-solid border-gray-400 ml-1"
                                            autoFocus={true}
                                        />
                                    </form>
                                </div>
                            )}
                        {directory?.children.map((child, index) => {
                            return (
                                <div
                                    key={child}
                                    className="pl-4 my-1 flex before:content-['>']"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCreatingNewFolder(false);
                                        getWords(directory?.parent, child);
                                        setOpenedFolder({
                                            parent: directory?.parent,
                                            folder: child,
                                        });
                                        handleChildrenSelect(directory?.parent, index);
                                        setEditFolder({ isEditingFolder: false });
                                    }}
                                    onContextMenu={(e) => {
                                        if (isEditingFolder && editingFolder.child === child) return;
                                        handleContextMenu(e, parent, child);
                                    }}
                                    style={
                                        isSelected[directory?.parent]?.children[index]
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
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                    }}
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
