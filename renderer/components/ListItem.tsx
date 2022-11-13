import React from 'react';
import { Word } from './List';

type Props = {
    word: Word;
    isHidden: boolean;
};

const ListItem = ({ word, isHidden }: Props) => {
    return (
        <div className="flex justify-evenly m-2">
            <div className="border-b-4 border-solid border-gray-400 w-1/2 text-center mx-10">
                <span className="text-lg font-bold">{word.english}</span>
            </div>
            <div className="border-b-4 border-solid border-gray-400 w-1/2 text-center mx-10 cursor-pointer group">
                <span className={`text-lg font-bold ${isHidden && 'opacity-0'} group-hover:opacity-100`}>
                    {word.japanese}
                </span>
            </div>
        </div>
    );
};

export default ListItem;
