import { ReactNode } from 'react';
import { DirectoryStructure, isSelectedType } from './SideBar';

type Props = {
    // summary: ReactNode;
    // details: ReactNode;
    isOpen: boolean;
    index: number;
    onClick?: (index: number) => void;
    parent: string;
    setIsCreatingNewFolder: (value: React.SetStateAction<boolean>) => void;
    handleParentSelect: (parentName: string) => void;
    directory: DirectoryStructure;
    isSelected: isSelectedType;
    isOpenStates: boolean[];
    isCreatingNewFolder: boolean;
    directoryStructure: DirectoryStructure[];
    newFolderNameInputValue: string;
    setDirectoryStructure: (value: React.SetStateAction<DirectoryStructure[]>) => void;
    setNewFolderNameInputValue: (value: React.SetStateAction<string>) => void;
    getWords: (parentFolder: string, folder: string) => Promise<void>;
    setOpenedFolder: (
        value: React.SetStateAction<{
            parent: string;
            folder: string;
        }>
    ) => void;
    handleChildrenSelect: (parentName: string, childIndex: number) => void;
};

const Collapse: React.FC<Props> = ({
    isOpen,
    index,
    onClick,
    parent,
    setIsCreatingNewFolder,
    handleParentSelect,
    directory,
    isSelected,
    isOpenStates,
    isCreatingNewFolder,
    directoryStructure,
    newFolderNameInputValue,
    setDirectoryStructure,
    setNewFolderNameInputValue,
    getWords,
    setOpenedFolder,
    handleChildrenSelect,
}) => {
    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(index);
                }}
                className="w-full"
            >
                <div
                    className={`flex ${isOpenStates[index] ? "before:content-['∨']" : "before:content-['>']"}`}
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
                        <span className="text-xl font-bold cursor-pointer select-none">{directory.parent}</span>
                    </li>
                </div>
            </div>
            {isOpen && (
                <div>
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
                                                newStates[index].parent,
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
