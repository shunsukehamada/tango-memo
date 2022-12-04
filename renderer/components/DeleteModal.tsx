import React from 'react';
import { Word } from './List/List';
import Modal from './Modal';

type Props = {
    word: Word;
    isShow: boolean;
    close: () => void;
    resolve: (value: boolean | PromiseLike<boolean>) => void;
};

const DeleteModal: React.FC<Props> = ({ word, isShow, close, resolve }) => {
    return (
        <Modal isShow={isShow} close={close}>
            <div className="text-black text-center w-1/2 flex flex-col justify-around h-1/2">
                <div>
                    <span className="text-xl font-bold">{word?.english}を削除しますか?</span>
                </div>
                <div className="flex justify-around w-full">
                    <div
                        className="bg-red-400 rounded-md w-20 cursor-pointer text-center flex items-center justify-center"
                        onClick={() => {
                            resolve(false);
                            close();
                        }}
                    >
                        <span className="text-xl font-bold">cancel</span>
                    </div>
                    <div
                        className="bg-green-400 rounded-md p-1 w-20 cursor-pointer"
                        onClick={() => {
                            resolve(true);
                            close();
                        }}
                    >
                        <span className="text-xl font-bold">ok</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteModal;
