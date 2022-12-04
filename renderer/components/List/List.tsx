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
import { PoSs } from '../../pages/register';

export type Word = {
    id: number;
    english: string;
    japanese: string;
    annotation: string;
    poss: (keyof PoSs)[];
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

    const reorder = (items: Word[], startIndex: number, endIndex: number) => {
        const [removed] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, removed);
    };

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

    const handleItemClick = ({ id, props }: ItemParams<{ word: Word }>) => {
        if (id === 'delete') {
            if (confirm(`${props.word.english}を削除しますか?`)) {
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
            <div className="flex h-full">
                <div className="flex-1">
                    {openedFolder && (
                        <div className="text-lg font-bold mt-1">
                            {openedFolder.parent}&gt;{openedFolder.folder}
                        </div>
                    )}
                    {view === 'list' ? (
                        <div className="flex flex-col h-screen">
                            <div className="flex justify-evenly">
                                <div className="w-1/2 m-2 mx-10 flex items-center">
                                    <span className="text-lg font-bold select-none">単語</span>
                                </div>
                                <div className="w-1/2 m-2 flex justify-between mx-10 items-center">
                                    <span className="text-lg font-bold select-none">意味</span>
                                    {/* <div className="relative">
                                        <label className="cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="absolute hidden"
                                                onChange={(e) => {
                                                    setIsHidden(e.currentTarget.checked);
                                                }}
                                            />
                                            <div>
                                                {isHidden ? (
                                                    <AiOutlineEyeInvisible size={'2em'} />
                                                ) : (
                                                    <AiOutlineEye size={'2em'} />
                                                )}
                                            </div>
                                        </label>
                                    </div> */}
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
                                                            {items.map((item, index) => (
                                                                <li key={item.id}>
                                                                    <ListItem
                                                                        word={item}
                                                                        isHidden={isHidden}
                                                                        index={index}
                                                                        handleContextMenu={handleContextMenu}
                                                                        onClick={(word: Word) => {
                                                                            setDetailWord(word);
                                                                            setIsShowDetail(true);
                                                                        }}
                                                                    />
                                                                </li>
                                                            ))}
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
                            <div className="flex justify-end">
                                {/* <label className="cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="absolute hidden"
                                        onChange={(e) => {
                                            setIsHidden(e.currentTarget.checked);
                                        }}
                                    />
                                    <div>
                                        {isHidden ? (
                                            <AiOutlineEyeInvisible size={'2em'} />
                                        ) : (
                                            <AiOutlineEye size={'2em'} />
                                        )}
                                    </div>
                                </label> */}
                            </div>
                            <div
                                className="flex flex-wrap overflow-y-scroll -mt-3 scrollbar-hide"
                                style={{ height: '90%' }}
                            >
                                {items.map((item, index) => (
                                    <div key={item.id}>
                                        <ListItemCard
                                            word={item}
                                            isHidden={isHidden}
                                            handleContextMenu={handleContextMenu}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* <div className="flex justify-between items-end m-1 mt-5 w-24 h-12">
                    <HiOutlineViewList
                        // size={view === 'list' ? '3em' : '2em'}
                        size={'3em'}
                        className="m-1 cursor-pointer"
                        style={view === 'list' ? { display: 'none' } : {}}
                        onClick={() => {
                            setView('list');
                        }}
                    />
                    <MdOutlineGridView
                        // size={view === 'grid' ? '3em' : '2em'}
                        size={'3em'}
                        style={view === 'grid' ? { display: 'none' } : {}}
                        className="m-1 cursor-pointer"
                        onClick={() => {
                            setView('grid');
                        }}
                    />
                </div> */}
                <Menu id={MENU_ID}>
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
        </>
    );
};

export default List;
