import { ReactNode } from 'react';

type Props = {
    summary: ReactNode;
    details: ReactNode;
    isOpen: boolean;
    index: number;
    onClick?: (index: number) => void;
    parent: string;
};

const Collapse: React.FC<Props> = ({ summary, details, index, isOpen, onClick }) => {
    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(index);
                }}
                className="w-full"
            >
                {summary}
            </div>
            {isOpen && <div>{details}</div>}
        </div>
    );
};

export default Collapse;
