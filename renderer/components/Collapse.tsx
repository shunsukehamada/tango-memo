import { ReactNode, useState } from 'react';

type Props = {
    summary: ReactNode;
    details: ReactNode;
};

const Collapse: React.FC<Props> = ({ summary, details }) => {
    const [open, setOpen] = useState(false);
    const toggle = () => {
        setOpen(!open);
    };
    return (
        <div>
            <div onClick={toggle}>{summary}</div>
            {open && <div>{details}</div>}
        </div>
    );
};

export default Collapse;
