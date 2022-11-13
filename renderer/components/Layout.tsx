import React, { ReactNode } from 'react';
import SideBar from './SideBar';
import List, { Word } from './List';

type Props = {
    children: ReactNode;
    title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
    const words: Word[] = [
        { id: '0', english: 'hello', japanese: 'おはよう' },
        { id: '1', english: 'banana', japanese: 'バナナ' },
        { id: '2', english: 'apple', japanese: 'りんご' },
        { id: '3', english: 'protein', japanese: 'タンパク質' },
    ];
    return (
        <div className="flex">
            <SideBar
                directoryStructure={[
                    { parent: 'folder1', children: ['folder1-1', 'folder1-2'] },
                    {
                        parent: 'folder2',
                        children: ['folder2-1', 'folder2-2', 'folder2-3'],
                    },
                ]}
            />
            <div className="flex-1">
                <List items={words} />
            </div>
        </div>
    );
};

export default Layout;
