import React from 'react';
import { HiOutlineViewList } from 'react-icons/hi';
import { MdDarkMode, MdOutlineDarkMode, MdOutlineGridView } from 'react-icons/md';
import { CgSearchFound } from 'react-icons/cg';
import { View } from './List/List';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useTheme } from 'next-themes';

type Props = {
    view: View;
    setView: React.Dispatch<React.SetStateAction<View>>;
    isHidden: boolean;
    setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<Props> = ({ view, setView, isHidden, setIsHidden }) => {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <div className="flex items-center justify-between p-3 bg-gray-100 text-black">
                <div className="flex">
                    <div
                        onClick={() => {
                            // global.ipcRenderer.send('toggle-dark-mode');
                            if (theme === 'light') {
                                // document.body.classList.add('dark');
                                // setIsDark(false);
                                setTheme('dark');
                            } else {
                                // document.body.classList.remove('dark');
                                setTheme('light');
                                // setIsDark(true);
                            }
                            // isDark ? document.body.classList.remove('dark') : document.body.classList.add('dark');
                            // setIsDark((isDark) => !isDark);
                        }}
                    >
                        {theme === 'dark' ? <MdOutlineDarkMode size={'2em'} /> : <MdDarkMode size={'2em'} />}
                    </div>
                    <div
                        className={`${view === 'list' ? 'bg-gray-300 mx-1' : 'mx-1'}`}
                        onClick={() => {
                            setView('list');
                        }}
                    >
                        <HiOutlineViewList size={'2em'} className="cursor-pointer mx-2" />
                    </div>
                    <div
                        className={`${view === 'grid' ? 'bg-gray-300 mx-1' : 'mx-1'}`}
                        onClick={() => {
                            setView('grid');
                        }}
                    >
                        <MdOutlineGridView size={'2em'} className="cursor-pointer mx-2" />
                    </div>
                </div>
                <div className="flex">
                    <div
                        className="mr-2"
                        onClick={() => {
                            setIsHidden((isHidden) => !isHidden);
                        }}
                    >
                        {isHidden ? <AiOutlineEyeInvisible size={'2em'} /> : <AiOutlineEye size={'2em'} />}
                    </div>
                    <div className="border border-solid border-gray-300 flex items-center">
                        <div className="">
                            <CgSearchFound size={'1.5em'} />
                        </div>
                        <input type="text" className="text-xl bg-white"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;