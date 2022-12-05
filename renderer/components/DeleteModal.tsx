import React, { CSSProperties } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { Word } from './List/List';
import Modal from './Modal';

type Props = {
    deleteValue: string;
    isShow: boolean;
    close: () => void;
    resolve: (value: boolean | PromiseLike<boolean>) => void;
};

export type ModalResolveType = (value: boolean | PromiseLike<boolean>) => void;

export const handleConfirm = async (
    setIsShow: (value: React.SetStateAction<boolean>) => void,
    setModalResolve: React.Dispatch<React.SetStateAction<ModalResolveType>>
): Promise<boolean> => {
    setIsShow(true);
    const ok = await new Promise<boolean>((resolve) => {
        setModalResolve(() => {
            return resolve;
        });
    });
    setIsShow(false);
    return ok;
};

const DeleteModal: React.FC<Props> = ({ deleteValue, isShow, close, resolve }) => {
    return (
        <Modal isShow={isShow} close={close} h={'40%'} w={'40%'}>
            <div className="text-black text-center w-1/2 flex flex-col justify-around h-1/2">
                <div>
                    <span className="text-xl font-bold">{deleteValue}を削除しますか?</span>
                </div>
                <div className="flex justify-around w-full">
                    <div
                        className="bg-green-400 w-28 rounded-md cursor-pointer text-center flex items-center justify-center whitespace-nowrap"
                        onClick={() => {
                            resolve(false);
                            close();
                        }}
                    >
                        <span className="text-xl font-bold p-1">キャンセル</span>
                    </div>
                    <div
                        className="bg-red-400 w-28 rounded-md cursor-pointer flex items-center justify-center whitespace-nowrap"
                        onClick={() => {
                            resolve(true);
                            close();
                        }}
                    >
                        <span className="text-xl font-bold p-1">削除</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteModal;
