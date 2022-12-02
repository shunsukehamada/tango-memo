import { useContext } from 'react';
import { directoryContext, setDirectoryContext } from './Providers/DirectoryProvider';
import { getWordsContext } from './Providers/GetWordsProvider';
import { handleContextMenuContext } from './Providers/HandleContextMenuProvider';
import { handleIsOpenStatesContext } from './Providers/HandleIsOpenStatesProvider';
import { handleSelectContext } from './Providers/HandleSelectProvider';
import { isCreatingNewFolderContext, setIsCreatingNewFolderContext } from './Providers/isCreatingNewFolderProvider';
import { isOpenStatesContext } from './Providers/IsOpenStatesProvider';
import { isSelectedContext } from './Providers/IsSelectedProvider';
import {
    newFolderNameInputValueContext,
    setNewFolderNameInputValueContext,
} from './Providers/newFolderNameInputValueProvider';
import { DirectoryStructure } from './SideBar';

type Props = {
    // summary: ReactNode;
    // details: ReactNode;
    // isOpen: boolean;
    index: number;
    parent: string;
    directory: DirectoryStructure;
    setOpenedFolder: (
        value: React.SetStateAction<{
            parent: string;
            folder: string;
        }>
    ) => void;
};

const Collapse: React.FC<Props> = ({
    // isOpen,
    index,
    parent,
    directory,
    setOpenedFolder,
}) => {
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
    
    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    handleIsOpenStates(parent);
                }}
                className="w-full"
                onContextMenu={(e) => {
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
                    <li className="overflow-hidden ml-1">
                        <span className="text-xl font-bold cursor-pointer select-none">{directory?.parent}</span>
                    </li>
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
                                    }}
                                    onContextMenu={(e) => {
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
                                    <li className="ml-1  cursor-pointer">
                                        <span className="text-lg inline-block whitespace-nowrap">{child}</span>
                                    </li>
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
