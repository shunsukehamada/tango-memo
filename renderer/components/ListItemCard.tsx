import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Word } from './List';

type Props = {
    word: Word;
    isHidden: boolean;
    index: number;
};

const ListItemCard = ({ word, isHidden, index }: Props) => {
    return (
        <div
            className="border-2 border-solid border-gray-400 m-2 w-60 rounded-lg max-h-32 group"
            style={{ minWidth: '200px' }}
        >
            <div className="text-center">
                <span className="text-xl font-bold border-b-2 border-solid border-gray-400 px-3">{word.english}</span>
            </div>
            <div className="m-1">
                <span className={`font-bold line-clamp-4 ${isHidden && 'opacity-0'} group-hover:opacity-100 m-1`}>
                    {word.japanese}
                </span>
            </div>
        </div>
    );
};

export default ListItemCard;
