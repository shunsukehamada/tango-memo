import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

type Props = {
    isShow: boolean;
    close: () => void;
    children?: ReactNode;
    h?: CSSProperties['height'];
    w?: CSSProperties['width'];
};
const Modal: React.FC<Props> = ({ isShow, close, children, h = '60%', w = '60%' }) => {
    return (
        <>
            <AnimatePresence>
                {isShow && (
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-screen w-screen absolute z-10 top-0 left-0"
                    >
                        <div className="bg-gray-500 opacity-80 h-full w-full" onClick={close}></div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, scale: [0.9, 1.01, 1.0] }}
                            exit={{ opacity: 0, scale: [1, 0.5] }}
                            transition={{ duration: 0.5 }}
                            className="bg-white absolute top-0 right-0 bottom-0 left-0 m-auto rounded-md"
                            style={{ width: w, height: h }}
                        >
                            <div className="absolute top-5 left-5 cursor-pointer text-black" onClick={close}>
                                <VscChromeClose size={'1.5em'} />
                            </div>
                            <div className="flex justify-center items-center overflow-y-scroll max-w-full max-h-full scrollbar-hide w-full h-full">
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Modal;
