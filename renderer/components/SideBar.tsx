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
        <>
            {positionX >= 50 ? (
                <div
                    className="border-r-2 border-solid border-r-black h-screen flex"
                    style={{ maxWidth: '200px', width: `${positionX}px` }}
                >
                    <div className="w-full ">
                        {directoryStructure.map((directory) => {
                            return (
                                <div key={directory.parent} className="w-full">
                                    <div className="pl-3 pt-3 overflow-hidden flex flex-col items-center">
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
                        className="h-screen w-2 cursor-col-resize"
                        draggable
                        onDragCapture={(e) => {
                            if (e.clientX !== 0) {
                                setPositionX(e.clientX);
                            }
                        }}
                    ></div>
                </div>
            ) : (
                <div
                    className="h-screen w-5 cursor-col-resize"
                    onClick={() => {
                        setPositionX(100);
                    }}
                ></div>
            )}
        </>
    );
};

export default SideBar;
