import React, { useState } from 'react';
import ListItem from './ListItem';
// import { ,} from 'react-icons/ai';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { HiOutlineViewList } from 'react-icons/hi';
import { MdOutlineGridView } from 'react-icons/md';
import ListItemCard from './ListItemCard';
type Props = {
    items: Word[];
};

export type Word = {
    id: string;
    english: string;
    japanese: string;
};

type View = 'list' | 'grid';

const List = ({ items }: Props) => {
    const [isHidden, setIsHidden] = useState(false);
    const [view, setView] = useState<View>('list');
    return (
        <div className="flex h-full">
            <div className="flex-1">
                {view === 'list' ? (
                    <>
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
                        <ul>
                            {items.map((item) => (
                                <li key={item.id}>
                                    <ListItem word={item} isHidden={isHidden} />
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <div className="mt-2">
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
                        <div className="flex flex-wrap">
                            {items.map((item) => (
                                <div key={item.id}>
                                    <ListItemCard word={item} isHidden={isHidden} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-center m-1">
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
