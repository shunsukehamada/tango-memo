import React, { useContext, useEffect, useState } from 'react';
import ListItem from './ListItem';
import ListItemCard from './ListItemCard';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import { VscEdit, VscTrash } from 'react-icons/vsc';
import EditionModal from '../EditionModal';
import { setWordsContext, wordsContext } from './Providers/WordsProvider';
import { openedFolderContext } from '../SideBar/Providers/OpenedFolderProvider';
import DetailModal from '../DetailModal';
import { PoSs, PoSsType } from '../../pages/register';
import DeleteModal, { handleConfirm, ModalResolveType } from '../DeleteModal';
import { filterContext } from '../Header/FilterProvider';
import { valueContext } from '../Header/SearchWordsProvider';
import { directoryContext } from '../SideBar/Providers/DirectoryProvider';

export type Word = {
    id: number;
    english: string;
    japanese: string;
    annotation: string;
    poss: PoSsType[];
    folder_id: string;
};

type Props = {
    view: View;
    setView: React.Dispatch<React.SetStateAction<View>>;
    isHidden: boolean;
};

export type View = 'list' | 'grid';

const List: React.FC<Props> = ({ view, isHidden }) => {
    const [isBrowser, setIsBrowser] = useState(false);
    const items = useContext(wordsContext);
    const setWords = useContext(setWordsContext);
    const openedFolder = useContext(openedFolderContext);
    const [isShow, setIsShow] = useState<boolean>(false);
    const [editWord, setEditWord] = useState<Word | undefined>(undefined);
    const [isShowDetail, setIsShowDetail] = useState<boolean>(false);
    const [detailWord, setDetailWord] = useState<Word | undefined>(undefined);
    const [modalResolve, setModalResolve] = useState<ModalResolveType | undefined>();
    const [deleteWord, setDeleteWord] = useState<Word | undefined>(undefined);
    const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
    const filterStates = useContext(filterContext);
    const searchValue = useContext(valueContext);
    const reorder = (items: Word[], startIndex: number, endIndex: number) => {
        const [removed] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, removed);
    };
    const directoryStructure = useContext(directoryContext);

    useEffect(() => {
        setIsBrowser(process.browser);
    }, []);

    // const onDragEnd = (result: DropResult) => {
    //     const { source, destination } = result;
    //     if (!destination) {
    //         return;
    //     }
    //     reorder(items, source.index, destination.index);
    // };

    const MENU_ID = 'context';
    const { show } = useContextMenu({
        id: MENU_ID,
    });

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, word: Word) => {
        show({
            event,
            props: {
                word: word,
            },
        });
    };

    const handleItemClick = async ({ id, props }: ItemParams<{ word: Word }>) => {
        if (id === 'delete') {
            setDeleteWord(props.word);
            const ok = await handleConfirm(setIsShowDelete, setModalResolve);
            if (ok) {
                global.ipcRenderer.send('delete-word', props.word.id);
                setWords(
                    [...items].filter((word) => {
                        return word.id !== props.word.id;
                    })
                );
            }
            return;
        }
        if (id === 'edit') {
            setEditWord(props.word);
            setIsShow(true);
            return;
        }
    };

    return (
        <>
            <EditionModal
                word={editWord}
                isShow={isShow}
                close={() => {
                    setIsShow(false);
                }}
            />
            <DetailModal
                word={detailWord}
                isShow={isShowDetail}
                close={() => {
                    setIsShowDetail(false);
                }}
            />
            <DeleteModal
                deleteValue={deleteWord?.english}
                isShow={isShowDelete}
                close={() => {
                    modalResolve ? modalResolve(false) : setIsShowDelete(false);
                }}
                resolve={modalResolve}
            />

            <div className="flex h-full">
                <div className="flex-1">
                    {openedFolder && (
                        <div className="text-lg font-bold mt-1 flex justify-between">
                            <div className="ml-5">
                                <span>
                                    {
                                        directoryStructure.find((directory) => {
                                            return directory.parent.id === openedFolder.parentId;
                                        })?.parent.name
                                    }
                                </span>
                                <span className="mx-3">&gt;</span>
                                <span> {openedFolder.name}</span>
                            </div>
                            {openedFolder.url && (
                                <div className="mr-5 truncate" style={{ width: '450px' }}>
                                    <span>???????????????: </span>
                                    <a href={openedFolder.url}>
                                        <span className="italic">{openedFolder.url}</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    {view === 'list' ? (
                        <div className="flex flex-col h-screen mr-5">
                            <div className="flex justify-evenly">
                                <div className="w-1/2 m-2 mx-10 flex items-center">
                                    <span className="text-lg font-bold select-none">??????</span>
                                </div>
                                <div className="w-1/2 m-2 flex justify-between mx-10 items-center">
                                    <span className="text-lg font-bold select-none">??????</span>
                                </div>
                            </div>
                            <div className="overflow-y-scroll scrollbar-hide" style={{ height: '90%' }}>
                                {isBrowser && (
                                    <DragDropContext
                                        onDragEnd={(result) => {
                                            const { source, destination } = result;
                                            if (!destination) {
                                                return;
                                            }
                                            reorder(items, source.index, destination.index);
                                        }}
                                    >
                                        <Droppable droppableId="list">
                                            {(provided, snapshot) => {
                                                return (
                                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                                        <ul>
                                                            {items.map((item, index) => {
                                                                return (
                                                                    <div key={item.id}>
                                                                        {(item.poss.some((pos) => filterStates[pos]) ||
                                                                            Object.keys(PoSs).every(
                                                                                (pos) => !filterStates[pos]
                                                                            )) &&
                                                                            item.english.startsWith(searchValue) && (
                                                                                <li>
                                                                                    <ListItem
                                                                                        word={item}
                                                                                        isHidden={isHidden}
                                                                                        index={index}
                                                                                        handleContextMenu={
                                                                                            handleContextMenu
                                                                                        }
                                                                                        onClick={(word: Word) => {
                                                                                            setDetailWord(word);
                                                                                            setIsShowDetail(true);
                                                                                        }}
                                                                                    />
                                                                                </li>
                                                                            )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </ul>
                                                        {provided.placeholder}
                                                    </div>
                                                );
                                            }}
                                        </Droppable>
                                    </DragDropContext>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 h-screen">
                            <div
                                className="flex flex-wrap overflow-y-scroll -mt-3 scrollbar-hide justify-center items-center"
                                style={{ height: '90%' }}
                            >
                                {items.map((item, index) => {
                                    return (
                                        <div key={item.id}>
                                            {(item.poss.some((pos) => filterStates[pos]) ||
                                                Object.keys(PoSs).every((pos) => !filterStates[pos])) &&
                                                item.english.startsWith(searchValue) && (
                                                    <div>
                                                        <ListItemCard
                                                            word={item}
                                                            isHidden={isHidden}
                                                            handleContextMenu={handleContextMenu}
                                                            onClick={(word: Word) => {
                                                                setDetailWord(word);
                                                                setIsShowDetail(true);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <Menu id={MENU_ID}>
                    <Item id="delete" onClick={handleItemClick}>
                        <VscTrash />
                        <span className="ml-3">??????...</span>
                    </Item>
                    <Item id="edit" onClick={handleItemClick}>
                        <VscEdit />
                        <span className="ml-3">??????...</span>
                    </Item>
                </Menu>
            </div>
        </>
    );
};

export default List;
