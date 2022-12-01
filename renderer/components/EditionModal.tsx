import { Word } from './List/List';
import Modal from './Modal';
import RegisterForm from './RegisterForm';

type Props = {
    word: Word;
    isShow: boolean;
    close: () => void;
    editItems: (word: Word, deleted?: boolean) => void;
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
