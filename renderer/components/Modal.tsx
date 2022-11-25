import { ReactNode } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

type Props = {
    isShow: boolean;
    close: () => void;
    children?: ReactNode;
};
const Modal: React.FC<Props> = ({ isShow, close, children }) => {
    return (
        <>
            {isShow && (
                <div className="h-screen w-screen absolute z-10 top-0 left-0">
                    <div className="bg-gray-500 opacity-80 h-full w-full" onClick={close}></div>
                    <div className="h-3/5 w-3/5 bg-white absolute top-0 right-0 bottom-0 left-0 m-auto rounded-md">
                        <div className="absolute top-5 left-5 cursor-pointer" onClick={close}>
                            <VscChromeClose size={'1.5em'} />
                        </div>
                        <div className="flex justify-center items-center overflow-y-scroll max-w-full max-h-full scrollbar-hide w-full h-full">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
