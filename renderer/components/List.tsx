import React, { useState } from 'react';
import ListItem from './ListItem';
// import { ,} from 'react-icons/ai';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { HiOutlineViewList } from 'react-icons/hi';
import { MdOutlineGridView, MdReorder } from 'react-icons/md';
import ListItemCard from './ListItemCard';
import { DragDropContext, Draggable, Droppable, DropResult, resetServerContext } from 'react-beautiful-dnd';

type Props = {
    items: Word[];
};

export type Word = {
    id: number;
    english: string;
    japanese: string;
};

type View = 'list' | 'grid';

const List = ({ items }: Props) => {
    const [isHidden, setIsHidden] = useState(false);
    const [view, setView] = useState<View>('list');

    const reorder = (items: Word[], startIndex: number, endIndex: number) => {
        const [removed] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, removed);
    };

    // const onDragEnd = (result: DropResult) => {
    //     const { source, destination } = result;
    //     if (!destination) {
    //         return;
    //     }
    //     reorder(items, source.index, destination.index);
    // };

    return (
        <div className="flex h-full">
            <div className="flex-1">
                {view === 'list' ? (
                    <div className="flex flex-col h-screen">
                        <div className="flex justify-evenly">
                            <div className="w-1/2 m-2 mx-10 flex items-center">
                                <span className="text-lg font-bold">単語</span>
                            </div>
                            <div className="w-1/2 m-2 flex justify-between mx-10 items-center">
                                <span className="text-lg font-bold">意味</span>
                                <div className="relative">
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
                                </div>
                            </div>
                        </div>
                        <div className="overflow-y-scroll scrollbar-hide" style={{ height: '90%' }}>
                            <DragDropContext
                                onDragEnd={(result) => {
                                    console.log(result)
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
                                                            <ListItem word={item} isHidden={isHidden} index={index} />
                                                        </li>
                                                    ))}
                                                </ul>
                                                {provided.placeholder}
                                            </div>
                                        );
                                    }}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 h-screen">
                        <div className="flex justify-end">
                            <label className="cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="absolute hidden"
                                    onChange={(e) => {
                                        setIsHidden(e.currentTarget.checked);
                                    }}
                                />
                                <div>
                                    {isHidden ? <AiOutlineEyeInvisible size={'2em'} /> : <AiOutlineEye size={'2em'} />}
                                </div>
                            </label>
                        </div>
                        <div
                            className="flex flex-wrap overflow-y-scroll -mt-3 scrollbar-hide"
                            style={{ height: '90%' }}
                        >
                            {items.map((item, index) => (
                                <div key={item.id}>
                                    <ListItemCard word={item} isHidden={isHidden} index={index} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-end m-1 mt-5 w-24 h-12">
                <HiOutlineViewList
                    size={view === 'list' ? '3em' : '2em'}
                    className="m-1 cursor-pointer"
                    onClick={() => {
                        setView('list');
                    }}
                />
                <MdOutlineGridView
                    size={view === 'grid' ? '3em' : '2em'}
                    className="m-1 cursor-pointer"
                    onClick={() => {
                        setView('grid');
                    }}
                />
            </div>
        </div>
    );
};

export default List;
