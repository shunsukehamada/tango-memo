import { Word } from './List';
import Modal from './Modal';
import RegisterForm from './RegisterForm';

type Props = {
    word: Word;
    isShow: boolean;
    close: () => void;
    editItems: (word: Word) => void;
};
const EditionModal: React.FC<Props> = ({ word, isShow, close, editItems }) => {
    return (
        <>
            <Modal isShow={isShow} close={close}>
                <RegisterForm word={word} close={close} editItems={editItems} />
            </Modal>
        </>
    );
};

export default EditionModal;
