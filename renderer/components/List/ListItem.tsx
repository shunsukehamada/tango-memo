import React from 'react';
import { Word } from './List';
import { MdOutlineDragHandle } from 'react-icons/md';
import { Draggable } from 'react-beautiful-dnd';

type Props = {
    word: Word;
    isHidden: boolean;
    index: number;
    handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, word: Word) => void;
};

const ListItem = ({ word, isHidden, index, handleContextMenu }: Props) => {
    return (
        <Draggable draggableId={String(word.id)} index={index}>
            {(provided, snapshot) => {
                return (
                    <div
                        className="flex justify-evenly m-2 items-end"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onContextMenu={(e) => {
                            handleContextMenu(e, word);
                        }}
                    >
                        <div className="w-1/2 relative">
                            <div {...provided.dragHandleProps} className="w-10">
                                <MdOutlineDragHandle
                                    className="absolute left-2 cursor-pointer opacity-30 hover:opacity-60"
                                    size={'1.5em'}
                                />
                            </div>

                            <div
                                className="border-b-4 border-solid border-gray-400  text-center mx-10 cursor-pointer"
                                onClick={() => {
                                    alert(
                                        `${word.english} ${word.japanese}${
                                            word.annotation ? '\n' + word.annotation : ''
                                        }`
                                    );
                                }}
                            >
                                <span className="text-lg font-bold">{word.english}</span>
                            </div>
                        </div>
                        <div
                            className="border-b-4 border-solid border-gray-400 w-1/2 text-center ml-10 mr-2 cursor-pointer group"
                            onClick={() => {
                                alert(
                                    `${word.english} ${word.japanese}${word.annotation ? '\n' + word.annotation : ''}`
                                );
                            }}
                        >
                            <span className={`text-lg font-bold ${isHidden && 'opacity-0'} group-hover:opacity-100`}>
                                {word.japanese}
                            </span>
                        </div>
                    </div>
                );
            }}
        </Draggable>
    );
};

export default ListItem;
