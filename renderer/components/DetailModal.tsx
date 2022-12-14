import React from 'react';
import { PoSs, PoSsType } from '../pages/register';
import { Word } from './List/List';
import Modal from './Modal';
type Props = {
    word: Word;
    isShow: boolean;
    close: () => void;
};
const DetailModal: React.FC<Props> = ({ word, isShow, close }) => {
    return (
        <Modal isShow={isShow} close={close} h={'50%'} w={'50%'}>
            <div className="text-black text-center flex flex-col justify-around h-full">
                <div>
                    <span className="text-xl font-bold">{word?.english}</span>
                </div>
                <div>
                    <span className="text-xl font-bold">{word?.japanese}</span>
                </div>
                {word?.annotation && (
                    <div>
                        <span className="text-xl font-bold">{word.annotation}</span>
                    </div>
                )}
                <ul className="flex justify-center">
                    <li>
                        {Object.keys(PoSs).map((pos) => {
                            return word?.poss.includes(pos as PoSsType) ? (
                                <span className="text-mg font-bold mx-2" key={pos}>
                                    {PoSs[pos]}
                                </span>
                            ) : (
                                <span className="text-mg font-bold mx-2 text-gray-300" key={pos}>
                                    {PoSs[pos]}
                                </span>
                            );
                        })}
                    </li>
                </ul>
            </div>
        </Modal>
    );
};

export default DetailModal;
