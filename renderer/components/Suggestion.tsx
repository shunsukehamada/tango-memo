import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { VscTriangleDown } from 'react-icons/vsc';
import { PoSs } from '../pages/register';

type Props = {
    children: ReactNode;
    value: string;
    setValue?: (value: string) => void;
    setInfo: Dispatch<
        SetStateAction<{
            japanese: string;
            poss: (keyof PoSs)[];
        }>
    >;
};

const Suggestion: React.FC<Props> = ({ children, value, setValue, setInfo }) => {
    const [isFocus, setIsFocus] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [options, setOptions] = useState<{ id: number; word: string }[]>([]);

    useEffect(() => {
        setSelectedIndex(0);
        const getSuggestion = async (value: string) => {
            const options = (await global.ipcRenderer.invoke('get-suggestion', value)) as {
                id: number;
                word: string;
            }[];
            return options;
        };
        const suggest = async () => {
            const options = await getSuggestion(value);
            setOptions(value?.length === 0 ? [] : options);
        };
        if (value !== undefined) {
            suggest();
        }
    }, [value]);

    const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
            e.preventDefault();
            setSelectedIndex((index) => {
                return (index + 1) % (options.length === 0 ? 1 : options.length);
            });
            return;
        }
        if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) {
            e.preventDefault();
            setSelectedIndex((index) => {
                return (index + options.length - 1) % (options.length === 0 ? 1 : options.length);
            });
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (options[selectedIndex]) {
                setValue(options[selectedIndex].word);
                setIsFocus(false);
                (async () => {
                    const info = await global.ipcRenderer.invoke('get-word-info', options[selectedIndex].id);
                    setInfo(info);
                })();
            }
            return;
        }
    };
    return (
        <div className="w-full relative">
            <div
                onKeyDown={keyDownHandler}
                onFocus={() => {
                    setIsFocus(true);
                }}
                onBlur={() => {
                    setIsFocus(false);
                }}
                onChange={() => {
                    setIsFocus(true);
                }}
            >
                {children}
            </div>
            <div
                className="absolute top-0 right-0 cursor-pointer"
                onClick={() => {
                    setIsFocus(true);
                }}
            >
                <VscTriangleDown size={'1.5em'} />
            </div>
            <div className="relative">
                {isFocus && (
                    <div className="absolute top-0 left-0 w-full bg-white border-l-2 border-r-2 border-solid border-gray-100 rounded-b-sm shadow-xl">
                        {options.map((option, index) => {
                            return (
                                <div
                                    key={option.id}
                                    className="border-b-gray-100 border-b-2 border-solid hover:bg-gray-200 cursor-pointer text-center text-black"
                                    style={index === selectedIndex ? { backgroundColor: 'rgba(0, 0, 0, 0.1)' } : {}}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        setValue(option.word);
                                        setIsFocus(false);
                                        (async () => {
                                            const info = await global.ipcRenderer.invoke('get-word-info', option.id);
                                            setInfo(info);
                                        })();
                                        setIsFocus(false);
                                    }}
                                >
                                    <span className="font-bold text-lg">{option.word?.slice(0, value?.length)}</span>
                                    <span className="font-bold text-lg opacity-30">
                                        {option.word?.slice(value?.length)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Suggestion;
