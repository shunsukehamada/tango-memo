import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import SideBar from './SideBar';

type Props = {
    children: ReactNode;
    title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
    return (
        <div>
            <SideBar
                directoryStructure={[
                    { parent: 'folder1', children: ['folder1-1', 'folder1-2'] },
                    {
                        parent: 'folder2',
                        children: ['folder2-1', 'folder2-2', 'folder2-3'],
                    },
                ]}
            />
        </div>
    );
};

export default Layout;
