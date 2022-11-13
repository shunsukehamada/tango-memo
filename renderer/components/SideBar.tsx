import React, { useRef, useState } from 'react';
import ListItem from './ListItem';
import { User } from '../interfaces';
import Collapse from './Collapse';

type DirectoryStructure = {
    parent: string;
    children: string[];
};

type Props = {
    directoryStructure: DirectoryStructure[];
};

const SideBar: React.FC<Props> = ({ directoryStructure }: Props) => {
    const [positionX, setPositionX] = useState(200);
    return (
        <div
            className={`${positionX >= 100 ? 'border-r-4' : 'border-r-2'} border-solid border-r-gray-300 h-screen flex`}
            style={{ maxWidth: '300px', width: `${positionX}px`, minWidth: '20px' }}
        >
            <div className={`w-full ${positionX >= 100 ? '' : 'opacity-0'}`}>
                {directoryStructure.map((directory) => {
                    return (
                        <div key={directory.parent} className="w-full">
                            <div className="pl-3 pt-3 overflow-hidden flex flex-col items-start">
                                <ul>
                                    <Collapse
                                        summary={
                                            <li className="overflow-hidden">
                                                <span className="text-xl font-bold cursor-pointer select-none">
                                                    {directory.parent}
                                                </span>
                                            </li>
                                        }
                                        details={
                                            <ul className="overflow-hidden">
                                                {directory.children.map((child) => {
                                                    return (
                                                        <li key={child} className="ml-5 my-1 cursor-pointer">
                                                            <span className="text-lg inline-block whitespace-nowrap">
                                                                {child}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        }
                                    />
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div
                className={`h-screen w-2 cursor-col-resize`}
                style={{ minWidth: '8px' }}
                draggable
                onDrag={(e) => {
                    console.log(e.clientX);
                    console.log(positionX);
                    if (e.clientX !== 0) {
                        if (e.clientX <= 100) {
                            setPositionX(20);
                            return;
                        }
                        setPositionX(e.clientX);
                    }
                }}
            ></div>
        </div>
    );
};

export default SideBar;
