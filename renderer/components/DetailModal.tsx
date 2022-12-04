import React from 'react';
import { PoSs } from '../pages/register';
import { Word } from './List/List';
import Modal from './Modal';
type Props = {
    word: Word;
    isShow: boolean;
    close: () => void;
};
const DetailModal: React.FC<Props> = ({ word, isShow, close }) => {
    const PoSs: PoSs = {
        Noun: '名詞',
        Verb: '動詞',
        Adjective: '形容詞',
        Adverb: '副詞',
        Conjunction: '接続詞',
        Pronoun: '代名詞',
        Preposition: '前置詞',
        Interjection: '感動詞',
    };
    return (
        <Modal isShow={isShow} close={close}>
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
                            return word?.poss.includes(pos as keyof PoSs) ? (
                                <span className="text-mg font-bold mx-2">{PoSs[pos]}</span>
                            ) : (
                                <span className="text-mg font-bold mx-2 text-gray-300">{PoSs[pos]}</span>
                            );
                        })}
                    </li>
                </ul>
            </div>
        </Modal>
    );
};

export default DetailModal;
