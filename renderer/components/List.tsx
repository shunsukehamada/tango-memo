import React, { useState } from 'react';
import ListItem from './ListItem';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

type Props = {
    items: Word[];
};

export type Word = {
    id: string;
    english: string;
    japanese: string;
};

const List = ({ items }: Props) => {
    const [isHidden, setIsHidden] = useState(false);
    return (
        <div>
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
                                {isHidden ? <AiOutlineEyeInvisible size={'2em'} /> : <AiOutlineEye size={'2em'} />}
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <ListItem word={item} isHidden={isHidden} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default List;
