import React, { useContext } from 'react';
import Collapse from './Collapse';
import { directoryContext } from './Providers/DirectoryProvider';

const DirectoryList: React.FC = () => {
    const directoryStructure = useContext(directoryContext);
    return (
        <div>
            {directoryStructure.map((directory, index) => {
                return (
                    <div key={index} className="w-full">
                        <div className="pl-1 pt-3 overflow-hidden flex flex-col items-start">
                            <ul className="w-full">
                                <Collapse index={index} parent={directory.parent?.name} />
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DirectoryList;
