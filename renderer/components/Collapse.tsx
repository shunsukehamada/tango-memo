import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';

type Props = {
    summary: ReactNode;
    details: ReactNode;
    isOpen: boolean;
    index: number;
    onClick?: (index: number) => void;
    isSelected: boolean;
    isSelectedHandler: (index: number) => void;
};

const Collapse: React.FC<Props> = ({ summary, details, index, isOpen, onClick, isSelected, isSelectedHandler }) => {
    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(index);
                    isSelectedHandler(index);
                }}
                className="w-full"
                style={{ backgroundColor: isSelected ? 'rgb(230, 230, 230)' : 'white' }}
            >
                {summary}
            </div>
            {isOpen && <div>{details}</div>}
        </div>
    );
};

export default Collapse;
